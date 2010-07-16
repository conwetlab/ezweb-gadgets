/* 
* This code is licensed under terms shown on this link:
* http://forge.morfeo-project.org/wiki/index.php/Gadgets_2009_License
*/

var agent=navigator.userAgent;
var is_iphone = (agent.indexOf('iPhone')!=-1);

var urlimage = 'http://ezweb.tid.es/repository/ezweb-gadgets/twitter/twitter_3.4/images/';

var translator = null;

// EZWEB VARIABLES
///////////////////

var ezweb_login = EzWebAPI.createRGadgetVariable("ezweb_login", login_is_handler);
var limit = EzWebAPI.createRGadgetVariable("limit_messages", limit_messages_handler);
var input_to_msg = EzWebAPI.createRGadgetVariable("input_to_message", arrived_message_handler);
var auto_msg = EzWebAPI.createRGadgetVariable("auto_message", arrived_automessage_handler);
var incoming_events = EzWebAPI.createRGadgetVariable("incoming_events", function (value_){});
var draft_is = EzWebAPI.createRGadgetVariable("draft_is", function (value_){});
var bitly_user = EzWebAPI.createRGadgetVariable("bitly_user", bitly_user_handler);
var bitly_apikey = EzWebAPI.createRGadgetVariable("bitly_apikey", bitly_apikey_handler);
var bitly_is = EzWebAPI.createRGadgetVariable("bitly_is", function (value_){});
var oauth_consumer_key = EzWebAPI.createRGadgetVariable("oauth_consumer_key", function (value_){oauth_consumer_data_handler()});
var oauth_consumer_secret = EzWebAPI.createRGadgetVariable("oauth_consumer_secret", function (value_){oauth_consumer_data_handler()});

oauth_consumer_data_handler

var posted_msg = EzWebAPI.createRWGadgetVariable("last_posted_message");
var sent_message = EzWebAPI.createRWGadgetVariable("sent_message");

var user_screen_name = EzWebAPI.createRWGadgetVariable("user_screen_name");
var oauth_token = EzWebAPI.createRWGadgetVariable("oauth_token");
var oauth_token_secret = EzWebAPI.createRWGadgetVariable("oauth_token_secret");

var twitterauth = EzWebAPI.createRGadgetVariable("twitterauth", function (value_){});


// GADGET VARIABLES
////////////////////

var init_msg = '';
var current_friend = '';
var current_page = 1;
var current_msg = '';
var max_page = 1;
var all_messages = new Object(); 
var shortened_urls = [];
var notification = null;
var posted_msg_aux = '';
var temp_id = null;
var restart = false;
var known_rate = false;
var before_manual_login = ezweb_login.get() == 'no';

// EZWEB VARIABLE HANDLERS
///////////////////////////

function login_is_handler (value_) {
	restart_connection (value_);
}

function limit_messages_handler (next_limit) {
	
	var msgs_cont = document.getElementById('message_container');        
	
	if ((msgs_cont != undefined) && (document.getElementById('me_tab').className == 'tab current')){
		msgs_cont.innerHTML = '';
		
		current_page = 1;
		print_messages(msgs_cont);
	
		max_page = (all_messages.length - (all_messages.length % limit.get()))  / limit.get()
		if (all_messages.length % limit.get() != 0){
			max_page++;
		}
	
		var older_btn = document.getElementById('older_button');        
		if (current_page == max_page){
			older_btn.disabled=true;
			older_btn.className = 'disabled_button';
		} else{
			older_btn.disabled=false;
			older_btn.className = 'button';
		}
	
		var newer_btn = document.getElementById('newer_button');        
		newer_btn.disabled=true;
		newer_btn.className = 'disabled_button';

	} else {
		if (is_logged()){
			select_tab (getByClassName('div', 'tab current'));
		}
	}
	
}

function bitly_user_handler (value_) {
	if (value_ != ''){
		bitly.login = value_;
	}
}

function bitly_apikey_handler (value_) {
	if (value_ != ''){
		bitly.api_key = value_;
	}
}

