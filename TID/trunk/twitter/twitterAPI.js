/* 
* This code is licensed under terms shown on this link:
* http://forge.morfeo-project.org/wiki/index.php/Gadgets_2009_License
*/

twitter = new Object();

twitter.account = new Object();

twitter.account.rate_limit_status = function (onSuccess_, onError_) {
	var target_url = 'http://twitter.com/account/rate_limit_status.json';
	send_request (target_url, 'GET', null, onSuccess_, onError_);
}

twitter.account.end_session = function (onSuccess_, onError_) {
	var target_url = 'http://twitter.com/account/end_session.json';
	send_request (target_url, 'POST', null, onSuccess_, show_http_error);	
}

twitter.statuses = new Object();

twitter.statuses.friends_timeline = function (onSuccess_, onError_) {
	var target_url = 'http://twitter.com/statuses/friends_timeline.json';
	send_request (target_url, 'GET', null, onSuccess_, onError_);
}

twitter.statuses.user_timeline = function (friend_, onSuccess_, onError_) {
	var target_url = 'http://twitter.com/statuses/user_timeline/' + friend_ + '.json?count=' + limit.get();	
	send_request (target_url, 'GET', null, onSuccess_, onError_);
}

twitter.statuses.update = function (message, onSuccess_, onError_) {
	var target_url = 'http://twitter.com/statuses/update.json';
	var params = {status : message} ;
	send_request (target_url, 'POST', params, onSuccess_ , onError_);
}

twitter.statuses.friends = function (onSuccess_, onError_) {
	var target_url = 'http://twitter.com/statuses/friends.json';
	send_request (target_url, 'GET', null, show_friends_info, show_http_error);
}

twitter.statuses.followers = function (onSuccess_, onError_) {	
	var target_url = 'http://twitter.com/statuses/followers.json';
	send_request (target_url, 'GET', null, onSuccess_, onError_);
}


// MY OWN SEND_GET/SEND_POST 
// (the request is sent to EzWeb by this method because the authentication field has been added to the HTTP headerS)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function send_request (url, method, parameters, success_handler, error_handler){
	if (method == 'POST' || method == 'PUT'){
		if (typeof(parameters) != "string") {
			var p = EzWebAPI.platform.Object.toJSON(parameters);
		} else {
	 		var p = parameters;
		}
		var proxy_params = {url: url, method: method, params: p};
	}else{
		var proxy_params = {url: url, method: method};
	}
	
	success_handler.bind = EzWebAPI.platform.Function.prototype.bind;
	error_handler.bind = EzWebAPI.platform.Function.prototype.bind;
	
	new EzWebAPI.platform.Ajax.Request(EzWebAPI.platform.URIs.PROXY, {
				method: 'post',
				parameters: proxy_params,
				requestHeaders: {'Authorization': authorization}, 
				onSuccess: success_handler.bind(this),
				onFailure: error_handler.bind(this),
				onException: error_handler.bind(this)
	});
}