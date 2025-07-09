const morgan = require('morgan');

// Add custom token to log request body
morgan.token('body', (req) => {
  return req.body && Object.keys(req.body).length ? JSON.stringify(req.body) : '{}';
});

// Format including method, URL, status, response time, and body
const format = ':method :url :status - :response-time ms ↳ Body: :body';

// Skip body logging for GET requests
const logger = morgan(format, {
  skip: (req) => req.method === 'GET'
});

module.exports = logger;
