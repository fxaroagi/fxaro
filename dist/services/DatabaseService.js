"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const constants_1 = require("../config/constants");
class DatabaseService {
    constructor(logger) {
        this.logger = logger;
        const dbPath = constants_1.CONFIG.DATABASE_URL.replace('sqlite:///', './');
        this.db = new sqlite3_1.default.Database(dbPath);
        this.initialize();
    }
    initialize() {
        this.db.serialize(() => {
            // Users table
            this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
            // Tasks table
            this.db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          agentType TEXT NOT NULL,
          input TEXT NOT NULL,
          status TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          completedAt DATETIME,
          FOREIGN KEY (userId) REFERENCES users(id)
        )
      `);
            // Results table
            this.db.run(`
        CREATE TABLE IF NOT EXISTS results (
          id TEXT PRIMARY KEY,
          taskId TEXT NOT NULL,
          agentType TEXT NOT NULL,
          status TEXT NOT NULL,
          output TEXT,
          error TEXT,
          executionTime INTEGER,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (taskId) REFERENCES tasks(id)
        )
      `);
            // API Logs table
            this.db.run(`
        CREATE TABLE IF NOT EXISTS api_logs (
          id TEXT PRIMARY KEY,
          provider TEXT NOT NULL,
          model TEXT,
          inputTokens INTEGER,
          outputTokens INTEGER,
          cost REAL,
          status TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
            this.logger.info('Database initialized successfully');
        });
    }
    async saveUser(id, username, email, passwordHash) {
        return new Promise((resolve, reject) => {
            this.db.run('INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)', [id, username, email, passwordHash], (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    async getUser(username) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
                if (err)
                    reject(err);
                else
                    resolve(row);
            });
        });
    }
    async saveTask(id, userId, agentType, input) {
        return new Promise((resolve, reject) => {
            this.db.run('INSERT INTO tasks (id, userId, agentType, input, status) VALUES (?, ?, ?, ?, ?)', [id, userId, agentType, JSON.stringify(input), 'pending'], (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    async saveResult(taskId, agentType, result) {
        return new Promise((resolve, reject) => {
            const id = `result_${Date.now()}`;
            this.db.run(`INSERT INTO results (id, taskId, agentType, status, output, error, executionTime)
         VALUES (?, ?, ?, ?, ?, ?, ?)`, [
                id,
                taskId,
                agentType,
                result.status,
                result.output ? JSON.stringify(result.output) : null,
                result.error || null,
                result.executionTime,
            ], (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    async getTaskResults(taskId) {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM results WHERE taskId = ?', [taskId], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows || []);
            });
        });
    }
    async getUserTasks(userId) {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM tasks WHERE userId = ? ORDER BY createdAt DESC', [userId], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows || []);
            });
        });
    }
    async logApiCall(provider, model, inputTokens, outputTokens, cost) {
        return new Promise((resolve, reject) => {
            const id = `api_log_${Date.now()}`;
            this.db.run('INSERT INTO api_logs (id, provider, model, inputTokens, outputTokens, cost, status) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, provider, model, inputTokens, outputTokens, cost, 'success'], (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
}
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=DatabaseService.js.map