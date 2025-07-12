const express = require('express');
const router = express.Router();
const { autofillApplication } = require('../controllers/applicationController');
const { aiSubmitApplication } = require('../controllers/applicationController');

console.log("✅ POST /:id/autofill route loaded");
router.post('/:id/autofill', autofillApplication);

console.log("✅ POST /applications/ai-submit route loaded");
router.post("/ai-submit", aiSubmitApplication);

module.exports = router;
