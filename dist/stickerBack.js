giphyKey = "dc6zaTOxFJmzC";
giphyHost = "http://api.giphy.com/v1/gifs/";

function searchGiphy(search){
	chrome.tabs.getSelected(null, function(tab){
		$.get(giphyHost + "search", { q: search, api_key:giphyKey})
			.done(function(data){
				chrome.tabs.sendMessage(tab.id, {type: "searchResult", result: data});
			});
	});
}

function randomGiphy(){
	chrome.tabs.getSelected(null, function(tab){
		$.get(giphyHost + "random", {api_key:giphyKey})
			.done(function(data){
				chrome.tabs.sendMessage(tab.id, {type: "randomResult", result: data});
			});
	});
}

function trendingGiphy(){
	chrome.tabs.getSelected(null, function(tab){
		$.get(giphyHost + "trending", {api_key:giphyKey})
			.done(function(data){
				chrome.tabs.sendMessage(tab.id, {type: "trendingResult", result: data});
			});
	});
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.type) {
        case "search":
        	searchGiphy(request.value);
  	        break;
  	    case "random":
  	    	randomGiphy();
  	    	break;
  	    case "trending":
  	    	trendingGiphy();
  	    	break;
    }
    return true;
});

