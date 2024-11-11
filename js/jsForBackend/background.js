// Function to save main title with mainTitle as the key
function saveMainTitleWithTitle(mainTitle, dateTime) {
    const mainTitleObj = {
        title: mainTitle,
        dateTime: dateTime,
        totalScreenShots: 1,
    };

    //getting all main titles
    chrome.storage.local.get(["mainTitles-lists"], (result) => {
        const mainTitleObjB = result["mainTitles-lists"] || [];
        const ind = findIndex(mainTitleObjB, mainTitle);
        if (ind == -1) {
            // Save main title empty to local storage
            mainTitleObjB.push(mainTitleObj);
        } else {
            mainTitleObjB[ind].totalScreenShots += 1;
        }
        // Save main title to local storage
        chrome.storage.local.set({ ["mainTitles-lists"]: mainTitleObjB }, () => {
            //console.log("Main title updated successfully. ", mainTitleObjB);
        });
    });

    
}
function findIndex(mainTitleObjB, mainTitle) {
    var ind = -1;
    mainTitleObjB.forEach((inMainTitle, index) => {
        if (inMainTitle.title == mainTitle) {
            ind = index;
        }
    });
    return ind;
}

// Function to save screenshot for a particular main title
function saveScreenshotWithTitle(mainTitle, dataUrl, title, videoLink) {
    // Get main title object from local storage
    saveMainTitleWithTitle(mainTitle, new Date().toLocaleString());
    chrome.storage.local.get([mainTitle], (result) => {
        const screenShotsObj = result[mainTitle] || [];
        //console.log("videoLink", videoLink);
        const finalVideoLink = videoLink || "0";

        // Add screenshot to main title object
        screenShotsObj.push({ url: dataUrl, title: title, videolink: finalVideoLink });

        // Update main title object in local storage
        chrome.storage.local.set({ [mainTitle]: screenShotsObj}, () => {
            //console.log("Screenshot saved successfully.", screenShotsObj);
        });
    });
}

// Function to take a screenshot
function takeScreenshot() {
    // Query the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        // Verify there is at least one active tab
        if (tabs.length === 0) {
            console.error("No active tab found.");
            return;
        }

        const activeTab = tabs[0];
        const titlrFromTab = activeTab.title || activeTab.url;

        // Capture the screenshot of the current tab
        chrome.tabs.captureVisibleTab(activeTab.windowId, { format: 'png' }, (dataUrl) => {
            if (chrome.runtime.lastError) {
                console.error("Error capturing screenshot:", chrome.runtime.lastError);
                return;
            }

            // Ensure the data URL is valid
            if (!dataUrl) {
                console.error("Failed to capture screenshot: Data URL is null.");
                return;
            }

            // Send a message to the content script in the active tab to get the title
            chrome.tabs.sendMessage(activeTab.id, { action: 'openNoteCard', dataUrl }, function(title) {
                if (!chrome.runtime.lastError) {
                    //console.log("Saving screenshot with title:", title);

                    // Send a message to the content script in the active tab to get the video title
                    chrome.tabs.sendMessage(activeTab.id, { action: 'getVideoTitle' }, function(receiverData) {
                        if (!chrome.runtime.lastError) {
                            // Use videoTitle if available, else use title
                            const videoTitle = receiverData.videoTitle;
                            const videoLink = receiverData.videoLink;
                            const mainTitle = videoTitle || titlrFromTab;
                            saveScreenshotWithTitle(mainTitle, dataUrl, title, videoLink);
                        } else {
                            console.log(chrome.runtime.lastError, "Error at line 51");
                        }
                    });
                } else {
                    console.log(chrome.runtime.lastError, "Error at line 59");
                }
            });
        });
    });
}

// Listen for the "take-screenshot" command
chrome.commands.onCommand.addListener((command) => {
    if (command === "take-screenshot") {
        takeScreenshot();
    }
});
