import type {
  FastifyPluginCallback,
  FastifyPluginOptions,
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
    livenessCallback?: RouteHandler
    logLevel?: LogLevel
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

    // `setTimeout` changes an invalid delay to 1 ms. Then all slow checks fail.
    if (
      readinessChecks &&
      !(
        Number.isInteger(checkTimeout) &&
        checkTimeout >= 1 &&
        checkTimeout <= 2147483647
      )
    ) {
      return next(
        new Error('checkTimeout must be an integer from 1 to 2147483647'),
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

    fastify
      .get(
        readinessURL,
        {
          schema: readinessChecks ? readinessChecksSchema : readinessSchema,
          logLevel,
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
