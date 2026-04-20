/**
 * Input handling system
 */

export interface InputState {
  angle: number;
  power: number;
  isAiming: boolean;
}

export class InputHandler {
  private inputState: InputState = {
    angle: 45,
    power: 50,
    isAiming: false,
  };

  private canvas: HTMLCanvasElement;
  private listeners: Map<string, Function[]> = new Map();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupListeners();
  }

  private setupListeners(): void {
    // Mouse movement for aiming
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Calculate angle from center bottom (player position approximation)
      const centerX = this.canvas.width / 2;
      const centerY = this.canvas.height - 100;

      const dx = x - centerX;
      const dy = centerY - y;

      this.inputState.angle = Math.atan2(dy, dx) * (180 / Math.PI);
      this.emit("aim", this.inputState.angle);
    });

    // Keyboard controls
    document.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowUp":
          this.inputState.power = Math.min(100, this.inputState.power + 5);
          this.emit("power_change", this.inputState.power);
          break;
        case "ArrowDown":
          this.inputState.power = Math.max(10, this.inputState.power - 5);
          this.emit("power_change", this.inputState.power);
          break;
        case " ":
          e.preventDefault();
          this.emit("shoot", {
            angle: this.inputState.angle,
            power: this.inputState.power,
          });
          break;
      }
    });

    // Canvas click to shoot
    this.canvas.addEventListener("click", () => {
      this.emit("shoot", {
        angle: this.inputState.angle,
        power: this.inputState.power,
      });
    });
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  private emit(event: string, data?: unknown): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach((callback) => callback(data));
  }

  getInputState(): InputState {
    return { ...this.inputState };
  }

  setAngle(angle: number): void {
    this.inputState.angle = angle;
  }

  setPower(power: number): void {
    this.inputState.power = Math.max(10, Math.min(100, power));
  }
}
