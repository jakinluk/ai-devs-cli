/* eslint-disable guard-for-in */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
/* eslint-disable max-classes-per-file */
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import fs from 'fs';
import { BaseTaskHandler } from '../../core/handler/baseTaskHandler';
import { TaskDevClientProvider } from '../../core/clients/taskDevClient';
import * as config from '../config';
import { SolveOptimalDbCommand } from '../commands';

const TASK_NAME = 'optimaldb';

export class SolveOptimalDbCommandHandlerProvider {
  async provide(): Promise<SolveOptimalDbCommandHandler> {
    return new SolveOptimalDbCommandHandler(
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
//   "msg": "In a moment you will receive from me a database on three people. It is over 30kb in size. You need to prepare me for an exam in which I will be questioned on this database. Unfortunately, the capacity of my memory is just 9kb. Send me the optimised database",
//   "database": "https://tasks.aidevs.pl/data/3friends.json",
//   "hint": "I will use GPT-3.5-turbo to answer all test questions"
// }
type SolveOptimalDbTask = Record<string, never>;

type SolveOptimalDbAnswer = {
  answer: string;
};

const exampleIn = `### Bio of Adam:\n Adam jest programistą. Zapytany o ulubionę grę, odpowiada natychmiast 'Tomb Rider'.\n ...`;
const exampleOut = `\n=>\n### Bio of Adam:\nSoftware engineer. Favorite game - Tomb Rider.\n ...`;
const systemMessage = `You will be given a bio of a person. Transform it from Polish to English without loosing any facts but make the output text as concise as possible. The transformed text must not include any unimportant phrases and words. The transformed the text can not include 'a/an/the' articles and commas.\n\nExample: \n${exampleIn} ${exampleOut} \n\n`;

export class SolveOptimalDbCommandHandler extends BaseTaskHandler<
  SolveOptimalDbCommand,
  SolveOptimalDbTask,
  SolveOptimalDbAnswer
> {
  private model: ChatOpenAI;

  async solve(command: SolveOptimalDbCommand, task: SolveOptimalDbTask): Promise<SolveOptimalDbAnswer> {
    this.model = new ChatOpenAI({
      modelName: command.model ?? 'gpt-4-turbo',
      temperature: 1,
      topP: 1,
    });
    const db = JSON.parse(fs.readFileSync('src/tasks/optimaldb/3friends.json', 'utf8'));
    const stringifiedDb = await this.optimiseDb(db);

    return { answer: stringifiedDb };
  }

  private async optimiseDb(db: Record<string, string[]>): Promise<string> {
    const optimisedDb: Record<string, string> = {};
    Object.keys(db).forEach((key) => {
      optimisedDb[key] = db[key].join('\n');
    });
    let stringifiedDb = '';
    console.log(systemMessage);
    // throw new Error('Not implemented');
    for (const key in optimisedDb) {
      optimisedDb[key] = await this.optimiseDbText(key, optimisedDb[key]);
      console.log(`\ndb for ${key} optimized`);
      stringifiedDb += `\n\n${optimisedDb[key]}`;
    }
    console.log(stringifiedDb);

    if (stringifiedDb.length > 9000) {
      console.log('db too long');
      console.log(stringifiedDb.length);
      return this.reduceSize(stringifiedDb, stringifiedDb.length - 9000);
    }
    await this.refreshToken();

    return stringifiedDb;
  }

  private async reduceSize(stringifiedDb: string, numberBytes: number): Promise<string> {
    const { content } = await this.model.invoke([
      new SystemMessage(
        `The provided text is too long. Reduce the size of the text by ${numberBytes} bytes. Assume one byte is one character. Remove whole words or single which after removal will not affect the meaning and readability of the text. Do not lose any facts.\n Text to reduce:`
      ),
      new HumanMessage(stringifiedDb),
    ]);
    return content as string;
  }

  private async optimiseDbText(personName: string, text: string): Promise<string> {
    const { content } = await this.model.invoke([
      new SystemMessage(systemMessage),
      new HumanMessage(`### Bio of ${personName}:\n${text}`),
    ]);
    return content as string;
  }
}
