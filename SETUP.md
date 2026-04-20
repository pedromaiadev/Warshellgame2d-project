# Warshell Game - Monorepo Template Complete

## ✅ Project Generated Successfully

This is a production-ready monorepo template for a multiplayer web-based artillery game (similar to Worms/GunBound).

---

## 📦 Complete Directory Structure

```
warshell-game/
│
├── 📄 package.json                 # Root workspace config (npm workspaces)
├── 📄 README.md                    # Project overview
├── 📄 DEVELOPMENT.md               # Development & deployment guide
├── 📄 .env.example                 # Environment variables template
├── 📄 .gitignore                   # Git ignore rules
├── 📄 .eslintrc.json               # ESLint configuration
├── 📄 .dockerignore                # Docker ignore rules
├── 📄 docker-compose.yml           # Docker Compose for development
│
├── 📁 .github/workflows/
│   └── ci.yml                      # GitHub Actions CI/CD pipeline
│
├── 📁 docker/
│   └── Dockerfile                  # Multi-stage production Dockerfile
│
├── 📁 shared/                      # Shared types & utilities
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   └── 📁 src/
│       ├── 📄 types.ts             # Game interfaces & types
│       └── 📄 index.ts             # Re-exports
│
├── 📁 client/                      # Vite frontend application
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   ├── 📄 vite.config.ts
│   └── 📁 src/
│       ├── 📄 index.html           # HTML entry point
│       ├── 📄 main.ts              # App initialization
│       ├── 📁 game/
│       │   └── 📄 engine.ts        # Game loop & state management
│       ├── 📁 rendering/
│       │   └── 📄 renderer.ts      # Canvas rendering system
│       ├── 📁 input/
│       │   └── 📄 input.ts         # Keyboard/mouse input handling
│       └── 📁 network/
│           └── 📄 network.ts       # Socket.IO client
│
└── 📁 server/                      # Express + Socket.IO backend
    ├── 📄 package.json
    ├── 📄 tsconfig.json
    └── 📁 src/
        ├── 📄 index.ts             # Server entry point
        ├── 📄 types.ts             # Server type definitions
        ├── 📁 game/
        │   ├── 📄 server.ts        # Game server & Socket.IO handlers
        │   └── 📄 physics.ts       # Physics & game logic
        ├── 📁 rooms/
        │   └── 📄 room.ts          # Room & player management
        └── 📁 utils/
            └── 📄 logger.ts        # Logging utility
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd warshell-game
npm install
```

This installs all dependencies for all workspaces (shared, server, client).

### 2. Start Development

```bash
npm run dev
```

This starts both the client (Vite on port 5173) and server (Express on port 3000) in development mode.

Or run separately:
```bash
# Terminal 1
npm run dev:client     # Vite: http://localhost:5173

# Terminal 2
npm run dev:server     # Express: http://localhost:3000
```

### 3. Open in Browser

Navigate to `http://localhost:5173` and join a game room!

---

## 📋 npm Scripts

### Root Level (all workspaces)
```bash
npm install              # Install all dependencies
npm run dev              # Start dev mode (client + server)
npm run build            # Build all packages
npm run lint             # Lint all packages
npm run type-check       # TypeScript type checking
```

### Individual Packages
```bash
npm run dev:client       # Start Vite dev server
npm run dev:server       # Start Express dev server
npm run build:client     # Build frontend only
npm run build:server     # Build backend only
```

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Vite + TypeScript | Fast builds, modern tooling |
| **Rendering** | HTML5 Canvas | High-performance 2D graphics |
| **Real-time** | Socket.IO | WebSocket multiplayer events |
| **Backend** | Express.js | HTTP server & REST API |
| **Game Logic** | Node.js + TypeScript | Authoritative server |
| **Container** | Docker | Production deployment |
| **Build** | GitHub Actions | CI/CD automation |
| **Package Manager** | npm workspaces | Monorepo management |

---

## 📝 Key Features

### ✨ Client Features
- **Game Loop** - requestAnimationFrame-based 60 FPS rendering
- **Canvas Rendering** - Players, projectiles, explosions
- **Input Handling** - Mouse aim, keyboard controls
- **Socket.IO Client** - Real-time multiplayer events
- **State Management** - Local game state + server sync

### ✨ Server Features
- **Room Management** - Dynamic room creation/cleanup
- **Player Management** - Join/leave/disconnect handling
- **Game Logic** - Physics, collision, damage calculation
- **Socket.IO Server** - Event broadcasting
- **REST API** - Health check, room listing

### ✨ DevOps Features
- **GitHub Actions** - Automated CI/CD pipeline
- **Docker** - Multi-stage production build
- **Docker Compose** - Local development orchestration
- **Type Safety** - TypeScript strict mode throughout
- **Linting** - ESLint + TypeScript validation

---

## 🐳 Docker

### Build & Run

```bash
# Build image
docker build -t warshell-server:latest -f docker/Dockerfile .

# Run container
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  warshell-server:latest
```

### Docker Compose (Development)

```bash
docker-compose up -d
docker-compose logs -f game-server
docker-compose down
```

### Health Check

```bash
curl http://localhost:3000/health
# Response: {"status":"ok","timestamp":"2026-04-20T..."}
```

