import inquirer from 'inquirer';
import { Argv } from 'yargs';
import { SolveWhisperCommand } from '../commands';
import { SolveWhisperCommandHandlerProvider } from './whisperHandler';

export function buildSolveWhisperApiCommand(yargs: Argv) {
  return yargs.option('dummy', {
    type: 'boolean',
    description: 'parametrize me!',
    demandOption: false,
    default: false,
  });
}

async function promptForMissingParams(input: Partial<SolveWhisperCommand>): Promise<SolveWhisperCommand> {
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

export async function whisperApi(input: Partial<SolveWhisperCommand>) {
  const completeInput = await promptForMissingParams(input);
  const handler = await new SolveWhisperCommandHandlerProvider().provide();
  await handler.handle(completeInput);
}
