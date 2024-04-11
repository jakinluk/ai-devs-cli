import { BaseTaskCommand } from '../core/handler/baseTaskCommand';

/* eslint-disable @typescript-eslint/no-empty-interface */
export interface GetTaskCommand {
  taskName: string;
  saveToLocal: 'y' | 'n';
}

export interface SolveHelloApiCommand extends BaseTaskCommand {}

export interface SolveEmbeddingCommand extends BaseTaskCommand {}

export interface SolveInpromptCommand extends BaseTaskCommand {}

export interface SolveModerationCommand extends BaseTaskCommand {}

export interface SolveBloggerCommand extends BaseTaskCommand {}

export interface SolveLiarCommand extends BaseTaskCommand {
  question: string;
}

export interface SolveWhisperCommand extends BaseTaskCommand {}
export interface SolveFunctionsApiCommand extends BaseTaskCommand {}
export interface SolveRodoCommand extends BaseTaskCommand {}
