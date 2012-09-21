var tabs = [];

chrome.browserAction.onClicked.addListener(function (tab) {
	if(!tabs[tab.id]) {
		chrome.tabs.insertCSS(
      tab.id, {file: "css/guidelines.css"}
	  );

	  chrome.tabs.executeScript(
	      tab.id, {file: "js/guidelines.js"}
	  );

	  tabs[tab.id] = true;
	} else {
		chrome.tabs.sendMessage(tab.id, {action: "toggle"});
	}
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
		if(tabs[tabId]) {
			tabs[tabId] = undefined;
		}
});

chrome.tabs.onUpdated.addListener(function(tabId, updateInfo) {
		if(tabs[tabId]) {
			tabs[tabId] = undefined;
		}
});