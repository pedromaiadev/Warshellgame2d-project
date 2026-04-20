/**
 * Game physics and logic
 */

import { randomUUID } from "crypto";
import type { Shot, Vector2 } from "@warshell/shared";

export class Physics {
  static calculateProjectilePath(
    startPos: Vector2,
    angle: number,
    power: number,
    gravity: number,
    maxPower: number
  ): { velocity: Vector2 } {
    const velocity = (power / maxPower) * 500; // Scale power to velocity
    const radians = (angle * Math.PI) / 180;

    return {
      velocity: {
        x: velocity * Math.cos(radians),
        y: velocity * Math.sin(radians),
      },
    };
  }

  static createShot(
    playerId: string,
    position: Vector2,
    angle: number,
    power: number,
    gravity: number,
    maxPower: number
  ): Shot {
    const { velocity } = this.calculateProjectilePath(position, angle, power, gravity, maxPower);

    return {
      id: randomUUID(),
      playerId,
      position: { ...position },
      velocity,
      angle,
      power,
      timestamp: Date.now(),
    };
  }

  static checkCollision(pos1: Vector2, pos2: Vector2, radius1: number, radius2: number): boolean {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < radius1 + radius2;
  }

  static getDistance(pos1: Vector2, pos2: Vector2): number {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

export class GameLogic {
  static calculateDamage(distance: number, maxDistance: number = 200): number {
    // Damage decreases with distance
    if (distance > maxDistance) return 0;
    return Math.max(0, 100 - (distance / maxDistance) * 100);
  }

  static validateShot(angle: number, power: number): { valid: boolean; error?: string } {
    if (angle < 0 || angle > 180) {
      return { valid: false, error: "Angle must be between 0 and 180 degrees" };
    }
    if (power < 10 || power > 100) {
      return { valid: false, error: "Power must be between 10 and 100" };
    }
    return { valid: true };
  }

  static applyDamage(currentHealth: number, damage: number): number {
    return Math.max(0, currentHealth - damage);
  }
}