function oauth_consumer_data_handler () {
	if (ezweb_login.get() == 'no')
		restart_connection();
}

// SIGN IN
///////////

function is_logged () {
	return (oauth.oauth_token != '') && (oauth.oauth_token_secret != '');
}

function auto_sign_in () {
	if (twitterauth.get() == ''){
		var content = document.getElementById('container');
		content.innerHTML = get_login_links(true, 'friends_tab');
		notification.info (translator.getLabel('no_auto_ezweb'));
	} else {
		var oauth_params = twitterauth.get().split ('&');
		for (var i=0; i<oauth_params.length; i++){
			var oauth_param = oauth_params[i].split ('=');
			switch (oauth_param[0]){
				case 'user_screen_name':
					oauth.screen_name = oauth_param[1];
					break;
				case 'oauth_consumer_key':
					oauth.oauth_consumer_key = oauth_param[1];
					break;
				case 'oauth_consumer_secret':
					oauth.oauth_consumer_secret = oauth_param[1];
					break;
				case 'oauth_token':
					oauth.oauth_token = oauth_param[1];
					break;
				case 'oauth_token_secret':
					oauth.oauth_token_secret = oauth_param[1];
					break;
				default:
					break;
			}
		}
		show_init_view();
	}
}

function user_sign_in () {
	oauth.oauth_consumer_key = oauth_consumer_key.get() != '' ? oauth_consumer_key.get() : oauth.CONSUMER_KEY;
	oauth.oauth_consumer_secret = oauth_consumer_secret.get() != '' ? oauth_consumer_secret.get() : oauth.CONSUMER_SECRET;
	lock_screen();
	oauth.sign_in (
		function (resp_){
			unlock_screen();
			show_init_view();
		}, 
		function (resp_){
			unlock_screen();
			notification.info(translator.getLabel('sign_in_error'));
		}
	);
}

function show_init_view () {
	document.getElementById('container').innerHTML = get_login_links(true);        
	twitter.account.rate_limit_status (get_rate_limit, show_http_error);
	select_tab(document.getElementById('me_tab'));
}

function restart_connection (change_user_){
	var pre_manual = change_user_ ? before_manual_login : ezweb_login.get() == 'no';
	if (is_logged()){
		if (pre_manual) {
			before_manual_login = change_user_ ? ezweb_login.get() == 'no' : before_manual_login;
			restart = true;
			sign_out();
			return;
		} else {
			disconnect();	
			notification.close();
			document.getElementById('container').innerHTML = get_login_links(false);        
			reset_login_info();
		}
	} 
	before_manual_login = change_user_ ? ezweb_login.get() == 'no' : before_manual_login;
	if (ezweb_login.get() == 'yes') { // Sign in using EzWeb user
		auto_sign_in();
	} else {						  // Sign in using Twitter user
		user_sign_in();
	}
}


// SIGN OUT
////////////

function sign_out () {
	disconnect();
	notification.close();
	document.getElementById('container').innerHTML = get_login_links(false);        
	if (is_logged()){
		lock_screen();
		twitter.account.end_session (sign_out_handler, show_http_error);
	}
}


function sign_out_handler (resp) {
	reset_login_info();
	unlock_screen();
	if (restart){
		restart = false;	
		if (ezweb_login.get() == 'yes') {
			auto_sign_in();
		} else {
			user_sign_in();
		}
	}
}

function reset_login_info (){
	user_screen_name.set('');
	oauth_token.set('');
	oauth_token_secret.set('');
	oauth.pin = '';
	oauth.screen_name = '';
	oauth.oauth_consumer_key = '';
	oauth.oauth_consumer_secret = '';
	oauth.oauth_token = '';
	oauth.oauth_token_secret = '';
	oauth.sign_in_success = '';
	oauth.sign_in_error = '';
}

// ERROR HANDLER
/////////////////

function show_http_error(res){
	unlock_screen();
	var msg = translator.getLabel('http_error');
	notification.error(msg);
	
	// Only for debug
	//alert (res.responseText);
}

