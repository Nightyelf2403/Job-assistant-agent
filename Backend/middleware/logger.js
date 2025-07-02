const morgan = require('morgan');

// Define custom format (optional)
const format = ':method :url :status - :response-time ms';

const logger = morgan(format);

module.exports = logger;

