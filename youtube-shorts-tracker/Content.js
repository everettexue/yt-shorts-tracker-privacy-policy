(function () {
    let video;
    let watchTime = 0;
    let videoDuration = 0;
    let lastTime = 0;
    let videoId = null;
    let watchInterval;

    function init() {
        video = document.querySelector("video");

        if (!video || isNaN(video.duration) || video.duration === 0) {
            console.log("[Shorts Stats] Waiting for video...");
            setTimeout(init, 300);
            return;
        }

        videoDuration = video.duration;
        watchTime = 0;
        lastTime = video.currentTime;
        videoId = getVideoId();

        clearInterval(watchInterval);
        watchInterval = setInterval(trackWatchTime, 500);

        video.removeEventListener("ended", saveStats);
        video.addEventListener("ended", saveStats);

        console.log("[Shorts Stats] Started tracking:", videoId, "duration:", videoDuration);
    }

    function trackWatchTime() {
        if (!video || video.paused) return;

        const currentTime = video.currentTime;
        if (currentTime > lastTime) {
            watchTime += currentTime - lastTime;
        }
        lastTime = currentTime;
    }

function saveStats() {
    if (!videoId || videoDuration === 0) return;

    const cappedWatchTime = Math.min(watchTime, videoDuration);
    const percentage = (cappedWatchTime / videoDuration) * 100;

    console.log(`[Shorts Stats] Saving: ${percentage.toFixed(1)}% for ${videoId}`);

    chrome.runtime.sendMessage({
        type: "SAVE_SHORT_STATS",
        data: {
            videoId,
            watchTime: cappedWatchTime,
            videoDuration,
            percentage,
            timestamp: Date.now()
        }
    }, (response) => {
        console.log("[Shorts Stats] Background response:", response);
    });
}


    function getVideoId() {
        const match = location.pathname.match(/shorts\/([^\/\?]+)/);
        return match ? match[1] : null;
    }

    let lastPath = location.pathname;
    setInterval(() => {
        if (location.pathname !== lastPath) {
            console.log("[Shorts Stats] Navigation detected:", location.pathname);
            saveStats();
            lastPath = location.pathname;
            setTimeout(init, 500);
        }
    }, 500);

    init();
    window.addEventListener("beforeunload", saveStats);
})();
