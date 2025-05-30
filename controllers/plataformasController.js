const Resposta = require('../models/Resposta');

exports.obterEstatisticasPlataformas = async (req, res) => {
    try {
        // Obter estatísticas gerais das plataformas
        const estatisticasGerais = await Resposta.aggregate([
            {
                $match: {
                    plataformaEscolhida: { $exists: true }
                }
            },
            {
                $group: {
                    _id: '$plataformaEscolhida',
                    cliques: { $sum: 1 },
                    primeiroLugar: {
                        $sum: {
                            $cond: [
                                { $eq: ['$posicaoPlataforma', 1] },
                                1,
                                0
                            ]
                        }
                    },
                    somaValores: { $sum: '$valorEstimado' },
                    somaNota: { $sum: '$notaPlataforma' },
                    totalNotas: {
                        $sum: {
                            $cond: [
                                { $gt: ['$notaPlataforma', 0] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    nome: '$_id',
                    cliques: 1,
                    primeiroLugar: 1,
                    mediaValor: { $divide: ['$somaValores', '$cliques'] },
                    nota: {
                        $cond: [
                            { $gt: ['$totalNotas', 0] },
                            { $divide: ['$somaNota', '$totalNotas'] },
                            0
                        ]
                    }
                }
            }
        ]);

        // Obter crescimento semanal das últimas 4 semanas
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - 28); // 4 semanas atrás

        const crescimentoSemanal = await Resposta.aggregate([
            {
                $match: {
                    plataformaEscolhida: { $exists: true },
                    data: { $gte: dataLimite }
                }
            },
            {
                $group: {
                    _id: {
                        plataforma: '$plataformaEscolhida',
                        semana: {
                            $dateToString: {
                                format: '%Y-%m-%d',
                                date: {
                                    $dateFromParts: {
                                        year: { $year: '$data' },
                                        month: { $month: '$data' },
                                        day: {
                                            $subtract: [
                                                { $dayOfMonth: '$data' },
                                                { $mod: [{ $dayOfMonth: '$data' }, 7] }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    cliques: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.plataforma',
                    crescimentoSemanal: {
                        $push: {
                            semana: '$_id.semana',
                            cliques: '$cliques'
                        }
                    }
                }
            }
        ]);

        // Combinar dados e adicionar selos
        const plataformas = estatisticasGerais.map(plataforma => {
            const crescimento = crescimentoSemanal.find(c => c._id === plataforma.nome);
            
            // Calcular crescimento percentual
            const dadosCrescimento = crescimento?.crescimentoSemanal || [];
            const semanas = dadosCrescimento.sort((a, b) => a.semana.localeCompare(b.semana));
            
            let crescimentoPercentual = 0;
            if (semanas.length >= 2) {
                const ultimaSemana = semanas[semanas.length - 1].cliques;
                const penultimaSemana = semanas[semanas.length - 2].cliques;
                crescimentoPercentual = Math.round(((ultimaSemana - penultimaSemana) / penultimaSemana) * 100);
            }

            // Adicionar eventos simulados (em produção, viriam do banco de dados)
            const crescimentoComEventos = semanas.map(semana => ({
                ...semana,
                eventos: semana.cliques > 100 ? ['Campanha no Instagram'] : []
            }));

            // Determinar selo
            let selo = null;
            if (plataforma.nome === 'Bebaby.app' && plataforma.primeiroLugar > 1000) {
                selo = {
                    icone: '💎',
                    texto: 'Mais Recomendado'
                };
            } else if (plataforma.nome === 'Meu Namoro Exclusivo' && crescimentoPercentual > 50) {
                selo = {
                    icone: '🆕',
                    texto: 'Plataforma em Ascensão'
                };
            }

            return {
                ...plataforma,
                crescimentoSemanal: crescimentoComEventos,
                crescimento: crescimentoPercentual,
                selo
            };
        });

        res.status(200).json({
            success: true,
            data: {
                plataformas
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}; 