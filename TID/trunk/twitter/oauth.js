/* 
* This code is licensed under terms shown on this link:
* http://forge.morfeo-project.org/wiki/index.php/Gadgets_2009_License
*/

oauth = new Object();

oauth.CONSUMER_KEY = '0jDpWXdXH0Il7mk7rXEfAw';
oauth.CONSUMER_SECRET = 'b9aqFOUvMBjsPr86yKHI3GukvLmR15pIQPNLfIvyFc';
oauth.BASE_URL = 'https://api.twitter.com/oauth';

oauth.pin = '';
oauth.screen_name = '';
oauth.oauth_consumer_key = '';
oauth.oauth_consumer_secret = '';
oauth.oauth_token = '';
oauth.oauth_token_secret = '';
oauth.sign_in_success = null;
oauth.sign_in_error = null;

oauth.sign_in = function (onSuccess_, onError_){
	oauth.sign_in_success = onSuccess_;
	oauth.sign_in_error = onError_;
	this.request_token (
		function (resp_){
			if (resp_.responseText === ''){
				onError_();
				return;
			}
			var seg = resp_.responseText.split('&');
			if (seg.length < 1){
				onError_();
				return;
			}
			var res = $H();
			for (var i=0; i<seg.length; i++) {
				if (!seg[i]) 
					continue; 
				var s = seg[i].split('=');
				res[s[0]] = decodeURI(s[1]);	
			}
			if (!res['oauth_token'] || !res['oauth_token_secret']){
				onError_();
				return;
			}
			oauth.oauth_token = res['oauth_token'];
			oauth.oauth_token_secret = res['oauth_token_secret'];
			window.open(oauth.BASE_URL + '/authorize?oauth_token=' + oauth.oauth_token);
			unlock_screen();
			
			// Show the PIN input
			var content = document.getElementById('container');
			content.innerHTML = '';
			var header_text = document.createElement("h3");
			header_text.innerHTML = translator.getLabel('set_pin_message');
			content.appendChild(header_text);
			
			var msg_textarea = document.createElement("textarea");
			msg_textarea.id = 'pin';
			msg_textarea.rows = '1';
			msg_textarea.cols = '10';
			content.appendChild (msg_textarea);
			
			// Only for IE
			var setMouseEvents = function (elto) {
				if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)){ 
					Event.observe(elto, "mouseover",
						function (ev) {
							Event.stop(ev);
							ev.srcElement.className = 'button hover';
						}
					);	
					Event.observe(elto, "mouseout",
						function (ev) {
							Event.stop(ev);
							ev.srcElement.className = 'button';
						}
					);	
				}
			};
		
			var process_pin = function () {
				var pin = $('pin').value;
				if (pin === ''){
					notification.info(translator.getLabel('set_pin'));
					return;
				}
				oauth.pin = pin;
				lock_screen();
				oauth.access_token (
					function (resp_){
						if (resp_.responseText === ''){
							onError_();
							return;
						}
						var seg = resp_.responseText.split('&');
						if (seg.length < 1){
							onError_();
							return;
						}
						var res = $H();
						for (var i=0; i<seg.length; i++) {
							if (!seg[i]) 
								continue; 
							var s = seg[i].split('=');
							res[s[0]] = decodeURI(s[1]);	
						}
						if (!res['oauth_token'] || !res['oauth_token_secret'] || !res['screen_name']){
							onError_();
							return;
						}
						// The new ones
						oauth.oauth_token = res['oauth_token'];
						oauth.oauth_token_secret = res['oauth_token_secret'];
						// the user identifier
						oauth.screen_name = res['screen_name'];
						// Saves data						
						user_screen_name.set(res['screen_name']);
						oauth_token.set(res['oauth_token']);
						oauth_token_secret.set(res['oauth_token_secret']);
						// Continue
						oauth.sign_in_success(resp_);
					},
					function (resp_){
						oauth.sign_in_error(resp_);
					}
				);
				
				
			};
			
			var cancel_pin = function () {
				document.getElementById('container').innerHTML = get_login_links(false);        
			};
			
			var button_cont = document.createElement("div");
			button_cont.className = 'button_cont';
			content.appendChild(button_cont);
	
			var cancel_button = document.createElement("input");
			cancel_button.className = 'button';
			cancel_button.type = 'button';
			cancel_button.onclick = cancel_pin;
			cancel_button.value = translator.getLabel('cancel');
			setMouseEvents (cancel_button);
			button_cont.appendChild(cancel_button);
			
			var accept_button = document.createElement("input");
			accept_button.className = 'button';
			accept_button.type = 'button';
			accept_button.onclick = process_pin;
			accept_button.value = translator.getLabel('accept');
			setMouseEvents (accept_button);
			button_cont.appendChild(accept_button);
		}, 
		function (resp_){
			onError_(resp_);
		}
	);
};

