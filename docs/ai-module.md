# AI Module – Architecture & Design

The `src/domain/ai` module provides a **provider-agnostic** AI layer for text and structured JSON generation. It follows **NestJS** and **SOLID** practices and is designed to be extended with new providers without changing core logic.

---

## Overview

- **Entry point**: `AiService` – single API for the rest of the app (`generateText`, `generateJson`).
- **Strategy**: The active provider (Gemini, Groq, Ollama) is chosen at runtime via config and injected with a **factory**.
- **Validation**: JSON from the model is parsed and validated with **AJV** (schema) and optional **closure rules** (ingredients/extras).

---

## Design Principles

| Principle | How it’s applied |
| --------- | ------------------ |
| **Dependency Inversion** | `AiService` depends on the `AIProvider` interface and the `AI_PROVIDER` token, not on concrete providers. |
| **Open/Closed** | New providers (e.g. OpenAI) are added by implementing `AIProvider` and registering in the factory; `AiService` stays unchanged. |
| **Single Responsibility** | `AiService` = orchestration; each provider = one backend; `AiJsonValidator` = parse + schema + closure; clients = HTTP only. |

---

## Structure

```
src/domain/ai/
├── ai.module.ts          # Nest module: config, HTTP, providers, factory
├── ai.service.ts         # Public API (generateText / generateJson)
├── config/
│   └── ai.config.ts      # Config namespace (provider, gemini, groq, ollama)
├── errors/
│   └── ai-error-codes.ts # Error codes + AiErrorResponseBody type
├── providers/
│   ├── ai-provider.ts    # AIProvider interface
│   ├── provider.keys.ts  # AI_PROVIDER token + AIProviderKey type
│   ├── provider.factory.ts # Maps config.provider → concrete provider
│   ├── gemini/           # Gemini client + provider
│   ├── groq/             # Groq client + provider
│   └── ollama/           # Ollama client + provider
├── validation/
│   ├── ai-json-validator.ts      # Parse, schema validate, closure validate
│   └── ai-json-prompt-builder.ts # buildPrompt, buildStrictJsonPrompt
└── types/
    ├── index.ts          # Re-exports
    ├── ai.types.ts       # AllowedIngredientRef, GenerateTextInput, GenerateJsonInput
    ├── gemini.type.ts
    ├── groq.types.ts
    └── ollama.types.ts
```

- **Clients** (`*\.client.ts`): HTTP only; no validation or prompt building.
- **Providers** (`*\.provider.ts`): Implement `AIProvider`, use client + validator + config; validate config in `OnModuleInit`.

---

## Conventions

1. **Provider contract**  
   All providers implement `AIProvider`: `generateText(input)` and `generateJson(input, allowedIngredients)`. `allowedIngredients` is used for closure validation (pantry vs extras).

2. **Config**  
   Provider-specific config lives under `config/ai.config.ts` (e.g. `gemini`, `groq`, `ollama`). Required env vars are validated at startup in each provider.

3. **Tokens & keys**  
   - `AI_PROVIDER` (Symbol) is the Nest injection token for the selected provider.
   - `AIProviderKey` and `AI_PROVIDER_KEYS` define the allowed `config.provider` values.

4. **Shared types**  
   Use `AllowedIngredientRef` for `{ id, name }[]` in prompts/validation so the same shape is used everywhere.

5. **Errors**  
   All AI errors use Nest HTTP exceptions and a **consistent response shape** (see [Error handling](#error-handling)) so API clients can branch on `errorCode` and read `message`, `errors`, `details`, etc.

---

## Error handling

All AI-related failures throw NestJS HTTP exceptions whose **response body** matches `AiErrorResponseBody` in `errors/ai-error-codes.ts`. This lets callers (e.g. frontend or API gateway) reliably parse and handle errors.

### HTTP status

| Status | When |
|--------|------|
| **400 Bad Request** | Invalid JSON from AI, schema validation failed, or ingredient closure violation. |
| **503 Service Unavailable** | Request to the AI provider failed (network, rate limit, upstream error). |
| **500 Internal Server Error** | Misconfiguration: unsupported `AI_PROVIDER` or missing required env vars. |

### Response body shape

Every AI error response includes at least:

- **`errorCode`** – Stable string for programmatic handling (see `AI_ERROR_CODES`).
- **`message`** – Human-readable description.

Optional fields depending on `errorCode`:

- **`errors`** – Array of validation/closure errors (path, keyword, message).
- **`snippet`** – Truncated raw output for debugging.
- **`details`** – Provider-specific payload (e.g. upstream status, API error).
- **`missingKeys`** – Env var names (for `AI_CONFIG_MISSING`).
- **`provider`** – Configured provider key (for `AI_PROVIDER_UNSUPPORTED`).

### Error codes

| Code | Meaning |
|------|--------|
| `AI_JSON_INVALID` | AI returned invalid JSON. |
| `AI_SCHEMA_VALIDATION_FAILED` | AI output did not match the expected JSON schema. |
| `AI_INGREDIENT_CLOSURE_VIOLATION` | Output violated ingredient/extras closure rules. |
| `AI_PROVIDER_UNSUPPORTED` | `AI_PROVIDER` env value is not supported. |
| `AI_CONFIG_MISSING` | Required env vars for the selected provider are missing. |
| `AI_PROVIDER_UNAVAILABLE` | Request to the AI provider failed. |

Example: a frontend can check `response.body.errorCode === 'AI_SCHEMA_VALIDATION_FAILED'` and show `response.body.errors` in the UI.

---

## Adding a New Provider

1. Add config in `ai.config.ts` and env schema.
2. Create `providers/<name>/<name>.client.ts` (HTTP) and `<name>.provider.ts` (implements `AIProvider`).
3. Register client and provider in `AiModule` and add them to the factory’s `useFactory` and `inject` arrays.
4. Extend `AI_PROVIDER_KEYS` and `AIProviderKey` in `provider.keys.ts`.

No changes are required in `AiService` or in the rest of the app beyond configuration.
