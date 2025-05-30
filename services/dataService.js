const fs = require('fs').promises;
const path = require('path');

class DataService {
    constructor(filename) {
        this.filename = filename;
        this.dataPath = path.join(__dirname, '..', 'data', filename);
    }

    async create(data) {
        try {
            const items = await this.findAll();
            const newItem = {
                id: Date.now().toString(),
                ...data,
                createdAt: new Date()
            };
            items.push(newItem);
            await fs.writeFile(this.dataPath, JSON.stringify(items, null, 2));
            return newItem;
        } catch (error) {
            if (error.code === 'ENOENT') {
                // Se o arquivo não existir, cria com o primeiro item
                const newItem = {
                    id: Date.now().toString(),
                    ...data,
                    createdAt: new Date()
                };
                await fs.mkdir(path.dirname(this.dataPath), { recursive: true });
                await fs.writeFile(this.dataPath, JSON.stringify([newItem], null, 2));
                return newItem;
            }
            throw error;
        }
    }

    async findAll() {
        try {
            const data = await fs.readFile(this.dataPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                return [];
            }
            throw error;
        }
    }
}

module.exports = DataService;
