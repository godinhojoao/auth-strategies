import { basicAuth } from './basicAuth.js';
import { getUserByName } from '../UsersInMemoryRepository.js';

export async function basicAuthRoutes(fastify, options) {
  fastify.addHook('preHandler', async (request, reply) => {
    if (request.url.startsWith('/basic-auth/')) {
      const authHeader = request.headers.authorization;
      if (!authHeader) {
        return reply.status(401).send({ error: 'Authorization header missing' });
      }

      const encodedCredentials = authHeader.split(' ')[1];
      if (!encodedCredentials) {
        return reply.status(401).send({ error: 'Missing credentials' });
      }

      try {
        const user = basicAuth(encodedCredentials, getUserByName);
        request.user = user;
      } catch (error) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }
    }
  });

  fastify.get('/basic-auth/test', async (request, reply) => {
    const currentUser = request.user;
    reply.send({ currentUser });
  });
}
