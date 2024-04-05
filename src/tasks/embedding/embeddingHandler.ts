/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
/* eslint-disable max-classes-per-file */
import { SolveEmbeddingCommand } from '../commands';
import * as config from '../config';
import { TaskDevClientProvider } from '../../core/clients/taskDevClient';
import { BaseTaskHandler } from '../../core/handler/baseTaskHandler';
import { openaiClient } from '../../core/clients/openaiClient';

const TASK_NAME = 'embedding';

export class SolveEmbeddingCommandHandlerProvider {
  async provide(): Promise<SolveEmbeddingCommandHandler> {
    return new SolveEmbeddingCommandHandler(
      await new TaskDevClientProvider().provide({
        baseUrl: config.baseConfig.BASE_URL,
        apiKey: config.baseConfig.API_KEY,
      }),
      TASK_NAME
    );
  }
}

type SolveEmbeddingTask = {
  msg: string;
};

type SolveEmbeddingAnswer = {
  answer: number[];
};

// send embedding of this sentence created via text-embedding-ada-002. Send me just array of params: Hawaiian pizza
// "hint1": "this is required structure: [0.003750941, 0.0038711438, 0.0082909055, -0.008753223, -0.02073651, -0.018862579, -0.010596331, -0.022425512, ..., -0.026950065]",
// "hint2": "it must be a valid JSON array of numbers",
// "hint3": "just return as JSON array content of .data[0].embedding"
export class SolveEmbeddingCommandHandler extends BaseTaskHandler<
  SolveEmbeddingCommand,
  SolveEmbeddingTask,
  SolveEmbeddingAnswer
> {
  async solve(command: SolveEmbeddingCommand, task: SolveEmbeddingTask): Promise<SolveEmbeddingAnswer> {
    const { msg } = task;
    const toEmbedd = msg.split(': ')[1];

    const response = await openaiClient.embeddings.create({
      model: 'text-embedding-ada-002',
      input: [toEmbedd],
    });

    return {
      answer: response.data[0].embedding,
    };
  }
}
