import { BaseAgent, AgentTask, AgentResult } from './BaseAgent';
import { Logger } from 'winston';
export declare class WebNavigatorAgent extends BaseAgent {
    constructor(logger: Logger);
    execute(task: AgentTask): Promise<AgentResult>;
    private fetchAndParse;
}
//# sourceMappingURL=WebNavigatorAgent.d.ts.map