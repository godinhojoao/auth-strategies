import Fastify from 'fastify'
import { jwtRoutes } from './src/jwt/jwt-routes.js'
import { basicAuthRoutes } from './src/basicAuth/basicAuth-routes.js'
import { sessionRoutes } from './src/session/session-routes.js'

const fastify = Fastify({
  logger: true
})

fastify.register(jwtRoutes)
fastify.register(basicAuthRoutes)
fastify.register(sessionRoutes)

fastify.get('/ping', (request, reply) => {
  reply.status(200).send({ pong: true })
})

fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})