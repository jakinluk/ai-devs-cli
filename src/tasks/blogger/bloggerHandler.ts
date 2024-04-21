/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
/* eslint-disable max-classes-per-file */
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { SolveBloggerCommand } from '../commands';
import * as config from '../config';
import { TaskDevClientProvider } from '../../core/clients/taskDevClient';
import { BaseTaskHandler } from '../../core/handler/baseTaskHandler';

const TASK_NAME = 'blogger';

export class SolveBloggerCommandHandlerProvider {
  async provide(): Promise<SolveBloggerCommandHandler> {
    return new SolveBloggerCommandHandler(
      await new TaskDevClientProvider().provide({
        baseUrl: config.baseConfig.BASE_URL,
        apiKey: config.baseConfig.API_KEY,
      }),
      TASK_NAME
    );
  }
}

type SolveBloggerTask = {
  blog: string[];
};

type SolveBloggerAnswer = {
  answer: string[];
};

const promptTemplate = `
You are a blogger specializing in {specjalization}. You will be given the title and your task is to write the chapter for it. A chapter's content should be just a few sentences.
Respond in Polish.
`;

const humanTemplate = `
{chapter} 
`;

export class SolveBloggerCommandHandler extends BaseTaskHandler<
  SolveBloggerCommand,
  SolveBloggerTask,
  SolveBloggerAnswer
> {
  async solve(command: SolveBloggerCommand, task: SolveBloggerTask): Promise<SolveBloggerAnswer> {
    const chatPrompt = ChatPromptTemplate.fromMessages([
      ['system', promptTemplate],
      ['human', humanTemplate],
    ]);

    const chapters = [];
    for (let i = 0; i < task.blog.length; i += 1) {
      const formattedChatPrompt = await chatPrompt.formatMessages({
        context: '',
        specjalization: 'Italian cuisine',
        chapter: task.blog[i],
      });

      const chat = new ChatOpenAI();
      const { content } = await chat.invoke(formattedChatPrompt);
      console.log(content);
      chapters.push(content);
    }

    return { answer: chapters };
  }
}
