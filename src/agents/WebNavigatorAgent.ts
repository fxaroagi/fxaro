import { BaseAgent, AgentTask, AgentResult } from './BaseAgent';
import { Logger } from 'winston';
import axios from 'axios';
import * as cheerio from 'cheerio';

export class WebNavigatorAgent extends BaseAgent {
  constructor(logger: Logger) {
    super('web-navigator', logger);
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    const startTime = Date.now();
    try {
      this.logger.info(`WebNavigatorAgent fetching: ${task.input.url}`);

      const content = await this.fetchAndParse(task.input.url, task.input.selector);

      return this.createResult(
        task.id,
        'success',
        {
          url: task.input.url,
          content,
          contentLength: content.length,
        },
        startTime
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`WebNavigatorAgent error: ${errorMsg}`);
      return this.createResult(
        task.id,
        'error',
        null,
        startTime,
        errorMsg
      );
    }
  }

  private async fetchAndParse(url: string, selector?: string): Promise<any> {
    const response = await this.retryable(() =>
      axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      })
    );

    const $ = cheerio.load(response.data);

    if (selector) {
      return $(selector).map((i, elem) => $(elem).text()).get();
    }

    return {
      title: $('title').text(),
      headings: $('h1, h2, h3')
        .map((i, elem) => $(elem).text())
        .get(),
      links: $('a')
        .map((i, elem) => ({
          text: $(elem).text(),
          href: $(elem).attr('href'),
        }))
        .get(),
      text: $('body').text().substring(0, 5000),
    };
  }
}
