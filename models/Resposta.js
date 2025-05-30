class Resposta {
    constructor(data) {
        this.estado = data.estado?.toUpperCase();
        this.cidade = data.cidade;
        this.respostas = {
            idade: data.respostas?.idade,
            escolaridade: data.respostas?.escolaridade,
            disponibilidadeViagens: data.respostas?.disponibilidadeViagens,
            cuidadosAparencia: data.respostas?.cuidadosAparencia,
            situacaoProfissional: data.respostas?.situacaoProfissional
        };
        this.valorEstimado = data.valorEstimado;
        this.plataformaEscolhida = data.plataformaEscolhida;
        this.tempoPrenchimento = data.tempoPrenchimento;
        this.data = data.data || new Date();
    }

    validate() {
        if (!this.estado) throw new Error('Estado é obrigatório');
        if (!this.cidade) throw new Error('Cidade é obrigatória');
        if (!this.valorEstimado) throw new Error('Valor estimado é obrigatório');
        if (!this.plataformaEscolhida) throw new Error('Plataforma escolhida é obrigatória');
        if (!this.tempoPrenchimento) throw new Error('Tempo de preenchimento é obrigatório');
        return true;
    }

    toJSON() {
        return {
            estado: this.estado,
            cidade: this.cidade,
            respostas: this.respostas,
            valorEstimado: this.valorEstimado,
            plataformaEscolhida: this.plataformaEscolhida,
            tempoPrenchimento: this.tempoPrenchimento,
            data: this.data
        };
    }
}

module.exports = Resposta; 