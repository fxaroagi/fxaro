import { BaseAgent, AgentTask, AgentResult } from './BaseAgent';
import { Logger } from 'winston';
export declare class ContentCreatorAgent extends BaseAgent {
    private apiKey;
    constructor(logger: Logger);
    execute(task: AgentTask): Promise<AgentResult>;
    private createContent;
}
//# sourceMappingURL=ContentCreatorAgent.d.ts.map