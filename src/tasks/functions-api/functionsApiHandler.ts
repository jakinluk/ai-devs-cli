/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
/* eslint-disable max-classes-per-file */
import { SolveFunctionsApiCommand } from '../commands';
import * as config from '../config';
import { TaskDevClientProvider } from '../../core/clients/taskDevClient';
import { BaseTaskHandler } from '../../core/handler/baseTaskHandler';

const TASK_NAME = 'functions';

export class SolveFunctionsApiCommandHandlerProvider {
  async provide(): Promise<SolveFunctionsApiCommandHandler> {
    return new SolveFunctionsApiCommandHandler(
      await new TaskDevClientProvider().provide({
        baseUrl: config.baseConfig.BASE_URL,
        apiKey: config.baseConfig.API_KEY,
      }),
      TASK_NAME
    );
  }
}

type SolveFunctionsApiTask = { dummy: string };

const schema = {
  name: 'addUser',
  description: 'Add multiple tasks to Todoist',
  parameters: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      surname: {
        type: 'string',
      },
      year: {
        type: 'integer',
      },
    },
  },
};

type SolveFunctionsApiAnswer = {
  answer: Record<string, unknown>;
};

export class SolveFunctionsApiCommandHandler extends BaseTaskHandler<
  SolveFunctionsApiCommand,
  SolveFunctionsApiTask,
  SolveFunctionsApiAnswer
> {
  async solve(command: SolveFunctionsApiCommand, task: SolveFunctionsApiTask): Promise<SolveFunctionsApiAnswer> {
    return { answer: schema };
  }
}
