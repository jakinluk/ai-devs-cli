/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
/* eslint-disable max-classes-per-file */
import { SolveHelloApiCommand } from '../commands';
import * as config from '../config';
import { TaskDevClientProvider } from '../services/taskDevClient';
import { BaseTaskHandler } from '../../core';

const TASK_NAME = 'helloapi';

export class SolveHelloApiCommandHandlerProvider {
  async provide(): Promise<SolveHelloApiCommandHandler> {
    return new SolveHelloApiCommandHandler(
      await new TaskDevClientProvider().provide({
        baseUrl: config.baseConfig.BASE_URL,
        apiKey: config.baseConfig.API_KEY,
      }),
      TASK_NAME
    );
  }
}

type SolveHelloApiTask = {
  cookie: string;
};

type SolveHelloApiAnswer = {
  answer: string;
};

export class SolveHelloApiCommandHandler extends BaseTaskHandler<
  SolveHelloApiCommand,
  SolveHelloApiTask,
  SolveHelloApiAnswer
> {
  async solve(command: SolveHelloApiCommand, task: SolveHelloApiTask): Promise<SolveHelloApiAnswer> {
    const { cookie } = task;
    return { answer: cookie };
  }
}
