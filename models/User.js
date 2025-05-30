const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('./JsonStore');

class User {
    constructor(data) {
        this.id = data.id;
        this.username = data.username;
        this.password = data.password;
        this.role = data.role || 'admin';
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    static async findById(id) {
        const user = await store.findUserById(id);
        return user ? new User(user) : null;
    }

    static async findByUsername(username) {
        const user = await store.findUserByUsername(username);
        return user ? new User(user) : null;
    }

    static async create(userData) {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);

        const user = await store.createUser(userData);
        return new User(user);
    }

    async matchPassword(enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
    }

    getSignedJwtToken() {
        return jwt.sign(
            { id: this.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );
    }

    toJSON() {
        return {
            id: this.id,
            username: this.username,
            role: this.role,
            createdAt: this.createdAt
        };
    }
}

module.exports = User; 