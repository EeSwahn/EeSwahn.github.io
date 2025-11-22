import './styles/main.css';
import { AudioController } from './core/AudioController.js';
import { ParticleSystem } from './core/ParticleSystem.js';
import { UIManager } from './ui/UIManager.js';

class App {
  constructor() {
    this.audioController = new AudioController();
    this.particleSystem = new ParticleSystem(document.getElementById('visualizer-canvas'));

    this.uiManager = new UIManager(
      () => this.start()
    );

    // Initialize UI
    this.uiManager.init();
  }

  async start() {
    await this.audioController.init();

    // Play intro animation and start music immediately
    this.audioController.play();
    this.particleSystem.playIntro("很高兴在网易云音乐遇见你", () => {
      // Animation complete, but don't start main loop
      // Just clear the intro state
      this.particleSystem.isIntro = false;
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
