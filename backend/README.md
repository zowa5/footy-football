# PES Football Management Backend

Backend API server untuk sistem manajemen sepak bola PES dengan Node.js, Express, MongoDB, dan TypeScript.

## ✅ Status Proyek

**COMPLETED**: Backend dasar sudah berhasil dibuat dan berjalan dengan sempurna!

### 🎯 Fitur yang Sudah Selesai

#### 🔐 Authentication System

- ✅ User registration (Player & Manager roles)
- ✅ JWT-based authentication
- ✅ Password hashing dengan bcrypt
- ✅ Login/logout system
- ✅ Profile management
- ✅ Role-based access control

#### ⚽ Formation Management

- ✅ CRUD operations untuk formations
- ✅ 6 default formations sudah di-seed
- ✅ Categorization by type (attacking, defensive, balanced, wing_play)
- ✅ Pagination dan filtering
- ✅ Popularity tracking

#### 📊 Database Models

- ✅ User model dengan role-specific data
- ✅ Formation model dengan validation
- ✅ MongoDB connection dan seeding

#### 🛡️ Security & Middleware

- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Helmet security headers
- ✅ Input validation dengan Zod
- ✅ Error handling middleware

## 🚀 API Endpoints

### Health Check

- `GET /health` - Server status

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (Protected)
- `PUT /api/auth/last-login` - Update last login (Protected)

### Formations

- `GET /api/formations` - Get all formations (paginated)
- `GET /api/formations/type/:type` - Get formations by type
- `GET /api/formations/:id` - Get formation by ID
- `POST /api/formations` - Create formation (Super Admin only)
- `PUT /api/formations/:id` - Update formation (Super Admin only)
- `DELETE /api/formations/:id` - Delete formation (Super Admin only)
- `PUT /api/formations/:id/popularity` - Increment popularity (Manager only)

## 🧪 Testing

API sudah ditest dan berjalan dengan baik:

```bash
✅ Health: OK
✅ Formations: 6 items found
✅ Register Player: testplayer123 (player)
✅ Register Manager: testmanager123 (Test FC)
```

## 🗄️ Database

MongoDB connection: `mongodb://localhost:27017/pes-football-management`

### Default Formations

1. **4-4-2** (Balanced) - Free
2. **4-3-3** (Attacking) - 5,000 coins
3. **5-3-2** (Defensive) - 3,000 coins
4. **3-5-2** (Wing Play) - 4,000 coins
5. **4-2-3-1** (Attacking) - 6,000 coins
6. **4-5-1** (Defensive) - 2,000 coins

## 🔧 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Language**: TypeScript
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting
- **Development**: ts-node-dev, ESLint

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # Express routes
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   └── index.ts        # Main server file
├── .env               # Environment variables
├── package.json       # Dependencies
└── tsconfig.json      # TypeScript config
```

## 🌟 Next Steps

Untuk melanjutkan development, kita bisa add:

1. **Player Management**: CRUD untuk player stats, energy system
2. **Match System**: Real-time matches dengan Socket.io
3. **Store System**: Purchase formations, upgrades
4. **Leaderboard**: Ranking system
5. **Super Admin**: User management, system logs
6. **File Upload**: Avatars, club logos dengan Multer
7. **Real-time Features**: Live notifications dengan Socket.io

## 🚀 Running the Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

Server berjalan di: http://localhost:5000
Frontend URL: http://localhost:5173
