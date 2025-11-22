export class AudioController {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.source = null;
        this.dataArray = null;
        this.isPlaying = false;
        this.audioElement = new Audio('./G.E.M.邓紫棋 - 泡沫.mp3');
        this.audioElement.loop = true;
    }

    async init() {
        if (this.audioContext) return;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;

        // Connect audio element to analyser
        this.source = this.audioContext.createMediaElementSource(this.audioElement);
        this.source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);
    }

    play() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        this.audioElement.play();
        this.isPlaying = true;
    }

    getFrequencyData() {
        if (!this.analyser) return new Uint8Array(0);
        this.analyser.getByteFrequencyData(this.dataArray);
        return this.dataArray;
    }

    // Get average volume of a specific frequency range
    // Piano range roughly 27Hz (A0) to 4186Hz (C8)
    // We focus on mid-range for melody: 200Hz - 2000Hz
    getPianoIntensity() {
        if (!this.analyser) return 0;

        const binCount = this.analyser.frequencyBinCount;
        const sampleRate = this.audioContext.sampleRate;
        const binSize = sampleRate / this.analyser.fftSize; // ~21.5Hz per bin

        const startBin = Math.floor(200 / binSize); // ~9
        const endBin = Math.floor(2000 / binSize); // ~93

        let sum = 0;
        let max = 0;
        for (let i = startBin; i <= endBin; i++) {
            const val = this.dataArray[i];
            sum += val;
            if (val > max) max = val;
        }

        // Return max value in the range for punchy response
        return max;
    }
}
