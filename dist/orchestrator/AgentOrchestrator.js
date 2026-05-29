"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentOrchestrator = void 0;
const TaskPlannerAgent_1 = require("../agents/TaskPlannerAgent");
const WebNavigatorAgent_1 = require("../agents/WebNavigatorAgent");
const DataAnalystAgent_1 = require("../agents/DataAnalystAgent");
const ContentCreatorAgent_1 = require("../agents/ContentCreatorAgent");
const CodeExecutorAgent_1 = require("../agents/CodeExecutorAgent");
const MediaGeneratorAgent_1 = require("../agents/MediaGeneratorAgent");
const ResultFormatterAgent_1 = require("../agents/ResultFormatterAgent");
const ApiRotationManager_1 = require("./ApiRotationManager");
const constants_1 = require("../config/constants");
class AgentOrchestrator {
    constructor(logger) {
        this.agents = new Map();
        this.taskQueue = [];
        this.executing = false;
        this.logger = logger;
        this.apiRotationManager = new ApiRotationManager_1.ApiRotationManager(logger);
        this.initializeAgents();
    }
    initializeAgents() {
        this.agents.set(constants_1.AGENT_TYPES.TASK_PLANNER, new TaskPlannerAgent_1.TaskPlannerAgent(this.logger));
        this.agents.set(constants_1.AGENT_TYPES.WEB_NAVIGATOR, new WebNavigatorAgent_1.WebNavigatorAgent(this.logger));
        this.agents.set(constants_1.AGENT_TYPES.DATA_ANALYST, new DataAnalystAgent_1.DataAnalystAgent(this.logger));
        this.agents.set(constants_1.AGENT_TYPES.CONTENT_CREATOR, new ContentCreatorAgent_1.ContentCreatorAgent(this.logger));
        this.agents.set(constants_1.AGENT_TYPES.CODE_EXECUTOR, new CodeExecutorAgent_1.CodeExecutorAgent(this.logger));
        this.agents.set(constants_1.AGENT_TYPES.MEDIA_GENERATOR, new MediaGeneratorAgent_1.MediaGeneratorAgent(this.logger));
        this.agents.set(constants_1.AGENT_TYPES.RESULT_FORMATTER, new ResultFormatterAgent_1.ResultFormatterAgent(this.logger));
        this.logger.info('AgentOrchestrator initialized with 7 agents');
    }
    async executeTask(task) {
        const agent = this.agents.get(task.type);
        if (!agent) {
            this.logger.error(`Unknown agent type: ${task.type}`);
            return {
                taskId: task.id,
                agentType: task.type,
                status: 'error',
                output: null,
                error: `Unknown agent type: ${task.type}`,
                executionTime: 0,
                timestamp: Date.now(),
            };
        }
        try {
            const result = await agent.execute(task);
            this.logger.info(`Task ${task.id} completed with status: ${result.status}`);
            return result;
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Task ${task.id} failed: ${errorMsg}`);
            return {
                taskId: task.id,
                agentType: task.type,
                status: 'error',
                output: null,
                error: errorMsg,
                executionTime: 0,
                timestamp: Date.now(),
            };
        }
    }
    async executeBatch(tasks) {
        const results = [];
        for (const task of tasks) {
            const result = await this.executeTask(task);
            results.push(result);
        }
        return results;
    }
    queueTask(task) {
        this.taskQueue.push(task);
        this.logger.info(`Task queued: ${task.id}`);
        this.processQueue();
    }
    async processQueue() {
        if (this.executing || this.taskQueue.length === 0)
            return;
        this.executing = true;
        try {
            while (this.taskQueue.length > 0) {
                const task = this.taskQueue.shift();
                if (task) {
                    await this.executeTask(task);
                }
            }
        }
        finally {
            this.executing = false;
        }
    }
    getApiRotationStatus() {
        return this.apiRotationManager.getProviderStatus();
    }
    resetApiRotation() {
        this.apiRotationManager.resetAllProviders();
    }
    getQueueStatus() {
        return {
            queueLength: this.taskQueue.length,
            executing: this.executing,
        };
    }
}
exports.AgentOrchestrator = AgentOrchestrator;
//# sourceMappingURL=AgentOrchestrator.js.map