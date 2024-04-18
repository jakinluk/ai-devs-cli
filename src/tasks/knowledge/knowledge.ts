import { SolveKnowledgeCommand } from '../commands';
import { SolveKnowledgeCommandHandlerProvider } from './knowledgeHandler';

export async function knowledge(input: SolveKnowledgeCommand) {
  const handler = await new SolveKnowledgeCommandHandlerProvider().provide();
  await handler.handle(input);
}
