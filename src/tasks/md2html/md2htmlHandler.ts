import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { BaseTaskHandler } from '../../core/handler/baseTaskHandler';
import { TaskDevClientProvider } from '../../core/clients/taskDevClient';
import * as config from '../config';
import { SolveMdm2HtmlCommand } from '../commands';

const TASK_NAME = 'md2html';

export class SolveMdm2HtmlCommandHandlerProvider {
  async provide(): Promise<SolveMdm2HtmlCommandHandler> {
    return new SolveMdm2HtmlCommandHandler(
      await new TaskDevClientProvider().provide({
        baseUrl: config.baseConfig.BASE_URL,
        apiKey: config.baseConfig.API_KEY,
      }),
      TASK_NAME
    );
  }
}

// 1) Get task from /task/TOKEN

// {
//  "markdown":"## This is _important_ and **very cool**"
// }

// _____________________________________

// 2) Use your fine-tuned model to convert this input into HTML.
//    Send it to /answer/TOKEN

// {
//  "answer":"<h2>This is <u>important</u> and <span class=\"bold\">very cool</span></h2>"
// }

// Rules:
// 1. Don't add any additional spaces and new lines
// 2. BOLD in this task is <span class="bold">any text</span>

// _____________________________________

// You don't know how to prepare JSONL file for fine-tuning?
// This is "Zdzislaw mode". If you set "system" prompt to "tryb zdzislawa", all questions will be answered in Old Polish.
// https://tasks.aidevs.pl/data/zdzislaw.jsonl

// {
//   "code": 0,
//   "msg": "Convert this Markdown text into HTML - rememeber about strange BOLD interpretation!",
//   "hint": "https://tasks.aidevs.pl/hint/md2html",
//   "input": "## Dlaczego warto częstować gości **Yerba Mate**?\n1. Sprawiasz wrażenie bogatego światowca\n2. _Oszczędzasz na cukrze_\n3. Nie poproszą o dolewkę\n4. Jest szansa, że **już Cię więcej nie odwiedzą**"
// }
type SolveToolsTask = {
  input: string;
};

type SolveToolsAnswer = {
  answer: string;
};

export class SolveMdm2HtmlCommandHandler extends BaseTaskHandler<
  SolveMdm2HtmlCommand,
  SolveToolsTask,
  SolveToolsAnswer
> {
  async solve(command: SolveMdm2HtmlCommand, task: SolveToolsTask): Promise<SolveToolsAnswer> {
    const model = new ChatOpenAI({
      modelName: command.model,
    });

    const response = await model.invoke([new SystemMessage('Markdown to HTML mode'), new HumanMessage(task.input)]);

    return { answer: response.content as string };
  }
}
