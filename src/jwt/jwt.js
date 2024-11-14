import jwt from "jsonwebtoken"
const PRIVATE_KEY = "keyHere"; // .env

// The lib advises to avoid auto refresh tokens: https://www.npmjs.com/package/jsonwebtoken
// - "First of all, we recommend you to think carefully if auto-refreshing a JWT will not introduce any vulnerability in your system."
// - "We are not comfortable including this as part of the library"
// - "However, you can take a look at this example to show how this could be accomplished."

function generateToken(payload, options = { expiresIn: "7d" }) {
  const token = jwt.sign(payload, PRIVATE_KEY, options);
  return token;
}

function decodeToken(token) {
  try {
    const decodedToken = jwt.verify(token, PRIVATE_KEY);
    return decodedToken;
  } catch (err) {
    return null; // expired or invalid token
  }
}

function refreshAccessToken(refreshToken, getUserById) {
  const decodedRefreshToken = decodeToken(refreshToken);
  if (!decodedRefreshToken) {
    throw new Error("Expired or invalid refresh token");
  }

  const userId = decodedRefreshToken.id;
  const user = getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const newAccessToken = generateToken({ id: user.id, name: user.name, email: user.email });
  return newAccessToken;
}

export {
  generateToken,
  decodeToken,
  refreshAccessToken
};