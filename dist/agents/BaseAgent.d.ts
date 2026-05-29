import { Logger } from 'winston';
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
export declare abstract class BaseAgent {
    protected agentType: string;
    protected logger: Logger;
    constructor(agentType: string, logger: Logger);
    abstract execute(task: AgentTask): Promise<AgentResult>;
    protected retryable<T>(fn: () => Promise<T>, retries?: number): Promise<T>;
    protected createResult(taskId: string, status: 'success' | 'error' | 'pending', output: any, startTime: number, error?: string): AgentResult;
}
//# sourceMappingURL=BaseAgent.d.ts.map