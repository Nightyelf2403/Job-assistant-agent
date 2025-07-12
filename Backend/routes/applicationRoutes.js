const express = require('express');
const router = express.Router();
const { autofillApplication } = require('../controllers/applicationController');
const { aiSubmitApplication } = require('../controllers/applicationController');

router.post('/:id/autofill', autofillApplication);
router.post("/ai-submit", aiSubmitApplication);

module.exports = router;
