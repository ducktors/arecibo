<div align="center">

![arecibo-logo-v1](https://user-images.githubusercontent.com/6388707/44850629-2441de80-ac5e-11e8-9508-10beca9d17ef.png)
            
</div>

<div align="center">

[![NPM version](https://img.shields.io/npm/v/arecibo.svg?style=flat)](https://www.npmjs.com/package/arecibo)
[![NPM downloads](https://img.shields.io/npm/dm/arecibo.svg?style=flat)](https://www.npmjs.com/package/arecibo) 
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

</div>

## Installation

```bash
npm i arecibo
```

## Usage 

```javascript
const arecibo = require('arecibo') // or import arecibo from 'arecibo'

fastify.register(arecibo, {
  message: 'Put here your custom message', // optional, default to original arecibo message 
  readinessURL: '/put/here/your/custom/url', // optional, deafult to /arecibo/readiness
  livenessURL: '/put/here/your/custom/url', // optional, deafult to /arecibo/liveness
  readinessCallback: (req, reply) =>  reply.type('text/html').send('Put here your custom message') // optional
  livenessCallback: (req, reply) =>  reply.type('text/html').send('Put here your custom message') // optional
})

```

On Kubernetes add deployment manifest

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
