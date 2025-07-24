# PES Football Management System

A modern football management system built with React, TypeScript, and Tailwind CSS.

## Features

### 🎮 Player Mode
- **Character Creation** - Customize your football player
- **Skills & Styles** - Develop your player attributes
- **Player Store** - Purchase skills, styles, and stat upgrades
- **Match System** - Compete against other players
- **Leaderboard** - Track rankings and progress

### ⚽ Manager Mode
- **Club Dashboard** - Manage your football club
- **Squad Management** - Organize your team roster
- **Formation Builder** - Design tactical formations with 21+ options
- **Store** - Buy formations and club upgrades
- **Match Management** - Schedule and analyze matches

### 🛡️ Super Admin Mode
- **User Management** - Manage players and managers
- **Club Management** - Oversee all football clubs
- **Tournament System** - Organize competitions
- **Reports & Analytics** - Monitor system performance
- **System Logs** - Track platform activities

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Shadcn/ui, Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Query, React Hooks
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom football theme

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd pes-football-management
```

2. Install dependencies
```bash
cd frontend
npm install
```

3. Start development server
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173)

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Shadcn/ui components
│   │   ├── EnergyBar.tsx   # Player energy display
│   │   ├── PlayerCard.tsx  # Player information card
│   │   └── Sidebar.tsx     # Navigation sidebar
│   ├── pages/              # Page components
│   │   ├── player/         # Player mode pages
│   │   ├── manager/        # Manager mode pages
│   │   ├── superadmin/     # Super admin pages
│   │   └── shared/         # Shared pages
│   ├── layouts/            # Layout components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   └── constants/          # Game constants
```

## Key Features

### 🎯 Formation Builder
- 21+ tactical formations categorized by style:
  - **Attacking**: 4-3-3, 3-4-3, 4-2-3-1, etc.
  - **Balanced**: 4-4-2, 4-1-4-1, 4-4-1-1, etc.
  - **Defensive**: 5-3-2, 5-4-1, 4-5-1, etc.
  - **Wing Play**: 3-5-2, 4-1-3-2
- Drag & drop player positioning
- Real-time formation visualization

### 📱 Mobile-First Design
- Responsive design for all screen sizes
- Mobile-optimized navigation
- Touch-friendly interactions
- Progressive Web App ready

### 🎨 Custom Theme
- Football-inspired color scheme
- Stadium gradient backgrounds
- Smooth animations and transitions
- Consistent design system

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Roadmap

- [ ] Backend API development
- [ ] Real-time match system
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Multiplayer tournaments
- [ ] AI-powered coaching

---

Built with ❤️ for football management enthusiasts
