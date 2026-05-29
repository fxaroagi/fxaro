import { BaseAgent, AgentTask, AgentResult } from './BaseAgent';
import { Logger } from 'winston';
import axios from 'axios';
import { CONFIG } from '../config/constants';

export class TaskPlannerAgent extends BaseAgent {
  private apiKey: string;

  constructor(logger: Logger) {
    super('task-planner', logger);
    this.apiKey = CONFIG.APIS.OPENROUTER_API_KEY || '';
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    const startTime = Date.now();
    try {
      this.logger.info(`TaskPlannerAgent executing task: ${task.id}`);

      const subtasks = await this.planTask(task.input);

      return this.createResult(
        task.id,
        'success',
        {
          originalTask: task.input,
          subtasks,
          subtaskCount: subtasks.length,
        },
        startTime
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`TaskPlannerAgent error: ${errorMsg}`);
      return this.createResult(
        task.id,
        'error',
        null,
        startTime,
        errorMsg
      );
    }
  }

  private async planTask(input: string): Promise<any[]> {
    const prompt = `Break down this task into actionable subtasks with clear steps:
"${input}"

Respond with a JSON array of subtasks, each with:
- title: string
- description: string
- steps: string[]
- estimatedDuration: number (in seconds)`;

    try {
      const response = await this.retryable(() =>
        axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: 'openrouter/auto',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'HTTP-Referer': 'https://openclaw.local',
            },
          }
        )
      );

      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [];
    } catch (error) {
      this.logger.error(`Failed to plan task: ${error}`);
      throw error;
    }
  }
}
