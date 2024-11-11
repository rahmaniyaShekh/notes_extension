document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const header = document.getElementById('header');
    const content = document.getElementById('content');
    const mainTitleContainer = document.getElementById("main-title-list-container");
    const subTitlesAside = document.getElementById("sub-titles-aside");
    const mainContent = document.getElementById("main-content");
    const mainTitleText = document.getElementById('main-title-text');
    const mainTitleDropDownBox = document.getElementById('main-title-list-container');
    const mainTitleDropDownBtn = document.getElementById('main-title-drop-down-btn');
    const deleteChapterBtn = document.querySelector('#delete-chapter-btn');
    const exportAsHTMLBtn = document.querySelector('#export-as-pdf-btn');
    const offlineVideoPlayer = document.getElementById('offlineVideoPlayer');
    const darkModeToggleBtn = document.getElementById('darkModeToggleBtn');

    const subTitleEnableDesableBtn = document.getElementById('make-display-change-to-desable-sub-title');
    const subTitleEDIcon = document.getElementById('sub-title-e-d-icon');
    const containerOfSubAside = document.getElementById('sub-aside-container');
    const mainContentContainer = document.getElementById('main-content-container');


    let upIconClicked = false;

    let titleCard;
    let editTitleBtn;

    const { jsPDF } = window.jspdf;

    let currentMainTitle = null;
    let currentIndex = 0;
    let screenshots = {};
    let mainTitleObjB = {};
    let ind = -1;
    let darkMode = false;
    let settings;

    //getting all setings
    chrome.storage.local.get(['settings'], (result) => {
      settings = result['settings'] || [];
      if (settings) {
        darkMode = (settings[0].theme == 'dark') ? true : false;
        // console.log("Settings", settings);
        ///setting theme or dark mode
        toggleDarkMode();
      }
    })

    

    //Handling Sub-title Enable and Desable
    // subTitleEnableDesableBtn.addEventListener('click', () => {
    //     console.log("Clicked", containerOfSubAside.style.width);
    //     if (containerOfSubAside.style.width == '0px') {
    //         if (subTitleEDIcon.classList.contains('fa-arrow-right')) {
    //             subTitleEDIcon.classList.remove('fa-arrow-right');
    //             subTitleEDIcon.classList.add('fa-arrow-left')
    //         }
    //         containerOfSubAside.style.width = "20%";
    //         mainContentContainer.style.width = "80%";
    //     } else {
    //         if (subTitleEDIcon.classList.contains('fa-arrow-left')) {
    //             subTitleEDIcon.classList.remove('fa-arrow-left');
    //             subTitleEDIcon.classList.add('fa-arrow-right');
    //         }
    //         containerOfSubAside.style.width = "0";
    //         mainContentContainer.style.width = "100%";
    //     }
    // })

    subTitleEnableDesableBtn.addEventListener('click', () => {
      upIconClicked = true;
      console.log("Clicked", containerOfSubAside.style.width);
      toggleUpDownIcon();
      if (header.style.marginTop == '-7vh') {
          header.style.marginTop = "0px"
          content.style.height = '92vh'
          if (document.fullscreenElement != null) {
            document.exitFullscreen();
          }
        } else {
          header.style.marginTop = "-7vh"
          content.style.height = '99vh'
          if (document.fullscreenElement == null) {
            document.body.requestFullscreen()
          }
      }
  })

  function toggleUpDownIcon() {
    if (subTitleEDIcon.classList.contains('fa-arrow-down')) {
      subTitleEDIcon.classList.remove('fa-arrow-down');
      subTitleEDIcon.classList.add('fa-arrow-up')
    } else if (subTitleEDIcon.classList.contains('fa-arrow-up')) {
    subTitleEDIcon.classList.remove('fa-arrow-up');
    subTitleEDIcon.classList.add('fa-arrow-down');
    }
  }

    // Get clicked mainTitle
    let clickedOnMainTitle = false;
    const urlParams = new URLSearchParams(window.location.search);
    var clickedMainTitle = urlParams.get("mainTitle");
    mainTitleText.innerText = clickedMainTitle;
    mainTitleText.addEventListener("click", () => {
      clickedOnMainTitle = true;
      mainTitleDropDownBox.classList.toggle("transition-visible-container");
    });
    document.body.addEventListener('click', () => {
      if (!mainTitleDropDownBox.classList.contains('transition-visible-container')) {
        if (!clickedOnMainTitle) {
          mainTitleDropDownBox.classList.add("transition-visible-container");
        } else {
          clickedOnMainTitle = false;
        }
      }
    })
    
    relodedPageOrFirstTimeLoaded(clickedMainTitle);

    // Initialize the page by loading the screenshots from storage
    function relodedPageOrFirstTimeLoaded(newTitleClicked) {
        chrome.storage.local.get([newTitleClicked], (result) => {
            screenshots = result[newTitleClicked] || [];
            //getting all main titles
            chrome.storage.local.get(["mainTitles-lists"], (result) => {
                mainTitleObjB = result["mainTitles-lists"] || [];
                ind = findIndex(mainTitleObjB, newTitleClicked);
                initializePage();
            });
        });
    }


    function initializePage() {
        // Populate the navigation bar with main titles

        //generating all main titles
        mainTitleContainer.innerHTML = '';
        mainTitleObjB.forEach((newMainTitle) => {
            const mainTitleItem = createMainTitleItem(newMainTitle);
            mainTitleContainer.appendChild(mainTitleItem);
        });

        // Display the sub-titles and small screenshot previews
        if (screenshots) {
            displaySubTitles(screenshots);
            displayMainContent(screenshots[0], 0);
            console.log("Screen shots: ", screenshots);
            currentMainTitle = clickedMainTitle;
            currentIndex = 0;
        }
    }

    // Toggle visibility of main titles dropdown
    mainTitleDropDownBtn.addEventListener("click", () => {
        mainTitleDropDownBox.classList.toggle("transition-visible-container");
    });

    // Function to create a main title item
    function createMainTitleItem(newMainTitle) {
        const mainTitleItem = document.createElement("div");
        mainTitleItem.className = 'item-list-main';
        let innerTextUnde = `<div class="item-list">
            <a href="#">
              <div class="item-text text-size-1-5rem text-color-black">${newMainTitle.title}</div>
              <div class="item-details text-size-0-8rem flex">
                <div class="item-date-time text-color-black">${newMainTitle.dateTime}</div>
                <div class="item-total-screen-shots text-color-black">Total Screenshot: ${newMainTitle.totalScreenShots}</div>
              </div>
            </a>
          </div>
          <div class="dark-line"></div>`;
        mainTitleItem.innerHTML = innerTextUnde;
        mainTitleItem.addEventListener("click", (event) => {
            event.preventDefault();
            currentMainTitle = newMainTitle.title;
            currentIndex = 0;
            mainTitleDropDownBox.classList.toggle("transition-visible-container");
            mainTitleText.innerText = newMainTitle.title;
            clickedMainTitle = newMainTitle.title;
            relodedPageOrFirstTimeLoaded(clickedMainTitle);
        });
        return mainTitleItem;
    }

    // Function to display sub-titles and small screenshot previews
    function displaySubTitles(newScreenShots) {
        subTitlesAside.innerHTML = ""; // Clear previous content
        if (newScreenShots.length > 0) {
          newScreenShots.forEach((note, index) => {
                const noteItem = createSubTitleItem(note, index);
                subTitlesAside.appendChild(noteItem);
            });
        } else {
            subTitlesAside.innerHTML = "No screenshots available for the selected main title.";
        }
    }

    // Function to create a sub-title item
    function createSubTitleItem(note, index) {
        const noteItem = document.createElement("div");
        noteItem.className = "note-item";

        // Small screenshot preview
        const image = document.createElement("img");
        image.src = note.url;
        image.alt = `Screenshot ${index + 1}`;

        // Sub-title text and delete button
        const title = document.createElement("p");
        title.textContent = `${note.title || `Screenshot ${index + 1}`}`;
        title.className = "title-class";
        const deleteButton = document.createElement("div");
        deleteButton.className = "delete-btn-sub-title";
        deleteButton.innerHTML = `<i class="fa-solid fa-trash delete-btn-icon"></i>`;

        // Add click event to delete screenshot
        deleteButton.addEventListener("click", (event) => {
            event.stopPropagation(); // Prevent triggering click event for displaying main content
            deleteScreenshot(index);
        });

        const imageContainer = document.createElement("div");
        imageContainer.className = "imageContainer-for-subtitle-img";
        imageContainer.appendChild(image);
        imageContainer.appendChild(deleteButton);

        // Append elements to note item
        noteItem.appendChild(imageContainer);
        noteItem.appendChild(title);

        // Add click event to display full-size screenshot and sub-title in the main content area
        noteItem.addEventListener("click", () => {
            currentIndex = index;
            displayMainContent(note, index);
        });

        return noteItem;
    }

    // Function to display full-size screenshot and sub-title in the main content area
    function displayMainContent(note, index) {
        mainContent.innerHTML = ""; // Clear previous content
        console.log("note: ", note);
        const image = document.createElement("img");
        image.id = "mainContentImg";
        image.src = note.url;
        image.alt = `Screenshot`;
        image.style.width = "100%";
        image.style.height = "auto";

        titleCard = document.createElement('div');
        titleCard.classList.add('title-card');
        titleCard.id = 'title-card-id';
        titleCard.innerHTML = `
        <div class="title-container" id="title-container-id">
          <h2 id = 'title-text-id'>${note.title || 'Screenshot'}</h2>
          <div class="edit-title-card" id="edit-title-card-id" data-index='${index}'>
            <i class="fa-regular fa-pen-to-square" id="edit-title-icon-id"></i>
          </div>
        </div>
        `

        const title = document.createElement("h2");
        title.textContent = `${note.title || `Screenshot`}`;

        // Add a delete button and video link button to the main content
        const containerForDeleteBtnAndLinkBtn = document.createElement("div");
        containerForDeleteBtnAndLinkBtn.className = "delete-and-video-lik-container";
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";
        // Add click event to delete screenshot from main content
        deleteButton.addEventListener("click", () => {
            deleteScreenshot(currentIndex);
        });

        containerForDeleteBtnAndLinkBtn.appendChild(deleteButton);
        let videoLink = note.videolink || "0";
        if (videoLink != "0" && videoLink != "undefined") {
          const videoLinkContainer = document.createElement("div");
          videoLinkContainer.className = "video-link-container";
          videoLinkContainer.innerHTML = `<div class="video-link-text">YouTube</div>
                                            <i class="fa-brands fa-youtube video-link-icon"></i>`;
          videoLinkContainer.addEventListener("click", function() {
            window.open(videoLink, '_blank');
          })
          containerForDeleteBtnAndLinkBtn.appendChild(videoLinkContainer);
        }

        // Append elements to main content
        mainContent.appendChild(image);
        mainContent.appendChild(titleCard);
        mainContent.appendChild(containerForDeleteBtnAndLinkBtn);
        editTitleBtn = document.getElementById('edit-title-card-id');
        editTitleBtn.addEventListener('click', () => {
          htmlCode = `<div class="note-card">
              <textarea id="note-title" autofocus placeholder="Enter your sub title here..">${note.title}</textarea>
              <p class="textarea-para">Click on Enter to save</p>
          </div>`
          const card = document.createElement("div");
          card.id = "main-container-for-taking-notes";
          card.innerHTML = htmlCode;

          document.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const title = document.getElementById("note-title").value;
                screenshots[index].title = title;
                chrome.storage.local.set({ [clickedMainTitle]: screenshots }, () => {
                  console.log("Title-updated", index, screenshots);
                });
                document.getElementById('title-text-id').textContent = screenshots[index].title;
                card.remove();
            }
          });
          if (document.fullscreenElement == null) {
            document.body.appendChild(card);
          } else {
            mainContent.appendChild(card);
          }
        })
    }

    // Function to delete a screenshot
    function deleteScreenshot(index) {
        if (screenshots.length === 0) {
            return;
        }
        // Remove the screenshot from the array
        screenshots.splice(index, 1);
        mainTitleObjB[ind].totalScreenShots -= 1;
        chrome.storage.local.set({ ["mainTitles-lists"]: mainTitleObjB }, () => {
            //console.log("Main title updated successfully. one screen shot deleted from ", mainTitleObjB[ind]);
        });

        // Update Chrome storage with the new screenshots data
        chrome.storage.local.set({ [clickedMainTitle]: screenshots }, () => {
            alert("Screen shot deleted successfully.");
            // Refresh the display
            displaySubTitles(screenshots);
            if (currentIndex >= screenshots.length) {
                currentIndex = screenshots.length - 1; // Adjust index to last item
            }

            // Display the next available screenshot or clear the content
            if (currentIndex >= 0) {
                displayMainContent(screenshots[currentIndex], currentIndex);
            } else {
                mainContent.innerHTML = ""; // Clear content if no more screenshots available
            }
        });
    }

    // Event listener for delete chapter button
    deleteChapterBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete this chapter?")) {
            deleteChapter();
        }
    });

    // offlineVideoPlayer.addEventListener('click', () => {
    //   let urll = chrome.runtime.getURL('/htmls/htmlForPlayer.html');
    //   console.log(urll)
    //   chrome.tabs.create({ url:  urll});
    // })

    //dark mode btn handle
    darkModeToggleBtn.addEventListener('click', () => {
      if (darkMode == false) {
        darkMode = true;
      } else {
        darkMode = false;
      }
      toggleDarkMode();
      let them = (darkMode) ? 'dark' : 'light'
      if (!settings[0]) {
        settings.push({theme : them})
      } else {
        settings[0].theme = them;
      }
      chrome.storage.local.set({ ["settings"]: settings }, () => {
        // console.log("Settings updated successfully.", settings);
      });
    })

    function toggleDarkMode() {
      // console.log("Toggle dark mode called", darkMode);
      if (darkMode) {
        document.getElementById('dark-mode-text').textContent = 'Light Mode';
        document.documentElement.style.setProperty('--nav-bar-color', '#171717');
        document.documentElement.style.setProperty('--black-text-color', '#e2e0e0');
        document.documentElement.style.setProperty('--white-dark-btn', '#212121');
        document.documentElement.style.setProperty('--secondary-white', '#0f0f0f');
        document.documentElement.style.setProperty('--warm-white', '#1e1e1e');
        document.documentElement.style.setProperty('--body-color', '#2e2e2e');
        document.documentElement.style.setProperty('--sub-title-white-color', '#2b2b2b');
        document.documentElement.style.setProperty('--dark-line', '#2a2a2a');
        document.documentElement.style.setProperty('--primary-btn-color', '#1f1f1f');
        document.documentElement.style.setProperty('--icon-color', '#e6e6e6');
        document.documentElement.style.setProperty('--youtube-link-btn-background', 'rgb(33 32 32 / 22%)');
        document.documentElement.style.setProperty('--youtube-link-btn-background-hover', 'rgb(26 25 25)');
        document.documentElement.style.setProperty('--youtube-link-btn-border', '#a6a6a6a6');
        document.documentElement.style.setProperty('--youtube-link-btn-text', '#f5f5f5c7');
      } else {
        document.getElementById('dark-mode-text').textContent = 'Dark Mode';
        document.documentElement.style.setProperty('--nav-bar-color', '#eceae8');
        document.documentElement.style.setProperty('--black-text-color', '#232222');
        document.documentElement.style.setProperty('--white-dark-btn', '#e2e0e0');
        document.documentElement.style.setProperty('--secondary-white', '#f9f9f9');
        document.documentElement.style.setProperty('--warm-white', '#f9f3f3');
        document.documentElement.style.setProperty('--body-color', '#f9f9f9');
        document.documentElement.style.setProperty('--sub-title-white-color', '#eceae8');
        document.documentElement.style.setProperty('--dark-line', '#b8b7b7');
        document.documentElement.style.setProperty('--primary-btn-color', '#2294ed');
        document.documentElement.style.setProperty('--icon-color', '#fbfbfb');
        document.documentElement.style.setProperty('--youtube-link-btn-background', 'rgba(255, 3, 3, 0.219)');
        document.documentElement.style.setProperty('--youtube-link-btn-background-hover', 'rgba(255, 3, 3, 0.268)');
        document.documentElement.style.setProperty('--youtube-link-btn-border', 'red');
        document.documentElement.style.setProperty('--youtube-link-btn-text', 'rgba(216, 21, 21, 0.864)');
      }
    }

    //function for finding maintitle is present or not
    function findIndex(mainTitleObj, mainTitle) {
        var ind = -1;
        mainTitleObj.forEach((inMainTitle, index) => {
            if (inMainTitle.title == mainTitle) {
                ind = index;
            }
        });
        return ind;
    }

    // Function to delete a chapter along with its screenshots
    function deleteChapter() {
        if (ind >= 0) {
            // Save main title empty to local storage
            mainTitleObjB.splice(ind, 1);
            // Save main title to local storage
            chrome.storage.local.set({ ["mainTitles-lists"]: mainTitleObjB }, () => {
                //console.log("Main title updated successfully. One Chapter is deleted ", mainTitleObjB);
            });
        }
        chrome.storage.local.remove([clickedMainTitle], () => {
            // Refresh the display
            subTitlesAside.innerHTML = ""; // Clear the sub-titles and screenshots
            mainContent.innerHTML = ""; // Clear the main content
            alert("Chapter deleted successfully.");
            window.location.href = "index.html"; // Redirect to index page
        });
    }

    // Keydown event listener for navigating screenshots
    document.addEventListener("keydown", (event) => {
        if (!currentMainTitle) {
            return; // Exit if no main title is selected
        }

        if (document.getElementById("main-container-for-taking-notes")) {
          return;
        }
        // Load screenshots data from Chrome storage
        const notesArray = screenshots;

        if (event.key === "ArrowRight") {
            // Right arrow key: navigate to the next screenshot
            if (currentIndex < notesArray.length - 1) {
                currentIndex += 1;
                displayMainContent(notesArray[currentIndex], currentIndex);
            }
        } else if (event.key === "ArrowLeft") {
            // Left arrow key: navigate to the previous screenshot
            if (currentIndex > 0) {
                currentIndex -= 1;
                displayMainContent(notesArray[currentIndex], currentIndex);
            }
        } else if (event.key === 'f' || event.key ==='F') {
          toggleFullScreenMode();
        }
    });

    //function and listner for fullscreen change
    function toggleFullScreenMode() {
      if (document.fullscreenElement == null) {
        document.querySelector(".delete-and-video-lik-container").style.display = "none";
        mainContent.requestFullscreen()
        titleCard.classList.add('adjust-opacity-of-video-container');
        setTimeout(() => {
          titleCard.classList.remove('adjust-opacity-of-video-container');
        }, 2000);
      } else {
          document.querySelector(".delete-and-video-lik-container").style.display = "flex";
          document.exitFullscreen()
      }
    }
    document.addEventListener("fullscreenchange", () => {
      if (upIconClicked) {
        upIconClicked = false;
        return;
      }
      mainContent.classList.toggle("full-screen", document.fullscreenElement)
    })

    // Event listener for export as PDF button
    exportAsHTMLBtn.addEventListener("click", () => {
        exportAsHtml(currentMainTitle);
    });

    //function for search functinality
    document.getElementById('searchInput').addEventListener('input', searchItems);
    function searchItems() {
        const searchInput = document.getElementById('searchInput').value.toLowerCase();
        console.log(searchInput);
        const filteredItems = screenshots.map((screenshots, index) => ({ ...screenshots, index }))  // Add index to each item
        .filter(screenshots => screenshots.title.toLowerCase().includes(searchInput));
        
        console.log(filteredItems);
        if (searchInput === '') {
          displaySubTitles(screenshots.map((screenshots, index) => ({ ...screenshots, index })))
        } else {
          subTitlesAside.innerHTML = ""; // Clear previous content
          //console.log("Screen shot updated", filteredItems);

          if (filteredItems.length > 0) {
            filteredItems.forEach((note) => {
                  const noteItem = createSubTitleItem(note, note.index);
                  subTitlesAside.appendChild(noteItem);
              });
          } else {
              subTitlesAside.innerHTML = "No screenshots available for the selected main title.";
          }
        }
    }

    // Function to export a main title with its screenshots as a self-contained HTML file
    function exportAsHtml(mainTitle) {
        if (screenshots.length === 0) {
            return;
        }

        // Create HTML content
        let htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notes by Sequrra offline</title>
        <style> 
    /* variables */
    :root {
      --primary-btn-color: #2294ed;
      --primary-btn-color-dark: #1d69a3;
      --nav-bar-color: #eceae8;
      --white-text: #fbfbfb;
      --white-text-for-dark: #e8e8e8;
      --white-dark-btn: #e2e0e0;
      --black-text-color: #232222;
      --black-text-secondary: #232323;
      --darkTextColor: #293845;
      --dark-line: #b8b7b7;
      --borderYellow: #fad975;
      --grdOrBg: linear-gradient(to right, #feae44 , #fc4717);
      --secondry-black-color: #212121;
      --secondary-white: #f9f9f9;
      --tersery-black: #2e2e2e;
      --forth-black: #2f2f2ff1;
      --sub-title-white-color: #eceae8;
      --warm-white: #f9f3f3;
      --body-color: #f9f9f9;
      --icon-color: #fbfbfb;
    }
    /* Utility */
    .flex {
      display: flex;
      align-items: center;
    }
    .not-visible {
      display: none;
    }
    
    .expandable-btn {
      background-color: var(--primary-btn-color);
      padding: 12px;
      border-radius: 20px;
      gap: 10px;
      transition: 0.5s ease-out;
      cursor: pointer;
    }
    .expandable-btn:hover .expandable-btn-text{
      display: block;
      color: var(--white-text);
    }
    .export-as-pdf-text{
      color: var(--white-text);
    }
    
    .pirimar-icon {
      color: var(--white-text);
    }
    .pirimar-icon-dark {
      color: var(--black-text-color);
    }
    
    .primary-btn {
      background-color: var(--primary-btn-color);
      padding: 11px;
      min-width: 16px;
      border-radius: 20px;
      gap: 10px;
      cursor: pointer;
    }
    .primary-btn-dark {
      background-color: var(--white-dark-btn);
      padding: 11px;
      min-width: 16px;
      border-radius: 20px;
      gap: 10px;
      cursor: pointer;
    }
    
    .yellow-line {
      width: 100%;
      height: 2px;
      background: var(--primary-btn-color);
    }
    
    .dark-line {
      width: 100%;
      height: 2px;
      background: var(--dark-line);
    }
    
    .text-size-1-5rem{
      font-size: 1.1rem;
    }
    
    .text-size-0-5rem{
      font-size: 0.5rem;
    }
    .text-size-0-8rem{
      font-size: 0.7rem;
    }
    .text-size-1rem{
      font-size: 1rem;
    }
    .text-color-black {
      color: var(--black-text-color);
    }
    
    ul {
      list-style: none;
    }
    li, a {
      text-decoration: none;
    }
    
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      overflow: hidden;
      height: 100vh;
    }
    .header{
      height: 7vh;
      width: 100%;
      margin-top: 0px;
      justify-content: space-between;
      background-color: var(--nav-bar-color);
    }
    
    .main-title-text-box {
      gap: 10px;
    }
    
    .main-title-text-box h2 {
      color: var(--black-text-color);
      font-size: 1.2rem;
    }

    .main-title-text {
      margin-left: 6px;
      cursor: pointer;
    }
    
    .nav-links {
      flex-basis: auto;
      margin-right: 6px;
    }
    
    .nav-links ul {
      justify-content: end;
      gap: 10px;
    }
    
    .main-title-list-container {
      position: absolute;
      top: calc(7vh + 2px);
      left: 6px;
      width: 40vw;
      min-height: 60px;
      background-color: var(--white-dark-btn);
      z-index: 10;
      transition: 1.5 ease-out;
      max-height: 80vh;
      overflow: auto;
    }
    
    .transition-visible-container, .show-main-content-in-full-screen-visiblity {
      display: none;
      /* margin: -100%; */
    }
    
    .show-main-content-in-full-screen-visiblity {
      display: flex !important;
      /* margin: -100%; */
    }
    
    .item-text {
      padding: 6px;
      overflow: hidden;
    }
    
    .item-details {
      justify-content: space-between;
      padding: 6px;
    }
    
    .item-list:hover {
      background-color: var(--dark-line);
    }
    /* #main-title-nav {
      padding: 10px;
      background-color: #f0f0f0;
      display: flex;
      justify-content: space-around;
      border-bottom: 1px solid #ccc;
    } */
    
    #content {
      display: flex;
      overflow: hidden;
      height: 92vh;
    }
    
    #sub-titles-aside {
      width: fit-content;
      padding: 6px;
      position: absolute;
    }
    
    #main-content {
      /* background: #000; */
      flex-grow: 1;
      padding: 6px;
      position: absolute;
      display: flex;
      justify-content: center;
      flex-direction: column;
    }
    
    #main-content.full-screen {
      max-height: 100vh;
      width: 100%;
    }
    
    #main-content.full-screen .title-card{
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      bottom: 20px;
      left: auto;
      text-align: center;
      opacity: 0;
    }
    /* #main-content:hover .title-card{
      opacity: 1;
    } */
    #main-content.full-screen .title-container{
      max-width: 80%;
      border-radius: 15px;
      background-color: #171717ba;
    }
    #main-content.full-screen .edit-title-card{
      border-radius: 5px 0px 15px 0px;
    }
    .adjust-opacity-of-video-container {
      opacity: 1 !important;
    }
    
    #main-content.full-screen .delete-button{
      display: none;
    }
    
    
    /* container for sub title screen shots  */
    .note-item {
      margin-bottom: 10px;
      border: 2px solid var(--dark-line);
      background: var(--sub-title-white-color);
    }
    
    .note-item img {
      width: 100%;
      display: block;
    }
    .note-item p {
      margin-bottom:20px;
    }
    
    .new{
      background-color: var(--secondary-white);
      width: 20%;
      height: 92vh;
      overflow-y: auto;
      position: relative;
      overflow-x: hidden;
    }
    .newone{
      overflow-y: scroll;
      width: 80%;
      position: relative;
      display: flex;
      justify-content: center;
      background-color: var(--warm-white);
    }
    .newone::-webkit-scrollbar,
    .new::-webkit-scrollbar{
      width: 0px;
    }
    
    /* Styles for delete buttons */
    .imageContainer-for-subtitle-img {
      position: relative;
    }
    
    /* title style */
    .title-card {
      width: 100%;
      transition: 0.2s ease-out;
    }
    .title-card:hover {
      opacity: 1 !important;
    }
    
    .title-container {
      display: flex;
      background-color: #171717d8;
      padding: 6px 12px;
      margin: 0;
      position: relative;
    }
    
    .title-container h2 {
      margin: 0 10px 0 0;
      padding: 2px;
      font-size: 14px;
      font-family: Verdana, Geneva, Tahoma, sans-serif;
      color: rgb(240, 240, 240);
      text-align: left;
    }
    .title-class {
      margin: 12px 2px 20px 2px;
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--black-text-color);
    }
    .delete-button {
      margin-top: 6px;
      margin-right: 10px;
      padding: 5px 8px;
      background-color: var(--primary-btn-color-dark);
      color: var(--white-text);
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease;
      max-width: fit-content;
    }
    
    .delete-btn-sub-title {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px;
      background: var(--primary-btn-color);
      color: var(--white-text);
      border: none;
      border-radius: 20px 0px 0px 0px;
      cursor: pointer;
      transition: background-color 0.3s ease;
      /* margin-right: 6px; */
      z-index: 5;
      position: absolute;
      bottom: 0;
      right: 0;
    }
    
    .delete-btn-icon {
      font-size: 1.1rem;
      margin-top: 2px;
      margin-left: 2px;
    }
    
    .delete-button:hover {
      background-color: var(--primary-btn-color);
    }
     </style>
    </head>
    <body>
        <div class="header flex">
            <div class="main-title-text-box flex">
                <h2 class="main-title-text">${mainTitle}</h2>
            </div>
            <div class="nav-links">
                <ul class="flex">
                <li>
                  <div class="hover-link flex expandable-btn" id="darkModeToggleBtn">
                    <div class="expandable-btn-text not-visible" id="dark-mode-text" style="font-size: 14px;">Dark Mode</div>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="width: 15px;"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#fbfbfb" d="M448 256c0-106-86-192-192-192V448c106 0 192-86 192-192zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"/></svg>
                  </div>
                </li>
                </ul>
            </div>
        </div>
        <div class="yellow-line"></div>
        <div id="content">
            <div class="new">
                <aside id="sub-titles-aside">
                    <!-- Sub-titles and previews will be added here dynamically -->
                </aside>
            </div>
            <div class="newone">
                <main id="main-content">
                    <!-- Full-size screenshot and sub-title will be displayed here -->
                </main>
            </div>
        </div>
        <div class="show-main-content-in-full-screen" id="show-main-content-in-full-screen"></div>
        <script src="note3.js"></script>
        <script>
            document.addEventListener("DOMContentLoaded", () => {
                const darkModeToggleBtn = document.getElementById('darkModeToggleBtn');
                let darkMode = false;
                const mainContent = document.getElementById("main-content");
                const screenshotsMain = ${JSON.stringify(screenshots)};
                const currentMainTitle = "${mainTitle}";

                if (screenshotsMain) {
                    displayMainContent(screenshotsMain[0]);
                    currentIndex = 0;
                }
                
                // Function to display sub-titles and small screenshot previews for the current chapter
                function displaySubTitles() {
                    const subTitlesAside = document.getElementById("sub-titles-aside");
                    subTitlesAside.innerHTML = ""; // Clear previous content
                    
                    if (screenshotsMain) {
                        screenshotsMain.forEach((note, index) => {
                            const noteItem = createSubTitleItem(note, index);
                            subTitlesAside.appendChild(noteItem);
                        });
                    } else {
                        subTitlesAside.innerHTML = "No notes available for the selected chapter.";
                    }
                }

                // Function to create a sub-title item
                function createSubTitleItem(note, index) {
                    const noteItem = document.createElement("div");
                    noteItem.className = "note-item";

                    // Small screenshot preview
                    const image = document.createElement("img");
                    image.src = note.url;
                    image.alt = "Screenshot";

                    // Sub-title text
                    const title = document.createElement("p");
                    title.className = "title-class";
                    title.textContent = note.title || 'Screenshot \${index + 1}';

                    // Add click event to display full-size screenshot and sub-title in the main content area
                    noteItem.addEventListener("click", () => {
                        displayMainContent(note);
                    });

                    // Append elements to note item
                    noteItem.appendChild(image);
                    noteItem.appendChild(title);

                    return noteItem;
                }

                // Function to display full-size screenshot and sub-title in the main content area
                function displayMainContent(note) {
                    const mainContent = document.getElementById("main-content");
                    mainContent.innerHTML = ""; // Clear previous content

                    const image = document.createElement("img");
                    image.style.width = "100%";
                    image.style.height = "auto";
                    image.src = note.url;
                    image.alt = "Screenshot";

                    titleCard = document.createElement('div');
                    titleCard.classList.add('title-card');
                    titleCard.id = 'title-card-id';
                    titleCard.innerHTML = '<div class="title-container" id="title-container-id"><h2 id = "title-text-id">' + note.title + '</h2></div>'
                    const title = document.createElement("h2");
                    title.textContent = note.title || 'Screenshot';

                    // Add delete button to delete screenshot
                    const deleteButton = document.createElement("button");
                    deleteButton.classList.add('delete-button');
                    deleteButton.textContent = "Delete";
                    deleteButton.addEventListener("click", () => {
                        deleteScreenshot(note);
                    });

                    // Append elements to main content
                    mainContent.appendChild(image);
                    mainContent.appendChild(titleCard);
                    mainContent.appendChild(deleteButton);
                }

                // Function to delete a screenshot
                function deleteScreenshot(note) {
                    const index = screenshotsMain.indexOf(note);
                    if (index !== -1) {
                        screenshotsMain.splice(index, 1);
                        displaySubTitles();
                        displayMainContent({}); // Clear main content after deletion
                    }
                }

                // Keydown event listener for navigating screenshots
                document.addEventListener("keydown", (event) => {
                    if (!currentMainTitle) {
                        return; // Exit if no main title is selected
                    }
            
                    // Load screenshots data from Chrome storage
                    const notesArray = screenshotsMain || [];
            
                    if (event.key === "ArrowRight") {
                        // Right arrow key: navigate to the next screenshot
                        if (currentIndex < notesArray.length - 1) {
                            currentIndex += 1;
                            displayMainContent(notesArray[currentIndex]);
                        }
                    } else if (event.key === "ArrowLeft") {
                        // Left arrow key: navigate to the previous screenshot
                        if (currentIndex > 0) {
                            currentIndex -= 1;
                            displayMainContent(notesArray[currentIndex]);
                        }
                    } else if (event.key === 'f' || event.key ==='F') {
                      toggleFullScreenMode();
                    }
                });

                // Initial display of sub-titles and main content
                displaySubTitles();

                //dark mode btn handle
                darkModeToggleBtn.addEventListener('click', () => {
                  if (darkMode == false) {
                    darkMode = true;
                  } else {
                    darkMode = false;
                  }
                  toggleDarkMode();
                })
                function toggleDarkMode() {
                  console.log("Toggle dark mode called", darkMode);
                  if (darkMode) {
                    document.getElementById('dark-mode-text').textContent = 'Light Mode';
                    document.documentElement.style.setProperty('--nav-bar-color', '#171717');
                    document.documentElement.style.setProperty('--black-text-color', '#e2e0e0');
                    document.documentElement.style.setProperty('--white-dark-btn', '#212121');
                    document.documentElement.style.setProperty('--secondary-white', '#0f0f0f');
                    document.documentElement.style.setProperty('--warm-white', '#1e1e1e');
                    document.documentElement.style.setProperty('--body-color', '#2e2e2e');
                    document.documentElement.style.setProperty('--sub-title-white-color', '#2b2b2b');
                    document.documentElement.style.setProperty('--dark-line', '#2a2a2a');
                    document.documentElement.style.setProperty('--primary-btn-color', '#1f1f1f');
                    document.documentElement.style.setProperty('--icon-color', '#e6e6e6');
                  } else {
                    document.getElementById('dark-mode-text').textContent = 'Dark Mode';
                    document.documentElement.style.setProperty('--nav-bar-color', '#eceae8');
                    document.documentElement.style.setProperty('--black-text-color', '#232222');
                    document.documentElement.style.setProperty('--white-dark-btn', '#e2e0e0');
                    document.documentElement.style.setProperty('--secondary-white', '#f9f9f9');
                    document.documentElement.style.setProperty('--warm-white', '#f9f3f3');
                    document.documentElement.style.setProperty('--body-color', '#f9f9f9');
                    document.documentElement.style.setProperty('--sub-title-white-color', '#eceae8');
                    document.documentElement.style.setProperty('--dark-line', '#b8b7b7');
                    document.documentElement.style.setProperty('--primary-btn-color', '#2294ed');
                    document.documentElement.style.setProperty('--icon-color', '#fbfbfb');
                  }
                }

                //function and listner for fullscreen change
                function toggleFullScreenMode() {
                  if (document.fullscreenElement == null) {
                    mainContent.requestFullscreen()
                    titleCard.classList.add('adjust-opacity-of-video-container');
                    setTimeout(() => {
                      titleCard.classList.remove('adjust-opacity-of-video-container');
                    }, 2000);
                  } else {
                      document.exitFullscreen()
                  }
                }
                document.addEventListener("fullscreenchange", () => {
                  mainContent.classList.toggle("full-screen", document.fullscreenElement)
                })
            });
        </script>
    </body>
    </html>
    `;

        // Download HTML file
        downloadHtmlFile(htmlContent, `${mainTitle}.html`);
    }

    // Function to download HTML file
    function downloadHtmlFile(content, filename) {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
});
