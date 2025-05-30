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
        colors: ['#c7a856', '#f9f9f9', '#2a2a2a', '#3a3a3a'],
        legend: {
            position: 'bottom',
            labels: {
                colors: '#e0e0e0'
            }
        }
    };

    // Dados mockados para teste
    const mockData = {
        pageViews: {
            pages: ['Página Inicial', 'Resultado', 'Admin Login', 'Outros'],
            views: [150, 120, 30, 20]
        },
        timeOnPage: {
            pages: ['Página Inicial', 'Resultado', 'Admin Login'],
            time: [45, 120, 15]
        },
        trafficSource: {
            sources: ['Google', 'Direto', 'Instagram', 'Referências'],
            percentage: [40, 30, 20, 10]
        },
        location: {
            cities: ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Outros'],
            visits: [300, 200, 150, 100]
        }
    };

    // Gráfico de Visualizações por Página
    const pageViewsChart = new ApexCharts(document.querySelector('#pageViewsChart'), {
        ...chartCommonOptions,
        series: [{
            name: 'Visualizações',
            data: mockData.pageViews.views
        }],
        chart: {
            ...chartCommonOptions.chart,
            type: 'bar',
            height: 250
        },
        xaxis: {
            categories: mockData.pageViews.pages,
            labels: {
                style: {
                    colors: '#e0e0e0'
                }
            }
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: true
            }
        }
    });
    pageViewsChart.render();

    // Gráfico de Tempo Médio por Página
    const timeOnPageChart = new ApexCharts(document.querySelector('#timeOnPageChart'), {
        ...chartCommonOptions,
        series: [{
            name: 'Segundos',
            data: mockData.timeOnPage.time
        }],
        chart: {
            ...chartCommonOptions.chart,
            type: 'bar',
            height: 250
        },
        xaxis: {
            categories: mockData.timeOnPage.pages,
            labels: {
                style: {
                    colors: '#e0e0e0'
                }
            }
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: true
            }
        }
    });
    timeOnPageChart.render();

    // Gráfico de Origem do Tráfego
    const trafficSourceChart = new ApexCharts(document.querySelector('#trafficSourceChart'), {
        ...chartCommonOptions,
        series: mockData.trafficSource.percentage,
        chart: {
            ...chartCommonOptions.chart,
            type: 'pie',
            height: 300
        },
        labels: mockData.trafficSource.sources,
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: 200
                },
                legend: {
                    position: 'bottom'
                }
            }
        }]
    });
    trafficSourceChart.render();

    // Gráfico de Localização
    const locationChart = new ApexCharts(document.querySelector('#locationChart'), {
        ...chartCommonOptions,
        series: [{
            name: 'Visitas',
            data: mockData.location.visits
        }],
        chart: {
            ...chartCommonOptions.chart,
            type: 'bar',
            height: 300
        },
        xaxis: {
            categories: mockData.location.cities,
            labels: {
                style: {
                    colors: '#e0e0e0'
                }
            }
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: true
            }
        }
    });
    locationChart.render();

    // Atualizar KPIs
    document.getElementById('visitasHoje').textContent = '320';
    document.getElementById('visitas7dias').textContent = '2,150';
    document.getElementById('visitasMes').textContent = '8,734';

    // Função para atualizar dados em tempo real (mock)
    function updateRealTimeData() {
        // Aqui você implementaria a lógica real de atualização
        // Por enquanto apenas simula atualizações aleatórias
        const randomIncrease = () => Math.floor(Math.random() * 10);
        
        setInterval(() => {
            const visitasHoje = parseInt(document.getElementById('visitasHoje').textContent.replace(',', ''));
            document.getElementById('visitasHoje').textContent = (visitasHoje + randomIncrease()).toLocaleString();
        }, 30000); // Atualiza a cada 30 segundos
    }

    // Iniciar atualizações em tempo real
    updateRealTimeData();
}); 