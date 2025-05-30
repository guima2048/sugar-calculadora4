const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const store = require('../models/JsonStore');

// @desc    Login admin
// @route   POST /api/admin/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Get users from store
        const users = await store.getData('users');
        const user = users.find(u => u.username === username);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                success: false,
                error: 'Credenciais inválidas'
            });
        }

        // Create token
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            token
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({
            success: false,
            error: 'Erro no servidor'
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/admin/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                id: req.user.id,
                username: req.user.username,
                role: req.user.role
            }
        });
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({
            success: false,
            error: 'Erro no servidor'
        });
    }
};

// @desc    Get statistics
// @route   GET /api/admin/stats
// @access  Private
exports.getStats = async (req, res) => {
    try {
        const stats = await store.getData('stats');
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Erro no servidor'
        });
    }
};

// @desc    Get interactions
// @route   GET /api/admin/interactions
// @access  Private
exports.getInteractions = async (req, res) => {
    try {
        const interactions = await store.getData('interactions');
        res.json({
            success: true,
            data: interactions
        });
    } catch (error) {
        console.error('Erro ao buscar interações:', error);
        res.status(500).json({
            success: false,
            error: 'Erro no servidor'
        });
    }
};

// @desc    Get cities ranking
// @route   GET /api/admin/ranking-cidades
// @access  Private
exports.getRankingCidades = async (req, res) => {
    try {
        const stats = await store.getData('stats');
        const rankingCidades = stats.rankingCidades || [];
        
        res.json({
            success: true,
            data: rankingCidades
        });
    } catch (error) {
        console.error('Erro ao buscar ranking de cidades:', error);
        res.status(500).json({
            success: false,
            error: 'Erro no servidor'
        });
    }
};

// @desc    Get platforms comparison
// @route   GET /api/admin/comparativo-plataformas
// @access  Private
exports.getComparativePlataformas = async (req, res) => {
    try {
        const stats = await store.getData('stats');
        const comparativo = stats.comparativoPlataformas || [];
        
        res.json({
            success: true,
            data: comparativo
        });
    } catch (error) {
        console.error('Erro ao buscar comparativo de plataformas:', error);
        res.status(500).json({
            success: false,
            error: 'Erro no servidor'
        });
    }
}; 