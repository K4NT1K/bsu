export const useStorageManager = (storageKey) => {
    const save = (data) => {
        localStorage.setItem(storageKey, JSON.stringify(data));
    };

    const load = () => {
        const value = localStorage.getItem(storageKey);

        if (value === null) {
            return null;
        }

        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    };

    return { save, load };
};

