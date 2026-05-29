"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeExecutorAgent = void 0;
const BaseAgent_1 = require("./BaseAgent");
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("../config/constants");
class CodeExecutorAgent extends BaseAgent_1.BaseAgent {
    constructor(logger) {
        super('code-executor', logger);
        this.apiKey = constants_1.CONFIG.APIS.OPENROUTER_API_KEY || '';
    }
    async execute(task) {
        const startTime = Date.now();
        try {
            this.logger.info(`CodeExecutorAgent executing: ${task.input.language}`);
            const code = await this.generateCode(task.input);
            return this.createResult(task.id, 'success', {
                language: task.input.language,
                code,
                lineCount: code.split('\n').length,
            }, startTime);
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`CodeExecutorAgent error: ${errorMsg}`);
            return this.createResult(task.id, 'error', null, startTime, errorMsg);
        }
    }
    async generateCode(input) {
        const prompt = `Generate ${input.language} code with the following requirements:
Purpose: ${input.purpose}
Functionality: ${input.functionality}
Libraries: ${input.libraries?.join(', ') || 'any'}

Provide clean, well-commented, production-ready code.`;
        try {
            const response = await this.retryable(() => axios_1.default.post('https://openrouter.ai/api/v1/chat/completions', {
                model: 'openrouter/auto',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 3000,
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': 'https://openclaw.local',
                },
            }));
            let content = response.data.choices[0].message.content;
            // Extract code block if wrapped in markdown
            const codeMatch = content.match(/```[\w]*\n?([\s\S]*?)\n?```/);
            if (codeMatch) {
                content = codeMatch[1];
            }
            return content;
        }
        catch (error) {
            this.logger.error(`Failed to generate code: ${error}`);
            throw error;
        }
    }
}
exports.CodeExecutorAgent = CodeExecutorAgent;
//# sourceMappingURL=CodeExecutorAgent.js.map