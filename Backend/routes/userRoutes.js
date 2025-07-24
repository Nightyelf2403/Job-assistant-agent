const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authenticateToken = require('../middleware/authenticateToken');
const {
  signup,
  login,
  updateUser,
  getUserById,
  getAllUsers,
  getCurrentUser,
  extractResumeForUser,
} = require('../Controllers/userController');

// Set up Multer for file uploads (e.g., resume)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`)
});
const upload = multer({ storage });

// 🟢 Public routes
router.post('/signup', signup);
router.post('/login', login); // ✅ Login route

// 🔐 User profile routes
router.get('/me', authenticateToken, getCurrentUser);
router.put('/users/:id', upload.single('resume'), updateUser);
router.get('/users/:id', getUserById);
router.get('/users', getAllUsers);
router.post('/:id/extract-resume', authenticateToken, extractResumeForUser);

module.exports = router;