function show_update_error(res){
	unlock_screen();
	var msg = translator.getLabel('update_error');
	notification.error(msg);
	
	// Only for debug
	//alert (res.responseText);
}

// GETS ALL MESSAGES (HOME PAGE)
////////////////////////////////

function get_messages (isUpdate_) {
	if (!isUpdate_){
		twitter.statuses.friends_timeline (show_messages, show_http_error);
	} else {
		twitter.statuses.friends_timeline (show_messages, show_update_error);
	}
}

function show_messages (resp) {
	var response = resp.responseText;
	all_messages = response.evalJSON();
	
	var content = document.getElementById('container');
	content.innerHTML = get_login_links(true, 'me_tab');
	
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
	
	// With EzWeb authentication, read-only mode is allowed
	if (ezweb_login.get() == 'no'){
		var header_text = document.createElement("h3");
		header_text.innerHTML = translator.getLabel('doing');
		content.appendChild(header_text);
	
		var textarea_cont = document.createElement("div");
		textarea_cont.id = 'status_container';
		content.appendChild(textarea_cont);	
	
		var msg_textarea = document.createElement("textarea");
		msg_textarea.id = 'status';
		msg_textarea.rows = '2';
		msg_textarea.cols = '50';
		msg_textarea.maxlength = '140';
		msg_textarea.onkeyup = check_message;	
	
		if (init_msg != ''){
			msg_textarea.value=init_msg;
			init_msg = '';	
		}
		textarea_cont.appendChild(msg_textarea);
	
		var button_cont = document.createElement("div");
		button_cont.className = 'button_cont';
		content.appendChild(button_cont);

		var clear_button = document.createElement("input");
		clear_button.className = 'button';
		clear_button.type = 'button';
		clear_button.onclick = clear_message;
		clear_button.value = translator.getLabel('clear');
		setMouseEvents (clear_button);
		button_cont.appendChild(clear_button);
		
		var update_button = document.createElement("input");
		update_button.className = 'disabled_button';
		update_button.id = 'update_button';
		update_button.type = 'button';
		update_button.disabled=true;
		update_button.value = translator.getLabel('update');
		update_button.onclick = update_edited_message;
		setMouseEvents (update_button);
		button_cont.appendChild(update_button);
	}
		
	var messages_container = document.createElement("div");
	messages_container.id = 'message_container';
	content.appendChild(messages_container);	
	
	print_messages (messages_container);
	
	var footer_cont = document.createElement("div");
	footer_cont.className = 'button_cont bottom';
	content.appendChild(footer_cont);	

	max_page = (all_messages.length - (all_messages.length % limit.get()))  / limit.get()
	if (all_messages.length % limit.get() != 0){
		max_page++;
	}
		
	var newer_button = document.createElement("input");
	newer_button.className = 'button';
	newer_button.id = 'newer_button';
	newer_button.type = 'button';
	newer_button.onclick = newer_pag;
	newer_button.value = '<< ' + translator.getLabel('newer');
	if (current_page == 1){
		newer_button.disabled=true;
		newer_button.className = 'disabled_button';
	}
	setMouseEvents (newer_button);
	footer_cont.appendChild(newer_button);

	var older_button = document.createElement("input");
	older_button.className = 'button';
	older_button.id = 'older_button';
	older_button.type = 'button';
	older_button.onclick = older_pag;
	older_button.value = translator.getLabel('older') + ' >>';
	if (current_page == max_page){
		older_button.disabled=true;
		older_button.className = 'disabled_button';
	}
	setMouseEvents (older_button);
	footer_cont.appendChild(older_button);
}

function print_messages (container){
	
	var limit_length = current_page * limit.get();	
	var max_length = (limit_length > all_messages.length) ? all_messages.length : limit_length;
	
	for (var i = (current_page - 1) * limit.get(); i < max_length; i++){
		var message_element = get_message_element(all_messages[i], true);
		if (i == (current_page - 1) * limit.get()){
			message_element.style.borderTop = "1px dashed #D2DADA";
		}
		container.appendChild(message_element);
	}

}

