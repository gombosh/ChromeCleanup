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

      const CleanSearchStrings = stringsToSearch.filter(
        (str) => str !== "Empty"
      );

      chrome.tabs.query({}, (tabs) => {
        const tabsToClose = tabs.filter((tab) => {
          return CleanSearchStrings.some((searchString) =>
            tab.url.includes(searchString)
          );
        });

        const tabsClosedByExtension = tabsToClose.map((tab) => ({
          title: tab.title, // Set description as tab title (modify as needed)
          url: tab.url, // Save tab URL
        }));

        // Save the list of closed tabs in chrome.storage
        chrome.storage.sync.set({ closedTabsList: tabsClosedByExtension });

        tabsToClose.forEach((tab) => {
          chrome.tabs.remove(tab.id);
        });
      });
    });
  }
});
