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

    // Estado da tabela
    let currentPage = 1;
    const itemsPerPage = 10;
    let currentSort = { field: 'dataRegistro', direction: 'desc' };
    let searchTerm = '';
    let usuarios = [];

    // Função para carregar dados dos usuários
    async function carregarDados() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/usuarios', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Erro ao carregar dados');
            
            const data = await response.json();
            usuarios = data.usuarios;
            
            atualizarKPIs(data.estatisticas);
            renderizarTabela();
            renderizarGraficos(data.estatisticas);
        } catch (error) {
            console.error('Erro:', error);
            // Usar dados mockados em caso de erro
            usarDadosMockados();
        }
    }

    // Função para usar dados mockados (temporário)
    function usarDadosMockados() {
        const mockData = {
            usuarios: Array.from({ length: 50 }, (_, i) => ({
                id: i + 1,
                cidade: ['São Paulo', 'Rio de Janeiro', 'Curitiba', 'Belo Horizonte'][Math.floor(Math.random() * 4)],
                dataRegistro: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                ultimoAcesso: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                plataforma: ['Bebaby.app', 'Meu Namoro Exclusivo', 'Meu Patrocínio'][Math.floor(Math.random() * 3)],
                status: ['Ativo', 'Inativo', 'Pendente'][Math.floor(Math.random() * 3)]
            })),
            estatisticas: {
                total: 50,
                ativos: 35,
                crescimento: 15,
                tempoMedio: 4.5,
                porCidade: {
                    'São Paulo': 20,
                    'Rio de Janeiro': 15,
                    'Curitiba': 10,
                    'Belo Horizonte': 5
                },
                crescimentoDiario: Array.from({ length: 7 }, (_, i) => ({
                    data: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    usuarios: Math.floor(40 + Math.random() * 20)
                }))
            }
        };

        usuarios = mockData.usuarios;
        atualizarKPIs(mockData.estatisticas);
        renderizarTabela();
        renderizarGraficos(mockData.estatisticas);
    }

    // Função para atualizar KPIs
    function atualizarKPIs(estatisticas) {
        document.getElementById('totalUsuarios').textContent = estatisticas.total.toLocaleString();
        document.getElementById('usuariosAtivos').textContent = estatisticas.ativos.toLocaleString();
        document.getElementById('taxaCrescimento').textContent = `${estatisticas.crescimento}%`;
        document.getElementById('tempoMedio').textContent = `${estatisticas.tempoMedio}min`;
    }

    // Função para renderizar a tabela
    function renderizarTabela() {
        const tbody = document.getElementById('usuariosTableBody');
        const usuariosFiltrados = filtrarUsuarios();
        const usuariosOrdenados = ordenarUsuarios(usuariosFiltrados);
        const usuariosPaginados = paginarUsuarios(usuariosOrdenados);

        tbody.innerHTML = usuariosPaginados.map(usuario => `
            <tr>
                <td>${usuario.id}</td>
                <td>${usuario.cidade}</td>
                <td>${formatarData(usuario.dataRegistro)}</td>
                <td>${formatarData(usuario.ultimoAcesso)}</td>
                <td>${usuario.plataforma}</td>
                <td>
                    <span class="badge ${getStatusClass(usuario.status)}">
                        ${usuario.status}
                    </span>
                </td>
            </tr>
        `).join('');

        atualizarPaginacao(usuariosFiltrados.length);
        atualizarInfoRegistros(usuariosFiltrados.length);
    }

    // Funções auxiliares
    function filtrarUsuarios() {
        if (!searchTerm) return usuarios;
        
        const termo = searchTerm.toLowerCase();
        return usuarios.filter(u => 
            u.cidade.toLowerCase().includes(termo) ||
            u.plataforma.toLowerCase().includes(termo) ||
            u.status.toLowerCase().includes(termo)
        );
    }

    function ordenarUsuarios(lista) {
        return [...lista].sort((a, b) => {
            const valorA = a[currentSort.field];
            const valorB = b[currentSort.field];
            
            if (currentSort.direction === 'asc') {
                return valorA > valorB ? 1 : -1;
            } else {
                return valorA < valorB ? 1 : -1;
            }
        });
    }

    function paginarUsuarios(lista) {
        const start = (currentPage - 1) * itemsPerPage;
        return lista.slice(start, start + itemsPerPage);
    }

    function formatarData(data) {
        return new Date(data).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function getStatusClass(status) {
        const classes = {
            'Ativo': 'bg-success',
            'Inativo': 'bg-danger',
            'Pendente': 'bg-warning'
        };
        return classes[status] || 'bg-secondary';
    }

    function atualizarPaginacao(totalItems) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const pagination = document.getElementById('usuariosPagination');
        
        let html = `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">Anterior</a>
            </li>
        `;

        for (let i = 1; i <= totalPages; i++) {
            html += `
                <li class="page-item ${currentPage === i ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }

        html += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}">Próximo</a>
            </li>
        `;

        pagination.innerHTML = html;
    }

    function atualizarInfoRegistros(total) {
        const start = (currentPage - 1) * itemsPerPage + 1;
        const end = Math.min(start + itemsPerPage - 1, total);
        
        document.getElementById('startEntry').textContent = total ? start : 0;
        document.getElementById('endEntry').textContent = end;
        document.getElementById('totalEntries').textContent = total;
    }

    // Função para renderizar gráficos
    function renderizarGraficos(estatisticas) {
        // Gráfico de usuários por cidade
        const cidadesChart = new ApexCharts(document.querySelector('#usuariosCidadeChart'), {
            ...chartCommonOptions,
            series: [{
                name: 'Usuários',
                data: Object.values(estatisticas.porCidade)
            }],
            chart: {
                ...chartCommonOptions.chart,
                type: 'bar',
                height: 350
            },
            xaxis: {
                categories: Object.keys(estatisticas.porCidade),
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
        cidadesChart.render();

        // Gráfico de crescimento
        const crescimentoChart = new ApexCharts(document.querySelector('#crescimentoUsuariosChart'), {
            ...chartCommonOptions,
            series: [{
                name: 'Usuários',
                data: estatisticas.crescimentoDiario.map(d => d.usuarios)
            }],
            chart: {
                ...chartCommonOptions.chart,
                type: 'line',
                height: 350
            },
            xaxis: {
                categories: estatisticas.crescimentoDiario.map(d => d.data),
                labels: {
                    style: {
                        colors: '#e0e0e0'
                    }
                }
            },
            stroke: {
                curve: 'smooth',
                width: 3
            },
            markers: {
                size: 4
            }
        });
        crescimentoChart.render();
    }

    // Event Listeners
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const field = th.dataset.sort;
            const direction = currentSort.field === field && currentSort.direction === 'asc' ? 'desc' : 'asc';
            
            currentSort = { field, direction };
            renderizarTabela();

            // Atualizar ícones
            document.querySelectorAll('th i.fas').forEach(icon => {
                icon.className = 'fas fa-sort';
            });
            th.querySelector('i').className = `fas fa-sort-${direction === 'asc' ? 'up' : 'down'}`;
        });
    });

    document.getElementById('searchUsuarios').addEventListener('input', (e) => {
        searchTerm = e.target.value;
        currentPage = 1;
        renderizarTabela();
    });

    document.getElementById('usuariosPagination').addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target.tagName === 'A' && e.target.dataset.page) {
            const newPage = parseInt(e.target.dataset.page);
            if (newPage !== currentPage && newPage > 0) {
                currentPage = newPage;
                renderizarTabela();
            }
        }
    });

    // Inicialização
    carregarDados();
}); 