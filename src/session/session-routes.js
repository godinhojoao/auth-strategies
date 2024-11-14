import { createSession, findSession, deleteSession } from './session.js';
import { getUserByName } from '../UsersInMemoryRepository.js';

export async function sessionRoutes(fastify, options) {
  fastify.addHook('preHandler', async (request, reply) => {
    if (request.url.startsWith('/session-auth/')) {
      const sessionId = request.headers.sessionid;
      if (!sessionId) {
        return reply.status(401).send({ error: 'Missing Session ID' });
      }

      try {
        const user = findSession(sessionId);
        request.user = user;
        request.sessionId = sessionId;
      } catch (error) {
        return reply.status(401).send({ error: 'Invalid or expired session' });
      }
    }
  });

  fastify.post('/session/login', async (request, reply) => {
    const { username, password } = request.body;

    const user = getUserByName(username);
    if (!user || user.password !== password) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const sessionId = createSession({ id: user.id, name: user.name, username: user.username });
    reply.send({ sessionId });
  });

  fastify.get('/session-auth/test', async (request, reply) => {
    reply.send({ user: request.user });
  });

  fastify.post('/session-auth/logout', async (request, reply) => {
    const sessionId = request.sessionId;
    try {
      deleteSession(sessionId);
      reply.send({ message: 'Logged out successfully' });
    } catch (error) {
      reply.status(401).send({ error: error.message });
    }
  });
}
