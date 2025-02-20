<div align="center">

---

![ARECIBO](https://user-images.githubusercontent.com/1620916/216600132-30d60aa1-59f7-4f47-8e23-8c14c02baf99.png)

---

![arecibo_telescope_sending_a_signal_into_the_space_during__b5c6335a-ae52-4f9d-9350-fd7953fb5013](https://user-images.githubusercontent.com/1620916/216599766-d30dacd3-1beb-4e11-a4f4-22e5b52fa57c.png)

</div>

<div align="center">

[![CI](https://github.com/ducktors/arecibo/actions/workflows/ci.yaml/badge.svg)](https://github.com/ducktors/arecibo/actions/workflows/ci.yaml) ![pnpm@10.4.1](https://img.shields.io/badge/pnpm-10.4.1-yellow)
[![NPM version](https://img.shields.io/npm/v/arecibo.svg?style=flat)](https://www.npmjs.com/package/arecibo)
[![NPM downloads](https://img.shields.io/npm/dm/arecibo.svg?style=flat)](https://www.npmjs.com/package/arecibo)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Known Vulnerabilities](https://snyk.io/test/github/ducktors/arecibo/badge.svg?targetFile=package.json)](https://snyk.io/test/github/ducktors/arecibo?targetFile=package.json)

</div>

## Installation
__Note: Please refer to the table below to find the correct version of Arecibo for your Fastify version.__


| Arecibo version | Fastify version | Branch |
| -- | -- | -- |
| [v4](https://github.com/ducktors/arecibo/releases/tag/v4.0.0) | Fastify 4, 5 | [master](https://github.com/ducktors/arecibo/tree/master) |
| [v3](https://github.com/ducktors/arecibo/releases/tag/v3.1.1) | Fastify 3, 4, 5 | not maintained |
| [v1.1.0](https://github.com/ducktors/arecibo/releases/tag/v1.1.0) | Fastify 2 | deprecated |


```bash
pnpm add arecibo
npm install arecibo
yarn add arecibo
```

## Usage in Node.js

```javascript
const arecibo = require('arecibo')
// or import arecibo from 'arecibo'
// or import * as arecibo from 'arecibo'

fastify.register(arecibo, {
  message: 'Put here your custom message', // optional, default to original arecibo message
  readinessURL: '/put/here/your/custom/url', // optional, deafult to /arecibo/readiness
  livenessURL: '/put/here/your/custom/url', // optional, deafult to /arecibo/liveness
  readinessCallback: (req, reply) => reply.type('text/html').send('Put here your custom message'), // optional
  livenessCallback: (req, reply) => reply.type('text/html').send('Put here your custom message'), // optional
  logLevel: 'error', // optional, defaults to 'info'; can be trace, debug, info, warn, error, and fatal
})

```
### Note for TypeScript users

If you set `"esModuleInterop": true` you must import this module using `import arecibo from 'arecibo'`.

## On Kubernetes add deployment manifest

```yaml
...

livenessProbe:
  httpGet:
    path: /arecibo/liveness
    port: 80
    httpHeaders:
      - name: X-Custom-Header
        value: Awesome
  initialDelaySeconds: 15
  timeoutSeconds: 1
  periodSeconds: 15
readinessProbe:
  httpGet:
    path: /arecibo/readiness
    port: 80
    httpHeaders:
      - name: X-Custom-Header
        value: Awesome
  initialDelaySeconds: 5
  timeoutSeconds: 1
  periodSeconds: 15

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
* <a href="https://github.com/fastify/fastify">Fastify</a>
* <a href="https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-probes/">Configure Liveness and Readiness Probes</a>
* <a href="https://www.youtube.com/watch?v=mxEvAPQRwhw">Kubernetes Health Checks with Readiness and Liveness Probes (Kubernetes Best Practices)</a>

## Fun fact: where does the name come from?
The name is inspired by the Arecibo message, a 1974 interstellar radio message carrying basic information about humanity and Earth sent to globular star cluster M13 in the hope that extraterrestrial intelligence might receive and decipher it. The message was broadcast into space a single time via frequency modulated radio waves at a ceremony to mark the remodelling of the Arecibo radio telescope in Puerto Rico on 16 November 1974.
