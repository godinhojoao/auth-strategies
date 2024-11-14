import request from "supertest";
import Fastify from "fastify";
import { jwtRoutes } from "./jwt-routes";

const fastify = Fastify();
fastify.register(jwtRoutes);

describe("JWT Routes End-to-End Tests", () => {
  let accessToken;
  let refreshToken;

  beforeAll(async () => {
    await fastify.listen({ port: 3000 })
  });


  afterAll(async () => {
    await fastify.close();
  });


  it("/jwt/login should login and return access and refresh tokens", async () => {
    const response = await request(fastify.server)
      .post("/jwt/login")
      .send({
        username: "Joao",
        password: "123abc",
      })
      .expect(200);

    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;

    expect(typeof accessToken).toBe('string');
    expect(accessToken.length > 100).toBeTruthy();
    expect(typeof refreshToken).toBe('string');
    expect(refreshToken.length > 100).toBeTruthy();

  });

  it("should refresh the access token using the refresh token", async () => {
    const response = await request(fastify.server)
      .post("/jwt/refresh")
      .send({ refreshToken })
      .expect(200);

    expect(response.body).toHaveProperty("accessToken");
    expect(response.body.accessToken).not.toEqual(accessToken);

    accessToken = response.body.accessToken;
  });

  it("should access the protected /jwt-auth/test route with a valid token", async () => {
    const response = await request(fastify.server)
      .get("/jwt-auth/test")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toHaveProperty("currentUser");
    expect(response.body.currentUser).toHaveProperty("id", 123);
    expect(response.body.currentUser).toHaveProperty("name", "Joao");
    expect(response.body.currentUser).toHaveProperty("email", "test@gmail.com");
  });

  it("should return error for missing token in /jwt-auth/test", async () => {
    const response = await request(fastify.server)
      .get("/jwt-auth/test")
      .expect(401);

    expect(response.body).toHaveProperty("error", "Missing token");
  });

  it("should return error for invalid token in /jwt-auth/test", async () => {
    const response = await request(fastify.server)
      .get("/jwt-auth/test")
      .set("Authorization", "Bearer invalidToken")
      .expect(401);

    expect(response.body).toHaveProperty("error", "Invalid or expired token");
  });

  it("should return error for invalid credentials in /jwt/login", async () => {
    const response = await request(fastify.server)
      .post("/jwt/login")
      .send({
        username: "Joao",
        password: "wrongpassword",
      })
      .expect(401);

    expect(response.body).toHaveProperty("error", "Invalid credentials");
  });
});
