document.addEventListener("DOMContentLoaded", function () {
  // Function to open the extension's page on the Chrome Web Store
  const openExtensionPage = () => {
    chrome.tabs.create({
      url: "https://chrome.google.com/webstore/detail/your-extension-id",
    });
    // Replace 'your-extension-id' with your actual extension's ID from the Chrome Web Store
  };

  // Event listener for the help icon
  document
    .getElementById("helpButton")
    .addEventListener("click", openExtensionPage);

  function updateList() {
    chrome.storage.sync.get("stringsToSearch", (data) => {
      const stringsToSearch = data.stringsToSearch || [];
      const listElement = document.getElementById("list");

      if (stringsToSearch.length === 0) {
        listElement.innerHTML = "<li>Empty</li>";
      } else {
        listElement.innerHTML = "";

        stringsToSearch.forEach((string, index) => {
          const listItem = document.createElement("li");
          listItem.textContent = string;

          const removeIcon = document.createElement("span");
          removeIcon.textContent = "<remove>"; // Replace with your desired remove icon or text
          removeIcon.classList.add("remove-icon");
          listItem.appendChild(removeIcon);

          listItem.addEventListener("click", () => removeString(index));
          listElement.appendChild(listItem);
        });
      }
    });
  }

  function removeString(index) {
    chrome.storage.sync.get("stringsToSearch", (data) => {
      const stringsToSearch = data.stringsToSearch || [];
      stringsToSearch.splice(index, 1);

      chrome.storage.sync.set({ stringsToSearch: stringsToSearch }, () => {
        updateList();
      });
    });
  }

  // Add event delegation to handle clicks on list items
  document.getElementById("list").addEventListener("click", (event) => {
    if (event.target && event.target.nodeName === "LI") {
      event.target.classList.toggle("clicked");
      const index = Array.from(event.target.parentNode.children).indexOf(
        event.target
      );
      removeString(index);
    }
  });

  function addString() {
    const input = document.getElementById("newString");
    const newString = input.value.trim();

    if (newString !== "") {
      chrome.storage.sync.get("stringsToSearch", (data) => {
        const stringsToSearch = data.stringsToSearch || [];
        stringsToSearch.push(newString);

        chrome.storage.sync.set({ stringsToSearch: stringsToSearch }, () => {
          input.value = "";
          updateList();
        });
      });
    }
  }

  function createRestoreButton(tab) {
    const button = document.createElement("button");
    button.textContent = "Restore";
    button.classList.add("restore-button");
    button.dataset.url = tab.url;

    button.addEventListener("click", function () {
      restoreTab(tab.url);
    });

    return button;
  }

  // Function to handle opening the recently closed tabs window
  function openRecentlyClosedWindow() {
    chrome.sessions.getRecentlyClosed({ maxResults: 10 }, (sessions) => {
      const closedTabs = sessions.filter((session) => session.tab);

      const closedTabsURLs = closedTabs.map((tab) => {
        return {
          url: tab.tab.url,
          title: tab.tab.title,
        };
      });

      const popup = window.open(
        "",
        "Recently Closed Tabs",
        "width=400,height=400"
      );

      if (popup) {
        popup.document.write(
          "<html><head><title>Recently Closed Tabs</title></head><body>"
        );
        popup.document.write("<h1>Recently Closed Tabs</h1>");

        if (closedTabsURLs.length > 0) {
          closedTabsURLs.forEach((tab) => {
            popup.document.write(`<p>${tab.url} - ${tab.title}</p>`);
            const restoreButton = createRestoreButton(tab);
            popup.document.body.appendChild(restoreButton);
          });
        } else {
          popup.document.write("<p>No recently closed tabs found.</p>");
        }

        popup.document.write("</body></html>");
        popup.document.close();
      }
    });
  }

  // Function to restore the closed tab
  function restoreTab(url) {
    chrome.sessions.restore(null, () => {
      // Handle restoration success
    });
  }

  // Event listener for the recently closed tabs button
  document
    .getElementById("recentlyClosedButton")
    .addEventListener("click", openRecentlyClosedWindow);

  // Event listener for the "Add" button
  document.getElementById("addButton").addEventListener("click", addString);
  // Event listener for the "Enter" key press
  document
    .getElementById("newString")
    .addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        addString();
      }
    });
  // Event listener for the "Close Tabs" button
  document.getElementById("closeTabsButton").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "closeTabsMatchingStrings" });
  });

  updateList();
});
