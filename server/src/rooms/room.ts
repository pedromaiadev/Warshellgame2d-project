/**
 * Room management
 */

import { randomUUID } from "crypto";
import type { PlayerState, RoomState } from "@warshell/shared";
import type { Player } from "../types";
import { logger } from "../utils/logger";

export class GameRoom {
  public id: string;
  public name: string;
  public maxPlayers: number;
  public players: Map<string, Player> = new Map();
  public gameActive: boolean = false;
  public createdAt: number;

  constructor(id?: string, name?: string, maxPlayers: number = 4) {
    this.id = id || randomUUID();
    this.name = name || `Room ${this.id.slice(0, 8)}`;
    this.maxPlayers = maxPlayers;
    this.createdAt = Date.now();
  }

  addPlayer(player: Player): boolean {
    if (this.players.size >= this.maxPlayers) {
      logger.warn("Room full", { roomId: this.id, playerId: player.id });
      return false;
    }

    this.players.set(player.id, player);
    logger.info("Player joined room", { roomId: this.id, playerId: player.id });
    return true;
  }

  removePlayer(playerId: string): Player | undefined {
    const player = this.players.get(playerId);
    if (player) {
      this.players.delete(playerId);
      logger.info("Player left room", { roomId: this.id, playerId });
    }
    return player;
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  getPlayers(): PlayerState[] {
    return Array.from(this.players.values()).map((p) => ({
      id: p.id,
      username: p.username,
      position: p.position,
      health: p.health,
      score: p.score,
      angle: p.angle,
      power: p.power,
      isAlive: p.isAlive,
      roomId: this.id,
    }));
  }

  getState(): RoomState {
    return {
      id: this.id,
      name: this.name,
      maxPlayers: this.maxPlayers,
      players: this.getPlayers(),
      gameActive: this.gameActive,
      createdAt: this.createdAt,
    };
  }

  isEmpty(): boolean {
    return this.players.size === 0;
  }

  isFull(): boolean {
    return this.players.size >= this.maxPlayers;
  }

  reset(): void {
    this.players.clear();
    this.gameActive = false;
  }
}

export class RoomManager {
  private rooms: Map<string, GameRoom> = new Map();

  createRoom(id?: string, name?: string, maxPlayers?: number): GameRoom {
    const room = new GameRoom(id, name, maxPlayers);
    this.rooms.set(room.id, room);
    logger.info("Room created", { roomId: room.id });
    return room;
  }

  getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId);
  }

  getOrCreateRoom(roomId: string): GameRoom {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = this.createRoom(roomId);
    }
    return room;
  }

  deleteRoom(roomId: string): void {
    this.rooms.delete(roomId);
    logger.info("Room deleted", { roomId });
  }

  cleanup(): void {
    // Remove empty rooms
    const emptyRooms: string[] = [];
    this.rooms.forEach((room, id) => {
      if (room.isEmpty()) {
        emptyRooms.push(id);
      }
    });

    emptyRooms.forEach((id) => {
      this.deleteRoom(id);
    });
  }
}
