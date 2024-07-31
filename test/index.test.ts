import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Fastify from 'fastify'
import arecibo from '../src/index'

describe('Arecibo Plugin', () => {
  let fastify: ReturnType<typeof Fastify>

  beforeEach(() => {
    fastify = Fastify()
  })

  afterEach(async () => {
    await fastify.close()
  })

  describe('Basic Configuration', () => {
    beforeEach(async () => {
      await fastify.register(arecibo, { probeType: 'basic' })
    })

    it('should respond to /healthz', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/healthz'
      })

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toBe('text/html')
      expect(response.payload).toContain('00000010101010000000000') // First line of default message
    })

    it('should use custom healthz URL', async () => {
      await fastify.close()
      fastify = Fastify()
      await fastify.register(arecibo, { probeType: 'basic', healthzURL: '/custom-healthz' })

      const response = await fastify.inject({
        method: 'GET',
        url: '/custom-healthz'
      })

      expect(response.statusCode).toBe(200)
    })

    it('should use custom message', async () => {
      await fastify.close()
      fastify = Fastify()
      const customMessage = 'Custom health check message'
      await fastify.register(arecibo, { probeType: 'basic', message: customMessage })

      const response = await fastify.inject({
        method: 'GET',
        url: '/healthz'
      })

      expect(response.payload).toBe(customMessage)
    })
  })

  describe('Specific Configuration', () => {
    beforeEach(async () => {
      await fastify.register(arecibo, { probeType: 'specific' })
    })

    it('should respond to /arecibo/readiness', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/arecibo/readiness'
      })

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toBe('text/html')
      expect(response.payload).toContain('00000010101010000000000') // First line of default message
    })

    it('should respond to /arecibo/liveness', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/arecibo/liveness'
      })

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toBe('text/html')
      expect(response.payload).toContain('00000010101010000000000') // First line of default message
    })

    it('should respond to /arecibo/startup', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/arecibo/startup'
      })

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toBe('text/html')
      expect(response.payload).toContain('00000010101010000000000') // First line of default message
    })

    it('should use custom URLs', async () => {
      await fastify.close()
      fastify = Fastify()
      await fastify.register(arecibo, {
        probeType: 'specific',
        readinessURL: '/custom-readiness',
        livenessURL: '/custom-liveness',
        startupURL: '/custom-startup'
      })

      const readinessResponse = await fastify.inject({
        method: 'GET',
        url: '/custom-readiness'
      })
      expect(readinessResponse.statusCode).toBe(200)

      const livenessResponse = await fastify.inject({
        method: 'GET',
        url: '/custom-liveness'
      })
      expect(livenessResponse.statusCode).toBe(200)

      const startupResponse = await fastify.inject({
        method: 'GET',
        url: '/custom-startup'
      })
      expect(startupResponse.statusCode).toBe(200)
    })
  })
})
