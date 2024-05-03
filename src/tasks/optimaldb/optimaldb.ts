import { SolveOptimalDbCommand } from '../commands';
import { SolveOptimalDbCommandHandlerProvider } from './optimaldbHanlder';

export async function optimaldb(input: SolveOptimalDbCommand) {
  const handler = await new SolveOptimalDbCommandHandlerProvider().provide();
  await handler.handle(input);
}
