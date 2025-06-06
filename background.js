chrome.tabs.onUpdated.addListener((tabId, changeInfo,  tab) => {
if(changeInfo.status === "complete" && tab.url && tab.url.includes("youtube.com/watch")) {
    const queryParameters = tab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    console.log(urlParameters);


    chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: () => {
            const titleElement = document.querySelector('yt-formatted-string.ytd-watch-metadata[title]');
            return titleElement ? titleElement.getAttribute('title') : '';
        }
    }, (results) => {
        const videoTitle = results && results[0] && results[0].result ? results[0].result : '';
        chrome.tabs.sendMessage(tabId, {
            type: "NEW",
            videoId: urlParameters.get("v"),
            videoName: videoTitle
        });
    });
}
})