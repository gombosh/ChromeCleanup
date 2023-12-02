// Description: This file is the background script for the extension. It is responsible for
//              listening for messages from the popup and content scripts and executing the
//              appropriate code.
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ stringsToSearch: [] });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "closeTabsMatchingStrings") {
    chrome.storage.sync.get("stringsToSearch", (data) => {
      const stringsToSearch = data.stringsToSearch || [];

      const CleanSearchStrings = stringsToSearch.filter((str) => str !== "Empty");

      chrome.tabs.query({}, (tabs) => {
        const tabsToClose = tabs
          .filter((tab) => {
            return CleanSearchStrings.some((searchString) =>
              tab.url.includes(searchString)
            );
          })
          .map((tab) => tab.id);

        chrome.tabs.remove(tabsToClose);
      });
    });
  }
});
