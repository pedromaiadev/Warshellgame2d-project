/**
 * Logger utility
 */

import type { Logger } from "../types";

export class ConsoleLogger implements Logger {
  private isDevelopment = process.env.NODE_ENV !== "production";

  info(message: string, data?: unknown): void {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data || "");
  }

  error(message: string, data?: unknown): void {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, data || "");
  }

  warn(message: string, data?: unknown): void {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || "");
  }

  debug(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, data || "");
    }
  }
}

export const logger = new ConsoleLogger();
