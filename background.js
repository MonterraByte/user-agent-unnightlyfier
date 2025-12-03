"use strict";

let userAgent;
let isBeta;

function rewriteUserAgentHeader(e) {
    for (let header of e.requestHeaders) {
        if (header.name.toLowerCase() === "user-agent") {
            header.value = userAgent;
        }
    }
    return {requestHeaders: e.requestHeaders};
}

function setup(info) {
    const match = /(\d+)\.\d+(?:\.\d+)?(a?)/.exec(info.version);
    if (match == null || match.length !== 3) {
        console.log(`info.version regex failed: returned ${match}`);
        return;
    }
    const version = match[1];
    const branch = match[2];

    let toSubtract;
    if (branch === "a") {
        toSubtract = 2;
    } else if (isBeta) {
        toSubtract = 1;
    } else {
        console.log("Not on nightly or beta, exiting");
        if (browser.webRequest.onBeforeSendHeaders.hasListener(rewriteUserAgentHeader)) {
            browser.webRequest.onBeforeSendHeaders.removeListener(rewriteUserAgentHeader);
        }
        return;
    }
    const newVersion = (parseInt(version, 10) - toSubtract).toString();

    const originalUserAgent = navigator.userAgent;
    const rv_replaced = originalUserAgent.replace(/rv:\d+(?:\.\d+)?/, `rv:${newVersion}.0`);
    if (rv_replaced === originalUserAgent) {
        console.log("Warning: release version wasn't replaced");
    }
    const trail_replaced = rv_replaced.replace(/Gecko\/\d+\.\d+/, `Gecko/${newVersion}.0`);
    const browser_replaced = trail_replaced.replace(/Firefox\/\d+(?:\.\d+)?/, `Firefox/${newVersion}.0`);
    if (browser_replaced === trail_replaced) {
        console.log("Warning: browser version wasn't replaced");
    }

    userAgent = browser_replaced;
    console.log(`Replacing user agent "${originalUserAgent}" with "${userAgent}"`);

    if (!browser.webRequest.onBeforeSendHeaders.hasListener(rewriteUserAgentHeader)) {
        browser.webRequest.onBeforeSendHeaders.addListener(
            rewriteUserAgentHeader,
            { urls: ["*://*/*", "ws://*/*", "wss://*/*"] },
            ["blocking", "requestHeaders"],
        );
    }
}

function loadSettingsAndRunSetup() {
    browser.storage.local.get("beta").then((result) => {
        isBeta = result["beta"] ?? false;
        browser.runtime.getBrowserInfo().then(setup);
    });
}

browser.storage.local.onChanged.addListener((_) => loadSettingsAndRunSetup());
loadSettingsAndRunSetup();
