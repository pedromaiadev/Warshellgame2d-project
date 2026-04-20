/**
 * Server type definitions
 */

import type { PlayerState } from "@warshell/shared";

export interface Player extends PlayerState {
  socketId: string;
}

export interface ServerConfig {
  port: number;
  host: string;
  environment: "development" | "production";
}

export enum EventType {
  CONNECTION = "connection",
  DISCONNECT = "disconnect",
  JOIN_GAME = "game:join",
  LEAVE_GAME = "game:leave",
  SHOOT = "game:shoot",
  AIM = "game:aim",
}

export interface Logger {
  info(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  debug(message: string, data?: unknown): void;
}
