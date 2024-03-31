import inquirer from 'inquirer';
import { Argv } from 'yargs';
import { SolveLiarCommand } from '../commands';
import { SolveLiarCommandHandlerProvider } from './liarHandler';

export function buildSolveLiarCommand(yargs: Argv) {
  return yargs.option('question', {
    type: 'string',
    description: 'ask me anything',
  });
}

async function promptForMissingParams(input: Partial<SolveLiarCommand>): Promise<SolveLiarCommand> {
  const prompt = inquirer.createPromptModule();

  const { question } = await prompt(
    [
      {
        name: 'question',
        type: 'string',
        required: true,
      },
    ],
    input
  );

  return {
    question,
  };
}

export async function liar(input: Partial<SolveLiarCommand>) {
  const completeInput = await promptForMissingParams(input);
  const handler = await new SolveLiarCommandHandlerProvider().provide();
  await handler.handle(completeInput);
}
