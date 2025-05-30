const Resposta = require('../models/Resposta');
const Trafego = require('../models/Trafego');

exports.obterEstatisticasComportamento = async (req, res) => {
    try {
        // Obter dados do funil
        const [
            visitasIniciais,
            iniciaramPreenchimento,
            chegaramAvancadas,
            finalizaramCalculo,
            clicaramPlataforma
        ] = await Promise.all([
            Trafego.countDocuments(),
            Resposta.countDocuments({ 'respostas.idade': { $exists: true } }),
            Resposta.countDocuments({ 'respostas.rendaMensal': { $exists: true } }),
            Resposta.countDocuments({ valorEstimado: { $exists: true } }),
            Resposta.countDocuments({ plataformaEscolhida: { $exists: true } })
        ]);

        // Calcular percentuais do funil
        const funil = [
            {
                nome: 'Visitou a página inicial',
                quantidade: visitasIniciais,
                percentual: 100
            },
            {
                nome: 'Começou a preencher',
                quantidade: iniciaramPreenchimento,
                percentual: Math.round((iniciaramPreenchimento / visitasIniciais) * 100)
            },
            {
                nome: 'Chegou nas perguntas avançadas',
                quantidade: chegaramAvancadas,
                percentual: Math.round((chegaramAvancadas / visitasIniciais) * 100)
            },
            {
                nome: 'Finalizou o cálculo',
                quantidade: finalizaramCalculo,
                percentual: Math.round((finalizaramCalculo / visitasIniciais) * 100)
            },
            {
                nome: 'Clicou em plataforma',
                quantidade: clicaramPlataforma,
                percentual: Math.round((clicaramPlataforma / visitasIniciais) * 100)
            }
        ];

        // Obter tempo médio
        const [tempoMedio] = await Trafego.aggregate([
            {
                $group: {
                    _id: {
                        $cond: [
                            { $gt: ['$duracao', 0] },
                            'completaram',
                            'abandonaram'
                        ]
                    },
                    tempoMedio: { $avg: '$duracao' }
                }
            }
        ]);

        // Obter pergunta com maior taxa de abandono
        const perguntasAbandono = await Resposta.aggregate([
            // Descompactar array de respostas
            {
                $project: {
                    respostas: { $objectToArray: '$respostas' }
                }
            },
            // Descompactar cada resposta
            { $unwind: '$respostas' },
            // Agrupar por pergunta
            {
                $group: {
                    _id: '$respostas.k',
                    totalVisitas: { $sum: 1 },
                    totalAbandonos: {
                        $sum: {
                            $cond: [
                                { $eq: ['$respostas.v', ''] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            // Calcular taxa de abandono
            {
                $project: {
                    pergunta: '$_id',
                    totalVisitas: 1,
                    totalAbandonos: 1,
                    taxaAbandono: {
                        $multiply: [
                            {
                                $divide: ['$totalAbandonos', '$totalVisitas']
                            },
                            100
                        ]
                    },
                    tipo: {
                        $cond: {
                            if: {
                                $in: [
                                    '$_id',
                                    [
                                        'idade',
                                        'escolaridade',
                                        'disponibilidadeViagens',
                                        'cuidadosAparencia'
                                    ]
                                ]
                            },
                            then: 'SIMPLES',
                            else: 'AVANCADA'
                        }
                    }
                }
            },
            // Ordenar por taxa de abandono
            { $sort: { taxaAbandono: -1 } },
            // Pegar a primeira
            { $limit: 1 }
        ]);

        // Obter estatísticas de cliques nas plataformas
        const plataformasStats = await Resposta.aggregate([
            {
                $match: {
                    plataformaEscolhida: { $exists: true }
                }
            },
            {
                $group: {
                    _id: '$plataformaEscolhida',
                    cliques: { $sum: 1 }
                }
            },
            {
                $project: {
                    nome: '$_id',
                    cliques: 1,
                    percentual: {
                        $multiply: [
                            { $divide: ['$cliques', clicaramPlataforma] },
                            100
                        ]
                    },
                    // Simulando tendência (em produção, comparar com mês anterior)
                    tendencia: {
                        $subtract: [
                            { $multiply: [{ $rand: {} }, 20] },
                            10
                        ]
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                funil,
                tempoMedio: {
                    completaram: tempoMedio.find(t => t._id === 'completaram')?.tempoMedio || 0,
                    abandonaram: tempoMedio.find(t => t._id === 'abandonaram')?.tempoMedio || 0
                },
                maiorAbandono: perguntasAbandono[0],
                plataformas: plataformasStats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}; 