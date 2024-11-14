// in this case it is frontend's work
function encodeCredentials(username, password) {
  return Buffer.from(`${username}:${password}`).toString("base64");
}

function basicAuth(encodedCredentials, getUserByName) {
  const decoded = Buffer.from(encodedCredentials, "base64").toString("utf8");
  const [username, password] = decoded.split(":");
  const user = getUserByName(username);

  // obivously here you would compare the passwords hashes correctly.
  if (!user || user.password !== password) {
    throw new Error("Invalid credentials");
  }
  return user;
}

export { basicAuth, encodeCredentials };
