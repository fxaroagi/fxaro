import { Logger } from 'winston';
import { BaseAgent, AgentTask, AgentResult } from '../agents/BaseAgent';
import { TaskPlannerAgent } from '../agents/TaskPlannerAgent';
import { WebNavigatorAgent } from '../agents/WebNavigatorAgent';
import { DataAnalystAgent } from '../agents/DataAnalystAgent';
import { ContentCreatorAgent } from '../agents/ContentCreatorAgent';
import { CodeExecutorAgent } from '../agents/CodeExecutorAgent';
import { MediaGeneratorAgent } from '../agents/MediaGeneratorAgent';
import { ResultFormatterAgent } from '../agents/ResultFormatterAgent';
import { ApiRotationManager } from './ApiRotationManager';
import { AGENT_TYPES } from '../config/constants';

export class AgentOrchestrator {
  private agents: Map<string, BaseAgent> = new Map();
  private apiRotationManager: ApiRotationManager;
  private logger: Logger;
  private taskQueue: AgentTask[] = [];
  private executing: boolean = false;

  constructor(logger: Logger) {
    this.logger = logger;
    this.apiRotationManager = new ApiRotationManager(logger);
    this.initializeAgents();
  }

  private initializeAgents() {
    this.agents.set(AGENT_TYPES.TASK_PLANNER, new TaskPlannerAgent(this.logger));
    this.agents.set(AGENT_TYPES.WEB_NAVIGATOR, new WebNavigatorAgent(this.logger));
    this.agents.set(AGENT_TYPES.DATA_ANALYST, new DataAnalystAgent(this.logger));
    this.agents.set(AGENT_TYPES.CONTENT_CREATOR, new ContentCreatorAgent(this.logger));
    this.agents.set(AGENT_TYPES.CODE_EXECUTOR, new CodeExecutorAgent(this.logger));
    this.agents.set(AGENT_TYPES.MEDIA_GENERATOR, new MediaGeneratorAgent(this.logger));
    this.agents.set(AGENT_TYPES.RESULT_FORMATTER, new ResultFormatterAgent(this.logger));

    this.logger.info('AgentOrchestrator initialized with 7 agents');
  }

  async executeTask(task: AgentTask): Promise<AgentResult> {
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
    } catch (error) {
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

  async executeBatch(tasks: AgentTask[]): Promise<AgentResult[]> {
    const results: AgentResult[] = [];
    for (const task of tasks) {
      const result = await this.executeTask(task);
      results.push(result);
    }
    return results;
  }

  queueTask(task: AgentTask) {
    this.taskQueue.push(task);
    this.logger.info(`Task queued: ${task.id}`);
    this.processQueue();
  }

  private async processQueue() {
    if (this.executing || this.taskQueue.length === 0) return;

    this.executing = true;
    try {
      while (this.taskQueue.length > 0) {
        const task = this.taskQueue.shift();
        if (task) {
          await this.executeTask(task);
        }
      }
    } finally {
      this.executing = false;
    }
  }

  getApiRotationStatus(): Record<string, any> {
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
