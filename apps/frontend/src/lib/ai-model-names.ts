/**
 * Maps technical AI model names to user-friendly display names
 */
export function formatAIModelName(technicalName: string | undefined | null): string {
  if (!technicalName) return 'AI Agent';

  const modelMap: Record<string, string> = {
    'mistralai/mistral-small-3.2-24b-instruct:free': 'AI Agent 1',
    'mistralai/mistral-small-3.2-24b-instruct': 'AI Agent 1',
    'meta-llama/llama-3.3-8b-instruct:free': 'AI Agent 2',
    'meta-llama/llama-3.3-8b-instruct': 'AI Agent 2',
    'anthropic/claude-3.5-sonnet': 'AI Agent Pro',
    'openai/gpt-4': 'AI Agent Pro'
  };

  return modelMap[technicalName] ?? 'AI Agent';
}
