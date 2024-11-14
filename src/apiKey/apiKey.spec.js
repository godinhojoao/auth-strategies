import {
  createClientApiKey,
  getClientApiKeys,
  isValidApiKey,
  revokeClientApiKey,
} from "./apiKey";

describe("API Key Management", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("should create a valid API key and return the original API key", async () => {
    const clientId = "client123";
    const actions = ["read"];
    const resources = ["resource1"];

    const apiKey = await createClientApiKey({ clientId, actions, resources });

    expect(apiKey).toBeDefined();
    const clientApiKeys = getClientApiKeys(clientId);
    expect(clientApiKeys).toEqual([
      expect.objectContaining({
        actions: expect.arrayContaining(actions),
        resources: expect.arrayContaining(resources),
      }),
    ]);
  });

  it("should return false if the API key is invalid", async () => {
    const clientId = "client9";
    const actions = ["read"];
    const resources = ["resource1"];

    const apiKey = await createClientApiKey({ clientId, actions, resources });

    const invalidApiKey = "invalidApiKeyValue";
    const isValid = await isValidApiKey(clientId, invalidApiKey);

    expect(isValid).toEqual(false);
  });

  it("should return false if the API key has expired", async () => {
    const clientId = "client90";
    const actions = ["read"];
    const resources = ["resource1"];

    const apiKey = await createClientApiKey({
      clientId,
      actions,
      resources,
      KEY_EXPIRES_AT: 1,
    });

    jest.advanceTimersByTime(2);

    const isValid = await isValidApiKey(clientId, apiKey);

    expect(isValid).toEqual(false);
  });

  it("should successfully revoke a valid API key", async () => {
    const clientId = "client903";
    const actions = ["read"];
    const resources = ["resource1"];

    const apiKey = await createClientApiKey({ clientId, actions, resources });

    const result = await revokeClientApiKey(clientId, apiKey);
    expect(result).toEqual(true);

    const isValid = await isValidApiKey(clientId, apiKey);
    expect(isValid).toEqual(false);
  });

  it("should return false if the API key does not exist", async () => {
    const result = await revokeClientApiKey("client904", "invalidApiKey");
    expect(result).toEqual(false);
  });
});
