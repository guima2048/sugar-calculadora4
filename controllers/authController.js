const Usuario = require('../models/Usuario');

// Login
exports.login = async (req, res) => {
    try {
        const { nome, senha } = req.body;

        // Validar entrada
        if (!nome || !senha) {
            return res.status(400).json({
                success: false,
                error: 'Por favor, forneça nome e senha'
            });
        }

        // Buscar usuário
        const usuario = await Usuario.findOne({ nome }).select('+senha');
        if (!usuario) {
            return res.status(401).json({
                success: false,
                error: 'Credenciais inválidas'
            });
        }

        // Verificar senha
        const senhaCorreta = await usuario.verificarSenha(senha);
        if (!senhaCorreta) {
            return res.status(401).json({
                success: false,
                error: 'Credenciais inválidas'
            });
        }

        // Atualizar último login
        usuario.ultimoLogin = new Date();
        await usuario.save();

        // Gerar token
        const token = usuario.gerarToken();

        res.status(200).json({
            success: true,
            token
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Verificar token
exports.verificarToken = async (req, res, next) => {
    try {
        let token;

        // Verificar se o token existe no header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Não autorizado'
            });
        }

        try {
            // Verificar token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Adicionar usuário à requisição
            req.usuario = await Usuario.findById(decoded.id);
            next();
        } catch (err) {
            return res.status(401).json({
                success: false,
                error: 'Token inválido'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Criar usuário admin inicial (use apenas uma vez)
exports.criarAdmin = async (req, res) => {
    try {
        const adminExists = await Usuario.findOne({ nome: 'admin' });
        if (adminExists) {
            return res.status(400).json({
                success: false,
                error: 'Usuário admin já existe'
            });
        }

        const admin = await Usuario.create({
            nome: 'admin',
            senha: 'admin123', // Altere para uma senha mais segura
            role: 'admin'
        });

        res.status(201).json({
            success: true,
            message: 'Usuário admin criado com sucesso'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}; 