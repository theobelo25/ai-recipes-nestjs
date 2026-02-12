# AI Recipe Finder - Backend

A **full-featured NestJS backend** for the AI Recipe Finder project. This backend provides **user management**, **recipe storage**, and **AI-powered recipe suggestions**. Built with **NestJS**, **Fastify**, **AJV**, **Prisma**, and **PostgreSQL**, this project demonstrates **modern backend best practices** and is suitable for portfolio or production use.

---

## **Table of Contents**

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Validation](#validation)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## **Features**

- User authentication & authorization (JWT)
- CRUD operations for recipes
- AI-powered recipe suggestions (via OpenAI API integration)
- Fastify + AJV request validation for high performance and security
- Type-safe database access via Prisma
- Modular, maintainable architecture (NestJS best practices)
- Real-time updates for recipe collaboration (optional WebSocket integration)

---

## **Tech Stack**

| Layer             | Technology                                    |
| ----------------- | --------------------------------------------- |
| Backend Framework | NestJS                                        |
| HTTP Server       | Fastify                                       |
| Validation        | AJV                                           |
| Database          | PostgreSQL                                    |
| ORM               | Prisma                                        |
| Authentication    | JWT (Passport.js)                             |
| Testing           | Jest + Supertest                              |
| API Docs          | Swagger (OpenAPI)                             |
| CI/CD             | GitHub Actions / Vercel or Railway deployment |

---

## **Getting Started**

### **Prerequisites**

- Node.js 20+
- npm or yarn
- PostgreSQL 15+
- [Prisma CLI](https://www.prisma.io/docs/getting-started/quickstart)

### **Installation**

```bash
# Clone repository
git clone https://github.com/yourusername/ai-recipe-backend.git
cd ai-recipe-backend

# Install dependencies
npm install
# or
yarn install

# Set up Prisma
npx prisma generate
```