oauth.request_token = function (onSuccess_, onError_){
	var target_url = oauth.BASE_URL + '/request_token';
	var params = {};
	var header = oauth.createAuthenticationHeader('GET', target_url, params);
	send_request (target_url, 'GET', null, header, onSuccess_, onError_);
};

oauth.authorize = function (onSuccess_, onError_){
	if (oauth.oauth_token === '')
		return;
	var target_url = oauth.BASE_URL + '/authorize?oauth_token=' + oauth.oauth_token;
	send_request (target_url, 'GET', null, null, onSuccess_, onError_);
};

oauth.access_token = function (onSuccess_, onError_){
	var target_url = oauth.BASE_URL + '/access_token';
	var params = {oauth_token: oauth.oauth_token, oauth_verifier: oauth.pin};
	var header = oauth.createAuthenticationHeader('GET', target_url, params);
	send_request (target_url, 'GET', null, header, onSuccess_, onError_);
};

oauth.createAuthenticationHeader = function (httpMethod_, url_, params_) {
	var oauth_nonce = Crypto.SHA1(new Date().getTime() + Math.random () + '');
	var oauth_timestamp = new Date().getTime().toString();
	var params = {
		oauth_consumer_key: oauth.oauth_consumer_key,
		oauth_nonce: oauth_nonce,
		oauth_signature_method: 'HMAC-SHA1',
		oauth_timestamp: oauth_timestamp,
		oauth_version: '1.0'
	};
	
	var normalized_params = '';
	if (params_){
		$H(params_).each(
			function(pair_) {
				params[pair_.key] = pair_.value;
				normalized_params += ', ' + pair_.key + '="' + pair_.value + '"';
			}
		);
	}
	
	var authorization = 'OAuth oauth_nonce="' + encodeURIComponent(params['oauth_nonce']) + '"';
	authorization += ', oauth_timestamp="' + encodeURIComponent(params['oauth_timestamp']) + '"';
	authorization += ', oauth_consumer_key="' + encodeURIComponent(params['oauth_consumer_key']) + '"';
	authorization += ', oauth_signature_method="HMAC-SHA1"';
	authorization += ', oauth_version="1.0"';
	authorization += normalized_params;
	authorization += ', oauth_signature="' + encodeURIComponent(this._createSignature(httpMethod_, url_, params)) + '"';
	return {'Authorization': authorization};
};

oauth.createAPIAuthenticationHeader = function (url_, httpMethod_, params_) {
	var params = {oauth_token: oauth.oauth_token};
	if (params_){
		$H(params_).each(
			function(pair_) {
				params[pair_.key] = pair_.value;
			}
		);
	}
	return oauth.createAuthenticationHeader(httpMethod_, url_, params);
};

oauth._sortParams = function (params_){
	var keys = $H(params_).keys().sort();
	var sorted = '';
	for (var i=0; i< keys.length; i++){
		sorted += encodeURIComponent(keys[i]) + '=' + encodeURIComponent(params_[keys[i]]);
		if (i!=(keys.length-1))
			sorted += '&';
	}
	return sorted;
};

oauth._createSignature = function (httpMethod_, url_, params_) {
	var signature_key = oauth.oauth_consumer_secret + '&' + oauth.oauth_token_secret;
	var signature_base_string = httpMethod_ + '&' + encodeURIComponent(url_) + '&' + encodeURIComponent(this._sortParams(params_));
	return Crypto.util.bytesToBase64(Crypto.HMAC(Crypto.SHA1, signature_base_string, signature_key, { asBytes: true }));
};