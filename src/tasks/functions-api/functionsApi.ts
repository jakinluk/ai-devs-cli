import { SolveFunctionsApiCommand } from '../commands';
import { SolveFunctionsApiCommandHandlerProvider } from './functionsApiHandler';

export async function functionsApi(input: SolveFunctionsApiCommand) {
  const handler = await new SolveFunctionsApiCommandHandlerProvider().provide();
  await handler.handle(input);
}
