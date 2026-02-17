beforeEach(function () {
    this.storage = {};
    this.mockLocalStorage = {
        setItem: (key, value) => this.storage[String(key)] = String(value),
        getItem: (key) => this.storage[String(key)],
        removeItem: (key) => delete this.storage[String(key)],
    };
});
