// `anyOf: [{}]` accepts all values, thus objects become JSON.
// Fastify 4 reads a schema without this keyword as a JSON shorthand and fails.
export const readinessSchema = {
  description:
    'The kubelet uses readiness probes to know when a Container is ready to start accepting traffic',
  tags: ['arecibo'],
  summary: 'Readiness Probe route',
  response: {
    200: {
      description: 'All Systems Ready!',
      anyOf: [{}],
    },
  },
}

export const livenessSchema = {
  description:
    'The kubelet uses liveness probes to know when to restart a Container',
  tags: ['arecibo'],
  summary: 'Liveness Probe route',
  response: {
    200: {
      description: 'All Systems Ready!',
      anyOf: [{}],
    },
  },
}
