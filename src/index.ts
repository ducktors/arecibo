import type {
  FastifyPluginCallback,
  FastifyPluginOptions,
  LogLevel,
  RouteHandler,
} from 'fastify'
import fp from 'fastify-plugin'

import { readinessSchema, livenessSchema } from './schema'
import { areciboMessage } from './arecibo-message'

const READINESS_URL = '/arecibo/readiness'
const LIVENESS_URL = '/arecibo/liveness'

const defaultMessage = areciboMessage

const defaultResponse =
  (message: string): RouteHandler =>
  (_, reply) => {
    reply.type('text/html').send(message)
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
      message = defaultMessage,
      readinessURL = READINESS_URL,
      livenessURL = LIVENESS_URL,
      logLevel = 'info',
    } = opts

    const readinessCallback = opts.readinessCallback || defaultResponse(message)
    const livenessCallback = opts.livenessCallback || defaultResponse(message)

    fastify.get(
      readinessURL,
      { schema: readinessSchema, logLevel },
      readinessCallback,
    )
    fastify.get(
      livenessURL,
      { schema: livenessSchema, logLevel },
      livenessCallback,
    )

    next()
  },
  {
    name: 'arecibo',
    fastify: '^4.0.0 || ^5.0.0',
  },
)

export = arecibo
