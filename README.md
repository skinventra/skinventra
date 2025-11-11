# skinventra

Web application for tracking CS2 skin investments. Create portfolios, add positions with purchase prices, and monitor profit/loss in real-time.

## MVP Features

- **Steam Authentication** - Login via Steam OAuth
- **Portfolio Management** - Create and manage multiple portfolios
- **Position Tracking** - Add CS2 items with purchase prices and quantities
- **Profit/Loss Calculation** - Track gains and losses per position

## Tech Stack

### Client (Frontend)
- React 18 + Vite
- TypeScript
- TailwindCSS
- Native fetch API

### API (Backend)
- Nest.js
- TypeScript
- Prisma ORM
- PostgreSQL (Supabase/Neon)
- Passport.js with Steam strategy
- class-validator for DTO validation

### Infrastructure & DevOps
- **Monorepo**: Turborepo for build orchestration and caching
- **Package Manager**: pnpm workspace
- **Database**: PostgreSQL
- **Static Files**: @nestjs/serve-static for serving client from API
- **Version Control**: Git & GitHub

### Project Structure
```
skinventra/
├── apps/
│   ├── api/          # NestJS backend (port 3000)
│   ├── client/       # React + Vite frontend (port 5173 in dev)
│   └── shared/       # Shared types and utilities
├── turbo.json        # Turborepo pipeline configuration
└── package.json      # Root workspace configuration