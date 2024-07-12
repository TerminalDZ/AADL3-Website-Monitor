(function() {

	var websites_List = [];
	var hostname;

	chrome.storage.local.get(['websites_List'], function(value) {
		if (value.websites_List === undefined) {
			websites_List = [];
		} else {
			websites_List = value.websites_List;
		}
	});

	chrome.runtime.onMessage.addListener(function(request) {
		var text = request.text;
		chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
			var url = (new URL(tabs[0].url)).hostname;
			state(url, text);
			enableCopy(url, text, tabs[0].id);
		});
		if (text === 'delete-url') {
			deleteUrl(request.url); 
		}
	});

	chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
		if (changeInfo.status === 'complete') {
			getHostName(tab.url, tabId);
		}
	});

	function getHostName(url, tabId) {
		hostname = (new URL(url)).hostname;
		inject(tabId, hostname);
	}

	function state(url, text) {
		if (text === 'state') {
			if (websites_List.indexOf(url + '#c') !== -1) {
				chrome.runtime.sendMessage({
					c:'true'
				});
			}
			if (websites_List.indexOf(url + '#a') !== -1) {
				chrome.runtime.sendMessage({
					a:'true'
				});
			}
		}
	}

	function enableCopy(url, text, tabId) {
		if (text === 'c-true') {
			websites_List.push(url + '#c');
			inject(tabId, url);
			saveData();
		}
		if (text === 'c-false') {
			if (websites_List.indexOf(url + '#c') > -1) {
				deleteUrl(url + '#c');
				saveData();
			}
		}
		if (text === 'a-true') {
			websites_List.push(url + '#a');
			inject(tabId, url);
			saveData();
		}
		if (text === 'a-false') {
			if (websites_List.indexOf(url + '#a') > -1) {
				deleteUrl(url + '#a');
				saveData();
			}
		}
	}

	function inject(tabId, url) {
		if (url !== undefined && url !== null) {
			if (tabId !== undefined) {
				if (websites_List.indexOf(url + '#c') !== -1) {
					chrome.tabs.executeScript(tabId, {
						file: 'js/enable.js'
					}, function() {
						var checkError = chrome.runtime.lastError;
						if (checkError)
							console.log('Error::', 'url:', hostname, '- tabId:', tabId, '\n', JSON.stringify(checkError));
						}
					);
				}
				if (websites_List.indexOf(url + '#a') !== -1) {
					chrome.tabs.executeScript(tabId, {
						file: 'js/enableA.js',
						allFrames: true
					}, function() {
						var checkError = chrome.runtime.lastError;
						if (checkError)
							console.log('Error::', 'url:', hostname, '- tabId:', tabId, '\n', JSON.stringify(checkError));
						}
					);
				}
			}
		}
	}

	function deleteUrl(url) {
		var index = websites_List.indexOf(url);
		if (index !== -1) {
			websites_List.splice(index, 1);
			saveData();
		}
	}

	function saveData() {
		chrome.storage.local.set({
			'websites_List' : websites_List
		});
	}

})();