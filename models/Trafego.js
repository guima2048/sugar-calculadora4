const mongoose = require('mongoose');

const TrafegoSchema = new mongoose.Schema({
    ip: {
        type: String,
        required: true
    },
    pagina: {
        type: String,
        required: true
    },
    origem: {
        type: String,
        default: 'direct'
    },
    duracao: {
        type: Number, // em segundos
        default: 0
    },
    userAgent: String,
    data: {
        type: Date,
        default: Date.now
    },
    cidade: String,
    estado: String,
    pais: String,
    dispositivo: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet'],
        required: true
    }
});

// Índices para análise de tráfego
TrafegoSchema.index({ data: -1 });
TrafegoSchema.index({ pagina: 1 });
TrafegoSchema.index({ origem: 1 });
TrafegoSchema.index({ cidade: 1, estado: 1 });

module.exports = mongoose.model('Trafego', TrafegoSchema); 