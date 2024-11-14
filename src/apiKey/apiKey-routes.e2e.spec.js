import request from "supertest";
import Fastify from "fastify";
import { apiKeyRoutes } from "./apiKey-routes";

const fastify = Fastify();
fastify.register(apiKeyRoutes);

describe("API Key Routes End-to-End Tests", () => {
  let clientId = "client123";
  let apiKey;

  beforeAll(async () => {
    await fastify.listen({ port: 3000 });
  });

  afterAll(async () => {
    await fastify.close();
  });

  it("/client/:id/api-keys should create an API key for a client", async () => {
    const response = await request(fastify.server)
      .post(`/client/${clientId}/api-keys`)
      .send({
        actions: ["read"],
        resources: ["resource1"],
      })
      .expect(200);

    apiKey = response.body.apiKey;

    expect(apiKey).toBeDefined();
    expect(apiKey.length).toBeGreaterThan(20);
  });

  it("should validate API key with valid API key", async () => {
    const response = await request(fastify.server)
      .get(`/api-key-auth/client/${clientId}/test`)
      .set("x-api-key", apiKey)
      .expect(200);

    expect(response.body).toEqual({
      message: `API key is valid for client ID: ${clientId}`,
    });
  });

  it("should return error for invalid API key", async () => {
    const response = await request(fastify.server)
      .get(`/api-key-auth/client/${clientId}/test`)
      .set("x-api-key", "invalidApiKey")
      .expect(401);

    expect(response.body).toHaveProperty("error", "Invalid or expired API key");
  });

  it("should return error for missing API key", async () => {
    const response = await request(fastify.server)
      .get(`/api-key-auth/client/${clientId}/test`)
      .expect(401);

    expect(response.body).toHaveProperty("error", "Missing API key");
  });
});
