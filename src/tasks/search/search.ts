import { SolveSearchCommand } from '../commands';
import { SolveSearchCommandHandlerProvider } from './searchHandler';

export async function search(input: SolveSearchCommand) {
  const handler = await new SolveSearchCommandHandlerProvider().provide();
  await handler.handle(input);
}
