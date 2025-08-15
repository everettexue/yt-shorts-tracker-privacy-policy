chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SAVE_SHORT_STATS") {
        chrome.storage.local.get(["shortsStats", "shortsSummary"], (result) => {
            const stats = result.shortsStats || [];
            stats.push(message.data);

            let summary = result.shortsSummary || { shortest: 100, longest: 0 };

            if (message.data.percentage < summary.shortest) {
                summary.shortest = message.data.percentage;
            }
            if (message.data.percentage > summary.longest) {
                summary.longest = message.data.percentage;
            }

            chrome.storage.local.set({ shortsStats: stats, shortsSummary: summary });
        });
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
        if (tab.url.includes("youtube.com/shorts/")) {
            chrome.action.setIcon({
                tabId: tabId,
                path: {
                    16: "icons/shorts16.png",
                    48: "icons/shorts48.png",
                    128: "icons/shorts128.png"
                }
            });
        } else {
            chrome.action.setIcon({
                tabId: tabId,
                path: {
                    16: "icons/default16.png",
                    48: "icons/default48.png",
                    128: "icons/default128.png"
                }
            });
        }
    }
});
