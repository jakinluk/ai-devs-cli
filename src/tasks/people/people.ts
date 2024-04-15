import { SolvePeopleCommand } from '../commands';
import { SolvePeopleCommandHandlerProvider } from './peopleHandler';

export async function people(input: SolvePeopleCommand) {
  const handler = await new SolvePeopleCommandHandlerProvider().provide();
  await handler.handle(input);
}
