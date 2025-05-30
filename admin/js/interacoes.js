document.addEventListener('DOMContentLoaded', () => {
    // Configurações comuns para todos os gráficos
    const chartCommonOptions = {
        chart: {
            background: 'transparent',
            foreColor: '#e0e0e0',
            toolbar: {
                show: false
            }
        },
        theme: {
            mode: 'dark'
        },
        colors: ['#c7a856', '#f9f9f9', '#2a2a2a', '#3a3a3a', '#4a4a4a'],
        legend: {
            position: 'bottom',
            labels: {
                colors: '#e0e0e0'
            }
        }
    };

    // Função para carregar dados
    async function carregarDados() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/estatisticas/interacoes', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Erro ao carregar dados');
            
            const data = await response.json();
            atualizarKPIs(data);
            renderizarGraficos(data);
        } catch (error) {
            console.error('Erro:', error);
            // Usar dados mockados em caso de erro
            usarDadosMockados();
        }
    }

    // Função para usar dados mockados (temporário)
    function usarDadosMockados() {
        const mockData = {
            conclusao: {
                iniciaram: 200,
                concluiram: 150,
                abandonaram: 50,
                tempoMedio: 4.5
            },
            perguntas: {
                basicas: [
                    {
                        pergunta: 'Idade',
                        total: 150,
                        opcoes: {
                            '18-25': 70,
                            '26-35': 50,
                            '36+': 30
                        }
                    },
                    {
                        pergunta: 'Disponibilidade para Viagens',
                        total: 145,
                        opcoes: {
                            'Sim': 80,
                            'Às vezes': 45,
                            'Não': 20
                        }
                    },
                    {
                        pergunta: 'Cuidados com Aparência',
                        total: 140,
                        opcoes: {
                            'Sim': 90,
                            'Mediano': 40,
                            'Não muito': 10
                        }
                    }
                ],
                avancadas: [
                    {
                        pergunta: 'Nível de Escolaridade',
                        total: 100,
                        opcoes: {
                            'Superior': 60,
                            'Médio': 30,
                            'Não': 10
                        }
                    },
                    {
                        pergunta: 'Situação Profissional',
                        total: 95,
                        opcoes: {
                            'Sim': 45,
                            'Parcial': 35,
                            'Não': 15
                        }
                    }
                ]
            },
            plataformas: {
                clicks: {
                    'Bebaby.app': 80,
                    'Meu Patrocínio': 60,
                    'Meu Namoro Exclusivo': 40,
                    'Sugar Daddy Meet': 30,
                    'Elite Meet': 20
                },
                cidades: {
                    'Bebaby.app': ['São Paulo', 'Rio de Janeiro', 'Curitiba'],
                    'Meu Patrocínio': ['Rio de Janeiro', 'Belo Horizonte', 'Salvador'],
                    'Meu Namoro Exclusivo': ['São Paulo', 'Brasília', 'Fortaleza']
                }
            }
        };

        atualizarKPIs(mockData);
        renderizarGraficos(mockData);
    }

    // Função para atualizar KPIs
    function atualizarKPIs(data) {
        document.getElementById('totalUsuarios').textContent = data.conclusao.iniciaram.toLocaleString();
        document.getElementById('usuariosConcluiram').textContent = data.conclusao.concluiram.toLocaleString();
        document.getElementById('usuariosAbandonaram').textContent = data.conclusao.abandonaram.toLocaleString();
        document.getElementById('tempoMedio').textContent = `${data.conclusao.tempoMedio}min`;
    }

    // Função para renderizar gráficos
    function renderizarGraficos(data) {
        // Taxa de Conclusão
        const taxaConclusaoChart = new ApexCharts(document.querySelector('#taxaConclusaoChart'), {
            ...chartCommonOptions,
            series: [data.conclusao.concluiram, data.conclusao.abandonaram],
            chart: {
                ...chartCommonOptions.chart,
                type: 'donut',
                height: 300
            },
            labels: ['Concluíram', 'Abandonaram'],
            colors: ['#4CAF50', '#f44336'],
            plotOptions: {
                pie: {
                    donut: {
                        size: '70%'
                    }
                }
            }
        });
        taxaConclusaoChart.render();

        // Função para criar gráfico de perguntas
        function createQuestionChart(perguntasData, containerId) {
            const container = document.getElementById(containerId);
            container.innerHTML = '';

            perguntasData.forEach(pergunta => {
                const chartDiv = document.createElement('div');
                chartDiv.className = 'question-chart mb-4';
                container.appendChild(chartDiv);

                const title = document.createElement('h4');
                title.className = 'question-title mb-3';
                title.textContent = `${pergunta.pergunta} (${pergunta.total} respostas)`;
                chartDiv.appendChild(title);

                const graphDiv = document.createElement('div');
                chartDiv.appendChild(graphDiv);

                const chart = new ApexCharts(graphDiv, {
                    ...chartCommonOptions,
                    series: [{
                        name: 'Respostas',
                        data: Object.values(pergunta.opcoes)
                    }],
                    chart: {
                        ...chartCommonOptions.chart,
                        type: 'bar',
                        height: 200
                    },
                    xaxis: {
                        categories: Object.keys(pergunta.opcoes),
                        labels: {
                            style: {
                                colors: '#e0e0e0'
                            }
                        }
                    },
                    plotOptions: {
                        bar: {
                            borderRadius: 4,
                            horizontal: true,
                            distributed: true
                        }
                    }
                });
                chart.render();
            });
        }

        // Criar gráficos de perguntas
        createQuestionChart(data.perguntas.basicas, 'perguntasBasicasGrid');
        createQuestionChart(data.perguntas.avancadas, 'perguntasAvancadasGrid');

        // Plataformas Mais Clicadas
        const plataformasChart = new ApexCharts(document.querySelector('#plataformasChart'), {
            ...chartCommonOptions,
            series: [{
                name: 'Cliques',
                data: Object.values(data.plataformas.clicks)
            }],
            chart: {
                ...chartCommonOptions.chart,
                type: 'bar',
                height: 300
            },
            xaxis: {
                categories: Object.keys(data.plataformas.clicks),
                labels: {
                    style: {
                        colors: '#e0e0e0'
                    }
                }
            },
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    columnWidth: '60%'
                }
            }
        });
        plataformasChart.render();

        // Cidades por Plataforma
        const cidadesPlataformasDiv = document.getElementById('cidadesPlataformasChart');
        cidadesPlataformasDiv.innerHTML = Object.entries(data.plataformas.cidades)
            .map(([plataforma, cidades]) => `
                <div class="plataforma-cidades mb-3">
                    <h5>${plataforma}</h5>
                    <div class="cidades-list">
                        ${cidades.map(cidade => `
                            <span class="cidade-badge">
                                <i class="fas fa-map-marker-alt"></i>
                                ${cidade}
                            </span>
                        `).join('')}
                    </div>
                </div>
            `).join('');
    }

    // Inicialização
    carregarDados();
}); 