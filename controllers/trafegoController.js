const Trafego = require('../models/Trafego');

// Registrar novo acesso
exports.registrarAcesso = async (req, res) => {
    try {
        // Detectar dispositivo baseado no user agent
        const userAgent = req.headers['user-agent'].toLowerCase();
        let dispositivo = 'desktop';
        
        if (/(android|webos|iphone|ipad|ipod|blackberry|windows phone)/i.test(userAgent)) {
            dispositivo = /ipad/i.test(userAgent) ? 'tablet' : 'mobile';
        }

        const acesso = await Trafego.create({
            ip: req.ip,
            pagina: req.body.pagina,
            origem: req.headers.referer || 'direct',
            userAgent: req.headers['user-agent'],
            dispositivo,
            ...req.body // Permite adicionar cidade, estado, etc. se disponíveis
        });

        res.status(201).json({
            success: true,
            data: acesso
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Atualizar duração da visita
exports.atualizarDuracao = async (req, res) => {
    try {
        const { id, duracao } = req.body;
        
        const acesso = await Trafego.findByIdAndUpdate(
            id,
            { duracao },
            { new: true }
        );

        if (!acesso) {
            return res.status(404).json({
                success: false,
                error: 'Acesso não encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: acesso
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Obter estatísticas de tráfego
exports.obterEstatisticas = async (req, res) => {
    try {
        const { dataInicio, dataFim } = req.query;
        
        let query = {};
        if (dataInicio && dataFim) {
            query.data = {
                $gte: new Date(dataInicio),
                $lte: new Date(dataFim)
            };
        }

        const [
            totalVisitas,
            visitasPorPagina,
            origemTrafego,
            dispositivosUsados,
            tempoMedioPorPagina
        ] = await Promise.all([
            Trafego.countDocuments(query),
            Trafego.aggregate([
                { $match: query },
                { $group: { _id: "$pagina", total: { $sum: 1 } } },
                { $sort: { total: -1 } }
            ]),
            Trafego.aggregate([
                { $match: query },
                { $group: { _id: "$origem", total: { $sum: 1 } } },
                { $sort: { total: -1 } }
            ]),
            Trafego.aggregate([
                { $match: query },
                { $group: { _id: "$dispositivo", total: { $sum: 1 } } }
            ]),
            Trafego.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: "$pagina",
                        mediaDuracao: { $avg: "$duracao" },
                        totalVisitas: { $sum: 1 }
                    }
                }
            ])
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalVisitas,
                visitasPorPagina,
                origemTrafego,
                dispositivosUsados,
                tempoMedioPorPagina
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}; 