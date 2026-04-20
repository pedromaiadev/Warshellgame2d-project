/**
 * Network communication via Socket.IO
 */

import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents, PlayerState, RoomState, Shot } from "@warshell/shared";

export class NetworkManager {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private connected: boolean = false;

  connect(url: string = "http://localhost:3000"): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(url, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      this.socket.on("connect", () => {
        this.connected = true;
        this.emit("connected");
        resolve();
      });

      this.socket.on("disconnect", () => {
        this.connected = false;
        this.emit("disconnected");
      });

      this.socket.on("game:join_response", (success: boolean, player?: PlayerState, error?: string) => {
        this.emit("join_response", { success, player, error });
      });

      this.socket.on("game:player_joined", (player: PlayerState) => {
        this.emit("player_joined", player);
      });

      this.socket.on("game:player_left", (playerId: string) => {
        this.emit("player_left", playerId);
      });

      this.socket.on("game:state_update", (state: RoomState) => {
        this.emit("state_update", state);
      });

      this.socket.on("game:shot", (shot: Shot) => {
        this.emit("shot", shot);
      });

      this.socket.on("game:shot_hit", (shotId: string, targetId?: string) => {
        this.emit("shot_hit", { shotId, targetId });
      });

      this.socket.on("game:error", (message: string) => {
        this.emit("error", message);
      });

      this.socket.on("connect_error", (error: Error) => {
        reject(error);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinGame(roomId: string, username: string): void {
    if (!this.socket) throw new Error("Not connected");
    this.socket.emit("game:join", roomId, username);
  }

  leaveGame(): void {
    if (!this.socket) throw new Error("Not connected");
    this.socket.emit("game:leave");
  }

  shoot(angle: number, power: number): void {
    if (!this.socket) throw new Error("Not connected");
    this.socket.emit("game:shoot", angle, power);
  }

  aim(angle: number): void {
    if (!this.socket) throw new Error("Not connected");
    this.socket.emit("game:aim", angle);
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event) || [];
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  private emit(event: string, data?: unknown): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach((callback) => callback(data));
  }

  isConnected(): boolean {
    return this.connected;
  }
}
