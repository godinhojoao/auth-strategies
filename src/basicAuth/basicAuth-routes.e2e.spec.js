import request from "supertest";
import Fastify from "fastify";
import { basicAuthRoutes } from "./basicAuth-routes.js";

const fastify = Fastify();
fastify.register(basicAuthRoutes);

describe("Basic Auth Routes Tests", () => {
  let encodedCredentials;

  beforeAll(async () => {
    await fastify.listen({ port: 3000 });
  });

  afterAll(async () => {
    await fastify.close();
  });

  it("should return error for missing authorization header", async () => {
    const response = await request(fastify.server)
      .get("/basic-auth/test")
      .expect(401);

    expect(response.body).toHaveProperty("error", "Authorization header missing");
  });

  it("should return error for missing credentials in Authorization header", async () => {
    const response = await request(fastify.server)
      .get("/basic-auth/test")
      .set("Authorization", "Basic ")
      .expect(401);

    expect(response.body).toHaveProperty("error", "Missing credentials");
  });

  it("should return user data for valid authorization credentials", async () => {
    encodedCredentials = Buffer.from("Joao:123abc").toString("base64");

    const response = await request(fastify.server)
      .get("/basic-auth/test")
      .set("Authorization", `Basic ${encodedCredentials}`)
      .expect(200);

    expect(response.body).toEqual({
      currentUser: {
        id: 123,
        name: 'Joao',
        email: 'test@gmail.com',
        password: '123abc'
      }
    });
  });

  it("should return error for invalid credentials in Authorization header", async () => {
    const invalidEncodedCredentials = Buffer.from("Joao:wrongpassword").toString("base64");

    const response = await request(fastify.server)
      .get("/basic-auth/test")
      .set("Authorization", `Basic ${invalidEncodedCredentials}`)
      .expect(401);

    expect(response.body).toHaveProperty("error", "Invalid credentials");
  });
});
