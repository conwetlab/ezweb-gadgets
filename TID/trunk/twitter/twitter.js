/* 
* This code is licensed under terms shown on this link:
* http://forge.morfeo-project.org/wiki/index.php/Gadgets_2009_License
*/

var agent=navigator.userAgent;
var is_iphone = (agent.indexOf('iPhone')!=-1);

var urlimage = 'http://ezweb.tid.es/repository/ezweb-gadgets/twitter/twitter_3.0/images/';


// EZWEB VARIABLES
///////////////////

var twitter_user = EzWebAPI.createRGadgetVariable("twitter_user", twitter_user_handler);
var twitter_pass = EzWebAPI.createRGadgetVariable("twitter_pass", twitter_pass_handler);
var limit = EzWebAPI.createRGadgetVariable("limit_messages", limit_messages_handler);
var input_to_msg = EzWebAPI.createRGadgetVariable("input_to_message", arrived_message_handler);
var auto_msg = EzWebAPI.createRGadgetVariable("auto_message", arrived_automessage_handler);
var incoming_events = EzWebAPI.createRGadgetVariable("incoming_events", incoming_events_handler);
var draft_is = EzWebAPI.createRGadgetVariable("draft_is", draft_is_handler);
var posted_msg = EzWebAPI.createRWGadgetVariable("last_posted_message");
var sent_message = EzWebAPI.createRWGadgetVariable("sent_message");


// GADGET VARIABLES
////////////////////

var authorization = '';
var init_msg = '';
var current_friend = '';
var current_page = 1;
var max_page = 1;
var all_messages = new Object(); 
var posted_msg_aux = '';
var temp_id = null;
var restart = false;

// EZWEB VARIABLE HANDLERS
///////////////////////////

function twitter_user_handler (user) {
	restart_connection();
}

function twitter_pass_handler (pass) {
	restart_connection();
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
		if (sign_in()){
			select_tab (getByClassName('div', 'tab current'));
		}
	}
	
}

function incoming_events_handler (inc) {
}

function draft_is_handler (dra) {
}


// SIGN IN
///////////

function sign_in () {
	
	close_notification();
	

	if (authorization == ''){
		if (twitter_user.get() == '')	{
			
			var msg = 'Please, set your username in Twitter using the preferences.'
			show_notification (msg);
			
			return false;
		}
		
		if (twitter_pass.get() == '') {

			var msg = 'Please, set your password in Twitter using the preferences.'
			show_notification (msg);

			return false;
		}
		
		authorization = 'Basic ' + Base64.encode(twitter_user.get() + ':' + twitter_pass.get());
		
		document.getElementById('log_out').style.display = 'block';
		document.getElementById('sign_in').style.display = 'none';
		
		var target_url = 'http://twitter.com/account/rate_limit_status.json';
		send_request (target_url, 'GET', null, get_rate_limit, show_http_error);
		
	}

	return true;
	
}

function get_login_links (visible_logout){

	var html = '<div id="link_container">\n';
	if (visible_logout){
		html += '<a id="log_out" class="right" style="display: block;" href="javascript:void(0)" onclick="sign_out()">log out</a>';
		html += '<a id="sign_in" class="right" style="display: none;" href="javascript:void(0)" onclick="restart_connection()">sign in</a>';
	} else {
		html += '<a id="log_out" class="right" style="display: none;" href="javascript:void(0)" onclick="sign_out()">log out</a>';
		html += '<a id="sign_in" class="right" style="display: block;" href="javascript:void(0)" onclick="restart_connection()">sign in</a>';
	}
	html += '</div>';

	return html;
					
}


function restart_connection (){
	
	if (authorization == ''){
		if (sign_in()){
			select_tab (getByClassName('div', 'tab current'));
		}
	} else {
		restart = true;
		sign_out();
	}
}


// SIGN OUT
////////////

function sign_out () {
	
	close_notification();
	
	document.getElementById('container').innerHTML = get_login_links(false);        
	
	document.getElementById('log_out').style.display = 'none';
	document.getElementById('sign_in').style.display = 'block';
	
	if (authorization != ''){
		var target_url = 'http://twitter.com/account/end_session.json';
		send_request (target_url, 'POST', null, sign_out_handler, show_http_error);
	}
}