---

## 🔄 Monorepo Architecture

All packages share TypeScript types through `@warshell/shared`:

```
shared/
├─ PlayerState
├─ RoomState
├─ Shot
├─ GameConfig
└─ Event Interfaces

↓

client/src/            server/src/
├─ engine.ts           ├─ server.ts
├─ renderer.ts         ├─ physics.ts
├─ network.ts          └─ rooms/room.ts
└─ input.ts
```

Benefits:
- **Type Safety** - Single source of truth for data structures
- **Code Reuse** - Shared utilities and types
- **Consistency** - Synchronized data formats
- **Easy Refactoring** - Change one file, update all consumers

---

## 🔌 Network Events

### Client → Server
```typescript
"game:join"    // Join room with username
"game:leave"   // Leave current room
"game:shoot"   // Fire projectile (angle, power)
"game:aim"     // Update aim angle
```

### Server → Client
```typescript
"game:join_response"    // Join result + player state
"game:player_joined"    // New player notification
"game:player_left"      // Player disconnect notification
"game:state_update"     // Full room state
"game:shot"             // Projectile broadcast
"game:shot_hit"         // Hit notification
"game:error"            // Error message
```

---

## 📊 Game Logic

### Physics System
- **Projectile Path** - Calculated from angle & power
- **Gravity** - Constant downward acceleration
- **Collision** - Distance-based circle collision
- **Damage** - Decreases with distance from impact

### Server Authority
- All game logic validated on server
- Client sends input, server broadcasts results
- Anti-cheat protection through validation
- Smooth client-side prediction ready

---

## 🛠️ Development Workflow

### Adding a Feature

1. **Update shared types** (if needed)
   ```typescript
   // shared/src/types.ts
   export interface NewFeature { ... }
   ```

2. **Update server logic**
   ```typescript
   // server/src/game/ or server/src/rooms/
   ```

3. **Update client**
   ```typescript
   // client/src/game/ or client/src/rendering/
   ```

4. **Test locally**
   ```bash
   npm run dev
   ```

5. **Lint & type-check**
   ```bash
   npm run lint
   npm run type-check
   ```

6. **Push & PR**
   - GitHub Actions runs automatically
   - All checks must pass

---

## 📚 Code Quality Standards

- **TypeScript Strict Mode** - Enforced throughout
- **ESLint** - Code consistency
- **Type Safety** - No `any` types allowed
- **Error Handling** - Proper try-catch and logging
- **Separation of Concerns** - Modular architecture
- **Comments** - JSDoc for public APIs

---

## 🧪 Testing Ready

Add tests to any package:

```bash
npm run test              # Run all tests
npm run test --workspace=server   # Server tests only
npm run test --workspace=client   # Client tests only
```

Test files can be placed in `src/` with `.test.ts` or `.spec.ts` suffix.

---

## 🚢 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start  # or npm run build:server && node server/dist/index.js
```

### Docker Production
```bash
docker build -t warshell-server:latest -f docker/Dockerfile .
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  warshell-server:latest
```

### Environment Variables
```env
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
VITE_SERVER_URL=https://your-server.com
```

---

## 📖 Documentation Files

1. **README.md** - Project overview
2. **DEVELOPMENT.md** - Detailed dev & deployment guide
3. **Code comments** - JSDoc on public APIs
4. **Type definitions** - Self-documenting TypeScript interfaces

---

## ⚠️ Known Limitations (MVP)

- Single game room (extend with lobbies)
- Basic collision detection (expand for accuracy)
- No persistence (add database)
- No authentication (add JWT)
- No chat/messaging (add Signal or WebRTC)
- Client-side rendering only (add advanced graphics)

---

## 🔜 Next Steps

1. **Run the project**
   ```bash
   npm install
   npm run dev
   ```

2. **Explore the code**
   - Study `client/src/game/engine.ts` - Game loop
   - Study `server/src/game/server.ts` - Network handlers
   - Study `shared/src/types.ts` - Data types

3. **Extend features**
   - Add weapons variety
   - Implement wind physics
   - Add terrain destruction
   - Create lobby system
   - Add player persistence

4. **Deploy**
   - Push to GitHub
   - Configure GitHub Actions secrets
   - Deploy Docker image to cloud (AWS, GCP, Azure, etc.)

---

## 🎯 Architecture Decisions

✅ **npm workspaces** - Better than Lerna/Nx for this scale
✅ **Vite** - Modern, fast, zero-config build tool
✅ **Express** - Lightweight, battle-tested
✅ **Socket.IO** - Production-ready WebSocket library
✅ **TypeScript** - Type safety from ground up
✅ **ESLint** - Code quality enforcement
✅ **Docker** - Reproducible deployments
✅ **GitHub Actions** - Built-in CI/CD

---

## 📞 Support

For issues or questions:
1. Check DEVELOPMENT.md for troubleshooting
2. Review example code in `src/` files
3. Check TypeScript types for API contracts
4. Review GitHub Actions workflow for build issues

---

## 📄 License

MIT

---

## 🎮 Ready to Play!

Your monorepo is complete and ready to extend into a full multiplayer game.
Start with `npm install` and `npm run dev` to see it in action!

Happy coding! 🚀
