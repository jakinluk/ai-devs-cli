#!/usr/bin/env node
/* eslint-disable no-unused-expressions */
import 'dotenv/config';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { tasksCommandBuilder } from './tasks/tasks';

const commands = yargs(hideBin(process.argv))
  .demandCommand()
  .command('tasks', 'Top level command for Taskdev', tasksCommandBuilder);

commands.argv;
