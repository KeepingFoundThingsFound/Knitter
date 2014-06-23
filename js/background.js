require(["ItemMirror"], function(ItemMirror){
'use strict'
var client = new Dropbox.Client({ key : "e87djjebo1o8vwe", sandbox:true});

var   dropboxXooMLUtility,
      dropboxItemUtility,
      mirrorSyncUtility,
      groupingItemURI,
      itemMirrorOptions,
      createAssociationOptions,
      createAssociationCase2Options;

	dropboxXooMLUtility = {
	  driverURI: "DropboxXooMLUtility",
	  dropboxClient: client
	};
	dropboxItemUtility = {
	  driverURI: "DropboxItemUtility",
	  dropboxClient: client
	};
	mirrorSyncUtility = {
	  utilityURI: "MirrorSyncUtility"
	};


	itemMirrorOptions = {
      1: {
        groupingItemURI: groupingItemURI,
        xooMLDriver: dropboxXooMLUtility,
        itemDriver: dropboxItemUtility
      },
      2: {
        groupingItemURI: groupingItemURI,
        xooMLDriver: dropboxXooMLUtility,
        itemDriver: dropboxItemUtility,
        syncDriver: mirrorSyncUtility,
        readIfExists: false
      },
      3: {
        groupingItemURI: groupingItemURI,
        xooMLDriver: dropboxXooMLUtility,
        itemDriver: dropboxItemUtility,
        syncDriver: mirrorSyncUtility,
        readIfExists: true
      }
    };


//ensure dropbox authentication
authenticate();

//add a listener to listen if the extension icon got clicked
chrome.browserAction.onClicked.addListener(function(tab){
	console.log('sending message to toggle sidebar to tab: %o', tab);
	var message = {
			authentication: 'true',
			action: 'toggleSidebar'
	};
	chrome.tabs.sendMessage(tab.id, message, logCallback);
});
//adds listener for messages passed from the website back to this script, such as search
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
	console.log('sender %o', sender);
	execute(msg, sender);	
});

function logCallback(resp){
		console.log('message returned with response %s', resp);	
}	

function authenticate() {
	client.authDriver(new Dropbox.AuthDriver.ChromeExtension({
		receiverPath: 'html/chrome_oauth_receiver.html'}));
	client.authenticate(function(error, client){
		if(error){throw error;}
		// constructNewItemMirror();
		console.log("Dropbox client authenticated.");
	});
}

function constructNewItemMirror(msg) {

	for(var key in msg.paths){
		var options = {
	        groupingItemURI: msg.paths[key],
	        xooMLDriver: dropboxXooMLUtility,
	        itemDriver: dropboxItemUtility,
	        syncDriver: mirrorSyncUtility,
	        readIfExists: true
	      }

		new ItemMirror(options, function (error, itemMirror) {
	        if (error) { throw error; }
	        console.log("itemMirror constructed at " + msg.paths[key]);
			createAssociation(itemMirror, msg);
		});		
	}

}


function execute(msg, sender) {
	console.log('msg: %o passed to background',msg);
	if(msg.action === 'search') {
		console.log('searching');
		findSomeFiles(msg.message, sender.tab);
	} else if(msg.action === "save") {
		constructNewItemMirror(msg);
		console.log("save msg " + msg);
		chrome.tabs.getSelected(null, function(tab){
		var message = {
	        		'action': 'saved'
	            	};
	        	chrome.tabs.sendMessage(tab.id, message, logCallback);
	        	console.log("send message to sidebar: " + message);
	    });

	}
}

//function to find files match a name pattern
function findSomeFiles(words, tab) {
	var resultSet = [];
	var wordSet = words.split(' ');
	var stopWords = ["a","able","about","across","after","all","almost","also","am","among","an","and","any","are","as","at","be","because","been","but","by","can","cannot","could","dear","did","do","does","either","else","ever","every","for","from","get","got","had","has","have","he","her","hers","him","his","how","however","i","if","in","into","is","it","its","just","least","let","like","likely","may","me","might","most","must","my","neither","no","nor","not","of","off","often","on","only","or","other","our","own","rather","said","say","says","she","should","since","so","some","than","that","the","their","them","then","there","these","they","this","tis","to","too","twas","us","wants","was","we","were","what","when","where","which","while","who","whom","why","will","with","would","yet","you","your"];
	//console.log("Before filter", wordSet);
	wordSet = wordSet.filter(function(x) { return stopWords.indexOf(x) < 0 });
	var searchCount = wordSet.length;
	//console.log("Filtered Word Set", wordSet);
	for(var key in wordSet) {
		var keyword = wordSet[key];
		client.findByName('/', keyword, {limit:100}, (function(keyword, resultSet, tab) {
			//closure to pass in resultSet correctly due to scope  
			return function(error, result){
				if(error === undefined || (error && error.status == 400)) {
					console.log("Error %o", error);
				} else { 
					console.log('found results: %o', result); 
					// resultSet.push(result);	
					
					filter(keyword, result, resultSet);

					searchCount-=1
					if(searchCount == 1) {
						var msg = {
						'action': 'searchResult',
						'message': resultSet
						}	
						chrome.tabs.sendMessage(tab.id, msg, logCallback);
					}
				}
			}
		})(keyword, resultSet, tab));
	}
}

function filter(keyword, result, resultSet) {
	for(var key in result) {
		var r = result[key];
		if(r.isFolder && r.name == keyword) {
			// var folderName = r.path.split("/").pop();
			resultSet.push(r.path);
		}
	}
}

function createAssociation(itemMirror, msg) {
	var savePaths = msg.message;
	var selectedText = msg.selectedText;
	chrome.tabs.getSelected(null, function(tab){
		var url = tab.url;
		createAssociationCase2Options = {
		    "displayText": msg.selectedText,
		    "itemURI": url
	   	};

	    itemMirror.createAssociation(createAssociationCase2Options, function(error, GUID) {
	        if (error) {
	            throw error;}
	        else { 
	        	console.log("file saved.");
	        }
	    });
	});

	}	

console.log('background.js loaded');

});