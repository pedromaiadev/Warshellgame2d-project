export interface Vector2 {
  x: number;
  y: number;
}

export interface Shot {
  id: string;
  playerId: string;
  position: Vector2;
  velocity: Vector2;
  angle: number;
  power: number;
  timestamp: number;
}

export interface PlayerState {
  id: string;
  username: string;
  position: Vector2;
  health: number;
  score: number;
  angle: number;
  power: number;
  isAlive: boolean;
  roomId?: string;
}

export interface RoomState {
  id: string;
  name: string;
  maxPlayers: number;
  players: PlayerState[];
  gameActive: boolean;
  createdAt: number;
}

export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  gravity: number;
  maxPower: number;
  minPower: number;
  projectileRadius: number;
  playerRadius: number;
}

export enum GameEventType {
  PLAYER_JOINED = "player:joined",
  PLAYER_LEFT = "player:left",
  PLAYER_SHOT = "player:shot",
  SHOT_HIT = "shot:hit",
  PLAYER_DIED = "player:died",
  ROOM_CREATED = "room:created",
  ROOM_DESTROYED = "room:destroyed",
  GAME_STATE_UPDATE = "game:state_update",
}

export interface ServerToClientEvents {
  "game:join_response": (success: boolean, player?: PlayerState, error?: string) => void;
  "game:player_joined": (player: PlayerState) => void;
  "game:player_left": (playerId: string) => void;
  "game:state_update": (state: RoomState) => void;
  "game:shot": (shot: Shot) => void;
  "game:shot_hit": (shotId: string, targetId?: string) => void;
  "game:error": (message: string) => void;
}

export interface ClientToServerEvents {
  "game:join": (roomId: string, username: string) => void;
  "game:leave": () => void;
  "game:shoot": (angle: number, power: number) => void;
  "game:aim": (angle: number) => void;
}
