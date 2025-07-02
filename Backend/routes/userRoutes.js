const express = require('express');
const router = express.Router();
const { createUser, getUser } = require('../Controllers/userController');

// Define routes
router.post('/users', createUser);
router.get('/users/:userId', getUser);

module.exports = router;

