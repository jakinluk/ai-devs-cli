import inquirer from 'inquirer';
import { Argv } from 'yargs';
import { SolveInpromptCommand } from '../commands';
import { SolveInpromptCommandHandlerProvider } from './inpromptHandler';

export function buildSolveInpromptApiCommand(yargs: Argv) {
  return yargs.option('dummy', {
    type: 'boolean',
    description: 'parametrize me!',
    demandOption: false,
    default: false,
  });
}

async function promptForMissingParams(input: Partial<SolveInpromptCommand>): Promise<SolveInpromptCommand> {
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

export async function inpromptApi(input: Partial<SolveInpromptCommand>) {
  const completeInput = await promptForMissingParams(input);
  const handler = await new SolveInpromptCommandHandlerProvider().provide();
  await handler.handle(completeInput);
}
