const express = require('express');
const router = express.Router();
const respostasController = require('../controllers/respostasController');

// Rotas da API
router.post('/respostas', respostasController.salvarResposta);
router.get('/respostas', respostasController.obterRespostas);
router.get('/estatisticas', respostasController.obterEstatisticas);

module.exports = router; 