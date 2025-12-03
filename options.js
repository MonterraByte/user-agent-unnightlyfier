"use strict";

const betaCheckbox = document.getElementById("beta");
browser.runtime.getBrowserInfo().then((info) => {
    const match = /\d+\.\d+(?:\.\d+)?(a?)/.exec(info.version);
    const isNightly = match[1] === "a";
    if (isNightly) {
        betaCheckbox.disabled = true;
        betaCheckbox.style.display = "none";
        document.getElementById("betaText").style.display = "none";
    }
});
browser.storage.local.get("beta").then((result) => betaCheckbox.checked = result["beta"] ?? false);
betaCheckbox.addEventListener("change", () => browser.storage.local.set({ "beta": betaCheckbox.checked }));
