import inquirer from 'inquirer';
import { Argv } from 'yargs';
import { SolveMdm2HtmlCommand } from '../commands';
import { SolveMdm2HtmlCommandHandlerProvider } from './md2htmlHandler';

export function buildSolveMd2HtmlCommand(yargs: Argv) {
  return yargs.option('model', {
    type: 'boolean',
    description: 'provide fine-tuned model',
  });
}

async function promptForMissingParams(input: Partial<SolveMdm2HtmlCommand>): Promise<SolveMdm2HtmlCommand> {
  const prompt = inquirer.createPromptModule();

  const { model } = await prompt(
    [
      {
        name: 'model',
        type: 'string',
        required: true,
      },
    ],
    input
  );

  return {
    model,
  };
}

export async function md2Html(input: Partial<SolveMdm2HtmlCommand>) {
  const completeInput = await promptForMissingParams(input);
  const handler = await new SolveMdm2HtmlCommandHandlerProvider().provide();
  await handler.handle(completeInput);
}
