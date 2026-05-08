class StorageManager {
    constructor(storageKey) {
        this.storageKey = storageKey;
    }

    save(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    load() {
        const value = localStorage.getItem(this.storageKey);

        if (value === null) {
            return null;
        }

        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    }
}