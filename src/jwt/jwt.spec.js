import { generateToken, decodeToken, refreshAccessToken } from "./jwt.js"
import { getUserById } from '../UsersInMemoryRepository.js'

describe("JWT Token Management", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("should generate a valid token", () => {
    const user = { id: 123, name: "Joao", email: "test@gmail.com" };
    const token = generateToken(user);

    expect(token).toBeDefined();
    const decoded = decodeToken(token);
    expect(decoded).toBeDefined();
    expect(decoded.id).toBe(user.id);
    expect(decoded.name).toBe(user.name);
    expect(decoded.email).toBe(user.email);
  });

  it("should decode a valid token", () => {
    const user = { id: 123, name: "Joao", email: "test@gmail.com" };
    const token = generateToken(user);

    const decoded = decodeToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded.id).toBe(user.id);
    expect(decoded.name).toBe(user.name);
    expect(decoded.email).toBe(user.email);
  });

  it("should return null for an expired token", async () => {
    const user = { id: 123, name: "Joao", email: "test@gmail.com" };
    const token = generateToken(user, { expiresIn: "1s" }); // Set expiration to 1 second

    const decodedBeforeExpiration = decodeToken(token);
    expect(decodedBeforeExpiration).not.toBeNull();

    // Wait for the token to expire
    jest.advanceTimersByTime(2000); // Fast forward 2 seconds


    const decodedAfterExpiration = decodeToken(token);
    expect(decodedAfterExpiration).toBeNull();
  });

  it("should refresh the access token with a valid refresh token", async () => {
    const user = { id: 123, name: "Joao", email: "test@gmail.com" };
    const refreshToken = generateToken({ id: user.id }, { expiresIn: "5s" });

    // Simulate expired access token
    jest.advanceTimersByTime(2000); // Fast forward 2 seconds

    const newAccessToken = refreshAccessToken(refreshToken, getUserById);
    const decodedNewAccessToken = decodeToken(newAccessToken);

    expect(decodedNewAccessToken).not.toBeNull();
    expect(decodedNewAccessToken.id).toBe(user.id);
  });

  it("should throw an error if the refresh token is invalid", () => {
    const invalidRefreshToken = "invalidToken";

    expect(() => {
      refreshAccessToken(invalidRefreshToken, getUserById);
    }).toThrow("Expired or invalid refresh token");
  });

  it("should throw an error if the user is not found during refresh", () => {
    const invalidUserIdRefreshToken = generateToken(
      { id: "999" },
      { expiresIn: "5s" }
    );

    expect(() => {
      refreshAccessToken(invalidUserIdRefreshToken, getUserById);
    }).toThrow("User not found");
  });
});
