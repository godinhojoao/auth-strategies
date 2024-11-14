import { randomBytes } from "crypto";
import bcrypt from "bcrypt";

const ONE_YEAR_IN_MILLISECONDS = 365 * 24 * 60 * 60 * 1000;

// In a production environment, API keys would typically be stored in a persistent database like MongoDB, PostgreSQL, or another suitable data store.
const apiKeyStore = {};

async function createClientApiKey({ clientId, actions = [], resources = [], KEY_EXPIRES_AT = ONE_YEAR_IN_MILLISECONDS }) {
  if (!apiKeyStore[clientId]) {
    apiKeyStore[clientId] = {
      apiKeys: []
    };
  }
  const newApiKey = randomBytes(32).toString('hex');
  const saltRounds = 10;
  const hashedApiKey = await bcrypt.hash(newApiKey, saltRounds);
  const createdAt = new Date();
  const newKeyObj = {
    hashedValue: hashedApiKey,
    createdAt: createdAt,
    expiresAt: new Date(createdAt.getTime() + KEY_EXPIRES_AT),
    revokedAt: null,
    actions: actions, // on prod we would obviously validate the actions array
    resources: resources // on prod we would obviously validate the resources array
  };
  apiKeyStore[clientId].apiKeys.push(newKeyObj);
  return newApiKey;
}

function getClientApiKeys(clientId) {
  const client = apiKeyStore[clientId];
  return client.apiKeys || [];
}

async function isValidApiKey(clientId, apiKeyValue) {
  const client = apiKeyStore[clientId];
  if (!client || client.apiKeys.length === 0) {
    return false;
  }

  const validKey = client.apiKeys.find(
    key => key.revokedAt === null && new Date() < key.expiresAt
  );
  if (!validKey) return false;
  return await bcrypt.compare(apiKeyValue, validKey.hashedValue);
}

async function revokeClientApiKey(clientId, apiKeyValue) {
  const client = apiKeyStore[clientId];
  if (!client) {
    return false;
  }

  const keyToRevoke = client.apiKeys.find(key => key.revokedAt === null && new Date() < key.expiresAt);
  if (!keyToRevoke) {
    return false;
  }

  const isMatch = await bcrypt.compare(apiKeyValue, keyToRevoke.hashedValue);
  if (!isMatch) {
    return false;
  }

  keyToRevoke.revokedAt = new Date();
  return true;
}


export { createClientApiKey, getClientApiKeys, isValidApiKey, revokeClientApiKey };
