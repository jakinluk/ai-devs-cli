import { Argv } from 'yargs';
import {
  GetTaskCommand,
  SolveBloggerCommand,
  SolveEmbeddingCommand,
  SolveHelloApiCommand,
  SolveInpromptCommand,
  SolveLiarCommand,
  SolveModerationCommand,
} from './commands';
import { buildGetTaskCommand, getTask } from './get-task/getTask';
import { buildSolveHelloApiCommand, helloApi } from './hello-api/helloApi';
import { buildSolveModerationCommand, moderation } from './moderation/moderation';
import { blogger, buildSolveBloggerCommand } from './blogger/blogger';
import { buildSolveLiarCommand, liar } from './liar/liar';
import { buildSolveInpromptApiCommand, inpromptApi } from './inprompt/inprompt';
import { buildSolveEmbeddingApiCommand, embeddingApi } from './embedding/embedding';

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
    );
}
