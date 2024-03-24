/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
/* eslint-disable max-classes-per-file */
import { SolveModerationCommand } from '../commands';
import * as config from '../config';
import { TaskDevClientProvider } from '../../core/clients/taskDevClient';
import { BaseTaskHandler } from '../../core/handler/baseTaskHandler';
import { openaiClient } from '../../core/clients/openaiClient';

const TASK_NAME = 'moderation';

export class SolveModerationCommandHandlerProvider {
  async provide(): Promise<SolveModerationCommandHandler> {
    return new SolveModerationCommandHandler(
      await new TaskDevClientProvider().provide({
        baseUrl: config.baseConfig.BASE_URL,
        apiKey: config.baseConfig.API_KEY,
      }),
      TASK_NAME
    );
  }
}

type SolveModerationTask = {
  input: string[];
};

type SolveModerationAnswer = {
  answer: (0 | 1)[];
};

export class SolveModerationCommandHandler extends BaseTaskHandler<
  SolveModerationCommand,
  SolveModerationTask,
  SolveModerationAnswer
> {
  async solve(command: SolveModerationCommand, task: SolveModerationTask): Promise<SolveModerationAnswer> {
    const promises = [];

    task.input.forEach(async (input) => {
      promises.push(this.solveModeration(input));
    });
    const answers = await Promise.all(promises);
    console.log('answers');
    console.log(answers);

    return { answer: answers };
  }

  private async solveModeration(input: string) {
    const moderationResponse = await openaiClient.moderations.create({
      model: 'text-moderation-latest',
      input,
    });
    console.log('moderationResponse');
    console.log(moderationResponse);

    return moderationResponse.results.some((result) => result.flagged) ? 1 : 0;
  }
}
