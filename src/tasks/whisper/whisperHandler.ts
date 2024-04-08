/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
/* eslint-disable max-classes-per-file */
import { SolveWhisperCommand } from '../commands';
import * as config from '../config';
import { TaskDevClientProvider } from '../../core/clients/taskDevClient';
import { BaseTaskHandler } from '../../core/handler/baseTaskHandler';
import { openaiClient } from '../../core/clients/openaiClient';

const TASK_NAME = 'whisper';

export class SolveWhisperCommandHandlerProvider {
  async provide(): Promise<SolveWhisperCommandHandler> {
    return new SolveWhisperCommandHandler(
      await new TaskDevClientProvider().provide({
        baseUrl: config.baseConfig.BASE_URL,
        apiKey: config.baseConfig.API_KEY,
      }),
      TASK_NAME
    );
  }
}

type SolveWhisperTask = {
  msg: string;
};

type SolveWhisperAnswer = {
  answer: string;
};

// Obtained task
//  {
//   "code": 0,
//   "msg": "please return transcription of this file: https://tasks.aidevs.pl/data/mateusz.mp3",
//   "hint": "use WHISPER model - https://platform.openai.com/docs/guides/speech-to-text"
// }

export class SolveWhisperCommandHandler extends BaseTaskHandler<
  SolveWhisperCommand,
  SolveWhisperTask,
  SolveWhisperAnswer
> {
  async solve(command: SolveWhisperCommand, task: SolveWhisperTask): Promise<SolveWhisperAnswer> {
    const { msg } = task;
    const mp3Url = msg.split(': ')[1];

    // fetch mps file, using native fetch api
    const mp3 = await fetch(mp3Url);

    const response = await openaiClient.audio.transcriptions.create({
      file: mp3,
      model: 'whisper-1',
    });

    console.log(response.text);

    return {
      answer: response.text,
    };
  }
}
