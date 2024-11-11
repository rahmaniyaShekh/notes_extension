document.addEventListener("DOMContentLoaded", () => {
    // Retrieve and display main titles from storage
    //getting all main titles
    chrome.storage.local.get(["mainTitles-lists"], (result) => {
        const mainTitleObjB = result["mainTitles-lists"] || [];
        console.log("mainTitleObjB", mainTitleObjB);
        const mainTitlesList = document.getElementById("main-titles-list");
        const mainTitleEmptyView = document.getElementById("main-title-empty");
        // List each main title
        if (mainTitleObjB.length != 0) {
            mainTitleEmptyView.style.display = "none";
            mainTitleObjB.forEach((mainTitle, index) => {
                console.log("mainTitle", mainTitle);
                console.log("index", index);
                const mainTitleItem = document.createElement("div");
                mainTitleItem.className = 'item-list-main';
                let innerTextUnde = `<div class="item-list">
    
                    <div class="item-text">${mainTitle.title}</div>
                    <div class="item-details">
                        <div class="item-date-time text-color-black">${mainTitle.dateTime}</div>
                        <div class="item-total-screen-shots text-color-black">Total Screenshot: ${mainTitle.totalScreenShots}</div>
                    </div>
                    
                </div>
                <div class="dark-line"></div>`;
                mainTitleItem.innerHTML = innerTextUnde;
                mainTitleItem.addEventListener("click", () => openNotesPage(mainTitle.title));
                mainTitlesList.appendChild(mainTitleItem);
            });
        }
    });
  });
  
  function openNotesPage(mainTitle) {
    // Open notes.html in a new tab, passing the main title as a query parameter
    chrome.tabs.create({ url: chrome.runtime.getURL(`note.html?mainTitle=${encodeURIComponent(mainTitle)}`) });
  }
  