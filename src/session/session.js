import { randomBytes } from "crypto";

const EIGHT_HOURS_IN_MILLISECONDS = 8 * 60 * 60 * 1000;

const sessionStore = {}

function createSession(user, SESSION_TIMEOUT = EIGHT_HOURS_IN_MILLISECONDS) {
  const sessionId = randomBytes(16).toString('hex');
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + SESSION_TIMEOUT);
  const newSession = {
    user,
    createdAt,
    expiresAt
  };
  sessionStore[sessionId] = newSession;
  return sessionId;
}

function findSession(sessionId) {
  const currentSession = sessionStore[sessionId];
  if (!currentSession) {
    throw new Error("Expired or invalid session");
  }

  const now = new Date();
  if (now > currentSession.expiresAt) {
    delete sessionStore[sessionId];
    throw new Error("Session has expired");
  }
  return currentSession.user;
}

function deleteSession(sessionId) {
  delete sessionStore[sessionId];
}

export { createSession, findSession, deleteSession };
