import { BaseAgent, AgentTask, AgentResult } from './BaseAgent';
import { Logger } from 'winston';
export declare class MediaGeneratorAgent extends BaseAgent {
    private replicateKey;
    private hfKey;
    constructor(logger: Logger);
    execute(task: AgentTask): Promise<AgentResult>;
    private generateMedia;
    private generateImage;
    private generateVideo;
}
//# sourceMappingURL=MediaGeneratorAgent.d.ts.map