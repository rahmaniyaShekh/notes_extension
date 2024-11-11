var titleeel;
var urilllr;
var sresp;
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'openNoteCard') {
        playPauseVideo();
        createNoteCard(message.dataUrl, sendResponse);
        return true;
    } else if (message.action === 'getVideoTitle') {
        var videoTitle = null;
        var videoLink = null;
        var ytTitleContainer = document.getElementById('above-the-fold');
        // console.log("ytTitleContainer", ytTitleContainer);
        if (document.querySelector('.ytp-chrome-bottom') && document.querySelector('.ytp-chrome-bottom').style.display != 'none' && ytTitleContainer && ytTitleContainer.querySelector('#title')) {
            videoTitle = ytTitleContainer.querySelector('#title').innerText;
            const ytDurationSpendedSpan = document.querySelector(".ytp-time-current");
            if (ytDurationSpendedSpan && ytDurationSpendedSpan.innerText) {
                let durationSpendInYTVideo = durationToSeconds(ytDurationSpendedSpan.innerText);
                const videoUrl = getTextBeforeT(window.location.href);
                videoLink = videoUrl + "&t=" + durationSpendInYTVideo + "s";
                //console.log("videoLink: ", videoLink);
            }
            // console.log("videoTitle", videoTitle);
        }
        //console.log("Sending videoLink: ", videoLink);
        sendResponse({videoTitle: videoTitle, videoLink: videoLink});
    }
});
const Add_Custom_Style = css => document.head.appendChild(document.createElement("style")).innerHTML = css

function createNoteCard(dataUrl, sendResponse) {
    htmlCode = `<div class="note-card">
            <textarea id="note-title" autofocus placeholder="Enter your sub title here.."></textarea>
            <p class="textarea-para">Click on Enter to save</p>
        </div>`
    const card = document.createElement("div");
    card.id = "main-container-for-taking-notes";
    card.innerHTML = htmlCode;
    Add_Custom_Style(`
    /* Normalize or reset CSS */
    #main-container-for-taking-notes, h1, p, .note-card, textarea {
        margin: 0;
        padding: 0;
        box-sizing: content-box; 
    }
    #main-container-for-taking-notes{
        position: fixed;
        top: 0px;
        left: 0px;
        display: flex;
        height: 100vh;
        width: 100vw;
        text-align: center;
        justify-content: center;
        z-index: 5000;
    }
    .note-card {
        position: fixed;
        bottom: 70px;
        translate: translate(-50%, -50%);
        padding: 10px;
        border: 1px solid black;
        border-radius: 30px;
        background-color: #3c3c3c;
        height: 200px;
        width: auto;
    }
    .note-card #note-title {
        height: 170px;
        width: 400px;
        border: 0px;
        border-radius: 20px;
        font-size: 20px;
        background: #505050;
        border-color: #3c3c3c;
        color: #e7e5e5;
        resize: none;
        box-sizing: border-box;
        padding: 12px 16px;
        outline: none !important;
    }
    
    .note-card .textarea-para {
        padding: 5px 5px 20px 5px;
        font-family: Verdana, Geneva, Tahoma, sans-serif;
        font-size: 15px;
        color: #e7e5e5;
    }
    `)
    // Add event listener for Enter key
    document.addEventListener('keypress', function(e) {
        // console.log(e.key);
        if (e.key === 'Enter' && document.getElementById("note-title")) {
            const title = document.getElementById("note-title").value;
            sendResponse(title);
            playPauseVideo();
            card.remove();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key ==='Escape' && card) {
            card.remove();
            playPauseVideo();
        }
    });
    
    // Append the card to the body
    let videoContainerIdBySequraa = document.getElementById('video-container-id-by-sequraa');
    if (videoContainerIdBySequraa) {
        videoContainerIdBySequraa.appendChild(card)
    } else {
        document.body.appendChild(card);
    }
    var textAreaText = document.getElementById("note-title");
    if (textAreaText) {
        textAreaText.focus();
    }
}

function playPauseVideo() {
    var toolbar = document.querySelector('.ytp-chrome-bottom');
    var itemplaypause = document.querySelector('.ytp-play-button');
    if (itemplaypause && toolbar.style.display != 'none') {
        //console.log("Yes play button is present");
        itemplaypause.click();
    } else {
        //console.log("play button is not present");
    }

    let ourPlayerPlayBtn = document.getElementById('play-pause-btn-id');
    if (ourPlayerPlayBtn) {
        ourPlayerPlayBtn.click();
    }
}

function durationToSeconds(duration) {
    const parts = duration.split(':').map(Number);
    let seconds = 0;

    if (parts.length === 3) {
        // Format: HH:MM:SS
        seconds += parts[0] * 3600; // Hours to seconds
        seconds += parts[1] * 60;   // Minutes to seconds
        seconds += parts[2];        // Seconds
    } else if (parts.length === 2) {
        // Format: MM:SS
        seconds += parts[0] * 60;   // Minutes to seconds
        seconds += parts[1];        // Seconds
    } else if (parts.length === 1) {
        // Format: SS
        seconds += parts[0];        // Seconds
    }

    return seconds;
}

function getTextBeforeT(text) {
    const delimiter = "&t=";
    const index = text.indexOf(delimiter);
    return index !== -1 ? text.substring(0, index) : text;
}