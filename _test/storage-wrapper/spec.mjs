import StorageWrapper from "/js/module/storage-wrapper.mjs";

describe("StorageWrapper", () => {
    describe("construction", function() {
        it("should require a namespace", () => {
            expect(() => new StorageWrapper()).toThrowError(Error, "namespace is required");
            expect(() => new StorageWrapper("")).toThrowError(Error, "namespace is required");
            expect(() => new StorageWrapper(null)).toThrowError(Error, "namespace is required");
            expect(() => new StorageWrapper(undefined)).toThrowError(Error, "namespace is required");
        });

        it("should require namespace to be typeof 'string'", () => {
            expect(() => new StorageWrapper(1)).toThrowError(TypeError, "namespace must be typeof 'string'");
            expect(() => new StorageWrapper(1.5)).toThrowError(TypeError, "namespace must be typeof 'string'");
            expect(() => new StorageWrapper([])).toThrowError(TypeError, "namespace must be typeof 'string'");
            expect(() => new StorageWrapper({})).toThrowError(TypeError, "namespace must be typeof 'string'");
            expect(() => new StorageWrapper(true)).toThrowError(TypeError, "namespace must be typeof 'string'");
        });

        it("should store the namespace", () => {
            expect(new StorageWrapper("namespace-stored").namespace).toBe("namespace-stored");
        });

        it("should allow an optional version", () => {
            const underTest = new StorageWrapper("optional-version-test");

            expect(underTest.version).not.toBe(jasmine.anything());
        });

        it("should require the version to be an Integer", () => {
            expect(() => new StorageWrapper("version-is-int-test", "1")).toThrowError(TypeError, "version must be integer");
            expect(() => new StorageWrapper("version-is-int-test", [])).toThrowError(TypeError, "version must be integer");
            expect(() => new StorageWrapper("version-is-int-test", {})).toThrowError(TypeError, "version must be integer");
            expect(() => new StorageWrapper("version-is-int-test", true)).toThrowError(TypeError, "version must be integer");
        });

        it("should store the version", () => {
            const underTest = new StorageWrapper("version-stored", 5);

            expect(underTest.version).toBe(5);
        });
    });

    beforeEach(function () {
        this.storage = {};
        this.mockLocalStorage = {
            setItem: (key, value) => this.storage[String(key)] = String(value),
            getItem: (key) => this.storage[String(key)]
        };
    });

    describe("saveString(key, value)", function() {
        it("should save string value to storage with the namespace prepended to the key", function () {
            const underTest = new StorageWrapper("save-test").withStorage(this.mockLocalStorage);
            underTest.saveString("test-key", "test-value");

            expect(this.storage).toHaveSize(1);
            expect(this.storage["save-test:test-key"]).toBe("test-value");
        });

        it("should only allow string keys to be saved", function() {
            const underTest = new StorageWrapper("save-only-allows-string-keys").withStorage(this.mockLocalStorage);
            expect(() => underTest.saveString(1, "")).toThrowError(TypeError, "keys must be typeof 'string'");
            expect(() => underTest.saveString(1.5, "")).toThrowError(TypeError, "keys must be typeof 'string'");
            expect(() => underTest.saveString([], "")).toThrowError(TypeError, "keys must be typeof 'string'");
            expect(() => underTest.saveString({}, "")).toThrowError(TypeError, "keys must be typeof 'string'");
            expect(() => underTest.saveString(true, "")).toThrowError(TypeError, "keys must be typeof 'string'");
        });

        it("should not allow saving directly to storage-wrapper-obj-version", function() {
            const underTest = new StorageWrapper("cant-save-storage-wrapper-obj-version").withStorage(this.mockLocalStorage);
            expect(() => underTest.saveString("storage-wrapper-obj-version", 1)).toThrowError(Error, "storage-wrapper-obj-version is special key and cannot be saved");
            expect(this.storage).toHaveSize(0);
        });

        it("should save the version as storage-wrapper-obj-version to storage if the version exists", function() {
            const underTest = new StorageWrapper("version-saved-test", 5).withStorage(this.mockLocalStorage);
            underTest.saveString("key", "value");

            expect(this.storage).toHaveSize(2);
            expect(this.storage["version-saved-test:key"]).toBe("value");
            expect(this.storage["version-saved-test:storage-wrapper-obj-version"]).toBe("5");
        });
    });

    describe("loadString(key)", function() {
        it("should get a string value using a key with its namespace", function () {
            this.storage["load-test:test-key"] = "test-value";
            this.storage["test-key"] = "wrong key!";
            const underTest = new StorageWrapper("load-test").withStorage(this.mockLocalStorage);

            expect(underTest.loadString("test-key")).toBe("test-value");
        });
    });

    describe("migrateToCurrentVersion(versionHistory, migrations)", function() {
        it("should require that versionHistory is a non-empty array of Integer values with size at least 1", () => {
            const underTest = new StorageWrapper("version-history-array-of-ints", 1);
            expect(() => underTest.migrateToCurrentVersion()).toThrowError(TypeError, "versionHistory must be a non-empty array of Integer values");
            expect(() => underTest.migrateToCurrentVersion("")).toThrowError(TypeError, "versionHistory must be a non-empty array of Integer values");
            expect(() => underTest.migrateToCurrentVersion(null)).toThrowError(TypeError, "versionHistory must be a non-empty array of Integer values");
            expect(() => underTest.migrateToCurrentVersion(undefined)).toThrowError(TypeError, "versionHistory must be a non-empty array of Integer values");
            expect(() => underTest.migrateToCurrentVersion(1)).toThrowError(TypeError, "versionHistory must be a non-empty array of Integer values");
            expect(() => underTest.migrateToCurrentVersion(1.5)).toThrowError(TypeError, "versionHistory must be a non-empty array of Integer values");
            expect(() => underTest.migrateToCurrentVersion({})).toThrowError(TypeError, "versionHistory must be a non-empty array of Integer values");
            expect(() => underTest.migrateToCurrentVersion(true)).toThrowError(TypeError, "versionHistory must be a non-empty array of Integer values");
            expect(() => underTest.migrateToCurrentVersion([])).toThrowError(TypeError, "versionHistory must be a non-empty array of Integer values");

            expect(() => underTest.migrateToCurrentVersion([1, ""])).toThrowError(TypeError, "versionHistory must be a non-empty array of Integer values");
            expect(() => underTest.migrateToCurrentVersion([1, null])).toThrowError(TypeError, "versionHistory must be a non-empty array of Integer values");
            expect(() => underTest.migrateToCurrentVersion([1, undefined])).toThrowError(TypeError, "versionHistory must be a non-empty array of Integer values");
            expect(() => underTest.migrateToCurrentVersion([1, 1.5])).toThrowError(TypeError, "versionHistory must be a non-empty array of Integer values");
            expect(() => underTest.migrateToCurrentVersion([1, {}])).toThrowError(TypeError, "versionHistory must be a non-empty array of Integer values");
            expect(() => underTest.migrateToCurrentVersion([1, true])).toThrowError(TypeError, "versionHistory must be a non-empty array of Integer values");
        });

        it("should require that version is set", () => {
            const underTest = new StorageWrapper("use-migration-path-requires-version");
            
            expect(() => underTest.migrateToCurrentVersion([1])).toThrowError(Error, "version must be set to use a migration path");
        });

        it("should require migrations to be an array when provided", () => {
            const underTest = new StorageWrapper("version-history-array-of-ints", 2);

            expect(() => underTest.migrateToCurrentVersion([1], 1)).toThrowError(TypeError, "migrations should be an array with objects each containing a fromVersion Integer, toVersion Integer, and migrate function");
            expect(() => underTest.migrateToCurrentVersion([1], 1.5)).toThrowError(TypeError, "migrations should be an array with objects each containing a fromVersion Integer, toVersion Integer, and migrate function");
            expect(() => underTest.migrateToCurrentVersion([1], {})).toThrowError(TypeError, "migrations should be an array with objects each containing a fromVersion Integer, toVersion Integer, and migrate function");
            expect(() => underTest.migrateToCurrentVersion([1], true)).toThrowError(TypeError, "migrations should be an array with objects each containing a fromVersion Integer, toVersion Integer, and migrate function");
        });

        it("should require migrations to be an array with objects each containing a fromVersion Integer, toVersion Integer, and migrate function", () => {
            const underTest = new StorageWrapper("version-history-array-of-ints", 2);
            const valid = {
                fromVersion: 1,
                toVersion: 2,
                migrate: () => null
            };

            const badFromVersion = Object.assign({}, valid);
            badFromVersion.fromVersion = "1";
            expect(() => underTest.migrateToCurrentVersion([1, 2], [badFromVersion])).toThrowError(TypeError, "migrations should be an array with objects each containing a fromVersion Integer, toVersion Integer, and migrate function");

            const badToVersion = Object.assign({}, valid);
            badToVersion.toVersion = "1";
            expect(() => underTest.migrateToCurrentVersion([1, 2], [badToVersion])).toThrowError(TypeError, "migrations should be an array with objects each containing a fromVersion Integer, toVersion Integer, and migrate function");

            const badMigrate = Object.assign({}, valid);
            badMigrate.migrate = "1";
            expect(() => underTest.migrateToCurrentVersion([1, 2], [badMigrate])).toThrowError(TypeError, "migrations should be an array with objects each containing a fromVersion Integer, toVersion Integer, and migrate function");
        });

        it("should run a single migration if version does not match", function() {
            this.storage["migrate-test:storage-wrapper-obj-version"] = "1";
            this.storage["migrate-test:old-user"] = "testuser";

            const migration = {
                fromVersion: 1,
                toVersion: 2,
                migrate: (storageWrapper) => {
                    const oldUser = storageWrapper.loadString("old-user");
                    storageWrapper.saveString("migrated-user", oldUser + "-migrated");
                }
            }

            new StorageWrapper("migrate-test", 2).withStorage(this.mockLocalStorage).migrateToCurrentVersion([1], [migration]);

            expect(this.storage).toHaveSize(3);
            expect(this.storage["migrate-test:storage-wrapper-obj-version"]).toBe("2");
            expect(this.storage["migrate-test:old-user"]).toBe("testuser");
            expect(this.storage["migrate-test:migrated-user"]).toBe("testuser-migrated");
        });

        it("should run multiple migrations if required", function() {
            this.storage["migrate-test:storage-wrapper-obj-version"] = "1";
            this.storage["migrate-test:v1-user"] = "testuser";

            const migrations = [{
                fromVersion: 1,
                toVersion: 2,
                migrate: (storageWrapper) => {
                    const oldUser = storageWrapper.loadString("v1-user");
                    storageWrapper.saveString("v2-user", oldUser + "-migrated-v2");
                }
            }, {
                fromVersion: 2,
                toVersion: 3,
                migrate: (storageWrapper) => {
                    const oldUser = storageWrapper.loadString("v2-user");
                    storageWrapper.saveString("v3-user", oldUser + "-migrated-v3");
                }
            }]

            new StorageWrapper("migrate-test", 3).withStorage(this.mockLocalStorage).migrateToCurrentVersion([1, 2], migrations);

            expect(this.storage).toHaveSize(4);
            expect(this.storage["migrate-test:storage-wrapper-obj-version"]).toBe("3");
            expect(this.storage["migrate-test:v1-user"]).toBe("testuser");
            expect(this.storage["migrate-test:v2-user"]).toBe("testuser-migrated-v2");
            expect(this.storage["migrate-test:v3-user"]).toBe("testuser-migrated-v2-migrated-v3");
        });
    });

    describe("saveArray(key, array)", function() {
        it("should only allow array values", () => {
            const underTest = new StorageWrapper("saveArray-only-allows-array-values");
            expect(() => underTest.saveArray("saveArray")).toThrowError(TypeError, "value must be an array");
            expect(() => underTest.saveArray("saveArray", null)).toThrowError(TypeError, "value must be an array");
            expect(() => underTest.saveArray("saveArray", undefined)).toThrowError(TypeError, "value must be an array");
            expect(() => underTest.saveArray("saveArray", 1)).toThrowError(TypeError, "value must be an array");
            expect(() => underTest.saveArray("saveArray", 1.2)).toThrowError(TypeError, "value must be an array");
            expect(() => underTest.saveArray("saveArray", "")).toThrowError(TypeError, "value must be an array");
            expect(() => underTest.saveArray("saveArray", {})).toThrowError(TypeError, "value must be an array");
            expect(() => underTest.saveArray("saveArray", true)).toThrowError(TypeError, "value must be an array");
        });

        it("should save an array", function() {
            const underTest = new StorageWrapper("save-array").withStorage(this.mockLocalStorage);
            underTest.saveArray("str-array", ["test", "array"]);
            underTest.saveArray("mixed-array", ["test", 1, true]);

            expect(this.storage).toHaveSize(2);
            expect(this.storage["save-array:str-array"]).toBe('["test","array"]');
            expect(this.storage["save-array:mixed-array"]).toBe('["test",1,true]');
        });
    });

    describe("loadArray(key)", function() {
        it("should throw a TypeError if the value is not an array", function() {
            this.storage["load-array-error:string"] = "string";
            this.storage["load-array-error:number"] = "1";
            this.storage["load-array-error:boolean"] = "true";
            this.storage["load-array-error:object"] = "{}";

            const underTest = new StorageWrapper("load-array-error").withStorage(this.mockLocalStorage);
            expect(() => underTest.loadArray("string")).toThrowError(TypeError, "value loaded was not an array");
            expect(() => underTest.loadArray("number")).toThrowError(TypeError, "value loaded was not an array");
            expect(() => underTest.loadArray("boolean")).toThrowError(TypeError, "value loaded was not an array");
            expect(() => underTest.loadArray("object")).toThrowError(TypeError, "value loaded was not an array");
        });

        it("should load arrays", function() {
            this.storage["load-array:str-array"] = '["test","array"]';
            this.storage["load-array:mixed-array"] = '["test",1,true]';

            const underTest = new StorageWrapper("load-array").withStorage(this.mockLocalStorage);
            expect(underTest.loadArray("str-array")).toEqual(["test", "array"]);
            expect(underTest.loadArray("mixed-array")).toEqual(["test", 1, true]);
        });
    });
});
