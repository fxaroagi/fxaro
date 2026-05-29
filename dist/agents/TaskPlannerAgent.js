"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskPlannerAgent = void 0;
const BaseAgent_1 = require("./BaseAgent");
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("../config/constants");
class TaskPlannerAgent extends BaseAgent_1.BaseAgent {
    constructor(logger) {
        super('task-planner', logger);
        this.apiKey = constants_1.CONFIG.APIS.OPENROUTER_API_KEY || '';
    }
    async execute(task) {
        const startTime = Date.now();
        try {
            this.logger.info(`TaskPlannerAgent executing task: ${task.id}`);
            const subtasks = await this.planTask(task.input);
            return this.createResult(task.id, 'success', {
                originalTask: task.input,
                subtasks,
                subtaskCount: subtasks.length,
            }, startTime);
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`TaskPlannerAgent error: ${errorMsg}`);
            return this.createResult(task.id, 'error', null, startTime, errorMsg);
        }
    }
    async planTask(input) {
        const prompt = `Break down this task into actionable subtasks with clear steps:
"${input}"

Respond with a JSON array of subtasks, each with:
- title: string
- description: string
- steps: string[]
- estimatedDuration: number (in seconds)`;
        try {
            const response = await this.retryable(() => axios_1.default.post('https://openrouter.ai/api/v1/chat/completions', {
                model: 'openrouter/auto',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': 'https://openclaw.local',
                },
            }));
            const content = response.data.choices[0].message.content;
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return [];
        }
        catch (error) {
            this.logger.error(`Failed to plan task: ${error}`);
            throw error;
        }
    }
}
exports.TaskPlannerAgent = TaskPlannerAgent;
//# sourceMappingURL=TaskPlannerAgent.js.map