import type {
  FastifyPluginCallback,
  FastifyPluginOptions,
  FastifyReply,
  LogLevel,
  RouteHandler,
} from 'fastify'
import fp from 'fastify-plugin'

import {
  readinessSchema,
  readinessChecksSchema,
  livenessSchema,
} from './schema'
import { areciboMessage } from './arecibo-message'

// The largest delay that `setTimeout` accepts.
const MAX_DELAY = 2147483647

// `setTimeout` changes `null`, `NaN`, and out-of-range delays to 1 ms.
// A numeric string or a fraction is a correct delay. `Number` changes other
// values such as `null`, `true`, or `''` to a number, thus check the type.
const isDelay = (value: unknown, min: number) =>
  (typeof value === 'number' ||
    (typeof value === 'string' && value.trim() !== '')) &&
  Number(value) >= min &&
  Number(value) <= MAX_DELAY

const ROUTES = {
  READINESS: '/arecibo/readiness',
  LIVENESS: '/arecibo/liveness',
} as const

function createResponseHandler(message: string): RouteHandler {
  return (_, reply) => reply.type('text/html').send(message)
}

function createChecksHandler(
  checks: NonNullable<arecibo.AreciboOptions['readinessChecks']>,
  timeout: number,
  message: string,
): RouteHandler {
  return async (request, reply) => {
    const results = await Promise.all(
      Object.entries(checks).map(async ([name, check]) => {
        let timer: NodeJS.Timeout | undefined
        try {
          // `race` also handles a rejection that occurs after the timeout.
          const result = await Promise.race([
            // `then` changes a synchronous error into a rejection.
            Promise.resolve().then(check),
            new Promise((_, reject) => {
              timer = setTimeout(
                reject,
                timeout,
                new Error(`The check did not settle in ${timeout} ms`),
              ).unref()
            }),
          ])
          if (result === false) {
            throw new Error('The check returned false')
          }
          return true
        } catch (error) {
          request.log.error(
            { err: error, check: name },
            'A readiness check failed',
          )
          return false
        } finally {
          clearTimeout(timer)
        }
      }),
    )

    reply.type('text/html')
    return results.includes(false)
      ? reply.code(503).send('Service Unavailable')
      : reply.send(message)
  }
}

// A namespace that contains only types merges with the `arecibo` constant.
// Thus consumers can import the type, and `export =` stays the same.
declare namespace arecibo {
  export interface AreciboOptions extends FastifyPluginOptions {
    message?: string
    readinessURL?: string
    livenessURL?: string
    readinessCallback?: RouteHandler
    // Do not use together with `readinessCallback`.
    readinessChecks?: Record<string, () => unknown | Promise<unknown>>
    // The time limit of each readiness check, in milliseconds.
    checkTimeout?: number
    // Start `shutdown` with this delay, in milliseconds, on `SIGTERM`.
    shutdownDelay?: number
    livenessCallback?: RouteHandler
    logLevel?: LogLevel
  }

  export interface AreciboDecorator {
    // `false` makes the readiness route reply with status 503.
    setReady(ready: boolean): void
    isReady(): boolean
    // Set not ready, wait `delay` milliseconds, then close Fastify.
    shutdown(delay?: number): Promise<void>
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    arecibo: arecibo.AreciboDecorator
  }
}

type Opts = arecibo.AreciboOptions

const arecibo: FastifyPluginCallback<Opts> = fp<Opts>(
  (fastify, opts, next) => {
    const {
      message = areciboMessage,
      readinessURL = ROUTES.READINESS,
      livenessURL = ROUTES.LIVENESS,
      readinessChecks,
      checkTimeout = 500,
      readinessCallback = readinessChecks
        ? createChecksHandler(readinessChecks, checkTimeout, message)
        : createResponseHandler(message),
      livenessCallback = createResponseHandler(message),
      logLevel = 'info',
      shutdownDelay,
    } = opts

    if (readinessChecks && opts.readinessCallback) {
      return next(
        new Error('Use readinessChecks or readinessCallback, not both'),
      )
    }

    // Other values can register no checks, or checks that you did not intend.
    if (
      readinessChecks !== undefined &&
      !(
        readinessChecks !== null &&
        [Object.prototype, null].includes(
          Object.getPrototypeOf(readinessChecks),
        ) &&
        Object.keys(readinessChecks).length > 0
      )
    ) {
      return next(
        new Error(
          'readinessChecks must be a plain object with at least one check',
        ),
      )
    }

    // An invalid delay would make all slow checks fail.
    if (readinessChecks && !isDelay(checkTimeout, 1)) {
      return next(
        new Error('checkTimeout must be a number from 1 to 2147483647'),
      )
    }

    // A value that is not a function would count as a check that passed.
    const invalid = Object.entries(readinessChecks ?? {}).find(
      ([, check]) => typeof check !== 'function',
    )
    if (invalid) {
      return next(
        new Error(`The readiness check "${invalid[0]}" is not a function`),
      )
    }

    if (shutdownDelay !== undefined && !isDelay(shutdownDelay, 0)) {
      return next(
        new Error('shutdownDelay must be a number from 0 to 2147483647'),
      )
    }

    // All registrations of the plugin share one state.
    if (!fastify.hasDecorator('arecibo')) {
      let ready = true
      let closed = false
      let shutdown: Promise<void> | undefined
      let wait: { timer: NodeJS.Timeout; resolve: () => void } | undefined

      // If Fastify closes during the delay, the delay stops.
      fastify.addHook('onClose', (_, done) => {
        closed = true
        if (wait) {
          clearTimeout(wait.timer)
          wait.resolve()
        }
        done()
      })

      fastify.decorate('arecibo', {
        setReady: (value: boolean) => {
          ready = value === true
        },
        isReady: () => ready,
        shutdown: (delay = 5000) => {
          if (!isDelay(delay, 0)) {
            return Promise.reject(
              new Error('The delay must be a number from 0 to 2147483647'),
            )
          }
          // A second call gets the same promise.
          shutdown ??= (async () => {
            ready = false
            if (closed) {
              return
            }
            await new Promise<void>((resolve) => {
              wait = { timer: setTimeout(resolve, Number(delay)), resolve }
            })
            wait = undefined
            if (!closed) {
              await fastify.close()
            }
          })()
          return shutdown
        },
      })
    }
    const state = fastify.arecibo

    if (shutdownDelay !== undefined) {
      const onSignal = () => {
        fastify.log.info('SIGTERM received, the graceful shutdown starts')
        state.shutdown(Number(shutdownDelay)).catch((err) => {
          fastify.log.error({ err }, 'The graceful shutdown failed')
          process.exitCode = 1
        })
      }
      // `on`, not `once`: with `once`, a second signal during the delay would
      // stop the process at once. A second call of `shutdown` does nothing.
      process.on('SIGTERM', onSignal)
      fastify.addHook('onClose', (_, done) => {
        process.removeListener('SIGTERM', onSignal)
        done()
      })
    }

    fastify
      .get(
        readinessURL,
        {
          schema: readinessChecks ? readinessChecksSchema : readinessSchema,
          logLevel,
          // The hook replies before the handler, thus the checks do not run.
          onRequest: async (_, reply: FastifyReply) => {
            if (!state.isReady()) {
              return reply
                .code(503)
                .type('text/html')
                .send('Service Unavailable')
            }
          },
        },
        readinessCallback,
      )
      .get(livenessURL, { schema: livenessSchema, logLevel }, livenessCallback)

    next()
  },
  {
    name: 'arecibo',
    fastify: '^4.0.0 || ^5.0.0 || ^6.0.0',
  },
)

export = arecibo
