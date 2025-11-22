export class UIManager {
    constructor(onStart, onThresholdChange, onSpeedChange) {
        this.startScreen = document.getElementById('start-screen');
        this.controls = document.getElementById('controls');
        this.thresholdInput = document.getElementById('threshold');
        this.speedInput = document.getElementById('speed');

        this.onStart = onStart;
        this.onThresholdChange = onThresholdChange;
        this.onSpeedChange = onSpeedChange;

        this.init();
    }

    init() {
        this.startScreen.addEventListener('click', () => {
            this.startScreen.classList.add('fade-out');
            this.controls.classList.remove('hidden');
            if (this.onStart) this.onStart();
        });

        this.thresholdInput.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            if (this.onThresholdChange) this.onThresholdChange(val);
        });

        this.speedInput.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            if (this.onSpeedChange) this.onSpeedChange(val);
        });
    }
}
