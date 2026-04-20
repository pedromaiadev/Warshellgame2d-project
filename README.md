# Warshell Game - Multiplayer Artillery Game

A modern, web-based multiplayer artillery game (inspired by Worms/GunBound) built with TypeScript, Vite, Express, and Socket.IO.

## Features

- **Real-time multiplayer gameplay** via Socket.IO
- **Authoritative server** with room management
- **Canvas-based rendering** for the game client
- **TypeScript across frontend, backend, and shared code**
- **Docker support** for production deployment
- **GitHub Actions CI/CD** for builds and validation

## Monorepo Structure

This repository is organized using npm workspaces with the following packages:

- `client` — Vite frontend application
- `server` — Express + Socket.IO backend
- `shared` — Shared TypeScript types and interfaces

## Quick Start

### Requirements

- Node.js 18+
- npm 9+
- Docker (optional)

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Type Check

```bash
npm run type-check
```

## Docker

Build the server image:

```bash
docker build -t warshell-server:latest -f docker/Dockerfile .
```

Run the server:

```bash
docker run -p 3000:3000 warshell-server:latest
```

## CI/CD

A GitHub Actions workflow runs on push to `main` and `develop`, installs dependencies, runs lint and type-check, builds the client and server, and builds the Docker image.

## Project Layout

```
warshell-game/
├── client/
├── server/
├── shared/
├── .github/workflows/
├── docker/
├── package.json
├── README.md
└── .eslintrc.json
```

## Notes

This template is designed as an MVP starting point for a multiplayer artillery game. Extend it with additional game mechanics, authentication, persistence, and advanced rendering.

