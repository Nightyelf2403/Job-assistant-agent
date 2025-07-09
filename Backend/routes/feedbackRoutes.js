const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Save user feedback on generated answers
router.post('/feedback', async (req, res) => {
  const { answerId, rating, comment } = req.body;

  if (!answerId || typeof rating !== 'number' || ![0, 1].includes(rating)) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const feedback = await prisma.feedback.create({
      data: { answerId, rating, comment }
    });
    res.status(201).json(feedback);
  } catch (err) {
    console.error('❌ Error saving feedback:', err);
    res.status(500).json({ error: 'Failed to store feedback' });
  }
});

module.exports = router;