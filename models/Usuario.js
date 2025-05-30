const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UsuarioSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'Nome é obrigatório'],
        unique: true
    },
    senha: {
        type: String,
        required: [true, 'Senha é obrigatória'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['admin'],
        default: 'admin'
    },
    ultimoLogin: {
        type: Date,
        default: null
    },
    criadoEm: {
        type: Date,
        default: Date.now
    }
});

// Criptografar senha antes de salvar
UsuarioSchema.pre('save', async function(next) {
    if (!this.isModified('senha')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
});

// Método para verificar senha
UsuarioSchema.methods.verificarSenha = async function(senhaInformada) {
    return await bcrypt.compare(senhaInformada, this.senha);
};

// Gerar token JWT
UsuarioSchema.methods.gerarToken = function() {
    return jwt.sign(
        { id: this._id, nome: this.nome },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

module.exports = mongoose.model('Usuario', UsuarioSchema); 