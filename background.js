chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
    id: "viewSavedTabs",
    title: "View saved tabs",
    contexts: ["action"]
  });
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "viewSavedTabs") {
    chrome.tabs.create({url: 'tablist.html'});
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'saveTab') {
    chrome.storage.local.get({savedTabs: [], archivedTabs: []}, function(result) {
      const savedTabs = result.savedTabs;
      savedTabs.push(request.tab);
      chrome.storage.local.set({savedTabs: savedTabs}, function() {
        sendResponse({success: true});
      });
    });
    return true;
  } else if (request.action === 'getTabs') {
    chrome.storage.local.get({savedTabs: []}, function(result) {
      sendResponse({tabs: result.savedTabs});
    });
    return true;
  } else if (request.action === 'getExistingTags') {
    chrome.storage.local.get({savedTabs: []}, function(result) {
      const allTags = new Set();
      result.savedTabs.forEach(tab => {
        tab.tags.forEach(tag => allTags.add(tag.toLowerCase()));
      });
      sendResponse({tags: Array.from(allTags)});
    });
    return true;
  } else if (request.action === 'archiveTab') {
    chrome.storage.local.get({savedTabs: [], archivedTabs: []}, function(result) {
      const savedTabs = result.savedTabs;
      const archivedTabs = result.archivedTabs;
      const tabToArchive = savedTabs.splice(request.index, 1)[0];
      archivedTabs.push(tabToArchive);
      chrome.storage.local.set({savedTabs: savedTabs, archivedTabs: archivedTabs}, function() {
        sendResponse({success: true});
      });
    });
    return true;
  } else if (request.action === 'getArchivedTabs') {
    chrome.storage.local.get({archivedTabs: []}, function(result) {
      sendResponse({tabs: result.archivedTabs});
    });
    return true;
  }
});

chrome.action.onClicked.addListener(function(tab) {
  chrome.tabs.create({url: 'tablist.html'});
});