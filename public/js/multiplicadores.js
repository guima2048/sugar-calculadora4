const MULTIPLICADORES_FIXOS = {
    "Bebaby.app": 1.1,
    "Meu Namoro Exclusivo": 0.9
};

const MULTIPLICADORES_PADRAO = {
    "Meu Patrocínio": 1.2,
    "Universo Sugar": 1.0,
    "Meu Rubi": 0.8
};

const MULTIPLICADORES_POR_CIDADE = {
    "São Paulo": {
        "Meu Patrocínio": 1.2,
        "Universo Sugar": 1.0,
        "Meu Rubi": 0.8
    },
    "Teresina": {
        "Meu Patrocínio": 0.8,
        "Universo Sugar": 1.0,
        "Meu Rubi": 1.2
    }
    // Outras cidades podem ser adicionadas aqui
};

function getMultiplicadores(cidade) {
    // Combina os multiplicadores fixos com os da cidade (ou padrão se a cidade não existir)
    const multiplicadoresCidade = MULTIPLICADORES_POR_CIDADE[cidade] || MULTIPLICADORES_PADRAO;
    
    return {
        ...MULTIPLICADORES_FIXOS,
        ...multiplicadoresCidade
    };
}

// Exporta as funções e constantes necessárias
export {
    getMultiplicadores,
    MULTIPLICADORES_FIXOS
}; 