function sign_out_handler (resp) {

	authorization = '';
	
	if (restart && sign_in()){
		restart = false;
		select_tab (getByClassName('div', 'tab current'));
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


// ERROR HANDLER
/////////////////

function show_http_error(res){
	var msg = 'Sorry, an error has ocurried and now we cannot send your request.</br>Please, sign in again and try it again...';
	show_error(msg);
	
	// Only for debug
	//alert (res.responseText);
}

function show_update_error(res){
	var msg = 'Sorry, the Twitter service is temporarily unavailable. Automatic updates have been disabled.';
	show_error(msg);
	
	setTimeout("close_notification()",10000);
	
	// Only for debug
	//alert (res.responseText);
}

function show_duplicated_message_error(){
	var msg = 'Sorry, the sent message is duplicated. The message has not been posted.';
	show_error(msg);
	
	setTimeout("close_notification()",10000);
	
	// Only for debug
	//alert (res.responseText);
}

function show_error(msg){
	show_notification(msg);
	
	if (temp_id != null)
		clearInterval(temp_id);
}

// GETS ALL MESSAGES (HOME PAGE)
////////////////////////////////

function get_messages (isUpdate_) {
	var target_url = 'http://twitter.com/statuses/friends_timeline.json';
	if (!isUpdate_){
		send_request (target_url, 'GET', null, show_messages, show_http_error);
	} else {
		send_request (target_url, 'GET', null, show_messages, show_update_error);
	}
}

function show_messages (resp) {
	
	var response = resp.responseText;
	all_messages = eval ('(' + response + ')');
	
	var content = document.getElementById('container');
	content.innerHTML = get_login_links(true);
	
	var header_text = document.createElement("h3");
	header_text.appendChild(document.createTextNode('What are you doing?'));
	content.appendChild(header_text);
	
	var textarea_cont = document.createElement("div");
	content.appendChild(textarea_cont);	
	
	var msg_textarea = document.createElement("textarea");
	msg_textarea.id = 'status';
	msg_textarea.rows = '2';
	msg_textarea.cols = '50';
	msg_textarea.maxlength = '140';
	msg_textarea.onkeyup = change_update_button_state;	
	
	if (init_msg != ''){
		msg_textarea.value=init_msg;
		init_msg = '';
	}
	textarea_cont.appendChild(msg_textarea);
	
	var bottom_cont = document.createElement("div");
	bottom_cont.className = 'bottom_cont';
	content.appendChild(bottom_cont);
	
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
	
	var clear_button = document.createElement("input");
	clear_button.className = 'button';
	clear_button.type = 'button';
	clear_button.onclick = clear_message;
	clear_button.value = 'Clear';
	setMouseEvents (clear_button);
	bottom_cont.appendChild(clear_button);
	
	var update_button = document.createElement("input");
	update_button.className = 'disabled_button';
	update_button.id = 'update_button';
	update_button.type = 'button';
	update_button.disabled=true;
	update_button.value = 'Update';
	update_button.onclick = update_edited_message;
	setMouseEvents (update_button);
	bottom_cont.appendChild(update_button);
	
	var messages_container = document.createElement("div");
	messages_container.id = 'message_container';
	content.appendChild(messages_container);	
	
	print_messages (messages_container);
	
	var footer_cont = document.createElement("div");
	footer_cont.className = 'bottom_cont';
	//footer_cont.style.paddingBottom = '10px';
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
	newer_button.value = '<< Newer';
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
	older_button.value = 'Older >>';
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

	var header_text = 'Written on ' + created_date.getDate() + '/' + (created_date.getMonth() + 1) + '/' + created_date.getFullYear() + ' ';
	header_text += created_date.getHours() + ':' + created_date.getMinutes() + ':' + created_date.getSeconds();
	header_text += ' by '
	header_cont.appendChild(document.createTextNode (header_text));
			
	var name_cont = document.createElement("span");
	header_cont.appendChild(name_cont);
	name_cont.className = 'name';
	var name_text = message_object.user.screen_name + ': ';
	name_cont.appendChild(document.createTextNode (name_text));
			
	header_cont.appendChild(document.createElement("br"));

	var msg_cont = document.createElement("span");
	text_container.appendChild(msg_cont);
	
	msg_cont.innerHTML = replace_links (current_msg) + ' ';
	if (message_object.truncated){
		var truncated_link = document.createElement("a");			
		truncated_link.target = '_blank';
		truncated_link.href = 'http://twitter.com/' + message_object.user.screen_name + '/status/' + message_object.id; 
		truncated_link.appendChild (document.createTextNode ('(...)'));
		text_container.appendChild(truncated_link);
	}
	
	return message_content;
}

// CLEAR THE MESSAGE
/////////////////////

function clear_message (){
	document.getElementById('status').value = '';
	change_update_button_state();	
}


// CHANGE UPDATE BUTTON STATE
//////////////////////////////

function change_update_button_state (){
	var update_button = document.getElementById('update_button');
	var status_input = document.getElementById('status');
	
	if (status_input.value == ''){
		update_button.disabled=true;
		update_button.className = 'disabled_button';	
	} else {
		update_button.disabled=false;
		update_button.className = 'button';	
		if (status_input.value.length > 140){
			status_input.value = status_input.value.substr(0, 140);
		}
	}
}


// SENDS THE NEW STATUS TO TWITTER
///////////////////////////////////

// Event from the platform (input-to-message)
function arrived_message_handler (message) {
	if (incoming_events.get() == 'discarded'){
		return;	
	}
	
	try	{

		var input_elto = document.getElementById('status');
		
		switch (draft_is.get()) {

		case 'prefixed':
			if (input_elto.value == '')
				input_elto.value = message;
			else
				input_elto.value = input_elto.value + ' ' + message;
			break;

		case 'concatenated':
			if (input_elto.value == '')
				input_elto.value = message;
			else
				input_elto.value = message + ' ' + input_elto.value;
			break;
			
		default:
			input_elto.value = message;
			break;
		}

	} catch(err) {
		init_msg = message;
	}
}

// Event from the platform (auto-message)
function arrived_automessage_handler (message) {
	if (incoming_events.get() == 'discarded'){
		return;	
	}
	
	try	{

		var input_elto = document.getElementById('status');
		if (input_elto.value == ''){
			return;
		}
		
		var nmessage = '';
		
		switch (draft_is.get()) {

		case 'prefixed':
			if (input_elto.value == '')
				nmessage = message;
			else
				nmessage = input_elto.value + ' ' + message;
			break;

		case 'concatenated':
			if (input_elto.value == '')
				nmessage = message;
			else
				nmessage = message + ' ' + input_elto.value;
			break;
			
		default:
			nmessage = message;
			break;
		}
		
		input_elto.value = nmessage;
		post_message(nmessage);

	} catch(err) {}
}

// The "update" button has been pressed
function update_edited_message (ev) {
	var status_input = document.getElementById('status');
	post_message(status_input.value);
}

function post_message (message) {
	aux_posted_msg = message;
	var url = 'http://twitter.com/statuses/update.json';
	var params = {status : replace_special_chars (message.substr(0, 140))} ;
	send_request (url, 'POST', params, success_update , error_update);
}

function success_update (resp) {
	
	clear_message();
	
	var response = resp.responseText;
	var current_message = eval ('(' + response + ')');

	// Checks if the message is duplicated
	for (var i = 0; i < all_messages.length; i++){
		if (all_messages[i].id === current_message.id){
			show_duplicated_message_error();
			return;
		}
	}
	
	posted_msg.set(replace_html_entities( aux_posted_msg ));
	aux_posted_msg = '';
	
	var msgs_cont = document.getElementById('message_container');        
	msgs_cont.innerHTML = '';

	current_page = 1;
	
	for (var j = all_messages.length; j != 0 ; j--){
		all_messages[j] = all_messages[j-1];
	}
	
	all_messages[0] = current_message;
	
	print_messages(msgs_cont);
	
}

function error_update (resp) {
	aux_posted_msg = '';
	
	var msg = 'Sorry, we cannot send your request, check what could be wrong in your message (too long, strange characters, ...)';
	show_notification(msg);        

}


// PAGINATION HANDLERS
///////////////////////

function older_pag (){
	var msgs_cont = document.getElementById('message_container');        
	msgs_cont.innerHTML = '';

	current_page++;
	print_messages(msgs_cont);
	
	var older_btn = document.getElementById('older_button');        
	if (current_page == max_page){
		older_btn.disabled=true;
		older_btn.className = 'disabled_button';
	} else {
		older_btn.disabled=false;
		older_btn.className = 'button';
	}
	
	var newer_btn = document.getElementById('newer_button');        
	if (current_page == 1){
		newer_btn.disabled=true;
		newer_btn.className = 'disabled_button';
	} else {
		newer_btn.disabled=false;
		newer_btn.className = 'button';
	}

}

function newer_pag (){
	
	var msgs_cont = document.getElementById('message_container');        
	msgs_cont.innerHTML = '';
		
	current_page--;
	print_messages(msgs_cont);
	
	var older_btn = document.getElementById('older_button');        
	if (current_page == max_page){
		older_btn.disabled=true;
		older_btn.className = 'disabled_button';
	} else{
		older_btn.disabled=false;
		older_btn.className = 'button';
	}
	
	var newer_btn = document.getElementById('newer_button');        
	if (current_page == 1){
		newer_btn.disabled=true;
		newer_btn.className = 'disabled_button';
	} else {
		newer_btn.disabled=false;
		newer_btn.className = 'button';
	}
	
}


// GETS THE FRIEND/FOLLOWER MESSAGES
/////////////////////////////////////

function get_friend_messages (event) {
	
	if (current_friend.id == event.target.parentNode.parentNode.id){
		remove_friend_messages();
		current_friend = '';
		return;
	}
	
	current_friend = event.target.parentNode.parentNode;
	var friend_name = current_friend.id.split('_')[1];
	var target_url = 'http://twitter.com/statuses/user_timeline/' + friend_name + '.json?count=' + limit.get();	
	send_request (target_url, 'GET', null, show_friend_messages, show_http_error);
}

function show_friend_messages (resp) {

	var response = resp.responseText;
	var objRes = eval ('(' + response + ')');

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
		if (current_message.id.split('_')[0] != 'user'){
			message_container.removeChild(current_message);
		}else{
			j++;
		}
	}
}


// GET THE FRIEND/FOLLOWER LIST
////////////////////////////////

function get_friends () {
	var target_url = 'http://twitter.com/statuses/friends.json';
	send_request (target_url, 'GET', null, show_friends_info, show_http_error);
}


function get_followers () {
	var target_url = 'http://twitter.com/statuses/followers.json';
	send_request (target_url, 'GET', null, show_friends_info, show_http_error);
}

function show_friends_info (resp) {
	
	var content = document.getElementById('container');
	content.innerHTML = get_login_links(true);
		
	var response = resp.responseText;
	var objRes = eval ('(' + response + ')');

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
		name_cont.onclick = get_friend_messages;
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
	
	if (authorization != ''){
		// Changes to the selected tab
		if (current_tab.id == 'me_tab'){
			get_messages (isUpdate_);
		} else if (current_tab.id == 'friends_tab'){  
			get_friends ();
		} else{
			get_followers();
		}		
	}

}


// RESIZE THE INTERFACE
////////////////////////

function resize_height (){
	if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)){ 
		// IE
		document.getElementById('container').style.height = window.frameElement.getHeight() - 34 + "px";
		document.getElementById('container').style.width  = window.frameElement.getWidth()  - 10 + "px";
	} else {
		// Firefox and others	
		var round = 30;
		if (document.getElementById('container').offsetTop == 0){
			round += 30;
		}
		document.getElementById('container').style.height = (window.frameElement.getHeight() - document.getElementById('container').offsetTop  - round) + "px";	
	}
}


// HTML HANDLERS
/////////////////

function close_notification (){ 
	document.getElementById('not_message').innerHTML = '';        
	document.getElementById('notifications').style.display = 'none';        
	resize_height();
}

function show_notification (msg){ 
	document.getElementById('not_message').innerHTML = msg;        
	document.getElementById('notifications').style.display = 'block'; 
	resize_height();
}

// LOAD/UNLOAD HANDLERS
////////////////////////

onunload = function (){
	
	if (temp_id != null)
		clearInterval(temp_id);
		
	sign_out();
}

onload = function (){
	resize_height(); 
	if (sign_in()) {
		select_tab(document.getElementById('me_tab'));
	}
}

// PERIODICAL UPDATE
/////////////////////

function get_rate_limit (resp){
	var response = resp.responseText;
	var rate_limit = eval ('(' + response + ')');
	
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
	if (sign_in() && (current_tab.id == 'me_tab') && (status_input != null) && (status_input.value == '')) {
		select_tab(document.getElementById('me_tab'), true);
	}
}
