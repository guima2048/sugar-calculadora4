const Resposta = require('../models/Resposta');

exports.obterEstatisticasInteracoes = async (req, res) => {
    try {
        // Obter dados de conclusão
        const conclusao = await Resposta.aggregate([
            {
                $group: {
                    _id: null,
                    iniciaram: { $sum: 1 },
                    concluiram: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'concluido'] }, 1, 0]
                        }
                    },
                    tempoTotal: { $sum: '$tempoTotal' }
                }
            }
        ]);

        // Obter dados de perguntas básicas
        const perguntasBasicas = await Resposta.aggregate([
            {
                $group: {
                    _id: '$perguntasBasicas.pergunta',
                    total: { $sum: 1 },
                    opcoes: {
                        $push: '$perguntasBasicas.resposta'
                    }
                }
            }
        ]);

        // Obter dados de perguntas avançadas
        const perguntasAvancadas = await Resposta.aggregate([
            {
                $group: {
                    _id: '$perguntasAvancadas.pergunta',
                    total: { $sum: 1 },
                    opcoes: {
                        $push: '$perguntasAvancadas.resposta'
                    }
                }
            }
        ]);

        // Obter dados de plataformas
        const plataformas = await Resposta.aggregate([
            {
                $group: {
                    _id: '$plataformaEscolhida',
                    clicks: { $sum: 1 },
                    cidades: { $addToSet: '$cidade' }
                }
            }
        ]);

        // Processar dados de conclusão
        const dadosConclusao = conclusao[0] || {
            iniciaram: 0,
            concluiram: 0,
            tempoTotal: 0
        };

        const estatisticas = {
            conclusao: {
                iniciaram: dadosConclusao.iniciaram,
                concluiram: dadosConclusao.concluiram,
                abandonaram: dadosConclusao.iniciaram - dadosConclusao.concluiram,
                tempoMedio: dadosConclusao.iniciaram ? 
                    (dadosConclusao.tempoTotal / dadosConclusao.iniciaram).toFixed(1) : 0
            },
            perguntas: {
                basicas: perguntasBasicas.map(p => ({
                    pergunta: p._id,
                    total: p.total,
                    opcoes: p.opcoes.reduce((acc, curr) => {
                        acc[curr] = (acc[curr] || 0) + 1;
                        return acc;
                    }, {})
                })),
                avancadas: perguntasAvancadas.map(p => ({
                    pergunta: p._id,
                    total: p.total,
                    opcoes: p.opcoes.reduce((acc, curr) => {
                        acc[curr] = (acc[curr] || 0) + 1;
                        return acc;
                    }, {})
                }))
            },
            plataformas: {
                clicks: plataformas.reduce((acc, p) => {
                    acc[p._id] = p.clicks;
                    return acc;
                }, {}),
                cidades: plataformas.reduce((acc, p) => {
                    acc[p._id] = p.cidades.slice(0, 3); // Top 3 cidades
                    return acc;
                }, {})
            }
        };

        res.status(200).json({
            success: true,
            data: estatisticas
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}; 