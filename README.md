<div align="center">

---

![ARECIBO](https://user-images.githubusercontent.com/1620916/216600132-30d60aa1-59f7-4f47-8e23-8c14c02baf99.png)

---

![arecibo_telescope_sending_a_signal_into_the_space_during__b5c6335a-ae52-4f9d-9350-fd7953fb5013](https://user-images.githubusercontent.com/1620916/216599766-d30dacd3-1beb-4e11-a4f4-22e5b52fa57c.png)

</div>

<div align="center">

[![NPM version](https://img.shields.io/npm/v/arecibo.svg?style=flat)](https://www.npmjs.com/package/arecibo)
[![NPM downloads](https://img.shields.io/npm/dm/arecibo.svg?style=flat)](https://www.npmjs.com/package/arecibo)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Known Vulnerabilities](https://snyk.io/test/github/ducktors/arecibo/badge.svg?targetFile=package.json)](https://snyk.io/test/github/ducktors/arecibo?targetFile=package.json)

</div>

## Installation

__Note: Arecibo version 2 supports Fastify versions 3 and 4.__

| Arecibo version | Fastify version | Branch |
| -- | -- | -- |
| [v2](https://github.com/ducktors/arecibo/releases/tag/v2.2.0) | Fastify 3 & 4 | [master](https://github.com/ducktors/arecibo/tree/master) |
| [v1.1.0](https://github.com/ducktors/arecibo/releases/tag/v1.1.0) | Fastify 2 | deprecated |

```bash
npm i arecibo
```

## Usage in Node.js

Arecibo now supports two configurations: basic and specific.

### Basic Configuration

The basic configuration provides a single `/healthz` route for general health checks.

```javascript
const fastify = require('fastify')()
const arecibo = require('arecibo')

fastify.register(arecibo, {
  probeType: 'basic', // Use basic configuration
  message: 'Custom health check message', // optional
  healthzURL: '/custom-healthz', // optional, default is '/healthz'
  healthzCallback: (req, reply) => reply.type('text/html').send('Custom health check response'), // optional
  logLevel: 'error', // optional, defaults to 'info'
})
```

### Specific Configuration

The specific configuration provides separate routes for readiness, liveness, and startup probes.

```javascript
const fastify = require('fastify')()
const arecibo = require('arecibo')

fastify.register(arecibo, {
  probeType: 'specific', // Use specific configuration
  message: 'Custom probe message', // optional
  readinessURL: '/custom-readiness', // optional, default is '/arecibo/readiness'
  livenessURL: '/custom-liveness', // optional, default is '/arecibo/liveness'
  startupURL: '/custom-startup', // optional, default is '/arecibo/startup'
  readinessCallback: (req, reply) => reply.type('text/html').send('Custom readiness response'), // optional
  livenessCallback: (req, reply) => reply.type('text/html').send('Custom liveness response'), // optional
  startupCallback: (req, reply) => reply.type('text/html').send('Custom startup response'), // optional
  logLevel: 'error', // optional, defaults to 'info'
})
```

### Options

- `probeType`: 'basic' or 'specific' (required)
- `message`: Custom message for all probes (optional)
- `healthzURL`: Custom URL for the health check in basic configuration (optional)
- `readinessURL`: Custom URL for the readiness probe (optional)
- `livenessURL`: Custom URL for the liveness probe (optional)
- `startupURL`: Custom URL for the startup probe (optional)
- `healthzCallback`: Custom callback for the health check (optional)
- `readinessCallback`: Custom callback for the readiness probe (optional)
- `livenessCallback`: Custom callback for the liveness probe (optional)
- `startupCallback`: Custom callback for the startup probe (optional)
- `logLevel`: Log level for the routes (optional, defaults to 'info')

### Note for TypeScript users

If you set `"esModuleInterop": true` in your `tsconfig.json`, you must import this module using `import arecibo from 'arecibo'`.

## Kubernetes Deployment Manifest

For the basic configuration:

```yaml
...
livenessProbe:
  httpGet:
    path: /healthz
    port: 80
  initialDelaySeconds: 15
  timeoutSeconds: 1
  periodSeconds: 15
...
```

For the specific configuration:

```yaml
...
livenessProbe:
  httpGet:
    path: /arecibo/liveness
    port: 80
  initialDelaySeconds: 15
  timeoutSeconds: 1
  periodSeconds: 15
readinessProbe:
  httpGet:
    path: /arecibo/readiness
    port: 80
  initialDelaySeconds: 5
  timeoutSeconds: 1
  periodSeconds: 15
startupProbe:
  httpGet:
    path: /arecibo/startup
    port: 80
  initialDelaySeconds: 5
  failureThreshold: 30
  periodSeconds: 10
...
```

## How to commit

This repo uses [Semantic Release](https://github.com/semantic-release/semantic-release) with Conventional Commits.
Releases are automatically created based on the type of commit message: feat for minor and fix for patch.

```
feat: new feature ---> 1.x.0
fix: fix a bug ---> 1.0.x
```

## Reference

- [Fastify](https://github.com/fastify/fastify)

- [Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Kubernetes Health Checks with Readiness and Liveness Probes (Kubernetes Best Practices)](https://www.youtube.com/watch?v=mxEvAPQRwhw)

## Fun fact: where does the name come from?

The name is inspired by the Arecibo message, a 1974 interstellar radio message carrying basic information about humanity and Earth sent to globular star cluster M13 in the hope that extraterrestrial intelligence might receive and decipher it. The message was broadcast into space a single time via frequency modulated radio waves at a ceremony to mark the remodelling of the Arecibo radio telescope in Puerto Rico on 16 November 1974.
