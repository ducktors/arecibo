import { test } from 'node:test'
import assert from 'node:assert'
import Fastify from 'fastify'
import type { InjectOptions } from 'fastify'
import arecibo from '../src/index'

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

  await t.test('returns 404 for non-existent routes', async () => {
    const fastify = Fastify()
    await fastify.register(arecibo, {
      logLevel: 'silent',
    })

    const response = await fastify.inject({
      method: 'GET',
      url: '/non-existent',
    })

    assert.equal(response.statusCode, 404)
  })

  await t.test('accepts custom message', async () => {
    const fastify = Fastify()
    const customMessage = 'Hello, World!'

    await fastify.register(arecibo, {
      logLevel: 'silent',
      message: customMessage,
    })

    const readinessResponse = await fastify.inject({
      method: 'GET',
      url: '/arecibo/readiness',
    })

    const livenessResponse = await fastify.inject({
      method: 'GET',
      url: '/arecibo/liveness',
    })

    assert.equal(readinessResponse.payload, customMessage)
    assert.equal(livenessResponse.payload, customMessage)
  })

  await t.test('rejects non-GET requests', async () => {
    const fastify = Fastify()
    await fastify.register(arecibo, {
      logLevel: 'silent',
    })

    const methods = ['POST', 'PUT', 'DELETE', 'PATCH'] as const
    for (const method of methods) {
      const response = await fastify.inject({
        method,
        url: '/arecibo/readiness',
      } as InjectOptions)
      assert.equal(response.statusCode, 404, `${method} request should be rejected`)
    }
  })

  await t.test('handles concurrent requests', async () => {
    const fastify = Fastify()
    await fastify.register(arecibo, {
      logLevel: 'silent',
    })

    const requests = Array(10)
      .fill(null)
      .map(() =>
        fastify.inject({
          method: 'GET',
          url: '/arecibo/readiness',
        } as InjectOptions),
      )

    const responses = await Promise.all(requests)
    for (const response of responses) {
      assert.equal(response.statusCode, 200)
      assert.equal(response.headers['content-type'], 'text/html')
    }
  })
})
