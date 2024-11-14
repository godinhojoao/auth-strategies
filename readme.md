# Authentication and Authorization

- I will summarize some authentication types (not all existent), and then you can also check the practical example with NodeJS.
- Note that I have intentionally left out a lot of details that a production-ready application may require. My focus here is on the authentications.

## Important:

- **Authentication**: is about verifying the user's identity.
- **Authorization** is about granting permissions to resources after identity is verified.

## How to run:

- `nvm install 22`
- `nvm use`
- `npm install`
- `npm run dev`

## How to run tests:

- Unit: `npm run unit`
- End-to-end: `npm run e2e`

## Before talking about the methods:

- **Stateless Authentication**: A request contains all the necessary information (like a JWT), so the server doesn’t need to remember anything about the client.
- **Stateful Authentication**: Relies on maintaining session data on the server, tracking user state across multiple requests given a sessionId cookie, for example.

## JSON Web Token - JWT (Stateless)

- JWT is a way of authentication that allows a server to verify user identity **without storing information about this user**.
- JWT tokens are called "headless tokens" because they are typically used in stateless environments, where the server doesn't need to store session information.
- **Use JWT when** you need stateless, scalable authentication for APIs, SPAs, or microservices.

## Basic Authentication (Stateless)

- The most "simple" authentication system of HTTP. It is included in the header of requests, e.g.:
  `Authorization: Basic "credentials as base64 in the format user:password"`
  - Remember that base64 is a codification scheme and not a cryptography. You should use it only with HTTPS (TLS) connections.
- It's also stateless because the client sends the credentials in every request. It is not needed to save any session on the server.
- **Use Basic Authentication** for simple, low-security use cases or when you want to quickly authenticate users with username and password in a single request.
  - "Low-security" because:
    - You need to send the credentials in every request.
    - No expiration or rotation mechanism.

## Session-based Authentication (Stateful)

- This is a bit more complex than other types because it is a **Stateful Authentication Method**.
  - So for deeper explanations you can look at https://roadmap.sh/guides/session-authentication
- But in summary:
  - It involves storing user login information on the server (in a session).
  - Using a session ID to track the user across requests.
  - This session ID is typically stored in a cookie on the client's browser.
  - The server checks the session ID on each request to verify the user's identity.
- **Why is session-based auth stateful and JWT stateless if both send a string in each request?**
  - **Answer**: In JWT, the user info is stored in the token itself, not on the server, making it stateless. In session auth, the server stores the user data to remember it in each request, making it stateful.
- **Use Session-based Authentication when** you need to maintain user sessions across multiple requests and require server-side control over authentication and session expiration.

## API Keys (Stateless)

- API keys normally authenticate projects/applications, making requests to an API.
- They are typically hashed to enhance security, the same as passwords.
- It's stateless because the server doesn't maintain any session or state information between requests. Each request includes the API key, which is validated independently.
- **Use API Keys when** you need simple, token-based authentication with specific permissions, rate limiting, and the ability to revoke keys if needed.
  - The key must be securely stored by the user, as it is required for each request. As it is hashed, the system will not be able to share the key again with the user because the system itself doesn't have access to the original key (same as a password).
  - It's important to implement expiration time and key rotation to reduce the risk of long-term exposure if a key is compromised.

## OAuth2

- OAuth 2.0 is an **authorization** framework that allows applications to obtain limited access to a user's resources on a server without requiring the user’s password. OAuth 2.0 is widely used for "single sign-on" (SSO) and has become a standard for authorizing access to APIs on platforms like Google, Facebook, GitHub, and others.
- In summary: OAuth 2.0 is the underlying authorization framework that enables "social login" or "login with social media."

  ### Key Components of OAuth 2.0

  - **Resource Owner**: The user who authorizes an application to access their account.
  - **Client**: The application requesting access to the user's account (e.g., a third-party app).
  - **Resource Server**: The server hosting the user's data, such as an API (e.g., GitHub’s servers).
  - **Authorization Server**: The server that authenticates the user and issues access tokens (e.g., GitHub’s OAuth server).

  ### OAuth2 Workflow

  1. **Authorization Request**: Client redirects user to authorization server (e.g. Github), requesting access and specifying permissions.
  2. **User Authorization**: User approves or denies access. If approved, the server (e.g. Github) redirects the user to the client with an authorization code.
  3. **Access Token Request**: Client exchanges the authorization code for an access token. Typically, the **access token** used is a **JWT**.
  4. **Access Resource**: Client uses the access token to request data from the resource server.

  ### Main Grant Types or "Authorization Flows"

  - **Authorization Code Grant**: The client receives an authorization code from the authorization server and exchanges it for an access token.
  - **Implicit Grant**: The access token is returned directly to the client without an authorization code, typically for client-side applications.
  - **Resource Owner Password Credentials Grant**: The client requests access by using the user's username and password, which is suitable for trusted clients.
  - **Client Credentials Grant**: The client requests access to the resource server using its own credentials, without the involvement of a user.
  - **Refresh Token Grant**: The client can use a refresh token to obtain a new access token after the original token has expired.

  ### Short example following "Authorization Code Grant":

  ```javascript
    // Frontend:
    // <a href="https://github.com/login/oauth/authorize?client_id={your_client_id}&redirect_uri=http://localhost:8080/oauth/redirect">Login with github</a>

    // Backend
    const clientID = '<your client id>'
    const clientSecret = '<your client secret>'
    app.get('/oauth/redirect', (req, res) => {
      const requestToken = req.query.code
      axios({
        method: 'post',
        url: `https://github.com/login/oauth/access_token?client_id=${clientID}&client_secret=${clientSecret}&code=${requestToken}`,
        headers: {
          accept: 'application/json'
        }
      }).then((response) => {
        const accessToken = response.data.access_token
        res.redirect(/welcome.html?access_token=${accessToken})
      })
    })
  ```
