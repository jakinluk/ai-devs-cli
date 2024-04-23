import { SolveGnomeCommand } from '../commands';
import { SolveGnomeCommandHandlerProvider } from './gnomeHandler';

export async function gnome(input: SolveGnomeCommand) {
  const handler = await new SolveGnomeCommandHandlerProvider().provide();
  await handler.handle(input);
}
