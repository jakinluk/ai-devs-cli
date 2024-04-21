import { SolveToolsCommand } from '../commands';
import { SolveToolsCommandHandlerProvider } from './toolsHandler';

export async function tools(input: SolveToolsCommand) {
  const handler = await new SolveToolsCommandHandlerProvider().provide();
  await handler.handle(input);
}
