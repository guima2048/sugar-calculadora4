const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    login,
    getMe,
    getStats,
    getInteractions,
    getRankingCidades,
    getComparativePlataformas
} = require('../controllers/admin');

// Auth routes
router.post('/login', login);
router.get('/me', protect, getMe);

// Stats routes
router.get('/stats', protect, getStats);
router.get('/interactions', protect, getInteractions);
router.get('/ranking-cidades', protect, getRankingCidades);
router.get('/comparativo-plataformas', protect, getComparativePlataformas);

module.exports = router; 