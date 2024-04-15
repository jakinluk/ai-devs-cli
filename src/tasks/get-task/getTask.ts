import inquirer from 'inquirer';
import { Argv } from 'yargs';
import { GetTaskCommand } from '../commands';
import { GetTaskHandlerProvider } from './getTaskHandler';

const TASKS = [
  'helloapi',
  'maxtokens',
  'moderation',
  'blogger',
  'liar',
  'inprompt',
  'embedding',
  'whisper',
  'functions',
  'rodo',
  'scraper',
  'whoami',
  'search',
  'people',
];

export function buildGetTaskCommand(yargs: Argv) {
  return yargs
    .option('taskName', {
      type: 'string',
      description: 'name of the task to fetch',
    })
    .option('saveToLocal', {
      type: 'string',
      description: 'save the task to file on local',
      demandOption: false,
    });
}

async function promptForMissingParams(input: Partial<GetTaskCommand>): Promise<GetTaskCommand> {
  const prompt = inquirer.createPromptModule();

  const { taskName, saveToLocal } = await prompt(
    [
      {
        name: 'taskName',
        choices: TASKS,
        type: 'list',
        required: true,
      },
      {
        name: 'saveToLocal',
        choices: ['y', 'n'],
        type: 'list',
        required: false,
        default: 'y',
      },
    ],
    input
  );

  return {
    taskName,
    saveToLocal,
  };
}

export async function getTask(input: Partial<GetTaskCommand>) {
  const completeInput = await promptForMissingParams(input);
  const handler = await new GetTaskHandlerProvider().provide();
  await handler.handle(completeInput);
}
