import type {
  FastifyPluginCallback,
  FastifyPluginOptions,
  LogLevel,
  RouteHandler,
} from 'fastify'
import fp from 'fastify-plugin'

import { readinessSchema, livenessSchema } from './schema'
import { areciboMessage } from './arecibo-message'

const ROUTES = {
  READINESS: '/arecibo/readiness',
  LIVENESS: '/arecibo/liveness',
} as const

function createResponseHandler(message: string): RouteHandler {
  return (_, reply) => reply.type('text/html').send(message)
}

// A namespace that contains only types merges with the `arecibo` constant.
// Thus consumers can import the type, and `export =` stays the same.
declare namespace arecibo {
  export interface AreciboOptions extends FastifyPluginOptions {
    message?: string
    readinessURL?: string
    livenessURL?: string
    readinessCallback?: RouteHandler
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
      readinessCallback = createResponseHandler(message),
      livenessCallback = createResponseHandler(message),
      logLevel = 'info',
    } = opts

    fastify
      .get(
        readinessURL,
        { schema: readinessSchema, logLevel },
        readinessCallback,
      )
      .get(livenessURL, { schema: livenessSchema, logLevel }, livenessCallback)

    next()
  },
  {
    name: 'arecibo',
    fastify: '^4.0.0 || ^5.0.0',
  },
)

export = arecibo
