import { test } from 'node:test'
import assert from 'node:assert'
import Fastify from 'fastify'
import arecibo from './index'

test('arecibo plugin', async t => {
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
})
