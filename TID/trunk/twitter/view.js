/* 
* This code is licensed under terms shown on this link:
* http://forge.morfeo-project.org/wiki/index.php/Gadgets_2009_License
*/

function get_login_links (visible_logout, tab_){
	if (ezweb_login.get() == 'yes')
		return '';
	
	var style_aux = '';
	
	switch (tab_){
		case 'friends_tab':
		case 'followers_tab':
			style_aux += 'height:10px;'
			break;
		default:
			break;
	}

	var html = '<div id="link_container" style="' + style_aux + '">\n';
	if (visible_logout){
		html += '<a id="log_out" class="right" style="display: block;" href="javascript:void(0)" onclick="sign_out()">' + translator.getLabel('log_out') + '</a>';
		html += '<a id="sign_in" class="right" style="display: none;" href="javascript:void(0)" onclick="restart_connection()">' + translator.getLabel('sign_in') + '</a>';
	} else {
		html += '<a id="log_out" class="right" style="display: none;" href="javascript:void(0)" onclick="sign_out()">' + translator.getLabel('log_out') + '</a>';
		html += '<a id="sign_in" class="right" style="display: block;" href="javascript:void(0)" onclick="restart_connection()">' + translator.getLabel('sign_in') + '</a>';
	}
	html += '</div>';

	return html;
					
}

// CLEAR THE MESSAGE
/////////////////////

function clear_message (){
	var st = document.getElementById('status');
	if (!st){
		init_msg = '';
	} else {
		st.value = '';
		check_message();
	}
}

// CHANGE UPDATE BUTTON STATE
//////////////////////////////

function toggle_update_button_state (){
	var update_button = document.getElementById('update_button');
	var status_input = document.getElementById('status');
	
	if ((status_input.value.length == 0) || (notification.code == 'long_message')){
		if (!update_button.disabled){
			update_button.disabled = true;
			update_button.className = 'disabled_button';	
		}
	} else {
		if (update_button.disabled){
			update_button.disabled = false;
			update_button.className = 'button';	
		}
	}
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

// RESIZE THE INTERFACE
////////////////////////

function resize_height (ev){
	if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)){ 
		// IE
		document.getElementById('container').style.height = window.frameElement.getHeight() - 34 + "px";
		document.getElementById('container').style.width  = window.frameElement.getWidth()  - 10 + "px";
	} else if (/Chrome/.test(navigator.userAgent) && /Google/.test(navigator.vendor)){ 
		// Chrome (if the "container" size is modified, an infinite loop will be caused
		if (ev){
			Event.stop(ev);
		}
	} else {
		// Firefox and others	
		var round = 20;
		if (document.getElementById('container').offsetTop == 0){
			round += 20;
		}
		if (window.frameElement){
			document.getElementById('container').style.height = (window.frameElement.getHeight() - document.getElementById('container').offsetTop  - round) + "px";	
		}
	}
}

// NOTIFICATIONS
/////////////////

function notificationFrame () {
	var notif = document.getElementById('notifications');         
	notif.timer = '';
	notif.level = '';
	notif.code = '';
	
	notif.close = function (){ 
		this.timer = '';
		this.level = '';
		this.code = '';
		this.style.display = 'none';
		var nm = document.getElementById('not_message');
		if (nm){
			nm.innerHTML = '';
		}
		resize_height();
	};

	notif.show = function (msg){ 
		this.stopTimer();
		this.style.display = 'block'; 
		document.getElementById('not_message').innerHTML = msg;        
		resize_height();
	};
	
	// User information (always shown)
	notif.sign = function (msg, code){
		if ((this.code === code) || (this.level == 'error')){
			return;
		}
		this.close();
		
		this.code = code;
		this.level = 'info';
		this.closeOff();
		this.show(msg);
	};
	
	// Remove user information
	notif.closeSign = function (code){
		if ((this.code === code) && (this.level == 'info')){
			this.close();
		}
	};	
	
	
	// User information, it is closed automaticaly
	notif.info = function (msg){
		if (this.level == 'error'){
			return;
		}
		this.close();
		
		this.level = 'info';
		this.closeOff();
		this.show(msg);

		this.timer = setTimeout("notification.close()",10000);
	};
	
	// Fatal error
	notif.error = function (msg){
		// Stops notification timer
		this.stopTimer();
		this.close();

		// Stops updates
		if (temp_id != null){
			clearInterval(temp_id);
		}

		this.level = 'error';
		this.closeOn();
		this.show(msg);
	};		
		
	// Activates close button
	notif.closeOn = function (msg){
		document.getElementById('close_not').style.display = 'block';
	};
		
	// Desactivates close button
	notif.closeOff = function (msg){
		document.getElementById('close_not').style.display = 'none';	
	};

	// Stops notification timer
	notif.stopTimer = function (){
		if (this.timer !== ''){
			clearInterval(this.timer);
			this.timer = '';
		}
	};
	
	return notif;

}

function close_notification () {
	notification.close();
}

function lock_screen () {
	document.getElementById('loading').style.display = 'block';
}

function unlock_screen () {
	document.getElementById('loading').style.display = 'none';
}