const playPauseBtn=document.querySelector(".play-pause-btn"),theaterBtn=document.querySelector(".theater-btn"),fullScreenBtn=document.querySelector(".full-screen-btn"),miniPlayerBtn=document.querySelector(".mini-player-btn"),muteBtn=document.querySelector(".mute-btn"),speedBtn=document.querySelector("#speed-btn"),currentTimeElem=document.querySelector(".current-time"),totalTimeElem=document.querySelector(".total-time"),thumbnailImg=document.querySelector(".thumbnail-img"),volumeSlider=document.querySelector(".volume-slider"),videoContainer=document.querySelector(".video-container"),timelineContainer=document.querySelector(".timeline-container"),video=document.querySelector("video");document.addEventListener("keydown",e=>{let t=document.activeElement.tagName.toLowerCase();if("input"!==t&&!document.getElementById("note-title"))switch(e.key.toLowerCase()){case" ":if("button"===t)return;case"k":togglePlay();break;case"f":toggleFullScreenMode();break;case"t":toggleTheaterMode();break;case"i":toggleMiniPlayerMode();break;case"m":toggleMute();break;case"arrowleft":case"j":skip(-5);break;case"arrowright":case"l":skip(5);break;case"arrowdown":video.volume-=.1;break;case"arrowup":video.volume+=.1;break;case"c":toggleCaptions();break;case">":changePlaybackSpeed(!1,1);break;case"<":changePlaybackSpeed(!1,-1)}}),timelineContainer.addEventListener("mousemove",handleTimelineUpdate),timelineContainer.addEventListener("mousedown",toggleScrubbing),document.addEventListener("mouseup",e=>{isScrubbing&&toggleScrubbing(e)}),document.addEventListener("mousemove",e=>{isScrubbing&&handleTimelineUpdate(e)});let isScrubbing=!1,wasPaused;function toggleScrubbing(e){let t=timelineContainer.getBoundingClientRect(),i=Math.min(Math.max(0,e.x-t.x),t.width)/t.width;isScrubbing=(1&e.buttons)==1,videoContainer.classList.toggle("scrubbing",isScrubbing),isScrubbing?(wasPaused=video.paused,video.pause()):(video.currentTime=i*video.duration,wasPaused||video.play()),handleTimelineUpdate(e)}function handleTimelineUpdate(e){let t=timelineContainer.getBoundingClientRect(),i=Math.min(Math.max(0,e.x-t.x),t.width)/t.width;timelineContainer.style.setProperty("--preview-position",i),isScrubbing&&(e.preventDefault(),timelineContainer.style.setProperty("--progress-position",i))}function changePlaybackSpeed(e,t){let i=video.playbackRate+.25*t;i>2&&e?i=.25:i>2?i=2:i<.25&&(i=.25),video.playbackRate=i,speedBtn.textContent=`${i}x`,createAndDistroyCard(i+"x","",!0,!1,!0)}let videoControlsContainer=document.getElementById("video-controls-container"),chooseVideoMainContainer=document.querySelector(".choose-video-main-container");var tackelled=!0;let curserX=0,curserY=0;videoContainer.addEventListener("mousemove",function(e){curserX=e.clientX,curserY=e.clientY,tackelled&&(tackelled=!1,document.querySelector("body").style.cursor="auto",videoControlsContainer.classList.contains("adjust-opacity-of-video-container")&&(videoControlsContainer.classList.remove("adjust-opacity-of-video-container"),chooseVideoMainContainer.classList.remove("adjust-opacity-of-video-container")),setTimeout(function(t,i){t==e.clientX&&i==e.clientY&&(document.querySelector("body").style.cursor="none",videoControlsContainer.classList.add("adjust-opacity-of-video-container"),chooseVideoMainContainer.classList.add("adjust-opacity-of-video-container"),tackelled=!0)},5e3,curserX,curserY,e))},!0),video.addEventListener("loadeddata",()=>{totalTimeElem.textContent=formatDuration(video.duration)}),video.addEventListener("timeupdate",()=>{currentTimeElem.textContent=formatDuration(video.currentTime);let e=video.currentTime/video.duration;timelineContainer.style.setProperty("--progress-position",e)});const leadingZeroFormatter=new Intl.NumberFormat(void 0,{minimumIntegerDigits:2});function formatDuration(e){let t=Math.floor(e%60),i=Math.floor(e/60)%60,o=Math.floor(e/3600);return 0===o?`${i}:${leadingZeroFormatter.format(t)}`:`${o}:${leadingZeroFormatter.format(i)}:${leadingZeroFormatter.format(t)}`}function skip(e){video.currentTime+=e;let t="+";e<0&&(t="-",e*=-1),createAndDistroyCard(t+e+"s","",!0,!1,!0)}function toggleMute(){video.muted=!video.muted}function toggleTheaterMode(){videoContainer.classList.toggle("theater")}function toggleFullScreenMode(){null==document.fullscreenElement?document.body.requestFullscreen():document.exitFullscreen()}function toggleMiniPlayerMode(){videoContainer.classList.contains("mini-player")?document.exitPictureInPicture():video.requestPictureInPicture()}function togglePlay(){video.paused?(video.play(),createAndDistroyCard("",'viewBox="0 0 24 24"><path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z" />',!1,!0,!1)):(video.pause(),createAndDistroyCard("",'viewBox="0 0 24 24"><path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />',!1,!0,!1))}muteBtn.addEventListener("click",toggleMute),volumeSlider.addEventListener("input",e=>{video.volume=e.target.value,video.muted=0===e.target.value}),video.addEventListener("volumechange",()=>{volumeSlider.value=video.volume;let e;video.muted||0===video.volume?(volumeSlider.value=0,e="muted",createAndDistroyCard("0%",'viewBox="0 0 24 24"><path fill="currentColor" d="M12,4L9.91,6.09L12,8.18M4.27,3L3,4.27L7.73,9H3V15H7L12,20V13.27L16.25,17.53C15.58,18.04 14.83,18.46 14,18.7V20.77C15.38,20.45 16.63,19.82 17.68,18.96L19.73,21L21,19.73L12,10.73M19,12C19,12.94 18.8,13.82 18.46,14.64L19.97,16.15C20.62,14.91 21,13.5 21,12C21,7.72 18,4.14 14,3.23V5.29C16.89,6.15 19,8.83 19,12M16.5,12C16.5,10.23 15.5,8.71 14,7.97V10.18L16.45,12.63C16.5,12.43 16.5,12.21 16.5,12Z" />',!0,!0,!1)):video.volume>=.5?(e="high",createAndDistroyCard(parseInt(100*video.volume)+"%",'viewBox="0 0 24 24"><path fill="currentColor" d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z" />',!0,!0,!1)):(e="low",createAndDistroyCard(parseInt(100*video.volume)+"%",'viewBox="0 0 24 24"><path fill="currentColor" d="M5,9V15H9L14,20V4L9,9M18.5,12C18.5,10.23 17.5,8.71 16,7.97V16C17.5,15.29 18.5,13.76 18.5,12Z" />',!0,!0,!1)),videoContainer.dataset.volumeLevel=e}),theaterBtn.addEventListener("click",toggleTheaterMode),fullScreenBtn.addEventListener("click",toggleFullScreenMode),miniPlayerBtn.addEventListener("click",toggleMiniPlayerMode),document.addEventListener("fullscreenchange",()=>{videoContainer.classList.toggle("full-screen",document.fullscreenElement)}),video.addEventListener("enterpictureinpicture",()=>{videoContainer.classList.add("mini-player")}),video.addEventListener("leavepictureinpicture",()=>{videoContainer.classList.remove("mini-player")}),playPauseBtn.addEventListener("click",togglePlay),video.addEventListener("click",togglePlay),video.addEventListener("play",()=>{videoContainer.classList.remove("paused")}),video.addEventListener("pause",()=>{videoContainer.classList.add("paused")});let chooseVideoInput=document.getElementById("choose-file-input-id"),chooseVideoBtn=document.getElementById("choose-video-btn-file");chooseVideoBtn.addEventListener("click",()=>{let e=chooseVideoInput.value;e=e.split("\\").pop(),document.querySelector("title").textContent=e;let t=chooseVideoInput.files[0],i=window.URL.createObjectURL(t);video.src=i,video.load(),video.play()});
function createAndDistroyCard(message, symbol, showMessage, showSymbol, textSymbol) {
    console.log('called');
    const showAndDistroyMessageContainer = document.createElement("div");
    showAndDistroyMessageContainer.classList.add('showAndDistroyMessageContainer');
    // viewBox="0 0 24 24">
    //             <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />

    if (showMessage && showSymbol) {
        showAndDistroyMessageContainer.innerHTML = `
        <div class="showAndDistroyMessage">
            <svg class="symbol-icon" ${symbol}
            </svg>
            <p>
                ${message}
            </p>
        </div>`
    } else if (showMessage && textSymbol) {
        showAndDistroyMessageContainer.innerHTML = `
        <div class="showAndDistroyMessage">
            <p style='font-size: 110px;'>
                ${message}
            </p>
        </div>`
    } else if (showMessage) {
        showAndDistroyMessageContainer.innerHTML = `
        <div class="showAndDistroyMessage">
            <p>
                ${message}
            </p>
        </div>`
    } else if (showSymbol) {
        showAndDistroyMessageContainer.innerHTML = `
        <div class="showAndDistroyMessage">
            <svg class="symbol-icon" ${symbol}
            </svg>
        </div>`
    }

    videoContainer.appendChild(showAndDistroyMessageContainer);
    setTimeout(() => {
        console.log('LastStep');
        showAndDistroyMessageContainer.remove();
        console.log('Completed');
    }, 200);

}
