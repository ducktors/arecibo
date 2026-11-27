import { test } from 'node:test'
import assert from 'node:assert'
import Fastify from 'fastify'
import arecibo, { type AreciboOptions } from './index'
import { areciboMessage } from './arecibo-message'

test('arecibo plugin', async (t) => {
  await t.test('registers routes correctly', async () => {
    const fastify = Fastify()
    await fastify.register(arecibo, {
      logLevel: 'silent',
    })

    const readinessResponse = await fastify.inject({
      method: 'GET',
      url: '/arecibo/readiness',
    })

    const livenessResponse = await fastify.inject({
      method: 'GET',
      url: '/arecibo/liveness',
    })

    assert.equal(readinessResponse.statusCode, 200)
    assert.equal(livenessResponse.statusCode, 200)
    assert.equal(readinessResponse.headers['content-type'], 'text/html')
    assert.equal(livenessResponse.headers['content-type'], 'text/html')
  })

  await t.test('accepts custom urls', async () => {
    const fastify = Fastify()
    await fastify.register(arecibo, {
      logLevel: 'silent',
      readinessURL: '/custom/readiness',
      livenessURL: '/custom/liveness',
    })

    const readinessResponse = await fastify.inject({
      method: 'GET',
      url: '/custom/readiness',
    })

    const livenessResponse = await fastify.inject({
      method: 'GET',
      url: '/custom/liveness',
    })

    assert.equal(readinessResponse.statusCode, 200)
    assert.equal(livenessResponse.statusCode, 200)
  })

  await t.test('accepts custom callbacks', async () => {
    const fastify = Fastify()
    const customMessage = 'Custom response'

    await fastify.register(arecibo, {
      logLevel: 'silent',
      readinessCallback: (_, reply) => reply.send(customMessage),
      livenessCallback: (_, reply) => reply.send(customMessage),
    })

    const readinessResponse = await fastify.inject({
      method: 'GET',
      url: '/arecibo/readiness',
    })

    const livenessResponse = await fastify.inject({
      method: 'GET',
      url: '/arecibo/liveness',
    })

    assert.equal(readinessResponse.statusCode, 200)
    assert.equal(livenessResponse.statusCode, 200)
    assert.equal(readinessResponse.payload, customMessage)
    assert.equal(livenessResponse.payload, customMessage)
  })

  await t.test('registers with no options', async () => {
    const options: AreciboOptions = {}
    for (const register of [
      () => Fastify().register(arecibo),
      () => Fastify().register(arecibo, options),
    ]) {
      const fastify = register()

      for (const url of ['/arecibo/readiness', '/arecibo/liveness']) {
        const response = await fastify.inject({ method: 'GET', url })

        assert.equal(response.statusCode, 200)
        assert.equal(response.headers['content-type'], 'text/html')
        assert.equal(response.payload, areciboMessage)
      }
    }
  })

  await t.test('sends strings from async callbacks unchanged', async () => {
    const fastify = Fastify()
    await fastify.register(arecibo, { readinessCallback: async () => 'ok' })

    const response = await fastify.inject('/arecibo/readiness')

    assert.equal(response.payload, 'ok')
  })
})
