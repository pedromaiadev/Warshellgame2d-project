/**
 * Game loop and state management
 */

import type { PlayerState, RoomState, Shot, GameConfig } from "@warshell/shared";
import { Renderer } from "../rendering/renderer";
import { InputHandler, type InputState } from "../input/input";
import { NetworkManager } from "../network/network";

export class GameEngine {
  private renderer: Renderer;
  private inputHandler: InputHandler;
  private networkManager: NetworkManager;

  private gameState: {
    players: Map<string, PlayerState>;
    shots: Map<string, Shot>;
    currentPlayer: PlayerState | null;
    roomState: RoomState | null;
  } = {
    players: new Map(),
    shots: new Map(),
    currentPlayer: null,
    roomState: null,
  };

  private gameConfig: GameConfig;
  private animationFrameId: number | null = null;
  private lastUpdate: number = 0;

  constructor(canvas: HTMLCanvasElement, config: Partial<GameConfig> = {}) {
    this.renderer = new Renderer(canvas);
    this.inputHandler = new InputHandler(canvas);
    this.networkManager = new NetworkManager();

    // Import and merge config
    this.gameConfig = {
      canvasWidth: 1200,
      canvasHeight: 600,
      gravity: 0.5,
      maxPower: 100,
      minPower: 10,
      projectileRadius: 5,
      playerRadius: 15,
      ...config,
    };

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Input events
    this.inputHandler.on("shoot", (data: { angle: number; power: number }) => {
      this.networkManager.shoot(data.angle, data.power);
    });

    this.inputHandler.on("aim", (angle: number) => {
      this.networkManager.aim(angle);
    });

    // Network events
    this.networkManager.on("connected", () => {
      this.updateUI("status", "Connected");
    });

    this.networkManager.on("disconnected", () => {
      this.updateUI("status", "Disconnected");
      this.stop();
    });

    this.networkManager.on("join_response", (data: { success: boolean; player?: PlayerState; error?: string }) => {
      if (data.success) {
        this.gameState.currentPlayer = data.player || null;
        this.updateUI("player", data.player);
        this.start();
      } else {
        this.showError(data.error || "Failed to join game");
      }
    });

    this.networkManager.on("state_update", (state: RoomState) => {
      this.gameState.roomState = state;
      this.gameState.players.clear();
      state.players.forEach((player: PlayerState) => {
        this.gameState.players.set(player.id, player);
      });
      this.updatePlayersList();
    });

    this.networkManager.on("shot", (shot: Shot) => {
      this.gameState.shots.set(shot.id, shot);
    });

    this.networkManager.on("shot_hit", (data: { shotId: string; targetId?: string }) => {
      this.gameState.shots.delete(data.shotId);
    });

    this.networkManager.on("error", (message: string) => {
      this.showError(message);
    });
  }

  async connect(url: string = "http://localhost:3000"): Promise<void> {
    await this.networkManager.connect(url);
  }

  joinGame(roomId: string, username: string): void {
    if (!this.networkManager.isConnected()) {
      this.showError("Not connected to server");
      return;
    }
    this.networkManager.joinGame(roomId, username);
  }

  leaveGame(): void {
    this.networkManager.leaveGame();
    this.stop();
  }

  private start(): void {
    if (this.animationFrameId === null) {
      this.gameLoop();
    }
  }

  private stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private gameLoop = (): void => {
    const now = Date.now();
    const deltaTime = (now - this.lastUpdate) / 1000;
    this.lastUpdate = now;

    this.update(deltaTime);
    this.render();

    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    // Update projectiles
    this.gameState.shots.forEach((shot) => {
      shot.position.x += shot.velocity.x * deltaTime;
      shot.position.y += shot.velocity.y * deltaTime;
      shot.velocity.y += this.gameConfig.gravity;

      // Remove if out of bounds
      if (
        shot.position.x < 0 ||
        shot.position.x > this.gameConfig.canvasWidth ||
        shot.position.y > this.gameConfig.canvasHeight
      ) {
        this.gameState.shots.delete(shot.id);
      }
    });
  }

  private render(): void {
    this.renderer.clear();

    // Draw players
    this.gameState.players.forEach((player) => {
      const inputState = this.inputHandler.getInputState();
      const angle =
        player.id === this.gameState.currentPlayer?.id ? (inputState.angle * Math.PI) / 180 : player.angle;
      this.renderer.drawPlayer(player, angle);
    });

    // Draw shots
    this.gameState.shots.forEach((shot) => {
      this.renderer.drawProjectile(shot, this.gameConfig);
    });

    // Draw UI info
    if (this.gameState.currentPlayer) {
      const inputState = this.inputHandler.getInputState();
      this.renderer.drawText(`Angle: ${inputState.angle.toFixed(1)}° Power: ${inputState.power.toFixed(0)}%`, 100, 30, {
        size: 14,
        color: "#fff",
        bold: true,
      });
    }
  }

  disconnect(): void {
    this.stop();
    this.networkManager.disconnect();
  }

  private updateUI(type: string, data: unknown): void {
    if (type === "status") {
      const status = this.networkManager.isConnected() ? "Connected" : "Disconnected";
      const statusEl = document.getElementById("statusContainer");
      if (statusEl) {
        statusEl.textContent = status;
        statusEl.className = `status ${this.networkManager.isConnected() ? "connected" : "disconnected"}`;
      }
    } else if (type === "player" && data) {
      const player = data as PlayerState;
      document.getElementById("playerId")!.textContent = player.id;
      document.getElementById("health")!.textContent = `${player.health}/100`;
      document.getElementById("score")!.textContent = `${player.score}`;
      const inputState = this.inputHandler.getInputState();
      document.getElementById("anglepower")!.textContent = `${inputState.angle.toFixed(1)}° / ${inputState.power}%`;
    }
  }

  private updatePlayersList(): void {
    const playersList = document.getElementById("playersList");
    if (!playersList) return;

    playersList.innerHTML = this.gameState.roomState?.players
      .map(
        (player: PlayerState) =>
          `
      <div class="player-item">
        <span>${player.username} (${player.health}HP)</span>
        <div class="player-health">
          <div class="player-health-bar" style="width: ${player.health}%"></div>
        </div>
      </div>
    `
      )
      .join("") || "";
  }

  private showError(message: string): void {
    const errorContainer = document.getElementById("errorContainer");
    if (errorContainer) {
      errorContainer.innerHTML = `<div class="error">${message}</div>`;
      setTimeout(() => {
        errorContainer.innerHTML = "";
      }, 5000);
    }
  }
}
