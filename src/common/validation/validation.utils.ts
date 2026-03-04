import { ErrorObject, FuncKeywordDefinition } from 'ajv';

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

type KeywordError = Partial<
  ErrorObject<string, Record<string, unknown>, unknown>
>;

// We type the validate function ourselves so `errors` can never be null.
type KeywordValidateFn = ((schema: boolean, data: string) => boolean) & {
  errors?: KeywordError[];
};

const validateIsJsonStringArray: KeywordValidateFn = function (
  _schema: boolean,
  data: string,
): boolean {
  // clear previous errors
  validateIsJsonStringArray.errors = undefined;

  try {
    const parsed: unknown = JSON.parse(data);

    if (!Array.isArray(parsed)) {
      validateIsJsonStringArray.errors = [
        {
          keyword: 'isJsonStringArray',
          message: 'must be a JSON-encoded array',
          params: {},
        },
      ];
      return false;
    }

    if (!isStringArray(parsed)) {
      validateIsJsonStringArray.errors = [
        {
          keyword: 'isJsonStringArray',
          message: 'array must contain only strings',
          params: {},
        },
      ];
      return false;
    }

    return true;
  } catch {
    validateIsJsonStringArray.errors = [
      {
        keyword: 'isJsonStringArray',
        message: 'must be valid JSON',
        params: {},
      },
    ];
    return false;
  }
};

export const isJsonStringArrayKeyword: FuncKeywordDefinition = {
  keyword: 'isJsonStringArray',
  type: 'string',
  schemaType: 'boolean',
  errors: true,
  validate: validateIsJsonStringArray,
};
