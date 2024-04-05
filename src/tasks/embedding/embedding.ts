import inquirer from 'inquirer';
import { Argv } from 'yargs';
import { SolveEmbeddingCommand } from '../commands';
import { SolveEmbeddingCommandHandlerProvider } from './embeddingHandler';

export function buildSolveEmbeddingApiCommand(yargs: Argv) {
  return yargs.option('dummy', {
    type: 'boolean',
    description: 'parametrize me!',
    demandOption: false,
    default: false,
  });
}

async function promptForMissingParams(input: Partial<SolveEmbeddingCommand>): Promise<SolveEmbeddingCommand> {
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

export async function embeddingApi(input: Partial<SolveEmbeddingCommand>) {
  const completeInput = await promptForMissingParams(input);
  const handler = await new SolveEmbeddingCommandHandlerProvider().provide();
  await handler.handle(completeInput);
}
