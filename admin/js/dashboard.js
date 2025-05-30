document.addEventListener('DOMContentLoaded', () => {
    // Aqui será implementada a lógica para carregar os dados do dashboard
    // Por enquanto, apenas a estrutura básica está pronta
    
    // Exemplo de como atualizar os KPIs quando tivermos dados reais
    function updateKPIs(data) {
        const kpiElements = document.querySelectorAll('.kpi-value');
        
        // Temporariamente, mostrar valores zerados
        kpiElements.forEach(element => {
            if (element.textContent.includes('%')) {
                element.textContent = '0%';
            } else {
                element.textContent = '0';
            }
        });
    }

    // Inicializar os KPIs
    updateKPIs();
}); 