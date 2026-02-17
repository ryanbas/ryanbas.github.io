import PokerApp from "/poker/js/poker.mjs";
import StorageWrapper from "/js/module/storage-wrapper.mjs";

describe("PokerApp", () => {
    describe("migrateStorage", function() {
        it("should migrate from v0 to v1 by copying playerNames and then deleting them", function() {
            const storageWrapper = new StorageWrapper("migrate-test", 1).withStorage(this.mockLocalStorage);
            this.storage["playerNames"] = '["One", "Two", "Three"]';

            const underTest = new PokerApp().withStorageWrapper(storageWrapper);
            underTest.migrateStorage();

            expect(this.storage["playerNames"]).toBeUndefined();
            expect(this.storage["migrate-test:storage-wrapper-obj-version"]).toBe("1");
            expect(this.storage["migrate-test:playerNames"]).toBe('["One","Two","Three"]');
        });
    });
});