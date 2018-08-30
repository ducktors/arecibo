# arecibo
Fastify ping responder for Kubernetes Liveness and Readiness Probes

## Installation

`npm i arecibo`

## Usage 

```JS
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

```YAML
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

### Fun fact: where does the name come from? 
The name is inspired by the Arecibo message, a 1974 interstellar radio message carrying basic information about humanity and Earth sent to globular star cluster M13 in the hope that extraterrestrial intelligence might receive and decipher it. The message was broadcast into space a single time via frequency modulated radio waves at a ceremony to mark the remodelling of the Arecibo radio telescope in Puerto Rico on 16 November 1974.
