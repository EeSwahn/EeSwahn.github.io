export class UIManager {
    constructor(onStart) {
        this.startScreen = document.getElementById('start-screen');

        this.onStart = onStart;

        this.init();
    }

    init() {
        this.startScreen.addEventListener('click', () => {
            this.startScreen.classList.add('fade-out');
            if (this.onStart) this.onStart();
        });
    }
}
