import { Logger } from 'winston';
import { AGENT_TYPES } from '../config/constants';

export interface AgentTask {
  id: string;
  type: string;
  input: any;
  priority: number;
  retries: number;
  maxRetries: number;
  timestamp: number;
}

export interface AgentResult {
  taskId: string;
  agentType: string;
  status: 'success' | 'error' | 'pending';
  output: any;
  error?: string;
  executionTime: number;
  timestamp: number;
}

export abstract class BaseAgent {
  protected agentType: string;
  protected logger: Logger;

  constructor(agentType: string, logger: Logger) {
    this.agentType = agentType;
    this.logger = logger;
  }

  abstract execute(task: AgentTask): Promise<AgentResult>;

  protected async retryable<T>(
    fn: () => Promise<T>,
    retries: number = 3
  ): Promise<T> {
    let lastError: Error | null = null;
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(
          `Retry ${i + 1}/${retries} for agent ${this.agentType}: ${lastError.message}`
        );
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    throw lastError;
  }

  protected createResult(
    taskId: string,
    status: 'success' | 'error' | 'pending',
    output: any,
    startTime: number,
    error?: string
  ): AgentResult {
    return {
      taskId,
      agentType: this.agentType,
      status,
      output,
      error,
      executionTime: Date.now() - startTime,
      timestamp: Date.now(),
    };
  }
}
