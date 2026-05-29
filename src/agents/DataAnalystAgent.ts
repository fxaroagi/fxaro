import { BaseAgent, AgentTask, AgentResult } from './BaseAgent';
import { Logger } from 'winston';
import axios from 'axios';
import { CONFIG } from '../config/constants';

export class DataAnalystAgent extends BaseAgent {
  private apiKey: string;

  constructor(logger: Logger) {
    super('data-analyst', logger);
    this.apiKey = CONFIG.APIS.GROQ_API_KEY || '';
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    const startTime = Date.now();
    try {
      this.logger.info(`DataAnalystAgent analyzing: ${task.input.type}`);

      const analysis = await this.analyzeData(task.input);

      return this.createResult(
        task.id,
        'success',
        {
          dataType: task.input.type,
          analysis,
          insights: analysis.insights || [],
        },
        startTime
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`DataAnalystAgent error: ${errorMsg}`);
      return this.createResult(
        task.id,
        'error',
        null,
        startTime,
        errorMsg
      );
    }
  }

  private async analyzeData(input: any): Promise<any> {
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
      const response = await this.retryable(() =>
        axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'mixtral-8x7b-32768',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.5,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
            },
          }
        )
      );

      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { analysis: content };
    } catch (error) {
      this.logger.error(`Failed to analyze data: ${error}`);
      return { error: 'Analysis failed', rawData: dataString };
    }
  }
}
