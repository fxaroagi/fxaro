import { BaseAgent, AgentTask, AgentResult } from './BaseAgent';
import { Logger } from 'winston';
import axios from 'axios';
import { CONFIG } from '../config/constants';

export class CodeExecutorAgent extends BaseAgent {
  private apiKey: string;

  constructor(logger: Logger) {
    super('code-executor', logger);
    this.apiKey = CONFIG.APIS.OPENROUTER_API_KEY || '';
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    const startTime = Date.now();
    try {
      this.logger.info(`CodeExecutorAgent executing: ${task.input.language}`);

      const code = await this.generateCode(task.input);

      return this.createResult(
        task.id,
        'success',
        {
          language: task.input.language,
          code,
          lineCount: code.split('\n').length,
        },
        startTime
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`CodeExecutorAgent error: ${errorMsg}`);
      return this.createResult(
        task.id,
        'error',
        null,
        startTime,
        errorMsg
      );
    }
  }

  private async generateCode(input: any): Promise<string> {
    const prompt = `Generate ${input.language} code with the following requirements:
Purpose: ${input.purpose}
Functionality: ${input.functionality}
Libraries: ${input.libraries?.join(', ') || 'any'}

Provide clean, well-commented, production-ready code.`;

    try {
      const response = await this.retryable(() =>
        axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: 'openrouter/auto',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 3000,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'HTTP-Referer': 'https://openclaw.local',
            },
          }
        )
      );

      let content = response.data.choices[0].message.content;
      // Extract code block if wrapped in markdown
      const codeMatch = content.match(/```[\w]*\n?([\s\S]*?)\n?```/);
      if (codeMatch) {
        content = codeMatch[1];
      }
      return content;
    } catch (error) {
      this.logger.error(`Failed to generate code: ${error}`);
      throw error;
    }
  }
}
