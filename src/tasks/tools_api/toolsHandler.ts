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
import { BaseTaskHandler } from '../../core/handler/baseTaskHandler';
import { TaskDevClientProvider } from '../../core/clients/taskDevClient';
import * as config from '../config';
import { SolveToolsCommand } from '../commands';
import { schemas } from './schemas';
import { parseFunctionCall } from '../../core/utils/parseFunctionCall';

const TASK_NAME = 'tools';

export class SolveToolsCommandHandlerProvider {
  async provide(): Promise<SolveToolsCommandHandler> {
    return new SolveToolsCommandHandler(
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
//   "msg": "Decide whether the task should be added to the ToDo list or to the calendar (if time is provided) and return the corresponding JSON",
//   "hint": "always use YYYY-MM-DD format for dates",
//   "example for ToDo": "Przypomnij mi, że mam kupić mleko = {\"tool\":\"ToDo\",\"desc\":\"Kup mleko\" }",
//   "example for Calendar": "Jutro mam spotkanie z Marianem = {\"tool\":\"Calendar\",\"desc\":\"Spotkanie z Marianem\",\"date\":\"2024-04-22\"}",
//   "question": "W poniedziałek są urodziny Zenona"
// }
type SolveToolsTask = {
  question: string;
};

type SolveToolsAnswer = {
  answer: Record<string, unknown>;
};

type FuncType = 'ToDo' | 'Calendar';

const model = new ChatOpenAI({
  modelName: 'gpt-4-0613',
}).bind({ functions: [...Object.values(schemas)] });

export class SolveToolsCommandHandler extends BaseTaskHandler<SolveToolsCommand, SolveToolsTask, SolveToolsAnswer> {
  private async getFunctionToCall(
    question: string
  ): Promise<{ funcToCall: FuncType; params: Record<string, unknown> }> {
    console.log(`User: ${question}`);
    const response = await model.invoke([
      new SystemMessage(
        `Fact: Today is ${new Date().toLocaleDateString('en-US')}.\n\nRule: Always use YYYY-MM-DD format for dates.`
      ),
      new HumanMessage(question),
    ]);
    const action = parseFunctionCall(response);
    if (!action) {
      return null;
    }
    return { funcToCall: action.name as FuncType, params: action.args };
  }

  async solve(command: SolveToolsCommand, task: SolveToolsTask): Promise<SolveToolsAnswer> {
    // use function calling with json_mode to get the right function to call

    const { funcToCall, params } = await this.getFunctionToCall(task.question);

    console.log(`Function to call: ${funcToCall} + params: ${JSON.stringify(params)}`);

    if (funcToCall === 'ToDo') {
      return { answer: { ...params, tool: 'ToDo' } };
    }

    return { answer: { ...params, tool: 'Calendar' } };
  }
}
