/**
 * Canvas rendering system
 */

import type { Shot, PlayerState, GameConfig } from "@warshell/shared";

export class Renderer {
  private ctx: CanvasRenderingContext2D;

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");
    this.ctx = ctx;
  }

  clear(): void {
    this.ctx.fillStyle = "rgba(135, 206, 235, 0.8)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw ground
    this.ctx.fillStyle = "#8B7355";
    this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);
  }

  drawPlayer(player: PlayerState, angle: number): void {
    const x = player.position.x;
    const y = player.position.y;

    // Draw player circle
    this.ctx.fillStyle = player.isAlive ? "#4CAF50" : "#999";
    this.ctx.beginPath();
    this.ctx.arc(x, y, 15, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw cannon
    const cannonLength = 30;
    const cannonEndX = x + Math.cos(angle) * cannonLength;
    const cannonEndY = y - Math.sin(angle) * cannonLength;

    this.ctx.strokeStyle = "#333";
    this.ctx.lineWidth = 5;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(cannonEndX, cannonEndY);
    this.ctx.stroke();

    // Draw player label
    this.ctx.fillStyle = "#000";
    this.ctx.font = "12px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(player.username, x, y - 25);

    // Draw health bar
    const healthWidth = 40;
    this.ctx.fillStyle = "#666";
    this.ctx.fillRect(x - healthWidth / 2, y - 35, healthWidth, 5);
    this.ctx.fillStyle = "#ff4444";
    this.ctx.fillRect(
      x - healthWidth / 2,
      y - 35,
      (healthWidth * Math.max(0, player.health)) / 100,
      5
    );
  }

  drawProjectile(shot: Shot, config: GameConfig): void {
    const x = shot.position.x;
    const y = shot.position.y;

    this.ctx.fillStyle = "#FFD700";
    this.ctx.beginPath();
    this.ctx.arc(x, y, config.projectileRadius, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw trail
    this.ctx.strokeStyle = "rgba(255, 215, 0, 0.5)";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x - shot.velocity.x * 0.1, y - shot.velocity.y * 0.1);
    this.ctx.stroke();
  }

  drawExplosion(x: number, y: number, radius: number): void {
    // Outer circle
    this.ctx.fillStyle = "rgba(255, 100, 0, 0.6)";
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Inner circle
    this.ctx.fillStyle = "rgba(255, 200, 0, 0.8)";
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius * 0.6, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawText(text: string, x: number, y: number, options?: { size?: number; color?: string; bold?: boolean }): void {
    this.ctx.fillStyle = options?.color || "#000";
    this.ctx.font = `${options?.bold ? "bold " : ""}${options?.size || 16}px Arial`;
    this.ctx.textAlign = "center";
    this.ctx.fillText(text, x, y);
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}
