"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataAnalystAgent = void 0;
const BaseAgent_1 = require("./BaseAgent");
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("../config/constants");
class DataAnalystAgent extends BaseAgent_1.BaseAgent {
    constructor(logger) {
        super('data-analyst', logger);
        this.apiKey = constants_1.CONFIG.APIS.GROQ_API_KEY || '';
    }
    async execute(task) {
        const startTime = Date.now();
        try {
            this.logger.info(`DataAnalystAgent analyzing: ${task.input.type}`);
            const analysis = await this.analyzeData(task.input);
            return this.createResult(task.id, 'success', {
                dataType: task.input.type,
                analysis,
                insights: analysis.insights || [],
            }, startTime);
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`DataAnalystAgent error: ${errorMsg}`);
            return this.createResult(task.id, 'error', null, startTime, errorMsg);
        }
    }
    async analyzeData(input) {
        const dataString = typeof input.data === 'string'
            ? input.data
            : JSON.stringify(input.data);
        const prompt = `Analyze the following data and provide insights:
Type: ${input.type}
Data: ${dataString}

Provide:
1. Summary of key findings
2. Patterns or trends identified
3. Potential issues or concerns
4. Recommendations
Format response as JSON.`;
        try {
            const response = await this.retryable(() => axios_1.default.post('https://api.groq.com/openai/v1/chat/completions', {
                model: 'mixtral-8x7b-32768',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.5,
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                },
            }));
            const content = response.data.choices[0].message.content;
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return { analysis: content };
        }
        catch (error) {
            this.logger.error(`Failed to analyze data: ${error}`);
            return { error: 'Analysis failed', rawData: dataString };
        }
    }
}
exports.DataAnalystAgent = DataAnalystAgent;
//# sourceMappingURL=DataAnalystAgent.js.map