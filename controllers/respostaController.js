const DataService = require('../services/dataService');
const respostasService = new DataService('respostas.json');

exports.salvarResposta = async (req, res) => {
    try {
        const resposta = await respostasService.create(req.body);
        res.status(201).json({
            success: true,
            data: resposta
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.obterRespostas = async (req, res) => {
    try {
        const respostas = await respostasService.findAll();
        res.status(200).json({
            success: true,
            data: respostas
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}; 