import { GenerateTextInput, GenerateJsonInput } from '../types';

export function buildPrompt(input: GenerateTextInput): string {
  if (!input.system?.trim()) return input.prompt;
  return `${input.system.trim()}\n\n${input.prompt}`;
}

export type StrictJsonPromptOptions = {
  basePrompt: string;
  schema: GenerateJsonInput['schema'];
  extraInstructions?: string[];
};

export function buildStrictJsonPrompt(
  options: StrictJsonPromptOptions,
): string {
  const { basePrompt, schema, extraInstructions } = options;

  const lines: string[] = [
    basePrompt,
    '',
    'RETURN ONLY VALID JSON.',
    'No markdown. No backticks. No prose.',
    'Return exactly ONE JSON object.',
    '',
    'The JSON MUST strictly match this schema:',
    JSON.stringify(schema, null, 2),
    '',
    'If a required value is unknown, use these defaults:',
    '- string: ""',
    '- integer/number: 0',
    '- boolean: false',
    '- array: []',
    '- object: {}',
    '',
    'All values MUST match the exact type defined in the schema.',
    'Do not use null unless the schema explicitly allows null.',
    'Never omit required fields.',
  ];

  if (extraInstructions?.length) {
    lines.push('', ...extraInstructions);
  }

  return lines.join('\n');
}
