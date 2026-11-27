<div align="center">

---

![ARECIBO](https://user-images.githubusercontent.com/1620916/216600132-30d60aa1-59f7-4f47-8e23-8c14c02baf99.png)

---

![arecibo_telescope_sending_a_signal_into_the_space_during__b5c6335a-ae52-4f9d-9350-fd7953fb5013](https://user-images.githubusercontent.com/1620916/216599766-d30dacd3-1beb-4e11-a4f4-22e5b52fa57c.png)

</div>

<div align="center">

[![CI](https://github.com/ducktors/arecibo/actions/workflows/ci.yaml/badge.svg)](https://github.com/ducktors/arecibo/actions/workflows/ci.yaml) ![pnpm@12.23.0](https://img.shields.io/badge/pnpm-12.23.0-yellow)
[![NPM version](https://img.shields.io/npm/v/arecibo.svg?style=flat)](https://www.npmjs.com/package/arecibo)
[![NPM downloads](https://img.shields.io/npm/dm/arecibo.svg?style=flat)](https://www.npmjs.com/package/arecibo)
[![code style: Biome](https://img.shields.io/badge/code_style-biome-60a5fa.svg)](https://biomejs.dev)
[![Known Vulnerabilities](https://snyk.io/test/github/ducktors/arecibo/badge.svg?targetFile=package.json)](https://snyk.io/test/github/ducktors/arecibo?targetFile=package.json)

</div>

## Quick start

This section also gives AI coding agents the data that they need to add Arecibo to a Fastify application.

**Requirements:** Node.js 22 or later, and Fastify 4 or 5. Only the latest major version of Arecibo is maintained. For Fastify 2 or 3, refer to the [older releases](https://github.com/ducktors/arecibo/releases).

```bash
npm install arecibo # or: pnpm add arecibo, yarn add arecibo
```

```javascript
const fastify = require('fastify')({ logger: true })
const arecibo = require('arecibo') // ES modules: import arecibo from 'arecibo'

fastify.register(arecibo, { logLevel: 'warn' })

// Listen on 0.0.0.0, because the kubelet connects to the Pod IP address.
fastify.listen({ port: 3000, host: '0.0.0.0' })
```

The plugin adds `GET /arecibo/readiness` and `GET /arecibo/liveness`. By default, each route replies with status 200 and the Arecibo message. For the probe settings, refer to [Kubernetes deployment manifest](#kubernetes-deployment-manifest).

## Options

All options are optional.

| Option | Type | Default | Description |
| -- | -- | -- | -- |
| `message` | `string` | the Arecibo message | The response body (`text/html`) of a route that has no callback. |
| `readinessURL` | `string` | `'/arecibo/readiness'` | The path of the readiness route. |
| `livenessURL` | `string` | `'/arecibo/liveness'` | The path of the liveness route. |
| `readinessCallback` | `RouteHandler` | replies 200 with `message` | The handler of the readiness route. |
| `livenessCallback` | `RouteHandler` | replies 200 with `message` | The handler of the liveness route. |
| `readinessChecks` | `Record<string, () => unknown>` | none | The checks of the readiness route. See [Readiness checks](#readiness-checks). |
| `checkTimeout` | `number` | `500` | The time limit of each check, in milliseconds. Use a number from 1 to 2147483647. |
| `logLevel` | `'fatal'`, `'error'`, `'warn'`, `'info'`, `'debug'`, `'trace'`, or `'silent'` | `'info'` | The log level of the two routes. |

## Custom callbacks

A callback is a Fastify route handler. It can send a string or an object. Fastify serializes an object as JSON. Reply with status 503 to tell Kubernetes that the application is not ready.

```javascript
const fastify = require('fastify')()
const arecibo = require('arecibo')

let ready = false // Set this to true when your application can accept traffic.

fastify.register(arecibo, {
  readinessCallback: (request, reply) => {
    if (!ready) {
      return reply.code(503).send({ status: 'not ready' })
    }
    return reply.send({ status: 'ready' })
  },
})

fastify.listen({ port: 3000, host: '0.0.0.0' })
```

**Do not check external dependencies in `livenessCallback`.** For example, do not check a database, a cache, or a different service. If a dependency fails, Kubernetes restarts your containers, and a restart does not repair the dependency. Put these checks in `readinessCallback`.

## Readiness checks

Use `readinessChecks` to let the plugin check your dependencies on each readiness request.

```javascript
fastify.register(arecibo, {
  readinessChecks: {
    database: () => db.query('SELECT 1'),
    queue: () => queue.isConnected(), // false means that the check failed
  },
  checkTimeout: 500, // optional, in milliseconds, defaults to 500
})
```

- The checks run in parallel.
- A check fails if it throws, rejects, returns or resolves to `false`, or does not settle in `checkTimeout` milliseconds.
- The timeout does not stop the work of a check. A check that blocks the event loop also blocks the timeout.
- If all checks pass, the route replies with status 200 and `message`.
- If a check fails, the route replies with status 503 and the body `Service Unavailable`. The plugin logs the name and the error with `request.log.error`. The `logLevel` option `'silent'` hides this log.
- Do not use `readinessChecks` together with `readinessCallback`. The registration fails.
- `readinessChecks` must be a plain object with at least one check, and each check must be a function. If not, the registration fails.
- Set `timeoutSeconds` of the Kubernetes readiness probe to a value larger than `checkTimeout`.
- The checks do not change the liveness route.

## Behaviour notes

- The plugin ignores the `prefix` option of `register`, because it uses [fastify-plugin](https://github.com/fastify/fastify-plugin). To change the paths, use `readinessURL` and `livenessURL`.
- Global hooks also apply to the probe routes. For example, an authentication `onRequest` hook can reject the probes. Make such a hook skip the probe URLs.
- The plugin ignores `message` for a route that has a callback.
- The routes also answer `HEAD` requests.
- With the default `logLevel` (`'info'`), an enabled Fastify logger logs each probe request. Use `'warn'` to stop these request logs.
- If a callback throws an error, the default Fastify error handler replies with status 500. The response body contains the error message. Do not put secrets in error messages.

## TypeScript

```typescript
import arecibo from 'arecibo'
```

This import needs `esModuleInterop`, `allowSyntheticDefaultImports`, or `"module": "nodenext"`. For CommonJS output without these settings, use `import arecibo = require('arecibo')`. Do not use `import * as arecibo from 'arecibo'`. With `esModuleInterop` or `nodenext`, `register` does not accept that value.

## Kubernetes deployment manifest

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      terminationGracePeriodSeconds: 30
      containers:
        - name: my-app
          image: my-app:1.0.0
          ports:
            - name: http
              containerPort: 3000
          startupProbe:
            httpGet:
              path: /arecibo/liveness
              port: http
            periodSeconds: 5
            failureThreshold: 30
          livenessProbe:
            httpGet:
              path: /arecibo/liveness
              port: http
            periodSeconds: 15
          readinessProbe:
            httpGet:
              path: /arecibo/readiness
              port: http
            periodSeconds: 5
          lifecycle:
            preStop:
              sleep:
                seconds: 5
```

- The `startupProbe` uses the liveness URL. In this example, the application has 150 seconds (30 x 5) to start. Kubernetes does not run the other probes until the startup probe succeeds.
- The `preStop` hook delays the `SIGTERM` signal. This gives the cluster time to stop new traffic to the Pod. Call `fastify.close()` when your process receives `SIGTERM`.
- `terminationGracePeriodSeconds` must be longer than the `preStop` delay plus the shutdown time of your application.
- Kubernetes enables the `sleep` action by default from version 1.30. The action is stable from version 1.34. For an older cluster, use an `exec` hook that runs `sleep`.

## How to commit

This repo uses [Semantic Release](https://github.com/semantic-release/semantic-release) with Conventional Commits.
The type of the commit message sets the type of the release:

```
feat: new feature ---> 1.x.0
fix: fix a bug ---> 1.0.x
```

To mark a breaking change, add a `!` after the type (for example, `feat!:`) or add a `BREAKING CHANGE:` footer to the commit message. Each one starts a major release.

```
feat: remove an option

BREAKING CHANGE: the option no longer exists.
```

## Reference
* <a href="https://github.com/fastify/fastify">Fastify</a>
* <a href="https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-probes/">Configure Liveness and Readiness Probes</a>
* <a href="https://www.youtube.com/watch?v=mxEvAPQRwhw">Kubernetes Health Checks with Readiness and Liveness Probes (Kubernetes Best Practices)</a>

## Fun fact: where does the name come from?
The name is inspired by the Arecibo message, a 1974 interstellar radio message carrying basic information about humanity and Earth sent to globular star cluster M13 in the hope that extraterrestrial intelligence might receive and decipher it. The message was broadcast into space a single time via frequency modulated radio waves at a ceremony to mark the remodelling of the Arecibo radio telescope in Puerto Rico on 16 November 1974.
