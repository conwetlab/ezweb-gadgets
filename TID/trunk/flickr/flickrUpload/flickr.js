
var Url = function(url) {
		var a =  document.createElement('a');
		a.href = url;
		this.source = url,
		this.protocol = a.protocol.replace(':',''),
		this.host = a.hostname,
		this.port = a.port,
		this.query = a.search,
		this.params = (function(){
			var ret = {},
			seg = a.search.replace(/^\?/,'').split('&'),
			len = seg.length, i = 0, s;
			for (;i<len;i++) {
				if (!seg[i]) { continue; }
				s = seg[i].split('=');
				ret[s[0]] = s[1];
			}
			return ret;
		})(),
		this.file = (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
		this.hash = a.hash.replace('#',''),
		this.path = a.pathname.replace(/^([^\/])/,'/$1'),
		this.relative = (a.href.match(/tp:\/\/[^\/]+(.+)/) || [,''])[1],
		this.segments = a.pathname.replace(/^\//,'').split('/')
};


flickr = {};

flickr.key = "ad270c9f342921cc4235a205e5974b64";
flickr.shared_secret = "d353aa51d1367150";

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
	return url + '&api_sig=' + this.signParams((new Url(url)).params);
};

flickr.restCall = function(method, params, onSuccess, onError) {
	var url = this.rest_url;
	url += "method=" + method + "&api_key=" + this.key + '&format=json&nojsoncallback=1';
	for(key in params)
		url += "&" + key + "=" + params[key]; 
	url = this.signUrl(url);

	EzWebAPI.send_get(url, this,
		function(resp) {
			var json = JSON.parse(resp.responseText);
			onSuccess(json);
		}, onError);
};


flickr.auth = {};

flickr.auth.getLoginURL = function(perms, frob){
	var url = flickr.auth_url;
	url += 'api_key=' + flickr.key + '&perms=' + perms;
	if (frob) url += '&frob=' + frob;
	return flickr.signUrl(url);
}

flickr.auth.getFrob = function(onSuccess, onError) {
	flickr.restCall('flickr.auth.getFrob', {}, onSuccess, onError);
};

flickr.auth.getToken = function(frob, onSuccess, onError) {
	var params = {frob: frob};
	flickr.restCall('flickr.auth.getToken', params, onSuccess, onError);
};
	
flickr.auth.checkToken = function(auth_token, onSuccess, onError) {
	var params = {auth_token: auth_token};
	flickr.restCall('flickr.auth.checkToken', params, onSuccess, onError);
};