function get_message_element (message_object, with_avatar) {
	var message_content = document.createElement("div");
	message_content.className = 'message_container';
		
	var sender_bottom = document.createElement("div");
	message_content.appendChild(sender_bottom);
	sender_bottom.className = 'sender';
		
	var current_msg = replace_special_chars (message_object.text);
	var context = {msg: current_msg};
	
	var sender_img = document.createElement("img");
	sender_bottom.appendChild(sender_img);
	sender_img.src = urlimage + 'description.png';
	Event.observe(sender_img, "click",
	  function (ev) {
			Event.stop(ev);
			sent_message.set ( replace_html_entities( this.msg ));
   	}.bind(context));	
	
	var avatar_cont = document.createElement("div");
	message_content.appendChild(avatar_cont);
	avatar_cont.className = 'avatar';
		
	if (with_avatar){
		var avatar = document.createElement("img");
		avatar_cont.appendChild(avatar);
		avatar.className = 'avatar';
		avatar.src = message_object.user.profile_image_url;
	}
			
	var text_container = document.createElement("div");
	message_content.appendChild(text_container);
	text_container.className = 'message';

			
	var header_cont = document.createElement("span");
	text_container.appendChild(header_cont);
	header_cont.className = 'header';

	var created_date = null;
	if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)){ 
		created_date = new Date (message_object.created_at.substring(0,20) + message_object.created_at.substring(26));
	} else {
		created_date = new Date (message_object.created_at);
	}

	var header_text = translator.getLabel('written') + created_date.getDate() + '/' + (created_date.getMonth() + 1) + '/' + created_date.getFullYear() + ' ';
	header_text += translator.getLabel('alas') + created_date.getHours() + ':' + created_date.getMinutes() + ':' + created_date.getSeconds();
	header_text += ' ' + translator.getLabel('by') + ' ';
	header_cont.appendChild(document.createTextNode (header_text));
			
	var name_cont = document.createElement("span");
	header_cont.appendChild(name_cont);
	name_cont.className = 'name';
	var name_text = message_object.user.screen_name + ': ';
	name_cont.appendChild(document.createTextNode (name_text));
			
	header_cont.appendChild(document.createElement("br"));

	var msg_cont = document.createElement("span");
	text_container.appendChild(msg_cont);
	
	// Show chars or html entities -> chars
	msg_cont.innerHTML = replace_links (replace_html_entities(current_msg)) + ' ';
	if (message_object.truncated){
		var truncated_link = document.createElement("a");			
		truncated_link.target = '_blank';
		truncated_link.href = 'http://twitter.com/' + message_object.user.screen_name + '/status/' + message_object.id; 
		truncated_link.appendChild (document.createTextNode ('(...)'));
		text_container.appendChild(truncated_link);
	}
	
	return message_content;
}

// CHEACK THE MESSAGE
/////////////////////

function check_message () {
	var status_input = document.getElementById('status');
	if (!status_input){
		return;
	}
	if (status_input.value.length > 140){
		notification.sign(translator.getLabel('long_message_error'), 'long_message');
	} else {
		var replaced = replaces_from_message (status_input.value);
		if (replaced.length > 140) {
				notification.sign(translator.getLabel('long_message_error'), 'long_message');
		} else {
				notification.closeSign('long_message');
		}
	}
	toggle_update_button_state();
}

// SENDS THE NEW STATUS TO TWITTER
///////////////////////////////////

// Event from the platform (input-to-message)
function arrived_message_handler (message) {
	// With EzWeb authentication, read-only mode is allowed
	if (ezweb_login.get() == 'yes'){
		notification.info(translator.getLabel('read_mode'));
		return;
	}
	
	var nmessage = '';
	var input_elto = document.getElementById('status');
	
	// Checks where is the user ("me" tab?)
	if (!input_elto) {
		nmessage = init_msg;
	} else {
		nmessage = input_elto.value;
	}
	
	// Incoming events while draft is under edition
	if ((incoming_events.get() == 'discarded') && (nmessage != '')){
		return;	
	}
	
	switch (draft_is.get()) {

	case 'prefixed':
		if (nmessage == ''){
			nmessage = message;
		} else {
			nmessage = nmessage + ' ' + message;
		}
		break;

	case 'concatenated':
		if (nmessage == ''){
			nmessage = message;
		} else {
			nmessage = message + ' ' + nmessage;
		}
		break;
			
	default:
		nmessage = message;
		break;
	}
	
	// Writes the message
	if (!input_elto) {
		init_msg = nmessage;
	} else {
		input_elto.value = nmessage;
	}

	// Checks the message
	check_message();
}

