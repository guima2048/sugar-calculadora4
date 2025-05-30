document.addEventListener('DOMContentLoaded', () => {
    // Configuração das cores
    const CORES = {
        'Bebaby.app': '#c7a856', // Dourado
        'Meu Namoro Exclusivo': '#C0C0C0', // Prata
        'Meu Patrocínio': '#FFB6C1', // Rosa claro
        'Sugar Daddy Meet': '#E6E6FA', // Lavanda
        'Elite Meet': '#F0E68C' // Creme
    };

    // Configuração dos selos
    const SELOS = {
        RECOMENDADO: {
            icone: '💎',
            texto: 'Mais Recomendado'
        },
        ASCENSAO: {
            icone: '🆕',
            texto: 'Plataforma em Ascensão'
        }
    };

    // Função para carregar dados do servidor
    async function carregarDados() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/estatisticas/plataformas', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Erro ao carregar dados');
            
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Erro:', error);
            return null;
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
        const tbody = document.getElementById('plataformasTableBody');
        tbody.innerHTML = dados.plataformas.map(plataforma => `
            <tr>
                <td>
                    ${plataforma.selo ? `<span class="selo-plataforma">${plataforma.selo.icone}</span>` : ''}
                    ${plataforma.nome}
                </td>
                <td>${plataforma.primeiroLugar.toLocaleString()}</td>
                <td class="valor-medio">${formatarValor(plataforma.mediaValor)}</td>
                <td>${plataforma.cliques.toLocaleString()}</td>
                <td>
                    <div class="nota-wrapper">
                        <span class="nota-valor">${plataforma.nota.toFixed(1)}</span>
                        <div class="nota-stars" style="width: ${plataforma.nota * 20}%">★★★★★</div>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Função para renderizar o gráfico de barras
    function renderizarGraficoBarras(dados) {
        const options = {
            series: [{
                name: 'Média de Valor',
                data: dados.plataformas.map(p => p.mediaValor)
            }],
            chart: {
                type: 'bar',
                height: 350,
                background: 'transparent',
                foreColor: '#e0e0e0'
            },
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    columnWidth: '60%'
                }
            },
            colors: dados.plataformas.map(p => CORES[p.nome]),
            xaxis: {
                categories: dados.plataformas.map(p => p.nome),
                labels: {
                    style: {
                        colors: '#e0e0e0'
                    }
                }
            },
            yaxis: {
                title: {
                    text: 'Valor Médio (R$)',
                    style: {
                        color: '#e0e0e0'
                    }
                },
                labels: {
                    formatter: value => formatarValor(value)
                }
            },
            tooltip: {
                theme: 'dark',
                y: {
                    formatter: value => formatarValor(value)
                }
            }
        };

        const chart = new ApexCharts(document.querySelector('#graficoBarras'), options);
        chart.render();
    }

    // Função para renderizar a timeline
    function renderizarTimeline(dados) {
        const options = {
            series: dados.plataformas.map(p => ({
                name: p.nome,
                data: p.crescimentoSemanal.map(c => ({
                    x: c.semana,
                    y: c.cliques,
                    eventos: c.eventos
                }))
            })),
            chart: {
                type: 'area',
                height: 350,
                background: 'transparent',
                foreColor: '#e0e0e0',
                toolbar: {
                    show: false
                }
            },
            colors: dados.plataformas.map(p => CORES[p.nome]),
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.2,
                    stops: [0, 90, 100]
                }
            },
            xaxis: {
                type: 'datetime',
                labels: {
                    style: {
                        colors: '#e0e0e0'
                    }
                }
            },
            yaxis: {
                labels: {
                    formatter: value => value.toLocaleString()
                }
            },
            tooltip: {
                theme: 'dark',
                x: {
                    format: 'dd/MM/yy'
                },
                custom: function({ series, seriesIndex, dataPointIndex, w }) {
                    const data = w.config.series[seriesIndex].data[dataPointIndex];
                    const eventos = data.eventos || [];
                    
                    const eventosHtml = eventos.length
                        ? `<div class="timeline-eventos">
                            ${eventos.map(e => `
                                <div class="evento-item">
                                    <i class="fas fa-star"></i>
                                    ${e}
                                </div>
                            `).join('')}
                           </div>`
                        : '';

                    return `
                        <div class="timeline-tooltip">
                            <div class="tooltip-header">
                                <strong>${w.config.series[seriesIndex].name}</strong>
                                <span>${new Date(data.x).toLocaleDateString()}</span>
                            </div>
                            <div class="tooltip-body">
                                <div class="cliques-info">
                                    ${data.y.toLocaleString()} cliques
                                </div>
                                ${eventosHtml}
                            </div>
                        </div>
                    `;
                }
            }
        };

        const chart = new ApexCharts(document.querySelector('#graficoTimeline'), options);
        chart.render();
    }

    // Função para renderizar destaques
    function renderizarDestaques(dados) {
        const container = document.getElementById('destaquesGrid');
        const destaques = dados.plataformas.filter(p => p.selo);
        
        container.innerHTML = destaques.map(plataforma => `
            <div class="destaque-card">
                <div class="destaque-header">
                    <span class="destaque-selo">
                        ${plataforma.selo.icone}
                        ${plataforma.selo.texto}
                    </span>
                </div>
                <div class="destaque-content">
                    <h4>${plataforma.nome}</h4>
                    <div class="destaque-stats">
                        <div class="stat-item">
                            <i class="fas fa-trophy"></i>
                            ${plataforma.primeiroLugar.toLocaleString()} vezes em 1º lugar
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-dollar-sign"></i>
                            Média de ${formatarValor(plataforma.mediaValor)}
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-mouse-pointer"></i>
                            ${plataforma.cliques.toLocaleString()} cliques totais
                        </div>
                    </div>
                    <div class="destaque-crescimento">
                        <span class="crescimento-valor ${plataforma.crescimento >= 0 ? 'positivo' : 'negativo'}">
                            <i class="fas fa-${plataforma.crescimento >= 0 ? 'arrow-up' : 'arrow-down'}"></i>
                            ${Math.abs(plataforma.crescimento)}%
                        </span>
                        <span class="crescimento-periodo">nos últimos 30 dias</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Função para ordenar dados da tabela
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
            const direcaoAtual = th.querySelector('i').className.includes('up') ? 'desc' : 'asc';
            
            // Atualizar ícones
            document.querySelectorAll('th i.fas').forEach(icon => {
                icon.className = 'fas fa-sort';
            });
            th.querySelector('i').className = `fas fa-sort-${direcaoAtual === 'asc' ? 'up' : 'down'}`;

            // Ordenar e renderizar
            const dadosOrdenados = ordenarDados(window.dadosPlataformas.plataformas, campo, direcaoAtual);
            window.dadosPlataformas.plataformas = dadosOrdenados;
            renderizarTabela(window.dadosPlataformas);
        });
    });

    // Inicialização
    async function inicializar() {
        const dados = await carregarDados();
        if (dados) {
            window.dadosPlataformas = dados;
            renderizarTabela(dados);
            renderizarGraficoBarras(dados);
            renderizarTimeline(dados);
            renderizarDestaques(dados);
        }
    }

    inicializar();
}); 