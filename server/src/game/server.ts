/**
 * Game server - handles connections and game events
 */

import express, { Express } from "express";
import { createServer, Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "@warshell/shared";
import type { Player, ServerConfig } from "../types";
import { RoomManager } from "../rooms/room";
import { logger } from "../utils/logger";
import { Physics, GameLogic } from "./physics";
import { randomUUID } from "crypto";

export class GameServer {
  private app: Express;
  private httpServer: HttpServer;
  private io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>;
  private roomManager: RoomManager;
  private playerSockets: Map<string, string> = new Map(); // playerId -> socketId
  private socketPlayers: Map<string, string> = new Map(); // socketId -> playerId

  constructor(private config: ServerConfig) {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
    this.roomManager = new RoomManager();
    this.setupRoutes();
    this.setupSocketHandlers();
  }

  private setupRoutes(): void {
    this.app.get("/health", (req, res) => {
      res.json({ status: "ok", timestamp: new Date().toISOString() });
    });

    this.app.get("/rooms", (req, res) => {
      const roomsArray = Array.from((this.roomManager as any).rooms?.values() || []);
      const rooms = roomsArray.map((r: any) => ({
        id: r.id,
        name: r.name,
        players: r.players.size,
        maxPlayers: r.maxPlayers,
      }));
      res.json({ rooms });
    });
  }

  private setupSocketHandlers(): void {
    this.io.on("connection", (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
      logger.info("Client connected", { socketId: socket.id });

      socket.on("game:join", (roomId: string, username: string) => {
        this.handlePlayerJoin(socket, roomId, username);
      });

      socket.on("game:leave", () => {
        this.handlePlayerLeave(socket);
      });

      socket.on("game:shoot", (angle: number, power: number) => {
        this.handlePlayerShoot(socket, angle, power);
      });

      socket.on("game:aim", (angle: number) => {
        this.handlePlayerAim(socket, angle);
      });

      socket.on("disconnect", () => {
        this.handlePlayerDisconnect(socket);
      });
    });
  }

  private handlePlayerJoin(socket: Socket, roomId: string, username: string): void {
    const playerId = randomUUID();
    const room = this.roomManager.getOrCreateRoom(roomId);

    if (room.isFull()) {
      socket.emit("game:join_response", false, undefined, "Room is full");
      return;
    }

    const player: Player = {
      id: playerId,
      socketId: socket.id,
      username: username.slice(0, 20), // Limit username length
      position: {
        x: 100 + Math.random() * (1200 - 200),
        y: 450,
      },
      health: 100,
      score: 0,
      angle: 45,
      power: 50,
      isAlive: true,
    };

    if (!room.addPlayer(player)) {
      socket.emit("game:join_response", false, undefined, "Failed to join room");
      return;
    }

    // Store mappings
    this.playerSockets.set(playerId, socket.id);
    this.socketPlayers.set(socket.id, playerId);

    // Join socket to room
    socket.join(roomId);

    // Notify joining player
    const playerState = {
      id: player.id,
      username: player.username,
      position: player.position,
      health: player.health,
      score: player.score,
      angle: player.angle,
      power: player.power,
      isAlive: player.isAlive,
    };

    socket.emit("game:join_response", true, playerState);

    // Notify others in room
    socket.to(roomId).emit("game:player_joined", playerState);

    // Send room state to all players
    this.broadcastRoomState(roomId);

    logger.info("Player joined game", { playerId, roomId, username });
  }

  private handlePlayerLeave(socket: Socket): void {
    const playerId = this.socketPlayers.get(socket.id);
    if (!playerId) return;

    const player = Array.from((this.roomManager as any).rooms?.values() || [])
      .flatMap((r: any) => Array.from(r.players.values()))
      .find((p: any) => p.id === playerId);

    if (!player) return;

    const roomId = player.roomId || "unknown";
    const room = this.roomManager.getRoom(roomId);

    if (room) {
      room.removePlayer(playerId);
      socket.to(roomId).emit("game:player_left", playerId);
      socket.leave(roomId);
      this.broadcastRoomState(roomId);

      if (room.isEmpty()) {
        this.roomManager.deleteRoom(roomId);
      }
    }

    this.playerSockets.delete(playerId);
    this.socketPlayers.delete(socket.id);

    logger.info("Player left game", { playerId, roomId });
  }

  private handlePlayerShoot(socket: Socket, angle: number, power: number): void {
    const playerId = this.socketPlayers.get(socket.id);
    if (!playerId) return;

    const validation = GameLogic.validateShot(angle, power);
    if (!validation.valid) {
      socket.emit("game:error", validation.error || "Invalid shot");
      return;
    }

    // Find player and room
    let foundPlayer: Player | undefined;
    let roomId: string | undefined;

    for (const room of (this.roomManager as any).rooms?.values() || []) {
      foundPlayer = room.getPlayer(playerId);
      if (foundPlayer) {
        roomId = room.id;
        break;
      }
    }

    if (!foundPlayer || !roomId) return;

    const gameConfig = {
      gravity: 0.5,
      maxPower: 100,
      projectileRadius: 5,
      playerRadius: 15,
    };

    const shot = Physics.createShot(
      playerId,
      foundPlayer.position,
      angle,
      power,
      gameConfig.gravity,
      gameConfig.maxPower
    );

    // Store shot (in production, this would be in game state)
    // Broadcast to all players in room
    this.io.to(roomId).emit("game:shot", shot);

    logger.info("Player shot", { playerId, angle, power });

    // In a real game, you'd track shots and check collisions
    // For now, we just broadcast
  }

  private handlePlayerAim(socket: Socket, angle: number): void {
    const playerId = this.socketPlayers.get(socket.id);
    if (!playerId) return;

    // Find room
    let roomId: string | undefined;
    for (const room of (this.roomManager as any).rooms?.values() || []) {
      if (room.getPlayer(playerId)) {
        roomId = room.id;
        break;
      }
    }

    if (roomId) {
      const room = this.roomManager.getRoom(roomId);
      if (room) {
        socket.to(roomId).emit("game:state_update", room.getState());
      }
    }
  }

  private handlePlayerDisconnect(socket: Socket): void {
    const playerId = this.socketPlayers.get(socket.id);
    if (playerId) {
      this.handlePlayerLeave(socket);
    }
    logger.info("Client disconnected", { socketId: socket.id });
  }

  private broadcastRoomState(roomId: string): void {
    const room = this.roomManager.getRoom(roomId);
    if (room) {
      this.io.to(roomId).emit("game:state_update", room.getState());
    }
  }

  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.httpServer.listen(this.config.port, this.config.host, () => {
        logger.info("Server started", {
          port: this.config.port,
          host: this.config.host,
          environment: this.config.environment,
        });
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpServer.close((err) => {
        if (err) {
          logger.error("Error stopping server", err);
          reject(err);
        } else {
          logger.info("Server stopped");
          resolve();
        }
      });
    });
  }
}
