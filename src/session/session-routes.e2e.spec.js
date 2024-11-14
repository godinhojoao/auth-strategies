import request from "supertest";
import Fastify from "fastify";
import { sessionRoutes } from "./session-routes";

const fastify = Fastify();
fastify.register(sessionRoutes);

describe("Session Routes End-to-End Tests", () => {
  let sessionId;

  beforeAll(async () => {
    await fastify.listen({ port: 3000 });
  });

  afterAll(async () => {
    await fastify.close();
  });

  it("/session/login should login and return a session ID", async () => {
    const response = await request(fastify.server)
      .post("/session/login")
      .send({
        username: "Joao",
        password: "123abc",
      })
      .expect(200);

    sessionId = response.body.sessionId;

    expect(typeof sessionId).toBe("string");
    expect(sessionId.length).toBeGreaterThan(20);
  });

  it("should validate session with valid session ID", async () => {
    const response = await request(fastify.server)
      .get("/session-auth/test")
      .set("sessionId", sessionId)
      .expect(200);

    expect(response.body).toEqual({
      "user": {
        "id": 123,
        "name": "Joao",
      },
    })
  });

  it("should logout and delete session successfully", async () => {
    const response = await request(fastify.server)
      .post("/session-auth/logout")
      .set('sessionId', sessionId)
      .expect(200);

    expect(response.body).toHaveProperty("message", "Logged out successfully");
  });

  it("should return error for logging out with an invalid session ID", async () => {
    const response = await request(fastify.server)
      .post("/session-auth/logout")
      .send({ sessionId: "invalidSessionId" })
      .expect(401);

    expect(response.body).toHaveProperty("error", "Missing Session ID");
  });

  it("should return error for invalid session ID in /session-auth/test", async () => {
    const response = await request(fastify.server)
      .get("/session-auth/test")
      .set("sessionId", "invalidSessionId")
      .expect(401);

    expect(response.body).toHaveProperty("error", "Invalid or expired session");
  });

  it("should return error for missing session ID in /session-auth/test", async () => {
    const response = await request(fastify.server)
      .get("/session-auth/test")
      .expect(401);

    expect(response.body).toHaveProperty("error", "Missing Session ID");
  });

});
