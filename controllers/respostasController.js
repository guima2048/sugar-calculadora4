const Resposta = require('../models/Resposta');
const DataService = require('../services/dataService');
const respostasService = new DataService('respostas.json');

// Salvar nova resposta
exports.salvarResposta = async (req, res) => {
    try {
        const resposta = new Resposta(req.body);
        resposta.validate();
        const savedResposta = await respostasService.create(resposta.toJSON());
        
        res.status(201).json({
            success: true,
            data: savedResposta
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Obter todas as respostas
exports.obterRespostas = async (req, res) => {
    try {
        const respostas = await respostasService.findAll();
        res.status(200).json({
            success: true,
            data: respostas
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Obter estatísticas gerais
exports.obterEstatisticas = async (req, res) => {
    try {
        const respostas = await respostasService.findAll();
        
        // Calcular estatísticas
        const totalUsuarios = respostas.length;
        
        // Cidades mais usadas
        const cidadesCount = {};
        respostas.forEach(r => {
            const key = `${r.cidade}-${r.estado}`;
            cidadesCount[key] = (cidadesCount[key] || 0) + 1;
        });
        const cidadesMaisUsadas = Object.entries(cidadesCount)
            .map(([key, total]) => {
                const [cidade, estado] = key.split('-');
                return { cidade, estado, total };
            })
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        // Idades mais comuns
        const idadesCount = {};
        respostas.forEach(r => {
            const idade = r.respostas?.idade;
            if (idade) idadesCount[idade] = (idadesCount[idade] || 0) + 1;
        });
        const idadesMaisComuns = Object.entries(idadesCount)
            .map(([idade, total]) => ({ idade, total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);

        // Plataformas mais clicadas
        const plataformasCount = {};
        respostas.forEach(r => {
            if (r.plataformaEscolhida) {
                plataformasCount[r.plataformaEscolhida] = (plataformasCount[r.plataformaEscolhida] || 0) + 1;
            }
        });
        const plataformasMaisClicadas = Object.entries(plataformasCount)
            .map(([plataforma, total]) => ({ plataforma, total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);

        res.status(200).json({
            success: true,
            data: {
                totalUsuarios,
                cidadesMaisUsadas,
                idadesMaisComuns,
                plataformasMaisClicadas
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Obter dados para relatório
exports.obterDadosRelatorio = async (req, res) => {
    try {
        const { dataInicio, dataFim, cidade, plataforma } = req.query;
        
        let query = {};
        
        // Aplicar filtros
        if (dataInicio && dataFim) {
            query.data = {
                $gte: new Date(dataInicio),
                $lte: new Date(dataFim)
            };
        }
        
        if (cidade) {
            query.cidade = cidade;
        }
        
        if (plataforma) {
            query.plataformaEscolhida = plataforma;
        }

        const [
            respostas,
            estatisticasGerais,
            mediasValores
        ] = await Promise.all([
            Resposta.find(query).sort('-data').limit(100),
            Resposta.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: null,
                        totalRespostas: { $sum: 1 },
                        mediaValor: { $avg: "$valorEstimado" },
                        mediaTempo: { $avg: "$tempoPrenchimento" }
                    }
                }
            ]),
            Resposta.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: "$cidade",
                        mediaValor: { $avg: "$valorEstimado" },
                        totalRespostas: { $sum: 1 }
                    }
                },
                { $sort: { totalRespostas: -1 } },
                { $limit: 10 }
            ])
        ]);

        res.status(200).json({
            success: true,
            data: {
                respostas,
                estatisticasGerais: estatisticasGerais[0],
                mediasValores
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Obter estatísticas por cidade
exports.obterEstatisticasCidades = async (req, res) => {
    try {
        const { pagina = 1, limite = 10 } = req.query;
        const skip = (pagina - 1) * limite;

        const [estatisticasCidades, total] = await Promise.all([
            Resposta.aggregate([
                // Agrupar por cidade e estado
                {
                    $group: {
                        _id: { cidade: "$cidade", estado: "$estado" },
                        acessos: { $sum: 1 },
                        completos: {
                            $sum: {
                                $cond: [
                                    { $gt: ["$tempoPrenchimento", 0] },
                                    1,
                                    0
                                ]
                            }
                        },
                        valorTotal: { $sum: "$valorEstimado" },
                        plataformas: {
                            $push: "$plataformaEscolhida"
                        }
                    }
                },
                // Calcular métricas adicionais
                {
                    $project: {
                        _id: 0,
                        cidade: "$_id.cidade",
                        estado: "$_id.estado",
                        acessos: 1,
                        completos: 1,
                        abandono: {
                            $multiply: [
                                {
                                    $subtract: [
                                        1,
                                        { $divide: ["$completos", "$acessos"] }
                                    ]
                                },
                                100
                            ]
                        },
                        valorMedio: { $divide: ["$valorTotal", "$completos"] },
                        plataformaPrincipal: {
                            $let: {
                                vars: {
                                    plataformaCount: {
                                        $reduce: {
                                            input: "$plataformas",
                                            initialValue: {},
                                            in: {
                                                $mergeObjects: [
                                                    "$$value",
                                                    {
                                                        $literal: {
                                                            $concat: [
                                                                "$$this",
                                                                ": ",
                                                                { $toString: { $add: [ { $ifNull: [ { $toInt: { $substr: [ { $ifNull: [ { $arrayElemAt: [ { $split: [ "$$value", ": " ] }, 1 ] }, "0" ] }, 0, -1 ] } }, 0 ] }, 1 ] } }
                                                            ]
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                },
                                in: {
                                    $arrayElemAt: [
                                        { $split: [
                                            { $arrayElemAt: [
                                                { $filter: {
                                                    input: { $objectToArray: "$$plataformaCount" },
                                                    as: "item",
                                                    cond: {
                                                        $eq: [
                                                            "$$item.v",
                                                            { $max: { $objectToArray: "$$plataformaCount" }.v }
                                                        ]
                                                    }
                                                }},
                                                0
                                            ]}.k,
                                            ": "
                                        ]},
                                        0
                                    ]
                                }
                            }
                        }
                    }
                },
                // Ordenar por acessos (padrão)
                { $sort: { acessos: -1 } },
                // Paginação
                { $skip: skip },
                { $limit: parseInt(limite) }
            ]),
            Resposta.aggregate([
                {
                    $group: {
                        _id: { cidade: "$cidade", estado: "$estado" }
                    }
                },
                { $count: "total" }
            ])
        ]);

        res.status(200).json({
            success: true,
            data: estatisticasCidades,
            total: total[0]?.total || 0,
            pagina: parseInt(pagina),
            limite: parseInt(limite)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Obter estatísticas das perguntas
exports.obterEstatisticasPerguntas = async (req, res) => {
    try {
        const estatisticasPerguntas = await Resposta.aggregate([
            // Descompactar array de respostas
            {
                $project: {
                    respostas: {
                        $objectToArray: "$respostas"
                    },
                    valorEstimado: 1
                }
            },
            // Descompactar cada resposta
            { $unwind: "$respostas" },
            // Agrupar por pergunta
            {
                $group: {
                    _id: "$respostas.k",
                    totalRespostas: { $sum: 1 },
                    respostasPreenchidas: {
                        $sum: {
                            $cond: [
                                { $ne: ["$respostas.v", ""] },
                                1,
                                0
                            ]
                        }
                    },
                    impactoTotal: { $sum: "$valorEstimado" }
                }
            },
            // Calcular métricas
            {
                $project: {
                    pergunta: "$_id",
                    totalRespostas: 1,
                    respostasPreenchidas: 1,
                    abandono: {
                        $multiply: [
                            {
                                $subtract: [
                                    1,
                                    { $divide: ["$respostasPreenchidas", "$totalRespostas"] }
                                ]
                            },
                            100
                        ]
                    },
                    impactoMedio: {
                        $divide: ["$impactoTotal", "$respostasPreenchidas"]
                    },
                    tipo: {
                        $cond: {
                            if: {
                                $in: [
                                    "$_id",
                                    [
                                        "idade",
                                        "escolaridade",
                                        "disponibilidadeViagens",
                                        "cuidadosAparencia"
                                    ]
                                ]
                            },
                            then: "SIMPLES",
                            else: "AVANCADA"
                        }
                    }
                }
            },
            // Ordenar por impacto médio
            { $sort: { impactoMedio: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: estatisticasPerguntas
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.obterUsuarios = async (req, res) => {
    try {
        const usuarios = await Resposta.aggregate([
            {
                $project: {
                    id: '$_id',
                    cidade: 1,
                    dataRegistro: '$createdAt',
                    ultimoAcesso: '$updatedAt',
                    plataforma: '$plataformaEscolhida',
                    status: {
                        $cond: [
                            { $eq: ['$status', 'concluido'] },
                            'Ativo',
                            'Pendente'
                        ]
                    }
                }
            },
            {
                $sort: {
                    dataRegistro: -1
                }
            }
        ]);

        // Calcular estatísticas
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const usuariosAtivos = usuarios.filter(u => 
            u.status === 'Ativo' && 
            new Date(u.ultimoAcesso) >= hoje
        ).length;

        const crescimento = await Resposta.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$createdAt'
                        }
                    },
                    total: { $sum: 1 }
                }
            },
            {
                $sort: {
                    _id: -1
                }
            },
            {
                $limit: 2
            }
        ]);

        let taxaCrescimento = 0;
        if (crescimento.length === 2) {
            const ontem = crescimento[1].total;
            const hoje = crescimento[0].total;
            taxaCrescimento = ontem ? Math.round(((hoje - ontem) / ontem) * 100) : 0;
        }

        // Calcular tempo médio
        const tempoMedio = await Resposta.aggregate([
            {
                $group: {
                    _id: null,
                    media: { $avg: '$tempoTotal' }
                }
            }
        ]);

        // Estatísticas por cidade
        const porCidade = await Resposta.aggregate([
            {
                $group: {
                    _id: '$cidade',
                    total: { $sum: 1 }
                }
            },
            {
                $sort: {
                    total: -1
                }
            },
            {
                $limit: 10
            }
        ]);

        // Crescimento diário dos últimos 7 dias
        const semanaPassada = new Date();
        semanaPassada.setDate(semanaPassada.getDate() - 7);

        const crescimentoDiario = await Resposta.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: semanaPassada
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$createdAt'
                        }
                    },
                    usuarios: { $sum: 1 }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ]);

        const estatisticas = {
            total: usuarios.length,
            ativos: usuariosAtivos,
            crescimento: taxaCrescimento,
            tempoMedio: tempoMedio[0]?.media?.toFixed(1) || 0,
            porCidade: porCidade.reduce((acc, curr) => {
                acc[curr._id] = curr.total;
                return acc;
            }, {}),
            crescimentoDiario: crescimentoDiario.map(d => ({
                data: d._id,
                usuarios: d.usuarios
            }))
        };

        res.status(200).json({
            success: true,
            usuarios,
            estatisticas
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}; 