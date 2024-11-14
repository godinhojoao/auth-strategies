import { createClientApiKey, isValidApiKey } from './apiKey.js';

export async function apiKeyRoutes(fastify, options) {

  fastify.addHook('preHandler', async (request, reply) => {
    if (request.url.startsWith('/api-key-auth/')) {
      const apiKey = request.headers['x-api-key'];
      if (!apiKey) {
        return reply.status(401).send({ error: 'Missing API key' });
      }

      const clientId = request.params.id;
      const isValid = await isValidApiKey(clientId, apiKey);
      if (!isValid) {
        return reply.status(401).send({ error: 'Invalid or expired API key' });
      }

      request.clientId = clientId;
    }
  });

  fastify.post('/client/:id/api-keys', async (request, reply) => {
    const clientId = request.params.id;
    const { actions, resources } = request.body;

    try {
      const apiKey = await createClientApiKey({ clientId, actions, resources });
      reply.send({ apiKey });
    } catch (error) {
      reply.status(500).send({ error: 'Failed to create API key' });
    }
  });

  fastify.get('/api-key-auth/client/:id/test', async (request, reply) => {
    reply.send({ message: `API key is valid for client ID: ${request.clientId}` });
  });
}
