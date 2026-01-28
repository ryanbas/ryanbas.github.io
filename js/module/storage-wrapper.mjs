export default class StorageWrapper {
    #INTERNAL_VERSION_KEY = "storage-wrapper-obj-version";
    #namespace;
    #storage;
    #version;

    constructor(namespace, version) {
        if (!namespace) {
            throw new Error("namespace is required");
        }

        if (typeof namespace !== "string") {
            throw new TypeError("namespace must be typeof 'string'");
        }

        if (version && !Number.isInteger(version)) {
            throw new TypeError("version must be integer");
        }

        this.#namespace = namespace;
        this.#storage = window.localStorage;
        this.#version = version;
    }

    migrateToCurrentVersion(versionHistory, migrations) {
        if (!this.#version) {
            throw new Error("version must be set to use a migration path");
        } else if (!Array.isArray(versionHistory) || versionHistory.length === 0 || versionHistory.some(v => !Number.isInteger(v))) {
            throw new TypeError("versionHistory must be a non-empty array of Integer values");
        }

        if (migrations) {
            if (!Array.isArray(migrations)) {
                throw new TypeError("migrations should be an array with objects each containing a fromVersion Integer, toVersion Integer, and migrate function");
            } else if (migrations.some(m => !Number.isInteger(m.fromVersion) || !Number.isInteger(m.toVersion) || typeof m.migrate !== "function")) {
                throw new TypeError("migrations should be an array with objects each containing a fromVersion Integer, toVersion Integer, and migrate function");
            }
        }

        function findMigration(from, to) {
            return migrations.find(m => m.fromVersion === from && m.toVersion === to);
        }

        const storageVersion = this.#getStorageVersion();
        if (storageVersion !== this.#version) {
            const directMigration = findMigration(storageVersion, this.#version);
            if (directMigration) {
                directMigration.migrate(this);
            } else {
                for (let i = 0; i < migrations.length; i += 1) {
                    for (let j = i + 1; j < migrations.length; j += 1) {
                        const from = versionHistory[i];
                        const to = versionHistory[j];
                        
                        findMigration(from, to)?.migrate(this);
                    }
                }

                const previousVersion = versionHistory.at(-1);
                findMigration(previousVersion, this.#version)?.migrate(this);
            }
        }

        return this;
    }

    withStorage(storage) {
        this.#storage = storage;
        return this;
    }

    saveString(key, value) {
        this.#checkKey(key);

        if (key === this.#INTERNAL_VERSION_KEY) {
            throw new Error(this.#INTERNAL_VERSION_KEY + " is special key and cannot be saved");
        }

        this.#saveVersion();
        this.#setItem(key, value);
    }

    loadString(key) {
        return this.#getItem(key);
    }

    saveArray(key, array) {
        this.#checkKey(key);

        if (!Array.isArray(array)) {
            throw new TypeError("value must be an array");
        }

        this.#setItem(key, JSON.stringify(array));
    }

    loadArray(key) {
        try {
            const fromStorage = JSON.parse(this.#getItem(key));
            if (!Array.isArray(fromStorage)) {
                throw new TypeError("value loaded was not an array");
            }

            return fromStorage;
        } catch (error) {
            throw new TypeError("value loaded was not an array");
        }
    }

    #checkKey(k) {
        if (typeof k !== "string") {
            throw new TypeError("keys must be typeof 'string'");
        }
    }

    #saveVersion() {
        if (this.#version) {
            this.#setItem(this.#INTERNAL_VERSION_KEY, this.#version);
        }
    }

    #setItem(key, value) {
        this.#storage.setItem(this.#namespace + ":" + key, value);
    }

    #getItem(key) {
        return this.#storage.getItem(this.#namespace + ":" + key);
    }

    #getStorageVersion() {
        return parseInt(this.loadString(this.#INTERNAL_VERSION_KEY), 10);
    }

    get namespace() {
        return this.#namespace;
    }

    get version() {
        return this.#version;
    }
}