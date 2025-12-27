const express = require('express');
const router = express.Router();
const serverController = require('../controllers/serverController');

// router.get('/:iloip', serverController.getilodata);

router.get('/servers', serverController.getServers);
router.post('/servers', serverController.addServer);
router.post('/servers/:id/:action', serverController.controlServer);  // e.g., /servers/:id/reboot
router.get('/servers/:id/status', serverController.getIloStatus);  // e.g., /servers/:id/status

module.exports = router;
