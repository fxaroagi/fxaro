import { BaseAgent, AgentTask, AgentResult } from './BaseAgent';
import { Logger } from 'winston';
export declare class ResultFormatterAgent extends BaseAgent {
    constructor(logger: Logger);
    execute(task: AgentTask): Promise<AgentResult>;
    private formatResult;
    private formatAsJson;
    private formatAsMarkdown;
    private formatAsHtml;
    private formatAsCsv;
    private formatAsText;
}
//# sourceMappingURL=ResultFormatterAgent.d.ts.map