/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
/* eslint-disable max-classes-per-file */
import { SolveOwnAPICommand } from '../commands';
import * as config from '../config';
import { TaskDevClientProvider } from '../../core/clients/taskDevClient';
import { BaseTaskHandler } from '../../core/handler/baseTaskHandler';

const TASK_NAME = 'ownapi';

export class SolveOwnAPICommandHandlerProvider {
  async provide(): Promise<SolveOwnApiCommandHandler> {
    return new SolveOwnApiCommandHandler(
      await new TaskDevClientProvider().provide({
        baseUrl: config.baseConfig.BASE_URL,
        apiKey: config.baseConfig.API_KEY,
      }),
      TASK_NAME
    );
  }
}

type SolveOwnApiTask = {
  cookie: string;
};

type SolveOwnApiAnswer = {
  answer: string;
};

export class SolveOwnApiCommandHandler extends BaseTaskHandler<SolveOwnAPICommand, SolveOwnApiTask, SolveOwnApiAnswer> {
  async solve(command: SolveOwnAPICommand, task: SolveOwnApiTask): Promise<SolveOwnApiAnswer> {
    const { apiURL } = command;
    return { answer: apiURL };
  }
}
