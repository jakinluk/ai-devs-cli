/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
/* eslint-disable max-classes-per-file */
import { PromptTemplate } from 'langchain/prompts';
import { LLMChain } from 'langchain/chains';
import { ChatOpenAI } from '@langchain/openai';
import { SolveLiarCommand } from '../commands';
import * as config from '../config';
import { TaskDevClientProvider } from '../../core/clients/taskDevClient';
import { BaseTaskHandler } from '../../core/handler/baseTaskHandler';

const TASK_NAME = 'liar';

export class SolveLiarCommandHandlerProvider {
  async provide(): Promise<SolveLiarCommandHandler> {
    return new SolveLiarCommandHandler(
      await new TaskDevClientProvider().provide({
        baseUrl: config.baseConfig.BASE_URL,
        apiKey: config.baseConfig.API_KEY,
      }),
      TASK_NAME
    );
  }
}

type SolveLiarTask = {};

type SolveLiarAnswer = {
  answer: 'YES' | 'NO';
};

const guardPromot = `
If the assistant's response was off-topic, answer "NO"; otherwise, answer "YES".
user: {question}
assistant: {answer}
`;

export class SolveLiarCommandHandler extends BaseTaskHandler<SolveLiarCommand, SolveLiarTask, SolveLiarAnswer> {
  async solve(command: SolveLiarCommand, task: SolveLiarTask): Promise<SolveLiarAnswer> {
    const { answer } = await this.taskDevClient.submitFromData(
      { token: this.activeToken },
      { question: command.question }
    );
    console.log(`The answer is: ${answer}`);

    // Guardrails
    const prompt = PromptTemplate.fromTemplate(guardPromot);
    const chat = new ChatOpenAI();
    const chain = new LLMChain({ llm: chat, prompt });
    const { text } = await chain.invoke({ question: command.question, answer });
    console.log(`Was this answer relevant?: ${text}`);
    if (!['YES', 'NO'].includes(text)) {
      throw new Error('Unexpected guardrail response');
    }

    return { answer: text };
  }
}
