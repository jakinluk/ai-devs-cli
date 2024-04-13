/* eslint-disable no-console */
import chalk from 'chalk';
import { Answer, SubmitAnswerResponse, Task, TaskDevClient } from '../clients/taskDevClient';
import { BaseTaskCommand } from './baseTaskCommand';

export abstract class BaseTaskHandler<C extends BaseTaskCommand, T extends Task, A extends Answer> {
  protected activeToken: string;

  constructor(protected readonly taskDevClient: TaskDevClient, private readonly taskName: string) {}

  async handle(command: C): Promise<void> {
    try {
      const task = await this.getTask(this.taskName);
      console.log(chalk.green(`Obtained task \n${JSON.stringify(task, null, 2)}`));

      const answer = await this.solve(command, task);
      console.log(chalk.green(`Solution \n${JSON.stringify(answer, null, 2)}`));

      const finalResult = await this.putAnswer(answer);
      this.printAnswer(finalResult);
    } catch (error) {
      console.log(chalk.red(`Error: ${error}`));
    }
  }

  abstract solve(command: C, task: T): Promise<A>;

  protected async getTask(taskName: string): Promise<T> {
    const tokenResponse = await this.taskDevClient.getToken({ taskName });
    this.activeToken = tokenResponse.token;
    return (await this.taskDevClient.getTask({ token: tokenResponse.token })) as T;
  }

  private async putAnswer(answer: A): Promise<SubmitAnswerResponse> {
    return this.taskDevClient.submitAnswer({ answer, token: this.activeToken });
  }

  private printAnswer(answer: SubmitAnswerResponse): void {
    if (answer.code !== 0) {
      console.log(chalk.red(`Error: ${JSON.stringify(answer, null, 2)}`));
      return;
    }
    console.log(chalk.green(`Success: ${JSON.stringify(answer, null, 2)}`));
  }
}
