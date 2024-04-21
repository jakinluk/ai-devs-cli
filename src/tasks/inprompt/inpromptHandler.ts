/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
/* eslint-disable max-classes-per-file */
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { SolveInpromptCommand } from '../commands';
import * as config from '../config';
import { TaskDevClientProvider } from '../../core/clients/taskDevClient';
import { BaseTaskHandler } from '../../core/handler/baseTaskHandler';

const TASK_NAME = 'inprompt';

export class SolveInpromptCommandHandlerProvider {
  async provide(): Promise<SolveInpromptCommandHandler> {
    return new SolveInpromptCommandHandler(
      await new TaskDevClientProvider().provide({
        baseUrl: config.baseConfig.BASE_URL,
        apiKey: config.baseConfig.API_KEY,
      }),
      TASK_NAME
    );
  }
}

type SolveInpromptTask = {
  input: string[];
  question: string;
};

type SolveInpromptAnswer = {
  answer: string;
};

const determineNameForContextPrompt = `
Please determine the name of the person who the question is about.
Query: {query}
Name of the person: `;

const answerBasedOnTheContextPrompt = `
Answer the question based on the context provided. If the context does not provide information about the person, please say tha you do not have enough information.
Context###
{context}
####
Question: {question}
Answer: `;

export class SolveInpromptCommandHandler extends BaseTaskHandler<
  SolveInpromptCommand,
  SolveInpromptTask,
  SolveInpromptAnswer
> {
  async solve(command: SolveInpromptCommand, task: SolveInpromptTask): Promise<SolveInpromptAnswer> {
    const { input, question } = task;
    const groupedByName = this.groupByName(input);

    const chat = new ChatOpenAI();
    const determineContextPrompt = ChatPromptTemplate.fromMessages([['system', determineNameForContextPrompt]]);
    let formattedChatPrompt = await determineContextPrompt.formatMessages({
      query: question,
    });

    const { content: name } = await chat.invoke(formattedChatPrompt);
    console.log(name);

    const matchingInput = groupedByName[name as string];

    const answerPrompt = ChatPromptTemplate.fromMessages([['system', answerBasedOnTheContextPrompt]]);
    formattedChatPrompt = await answerPrompt.formatMessages({
      context: matchingInput ? matchingInput.join('\n') : 'No information about the person',
      question,
    });

    const { content: answer } = await chat.invoke(formattedChatPrompt);
    return { answer: answer as string };
  }

  private groupByName(string): Record<string, string[]> {
    return string.reduce((acc, curr) => {
      const [name] = curr.split(' ');
      if (acc[name]) {
        acc[name].push(curr);
      } else {
        acc[name] = [curr];
      }
      return acc;
    }, {});
  }
}
