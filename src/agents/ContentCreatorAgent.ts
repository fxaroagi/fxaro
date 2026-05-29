import { BaseAgent, AgentTask, AgentResult } from './BaseAgent';
import { Logger } from 'winston';
import axios from 'axios';
import { CONFIG } from '../config/constants';

export class ContentCreatorAgent extends BaseAgent {
  private apiKey: string;

  constructor(logger: Logger) {
    super('content-creator', logger);
    this.apiKey = CONFIG.APIS.OPENROUTER_API_KEY || '';
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    const startTime = Date.now();
    try {
      this.logger.info(`ContentCreatorAgent creating: ${task.input.contentType}`);

      const content = await this.createContent(task.input);

      return this.createResult(
        task.id,
        'success',
        {
          contentType: task.input.contentType,
          content,
          wordCount: content.split(' ').length,
        },
        startTime
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`ContentCreatorAgent error: ${errorMsg}`);
      return this.createResult(
        task.id,
        'error',
        null,
        startTime,
        errorMsg
      );
    }
  }

  private async createContent(input: any): Promise<string> {
    const prompt = `Create ${input.contentType} content with the following requirements:
Topic: ${input.topic}
Style: ${input.style || 'professional'}
Length: ${input.length || 'medium'}
Keywords: ${input.keywords?.join(', ') || 'none'}

Provide high-quality, original content that is engaging and valuable.`;

    try {
      const response = await this.retryable(() =>
        axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: 'openrouter/auto',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.8,
            max_tokens: 2000,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'HTTP-Referer': 'https://openclaw.local',
            },
          }
        )
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      this.logger.error(`Failed to create content: ${error}`);
      throw error;
    }
  }
}
