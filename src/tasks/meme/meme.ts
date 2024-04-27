import { SolveMemeCommand } from '../commands';
import { SolveMemeCommandHandlerProvider } from './memeHandler';

export async function meme(input: SolveMemeCommand) {
  const handler = await new SolveMemeCommandHandlerProvider().provide();
  await handler.handle(input);
}
