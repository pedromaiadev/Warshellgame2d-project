/**
 * Server entry point
 */

import type { ServerConfig } from "./types";
import { GameServer } from "./game/server";
import { logger } from "./utils/logger";

const serverConfig: ServerConfig = {
  port: parseInt(process.env.PORT || "3000", 10),
  host: process.env.HOST || "0.0.0.0",
  environment: (process.env.NODE_ENV as "development" | "production") || "development",
};

async function main(): Promise<void> {
  try {
    const server = new GameServer(serverConfig);
    await server.start();

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      logger.info("SIGTERM received, shutting down gracefully");
      await server.stop();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      logger.info("SIGINT received, shutting down gracefully");
      await server.stop();
      process.exit(0);
    });
  } catch (error) {
    logger.error("Fatal error", error);
    process.exit(1);
  }
}

main();
