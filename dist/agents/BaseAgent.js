"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAgent = void 0;
class BaseAgent {
    constructor(agentType, logger) {
        this.agentType = agentType;
        this.logger = logger;
    }
    async retryable(fn, retries = 3) {
        let lastError = null;
        for (let i = 0; i < retries; i++) {
            try {
                return await fn();
            }
            catch (error) {
                lastError = error;
                this.logger.warn(`Retry ${i + 1}/${retries} for agent ${this.agentType}: ${lastError.message}`);
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
            }
        }
        throw lastError;
    }
    createResult(taskId, status, output, startTime, error) {
        return {
            taskId,
            agentType: this.agentType,
            status,
            output,
            error,
            executionTime: Date.now() - startTime,
            timestamp: Date.now(),
        };
    }
}
exports.BaseAgent = BaseAgent;
//# sourceMappingURL=BaseAgent.js.map