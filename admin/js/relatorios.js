document.addEventListener('DOMContentLoaded', () => {
    // Dados mockados para teste
    const mockData = {
        insights: [
            {
                tipo: 'warning',
                icone: '⚠️',
                titulo: 'Alta taxa de abandono',
                mensagem: 'A pergunta sobre "Nível de Escolaridade" tem taxa de abandono de 45%'
            },
            {
                tipo: 'location',
                icone: '📍',
                titulo: 'Oportunidade regional',
                mensagem: 'São Paulo representa 40% das buscas, crie conteúdo específico'
            },
            {
                tipo: 'insight',
                icone: '💡',
                titulo: 'Perfil de maior valor',
                mensagem: 'Usuárias bissexuais têm média 30% maior de valor estimado'
            },
            {
                tipo: 'trend',
                icone: '🚀',
                titulo: 'Tendência semanal',
                mensagem: 'Bebaby.app teve aumento de 25% nos cliques esta semana'
            }
        ],
        seo: {
            termos: [
                { termo: 'sugar baby sp', volume: 1200 },
                { termo: 'quanto ganha sugar baby', volume: 800 },
                { termo: 'sugar baby iniciante', volume: 600 },
                { termo: 'sugar baby salário', volume: 500 },
                { termo: 'como ser sugar baby', volume: 450 }
            ],
            sugestoes: [
                {
                    titulo: 'Guia Completo: Quanto ganha uma Sugar Baby em São Paulo?',
                    keywords: ['sugar baby sp', 'quanto ganha sugar'],
                    dificuldade: 'Média'
                },
                {
                    titulo: 'Como começar como Sugar Baby: 7 dicas essenciais',
                    keywords: ['sugar baby iniciante', 'como ser sugar baby'],
                    dificuldade: 'Fácil'
                },
                {
                    titulo: 'Média salarial de Sugar Babies por cidade em 2024',
                    keywords: ['sugar baby salário', 'quanto ganha sugar baby'],
                    dificuldade: 'Difícil'
                }
            ]
        }
    };

    // Renderizar insights
    function renderInsights() {
        const container = document.getElementById('insightsContainer');
        container.innerHTML = mockData.insights.map(insight => `
            <div class="insight-card ${insight.tipo}">
                <div class="insight-icon">${insight.icone}</div>
                <div class="insight-content">
                    <h4>${insight.titulo}</h4>
                    <p>${insight.mensagem}</p>
                </div>
            </div>
        `).join('');
    }

    // Renderizar nuvem de palavras-chave
    function renderKeywords() {
        const container = document.getElementById('keywordsCloud');
        container.innerHTML = mockData.seo.termos.map(termo => `
            <div class="keyword-tag" style="font-size: ${Math.max(14, termo.volume/50)}px">
                ${termo.termo}
                <span class="keyword-volume">${termo.volume}</span>
            </div>
        `).join('');
    }

    // Renderizar sugestões de blog
    function renderBlogSuggestions() {
        const container = document.getElementById('blogSuggestions');
        container.innerHTML = `
            <h4 class="mb-3">Sugestões de Conteúdo</h4>
            ${mockData.seo.sugestoes.map(sugestao => `
                <div class="blog-suggestion-card">
                    <h5>${sugestao.titulo}</h5>
                    <div class="keywords-list">
                        ${sugestao.keywords.map(k => `<span class="keyword-pill">${k}</span>`).join('')}
                    </div>
                    <span class="difficulty-badge ${sugestao.dificuldade.toLowerCase()}">
                        ${sugestao.dificuldade}
                    </span>
                </div>
            `).join('')}
        `;
    }

    // Gerar PDF do relatório
    async function generatePDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Configurações de estilo
        doc.setFont('helvetica');
        
        // Cabeçalho
        doc.setFontSize(24);
        doc.text('Relatório Calculadora Sugar', 20, 20);
        doc.setFontSize(12);
        doc.text(`Gerado em ${new Date().toLocaleDateString()}`, 20, 30);
        
        // Seção de Insights
        doc.setFontSize(16);
        doc.text('Insights Importantes', 20, 50);
        let y = 60;
        mockData.insights.forEach(insight => {
            doc.setFontSize(12);
            doc.text(`${insight.icone} ${insight.titulo}`, 20, y);
            doc.setFontSize(10);
            doc.text(insight.mensagem, 20, y + 5);
            y += 15;
        });
        
        // Seção de SEO
        y += 10;
        doc.setFontSize(16);
        doc.text('Análise SEO', 20, y);
        y += 10;
        doc.setFontSize(12);
        mockData.seo.termos.forEach(termo => {
            doc.text(`• ${termo.termo} (${termo.volume} buscas)`, 20, y);
            y += 7;
        });
        
        // Salvar PDF
        doc.save('relatorio-calculadora-sugar.pdf');
    }

    // Event Listeners
    document.getElementById('btnGerarRelatorio').addEventListener('click', generatePDF);
    
    document.getElementById('btnVerSEO').addEventListener('click', () => {
        const modal = new bootstrap.Modal(document.getElementById('seoModal'));
        const modalContent = document.getElementById('seoModalContent');
        
        modalContent.innerHTML = `
            <div class="seo-modal-content">
                <h4 class="mb-4">Termos mais buscados</h4>
                <div class="terms-list mb-4">
                    ${mockData.seo.termos.map(termo => `
                        <div class="term-item">
                            <span class="term-name">${termo.termo}</span>
                            <span class="term-volume">${termo.volume} buscas/mês</span>
                        </div>
                    `).join('')}
                </div>
                
                <h4 class="mb-4">Sugestões de Conteúdo</h4>
                ${mockData.seo.sugestoes.map(sugestao => `
                    <div class="content-suggestion">
                        <h5>${sugestao.titulo}</h5>
                        <div class="keywords-list">
                            ${sugestao.keywords.map(k => `<span class="keyword-pill">${k}</span>`).join('')}
                        </div>
                        <p class="text-muted">Dificuldade: ${sugestao.dificuldade}</p>
                    </div>
                `).join('')}
            </div>
        `;
        
        modal.show();
    });

    document.getElementById('btnAtivarEmail').addEventListener('click', () => {
        const email = document.getElementById('emailRelatorio').value;
        if (email) {
            alert('Envio mensal ativado com sucesso! Você receberá seu primeiro relatório no dia 1º do próximo mês.');
            document.getElementById('emailRelatorio').value = '';
        } else {
            alert('Por favor, insira um e-mail válido.');
        }
    });

    // Inicializar a página
    renderInsights();
    renderKeywords();
    renderBlogSuggestions();
}); 