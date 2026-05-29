import { BaseAgent, AgentTask, AgentResult } from './BaseAgent';
import { Logger } from 'winston';
import axios from 'axios';
import { CONFIG } from '../config/constants';

export class MediaGeneratorAgent extends BaseAgent {
  private replicateKey: string;
  private hfKey: string;

  constructor(logger: Logger) {
    super('media-generator', logger);
    this.replicateKey = CONFIG.APIS.REPLICATE_API_KEY || '';
    this.hfKey = CONFIG.APIS.HUGGINGFACE_API_KEY || '';
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    const startTime = Date.now();
    try {
      this.logger.info(`MediaGeneratorAgent generating: ${task.input.mediaType}`);

      const mediaUrl = await this.generateMedia(task.input);

      return this.createResult(
        task.id,
        'success',
        {
          mediaType: task.input.mediaType,
          mediaUrl,
        },
        startTime
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`MediaGeneratorAgent error: ${errorMsg}`);
      return this.createResult(
        task.id,
        'error',
        null,
        startTime,
        errorMsg
      );
    }
  }

  private async generateMedia(input: any): Promise<string> {
    const { mediaType, prompt } = input;

    if (mediaType === 'image') {
      return await this.generateImage(prompt);
    } else if (mediaType === 'video') {
      return await this.generateVideo(prompt);
    } else {
      throw new Error(`Unsupported media type: ${mediaType}`);
    }
  }

  private async generateImage(prompt: string): Promise<string> {
    try {
      const response = await this.retryable(() =>
        axios.post(
          'https://api.replicate.com/v1/predictions',
          {
            version: 'fluxpro',
            input: {
              prompt,
              guidance: 7.5,
              num_outputs: 1,
            },
          },
          {
            headers: {
              'Authorization': `Token ${this.replicateKey}`,
              'Content-Type': 'application/json',
            },
          }
        )
      );

      return response.data.output[0] || response.data.urls?.[0] || '';
    } catch (error) {
      this.logger.error(`Failed to generate image: ${error}`);
      throw error;
    }
  }

  private async generateVideo(prompt: string): Promise<string> {
    try {
      const response = await this.retryable(() =>
        axios.post(
          'https://api-inference.huggingface.co/models/damo-vilab/text-to-video-ms-1.7b',
          { inputs: prompt },
          {
            headers: {
              'Authorization': `Bearer ${this.hfKey}`,
            },
          }
        )
      );

      return response.data[0]?.url || '';
    } catch (error) {
      this.logger.error(`Failed to generate video: ${error}`);
      throw error;
    }
  }
}
