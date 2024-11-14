import { createSession, findSession, deleteSession } from "./session";

describe("Session Management", () => {

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("should create a valid session and store it in memory", () => {
    const user = { id: 123, name: "Joao", email: "test@gmail.com" };
    const sessionId = createSession(user);

    expect(sessionId).toBeDefined();
    const session = findSession(sessionId);
    expect(session).toEqual(user);
  });

  it("should throw an error if session is expired", () => {
    const user = { id: 123, name: "Joao", email: "test@gmail.com" };
    const sessionId = createSession(user, 1); // Set expiration to 1ms for testing

    // Wait for the session to expire
    jest.advanceTimersByTime(2);

    expect(() => {
      findSession(sessionId);
    }).toThrowError("Session has expired");
  });

  it("should delete a session", () => {
    const user = { id: 123, name: "Joao", email: "test@gmail.com" };
    const sessionId = createSession(user);

    deleteSession(sessionId);
    expect(() => {
      findSession(sessionId);
    }).toThrowError("Expired or invalid session");
  });

  it("should not throw an error for a valid session", () => {
    const user = { id: 123, name: "Joao", email: "test@gmail.com" };
    const sessionId = createSession(user);

    const session = findSession(sessionId);
    expect(session).toEqual(user);
  });

  it("should not allow access to an invalid session", () => {
    const invalidSessionId = "invalidSessionId";

    expect(() => {
      findSession(invalidSessionId);
    }).toThrowError("Expired or invalid session");
  });
});
