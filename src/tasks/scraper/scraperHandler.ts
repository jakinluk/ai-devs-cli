/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
/* eslint-disable max-classes-per-file */
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { SolveScraperCommand } from '../commands';
import * as config from '../config';
import { TaskDevClientProvider } from '../../core/clients/taskDevClient';
import { BaseTaskHandler } from '../../core/handler/baseTaskHandler';

const TASK_NAME = 'scraper';

export class SolveScraperCommandHandlerProvider {
  async provide(): Promise<SolveScraperCommandHandler> {
    return new SolveScraperCommandHandler(
      await new TaskDevClientProvider().provide({
        baseUrl: config.baseConfig.BASE_URL,
        apiKey: config.baseConfig.API_KEY,
      }),
      TASK_NAME
    );
  }
}

type SolveScraperTask = {
  msg: string;
  input: string;
  question: string;
};

type SolveScraperAnswer = {
  answer: string;
};

const promptTemplate = `
{originalSystemInstruction}
###ARTICLE:
{article}
###

Question:
`;

const humanTemplate = `
{question} 
`;

export class SolveScraperCommandHandler extends BaseTaskHandler<
  SolveScraperCommand,
  SolveScraperTask,
  SolveScraperAnswer
> {
  private async getContextFromUrl(contextUrl: string): Promise<string> {
    const maxRetries = 5;
    let retries = 0;
    let response: Response = null;
    while (retries < maxRetries) {
      try {
        response = await fetch(contextUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          },
        });
        console.log('Response:', response.status);
        if (response.status === 200) break;
        await new Promise((resolve) => setTimeout(resolve, 1000));
        retries += 1;
      } catch (error) {
        console.log('Error fetching context:', error);
        retries += 1;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    return response.text();
  }

  async solve(command: SolveScraperCommand, task: SolveScraperTask): Promise<SolveScraperAnswer> {
    const { msg: originalSystemInstruction, input: contextUrl, question } = task;

    const context = await this.getContextFromUrl(contextUrl);

    console.log('Context:', context);

    const chatPrompt = ChatPromptTemplate.fromMessages([
      ['system', promptTemplate],
      ['human', humanTemplate],
    ]);

    const formattedChatPrompt = await chatPrompt.formatMessages({
      originalSystemInstruction,
      article: context,
      question,
    });

    console.log('Formatted chat prompt:', JSON.stringify(formattedChatPrompt, null, 2));

    const chat = new ChatOpenAI();
    const { content } = await chat.invoke(formattedChatPrompt);

    return { answer: content as string };
  }
}
