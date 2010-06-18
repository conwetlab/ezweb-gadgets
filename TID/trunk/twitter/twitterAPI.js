/* 
* This code is licensed under terms shown on this link:
* http://forge.morfeo-project.org/wiki/index.php/Gadgets_2009_License
*/

twitter = new Object();

twitter.account = new Object();

twitter.account.rate_limit_status = function (onSuccess_, onError_) {
	var target_url = 'http://twitter.com/account/rate_limit_status.json';
	var header = oauth.createAPIAuthenticationHeader(target_url, 'GET', null);
	send_request (target_url, 'GET', null, header, onSuccess_, onError_);
}

twitter.account.end_session = function (onSuccess_, onError_) {
	var target_url = 'http://twitter.com/account/end_session.json';
	var header = oauth.createAPIAuthenticationHeader(target_url, 'POST', null);
	send_request (target_url, 'POST', null, header, onSuccess_, show_http_error);	
}

twitter.statuses = new Object();

twitter.statuses.friends_timeline = function (onSuccess_, onError_) {
	var target_url = 'http://twitter.com/statuses/friends_timeline.json';
	var header = oauth.createAPIAuthenticationHeader(target_url, 'GET', null);
	send_request (target_url, 'GET', null, header, onSuccess_, onError_);
}

twitter.statuses.user_timeline = function (friend_, onSuccess_, onError_) {
	var target_url = 'http://twitter.com/statuses/user_timeline/' + friend_ + '.json?count=' + limit.get();	
	var params = {count: limit.get()};
	var header = oauth.createAPIAuthenticationHeader(target_url, 'GET', params);
	send_request (target_url, 'GET', null, header, onSuccess_, onError_);
}

twitter.statuses.update = function (message, onSuccess_, onError_) {
	if (message.length > 140){
		throw "Message too long";
	}
	var target_url = 'http://twitter.com/statuses/update.json';
	var params = {status : message};
	var header = oauth.createAPIAuthenticationHeader(target_url, 'POST', params);
	send_request (target_url, 'POST', params, header, onSuccess_ , onError_);
}

twitter.statuses.friends = function (onSuccess_, onError_) {
	var target_url = 'http://twitter.com/statuses/friends.json';
	var header = oauth.createAPIAuthenticationHeader(target_url, 'GET', null);
	send_request (target_url, 'GET', null, header, show_friends_info, show_http_error);
}

twitter.statuses.followers = function (onSuccess_, onError_) {	
	var target_url = 'http://twitter.com/statuses/followers.json';
	var header = oauth.createAPIAuthenticationHeader(target_url, 'GET', null);
	send_request (target_url, 'GET', null, header, onSuccess_, onError_);
}

// MY OWN SEND_GET/SEND_POST 
// (the request is sent to EzWeb by this method because the authentication field has been added to the HTTP headerS)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function send_request (url_, method_, parameters_, headers_, success_handler_, error_handler_){
	if (method_ == 'POST' || method_ == 'PUT'){
		if (typeof(parameters_) != "string") {
			var p = EzWebAPI.platform.Object.toJSON(parameters_);
		} else {
	 		var p = parameters_;
		}
		var proxy_params = {url: url_, method: method_, params: p};
	}else{
		var proxy_params = {url: url_, method: method_};
	}
	
	success_handler_.bind = EzWebAPI.platform.Function.prototype.bind;
	error_handler_.bind = EzWebAPI.platform.Function.prototype.bind;
	
	new EzWebAPI.platform.Ajax.Request(EzWebAPI.platform.URIs.PROXY, {
		method_: 'post',
		parameters: proxy_params,
		requestHeaders: headers_,
		onSuccess: success_handler_.bind(this),
		onFailure: error_handler_.bind(this),
		onException: error_handler_.bind(this)
	});
}
