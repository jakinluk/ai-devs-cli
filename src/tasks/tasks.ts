import { Argv } from 'yargs';
import {
  GetTaskCommand,
  SolveBloggerCommand,
  SolveEmbeddingCommand,
  SolveFunctionsApiCommand,
  SolveHelloApiCommand,
  SolveInpromptCommand,
  SolveLiarCommand,
  SolveModerationCommand,
  SolveRodoCommand,
  SolveScraperCommand,
  SolveWhisperCommand,
  SolveWhoamiCommand,
} from './commands';
import { buildGetTaskCommand, getTask } from './get-task/getTask';
import { buildSolveHelloApiCommand, helloApi } from './hello-api/helloApi';
import { buildSolveModerationCommand, moderation } from './moderation/moderation';
import { blogger, buildSolveBloggerCommand } from './blogger/blogger';
import { buildSolveLiarCommand, liar } from './liar/liar';
import { buildSolveInpromptApiCommand, inpromptApi } from './inprompt/inprompt';
import { buildSolveEmbeddingApiCommand, embeddingApi } from './embedding/embedding';
import { buildSolveWhisperApiCommand, whisperApi } from './whisper/whisper';
import { functionsApi } from './functions-api/functionsApi';
import { rodo } from './rodo/rodo';
import { scraper } from './scraper/scraper';
import { whoami } from './whoami/whoami';

export function tasksCommandBuilder(yargs: Argv) {
  return yargs
    .demandCommand()
    .command(
      'get-task',
      'Get task details',
      (yargs) => buildGetTaskCommand(yargs),
      (args) => getTask(args as unknown as Partial<GetTaskCommand>)
    )
    .command(
      'helloapi',
      'solve helloapi task',
      (yargs) => buildSolveHelloApiCommand(yargs),
      (args) => helloApi(args as Partial<SolveHelloApiCommand>)
    )
    .command(
      'moderation',
      'solve moderation task',
      (yargs) => buildSolveModerationCommand(yargs),
      (args) => moderation(args as Partial<SolveModerationCommand>)
    )
    .command(
      'blogger',
      'solve blogger task',
      (yargs) => buildSolveBloggerCommand(yargs),
      (args) => blogger(args as Partial<SolveBloggerCommand>)
    )
    .command(
      'liar',
      'solve liar task',
      (yargs) => buildSolveLiarCommand(yargs),
      (args) => liar(args as Partial<SolveLiarCommand>)
    )
    .command(
      'inprompt',
      'solve inprompt task',
      (yargs) => buildSolveInpromptApiCommand(yargs),
      (args) => inpromptApi(args as Partial<SolveInpromptCommand>)
    )
    .command(
      'embedding',
      'solve embedding task',
      (yargs) => buildSolveEmbeddingApiCommand(yargs),
      (args) => embeddingApi(args as Partial<SolveEmbeddingCommand>)
    )
    .command(
      'whisper',
      'solve whisper task',
      (yargs) => buildSolveWhisperApiCommand(yargs),
      (args) => whisperApi(args as Partial<SolveWhisperCommand>)
    )
    .command('functions', 'solve functions task', (args) => functionsApi(args as unknown as SolveFunctionsApiCommand))
    .command('rodo', 'solve rodo task', (args) => rodo(args as unknown as SolveRodoCommand))
    .command('scraper', 'solve scraper task', (args) => scraper(args as unknown as SolveScraperCommand))
    .command('whoami', 'solve whoami task', (args) => whoami(args as unknown as SolveWhoamiCommand));
}
