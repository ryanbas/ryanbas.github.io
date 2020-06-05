chrome.webNavigation.onCompleted.addListener(function() {
    var hostname = "io.github.ryanbas.reload_extension";
    var port = null;

    function onNativeMessage(message) {
        var stringJson = JSON.stringify(message);
        console.log("Received " + stringJson)
    }

    function onDisconnect(message) {
        console.log("Failed to connect: " + chrome.runtime.lastError.message);
        port = null;
    }

    port = chrome.runtime.connectNative(hostname);
    port.onMessage.addListener(onNativeMessage);
    port.onDisconnect.addListener(onDisconnect);
}, {url: [{urlMatches: "file://*"}]});
