import { BaseAgent, AgentTask, AgentResult } from './BaseAgent';
import { Logger } from 'winston';
export declare class TaskPlannerAgent extends BaseAgent {
    private apiKey;
    constructor(logger: Logger);
    execute(task: AgentTask): Promise<AgentResult>;
    private planTask;
}
//# sourceMappingURL=TaskPlannerAgent.d.ts.map