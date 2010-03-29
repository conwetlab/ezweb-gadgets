/* 
* This code is licensed under terms shown on this link:
* http://forge.morfeo-project.org/wiki/index.php/Gadgets_2009_License
*/
// bit.ly service (v2.0.1)
//////////////////////////
bitly = new Object();

// bit.ly variables
bitly.api_key = 'R_175608b2ce3e55646ae639ad593ee705';
bitly.login = 'ezweb';
bitly.message_shown = false;

bitly.shorten = function (url_, onSuccess_, onError_) {	
	var target_url = 'http://api.bit.ly/shorten?version=2.0.1&longUrl=' + encodeURI(url_) + '&login=' + bitly.login + '&apiKey=' + bitly.api_key;
	bitly.request (target_url, onSuccess_, onError_);
}

bitly.expand = function (url_, onSuccess_, onError_) {	
	var target_url = 'http://api.bit.ly/expand?version=2.0.1&shortUrl=' + encodeURI(url_) + '&login=' + bitly.login + '&apiKey=' + bitly.api_key;
	bitly.request (target_url, onSuccess_, onError_);
}

bitly.request = function (target_, onSuccess_, onError_) {	
	if (!bitly.api_key && !bitly.message_shown){
		notification.info(translator.getLabel('without_api_key'));
		bitly.message_shown = true;
		return;
	}
	if (!bitly.login && !bitly.message_shown){
		notification.info(translator.getLabel('without_api_key'));
		bitly.message_shown = true;
		return;
	}

	EzWebAPI.send_get(target_, this,
		function(resp) {
			var json = resp.responseText.evalJSON(true);
			onSuccess_(json);
		}, function(resp) {
			var json = resp.transport.responseText.evalJSON(true);
			onError_(json);
		}
	);
}