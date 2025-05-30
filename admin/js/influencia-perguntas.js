document.addEventListener('DOMContentLoaded', () => {
    let currentSort = { field: 'impacto', direction: 'desc' };
    let allData = [];

    // Configuração dos tipos de perguntas
    const TIPOS_PERGUNTAS = {
        SIMPLES: {
            nome: 'Simples',
            cor: '#4CAF50',
            badge: 'success'
        },
        AVANCADA: {
            nome: 'Avançada',
            cor: '#c7a856',
            badge: 'warning'
        }
    };

    // Função para carregar dados do servidor
    async function carregarDados() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/estatisticas/perguntas', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Erro ao carregar dados');
            
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Erro:', error);
            return [];
        }
    }

    // Função para formatar valor monetário
    function formatarValor(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    }

    // Função para renderizar a tabela
    function renderizarTabela(dados) {
        const tbody = document.getElementById('perguntasTableBody');
        tbody.innerHTML = dados.map(pergunta => `
            <tr>
                <td>
                    ${pergunta.abandono > 30 ? '<i class="fas fa-exclamation-triangle text-warning me-2"></i>' : ''}
                    ${pergunta.pergunta}
                </td>
                <td>
                    <span class="badge bg-${TIPOS_PERGUNTAS[pergunta.tipo].badge}">
                        ${TIPOS_PERGUNTAS[pergunta.tipo].nome}
                    </span>
                </td>
                <td class="${getImpactoClass(pergunta.impactoMedio)}">
                    ${formatarValor(pergunta.impactoMedio)}
                </td>
                <td>${pergunta.totalRespostas.toLocaleString()}</td>
                <td>
                    <span class="${pergunta.abandono > 30 ? 'text-danger' : ''}">
                        ${pergunta.abandono.toFixed(1)}%
                    </span>
                </td>
            </tr>
        `).join('');
    }

    // Função para renderizar o gráfico de bolhas
    function renderizarGraficoBolhas(dados) {
        const series = Object.keys(TIPOS_PERGUNTAS).map(tipo => ({
            name: TIPOS_PERGUNTAS[tipo].nome,
            data: dados.filter(p => p.tipo === tipo).map(pergunta => ({
                x: pergunta.totalRespostas,
                y: pergunta.impactoMedio,
                z: pergunta.impactoMedio / 100,
                name: pergunta.pergunta
            }))
        }));

        const options = {
            series,
            chart: {
                type: 'bubble',
                height: 400,
                background: 'transparent',
                foreColor: '#e0e0e0'
            },
            colors: Object.values(TIPOS_PERGUNTAS).map(t => t.cor),
            dataLabels: {
                enabled: false
            },
            xaxis: {
                title: {
                    text: 'Total de Respostas',
                    style: {
                        color: '#e0e0e0'
                    }
                },
                labels: {
                    style: {
                        colors: '#e0e0e0'
                    }
                }
            },
            yaxis: {
                title: {
                    text: 'Impacto Médio (R$)',
                    style: {
                        color: '#e0e0e0'
                    }
                },
                labels: {
                    style: {
                        colors: '#e0e0e0'
                    },
                    formatter: value => formatarValor(value)
                }
            },
            tooltip: {
                theme: 'dark',
                custom: function({ series, seriesIndex, dataPointIndex, w }) {
                    const data = w.config.series[seriesIndex].data[dataPointIndex];
                    return `
                        <div class="bubble-tooltip">
                            <strong>${data.name}</strong><br>
                            Respostas: ${data.x.toLocaleString()}<br>
                            Impacto: ${formatarValor(data.y)}
                        </div>
                    `;
                }
            }
        };

        const chart = new ApexCharts(document.querySelector('#graficoBolhas'), options);
        chart.render();
    }

    // Função para renderizar perguntas ignoradas
    function renderizarPerguntasIgnoradas(dados) {
        const perguntasIgnoradas = dados.filter(p => p.abandono > 30);
        const container = document.getElementById('perguntasIgnoradas');
        const count = document.getElementById('perguntasCriticasCount');

        count.textContent = perguntasIgnoradas.length;
        
        container.innerHTML = perguntasIgnoradas.map(pergunta => `
            <div class="pergunta-ignorada-item">
                <div class="pergunta-header">
                    <span class="badge bg-${TIPOS_PERGUNTAS[pergunta.tipo].badge} me-2">
                        ${TIPOS_PERGUNTAS[pergunta.tipo].nome}
                    </span>
                    <strong>${pergunta.pergunta}</strong>
                </div>
                <div class="pergunta-stats">
                    <span class="stat-item">
                        <i class="fas fa-times-circle text-danger"></i>
                        ${pergunta.abandono.toFixed(1)}% de abandono
                    </span>
                    <span class="stat-item">
                        <i class="fas fa-chart-line"></i>
                        ${formatarValor(pergunta.impactoMedio)} de impacto médio
                    </span>
                </div>
                <div class="pergunta-insight">
                    ${gerarInsightPergunta(pergunta)}
                </div>
            </div>
        `).join('');
    }

    // Função para gerar insights
    function gerarInsightPergunta(pergunta) {
        const insights = [];

        if (pergunta.abandono > 50) {
            insights.push('Alta taxa de desistência, considere reformular a pergunta');
        } else if (pergunta.abandono > 30) {
            insights.push('Taxa de abandono significativa, avaliar clareza da pergunta');
        }

        if (pergunta.impactoMedio > 2000) {
            insights.push('Alto impacto no valor final, manter mas monitorar abandono');
        }

        if (pergunta.tipo === 'AVANCADA' && pergunta.abandono > 40) {
            insights.push('Pergunta avançada com alto abandono, considerar simplificar');
        }

        return insights.map(insight => `
            <div class="insight-item">
                <i class="fas fa-lightbulb text-warning"></i>
                ${insight}
            </div>
        `).join('');
    }

    // Função para determinar classe de impacto
    function getImpactoClass(valor) {
        if (valor >= 2000) return 'impacto-alto';
        if (valor >= 1000) return 'impacto-medio';
        return 'impacto-baixo';
    }

    // Função para ordenar dados
    function ordenarDados(dados, campo, direcao) {
        return [...dados].sort((a, b) => {
            let valorA = a[campo];
            let valorB = b[campo];
            
            if (typeof valorA === 'string') {
                valorA = valorA.toLowerCase();
                valorB = valorB.toLowerCase();
            }
            
            if (direcao === 'asc') {
                return valorA > valorB ? 1 : -1;
            } else {
                return valorA < valorB ? 1 : -1;
            }
        });
    }

    // Event Listeners
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const campo = th.dataset.sort;
            
            // Atualizar direção da ordenação
            if (currentSort.field === campo) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort = { field: campo, direction: 'asc' };
            }

            // Atualizar ícones
            document.querySelectorAll('th i.fas').forEach(icon => {
                icon.className = 'fas fa-sort';
            });
            th.querySelector('i').className = `fas fa-sort-${currentSort.direction === 'asc' ? 'up' : 'down'}`;

            // Ordenar e renderizar
            allData = ordenarDados(allData, campo, currentSort.direction);
            renderizarTabela(allData);
        });
    });

    // Inicialização
    async function inicializar() {
        const dados = await carregarDados();
        allData = dados;
        renderizarTabela(dados);
        renderizarGraficoBolhas(dados);
        renderizarPerguntasIgnoradas(dados);
    }

    inicializar();
}); 