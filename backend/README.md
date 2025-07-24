# PES Game Backend

This is the backend service for the PES Game, providing APIs for player management, store operations, and game progression.

## Features

- User authentication (register/login)
- Player stats management
- In-game store system with:
  - Skills
  - COM Styles
  - Stat upgrades
  - Premium items
- Currency system (GP and FC)
- Transaction history

## Tech Stack

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

- Copy `example.env` to `.env`
- Update the database connection string and JWT secret

3. Initialize the database:

```bash
npx prisma migrate dev
```

4. Start the development server:

```bash
npm run dev
```

## API Routes

### Authentication

- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user

### Player

- GET /api/player/profile - Get player profile
- PATCH /api/player/stats/:statName - Update player stat

### Store

- GET /api/store/items - Get all store items
- POST /api/store/purchase - Purchase an item

## Database Schema

The database includes the following main entities:

- User
- Player
- PlayerStats
- Skills
- ComStyles
- Items
- Transactions

For detailed schema information, check `prisma/schema.prisma`.
