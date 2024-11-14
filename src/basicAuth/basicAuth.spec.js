import { basicAuth, encodeCredentials } from "./basicAuth.js"
import { getUserByName } from "./../UsersInMemoryRepository.js"

describe("Basic Authentication Logic", () => {
  it("should encode credentials to base64", () => {
    const username = "Joao";
    const password = "123abc";
    const encoded = encodeCredentials(username, password);
    // Expect the base64 encoded value of 'Joao:123abc'
    expect(encoded).toBe("Sm9hbzoxMjNhYmM=");
  });

  it("should decode and authenticate valid credentials", () => {
    const username = "Joao";
    const password = "123abc";
    const encodedCredentials = encodeCredentials(username, password);

    const user = basicAuth(encodedCredentials, getUserByName);

    expect(user).toBeDefined();
    expect(user.id).toBe(123);
    expect(user.name).toBe("Joao");
    expect(user.email).toBe("test@gmail.com");
  });

  it("should throw an error for invalid username", () => {
    const invalidUsername = "InvalidUser";
    const password = "123abc";
    const encodedCredentials = encodeCredentials(invalidUsername, password);

    expect(() => {
      basicAuth(encodedCredentials, getUserByName);
    }).toThrow("Invalid credentials");
  });

  it("should throw an error for invalid password", () => {
    const username = "Joao";
    const invalidPassword = "wrongPassword";
    const encodedCredentials = encodeCredentials(username, invalidPassword);

    expect(() => {
      basicAuth(encodedCredentials, getUserByName);
    }).toThrow("Invalid credentials");
  });

  it("should throw an error for invalid base64 format", () => {
    const invalidBase64 = "notBase64Encoded";

    expect(() => {
      basicAuth(invalidBase64, getUserByName);
    }).toThrow("Invalid credentials");
  });
});
