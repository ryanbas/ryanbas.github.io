function saveConnectedState(state) {
    chrome.storage.local.set({
        connected: state
    });
}

chrome.runtime.onInstalled.addListener(function() {
    saveConnectedState(false);
})

chrome.webNavigation.onCompleted.addListener(function() {
    function onNativeMessage(message) {
        var stringJson = JSON.stringify(message);
        console.log("Received " + stringJson)
        chrome.tabs.query({active: true, currentWindow: true, url: 'file://*'}, function(tabs) {
            if (tabs.length > 0) {
                chrome.tabs.reload(tabs[0].id);
            }
        });
    }

    function onDisconnect(message) {
        console.log("Disconnected: " + chrome.runtime.lastError.message);
        saveConnectedState(false);
    }

    chrome.storage.local.get(['connected', 'port'], function(result) {
        let hostname = "io.github.ryanbas.reload_extension";
        let connected = result.connected;

        if (!connected) {
            var port = chrome.runtime.connectNative(hostname);
            port.onMessage.addListener(onNativeMessage);
            port.onDisconnect.addListener(onDisconnect);
            saveConnectedState(true);
        }
    });
}, {url: [{urlMatches: "file://*"}]});
