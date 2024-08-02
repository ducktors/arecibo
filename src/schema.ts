export const healthzSchema = {
  description: 'General health check endpoint',
  tags: ['arecibo'],
  summary: 'Health Check route',
  response: {
    200: {
      description: 'System is healthy',
      type: 'string',
    },
  },
};

export const readinessSchema = {
  description:
    'The kubelet uses readiness probes to know when a Container is ready to start accepting traffic',
  tags: ['arecibo'],
  summary: 'Readiness Probe route',
  response: {
    200: {
      description: 'All Systems Ready!',
      type: 'string',
    },
  },
};

export const livenessSchema = {
  description:
    'The kubelet uses liveness probes to know when to restart a Container',
  tags: ['arecibo'],
  summary: 'Liveness Probe route',
  response: {
    200: {
      description: 'All Systems Live!',
      type: 'string',
    },
  },
};

export const startupSchema = {
  description:
    'The kubelet uses startup probes to know when a Container application has started',
  tags: ['arecibo'],
  summary: 'Startup Probe route',
  response: {
    200: {
      description: 'Application Started Successfully!',
      type: 'string',
    },
  },
};
