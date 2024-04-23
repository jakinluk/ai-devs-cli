/* eslint-disable no-underscore-dangle */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
/* eslint-disable max-classes-per-file */
import { ChatOpenAI } from '@langchain/openai';
// import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { BaseTaskHandler } from '../../core/handler/baseTaskHandler';
import { TaskDevClientProvider } from '../../core/clients/taskDevClient';
import * as config from '../config';
import { SolveGnomeCommand } from '../commands';

const TASK_NAME = 'gnome';

export class SolveGnomeCommandHandlerProvider {
  async provide(): Promise<SolveGnomeCommandHandler> {
    return new SolveGnomeCommandHandler(
      await new TaskDevClientProvider().provide({
        baseUrl: config.baseConfig.BASE_URL,
        apiKey: config.baseConfig.API_KEY,
      }),
      TASK_NAME
    );
  }
}

// {
//   "code": 0,
//   "msg": "I will give you a drawing of a gnome with a hat on his head. Tell me what is the color of the hat in POLISH. If any errors occur, return \"ERROR\" as answer",
//   "hint": "it won't always be a drawing of a gnome >:)",
//   "url": "https://tasks.aidevs.pl/gnome/a43cb95d1198a4d219a1022de2a05f29.png"
// }
type SolveGnomeTask = {
  url: string;
};

type SolveGnomeAnswer = {
  answer: string;
};

const model = new ChatOpenAI({
  modelName: 'gpt-4-turbo',
});

export class SolveGnomeCommandHandler extends BaseTaskHandler<SolveGnomeCommand, SolveGnomeTask, SolveGnomeAnswer> {
  async solve(command: SolveGnomeCommand, task: SolveGnomeTask): Promise<SolveGnomeAnswer> {
    const response = await model.invoke([
      new SystemMessage(
        'I will give you a drawing of a gnome with a hat on his head. Tell me what is the color of the hat in POLISH. If any errors occur, return "ERROR" as answer. Sometimes I will give you a drawing without a gnome. In that case, return "ERROR" as well.'
      ),
      new HumanMessage({
        content: [
          // { type: 'text', text: 'Describe the image in detail' },s
          {
            type: 'image_url',
            image_url: {
              url: task.url,
            },
          },
        ],
      }),
    ]);

    return { answer: response.content as string };
  }
}
