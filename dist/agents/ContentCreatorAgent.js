"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentCreatorAgent = void 0;
const BaseAgent_1 = require("./BaseAgent");
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("../config/constants");
class ContentCreatorAgent extends BaseAgent_1.BaseAgent {
    constructor(logger) {
        super('content-creator', logger);
        this.apiKey = constants_1.CONFIG.APIS.OPENROUTER_API_KEY || '';
    }
    async execute(task) {
        const startTime = Date.now();
        try {
            this.logger.info(`ContentCreatorAgent creating: ${task.input.contentType}`);
            const content = await this.createContent(task.input);
            return this.createResult(task.id, 'success', {
                contentType: task.input.contentType,
                content,
                wordCount: content.split(' ').length,
            }, startTime);
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`ContentCreatorAgent error: ${errorMsg}`);
            return this.createResult(task.id, 'error', null, startTime, errorMsg);
        }
    }
    async createContent(input) {
        const prompt = `Create ${input.contentType} content with the following requirements:
Topic: ${input.topic}
Style: ${input.style || 'professional'}
Length: ${input.length || 'medium'}
Keywords: ${input.keywords?.join(', ') || 'none'}

Provide high-quality, original content that is engaging and valuable.`;
        try {
            const response = await this.retryable(() => axios_1.default.post('https://openrouter.ai/api/v1/chat/completions', {
                model: 'openrouter/auto',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.8,
                max_tokens: 2000,
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': 'https://openclaw.local',
                },
            }));
            return response.data.choices[0].message.content;
        }
        catch (error) {
            this.logger.error(`Failed to create content: ${error}`);
            throw error;
        }
    }
}
exports.ContentCreatorAgent = ContentCreatorAgent;
//# sourceMappingURL=ContentCreatorAgent.js.map