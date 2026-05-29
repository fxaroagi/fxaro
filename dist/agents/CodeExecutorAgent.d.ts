import { BaseAgent, AgentTask, AgentResult } from './BaseAgent';
import { Logger } from 'winston';
export declare class CodeExecutorAgent extends BaseAgent {
    private apiKey;
    constructor(logger: Logger);
    execute(task: AgentTask): Promise<AgentResult>;
    private generateCode;
}
//# sourceMappingURL=CodeExecutorAgent.d.ts.map