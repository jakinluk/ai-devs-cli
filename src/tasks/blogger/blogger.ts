import inquirer from 'inquirer';
import { Argv } from 'yargs';
import { SolveBloggerCommand } from '../commands';
import { SolveBloggerCommandHandlerProvider } from './bloggerHandler';

export function buildSolveBloggerCommand(yargs: Argv) {
  return yargs.option('dummy', {
    type: 'boolean',
    description: 'parametrize me!',
    demandOption: false,
    default: false,
  });
}

async function promptForMissingParams(input: Partial<SolveBloggerCommand>): Promise<SolveBloggerCommand> {
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

export async function blogger(input: Partial<SolveBloggerCommand>) {
  const completeInput = await promptForMissingParams(input);
  const handler = await new SolveBloggerCommandHandlerProvider().provide();
  await handler.handle(completeInput);
}
