import { SolveWhoamiCommand } from '../commands';
import { SolveWhoamiCommandHandlerProvider } from './whoamiHandler';

export async function whoami(input: SolveWhoamiCommand) {
  const handler = await new SolveWhoamiCommandHandlerProvider().provide();
  await handler.handle(input);
}
