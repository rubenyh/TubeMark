import { getCurrentTab } from "./utils.js";

const addNewBookmark = (bookmarksElement, bookmark) => {
    const bookmarkTitleElement = document.createElement("div");
    const newBookmarkElement = document.createElement("div");
    const controlsEelement = document.createElement("div");

    bookmarkTitleElement.textContent = bookmark.desc;
    bookmarkTitleElement.className = "bookmark-title";

    controlsEelement.className = "bookmark-controls";

    setBookmarkAttributes("open", onPlay, controlsEelement);
    setBookmarkAttributes("delete", onDelete, controlsEelement);

    newBookmarkElement.id = "bookmark-" + bookmark.time;
    newBookmarkElement.className = "bookmark";
    newBookmarkElement.setAttribute("timestamp", bookmark.time);


    newBookmarkElement.appendChild(bookmarkTitleElement);
    newBookmarkElement.appendChild(controlsEelement);
    bookmarksElement.appendChild(newBookmarkElement);



};

const viewBookmarks = (currentBookmarks = []) => {
    const bookmarksElement = document.getElementById("bookmarks");
    bookmarksElement.innerHTML = "";
    if(currentBookmarks.length > 0){
        for(let i = 0; i < currentBookmarks.length; i++){
            const bookmark = currentBookmarks[i];
            addNewBookmark(bookmarksElement, bookmark);
        }
    }else{
        bookmarksElement.innerHTML = '<i class ="row"> No bookmarks to show </i>';
    }

    return;
};


const onDelete = async (e) => {
    const activeTab = await getCurrentTab();
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const bookmarkElementToDelete = document.getElementById("bookmark-" + bookmarkTime);

    bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

    chrome.tabs.sendMessage(activeTab.id, {
        type: "DELETE",
        value: bookmarkTime,
    },viewBookmarks);
}

const onPlay = async (e) => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const activeTab = await getCurrentTab();

    chrome.tabs.sendMessage(activeTab.id, {
        type: "PLAY",
        value: bookmarkTime,
    })
};


const setBookmarkAttributes = (src, eventListener, controlParentElement) => {
    const controlElement = document.createElement("img");

    controlElement.src = "assets/" + src + ".svg";
    controlElement.title = src; 
    controlElement.addEventListener("click", eventListener);
    controlParentElement.appendChild(controlElement);
}


document.addEventListener("DOMContentLoaded", async () => {
    const activeTab = await getCurrentTab();
    const queryParameter = activeTab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameter);
    const currentVideo = urlParameters.get("v");

    const container = document.getElementsByClassName("container")[0];    

    chrome.storage.sync.get(null, (data) => {
        const allVideoIds = Object.keys(data);

        if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
            const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];
            viewBookmarks(currentVideoBookmarks);
        } else {
            let allBookmarks = [];
            for (let videoId of allVideoIds) {
                const bookmarks = JSON.parse(data[videoId]);
                allBookmarks.push({ videoId, bookmarks });
            }

            container.innerHTML = '<div class="title">Bookmarks from all videos:</div>';
            for (let entry of allBookmarks) {
                const videoElement = document.createElement("div");
                videoElement.innerHTML = `<a href="https://www.youtube.com/watch?app=desktop&v=${entry.videoId}" target="_blank" rel="noopener noreferrer">Go to video</a>: ${entry.bookmarks.length} bookmarks`;
                container.appendChild(videoElement);
            }

        }
    });
});
