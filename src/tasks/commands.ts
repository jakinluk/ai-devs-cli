import { BaseTaskCommand } from '../core';

/* eslint-disable @typescript-eslint/no-empty-interface */
export interface GetTaskCommand {
  taskName: string;
  saveToLocal: 'y' | 'n';
}

export interface SolveHelloApiCommand extends BaseTaskCommand {}
