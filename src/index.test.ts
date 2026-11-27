import { test, type TestContext } from 'node:test'
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
    for (const register of [
      () => Fastify().register(arecibo),
      () => Fastify().register(arecibo, {}),
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

  await t.test('serializes objects from custom callbacks as JSON', async () => {
    const fastify = Fastify()
    const options: AreciboOptions = {
      logLevel: 'silent',
      readinessCallback: (_, reply) => {
        reply.send({ status: 'ok' })
      },
      livenessCallback: async () => ({ status: 'ok' }),
    }
    await fastify.register(arecibo, options)

    for (const url of ['/arecibo/readiness', '/arecibo/liveness']) {
      const response = await fastify.inject({ method: 'GET', url })

      assert.equal(response.statusCode, 200)
      assert.match(
        String(response.headers['content-type']),
        /application\/json/,
      )
      assert.deepEqual(response.json(), { status: 'ok' })
    }
  })

  await t.test('sends strings from async callbacks unchanged', async () => {
    const fastify = Fastify()
    await fastify.register(arecibo, { readinessCallback: async () => 'ok' })

    const response = await fastify.inject('/arecibo/readiness')

    assert.equal(response.payload, 'ok')
  })

  await t.test('describes each probe route correctly', async () => {
    const fastify = Fastify()
    const descriptions: Record<string, unknown> = {}
    fastify.addHook('onRoute', (route) => {
      const schema = route.schema as { description: string }
      descriptions[route.url] = schema.description
    })
    await fastify.register(arecibo)

    assert.match(
      String(descriptions['/arecibo/readiness']),
      /uses readiness probes/,
    )
    assert.match(
      String(descriptions['/arecibo/liveness']),
      /uses liveness probes/,
    )
  })
})

// The timeout timer does not keep the process alive. Without a server, this
// interval keeps the event loop active until the test ends.
function keepAlive(t: TestContext) {
  const interval = setInterval(() => {}, 1000)
  t.after(() => clearInterval(interval))
}

async function probe(options: AreciboOptions) {
  const logs: string[] = []
  const fastify = Fastify({
    logger: {
      level: 'error',
      stream: { write: (line: string) => logs.push(line) },
    },
  })
  await fastify.register(arecibo, { logLevel: 'error', ...options })
  const response = await fastify.inject('/arecibo/readiness')
  return { fastify, response, logs: logs.map((line) => JSON.parse(line)) }
}

test('readinessChecks', async (t) => {
  keepAlive(t)

  await t.test('replies as usual when all checks pass', async () => {
    let calls = 0
    const { fastify, response } = await probe({
      message: 'ready',
      readinessChecks: {
        sync: () => ++calls,
        async: async () => undefined,
        falsy: () => 0,
        slow: () => new Promise((resolve) => setTimeout(resolve, 100)),
      },
    })

    assert.equal(response.statusCode, 200)
    assert.equal(response.headers['content-type'], 'text/html')
    assert.equal(response.payload, 'ready')

    await fastify.inject('/arecibo/readiness')
    assert.equal(calls, 2)
  })

  const failures: Record<string, [() => unknown, RegExp]> = {
    throws: [
      () => {
        throw new Error('secret-detail')
      },
      /secret-detail/,
    ],
    rejects: [
      () => Promise.reject(new Error('secret-detail')),
      /secret-detail/,
    ],
    'returns false': [() => false, /false/],
    'resolves to false': [async () => false, /false/],
    'does not settle': [() => new Promise(() => {}), /50 ms/],
  }

  for (const [title, [check, error]] of Object.entries(failures)) {
    await t.test(`replies 503 when a check ${title}`, async () => {
      const { response, logs } = await probe({
        checkTimeout: 50,
        readinessChecks: { 'secret-name': check, passes: () => true },
      })

      assert.equal(response.statusCode, 503)
      assert.equal(response.payload, 'Service Unavailable')
      assert.equal(logs.length, 1)
      assert.equal(logs[0].check, 'secret-name')
      assert.match(logs[0].err.message, error)
    })
  }

  await t.test('logs each failed check', async () => {
    const { logs } = await probe({
      readinessChecks: { first: () => false, second: () => false },
    })

    assert.deepEqual(
      logs.map((log) => log.check),
      ['first', 'second'],
    )
  })

  await t.test('runs the checks in parallel', async () => {
    let start: () => void = () => {}
    const started = new Promise<void>((resolve) => {
      start = resolve
    })
    let finished = false
    const { response } = await probe({
      readinessChecks: {
        first: async () => {
          await started
          finished = true
        },
        second: () => start(),
      },
    })

    assert.equal(response.statusCode, 200)
    assert.ok(finished)
  })

  await t.test('uses a timeout of 500 ms by default', async () => {
    const { response, logs } = await probe({
      readinessChecks: { hangs: () => new Promise(() => {}) },
    })

    assert.equal(response.statusCode, 503)
    assert.match(logs[0].err.message, /500 ms/)
  })

  await t.test('clears the timer and does not hold the process', async (t) => {
    const set = t.mock.method(global, 'setTimeout')
    const clear = t.mock.method(global, 'clearTimeout')
    await probe({ checkTimeout: 12345, readinessChecks: { ok: () => true } })

    const call = set.mock.calls.find((c) => c.arguments[1] === 12345)
    assert.ok(call)
    const timer = call.result as unknown as NodeJS.Timeout
    assert.equal(timer.hasRef(), false)
    assert.ok(clear.mock.calls.some((c) => c.arguments[0] === timer))
  })

  await t.test('ignores a rejection after the timeout', async (t) => {
    const unhandled: unknown[] = []
    const listener = (reason: unknown) => unhandled.push(reason)
    process.on('unhandledRejection', listener)
    t.after(() => process.off('unhandledRejection', listener))

    let reject: (error: Error) => void = () => {}
    const { response } = await probe({
      checkTimeout: 10,
      readinessChecks: {
        late: () =>
          new Promise((_, r) => {
            reject = r
          }),
      },
    })
    reject(new Error('late'))
    await new Promise((resolve) => setImmediate(resolve))

    assert.equal(response.statusCode, 503)
    assert.deepEqual(unhandled, [])
  })

  await t.test('does not change the liveness route', async () => {
    const { fastify } = await probe({ readinessChecks: { no: () => false } })
    const response = await fastify.inject('/arecibo/liveness')

    assert.equal(response.statusCode, 200)
    assert.equal(response.payload, areciboMessage)
  })

  await t.test('rejects registration with readinessCallback', async () => {
    await assert.rejects(async () => {
      await Fastify().register(arecibo, {
        readinessChecks: {},
        readinessCallback: async () => 'ok',
      })
    }, /Use readinessChecks or readinessCallback, not both/)
  })

  await t.test('rejects a check that is not a function', async () => {
    await assert.rejects(async () => {
      await Fastify().register(arecibo, {
        readinessChecks: { ok: () => true, database: true as never },
      })
    }, /The readiness check "database" is not a function/)
  })

  await t.test('adds the 503 schema only with readinessChecks', async () => {
    for (const [options, expected] of [
      [{}, false],
      [{ readinessCallback: async () => 'ok' }, false],
      [{ readinessChecks: {} }, true],
    ] as [AreciboOptions, boolean][]) {
      const fastify = Fastify()
      const has503: Record<string, boolean> = {}
      fastify.addHook('onRoute', (route) => {
        const { response } = route.schema as { response: object }
        has503[route.url] = '503' in response
      })
      await fastify.register(arecibo, options)

      assert.equal(has503['/arecibo/readiness'], expected)
      assert.equal(has503['/arecibo/liveness'], false)
    }
  })
})
