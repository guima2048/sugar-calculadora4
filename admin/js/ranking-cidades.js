document.addEventListener('DOMContentLoaded', () => {
    let currentPage = 1;
    let currentSort = { field: 'acessos', direction: 'desc' };
    let allData = [];
    let filteredData = [];

    // Configuração dos emojis das plataformas
    const PLATAFORMA_EMOJI = {
        'Bebaby.app': '💎',
        'Meu Namoro Exclusivo': '🆕',
        'Meu Patrocínio': '💰',
        'Universo Sugar': '🌐',
        'Meu Rubi': '🔻'
    };

    // Função para carregar dados do servidor
    async function carregarDados(pagina = 1, limite = 10) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/estatisticas/cidades?pagina=${pagina}&limite=${limite}`, {
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

    // Função para determinar a cor do valor médio
    function getValorClass(valor) {
        if (valor >= 3000) return 'valor-alto';
        if (valor >= 1500) return 'valor-medio';
        return 'valor-baixo';
    }

    // Função para renderizar a tabela
    function renderizarTabela(dados) {
        const tbody = document.getElementById('cidadesTableBody');
        tbody.innerHTML = dados.map(cidade => `
            <tr>
                <td>${cidade.cidade}</td>
                <td>${cidade.estado}</td>
                <td>${cidade.acessos.toLocaleString()}</td>
                <td>${cidade.completos.toLocaleString()}</td>
                <td>${cidade.abandono.toFixed(1)}%</td>
                <td class="${getValorClass(cidade.valorMedio)}">
                    ${formatarValor(cidade.valorMedio)}
                </td>
                <td>
                    <span class="plataforma-emoji" title="${cidade.plataformaPrincipal}">
                        ${PLATAFORMA_EMOJI[cidade.plataformaPrincipal]}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    // Função para renderizar o gráfico
    function renderizarGrafico(dados) {
        const options = {
            series: [{
                name: 'Acessos',
                data: dados.slice(0, 10).map(cidade => cidade.acessos)
            }],
            chart: {
                type: 'bar',
                height: 400,
                background: 'transparent',
                foreColor: '#e0e0e0'
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    borderRadius: 4
                }
            },
            colors: ['#c7a856'],
            xaxis: {
                categories: dados.slice(0, 10).map(cidade => `${cidade.cidade}/${cidade.estado}`),
                labels: {
                    style: {
                        colors: '#e0e0e0'
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: '#e0e0e0'
                    }
                }
            },
            tooltip: {
                theme: 'dark',
                y: {
                    formatter: value => value.toLocaleString()
                }
            }
        };

        const chart = new ApexCharts(document.querySelector('#graficoAcessos'), options);
        chart.render();
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

    // Função para filtrar dados
    function filtrarDados(dados, termo) {
        if (!termo) return dados;
        
        termo = termo.toLowerCase();
        return dados.filter(cidade => 
            cidade.cidade.toLowerCase().includes(termo) ||
            cidade.estado.toLowerCase().includes(termo)
        );
    }

    // Event Listeners
    document.getElementById('searchCidades').addEventListener('input', (e) => {
        filteredData = filtrarDados(allData, e.target.value);
        renderizarTabela(filteredData.slice(0, currentPage * 10));
        renderizarGrafico(filteredData);
    });

    document.getElementById('btnCarregarMais').addEventListener('click', async () => {
        currentPage++;
        const novosDados = await carregarDados(currentPage);
        allData = [...allData, ...novosDados];
        filteredData = filtrarDados(allData, document.getElementById('searchCidades').value);
        renderizarTabela(filteredData.slice(0, currentPage * 10));
    });

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
            filteredData = ordenarDados(filteredData, campo, currentSort.direction);
            renderizarTabela(filteredData.slice(0, currentPage * 10));
        });
    });

    // Inicialização
    async function inicializar() {
        const dadosIniciais = await carregarDados();
        allData = dadosIniciais;
        filteredData = [...allData];
        renderizarTabela(filteredData.slice(0, 10));
        renderizarGrafico(filteredData);
    }

    inicializar();
}); 