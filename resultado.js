import { getMultiplicadores, MULTIPLICADORES_FIXOS } from './multiplicadores.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Recuperar dados do localStorage
    const resultadoSalvo = JSON.parse(localStorage.getItem('resultadoFinal'));
    
    if (!resultadoSalvo) {
        window.location.href = 'index.html';
        return;
    }

    // Atualizar informações da cidade
    document.getElementById('cidadeEstado').textContent = `${resultadoSalvo.cidade}/${resultadoSalvo.estado}`;

    // Mostrar tela de análise
    const analiseScreen = document.querySelector('.analise-screen');
    const resultadosGrid = document.querySelector('.resultados-grid');
    const progressBar = document.querySelector('.analise-progress-bar');
    const analiseMessage = document.querySelector('.analise-message');

    analiseScreen.classList.add('active');
    resultadosGrid.style.display = 'none';

    // Mensagens de análise
    const mensagens = [
        `🔍 Procurando sugar daddies em ${resultadoSalvo.cidade}...`,
        '💬 Analisando histórico de matches...',
        '📊 Verificando taxas de conversão...',
        '✨ Finalizando análise...'
    ];

    // Animação de progresso mais fluida
    const tempoTotalAnalise = 1000; // 1 segundo para a análise
    const tempoFadeOut = 1000; // 1 segundo para desaparecer
    const tempoEntreMensagens = tempoTotalAnalise / mensagens.length;

    // Progresso da análise
    for (let i = 0; i < mensagens.length; i++) {
        await new Promise(resolve => setTimeout(resolve, tempoEntreMensagens));
        analiseMessage.textContent = mensagens[i];
        progressBar.style.width = `${(i + 1) * (100 / mensagens.length)}%`;
        
        // Adiciona uma transição suave para a barra de progresso
        progressBar.style.transition = `width ${tempoEntreMensagens}ms ease-in-out`;
    }

    // Aguarda um momento com 100% antes de começar a desaparecer
    await new Promise(resolve => setTimeout(resolve, 100));

    // Fade out suave
    analiseScreen.style.transition = `opacity ${tempoFadeOut}ms ease-in-out`;
    analiseScreen.style.opacity = '0';

    // Aguarda o fade out terminar antes de remover e mostrar os resultados
    await new Promise(resolve => setTimeout(resolve, tempoFadeOut));
    analiseScreen.classList.remove('active');
    resultadosGrid.style.display = 'grid';
    resultadosGrid.classList.add('active');

    // Multiplicadores por plataforma
    const plataformasMultiplicador = {
        'bebaby': 1.4,
        'meupatrocinio': 1.2,
        'universosugar': 1.0,
        'meunamoroexclusivo': 0.9,
        'meurubi': 0.8
    };

    // Atualizar valores nos cards
    document.querySelectorAll('.platform-card').forEach(card => {
        let multiplicador = 1.0;
        const platformName = card.querySelector('.platform-name').textContent.toLowerCase().replace(/\s+/g, '');
        
        if (plataformasMultiplicador[platformName]) {
            multiplicador = plataformasMultiplicador[platformName];
        }

        const valorPlataforma = resultadoSalvo.valorFinal * multiplicador;
        const valorMinimo = valorPlataforma * 0.8;
        const valorMaximo = valorPlataforma * 1.2;

        const rangeElement = card.querySelector('.potential-range');
        const averageElement = card.querySelector('.potential-average');

        rangeElement.textContent = `R$ ${valorMinimo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} - R$ ${valorMaximo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        averageElement.textContent = `Média: R$ ${valorPlataforma.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    });

    // Compartilhar no WhatsApp
    document.getElementById('compartilharWhatsApp').addEventListener('click', () => {
        const plataformaRecomendada = document.querySelector('.platform-card.recommended');
        const valorMedio = plataformaRecomendada.querySelector('.potential-average').textContent;
        
        const mensagem = encodeURIComponent(
            `🌟 Calculei meu potencial sugar!\n` +
            `📍 ${resultadoSalvo.cidade}/${resultadoSalvo.estado}\n` +
            `💰 ${valorMedio}\n` +
            `🔗 Faça sua simulação também: [link do site]`
        );
        window.open(`https://wa.me/?text=${mensagem}`, '_blank');
    });
});

