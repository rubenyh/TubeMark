(() =>{
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let currentVideoBookmarks = [];

    const fetchBookmarks = () => {
        return new Promise((resolve) => {
            chrome.storage.sync.get([currentVideo], (obj) => {
                resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]): []);
            });
        });
    };

    const addNewBookmarkEventHandler = async () => {
        if (!youtubePlayer) return;
        const currentTime = youtubePlayer.currentTime;
        const newBookmark = {
            time: currentTime,
            desc: "Bookmark at: " + getTime(currentTime),
        };
        currentVideoBookmarks = await fetchBookmarks();

        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
        });
        console.log("Saved new bookmark for ", currentVideo, " at ", newBookmark)
    };

    const newVideoLoaded = async () => {
        if(!currentVideo) return;
        currentVideoBookmarks = await fetchBookmarks();
        
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
        if(!bookmarkBtnExists){

            const bookmarkBtn = document.createElement("img");

            bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
            bookmarkBtn.className = "ytp-button " + "bookmark-btn";
            bookmarkBtn.title = "Click to bookmark current timestamp";


            youtubeLeftControls = document.getElementsByClassName(".ytp-left-controls")[0];
            youtubePlayer = document.getElementsByClassName(".video-stream")[0];

            if (!youtubeLeftControls || !youtubePlayer) return;

            youtubeLeftControls.appendChild(bookmarkBtn);
            bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
        }
    }


    
    const getTime = t => {
        var date = new Date(0);
        date.setSeconds(t);

        return date.toISOString().substr(11, 8);
    }

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;
        if(type === "NEW"){ 
            currentVideo = videoId || "";
            newVideoLoaded();
        }else if(type === "PLAY"){
            if(youtubePlayer) youtubePlayer.currentTime = value;
        }else if (type === "DELETE"){
            currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time != value);
            chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks)});

            response(currentVideoBookmarks);
        }
    });

})();