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

// Only the route with `readinessChecks` uses this schema. Thus a 503 reply from a
// custom callback stays the same.
export const readinessChecksSchema = {
  ...readinessSchema,
  response: {
    ...readinessSchema.response,
    503: {
      description: 'A readiness check failed',
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
