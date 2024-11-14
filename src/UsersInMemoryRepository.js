// fake in memory DB
const usersDB = [
  { id: 123, name: "Joao", email: "test@gmail.com", password: "123abc" },
];

// We are also returning password to the client, but it doesn't matter for our test.
function getUserById(userId) {
  const user = usersDB.find((user) => user.id === userId);
  return user;
}

function getUserByName(username) {
  const user = usersDB.find((user) => user.name === username);
  return user;
}

export { getUserById, getUserByName };
