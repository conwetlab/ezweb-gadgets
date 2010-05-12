/* 
* This code is licensed under terms shown on this link:
* http://forge.morfeo-project.org/wiki/index.php/Gadgets_2009_License
*/

/*** Flickr service ***/
flickr = new Object();

/*** Flickr parameters ***/
flickr.AUTH_URL = 'http://flickr.com/services/auth/?';
flickr.REST_URL = 'http://flickr.com/services/rest/?';
flickr.API_KEY = "bc168255f0c0106b5d0207adc4f3c614";
flickr.SHARED_SECRET = "274492d273165be0";

/*** Flickr util methods ***/
flickr.signParams = function(params) {
	var keys = params.keys().sort();
	var sign = this.SHARED_SECRET;
	for (var i=0; i< keys.length; i++){
		sign += keys[i]+params[keys[i]];
	}
	return MD5(sign);
};

flickr.signUrl = function(url) {
	return encodeURI(url) + '&api_sig=' + this.signParams((new Util.Url(url)).params);
};

/*** Flickr requests ***/
flickr.restCall = function(method, httpMethod, params, onSuccess, onError) {
	var url = this.REST_URL;
	var reqParams = "method=" + method + "&api_key=" + this.API_KEY + '&format=json&nojsoncallback=1';
	params.each(
		function(pair) {
			reqParams += "&" + pair.key + "=" + pair.value;
		}
	);
	url = this.signUrl(url + reqParams);
	if (httpMethod ==  'GET'){
		EzWebAPI.send_get(url, this,
			function(resp) {
				var json = JSON.parse(resp.responseText);
				onSuccess(json);
			}, onError);
	} else {
		EzWebAPI.send_post(this.REST_URL.split('?')[0], (new Util.Url(url)).params, this,
			function(resp) {
				var json = JSON.parse(resp.responseText);
				onSuccess(json);
			}, onError);
	}
};

flickr.noSignedRestCall = function(method, httpMethod, params, onSuccess, onError) {
	var url = this.REST_URL;
	params["method"] = method;
	params["api_key"] = this.API_KEY;
	params["format"] = 'json';
	params["nojsoncallback"] = '1';
	if (httpMethod ==  'GET'){
		params.each(
			function(pair) {
		  		url += pair.key + "=" + pair.value + "&";
			}
		);
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

/*** Flickr authentication ***/
flickr.auth = new Object();

flickr.auth.getLoginURL = function(perms, frob){
	var url = flickr.AUTH_URL;
	url += 'api_key=' + flickr.API_KEY + '&perms=' + perms;
	if (frob) url += '&frob=' + frob;
	return flickr.signUrl(url);
};

flickr.auth.getFrob = function(onSuccess, onError) {
	flickr.restCall('flickr.auth.getFrob', 'GET', $H(), onSuccess, onError);
};

flickr.auth.getToken = function(frob, onSuccess, onError) {
	var params = $H({frob: frob});
	flickr.restCall('flickr.auth.getToken', 'GET', params, onSuccess, onError);
};
	
flickr.auth.checkToken = function(auth_token, onSuccess, onError) {
	var params = $H({auth_token: auth_token});
	flickr.restCall('flickr.auth.checkToken', 'GET', params, onSuccess, onError);
};

/*** Access to Flickr photos ***/
flickr.photos = {};

flickr.photos.getContactsPhotos = function(onSuccess, onError) {
	var params = $H({
		auth_token: FlickrAuthFactory.getInstance().getAuthToken(),
		count: photosRec.get() > 50 ? 50 : photosRec.get()
	});
	flickr.restCall('flickr.photos.getContactsPhotos', 'GET', params, onSuccess, onError);
};

flickr.photos.search = function(photoKey, peopleKey, groupKey, onSuccess, onError) {
	var auth = FlickrAuthFactory.getInstance();
	var params = $H({machine_tag_mode: 'any', per_page: photosRec.get()});
	if (photoKey){
		params['tags'] = photoKey;
	}
	if (peopleKey){
		params['user_id'] = peopleKey;
	}
	if (groupKey){
		params['group_id'] = groupKey;
	}
	if (auth.isPublicAccess()) {
		flickr.noSignedRestCall('flickr.photos.search', 'GET', params, onSuccess, onError);
	} else {
		params.auth_token = auth.getAuthToken();
		flickr.restCall('flickr.photos.search', 'GET', params, onSuccess, onError);
	}
};

flickr.photos.deletePhoto = function(id_, onSuccess_, onError_) {
	var params = $H({auth_token: FlickrAuthFactory.getInstance().getAuthToken(), photo_id: id_});
	flickr.restCall('flickr.photos.delete', 'POST', params, onSuccess_, onError_);
};

/*** Access to Flickr contacts ***/
flickr.contacts = {};

flickr.contacts.getList = function(onSuccess_, onError_) {
	var params = $H({auth_token: FlickrAuthFactory.getInstance().getAuthToken()});
	flickr.restCall('flickr.contacts.getList', 'GET', params, onSuccess_, onError_);
};

/*** Access to Flickr users ***/
flickr.people = {};

flickr.people.getInfo = function(id_, onSuccess_, onError_) {
	var params = $H({user_id: id_});
	flickr.noSignedRestCall('flickr.people.getInfo', 'GET', params, onSuccess_, onError_);
};

flickr.people.findByUsername = function(username_, onSuccess_, onError_) {
	var params = $H({username: username_});
	flickr.noSignedRestCall('flickr.people.findByUsername', 'GET', params, onSuccess_, onError_);
};

flickr.people.findByEmail = function(email_, onSuccess_, onError_) {
	var params = $H({find_email: email_});
	flickr.noSignedRestCall('flickr.people.findByEmail', 'GET', params, onSuccess_, onError_);
};

flickr.people.getPublicPhotos = function(id_, onSuccess_, onError_) {
	var params = $H({user_id: id_});
	flickr.noSignedRestCall('flickr.people.getPublicPhotos', 'GET', params, onSuccess_, onError_);
};

flickr.people.getMyPhotos = function(onSuccess, onError) {
	var params = $H({
		auth_token: FlickrAuthFactory.getInstance().getAuthToken(),
		user_id: 'me'
	});
	flickr.restCall('flickr.people.getPhotos', 'GET', params, onSuccess, onError);
};

flickr.people.getContactPhotos = function(contact_, onSuccess, onError) {
	var params = $H({
		auth_token: FlickrAuthFactory.getInstance().getAuthToken(),
		user_id: contact_
	});
	flickr.restCall('flickr.people.getPhotos', 'GET', params, onSuccess, onError);
};

flickr.people.getUserPhotos = function(user, onSuccess, onError) {
	var params = $H({
		auth_token: FlickrAuthFactory.getInstance().getAuthToken(),
		user_id: user
	});
	flickr.restCall('flickr.people.getPhotos', 'GET', params, onSuccess, onError);
};

/*** Access to Flickr groups ***/
flickr.groups = {};

flickr.groups.search = function(groupKey_, onSuccess_, onError_) {
	var auth = FlickrAuthFactory.getInstance();
	var params = $H({text: groupKey_});	
	if (auth.isPublicAccess()) {
		flickr.noSignedRestCall('flickr.groups.search', 'GET', params, onSuccess_, onError_);
	} else {
		params.auth_token = auth.getAuthToken();		
		flickr.restCall('flickr.groups.search', 'GET', params, onSuccess_, onError_);
	}
};