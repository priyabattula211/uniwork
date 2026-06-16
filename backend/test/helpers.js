const jwt = require('jsonwebtoken');

function authHeader(userId) {
  return {
    Authorization: `Bearer ${jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' })}`
  };
}

module.exports = { authHeader };