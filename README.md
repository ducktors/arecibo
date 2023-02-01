<div align="center">

![arecibo-logo-v1](https://user-images.githubusercontent.com/6388707/44850629-2441de80-ac5e-11e8-9508-10beca9d17ef.png)

</div>

<div align="center">

[![NPM version](https://img.shields.io/npm/v/arecibo.svg?style=flat)](https://www.npmjs.com/package/arecibo)
[![NPM downloads](https://img.shields.io/npm/dm/arecibo.svg?style=flat)](https://www.npmjs.com/package/arecibo)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Known Vulnerabilities](https://snyk.io/test/github/ducktors/arecibo/badge.svg?targetFile=package.json)](https://snyk.io/test/github/ducktors/arecibo?targetFile=package.json)

</div>

| Arecibo version | Fastify version | Status |
| -- | -- | -- |
| [v3](https://github.com/ducktors/arecibo/releases/tag/v3.0.0) | Fastify 4 | Active |
| [v2](https://github.com/ducktors/arecibo/releases/tag/v2.2.0) | Fastify 3, 4 | Only security patch |
| [v1](https://github.com/ducktors/arecibo/releases/tag/v1.1.0) | Fastify 2 | Deprecated |

## Installation

```bash
npm i arecibo
```

## Usage in Node.js

Minimal setup:

```javascript

import arecibo from 'arecibo'
// const arecibo = require('arecibo')
// or import * as arecibo from 'arecibo'

fastify.register(arecibo, {
  message: 'Alive', // optional, default to original arecibo message
  logLevel: 'error', // optional, defaults to 'info'; can be trace, debug, info, warn, error, and fatal
})

```

```bash

$ curl http://localhost:3000/healthz
Alive%

```


Custom setup:

```javascript

import arecibo from 'arecibo'
// const arecibo = require('arecibo')
// or import * as arecibo from 'arecibo'

fastify.register(arecibo, {
  message: 'Put here your custom message', // optional, default to original arecibo message
  readinessURL: '/put/here/your/custom/url', // optional, 
  livenessURL: '/put/here/your/custom/url', // optional,
  readinessCallback: (req, reply) => reply.type('text/html').send('Ahoy, I am readiness probe'), // optional
  livenessCallback: (req, reply) => reply.type('text/html').send('Hej, I am liveness probe'), // optional
  logLevel: 'error', // optional, defaults to 'info'; can be trace, debug, info, warn, error, and fatal
})

```

```bash

$ curl http://localhost:3000/probe/liveness
Hej, I am liveness probe%

$ curl http://localhost:3000/probe/readiness
Ahoy, I am readiness probe%

```

### Note for typescript users

If you set `"esModuleInterop": true` you must import this module using `import arecibo from 'arecibo'`.

### Example on Kubernetes Deployment

```yaml
...

livenessProbe:
  httpGet:
    path: /probe/liveness
    port: 80
    httpHeaders:
      - name: X-Custom-Header
        value: Awesome
  initialDelaySeconds: 15
  timeoutSeconds: 1
  periodSeconds: 15
readinessProbe:
  httpGet:
    path: /probe/readiness
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