// Event from the platform (auto-message)
function arrived_automessage_handler (message) {
	// With EzWeb authentication, only read mode is allowed
	if (ezweb_login.get() == 'yes'){
		notification.info(translator.getLabel('read_mode'));
		return;
	}
	
	var nmessage = '';
	var input_elto = document.getElementById('status');
	
	// Checks where is the user ("me" tab?)
	if (!input_elto) {
		nmessage = init_msg;
	} else {
		nmessage = input_elto.value;
	}

	// Incoming events while draft is under edition
	if ((incoming_events.get() == 'discarded') && (nmessage != '')){
		return;	
	}
	
	switch (draft_is.get()) {

	case 'prefixed':
		if (nmessage == '')
			nmessage = message;
		else
			nmessage = nmessage + ' ' + message;
		break;

	case 'concatenated':
		if (nmessage == '')
			nmessage = message;
		else
			nmessage = message + ' ' + nmessage;
		break;
			
	default:
		nmessage = message;
		break;
	}
	
	if (input_elto) {	
		input_elto.value = nmessage;
	}
	post_message(nmessage);

}

// The "update" button has been pressed
function update_edited_message (ev) {
	var status_input = document.getElementById('status');
	post_message(status_input.value);
}

function post_message (message) {
	try{
		
		aux_posted_msg = replace_special_chars(message);
		if (bitly_is.get() == 'yes') {
			// Search and shorten the URLs
			bitly.message_shown = false;
			shortened_urls = get_http_url_from(aux_posted_msg);
			if (shortened_urls.length != 0){
				for (var i=0; i<shortened_urls.length; i++){
					if (shortened_urls[i].indexOf('http://bit.ly/') != 0) {
						if (shortened_urls[i].indexOf('&') == -1) {
							bitly.shorten (shortened_urls[i], success_shortening, error_shortening);
						} else {
							error_shortening();
							shortened_urls = shortened_urls.without(shortened_urls[i]);
						}
					} else {
						shortened_urls = shortened_urls.without(shortened_urls[i]);
					}
				}
				
			} 
			
			// There are no more urls (neither shortened)
			if (shortened_urls.length == 0){
				twitter.statuses.update (aux_posted_msg, success_update , error_update);		
			}
			
		} else {
			// URLs will not be shortened
			twitter.statuses.update (aux_posted_msg, success_update , error_update);
		}
		
	} catch (e) {
	
		if (e == "Message too long"){
			notification.sign(translator.getLabel('long_message_error'), 'long_message');
			aux_posted_msg = '';
		}
	}
}

// Handlers for bit.ly service (to shorten URLs)
function success_shortening (json_) {
	if (json_.statusCode == 'ERROR'){
		return error_shortening (results.value.errorMessage);
	}
	
	var tmp_res = new Hash(json_.results);
	tmp_res.each(function(results) {
		if (results.value.statusCode && (results.value.statusCode == 'ERROR')){
			error_shortening ();
		} else {
			var pat = results.key.replace (/\?/g, '\\?');
			aux_posted_msg = aux_posted_msg.replace (new RegExp (pat, 'g'), results.value.shortUrl);
			if (results.key.indexOf('http://') == 0){
				aux_posted_msg = aux_posted_msg.replace (new RegExp (pat.substring(7), 'g'), results.value.shortUrl);
			}
		}
		shortened_urls = shortened_urls.without(results.key);
	});
	try {
		if (shortened_urls.length == 0){
			twitter.statuses.update (aux_posted_msg, success_update , error_update);		
		}
	} catch (e) {
		if (e == "Message too long"){
			notification.sign(translator.getLabel('long_message_error'), 'long_message');
			aux_posted_msg = '';
		}
	}		
}

