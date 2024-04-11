import { SolveRodoCommand } from '../commands';
import { SolveRodoCommandHandlerProvider } from './rodoHandler';

export async function rodo(input: SolveRodoCommand) {
  const handler = await new SolveRodoCommandHandlerProvider().provide();
  await handler.handle(input);
}