function calcularResultados(valorBase, cidade) {
    const multiplicadores = getMultiplicadores(cidade);
    
    // Configuração das plataformas com seus dados base
    const plataformas = [
        {
            nome: "Bebaby.app",
            multiplicador: multiplicadores["Bebaby.app"] * 1.4, // Aumentado para garantir primeiro lugar
            badge: {
                tipo: "recommended",
                texto: "Mais recomendado",
                subtexto: "Grátis para entrar e receber mensagens"
            },
            entrada: "Grátis para entrar",
            tempoEncontro: "1 dia até o primeiro encontro",
            rating: 9.8
        },
        {
            nome: "Meu Patrocínio",
            multiplicador: multiplicadores["Meu Patrocínio"],
            entrada: "R$ 249,00 para entrar",
            tempoEncontro: "5 dias até o primeiro encontro",
            rating: 8.0
        },
        {
            nome: "Meu Namoro Exclusivo",
            multiplicador: multiplicadores["Meu Namoro Exclusivo"],
            badge: {
                tipo: "new",
                texto: "Novo no Brasil",
                subtexto: "Grátis para entrar e conversar"
            },
            entrada: "Grátis para entrar",
            tempoEncontro: "1,5 dias até o primeiro encontro",
            rating: 8.8
        },
        {
            nome: "Universo Sugar",
            multiplicador: multiplicadores["Universo Sugar"],
            entrada: "R$ 199,99 para entrar",
            tempoEncontro: "7 dias até o primeiro encontro",
            rating: 7.0
        },
        {
            nome: "Meu Rubi",
            multiplicador: multiplicadores["Meu Rubi"],
            entrada: "R$ 189,99 para entrar",
            tempoEncontro: "8 dias até o primeiro encontro",
            rating: 6.0
        }
    ];

    // Calcula o valor final para cada plataforma
    plataformas.forEach(plataforma => {
        plataforma.valorFinal = valorBase * plataforma.multiplicador;
    });

    // Ordena as plataformas, mas garante que Bebaby.app sempre seja primeiro
    return plataformas.sort((a, b) => {
        if (a.nome === "Bebaby.app") return -1;
        if (b.nome === "Bebaby.app") return 1;
        return b.valorFinal - a.valorFinal;
    });
}

function atualizarCards(resultados) {
    const grid = document.querySelector('.resultados-grid');
    grid.innerHTML = ''; // Limpa o grid atual

    resultados.forEach(plataforma => {
        const card = document.createElement('div');
        card.className = 'platform-card';
        if (plataforma.badge) {
            card.classList.add(plataforma.badge.tipo === 'recommended' ? 'recommended' : 'new');
        }

        // Formata o valor final para exibição
        const valorMin = Math.floor(plataforma.valorFinal * 0.8);
        const valorMax = Math.ceil(plataforma.valorFinal * 1.2);
        const valorMedio = Math.round(plataforma.valorFinal);

        // Define o link e texto do botão baseado na plataforma
        let linkPlataforma = '';
        let textoBotao = '';
        
        switch(plataforma.nome) {
            case 'Bebaby.app':
                linkPlataforma = 'https://www.bebaby.app';
                textoBotao = 'Criar Conta Grátis';
                break;
            case 'Meu Namoro Exclusivo':
                linkPlataforma = 'https://www.meunamoroexclusivo.com.br';
                textoBotao = 'Criar Conta Grátis';
                break;
            case 'Meu Patrocínio':
                linkPlataforma = 'https://www.meupatrocinio.com';
                textoBotao = 'Conhecer Plataforma';
                break;
            case 'Universo Sugar':
                linkPlataforma = 'https://www.universosugar.com.br';
                textoBotao = 'Conhecer Plataforma';
                break;
            case 'Meu Rubi':
                linkPlataforma = 'https://www.meurubi.com.br';
                textoBotao = 'Conhecer Plataforma';
                break;
        }

        card.innerHTML = `
            <div class="platform-header">
                <h3 class="platform-name">${plataforma.nome}</h3>
                ${plataforma.badge ? `
                    <span class="platform-badge badge-${plataforma.badge.tipo}">
                        <i class="fas fa-${plataforma.badge.tipo === 'recommended' ? 'crown' : 'sparkles'}"></i>
                        ${plataforma.badge.texto}
                    </span>
                ` : ''}
            </div>
            <div class="platform-rating">
                <span class="rating-stars">⭐</span>
                <span class="rating-value">${plataforma.rating}</span>
            </div>
            <div class="platform-stats">
                <div class="stat-item">
                    <i class="fas fa-wallet stat-icon"></i>
                    <span class="stat-value">${plataforma.entrada}</span>
                </div>
                <div class="stat-item">
                    <i class="fas fa-clock stat-icon"></i>
                    <span class="stat-value">${plataforma.tempoEncontro}</span>
                </div>
            </div>
            <div class="potential-values">
                <h4 class="potential-title">Potencial Mensal</h4>
                <div class="potential-range">R$ ${valorMin.toLocaleString('pt-BR')} - ${valorMax.toLocaleString('pt-BR')}</div>
                <div class="potential-average">Média: R$ ${valorMedio.toLocaleString('pt-BR')}</div>
            </div>
            <a href="${linkPlataforma}" target="_blank" rel="noopener noreferrer" class="platform-cta">
                ${textoBotao} <i class="fas fa-arrow-right"></i>
            </a>
        `;

        grid.appendChild(card);
    });
}

// Recupera os dados da URL e inicializa
const params = new URLSearchParams(window.location.search);
const valorBase = parseFloat(params.get('valor')) || 5000;
const cidade = params.get('cidade') || 'São Paulo';

// Calcula e exibe os resultados
const resultados = calcularResultados(valorBase, cidade);
atualizarCards(resultados); 