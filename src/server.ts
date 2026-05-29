import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import * as fs from 'fs';
import { CONFIG } from './config/constants';
import { LoggerService } from './services/LoggerService';
import { DatabaseService } from './services/DatabaseService';
import { AgentOrchestrator } from './orchestrator/AgentOrchestrator';
import { AgentTask } from './agents/BaseAgent';
import dotenv from 'dotenv';

dotenv.config();

const loggerService = new LoggerService('OpenClaw');
const logger = loggerService.getLogger();
const db = new DatabaseService(logger);
const orchestrator = new AgentOrchestrator(logger);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Create logs directory if it doesn't exist
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// WebSocket events
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('execute-task', async (taskData) => {
    try {
      const task: AgentTask = {
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
    } catch (error) {
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
    const task: AgentTask = {
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
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMsg });
  }
});

// Get task results
app.get('/api/tasks/:taskId/results', async (req, res) => {
  try {
    const results = await db.getTaskResults(req.params.taskId);
    res.json(results);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMsg });
  }
});

// Get user tasks
app.get('/api/users/:userId/tasks', async (req, res) => {
  try {
    const tasks = await db.getUserTasks(req.params.userId);
    res.json(tasks);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMsg });
  }
});

// Batch execute tasks
app.post('/api/tasks/batch', async (req, res) => {
  try {
    const { tasks } = req.body;
    const agentTasks: AgentTask[] = tasks.map((t: any) => ({
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
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMsg });
  }
});

// Start server
const PORT = CONFIG.PORT;
httpServer.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
  logger.info(`Environment: ${CONFIG.NODE_ENV}`);
  logger.info(`API Rotation Status: ${JSON.stringify(orchestrator.getApiRotationStatus())}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  httpServer.close();
  await db.close();
  process.exit(0);
});
