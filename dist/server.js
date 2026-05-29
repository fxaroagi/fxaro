"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const fs = __importStar(require("fs"));
const constants_1 = require("./config/constants");
const LoggerService_1 = require("./services/LoggerService");
const DatabaseService_1 = require("./services/DatabaseService");
const AgentOrchestrator_1 = require("./orchestrator/AgentOrchestrator");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const loggerService = new LoggerService_1.LoggerService('OpenClaw');
const logger = loggerService.getLogger();
const db = new DatabaseService_1.DatabaseService(logger);
const orchestrator = new AgentOrchestrator_1.AgentOrchestrator(logger);
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
// Middleware
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json({ limit: '50mb' }));
app.use(body_parser_1.default.urlencoded({ limit: '50mb', extended: true }));
// Create logs directory if it doesn't exist
if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs');
}
// WebSocket events
io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);
    socket.on('execute-task', async (taskData) => {
        try {
            const task = {
                id: `task_${Date.now()}`,
                type: taskData.agentType,
                input: taskData.input,
                priority: taskData.priority || 0,
                retries: 0,
                maxRetries: 3,
                timestamp: Date.now(),
            };
            socket.emit('task-started', { taskId: task.id });
            const result = await orchestrator.executeTask(task);
            await db.saveResult(task.id, task.type, result);
            socket.emit('task-completed', result);
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            socket.emit('task-error', { error: errorMsg });
        }
    });
    socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
    });
});
// REST API Routes
// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        apiStatus: orchestrator.getApiRotationStatus(),
        queueStatus: orchestrator.getQueueStatus(),
    });
});
// Execute task
app.post('/api/tasks', async (req, res) => {
    try {
        const { agentType, input, userId } = req.body;
        const taskId = `task_${Date.now()}`;
        const task = {
            id: taskId,
            type: agentType,
            input,
            priority: 0,
            retries: 0,
            maxRetries: 3,
            timestamp: Date.now(),
        };
        if (userId) {
            await db.saveTask(taskId, userId, agentType, input);
        }
        // Execute in background
        orchestrator.executeTask(task).then(async (result) => {
            if (userId) {
                await db.saveResult(taskId, agentType, result);
            }
        });
        res.json({ taskId, status: 'queued' });
    }
    catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: errorMsg });
    }
});
// Get task results
app.get('/api/tasks/:taskId/results', async (req, res) => {
    try {
        const results = await db.getTaskResults(req.params.taskId);
        res.json(results);
    }
    catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: errorMsg });
    }
});
// Get user tasks
app.get('/api/users/:userId/tasks', async (req, res) => {
    try {
        const tasks = await db.getUserTasks(req.params.userId);
        res.json(tasks);
    }
    catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: errorMsg });
    }
});
// Batch execute tasks
app.post('/api/tasks/batch', async (req, res) => {
    try {
        const { tasks } = req.body;
        const agentTasks = tasks.map((t) => ({
            id: `task_${Date.now()}_${Math.random()}`,
            type: t.agentType,
            input: t.input,
            priority: t.priority || 0,
            retries: 0,
            maxRetries: 3,
            timestamp: Date.now(),
        }));
        const results = await orchestrator.executeBatch(agentTasks);
        res.json(results);
    }
    catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: errorMsg });
    }
});
// Start server
const PORT = constants_1.CONFIG.PORT;
httpServer.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}`);
    logger.info(`Environment: ${constants_1.CONFIG.NODE_ENV}`);
    logger.info(`API Rotation Status: ${JSON.stringify(orchestrator.getApiRotationStatus())}`);
});
// Graceful shutdown
process.on('SIGINT', async () => {
    logger.info('Shutting down gracefully...');
    httpServer.close();
    await db.close();
    process.exit(0);
});
//# sourceMappingURL=server.js.map