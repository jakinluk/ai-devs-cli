/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
/* eslint-disable max-classes-per-file */
import fs from 'fs';
import chalk from 'chalk';
import { GetTaskCommand } from '../commands';
import * as config from '../config';
import configstore from '../configstore';
import { TaskDevClient, TaskDevClientProvider } from '../../core/clients/taskDevClient';

export class GetTaskHandlerProvider {
  async provide(): Promise<GetTaskHandler> {
    return new GetTaskHandler(
      await new TaskDevClientProvider().provide({
        baseUrl: config.baseConfig.BASE_URL,
        apiKey: config.baseConfig.API_KEY,
      })
    );
  }
}

export class GetTaskHandler {
  constructor(private readonly taskDevClient: TaskDevClient) {}

  async handle(input: GetTaskCommand): Promise<void> {
    const tokenResponse = await this.taskDevClient.getToken({ taskName: input.taskName });
    console.log(chalk.green(`Obtained token \n ${JSON.stringify(tokenResponse, null, 2)}`));

    let task; // configstore.get(`${input.taskName}`);
    if (!task) {
      task = await this.taskDevClient.getTask({ token: tokenResponse.token });
      configstore.set(`${input.taskName}`, task);
    }
    console.log(chalk.green(`Obtained task \n ${JSON.stringify(task, null, 2)}`));

    if (input.saveToLocal) {
      fs.writeFileSync(`tasks/${input.taskName}.json`, JSON.stringify(task, null, 2));
      console.log(chalk.green(`Done! Task ${input.taskName} has been saved to tasks/${input.taskName}.json`));
    }
  }
}
