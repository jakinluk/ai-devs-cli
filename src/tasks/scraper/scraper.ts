import { SolveScraperCommand } from '../commands';
import { SolveScraperCommandHandlerProvider } from './scraperHandler';

export async function scraper(input: SolveScraperCommand) {
  const handler = await new SolveScraperCommandHandlerProvider().provide();
  await handler.handle(input);
}
