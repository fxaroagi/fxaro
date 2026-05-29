import { Logger } from 'winston';
export declare class DatabaseService {
    private db;
    private logger;
    constructor(logger: Logger);
    private initialize;
    saveUser(id: string, username: string, email: string, passwordHash: string): Promise<void>;
    getUser(username: string): Promise<any>;
    saveTask(id: string, userId: string, agentType: string, input: any): Promise<void>;
    saveResult(taskId: string, agentType: string, result: any): Promise<void>;
    getTaskResults(taskId: string): Promise<any[]>;
    getUserTasks(userId: string): Promise<any[]>;
    logApiCall(provider: string, model: string, inputTokens: number, outputTokens: number, cost: number): Promise<void>;
    close(): Promise<void>;
}
//# sourceMappingURL=DatabaseService.d.ts.map