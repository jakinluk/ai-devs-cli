import inquirer from 'inquirer';
import { Argv } from 'yargs';
import { SolveOwnAPICommand } from '../commands';
import { SolveOwnAPICommandHandlerProvider } from './ownApiHandler';

export function buildSolveOwnAPIApiCommand(yargs: Argv) {
  return yargs.option('apiURL', {
    type: 'string',
    description: 'apiURL',
  });
}

async function promptForMissingParams(input: Partial<SolveOwnAPICommand>): Promise<SolveOwnAPICommand> {
  const prompt = inquirer.createPromptModule();

  const { apiURL } = await prompt(
    [
      {
        name: 'apiURL',
        type: 'string',
        required: true,
      },
    ],
    input
  );

  return {
    apiURL,
  };
}

export async function ownApi(input: Partial<SolveOwnAPICommand>) {
  const completeInput = await promptForMissingParams(input);
  const handler = await new SolveOwnAPICommandHandlerProvider().provide();
  await handler.handle(completeInput);
}
