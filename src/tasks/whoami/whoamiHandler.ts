/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
/* eslint-disable max-classes-per-file */
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate, MessagesPlaceholder, PromptTemplate } from 'langchain/prompts';
// import { OpenAI } from '@langchain/openai';
import { BufferWindowMemory } from 'langchain/memory';
import { ConversationChain } from 'langchain/chains';
import { SolveWhoamiCommand } from '../commands';
import * as config from '../config';
import { TaskDevClientProvider } from '../../core/clients/taskDevClient';
import { BaseTaskHandler } from '../../core/handler/baseTaskHandler';

const TASK_NAME = 'whoami';

export class SolveWhoamiCommandHandlerProvider {
  async provide(): Promise<SolveWhoamiCommandHandler> {
    return new SolveWhoamiCommandHandler(
      await new TaskDevClientProvider().provide({
        baseUrl: config.baseConfig.BASE_URL,
        apiKey: config.baseConfig.API_KEY,
      }),
      TASK_NAME
    );
  }
}

type SolveWhoamiTask = {
  hint: string;
};

type SolveWhoamiAnswer = {
  answer: string;
};

const promptTemplate = `
You will be given a trivia item about a certain person and famous person. Try to guess who the person is. If you do not know return NO and nothing more. Do Not guess, you must be absolute sure! If you know the answer, return the name of the person and nothing more.
`;

const inputHumanTemplate = `
### hint {hintNo}: {hint} ###
Do you know who the person is? If so, who is it?
`;

const humanTemplate = `{input}`;

export class SolveWhoamiCommandHandler extends BaseTaskHandler<SolveWhoamiCommand, SolveWhoamiTask, SolveWhoamiAnswer> {
  private async getNewHint(): Promise<string> {
    const task = await this.getTask(TASK_NAME);
    return task.hint;
  }

  async solve(command: SolveWhoamiCommand, task: SolveWhoamiTask): Promise<SolveWhoamiAnswer> {
    const chat = new ChatOpenAI();
    const memory = new BufferWindowMemory({ k: 10 });

    let { hint } = task;

    const chatPrompt = ChatPromptTemplate.fromMessages([
      ['system', promptTemplate],
      ['human', humanTemplate],
    ]);

    const chain = new ConversationChain({ llm: chat, memory, prompt: chatPrompt });

    let tries = 0;
    do {
      const userInputTemplate = await PromptTemplate.fromTemplate(inputHumanTemplate).format({
        hintNo: tries + 1,
        hint,
      });

      console.log('User input:', userInputTemplate);

      const { response } = await chain.call({ input: userInputTemplate });

      console.log('AI Response:', response);

      if (response !== 'NO') {
        return { answer: response as string };
      }

      hint = await this.getNewHint();

      await new Promise((resolve) => setTimeout(resolve, 1000));
      tries += 1;
    } while (tries < 10);

    throw new Error('Could not solve the task');
  }
}
