const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

class JsonStore {
    constructor() {
        this.dataDir = path.join(__dirname, '..', 'data');
        this.usersFile = path.join(this.dataDir, 'users.json');
        this.statsFile = path.join(this.dataDir, 'stats.json');
        this.interactionsFile = path.join(this.dataDir, 'interactions.json');
        this.initialize();
    }

    async initialize() {
        try {
            // Create data directory if it doesn't exist
            await fs.mkdir(this.dataDir, { recursive: true });

            // Initialize files if they don't exist
            await this.initializeFile(this.usersFile, { users: [] });
            await this.initializeFile(this.statsFile, { stats: {} });
            await this.initializeFile(this.interactionsFile, { interactions: [] });
        } catch (error) {
            console.error('Error initializing JsonStore:', error);
        }
    }

    async initializeFile(filePath, defaultContent) {
        try {
            await fs.access(filePath);
        } catch {
            await fs.writeFile(filePath, JSON.stringify(defaultContent, null, 2));
        }
    }

    async readFile(filePath) {
        try {
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error reading ${filePath}:`, error);
            return null;
        }
    }

    async writeFile(filePath, data) {
        try {
            await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error(`Error writing ${filePath}:`, error);
        }
    }

    // User methods
    async findUserByUsername(username) {
        const data = await this.readFile(this.usersFile);
        return data.users.find(user => user.username === username);
    }

    async findUserById(id) {
        const data = await this.readFile(this.usersFile);
        return data.users.find(user => user.id === id);
    }

    async createUser(userData) {
        const data = await this.readFile(this.usersFile);
        const newUser = {
            id: Date.now().toString(),
            ...userData,
            createdAt: new Date().toISOString()
        };
        data.users.push(newUser);
        await this.writeFile(this.usersFile, data);
        return newUser;
    }

    // Stats methods
    async getStats() {
        const data = await this.readFile(this.statsFile);
        return data.stats;
    }

    async updateStats(stats) {
        await this.writeFile(this.statsFile, { stats });
    }

    // Interactions methods
    async getInteractions() {
        const data = await this.readFile(this.interactionsFile);
        return data.interactions;
    }

    async addInteraction(interaction) {
        const data = await this.readFile(this.interactionsFile);
        data.interactions.push({
            id: Date.now().toString(),
            ...interaction,
            timestamp: new Date().toISOString()
        });
        await this.writeFile(this.interactionsFile, data);
    }
}

module.exports = new JsonStore(); 