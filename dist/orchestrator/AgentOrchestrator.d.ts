import { Logger } from 'winston';
import { AgentTask, AgentResult } from '../agents/BaseAgent';
export declare class AgentOrchestrator {
    private agents;
    private apiRotationManager;
    private logger;
    private taskQueue;
    private executing;
    constructor(logger: Logger);
    private initializeAgents;
    executeTask(task: AgentTask): Promise<AgentResult>;
    executeBatch(tasks: AgentTask[]): Promise<AgentResult[]>;
    queueTask(task: AgentTask): void;
    private processQueue;
    getApiRotationStatus(): Record<string, any>;
    resetApiRotation(): void;
    getQueueStatus(): {
        queueLength: number;
        executing: boolean;
    };
}
//# sourceMappingURL=AgentOrchestrator.d.ts.map