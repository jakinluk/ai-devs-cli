import { Argv } from 'yargs';
import { GetTaskCommand, SolveHelloApiCommand, SolveModerationCommand } from './commands';
import { buildGetTaskCommand, getTask } from './get-task/getTask';
import { buildSolveHelloApiCommand, helloApi } from './hello-api/helloApi';
import { buildSolveModerationCommand, moderation } from './moderation/moderation';

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
    );
}
