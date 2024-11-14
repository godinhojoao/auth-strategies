import { generateToken, decodeToken, refreshAccessToken } from './jwt.js';
import { getUserByName, getUserById } from '../UsersInMemoryRepository.js';

export async function jwtRoutes(fastify, options) {
  fastify.addHook('preHandler', async (request, reply) => {
    if (request.url.startsWith('/jwt-auth/')) {  // Apply only to /jwt-auth/* routes
      const token = request.headers.authorization?.split(' ')[1];
      if (!token) {
        return reply.status(401).send({ error: 'Missing token' });
      }
      const decoded = decodeToken(token);
      if (!decoded) {
        return reply.status(401).send({ error: 'Invalid or expired token' });
      }
      request.user = decoded;
    }
  });

  fastify.post('/jwt/login', async (request, reply) => {
    const { username, password } = request.body;

    const user = getUserByName(username);
    if (!user || user.password !== password) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const accessToken = generateToken({ id: user.id, name: user.name });
    const refreshToken = generateToken({ id: user.id });
    reply.send({ accessToken, refreshToken });
  });

  fastify.post('/jwt/refresh', async (request, reply) => {
    const { refreshToken } = request.body;
    try {
      const newAccessToken = refreshAccessToken(refreshToken, getUserById);
      reply.send({ accessToken: newAccessToken });
    } catch (error) {
      reply.status(401).send({ error: error.message });
    }
  });

  fastify.get('/jwt-auth/test', async (request, reply) => {
    const currentUser = request.user
    reply.send({ currentUser });
  });


}