function error_shortening (resp) {
	if (!bitly.message_shown){
		var msg = translator.getLabel('shorten_error');
		if (typeof (resp) == "string"){
			msg = translator.getLabel('error_from_bitly') + resp;
		}
		if ((typeof (resp) == "object") && resp.errorMessage){
			msg = translator.getLabel('error_from_bitly') + resp.errorMessage;
		}
		notification.error(msg);
		bitly.message_shown = true;
	}
}

// Handlers for Twitter service (posting)
function success_update (resp) {
	
	var response = resp.responseText;
	var current_message = response.evalJSON();

	// Checks if the message is duplicated
	for (var i = 0; i < all_messages.length; i++){
		if (all_messages[i].id === current_message.id){
			notification.info(translator.getLabel('duplicated_message_error'));
			return;
		}
	}
	
	clear_message();

	posted_msg.set(replace_html_entities( aux_posted_msg ));
	aux_posted_msg = '';
	
	current_page = 1;
	
	for (var j = all_messages.length; j != 0 ; j--){
		all_messages[j] = all_messages[j-1];
	}
	
	all_messages[0] = current_message;
	
	var msgs_cont = document.getElementById('message_container');        
	if (msgs_cont){
		msgs_cont.innerHTML = '';
		print_messages(msgs_cont);	
	}
}

function error_update (resp) {
	aux_posted_msg = '';
	notification.error(translator.getLabel('send_error'));
}

// GETS THE FRIEND/FOLLOWER MESSAGES
/////////////////////////////////////

function get_friend_messages (ev) {
	
	if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)){ // MSIE
		if ((current_friend != '') && (current_friend.id == ev.srcElement.parentNode.parentNode.id)){
			remove_friend_messages();
			current_friend = '';
			return;
		}
		current_friend = ev.srcElement.parentNode.parentNode;
	} else { 											// Firefox and others
		if ((current_friend != '') && (current_friend.id == ev.target.parentNode.parentNode.id)){
			remove_friend_messages();
			current_friend = '';
			return;
		}
		current_friend = ev.target.parentNode.parentNode;
	}
	
	var friend_name = current_friend.id.split('_')[1];
	twitter.statuses.user_timeline(friend_name, show_friend_messages, show_http_error);
}

function show_friend_messages (resp) {

	var response = resp.responseText;
	var objRes = response.evalJSON();

	remove_friend_messages ();
	
	var next_position = null;
	var append_message = current_friend.parentNode.lastChild.id == current_friend.id;
	if (!append_message){
		next_position = current_friend.nextSibling;
	}

	for (var i = 0; i < objRes.length; i++){
			
			var message_element = get_message_element(objRes[i], false);
			
			// Insert the message after the user
			if (append_message){
					current_friend.parentNode.appendChild(message_element);
			}else{
					current_friend.parentNode.insertBefore(message_element, next_position)
			}
	}
}

function remove_friend_messages () {

	// Removes old messages
	var message_container = document.getElementById('container');        
	var j = 0;
	while (j < message_container.childNodes.length){
		var current_message = message_container.childNodes[j];
		if ((current_message.id.split('_')[0] != 'user') && (current_message.id != 'link_container')){
			message_container.removeChild(current_message);
		}else{
			j++;
		}
	}
}


// GET THE FRIEND/FOLLOWER LIST
////////////////////////////////

function get_friends () {
	twitter.statuses.friends (show_friends_info, show_http_error);
}

function get_followers () {
	twitter.statuses.followers(show_friends_info, show_http_error);
}

