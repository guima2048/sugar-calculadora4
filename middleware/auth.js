const jwt = require('jsonwebtoken');
const store = require('../models/JsonStore');

exports.protect = async (req, res, next) => {
    try {
        let token;

        // Get token from header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Não autorizado para acessar esta rota'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from store
            const users = await store.getData('users');
            const user = users.find(u => u.id === decoded.id);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Usuário não encontrado'
                });
            }

            req.user = user;
            next();
        } catch (err) {
            return res.status(401).json({
                success: false,
                error: 'Token inválido'
            });
        }
    } catch (error) {
        console.error('Erro no middleware de autenticação:', error);
        res.status(500).json({
            success: false,
            error: 'Erro no servidor'
        });
    }
}; 