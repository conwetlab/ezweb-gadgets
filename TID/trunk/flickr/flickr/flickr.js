/* 
* This code is licensed under terms shown on this link:
* http://forge.morfeo-project.org/wiki/index.php/Gadgets_2009_License
*/

var Url = function(url) {
		var getParams = function(decode){
			var ret = {},
			seg = a.search.replace(/^\?/,'').split('&'),
			len = seg.length, i = 0, s;
			for (;i<len;i++) {
				if (!seg[i]) { continue; }
				s = seg[i].split('=');
				if (!decode){
					ret[s[0]] = s[1];	
				}else{
					ret[s[0]] = decodeURI(s[1]);	
				}
			}
			return ret;
		};
		var a =  document.createElement('a');
		a.href = url;
		this.source = url;
		this.protocol = a.protocol.replace(':','');
		this.host = a.hostname;
		this.port = a.port;
		this.query = a.search;
		this.params = getParams();
		this.file = (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1];
		this.hash = a.hash.replace('#','');
		this.path = a.pathname.replace(/^([^\/])/,'/$1');
		this.relative = (a.href.match(/tp:\/\/[^\/]+(.+)/) || [,''])[1];
		this.segments = a.pathname.replace(/^\//,'').split('/');
};


flickr = {};


flickr.key = "bc168255f0c0106b5d0207adc4f3c614";
//flickr.key = "ad270c9f342921cc4235a205e5974b64";
//flickr.key = "3eafb24b0d5aa817d52f45a27ee4f334";

flickr.shared_secret = "274492d273165be0";
//flickr.shared_secret = "d353aa51d1367150";
//flickr.shared_secret = "fcde12f1d5a1c39d";

flickr.auth_url = 'http://flickr.com/services/auth/?';
flickr.rest_url = 'http://flickr.com/services/rest/?';

flickr.signParams = function(params) {
	var keys = [];
	for (var key in params)
		keys.push(key);
	keys.sort();
	var sign = this.shared_secret;
	for (var key in keys)
		sign += keys[key]+params[keys[key]];
	return MD5(sign);
};


flickr.signUrl = function(url) {
	return encodeURI(url) + '&api_sig=' + this.signParams((new Url(url)).params);

};

flickr.restCall = function(method, httpMethod, params, onSuccess, onError) {
	var url = this.rest_url;
	var reqParams = "method=" + method + "&api_key=" + this.key + '&format=json&nojsoncallback=1';
	for(key in params)
		reqParams += "&" + key + "=" + params[key]; 
	url = this.signUrl(url + reqParams);
	
	if (httpMethod ==  'GET'){
		EzWebAPI.send_get(url, this,
			function(resp) {
				var json = JSON.parse(resp.responseText);
				onSuccess(json);
			}, onError);
	} else {
		EzWebAPI.send_post(this.rest_url.split('?')[0], (new Url(url)).params, this,
			function(resp) {
				var json = JSON.parse(resp.responseText);
				onSuccess(json);
			}, onError);
	}
};

flickr.noSignedRestCall = function(method, httpMethod, params, onSuccess, onError) {
	var url = this.rest_url;

	params["method"] = method;
	params["api_key"] = this.key;
	params["format"] = 'json';
	params["nojsoncallback"] = '1';

	if (httpMethod ==  'GET'){

		for(key in params){
			url += key + "=" + params[key] + "&"; 
		}
		
		url = encodeURI(url.substr(0, url.length-1));
		EzWebAPI.send_get(url, this,
			function(resp) {
				var json = JSON.parse(resp.responseText);
				onSuccess(json);
			}, onError);

	} else {

		url = encodeURI(url.substr(0, url.length-1));
		EzWebAPI.send_post(url, params, this,
			function(resp) {
				var json = JSON.parse(resp.responseText);
				onSuccess(json);
			}, onError);

	}
};

flickr.auth = {};

flickr.auth.getLoginURL = function(perms, frob){
	var url = flickr.auth_url;
	url += 'api_key=' + flickr.key + '&perms=' + perms;
	if (frob) url += '&frob=' + frob;
	return flickr.signUrl(url);
};

flickr.auth.getFrob = function(onSuccess, onError) {
	flickr.restCall('flickr.auth.getFrob', 'GET', {}, onSuccess, onError);
};

flickr.auth.getToken = function(frob, onSuccess, onError) {
	var params = {frob: frob};
	flickr.restCall('flickr.auth.getToken', 'GET', params, onSuccess, onError);
};
	
flickr.auth.checkToken = function(auth_token, onSuccess, onError) {
	var params = {auth_token: auth_token};
	flickr.restCall('flickr.auth.checkToken', 'GET', params, onSuccess, onError);
};


flickr.photos = {};

flickr.photos.getMyPhotos = function(onSuccess, onError) {
	var params = {auth_token: auth_token.get()};
	flickr.restCall('flickr.photos.getNotInSet', 'GET', params, onSuccess, onError);

};

flickr.photos.search = function(photoKey, peopleKey, groupKey, onSuccess, onError) {
	var params = new Object();
	params.machine_tag_mode = 'any';
	params.extras = 'url_sq,url_o';
	if (photoKey){
		params.tags = photoKey;
	}
	if (peopleKey){
		params.user_id = peopleKey;
	}
	if (groupKey){
		params.group_id = groupKey;
	}

	if (isPublicAccess()) {
		flickr.noSignedRestCall('flickr.photos.search', 'GET', params, onSuccess, onError);
	} else {
		params.auth_token = auth_token.get();
		flickr.restCall('flickr.photos.search', 'GET', params, onSuccess, onError);
	}
};

flickr.photos.deletePhoto = function(id_, onSuccess_, onError_) {
	var params = {auth_token: auth_token.get(), photo_id: id_};
	flickr.restCall('flickr.photos.delete', 'POST', params, onSuccess_, onError_);
};

flickr.people = {};

flickr.people.getInfo = function(id_, onSuccess_, onError_) {
	var params = {user_id: id_};
	flickr.noSignedRestCall('flickr.people.getInfo', 'GET', params, onSuccess_, onError_);
};

flickr.people.findByUsername = function(username_, onSuccess_, onError_) {
	var params = {username: username_};
	flickr.noSignedRestCall('flickr.people.findByUsername', 'GET', params, onSuccess_, onError_);
};

flickr.people.findByEmail = function(email_, onSuccess_, onError_) {
	var params = {find_email: email_};
	flickr.noSignedRestCall('flickr.people.findByEmail', 'GET', params, onSuccess_, onError_);
};

flickr.people.getPublicPhotos = function(id_, onSuccess_, onError_) {
	var params = {user_id: id_};
	flickr.noSignedRestCall('flickr.people.getPublicPhotos', 'GET', params, onSuccess_, onError_);
};

flickr.groups = {};

flickr.groups.search = function(groupKey_, onSuccess_, onError_) {
	var params = {text: groupKey_};	
	if (isPublicAccess()) {
		flickr.noSignedRestCall('flickr.groups.search', 'GET', params, onSuccess_, onError_);
	} else {
		params.auth_token = auth_token.get();		
		flickr.restCall('flickr.groups.search', 'GET', params, onSuccess_, onError_);
	}
}



