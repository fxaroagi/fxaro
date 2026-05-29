import { BaseAgent, AgentTask, AgentResult } from './BaseAgent';
import { Logger } from 'winston';
export declare class DataAnalystAgent extends BaseAgent {
    private apiKey;
    constructor(logger: Logger);
    execute(task: AgentTask): Promise<AgentResult>;
    private analyzeData;
}
//# sourceMappingURL=DataAnalystAgent.d.ts.map