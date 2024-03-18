import inquirer from 'inquirer';
import { Argv } from 'yargs';
import { SolveHelloApiCommand } from '../commands';
import { SolveHelloApiCommandHandlerProvider } from './helloApiHandler';

export function buildSolveHelloApiCommand(yargs: Argv) {
  return yargs.option('dry', {
    type: 'boolean',
    description: 'save the task to file on local',
    demandOption: false,
    default: false,
  });
}

async function promptForMissingParams(input: Partial<SolveHelloApiCommand>): Promise<SolveHelloApiCommand> {
  const prompt = inquirer.createPromptModule();

  const { dry } = await prompt(
    [
      {
        name: 'dry',
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
