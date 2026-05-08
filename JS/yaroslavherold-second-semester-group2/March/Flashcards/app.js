class App {
    constructor() {
        this.storageManager = new StorageManager('flashcards_data');
        this.stateManager = new StateManager(this.storageManager);
        this.ui = new UI(this.stateManager);

        this.ui.bindEvents();
        this.ui.renderAll();
    }
}

new App();