function show_friends_info (resp) {
	
	var content = document.getElementById('container');
	content.innerHTML = get_login_links(true, 'friends_tab');
		
	var response = resp.responseText;
	var objRes = response.evalJSON();

	for (var i = 0; i < objRes.length; i++){
		var user_content = document.createElement("div");
		user_content.id = 'user_' + objRes[i].id;
		user_content.className = 'message_container';

		user_content.style.borderBottom = '1px dashed #97A0A8';
		if (i == 0){
			user_content.style.borderTop = '1px dashed #97A0A8';
		}
						
		var avatar_cont = document.createElement("div");
		user_content.appendChild(avatar_cont);
		avatar_cont.className = 'avatar';
			
		var avatar = document.createElement("img");
		avatar_cont.appendChild(avatar);
		avatar.className = 'avatar';
		avatar.src = objRes[i].profile_image_url;
			
		var text_container = document.createElement("div");
		user_content.appendChild(text_container);
		text_container.className = 'message';

		var name_cont = document.createElement("a");
		text_container.appendChild(name_cont);
		name_cont.className = 'friend';
		Event.observe(name_cont, "click", get_friend_messages);
		name_cont.href = "javascript:void(0)";
		name_cont.appendChild(document.createTextNode (objRes[i].screen_name));
			
		content.appendChild(user_content);
	}
}


// SHOWS THE TAB SELECTED BY THE USER
//////////////////////////////////////

function select_tab (next_tab, isUpdate_) {
	
	// Sets the current tab
	var current_tab = getByClassName('div', 'tab current');
	
	if (current_tab != null){
		current_tab.className = 'tab';
	}
	current_tab = next_tab;
	current_tab.className = 'tab current';
	
	// Restarts the state when a tab is selected
	current_friend = '';
	current_page = 1;
	max_page = 1;
	delete all_messages;
	all_messages = new Object();
	
	if (is_logged()){
		// Changes to the selected tab
		switch (current_tab.id){
			case 'me_tab':
				get_messages (isUpdate_);
				break;
			case 'friends_tab':
				get_friends ();
				break;
			default:
				get_followers();
				break;
		}
	}

}

// LOAD/UNLOAD HANDLERS
////////////////////////

function disconnect (){
	if (!is_logged())
		return;
	if (temp_id != null)
		clearInterval(temp_id);
}

function init (){
	// Initializes the gadget
	oauth.oauth_consumer_key = oauth_consumer_key.get() != '' ? oauth_consumer_key.get() : oauth.CONSUMER_KEY;
	oauth.oauth_consumer_secret = oauth_consumer_secret.get() != '' ? oauth_consumer_secret.get() : oauth.CONSUMER_SECRET;
	oauth.oauth_token = oauth_token.get();
	oauth.oauth_token_secret = oauth_token_secret.get();
	notification = notificationFrame();
	resize_height(); 
	if (is_logged()){
		show_init_view();
	} else if (ezweb_login.get() == 'yes'){
		auto_sign_in();
	} else {
		notification.info (translator.getLabel('begin'));
	}
}


// TRANSLATOR
//////////////

function generateLang(){
	translator = new EzWebExt.Translator(labels, "language");
	init();
	translator.translate();
}

// PERIODICAL UPDATE
/////////////////////

function get_rate_limit (resp){
	var response = resp.responseText;
	var rate_limit = response.evalJSON();
	
	var remaining_hits = parseInt(rate_limit['remaining_hits']);
	if (isNaN(remaining_hits)){
		remaining_hits = 50;
	}
	
	if (remaining_hits > 10){
		var time_interval = parseInt ((3600 / (remaining_hits * 0.2)) * 1000);
		temp_id = setInterval("update_messages()", time_interval); 
	} else {
		temp_id = null;
	}
}

function update_messages (){
	var current_tab = getByClassName('div', 'tab current');
	var status_input = document.getElementById('status');
	if ((current_tab.id == 'me_tab') && (status_input != null) && (status_input.value == '') && is_logged()) {
		select_tab(document.getElementById('me_tab'), true);
	}
}

// MY OWN GET_ELEMENT_BY_CLASSNAME 
// (not implement in Firefox 2.0)
//////////////////////////////////////////////////////////////////

function getByClassName (tag, classname) {
	
	var all_elements = document.getElementsByTagName(tag);
	for (var i = 0; i < all_elements.length ; i++){		
		if (all_elements[i].className == classname){
			return all_elements[i];				
		}
	}
}