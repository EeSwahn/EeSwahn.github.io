import './styles/main.css';
import { AudioController } from './core/AudioController.js';
import { ParticleSystem } from './core/ParticleSystem.js';
import { UIManager } from './ui/UIManager.js';

class App {
  constructor() {
    this.audioController = new AudioController();
    this.particleSystem = new ParticleSystem(document.getElementById('visualizer-canvas'));
    this.threshold = 180;

    this.uiManager = new UIManager(
      () => this.start(),
      (val) => this.threshold = val,
      (val) => this.particleSystem.setSpeedMultiplier(val / 10) // Normalize 1-50 to 0.1-5.0
    );

    this.loop = this.loop.bind(this);
  }

  async start() {
    await this.audioController.init();

    // Play intro animation first
    this.particleSystem.playIntro("很高兴在网易云音乐遇见你", () => {
      // Start audio and main loop after intro
      this.audioController.play();
      this.loop();
    });
  }

  loop() {
    requestAnimationFrame(this.loop);

    // Get audio data
    this.audioController.getFrequencyData();
    const intensity = this.audioController.getPianoIntensity();

    // Logic: If intensity > threshold, spawn particles
    // To prevent constant streaming, maybe check if it's a "peak" or just simple threshold for now.
    // Simple threshold works well for "visualizer" feel if tuned right.

    if (intensity > this.threshold) {
      // Spawn count based on how much over threshold
      const excess = intensity - this.threshold;
      const count = Math.floor(excess / 10) + 1;
      this.particleSystem.spawn(count, intensity);
    }

    this.particleSystem.update();
  }
}

new App();
