const express = require('express');
const router = express.Router();
const { autofillApplication, aiSubmitApplication, getApplicationsByUser } = require('../Controllers/applicationController');

console.log("✅ POST /:id/autofill route loaded");
router.post('/:id/autofill', autofillApplication);

console.log("✅ POST /applications/ai-submit route loaded");
router.post("/ai-submit", aiSubmitApplication);
router.get('/user/:id', getApplicationsByUser);

module.exports = router;
