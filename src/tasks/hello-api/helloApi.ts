import inquirer from 'inquirer';
import { Argv } from 'yargs';
import { SolveHelloApiCommand } from '../commands';
import { SolveHelloApiCommandHandlerProvider } from './helloApiHandler';

export function buildSolveHelloApiCommand(yargs: Argv) {
  return yargs.option('dummy', {
    type: 'boolean',
    description: 'parametrize me!',
    demandOption: false,
    default: false,
  });
}

async function promptForMissingParams(input: Partial<SolveHelloApiCommand>): Promise<SolveHelloApiCommand> {
  const prompt = inquirer.createPromptModule();

  const { dry } = await prompt(
    [
      {
        name: 'dummy',
        type: 'boolean',
        required: false,
      },
    ],
    input
  );

  return {
    dry,
  };
}

export async function helloApi(input: Partial<SolveHelloApiCommand>) {
  const completeInput = await promptForMissingParams(input);
  const handler = await new SolveHelloApiCommandHandlerProvider().provide();
  await handler.handle(completeInput);
}
