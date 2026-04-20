/**
 * Main entry point
 */

import { GameEngine } from "./game/engine";

// Initialize game when DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  if (!canvas) {
    console.error("Canvas element not found");
    throw new Error("Canvas not found");
  }

  const game = new GameEngine(canvas);

  // UI Button handlers
  const joinBtn = document.getElementById("joinBtn") as HTMLButtonElement;
  const leaveBtn = document.getElementById("leaveBtn") as HTMLButtonElement;
  const usernameInput = document.getElementById("usernameInput") as HTMLInputElement;
  const roomInput = document.getElementById("roomInput") as HTMLInputElement;

  joinBtn.addEventListener("click", async () => {
    const username = usernameInput.value.trim();
    const roomId = roomInput.value.trim() || "lobby";

    if (!username) {
      alert("Please enter a username");
      return;
    }

    try {
      await game.connect();
      game.joinGame(roomId, username);
      joinBtn.disabled = true;
      leaveBtn.disabled = false;
      usernameInput.disabled = true;
      roomInput.disabled = true;
    } catch (error) {
      console.error("Failed to connect:", error);
      alert("Failed to connect to server");
    }
  });

  leaveBtn.addEventListener("click", () => {
    game.leaveGame();
    joinBtn.disabled = false;
    leaveBtn.disabled = true;
    usernameInput.disabled = false;
    roomInput.disabled = false;
  });

  // Handle page unload
  window.addEventListener("beforeunload", () => {
    game.disconnect();
  });
});
