# AI Recipes – Backend

A **production-ready NestJS API** for an AI-powered recipe app: user auth, pantry management, recipe CRUD, and **multi-provider AI recipe generation** (Gemini, Groq, Ollama). Built with **Fastify**, **Prisma**, **PostgreSQL**, and strict validation and error handling. Suitable as a **portfolio backend** or as the core of a full-stack recipe product.

---

## Table of Contents

- [Highlights](#highlights)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Overview](#api-overview)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Documentation](#documentation)
- [Deployment](#deployment)
- [License](#license)

---

## Highlights

- **Multi-provider AI** – Swappable AI backends (Gemini, Groq, Ollama) via config; structured JSON output with schema + closure validation.
- **Secure auth** – JWT access tokens, httpOnly refresh cookies, refresh rotation, origin checks, and throttling on auth routes.
- **Domain-driven design** – Clear boundaries (auth, users, recipes, pantry, ingredients, AI); repository pattern and unit-of-work for transactions.
- **Strict validation** – AJV + JSON Schema on request bodies; TypeBox/Zod for types; consistent error codes and response shapes for clients.
- **Performance & security** – Fastify, Helmet, CORS, rate limiting; Prisma with PostgreSQL driver adapter.

---

## Features

### Authentication & Users

- **Sign up / sign in** – Email + password; Argon2 for hashing; JWT access + httpOnly refresh cookie.
- **Refresh flow** – Token rotation on refresh; revoke on sign-out; optional device/label metadata.
- **Change password** – Authenticated endpoint; invalidates refresh tokens (cookie cleared).
- **Throttling** – Stricter limits on signup, signin, refresh, signout to reduce abuse.

### Recipes

- **CRUD** – Create, read, update, delete; list all (public) or “my recipes” and “recent” (authenticated).
- **By slug** – Public read by `slug` for stable URLs.
- **AI generation** – Submit a list of ingredients; receive a generated recipe (title, instructions, servings, times, ingredients + extras) from the configured AI provider.
- **Save generated** – Persist an AI-generated recipe as a full recipe with ingredients and optional extras.
- **Replace ingredients** – Atomic replace of recipe ingredients (used when editing).

### Pantry

- **Per-user pantry** – Add, update, remove pantry items (ingredient + quantity/unit).
- **List & recent** – List all and recently updated items for the current user.

### Ingredients

- **Global ingredient catalog** – CRUD by slug; used by recipes and pantry; referenced by AI generation (allowed-ingredient closure).

### AI Layer

- **Provider-agnostic** – Single `AiService` API; provider (Gemini, Groq, Ollama) selected via `AI_PROVIDER` env.
- **Structured JSON** – `generateJson` with JSON Schema and optional “closure” rules (e.g. ingredient/extras validation).
- **Stable errors** – `errorCode` + `message` (and optional `errors`, `details`) for client-friendly handling.
- See **[AI Module docs](docs/ai-module.md)** for design, adding providers, and error codes.

---

## Tech Stack

| Layer            | Technology |
| ---------------- | ---------- |
| Runtime          | Node.js 24+ |
| Framework        | NestJS 11  |
| HTTP             | Fastify    |
| Validation       | AJV, TypeBox, Zod (env) |
| Database         | PostgreSQL |
| ORM / access     | Prisma (driver adapter `@prisma/adapter-pg`) |
| Auth             | JWT (Passport), Argon2, httpOnly cookies |
| Security         | Helmet, CORS, Throttler |
| Testing          | Jest, Supertest |

---

## Architecture

- **Domain modules** – `auth`, `users`, `recipes`, `pantry`, `ingredients`, `ai` under `src/domain/`. Each encapsulates controller, service, DTOs/schemas, and (where used) repository interfaces + Prisma implementations.
- **Unit of Work** – `IUnitOfWork` (Prisma-backed) used for multi-step operations that must run in a single transaction (e.g. signup + issue refresh token; replace recipe ingredients).
- **Repositories** – Interfaces in domain, implementations in `infrastructure/` (e.g. `PrismaRecipesRepository`); services depend on interfaces, not Prisma directly where it matters for testability.
- **AI** – `AiService` depends on `AIProvider`; `ProviderFactory` selects implementation from config; each provider (Gemini, Groq, Ollama) implements the same contract and uses shared validation (AJV + closure).
- **Global filters** – `ValidationExceptionFilter` (Fastify/AJV validation errors), `PrismaExceptionFilter` (e.g. unique constraint, not found); consistent HTTP status and body shapes.
- **Config & env** – NestJS `ConfigModule` with typed config; Zod for env schema at startup so misconfiguration fails fast.

---

## Project Structure

```
src/
├── app.module.ts              # Root module: config, Prisma, Throttler, domain modules, global filters
├── main.ts                    # Bootstrap: Fastify, cookie, CORS, Helmet, validation
├── config/                    # App, CORS, Helmet, cookie config
├── env/                       # Zod env schema and EnvModule
├── common/                    # Validation (AJV), filters, pipes, UoW interface, security
├── prisma/                    # PrismaService, PrismaModule, UoW, generated client
└── domain/
    ├── ai/                    # AiService, providers (Gemini, Groq, Ollama), validation, config
    ├── auth/                  # AuthController, AuthService, AuthFlowService, guards, strategies, cookies
    ├── users/                 # UsersController, UsersService
    ├── recipes/               # RecipesController, RecipesService, RecipeGeneratorService, repositories
    ├── pantry/                # PantryController, PantryService, repositories
    └── ingredients/           # IngredientsController, IngredientsService, repositories
```

---

## Getting Started

### Prerequisites

- **Node.js 24+**
- **PostgreSQL 15+**
- npm or yarn

### Installation

```bash
git clone https://github.com/yourusername/ai-recipes.git
cd ai-recipes

npm install
npx prisma generate
```

### Database

Create a PostgreSQL database and set `DATABASE_URL` (see [Environment Variables](#environment-variables)). Then:

```bash
npx prisma migrate deploy
# or for development
npx prisma migrate dev
```

### Run

```bash
# Development
npm run start:dev

# Production build
npm run build
npm run start:prod
```

Default port: `3000` (override with `APP_PORT`).

---

## API Overview

| Area        | Methods | Endpoints (summary) |
| ----------- | ------- | -------------------- |
| **Auth**    | POST    | `POST /auth/signup`, `POST /auth/signin`, `POST /auth/refresh`, `POST /auth/signout` |
|             | PATCH   | `PATCH /auth/change-password` (authenticated) |
| **Users**   | GET     | `GET /users/me` (authenticated) |
| **Recipes** | GET     | `GET /recipes`, `GET /recipes/me`, `GET /recipes/recent`, `GET /recipes/:slug` |
|             | POST    | `POST /recipes`, `POST /recipes/generate`, `POST /recipes/generated` |
|             | PATCH   | `PATCH /recipes/:id` |
|             | PUT     | `PUT /recipes/:id/ingredients` |
|             | DELETE  | `DELETE /recipes/:id` |
| **Pantry**  | GET     | `GET /pantry`, `GET /pantry/recent` |
|             | POST    | `POST /pantry` |
|             | PATCH   | `PATCH /pantry/:id` |
|             | DELETE  | `DELETE /pantry/:id` |
| **Ingredients** | GET/POST/PATCH/DELETE | `GET /ingredients`, `GET /ingredients/:slug`, `POST /ingredients`, etc. |

- **Public routes** – e.g. `GET /recipes`, `GET /recipes/:slug`, `POST /recipes/generate` (no JWT).
- **Authenticated routes** – JWT in `Authorization: Bearer <token>` or cookie (per your frontend); refresh via httpOnly cookie.

---

## Environment Variables

Required (and validated at startup via Zod):

- **App:** `NODE_ENV`, `APP_PORT`, `FRONTEND_ORIGIN`, `CORS_ORIGINS`
- **Database:** `DATABASE_URL` (and optionally `DATASOURCE_*` if you build the URL elsewhere)
- **JWT:** `JWT_SECRET`, `JWT_TTL`, `JWT_ISSUER`, `JWT_AUDIENCE`
- **Refresh:** `REFRESH_TOKEN_TTL`, `REFRESH_PREFIX_SECRET` (min 32 chars)
- **AI:** `AI_PROVIDER` (e.g. `gemini` | `groq` | `ollama`); then provider-specific keys and URLs (see `src/env/env.schema.ts` and `src/domain/ai/config/ai.config.ts`)

Copy `.env.example` to `.env` and fill in values (do not commit secrets).

---

## Testing

```bash
npm run test          # Unit tests
npm run test:watch    # Watch mode
npm run test:cov      # Coverage
npm run test:e2e      # E2E tests
```

---

## Documentation

- **[AI Module](docs/ai-module.md)** – AI layer design, provider contract, validation, error codes, and how to add a new provider.

---

## Deployment

- **Node version** – Enforced via `engines.node` (`>=24`) and `.nvmrc` (`24`) for Nixpacks/Dokploy.
- **Database** – Use internal PostgreSQL in the same Dokploy project; set `DATABASE_URL` to the internal connection string (e.g. `postgresql://user:pass@postgres-service-name:5432/dbname`).
- **Build** – `npm run build`; start with `node dist/main` or `npm run start:prod`.

---

## License

UNLICENSED (private). Use as portfolio reference only unless otherwise agreed.
