<div align="center">

![arecibo-logo-v1](https://user-images.githubusercontent.com/6388707/44850629-2441de80-ac5e-11e8-9508-10beca9d17ef.png)

</div>

<div align="center">

[![NPM version](https://img.shields.io/npm/v/arecibo.svg?style=flat)](https://www.npmjs.com/package/arecibo)
[![NPM downloads](https://img.shields.io/npm/dm/arecibo.svg?style=flat)](https://www.npmjs.com/package/arecibo)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Known Vulnerabilities](https://snyk.io/test/github/ducktors/arecibo/badge.svg?targetFile=package.json)](https://snyk.io/test/github/ducktors/arecibo?targetFile=package.json)

</div>

## Installation
__Note: Arecibo version 1 supports version 2 of Fastify. Arecibo version 2 supports version 3 of Fastify.__

| Arecibo version | Fastify version | Branch |
| -- | -- | -- |
| [v2.1.1](https://github.com/ducktors/arecibo/releases/tag/v2.1.1) | Fastify 3 & 4 | [master](https://github.com/ducktors/arecibo/tree/master) |
| [v1.1.0](https://github.com/ducktors/arecibo/releases/tag/v1.1.0) | Fastify 2 | [fastify2](https://github.com/ducktors/arecibo/tree/fastify2) | 


```bash
npm i arecibo
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
### Note for typescript users

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

## Reference
* <a href="https://github.com/fastify/fastify">Fastify</a>
* <a href="https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-probes/">Configure Liveness and Readiness Probes</a>
* <a href="https://www.youtube.com/watch?v=mxEvAPQRwhw">Kubernetes Health Checks with Readiness and Liveness Probes (Kubernetes Best Practices)</a>

## Fun fact: where does the name come from?
The name is inspired by the Arecibo message, a 1974 interstellar radio message carrying basic information about humanity and Earth sent to globular star cluster M13 in the hope that extraterrestrial intelligence might receive and decipher it. The message was broadcast into space a single time via frequency modulated radio waves at a ceremony to mark the remodelling of the Arecibo radio telescope in Puerto Rico on 16 November 1974.
