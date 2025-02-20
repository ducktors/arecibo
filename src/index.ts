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

interface Opts extends FastifyPluginOptions {
  message?: string
  readinessURL?: string
  livenessURL?: string
  readinessCallback?: RouteHandler
  livenessCallback?: RouteHandler
  logLevel: LogLevel
}

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
