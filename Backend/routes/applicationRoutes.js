const express = require('express');
const router = express.Router();
const { autofillApplication } = require('../controllers/applicationController');

router.post('/:id/autofill', autofillApplication);

module.exports = router;