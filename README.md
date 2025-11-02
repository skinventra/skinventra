# Skinventra

Web application for tracking CS2 skin investments. Create portfolios, add positions with purchase prices, and monitor profit/loss in real-time.

## MVP Features

- **Steam Authentication** - Login via Steam OAuth
- **Portfolio Management** - Create and manage multiple portfolios
- **Position Tracking** - Add CS2 items with purchase prices and quantities
- **Profit/Loss Calculation** - Track gains and losses per position

## Tech Stack

### Frontend
- React 18 + Vite
- TypeScript
- TailwindCSS
- Native fetch API

### Backend
- Nest.js
- TypeScript
- Prisma ORM
- PostgreSQL (Supabase/Neon)
- Passport.js with Steam strategy
- class-validator for DTO validation

### Infrastructure
- PostgreSQL database
- GitHub for version control
