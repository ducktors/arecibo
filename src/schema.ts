export const healthSchema = {
  description: 'Health check route',
  tags: ['arecibo'],
  summary: 'Health check route',
  response: {
    200: {
      description: 'All Systems Ready!',
      type: 'string',
    },
  },
}

export const readinessSchema = {
  description: 'The kubelet uses liveness probes to know when to restart a Container',
  tags: ['arecibo'],
  summary: 'Readiness Probe route',
  response: {
    200: {
      description: 'All Systems Ready!',
      type: 'string',
    },
  },
}

export const livenessSchema = {
  description:
    'The kubelet uses readiness probes to know when a Container is ready to start accepting traffic',
  tags: ['arecibo'],
  summary: 'Liveness Probe route',
  response: {
    200: {
      description: 'All Systems Ready!',
      type: 'string',
    },
  },
}
