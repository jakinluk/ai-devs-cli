import inquirer from 'inquirer';
import { Argv } from 'yargs';
import { SolveModerationCommand } from '../commands';
import { SolveModerationCommandHandlerProvider } from './moderationHandler';

export function buildSolveModerationCommand(yargs: Argv) {
  return yargs.option('dummy', {
    type: 'boolean',
    description: 'parametrize me!',
    demandOption: false,
    default: false,
  });
}

async function promptForMissingParams(input: Partial<SolveModerationCommand>): Promise<SolveModerationCommand> {
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

export async function moderation(input: Partial<SolveModerationCommand>) {
  const completeInput = await promptForMissingParams(input);
  const handler = await new SolveModerationCommandHandlerProvider().provide();
  await handler.handle(completeInput);
}
