# Warshell Game - Development & Deployment Guide

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Project Structure](#project-structure)
3. [Running the Application](#running-the-application)
4. [Docker Deployment](#docker-deployment)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Architecture Overview](#architecture-overview)
7. [Contributing](#contributing)
8. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites

- Node.js 18+ ([download](https://nodejs.org/))
- npm 9+ (included with Node.js)
- Docker & Docker Compose (optional, for containerized development)
- Git

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd warshell-game
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

   This will install dependencies for all workspaces (shared, server, client).

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` if needed for development:
   ```env
   PORT=3000
   NODE_ENV=development
   VITE_SERVER_URL=http://localhost:3000
   ```

---

## Project Structure

```
warshell-game/
├── client/                      # Vite frontend application
│   ├── src/
│   │   ├── game/engine.ts       # Main game loop
│   │   ├── rendering/renderer.ts # Canvas rendering
│   │   ├── input/input.ts       # Keyboard/mouse input handling
│   │   ├── network/network.ts   # Socket.IO client
│   │   ├── main.ts              # Entry point
│   │   └── index.html           # HTML template
│   ├── vite.config.ts           # Vite configuration
│   ├── tsconfig.json            # TypeScript config
│   └── package.json
│
├── server/                      # Express + Socket.IO backend
│   ├── src/
│   │   ├── game/
│   │   │   ├── server.ts        # Game server & connection handling
│   │   │   └── physics.ts       # Physics & game logic
│   │   ├── rooms/room.ts        # Room & player management
│   │   ├── utils/logger.ts      # Logging utility
│   │   ├── types.ts             # Server types
│   │   └── index.ts             # Entry point
│   ├── tsconfig.json
│   └── package.json
│
├── shared/                      # Shared types & utilities
│   ├── src/
│   │   ├── types.ts             # Game types & interfaces
│   │   └── index.ts             # Exports
│   ├── tsconfig.json
│   └── package.json
│
├── .github/workflows/           # CI/CD pipelines
│   └── ci.yml                   # GitHub Actions workflow
│
├── docker/                      # Docker configuration
│   └── Dockerfile               # Multi-stage build
│
├── .env.example                 # Environment variables template
├── .eslintrc.json               # ESLint configuration
├── .gitignore                   # Git ignore rules
├── docker-compose.yml           # Docker Compose for dev
├── package.json                 # Root workspace config
└── README.md                    # Project overview
```

---

## Running the Application

### Development Mode

#### Run both client and server together

```bash
npm run dev
```

This will start:
- **Client**: Vite dev server on `http://localhost:5173`
- **Server**: Express server on `http://localhost:3000`

#### Run individually

```bash
# Terminal 1 - Frontend
npm run dev:client

# Terminal 2 - Backend
npm run dev:server
```

### Access the Game

Open your browser and navigate to: `http://localhost:5173`

### Stop the Application

Press `Ctrl+C` in each terminal.

---

## Production Build

### Build all packages

```bash
npm run build
```

This will:
1. Build the shared package
2. Build the client (outputs to `client/dist/`)
3. Build the server (outputs to `server/dist/`)

### Build specific packages

```bash
npm run build:client   # Build frontend only
npm run build:server   # Build backend only
```

### Type checking

```bash
npm run type-check

# Or for all packages
npm run type-check --workspaces
```

### Linting

```bash
npm run lint

# Fix linting issues
npm run lint -- --fix
```

---

## Docker Deployment

### Build Docker Image

```bash
docker build -t warshell-server:latest -f docker/Dockerfile .
```

### Run Docker Container

```bash
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  warshell-server:latest
```

### Docker Compose (Development)

For easy local development with Docker:

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f game-server

# Stop services
docker-compose down
```

### Container Environment Variables

```env
PORT=3000                  # Server port
HOST=0.0.0.0               # Server host (0.0.0.0 for Docker)
NODE_ENV=production        # Node environment
```

### Health Check

The container includes a health check that hits the `/health` endpoint:

```bash
curl http://localhost:3000/health
# Response: {"status":"ok","timestamp":"2026-04-20T..."}
```

---

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) automatically runs on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

### Pipeline Steps

1. **Checkout** - Clones repository
2. **Setup Node.js** - Installs Node 18.x and 20.x
3. **Install Dependencies** - Runs `npm ci`
4. **Lint** - Runs ESLint on all packages
5. **Type Check** - TypeScript strict mode validation
6. **Build Client** - Vite production build
7. **Build Server** - TypeScript compilation
8. **Build Docker Image** - Creates container image (on main branch)

### Viewing Pipeline Results

1. Go to GitHub repository
2. Click "Actions" tab
3. Select workflow run
4. Review build logs

---

## Architecture Overview

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Vite + TypeScript | Fast development & production builds |
| Rendering | HTML5 Canvas | High-performance 2D graphics |
| Real-time Communication | Socket.IO | WebSocket-based multiplayer events |
| Backend | Express.js | HTTP server & REST API |
| Game Logic | Node.js + TypeScript | Authoritative game server |
| Containerization | Docker | Production deployment |
| Type Safety | TypeScript | Compile-time type checking |
| Monorepo | npm workspaces | Shared code & unified development |

### Network Architecture

```
┌─────────────┐                ┌──────────────┐
│   Client    │◄─── Socket.IO ──────►│  Server  │
│  (Browser)  │   (WebSocket)        │(Node.js) │
└─────────────┘                └──────────────┘
       ▲
       │ HTTP (Vite dev server)
       │ or CDN (production)
       │
   Web Browser
```

### Game Loop Flow

```
Client                          Server
├─ Input Collection             ├─ Socket Events
│  (Mouse/Keyboard)             ├─ Game Logic Validation
├─ Local Rendering              ├─ Physics Calculations
├─ Network Events               ├─ Collision Detection
│  └─ Send aim/shoot            ├─ Damage Application
│                               └─ Broadcast to All
├─ Receive Shot                 
├─ Update Game State            
└─ Re-render Canvas
```

---

## Development Workflow

### Adding a New Feature

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Update shared types** (if needed)
   ```typescript
   // shared/src/types.ts
   export interface NewGameEvent {
     // ...
   }
   ```

3. **Update server logic**
   ```typescript
   // server/src/game/server.ts or other modules
   ```

4. **Update client UI/logic**
   ```typescript
   // client/src/game/engine.ts or other modules
   ```

5. **Test locally**
   ```bash
   npm run dev
   ```

6. **Lint and type-check**
   ```bash
   npm run lint
   npm run type-check
   ```

7. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

---

## Troubleshooting

### Issue: "Cannot find module '@warshell/shared'"

**Solution**: Ensure all packages are installed:
```bash
npm install
```

If problem persists, clean and reinstall:
```bash
rm -rf node_modules
npm install
```

### Issue: Client can't connect to server

**Solution**: Check server is running on port 3000:
```bash
# Check if port 3000 is in use
netstat -an | grep 3000  # Linux/Mac
netstat -ano | findstr :3000  # Windows
```

Verify `VITE_SERVER_URL` in environment variables.

### Issue: Port already in use

**Solution**: Kill process using the port or use a different port:

```bash
# Find PID using port 3000
lsof -i :3000  # Linux/Mac

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev:server
```

### Issue: "Cannot find module 'socket.io-client'"

**Solution**: Dependencies not installed:
```bash
npm install
```

### Issue: TypeScript errors in IDE but code builds fine

**Solution**: Reload VS Code or restart TypeScript server:
- VS Code: `Ctrl+Shift+P` > "TypeScript: Restart TS Server"

### Issue: Docker build fails

**Solution**: Ensure you're in the correct directory:
```bash
cd warshell-game
docker build -t warshell-server:latest -f docker/Dockerfile .
```

---

## Performance Optimization Tips

### Client-Side

- Use Canvas batch rendering
- Limit render calls to 60 FPS
- Debounce network events
- Use offscreen Canvas for calculations

### Server-Side

- Use rooms to partition player state
- Implement efficient collision detection
- Batch state updates
- Monitor memory with `--inspect` flag

### Network

- Compress Socket.IO messages
- Use binary protocol for large data
- Implement client-side prediction
- Throttle non-critical events

---

## Future Enhancements

- [ ] Persistent player database (MongoDB/PostgreSQL)
- [ ] Authentication system (JWT)
- [ ] Game progression & rankings
- [ ] Mobile support (touch controls)
- [ ] Advanced physics (wind, terrain)
- [ ] Spectator mode
- [ ] Chat system
- [ ] Sound effects & music
- [ ] Weapon variety
- [ ] Dynamic weather effects

---

## Support & Resources

- **TypeScript Docs**: https://www.typescriptlang.org/docs/
- **Socket.IO Docs**: https://socket.io/docs/
- **Vite Docs**: https://vitejs.dev/guide/
- **Express Docs**: https://expressjs.com/
- **Docker Docs**: https://docs.docker.com/

---

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!
