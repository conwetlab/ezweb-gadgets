/////////////////////////////////////////////
////////// Class ClienteCorreo //////////////
/////////////////////////////////////////////

var ClienteCorreo = function() {
	/* Call to the parent constructor */
	EzWebGadget.call(this, {translatable: false, useWidthVar: true});
}

ClienteCorreo.prototype = new EzWebGadget(); /* Extend from EzWebGadget */

/******************** OVERWRITE METHODS **************************/

ClienteCorreo.prototype.init = function() {
	// Constants
	this.MULTIPLE_CALLS         = false; // Si vale false, se realiza una única petición para solocitar al servidor la información asociada a cada uno directorio (llamada más pesada)
	                                     // Si vale true, se realiza una petición por directorio (más sobrecarga en red, pero van llegando los resultado progresivamente)
	this.MAIN_ALTERNATIVE       = 0;
    this.SEND_ALTERNATIVE       = 1;
	this.CONFIG_ALTERNATIVE     = 2;

	this.MAIN_TAB               = 1;
	this.INTERVAL_SIZE          = 20;
	
    // Initialize EzWeb variables
    this.accountsProp = EzWebAPI.createRWGadgetVariable('accounts');
    
    this.mailproxyPref = EzWebAPI.createRGadgetVariable('mailproxy', EzWebExt.bind(this.setMailproxyURL, this));
    this.webdavPref = EzWebAPI.createRGadgetVariable('webdav', EzWebExt.bind(this.setWebdavURL, this));
    this.webdavDirPref = EzWebAPI.createRGadgetVariable('webdav_dir', EzWebExt.bind(this.setWebdavDirectory, this));
    this.refreshTimePref = EzWebAPI.createRGadgetVariable('refresh_time', EzWebExt.bind(this.setRefreshTime, this));
    
    this.languageCtx = language;
    
    this.messageSlot = EzWebAPI.createRGadgetVariable('emailDetails', EzWebExt.bind(this.showMessageFromSlot, this));
    this.mailsSlot = EzWebAPI.createRGadgetVariable('emails', EzWebExt.bind(this.sendEmailsSlot, this));
    this.subjectSlot = EzWebAPI.createRGadgetVariable('subject', EzWebExt.bind(this.sendSubjectSlot, this));
    this.textSlot = EzWebAPI.createRGadgetVariable('text', EzWebExt.bind(this.sendTextSlot, this));
    this.attachSlot = EzWebAPI.createRGadgetVariable('attach', EzWebExt.bind(this.sendAttachSlot, this));
    
    this.fromEvent = EzWebAPI.createRWGadgetVariable('fromEvent');
    this.recipientsEvent = EzWebAPI.createRWGadgetVariable('recipientsEvent');
    this.subjectEvent = EzWebAPI.createRWGadgetVariable('subjectEvent');
    this.textEvent = EzWebAPI.createRWGadgetVariable('textEvent');
    this.dateEvent = EzWebAPI.createRWGadgetVariable('dateEvent');
    this.sizeEvent = EzWebAPI.createRWGadgetVariable('sizeEvent');
    this.hasAttachmentsEvent = EzWebAPI.createRWGadgetVariable('hasAttachmentsEvent');
	this.webdavDirEvent = EzWebAPI.createRWGadgetVariable('webdavDirectoryEvent');

    // Initialize global variables
    this.language = this.languageCtx.get();
    this.mailproxyURL = this.mailproxyPref.get();
    this.webdavURL = this.webdavPref.get();
    this.webdavDirectory = this.webdavDirPref.get();
	this.alternatives = null;
	this.notebook     = null;
		
	this._createUserInterface();
	this.afterInit();
}	

ClienteCorreo.prototype.afterInit = function() {
	// Load data
	AccountsManager.restore();
	AccountsManager.resetForm();
	this.showAlternative(this.MAIN_ALTERNATIVE);
	this.repaint();
	
	this.timer = new Timer(EzWebExt.bind(function() {
        this.reload(false);
    }, this), parseInt(this.refreshTimePref.get()));
    this.timer.start();
	
	this.reload(true);
}

ClienteCorreo.prototype.setRefreshTime = function(value) {
    this.timer.setTimeInMinutes(parseInt(value));
    this.timer.restart();
}

ClienteCorreo.prototype.setMailproxyURL = function(value) {
    this.mailproxyURL = value;
    if (this.form_send["form"]) {
        this.form_send["form"].action = Utils.urlJoin(
	        this.mailproxyURL, 
	        "smtp/sender"
	    );
	}
    this.reload(true);
}

ClienteCorreo.prototype.setWebdavURL = function(value) {
    this.webdavURL = Utils.urlNormalize(value, false);
}

ClienteCorreo.prototype.setWebdavDirectory = function(value) {
    this.webdavDirectory = Utils.urlNormalize(value, true);
}

ClienteCorreo.prototype.repaint = function() {
	var height = (document.body.offsetHeight - document.getElementById('header').offsetHeight);
	document.getElementById('content').style.height = Utils.nonNegative(height) + 'px';
	this.alternatives.repaint();
	this.config_hpaned.repaint();
	this._resizeTinyMCE();
}

ClienteCorreo.prototype.languageHandler = function(value) {
	window.location.reload()
}

ClienteCorreo.prototype.sendEmailsSlot = function(value) {
	this.showAlternative(this.SEND_ALTERNATIVE);
	var to = "";
	if (this.form_send["to"].getValue() != "") {
	    to += (this.form_send["to"].getValue() + ", ");
	}
	to += value;
	this.form_send["to"].setValue(to);
}

ClienteCorreo.prototype.sendTextSlot = function(value) {
	this.showAlternative(this.SEND_ALTERNATIVE);
	tinyMCE.get(this.form_send["message"]).setContent(value);
}

ClienteCorreo.prototype.sendAttachSlot = function(value) {
	this.showAlternative(this.SEND_ALTERNATIVE);
	this.showSendDetails();
	this.form_send["multi_selector"].add(value);
}

ClienteCorreo.prototype.sendSubjectSlot = function(value) {
	this.showAlternative(this.SEND_ALTERNATIVE);
	this.form_send["subject"].setValue(value);
}

/******************** USER INTERFACE METHODS **************************/

ClienteCorreo.prototype.disableGeneralUID = function() {
    this.setDisabledGeneralUID(true);
}

ClienteCorreo.prototype.enableGeneralUID = function() {
    this.setDisabledGeneralUID(false);
}

ClienteCorreo.prototype.setDisabledGeneralUID = function(disabled) {
    if (disabled) {
        Utils.addLoadingImage();
    }
    else {
        Utils.removeLoadingImage();
    }
    this.maintab.setDisabled(disabled);
    this.hpaned.getLeftPanel().setDisabled(disabled);
    this.refresh_button.setDisabled(disabled);
    this.send_mail_button.setDisabled(disabled);
    this.save_config_button.setDisabled(disabled);
    this.search_input.setDisabled(disabled); 
}

ClienteCorreo.prototype._resizeTinyMCE = function() {
    try {
	    var editor_id = "send_message";
        var editor = document.getElementById(editor_id); 
        if (editor) { 
        	if (document.getElementById(editor_id + "_tbl")) {
        		document.getElementById(editor_id + "_tbl").style.height = Utils.nonNegative(editor.parentNode.offsetHeight) + "px";
        		document.getElementById(editor_id + "_tbl").style.width = "100%";
        	}
        	if (document.getElementById(editor_id + "_ifr"))
        		document.getElementById(editor_id + "_ifr").style.height = Utils.nonNegative(editor.parentNode.offsetHeight - 30) + "px";
        } 
    } catch(e){}
}

ClienteCorreo.prototype._createUserInterface = function() {
	var body = document.getElementsByTagName("body")[0];
	this.alternatives = new StyledElements.StyledAlternatives({defaultEffect:"None"});
	
	// MENU
	var header = document.createElement("div");
	header.id = "header";
	body.appendChild(header);
	
	var header_left = document.createElement("div");
	header_left.id = "header_left";
	header.appendChild(header_left);
	
	this.refresh_button = new HeaderButton(this.getResourceURL("images/view-refresh.png"), this.getResourceURL("images/view-refresh-disabled.png"), _("Synchronize"), EzWebExt.bind(function() { 
	    this.reload(false);
	}, this), "first_buttom");
	
	this.refresh_button.insertInto(header_left);
	
	this.mailbox_button = new HeaderButton(this.getResourceURL("images/mail-mailbox.png"), this.getResourceURL("images/mail-mailbox-disabled.png"), _("Mailbox"), EzWebExt.bind(function() { 
	    this.showAlternative(this.MAIN_ALTERNATIVE);
	}, this), "first_buttom");
	
	this.mailbox_button.hide(true);
	this.mailbox_button.insertInto(header_left);

	this.send_button = new HeaderButton(this.getResourceURL("images/mail-new.png"), this.getResourceURL("images/mail-new-disabled.png"), _("Send email"), EzWebExt.bind(function() { 
		this.showAlternative(this.SEND_ALTERNATIVE);
	}, this));
	
	this.send_button.insertInto(header_left);

    this.config_button = new HeaderButton(this.getResourceURL("images/config.png"), this.getResourceURL("images/config-disabled.png"), _("Settings"), EzWebExt.bind(function() { 
		this.showAlternative(this.CONFIG_ALTERNATIVE);
		this.repaint();
	}, this));
	
	this.config_button.insertInto(header_left);

	var header_right = document.createElement("div");
	header_right.id = "header_right";
	header.appendChild(header_right);

    this.search_input = new SearchInput(this.getResourceURL("images/find-arrow.png"), this.getResourceURL("images/find-arrow-disabled.png"), _("Search options"), EzWebExt.bind(function(e) {
	    e.target.blur();
        var value = e.target.value;
	    e.target.value = "";
	    this.begin = 1;
		this.end = this.INTERVAL_SIZE;
		this.searchMails(value);
    }, this));

	this.search_input.insertInto(header_right);
	
	var content = document.createElement("div");
	content.id = "content";
	body.appendChild(content);

	// PANEL PRINCIPAL	
    this.hpaned = new StyledElements.StyledHPaned({handlerPosition: 30, leftMinWidth: 0, rightMinWidth: 0});
	this.mainAlternative = this.alternatives.createAlternative();
	this.mainAlternative.addClassName("main_alternative");
	this.mainAlternative.appendChild(this.hpaned);
	
    var content_left = document.createElement("div");
    content_left.id = "content_left";
    this.hpaned.getLeftPanel().appendChild(content_left);
	
	var content_right = document.createElement("div");
	content_right.id =  "main_content_right";
	EzWebExt.addClassName(content_right, "content_right");
        
    this.notebook = new StyledElements.StyledNotebook();
	
	this.maintab = this.notebook.createTab({closeable: false});
    this.maintab.appendChild(content_right);
    this.hpaned.getRightPanel().appendChild(this.notebook);
        
    var headerrow = document.createElement("div");
    headerrow.id = "main_headerrow";
    EzWebExt.addClassName(headerrow, "headerrow");
    content_right.appendChild(headerrow);
        
    headerrow.appendChild(this._createHeaderCell(_("Subject"), "subject"));
    headerrow.appendChild(this._createHeaderCell(_("From"), "from"));
    headerrow.appendChild(this._createHeaderCell(_("Date"), "date"));
    headerrow.appendChild(this._createHeaderCell(_("Size"), "size"));
        
    var tablebody = document.createElement("div");
    tablebody.id = "main_tablebody";
    EzWebExt.addClassName(tablebody, "tablebody");
    EzWebExt.addClassName(tablebody, "mail_list");
    content_right.appendChild(tablebody);
        
    var footerrow = document.createElement("div");
    footerrow.id = "main_footerrow";
    EzWebExt.addClassName(footerrow, "footerrow");
    content_right.appendChild(footerrow);					

	// PANEL ENVIO MENSAJES
	this.sendAlternative = this.alternatives.createAlternative();
	this.sendAlternative.addClassName("send_alternative");
	
	var send_content = document.createElement("div");
    EzWebExt.addClassName(send_content,"content_right");
    EzWebExt.addClassName(send_content,"send_mail");
        
    this.sendAlternative.appendChild(send_content);
       
    headerrow = document.createElement("div");
    EzWebExt.addClassName(headerrow, "headerrow");
    EzWebExt.addClassName(headerrow, "send");
    send_content.appendChild(headerrow);
        
    var row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "send");
	EzWebExt.addClassName(row, "image_row");
	
	var title = document.createElement("span");
	EzWebExt.addClassName(title, "alternative_title");
	title.appendChild(document.createTextNode(_("SEND EMAIL")));
	
	row.appendChild(title);
	
	var cancel_button = new HeaderButton(this.getResourceURL("images/cancel.png"), this.getResourceURL("images/cancel-disabled.png"), _("Cancel"), EzWebExt.bind(function() { 
		this.showAlternative(this.MAIN_ALTERNATIVE);
		this.form_send["subject"].reset();
		this.form_send["to"].reset();
		this.form_send["cc"].reset();
		this.form_send["bcc"].reset();
		this.form_send["multi_selector"].reset();
		tinyMCE.get(this.form_send["message"]).setContent("");
	}, this));
	
	cancel_button.insertInto(row);

	this.send_mail_button = new HeaderButton(this.getResourceURL("images/mail-send.png"), this.getResourceURL("images/mail-send-disabled.png"), _("Send"), EzWebExt.bind(function() { 
		var subject = this.form_send["subject"].getValue();
		var to = this.form_send["to"].getValue();
		var cc = this.form_send["cc"].getValue();
		var bcc = this.form_send["bcc"].getValue();
		var message = tinyMCE.get(this.form_send["message"]).getContent();

		if (subject == "" || (to == "" && cc == "" && bcc == "")) {
			this.alert(_("Warning"), _("Must fill in all form fields"), EzWebExt.ALERT_WARNING);
		}
		else {
			to = to.split(/\s*,\s*/);
			cc = cc.split(/\s*,\s*/);
			bcc = bcc.split(/\s*,\s*/);
			
			if (Utils.evalMailList(to) && Utils.evalMailList(cc) && Utils.evalMailList(bcc))
				this.sendMail(subject, message, to, cc, bcc);
			else
				this.alert(_("Warning"), _("All email recipients must be valid"), EzWebExt.ALERT_WARNING);
		}
	}, this));
	
	this.send_mail_button.insertInto(row);

    headerrow.appendChild(row);
        
	this.form_send = {};
	
	var subject_text = new StyledElements.StyledTextField();
	var to_text = new StyledElements.StyledTextField();
	var cc_text = new StyledElements.StyledTextField();
	var bcc_text = new StyledElements.StyledTextField();
	
	this.form_send["header"] = headerrow;
	this.form_send["subject"] = subject_text;
	this.form_send["to"] = to_text;
    this.form_send["cc"] = cc_text;
    this.form_send["bcc"] = bcc_text;
        
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "send");
	row.appendChild(this._createCell(document.createTextNode(_("To") + ":"), "title"));
	row.appendChild(this._createCell(to_text, "value"));
	
	this.openSendDetailsButton = document.createElement("img");
	this.openSendDetailsButton.src = this.getResourceURL("images/open-details.png");
	this.openSendDetailsButton.title = _("Show details");
	EzWebExt.addClassName(this.openSendDetailsButton, "details_button");
	
	this.closeSendDetailsButton = document.createElement("img");
	this.closeSendDetailsButton.src = this.getResourceURL("images/close-details.png");
	this.closeSendDetailsButton.title = _("Hide details");
	EzWebExt.addClassName(this.closeSendDetailsButton, "details_button");
	this.closeSendDetailsButton.style.display = "none";
	
	var attach_div = document.createElement("div");
	EzWebExt.addClassName(attach_div, "attach");
	this.form_send["attach"] = attach_div;
	
	var attach = document.createElement("div");
	EzWebExt.addClassName(attach, "attach_button");
		
	this.form_send["multi_selector"] = new MultiSelector(attach, attach_div, -1);
	
	EzWebExt.addEventListener(this.openSendDetailsButton, "click", EzWebExt.bind(this.showSendDetails, this), false);
	EzWebExt.addEventListener(this.closeSendDetailsButton, "click", EzWebExt.bind(this.hideSendDetails, this), false);
	
	row.appendChild(this.openSendDetailsButton);
	row.appendChild(this.closeSendDetailsButton);
	headerrow.appendChild(row);
	
	var row_cc = document.createElement("div");
	EzWebExt.addClassName(row_cc, "row");
	EzWebExt.addClassName(row_cc, "send");
	EzWebExt.addClassName(row_cc, "hidden");
	row_cc.appendChild(this._createCell(document.createTextNode(_("Cc") + ":"), "title"));
	row_cc.appendChild(this._createCell(cc_text, "value"));
	this.form_send["row_cc"] = row_cc;
	headerrow.appendChild(row_cc);
	
	var row_bcc = document.createElement("div");
	EzWebExt.addClassName(row_bcc, "row");
	EzWebExt.addClassName(row_bcc, "send");
	EzWebExt.addClassName(row_bcc, "hidden");
	row_bcc.appendChild(this._createCell(document.createTextNode(_("Bcc") + ":"), "title"));
	row_bcc.appendChild(this._createCell(bcc_text, "value"));
	this.form_send["row_bcc"] = row_bcc;
	headerrow.appendChild(row_bcc);

    row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "send");
	row.appendChild(this._createCell(document.createTextNode(_("Subject") + ":"), "title"));
	row.appendChild(this._createCell(subject_text, "value"));
	headerrow.appendChild(row);
	
	var row_att = document.createElement("div");
	EzWebExt.addClassName(row_att, "row");
	EzWebExt.addClassName(row_att, "send");
	EzWebExt.addClassName(row_att, "attach");
	EzWebExt.addClassName(row_att, "hidden");
	row_att.appendChild(this._createCell(document.createTextNode(_("Attachments") + ":"), "title"));	
	row_att.appendChild(this._createCell(attach_div, "value"));
	this.form_send["row_att"] = row_att;
	headerrow.appendChild(row_att);
	
	var form = document.createElement("form");
	form.enctype = "multipart/form-data";
	form.name = "form_send_mail";
	form.action = Utils.urlJoin(
	    this.mailproxyURL, 
	    "smtp/sender"
	);
	form.method = "POST";
	form.onsubmit = function() {
		return AIM.submit(form, {'onStart' : function(){return true;}, 'onComplete' : EzWebExt.bind(ClienteCorreo.onSuccessSendMail, ClienteCorreo)});
	}
	
	this.form_send["form"] = form;
	
	var buttonH = document.createElement("input");
	EzWebExt.addClassName(buttonH, "hidden");
	buttonH.name = "button";
	buttonH.type = "submit";
	form.appendChild(buttonH);
	
	var configH = document.createElement("input");
	configH.name = "config";
	configH.type = "hidden";
	form.appendChild(configH);
	
	var destinationH = document.createElement("input");
	destinationH.name = "destination";
	destinationH.type = "hidden";
	form.appendChild(destinationH);
	
	var url_attachmentsH = document.createElement("input");
	url_attachmentsH.name = "url_attachments";
	url_attachmentsH.type = "hidden";
	form.appendChild(url_attachmentsH);
	
	var attach_img = document.createElement("img");
	attach_img.src = this.getResourceURL("images/attach.png");
	attach_img.title = _("Attach files");
	attach.appendChild(attach_img);
	
	form.appendChild(attach);
	row_att.appendChild(form);
	
	this.form_send["multi_selector"].hidden();
	
    tablebody = document.createElement("div");
    EzWebExt.addClassName(tablebody, "tablebody");
    EzWebExt.addClassName(tablebody, "send");
    send_content.appendChild(tablebody);
       
    this.form_send["body"] = tablebody;
	
	var send_message = document.createElement("textarea");
    EzWebExt.addClassName(send_message, "text");
    EzWebExt.addClassName(send_message, "send");
    EzWebExt.addClassName(send_message, "mceSend");
    send_message.id = "send_message";
    tablebody.appendChild(send_message);
    
    this.form_send["message"] = send_message.id;
	
	//PANEL CONFIGURACION
	this.configAlternative = this.alternatives.createAlternative();
	this.configAlternative.addClassName("config_alternative");
	
	var config_content = document.createElement("div");
        EzWebExt.addClassName(config_content,"content_right");
        EzWebExt.addClassName(config_content,"send_mail");
        
        this.configAlternative.appendChild(config_content);
        
        headerrow = document.createElement("div");
        EzWebExt.addClassName(headerrow, "headerrow");
        EzWebExt.addClassName(headerrow, "config");
        config_content.appendChild(headerrow);
        
        var row = document.createElement("div");
	    EzWebExt.addClassName(row, "row");
	    EzWebExt.addClassName(row, "config");
	
	    title = document.createElement("span");
	    EzWebExt.addClassName(title, "alternative_title");
	    title.appendChild(document.createTextNode(_("SETTINGS")));
	
	    row.appendChild(title);
	
	    var cancel_config_button = new HeaderButton(this.getResourceURL("images/cancel.png"), this.getResourceURL("images/cancel-disabled.png"), _("Cancel"), EzWebExt.bind(function() { 
		    this.showAlternative(this.MAIN_ALTERNATIVE);
		    AccountsManager.resetForm();
	    }, this));
	
	    cancel_config_button.insertInto(row);

        this.save_config_button = new HeaderButton(this.getResourceURL("images/save.png"), this.getResourceURL("images/save-disabled.png"), _("Save"), EzWebExt.bind(function() { 
		    if (AccountsManager.saveForm()) {
			    this.showAlternative(this.MAIN_ALTERNATIVE);
			    this.reload(true);
		    }
		    else {
			    this.alert(_("Error"), _("Must fill in all form fields"), EzWebExt.ALERT_WARNING);
		    }
	    }, this));
	
	    this.save_config_button.insertInto(row);
	
        headerrow.appendChild(row);
        
        tablebody = document.createElement("div");
        EzWebExt.addClassName(tablebody, "tablebody");
        EzWebExt.addClassName(tablebody, "config");
        config_content.appendChild(tablebody);
	
    	this.config_hpaned = new StyledElements.StyledHPaned({handlerPosition: 50, leftMinWidth: 0, rightMinWidth: 0});

        var config_left = document.createElement("div");
        EzWebExt.addClassName(config_left, "config_content");
        this.config_hpaned.getLeftPanel().appendChild(config_left);

	var in_account_text = new StyledElements.StyledTextField();
	var in_host_text = new StyledElements.StyledTextField();
	var in_port_text = new StyledElements.StyledNumericField({initialValue: 993, minValue: 0, maxValue: 65535});
	var in_protocol_text = new StyledElements.StyledSelect({initialEntries: [['IMAP']], initialValue: 'IMAP'});
	var in_connection_text = new StyledElements.StyledSelect({initialEntries: [['NON_SECURE', _('Non secure')], ['SSL']], initialValue: 'SSL'});
	var in_username_text = new StyledElements.StyledTextField();
	var in_password_text = new StyledElements.StyledPasswordField();

    this.form_in_config = {};
	this.form_in_config["account"] = in_account_text;
	this.form_in_config["host"] = in_host_text;
	this.form_in_config["port"] = in_port_text;
	this.form_in_config["protocol"] = in_protocol_text;
	this.form_in_config["connection"] = in_connection_text;
	this.form_in_config["username"] = in_username_text;
	this.form_in_config["password"] = in_password_text;

	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	EzWebExt.addClassName(row, "config_title");
	row.appendChild(document.createTextNode(_("Account settings")));
	config_left.appendChild(row);

    row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	EzWebExt.addClassName(row, "big");
	row.appendChild(this._createCell(document.createTextNode(_("Account") + ":"), "title"));
	row.appendChild(this._createCell(in_account_text, "value"));
	config_left.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	EzWebExt.addClassName(row, "big");
	row.appendChild(this._createCell(document.createTextNode(_("Host") + ":"), "title"));
	row.appendChild(this._createCell(in_host_text, "value"));
	config_left.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	row.appendChild(this._createCell(document.createTextNode(_("Port") + ":"), "title"));
	row.appendChild(this._createCell(in_port_text, "value"));
	config_left.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	row.appendChild(this._createCell(document.createTextNode(_("Protocol") + ":"), "title"));
	row.appendChild(this._createCell(in_protocol_text, "value"));
	config_left.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	row.appendChild(this._createCell(document.createTextNode(_("Connection") + ":"), "title"));
	row.appendChild(this._createCell(in_connection_text, "value"));
	config_left.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	row.appendChild(this._createCell(document.createTextNode(_("Username") + ":"), "title"));
	row.appendChild(this._createCell(in_username_text, "value"));
	config_left.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	row.appendChild(this._createCell(document.createTextNode(_("Password") + ":"), "title"));
	row.appendChild(this._createCell(in_password_text, "value"));
	config_left.appendChild(row);
	
	var config_right = document.createElement("div");
	EzWebExt.addClassName(config_right, "config_content");
        this.config_hpaned.getRightPanel().appendChild(config_right);

	var out_name_text = new StyledElements.StyledTextField();
	var out_account_text = new StyledElements.StyledTextField();
	var out_host_text = new StyledElements.StyledTextField();
	var out_port_text = new StyledElements.StyledNumericField({initialValue: 25, minValue: 0, maxValue: 65535});
	var out_protocol_text = new StyledElements.StyledSelect({initialEntries: [['SMTP']], initialValue: 'SMTP'});
	var out_connection_text = new StyledElements.StyledSelect({initialEntries: [['NON_SECURE', _("Non secure")], ['TLS'], ['SSL']], initialValue: 'NON_SECURE'});
	var out_username_text = new StyledElements.StyledTextField();
	var out_password_text = new StyledElements.StyledPasswordField();

    this.form_out_config = {};
    this.form_out_config["name"] = out_name_text;
	this.form_out_config["account"] = out_account_text;
	this.form_out_config["host"] = out_host_text;
	this.form_out_config["port"] = out_port_text;
	this.form_out_config["protocol"] = out_protocol_text;
	this.form_out_config["connection"] = out_connection_text;
	this.form_out_config["username"] = out_username_text;
	this.form_out_config["password"] = out_password_text;

	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	EzWebExt.addClassName(row, "config_title");
	row.appendChild(document.createTextNode(_("Outgoing server")));
	config_right.appendChild(row);

	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	EzWebExt.addClassName(row, "big");
	row.appendChild(this._createCell(document.createTextNode(_("Name") + ":"), "title"));
	row.appendChild(this._createCell(out_name_text, "value"));
	config_right.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	EzWebExt.addClassName(row, "big");
	row.appendChild(this._createCell(document.createTextNode(_("Account") + ":"), "title"));
	row.appendChild(this._createCell(out_account_text, "value"));
	config_right.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	EzWebExt.addClassName(row, "big");
	row.appendChild(this._createCell(document.createTextNode(_("Host") + ":"), "title"));
	row.appendChild(this._createCell(out_host_text, "value"));
	config_right.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	row.appendChild(this._createCell(document.createTextNode(_("Port") + ":"), "title"));
	row.appendChild(this._createCell(out_port_text, "value"));
	config_right.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	row.appendChild(this._createCell(document.createTextNode(_("Protocol") + ":"), "title"));
	row.appendChild(this._createCell(out_protocol_text, "value"));
	config_right.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	row.appendChild(this._createCell(document.createTextNode(_("Connection") + ":"), "title"));
	row.appendChild(this._createCell(out_connection_text, "value"));
	config_right.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	row.appendChild(this._createCell(document.createTextNode(_("Username") + ":"), "title"));
	row.appendChild(this._createCell(out_username_text, "value"));
	config_right.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	row.appendChild(this._createCell(document.createTextNode(_("Password") + ":"), "title"));
	row.appendChild(this._createCell(out_password_text, "value"));
	config_right.appendChild(row);
	
	this.config_hpaned.insertInto(tablebody);
	this.alternatives.insertInto(content);
}


ClienteCorreo.prototype.showSendDetails = function() {
	this.form_send["header"].style.height = "191px";
	this.form_send["header"].scrollTop = "0px"
	this.form_send["body"].style.top = "205px";
	this._resizeTinyMCE();
	this.closeSendDetailsButton.style.display = "block";
	this.openSendDetailsButton.style.display = "none";
	EzWebExt.removeClassName(this.form_send["row_cc"], "hidden");
	EzWebExt.removeClassName(this.form_send["row_bcc"], "hidden");
	EzWebExt.removeClassName(this.form_send["row_att"], "hidden");
	this.form_send["multi_selector"].show();
}
	
ClienteCorreo.prototype.hideSendDetails = function() {
	this.form_send["header"].style.height = "83px";
	this.form_send["header"].scrollTop = "0px";
	this.form_send["body"].style.top = "97px";
	this._resizeTinyMCE();
	this.openSendDetailsButton.style.display = "block";
	this.closeSendDetailsButton.style.display = "none";
	EzWebExt.addClassName(this.form_send["row_cc"], "hidden");
	EzWebExt.addClassName(this.form_send["row_bcc"], "hidden");
	EzWebExt.addClassName(this.form_send["row_att"], "hidden");
	this.form_send["multi_selector"].hidden();
}

ClienteCorreo.prototype._createTextField = function() {
	var input = document.createElement("input");
	input.type = "text";
	return input;
}

ClienteCorreo.prototype._createHeaderCell = function(text, className) {
	var cell = document.createElement("div");
	EzWebExt.addClassName(cell, "headercell");
	EzWebExt.addClassName(cell, className);
	var span = document.createElement("span");
	span.appendChild(document.createTextNode(text));
	cell.appendChild(span);
	return cell;
}

// Puede ser que el padre no exista
ClienteCorreo.prototype._createParent = function(full_name, separator) {
	var name = full_name.split(separator)[full_name.split(separator).length-1];
	var parent = full_name.substr(0,full_name.length-name.length-separator.length);
	var open = AccountsManager.getInAccount().addMailbox({
		full_name: full_name,
		flags: ["\\Noselect"],
		name: name,
		parent: parent,
		separator: separator,
		state:  "closed"
	});
	this._createFolder(full_name);
	if (open) {
	    this.openFolder(full_name);
	}
}

ClienteCorreo.prototype._createFolder = function(full_name) {
	var account = AccountsManager.getInAccount();
	var mailbox = account.getMailboxById(full_name);
	var counter = account.getMailboxCounter(full_name);
	var folder = document.createElement('div');
	EzWebExt.addClassName(folder, "folder");

	EzWebExt.addEventListener(folder, "click", EzWebExt.bind(function() {
		this.notebook.goToTab(this.MAIN_TAB);
		var previousSearch = (this.search_input.getSearchKeyword() != "");
		this.search_input.setSearchKeyword("");
		if (mailbox["state"] == "closed") {
			this.openFolder(full_name);
		}
		else {
			if (account.getSelectedMailboxName() == full_name)
				this.closeFolder(full_name);
		}
		if ((account.getSelectedMailboxName() != full_name) || (previousSearch)) {
			this.deselectFolder(account.getSelectedMailboxName());
			account.setSelectedMailbox(full_name);
			this.selectFolder(full_name);
			if (Utils.containElement(mailbox["flags"], "\\Noselect", true)) {
				document.getElementById("main_tablebody").innerHTML = ""; 
				document.getElementById("main_footerrow").innerHTML = "";
				this.maintab.rename(Utils.subString(mailbox["name"],15));
				this.maintab.setTitle(mailbox["name"]);
				this.maintab.setIcon(mailbox["icon"]);
			}
			else {
				this.goFirstPage(false);
			}
		}
	}, this), false);
	mailbox["div_header"] = folder;
	var imageIcon = document.createElement('img');
	EzWebExt.addClassName(imageIcon, "small_image");
	imageIcon.style.visibility = "hidden";
	imageIcon.setAttribute('src', this.getResourceURL('images/open.png'));
	EzWebExt.addEventListener(imageIcon, "click", EzWebExt.bind(function(e) {
		if (mailbox["state"] == "closed") {
			this.openFolder(full_name);
		}
		else {
			this.closeFolder(full_name);
		}
		Utils.stopEvent(e);
	}, this), false);
	folder.appendChild(imageIcon);
	mailbox["image_icon"] = imageIcon;
	var imageFolder = document.createElement('img');
	EzWebExt.addClassName(imageFolder, "folder_image");
	imageFolder.setAttribute('src', mailbox["icon"]);
	folder.appendChild(imageFolder);
	mailbox["image_folder"] = imageFolder;
	var span = document.createElement('span');
	EzWebExt.addClassName(span, "node_name");
	folder.appendChild(span);
	mailbox["span_folder"] = span;
	this._renameFolder(full_name, counter);
	var children = document.createElement('div');
	EzWebExt.addClassName(children, "children");
	children.style.display = "none";
	mailbox["div_children"] = children;
	if (mailbox["parent"] != "") {
		var parent = account.getMailboxById(mailbox["parent"]);
		if (!parent) { // El mailbox padre no existe
			this._createParent(mailbox["parent"], mailbox["separator"]);
			parent = account.getMailboxById(mailbox["parent"]);
		}
		if ((full_name.split("/").length > 1) && parent.div_header) {
			EzWebExt.addClassName(parent.div_header, "italic");
		}
		parent.div_children.appendChild(folder);
		parent.div_children.appendChild(children);
		parent.image_icon.style.visibility = "visible";
	}
	else {
		document.getElementById("content_left").appendChild(folder);
		document.getElementById("content_left").appendChild(children);
	}
}

ClienteCorreo.prototype._renameFolder = function(full_name, counter) {
    counter = (counter)?counter:0;
    var mailbox = AccountsManager.getInAccount().getMailboxById(full_name);
    mailbox["counter"] = counter;
    var text = mailbox["name"];
    var span = mailbox["span_folder"];
    if (counter > 0) {
        text += (" (" + counter + ")");
        EzWebExt.addClassName(span, "bold");
    }
    else {
        EzWebExt.removeClassName(span, "bold");
    }
    span.innerHTML = "";
    span.appendChild(document.createTextNode(text));
    span.title = mailbox["name"];
}

ClienteCorreo.prototype._createPaginationElement = function(search) {
	var pagination = document.createElement("span");
	EzWebExt.addClassName(pagination, "pagination");
	var image = null;
	if (this.size > 0) {
		image = document.createElement('img');
		if (this.begin > 1) {
			EzWebExt.addClassName(image, "selected");
			image.setAttribute('title', _("First"));
			image.setAttribute('src', this.getResourceURL('images/go-first.png'));
			EzWebExt.addEventListener(image, "click", EzWebExt.bind(function(){
				this.goFirstPage(search);
			}, this), false);
		}
		else {
			EzWebExt.addClassName(image, "disabled");
			image.setAttribute('src', this.getResourceURL('images/go-first-gray.png'));
		}
		pagination.appendChild(image);
		image = document.createElement('img');
		if (this.begin > 1) {
			EzWebExt.addClassName(image, "selected");
			image.setAttribute('title', _("Back"));
			image.setAttribute('src', this.getResourceURL('images/go-previous.png'));
			EzWebExt.addEventListener(image, "click", EzWebExt.bind(function(){
				this.goPreviousPage(search);
			}, this), false);
		}
		else {
			EzWebExt.addClassName(image, "disabled");
			image.setAttribute('src', this.getResourceURL('images/go-previous-gray.png'));
		}
		pagination.appendChild(image);
		var paginationInfo = document.createElement("span");
		EzWebExt.addClassName(paginationInfo, "info");
		pagination.appendChild(document.createTextNode(this.begin));
		pagination.appendChild(paginationInfo);
		paginationInfo = document.createElement("span");
		pagination.appendChild(document.createTextNode(" - "));
		pagination.appendChild(paginationInfo);
		paginationInfo = document.createElement("span");
		EzWebExt.addClassName(paginationInfo, "info");
		pagination.appendChild(document.createTextNode((this.end<this.size)?this.end:this.size));
		pagination.appendChild(paginationInfo);
		paginationInfo = document.createElement("span");
		pagination.appendChild(document.createTextNode(" de "));
		pagination.appendChild(paginationInfo);
		paginationInfo = document.createElement("span");
		EzWebExt.addClassName(paginationInfo, "info");
		pagination.appendChild(document.createTextNode(this.size));
		pagination.appendChild(paginationInfo);
		image = document.createElement('img');
		if (this.end < this.size) {
			EzWebExt.addClassName(image, "selected");
			image.setAttribute('title', _("Next"));
			image.setAttribute('src', this.getResourceURL('images/go-next.png'));
			EzWebExt.addEventListener(image, "click", EzWebExt.bind(function(){
				this.goNextPage(search);
			}, this), false);
		}
		else {
			EzWebExt.addClassName(image, "disabled");
			image.setAttribute('src', this.getResourceURL('images/go-next-gray.png'));
		}
		pagination.appendChild(image);
		image = document.createElement('img');
		if (this.end < this.size) {
			EzWebExt.addClassName(image, "selected");
			image.setAttribute('title', _("Last"));
			image.setAttribute('src', this.getResourceURL('images/go-last.png'));
			EzWebExt.addEventListener(image, "click", EzWebExt.bind(function(){
				this.goLastPage(search);
			}, this), false);
		}
		else {
			EzWebExt.addClassName(image, "disabled");
			image.setAttribute('src', this.getResourceURL('images/go-last-gray.png'));
		}
		pagination.appendChild(image);
	}
	return pagination;
}

ClienteCorreo.prototype._createCell = function(element, className, title) {
    title = (title)?title:"";
	var cell = document.createElement("div");
	EzWebExt.addClassName(cell, "cell");
	EzWebExt.addClassName(cell, className);
	var span = document.createElement("span");
	span.title = title;
	if (element instanceof StyledElements.StyledElement) {
		element.insertInto(span);
	}
	else {
		span.appendChild(element);
	}
	cell.appendChild(span);
	return cell;
}

ClienteCorreo.prototype._getMails = function(transport, search) {
    var response = eval("(" + transport.responseText + ")");
    var account = AccountsManager.getInAccount();
	if ((account != null) && account.compareTo(response["account"])) {
	    this.size = response["size"];
	    var mailList = response["mailList"];
	    var tablebody = document.getElementById("main_tablebody");
	    tablebody.innerHTML = "";
	    var tab_title = (search)?this.search_input.getSearchKeyword():account.getMailboxShortName(response["mailbox"]);
	    this.maintab.rename(Utils.subString(tab_title,15));
	    this.maintab.setTitle(tab_title);
	    if (search) {
	        this.maintab.setIcon(this.getResourceURL("images/find.png"));
	    }
	    else {
	        this.maintab.setIcon(account.getMailboxIcon(response["mailbox"], false));
	    }
	    var width = tablebody.offsetWidth;
	    for (var i=0; i<mailList.length; i++) {
		    var mail = mailList[i];
		    var row = document.createElement("div");
		    var context = {self: this, mail: mailList[i], row: row};
		    EzWebExt.addClassName(row, "row");
		    EzWebExt.addClassName(row, ((i%2)==0)?"row_0":"row_1");
		    if (!Utils.containElement(mail["flags"], "\\Seen", true)) {
			    EzWebExt.addClassName(row, "bold");
		    }
		
		    var attachImg = document.createElement("img");
		    attachImg.title = _("There are some attachment files");
		    EzWebExt.addClassName(attachImg, "attach_img");
		    attachImg.src = this.getResourceURL('images/' + ((mail["attachment"])?'attach3.png':'non-attach.png'));
		    row.appendChild(attachImg);
		    var subject = (mail["subject"])?mail["subject"]:"";
		    row.appendChild(this._createCell(document.createTextNode(subject), "subject", subject));
		    EzWebExt.addEventListener(row, "mouseover", function(e) {
			    EzWebExt.addClassName(e.currentTarget, "selected");
		    }, false);
		    EzWebExt.addEventListener(row, "mouseout", function(e) {
			    EzWebExt.removeClassName(e.currentTarget, "selected");
		    }, false);
		    EzWebExt.addEventListener(row, "click", EzWebExt.bind(function(){
			    EzWebExt.removeClassName(this.row, "bold");
			    this.self.hasAttachmentsEvent.set(this.mail["attachment"]);
			    this.self.webdavDirEvent.set(this.self.webdavDirectory);
			    this.self.getMail(account.getSelectedMailboxName(), this.mail["uid"]);
		    }, context), false);
		
		    row.appendChild(this._createCell(this._createMailLink(mail["from"]), "from"));
		    var date = (mail["date"])?Utils.formatDate(mail["date"]):"";
		    row.appendChild(this._createCell(document.createTextNode(date), "date", date));
		    var size = (mail["size"])?Utils.sizeToString(mail["size"]):"";
		    row.appendChild(this._createCell(document.createTextNode(size), "size", size));
		    tablebody.appendChild(row);
	    }
	    document.getElementById("main_tablebody").scrollTop = this.main_tab_scroll;
	    this.main_tab_scroll = 0;
	    var footer = document.getElementById("main_footerrow");
	    footer.innerHTML = "";
	    footer.appendChild(this._createPaginationElement(search));
	}
	this.enableGeneralUID();
}

ClienteCorreo.prototype._createMailLink = function(mail) {
	var link = document.createElement("span");
	EzWebExt.addClassName(link, "link");
	var mail_addr = ((mail.mail)?mail.mail.split(/\s*\?\s*/):[]);
	
	var params = {};
	
	if (mail_addr.length > 1) {
		var p = mail_addr[1].split(/\s*\&\s*/);
		for (var i=0; i<p.length; i++) {
			var name = p[i].split(/\s*\=\s*/);
			var value = (name.length > 1)? decodeURIComponent(name[1]) : "";
			name = name[0].toLowerCase();
			
			params[name] = value;
		}
	}
	mail_addr = (mail_addr.length > 0)? mail_addr[0] : "";
	
	var mail_name = (mail.name && (mail.name != ""))? mail.name : mail_addr;
	
	link.title = _("Send email to ") + mail_name;
	link.appendChild(document.createTextNode(mail_name));

	EzWebExt.addEventListener(link, "click", EzWebExt.bind(function(e) { 
		this.form_send["subject"].setValue((params["subject"])?params["subject"]:"");
		this.form_send["to"].setValue(mail_addr);
		this.form_send["cc"].setValue((params["cc"])?params["cc"]:"");
		this.form_send["bcc"].setValue((params["bcc"])?params["bcc"]:"");
		tinyMCE.get(this.form_send["message"]).setContent((params["body"])?params["body"]:"");
		Utils.stopEvent(e);
		this.showAlternative(this.SEND_ALTERNATIVE);
	}, this), false);
	
	return link;
}

/******************** PUBLIC METHODS **************************/

ClienteCorreo.prototype.reload = function(firstLoad) {
    if (AccountsManager.isConfigured()) {
        AccountsManager.getInAccount().resetSelectedMailbox();
        this.main_tab_scroll = document.getElementById("main_tablebody").scrollTop;
        if (firstLoad) {
            this.main_tab_scroll = 0;
            this.begin = 1;
	        this.end = this.INTERVAL_SIZE;
	        this.size = 0;
	        this.search_input.setSearchKeyword("");
        }
        
	    this.getFolders();
	    this.repaint();
	}
	else {
	    this.showAlternative(this.CONFIG_ALTERNATIVE);
	}
}

ClienteCorreo.prototype.showAlternative = function(alternative) {
	if (!AccountsManager.isConfigured()) {
	    alternative = this.CONFIG_ALTERNATIVE;
	}
    if (this.selectedAlternative != alternative) {
        this.selectedAlternative = alternative;
	    this.alternatives.showAlternative(alternative);
	    if (alternative  == this.MAIN_ALTERNATIVE) {
	        this.refresh_button.hide(false);
	        this.mailbox_button.hide(true);
	        this.search_input.hide(false);
	    }
	    else {
	        this.search_input.closeDialog();
   	        this.refresh_button.hide(true);
	        this.mailbox_button.hide(false);
	        this.search_input.hide(true);
	    }
	}
}

ClienteCorreo.prototype.searchMails = function(value) {
	this.notebook.goToTab(this.MAIN_TAB);
	this.showAlternative(this.MAIN_ALTERNATIVE);
	if (AccountsManager.isConfigured()) {
	    this.search_input.setSearchKeyword(value);
	    var mailbox = AccountsManager.getInAccount().getSelectedMailbox();
	    if (Utils.containElement(mailbox["flags"], "\\Noselect", true)) {
			document.getElementById("main_tablebody").innerHTML = ""; 
			document.getElementById("main_footerrow").innerHTML = "";
			this.maintab.rename(Utils.subString(value,15));
			this.maintab.setTitle(value);
    	    this.maintab.setIcon(this.getResourceURL("images/find.png"));
		}
		else {
		    if  (value == "") {
			    this.goFirstPage(false);
		    }
		    else {
			    this.sendSearchMails();
		    }
		}
	}
}

ClienteCorreo.prototype.showMessageFromSlot = function(message) {
	message = eval("(" + message + ")");
	if (message.account == AccountsManager.getInAccount().account) {
		this.getMail(message["mailbox"], message["uid"]);
	}
}

// PAGINATION

ClienteCorreo.prototype.goFirstPage = function(search) {
	this.begin = 1;
	this.end = this.INTERVAL_SIZE;
	this.goSelectedPage(search);
}

ClienteCorreo.prototype.goLastPage = function(search) {
	this.begin = this.size - (this.size % this.INTERVAL_SIZE) + 1;
	this.end = this.size - (this.size % this.INTERVAL_SIZE) + this.INTERVAL_SIZE;
	this.goSelectedPage(search);
}

ClienteCorreo.prototype.goNextPage = function(search) {
	if (this.end >= this.size)
		return;
	if ((this.end + this.INTERVAL_SIZE) > this.size) {
		this.goLastPage(search);
	}
	else {
		this.begin = this.begin + this.INTERVAL_SIZE;
		this.end = this.end + this.INTERVAL_SIZE;
		this.goSelectedPage(search);
	} 
}

ClienteCorreo.prototype.goPreviousPage = function(search) {
	if (this.begin <= 1)
		return;
	if ((this.begin - this.INTERVAL_SIZE) < 1) {
		this.goFirstPage(search);
	}
	else {
		this.begin = this.begin - this.INTERVAL_SIZE;
		this.end = this.end - this.INTERVAL_SIZE;
		this.goSelectedPage(search);
	} 
}

ClienteCorreo.prototype.goSelectedPage = function(search) {
	if (!search)
		this.getMailsByFolder();
	else
		this.searchMails(this.search_input.getSearchKeyword());
}

// FOLDERS

ClienteCorreo.prototype.openFolder = function(mailbox) {
	mailbox = AccountsManager.getInAccount().getMailboxById(mailbox);
	mailbox["div_children"].style.display = "block";
	mailbox["image_icon"].src = this.getResourceURL("images/close.png");
	mailbox["state"] = "opened";
}

ClienteCorreo.prototype.closeFolder = function(mailbox) {
	mailbox = AccountsManager.getInAccount().getMailboxById(mailbox);
	mailbox["div_children"].style.display = "none";
	mailbox["image_icon"].src = this.getResourceURL("images/open.png");
	mailbox["state"] = "closed";
}

ClienteCorreo.prototype.selectFolder = function(mailbox) {
	mailbox = AccountsManager.getInAccount().getMailboxById(mailbox);
	if (mailbox) {
		EzWebExt.addClassName(mailbox["span_folder"], "selected_folder");
		mailbox["image_folder"].src = mailbox["icon_selected"];
	}
}

ClienteCorreo.prototype.deselectFolder = function(mailbox) {
	mailbox = AccountsManager.getInAccount().getMailboxById(mailbox);
	if (mailbox) {
		mailbox["image_folder"].src = mailbox["icon"];
		EzWebExt.removeClassName(mailbox["span_folder"], "selected_folder");
	}
}

// REQUESTS

ClienteCorreo.prototype.getMailsByFolder = function() {
	if (AccountsManager.isConfigured()) {
		this.disableGeneralUID();
		this.sendPost(
			Utils.urlJoin(
				this.mailproxyURL,
				"imap/mailbox/messages/",
				this.begin,
				this.end
			),
			Utils.urlParams({
				config: Utils.toJSON(AccountsManager.getInAccount().getConfig()), 
				mailbox: AccountsManager.getInAccount().getSelectedMailboxName()
			}),
			this.onSuccessGetMailsByFolder, 
			this.onError,
			this.onException
		);
	}
}

ClienteCorreo.prototype.sendSearchMails = function() {
	if (AccountsManager.isConfigured()) {
		this.disableGeneralUID();
		this.sendPost(
			Utils.urlJoin(
				this.mailproxyURL, 
				"imap/mailbox/messages/search/",
				encodeURIComponent(this.search_input.getSearchOption()), 
				encodeURIComponent(this.search_input.getSearchKeyword()),
				this.begin,
				this.end
			),
			Utils.urlParams({
			    config: Utils.toJSON(AccountsManager.getInAccount().getConfig()),
				mailbox: AccountsManager.getInAccount().getSelectedMailboxName()
			}), 
			this.onSuccessSearchMails, 
			this.onError,
			this.onException
		);
	}
}

ClienteCorreo.prototype.getFolders = function() {
	if (AccountsManager.isConfigured()) {
		this.disableGeneralUID();
		this.sendPost(
			Utils.urlJoin(
				this.mailproxyURL,
				"imap/mailbox/all"
			),
			Utils.urlParams({
			    config: Utils.toJSON(AccountsManager.getInAccount().getConfig())
			}),
			this.onSuccessGetFolders,
			this.onError,
			this.onException
		);
	}
}

ClienteCorreo.prototype.getFolderInfo = function(full_name) {
	if (AccountsManager.isConfigured()) {
	    var mailbox = AccountsManager.getInAccount().getMailboxById(full_name);
		if (mailbox) {
			if (!Utils.containElement(mailbox["flags"], "\\Noselect", true)) {
		        this.sendPost(
			        Utils.urlJoin(
			            this.mailproxyURL,
			            "imap/mailbox"
			        ),
			        Utils.urlParams({
			            config: Utils.toJSON(AccountsManager.getInAccount().getConfig()),
			            mailbox: full_name
			        }),
			        this.onSuccessGetFolderInfo,
			        function(){},
			        function(){}
		        );
	        }
	    }
	}
}

ClienteCorreo.prototype.getAllFoldersInfo = function() {
	if (AccountsManager.isConfigured()) {
		this.disableGeneralUID();
		this.sendPost(
			Utils.urlJoin(
			    this.mailproxyURL, 
			    "imap/mailbox"
			),
			Utils.urlParams({
			    config: Utils.toJSON(AccountsManager.getInAccount().getConfig()),
			    mailbox: "*"
			}),
			this.onSuccessGetAllFoldersInfo,
			function(){},
			function(){}
		);
	}
}

ClienteCorreo.prototype.getMail = function(mailbox, uid) {
	try {
	if (AccountsManager.isConfigured()) {
		this.disableGeneralUID();
		this.sendPost(
			Utils.urlJoin(
			    this.mailproxyURL, 
			    "imap/mailbox/messages/uid/", 
			    uid
			),
			Utils.urlParams({
			    config: Utils.toJSON(AccountsManager.getInAccount().getConfig()),
				mailbox: mailbox,
				webdav: Utils.urlJoin(this.webdavURL, this.webdavDirectory)
			}),
			this.onSuccessGetMail,
			this.onError,
			this.onException
		);
	}
	} catch(e){}
}

ClienteCorreo.prototype.sendMail = function(subject, messageHtml, to, cc, bcc) {
	if (this.form_send["multi_selector"].haveAttach()) {
		this.sendMailWithAttach(subject, messageHtml, to, cc, bcc);
	}
	else {
		this.sendMailWithoutAttach(subject, messageHtml, to, cc, bcc);
	}
}

ClienteCorreo.prototype.sendMailWithAttach = function(subject, messageHtml, to, cc, bcc) {
	if (AccountsManager.isConfigured()) {
	
		// TODO Enviar un chequeo de configuración al servidor
		
		this.disableGeneralUID();
		var outAccount = AccountsManager.getOutAccount();
		var destination = {
			subject: subject,
			message_html: messageHtml,
			from: outAccount.account,
			to: to,
			cc: cc,
			bcc: bcc
		}
		
		this.form_send["form"].config.value = Utils.toJSON(outAccount.getConfig());
		this.form_send["form"].destination.value = Utils.toJSON(destination);
		this.form_send["form"].url_attachments.value = Utils.toJSON(this.form_send["multi_selector"].getURLs());
		
		// Enviar Submit
		var evObj = document.createEvent('MouseEvents');
		evObj.initEvent('click', false, true);
		this.form_send["form"].button.dispatchEvent(evObj);
	}
}

ClienteCorreo.prototype.sendMailWithoutAttach = function(subject, messageHtml, to, cc, bcc) {
	if (AccountsManager.isConfigured()) {
		this.disableGeneralUID();
		var outAccount = AccountsManager.getOutAccount();
		var destination = {
			subject: subject,
			message_html: messageHtml,
			from: outAccount.account,
			to: to,
			cc: cc,
			bcc: bcc
		}

		this.sendPost(
			Utils.urlJoin(
			    this.mailproxyURL,
			    "smtp/sender"
			),
			Utils.urlParams({
			    config: Utils.toJSON(outAccount.getConfig()), 
				destination: Utils.toJSON(destination)
			}),
			this.onSuccessSendMail,
			this.onError,
			this.onException
		);
	}
}

ClienteCorreo.prototype.getFile = function(form, foldername, uid, filename) {
	if (AccountsManager.isConfigured()) {
	
		// TODO Enviar un chequeo de configuración al servidor
		
		this.disableGeneralUID();
		var outAccount = AccountsManager.getOutAccount();
		var destination = {
			subject: subject,
			message_html: messageHtml,
			from: outAccount.account,
			to: to,
			cc: cc,
			bcc: bcc
		}
		
		
		form.config.value = Utils.toJSON(outAccount.getConfig());
		form.destination.value = Utils.toJSON(destination);
		form.submit();
		
		// Enviar Submit
		var evObj = document.createEvent('MouseEvents');
		evObj.initEvent('click', false, true);
		this.form_send["form"].button.dispatchEvent(evObj);
	}
}

// ONFAILURE RESPONSES

ClienteCorreo.prototype.onException = function(transport, e) {
	this.enableGeneralUID();
	this.alert(_("Exception"), _("Line") + ":" + e.lineNumber + " \n" + _("Message") + ": " + e.message, EzWebExt.ALERT_ERROR);
}

ClienteCorreo.prototype.onError = function(transport) {
    var response = "";
    try {
	    response = eval("(" + transport.responseText + ")");
	}
	catch(e){
	    response = transport.responseText;
	}
	this.enableGeneralUID();
	if (response["error"] && (response["error"] != "")) {
	    if (response["message"] && (response["message"] != "")) {
		    this.alert(_("Error"), _("Error") + " " + response["error"] + ": " + response["message"], EzWebExt.ALERT_ERROR);
		}
		else {
		    this.alert(_("Error"), _("Error") + ": " + response["error"], EzWebExt.ALERT_ERROR);
		}
	}
	else {
		this.alert(_("Error"), response, EzWebExt.ALERT_ERROR);
	}
}

// ONSUCCESS RESPONSES

ClienteCorreo.prototype.onSuccessGetFolderInfo = function(transport) {
    var response = eval("(" + transport.responseText + ")");
    var account = AccountsManager.getInAccount();
	if ((account != null) && account.compareTo(response["account"])) {
        this._renameFolder(response["mailbox"], response["folder"]["unseen"]);
    }
}

ClienteCorreo.prototype.onSuccessGetAllFoldersInfo = function(transport) {
    var response = eval("(" + transport.responseText + ")");
    var account = AccountsManager.getInAccount();
	if ((account != null) && account.compareTo(response["account"])) {
	    var folderList = response["folder"];
	    for (var i=0; i<folderList.length; i++) {
	        if (folderList[i]["info"]) {
                this._renameFolder(folderList[i]["name"], folderList[i]["info"]["unseen"]);
            }
        }
    }
}

ClienteCorreo.prototype.onSuccessGetFolders = function(transport) {
    var response = eval("(" + transport.responseText + ")");
    var account = AccountsManager.getInAccount();
	if ((account != null) && account.compareTo(response["account"])) {
	    var folderList = response["folderList"];
		document.getElementById("content_left").innerHTML = "";
		account.clearMailboxList();
		
		// Ordenamos alfabeticamente los directorios teniendo en cuenta que algunos son prioritarios
		var priorityFolders = ["trash", "spam", "junk", "sent", "drafts", "inbox"];
		
		for (var i=0; i<folderList.length; i++) {
		    var full_name = folderList[i].name;
		    var separator = folderList[i].separator;
			var name = full_name.split(separator)[full_name.split(separator).length-1];
			folderList[i]["short_name"] = name;
			folderList[i]["sort_name"] = account.getFolderName(full_name, name);
		}
		
		folderList.sort(function(a, b) {
		    var aSeparators = a.name.split(a.separator).length;
		    var bSeparators = b.name.split(b.separator).length;
		    if (aSeparators > bSeparators) {
		         return 1;
		    }
		    else if (aSeparators < bSeparators) {
		        return -1;
		    } else {
		        var aPriority = Utils.getIndexElement(priorityFolders, a.short_name, true);
		        var bPriority = Utils.getIndexElement(priorityFolders, b.short_name, true);
		        
		        if (aPriority > bPriority) {
		            return -1;
		        }
		        else if (aPriority < bPriority) {
		            return 1;
		        }
		        else {    
		            return Utils.compareStrings(a.sort_name, b.sort_name);
		        }
		    }
		});
		
		// Fin ordenacion
		
		for (var i=0; i<folderList.length; i++) {
			var full_name = folderList[i].name;
			var separator = folderList[i].separator;
			var name = folderList[i].short_name;
			var parent = full_name.substr(0,full_name.length-name.length-separator.length);
			var flags = folderList[i].flags;
			var open = account.addMailbox({
				full_name: full_name,
				flags: flags,
				name: name,
				parent: parent,
				separator: separator,
				state:  "closed",
				counter: 0
			});
		    
		    this._createFolder(full_name);
		    if (open) {
	            this.openFolder(full_name);
	        }
		}
		this.enableGeneralUID();
		var mailbox = AccountsManager.getInAccount().getSelectedMailbox();
		if (mailbox) {
			this.selectFolder(mailbox["full_name"]);
			
			if (Utils.containElement(mailbox["flags"], "\\Noselect", true)) {
				document.getElementById("main_tablebody").innerHTML = ""; 
				document.getElementById("main_footerrow").innerHTML = "";
				var tab_title = (this.search_input.getSearchKeyword() != "")?this.search_input.getSearchKeyword():mailbox["name"];
				this.maintab.rename(Utils.subString(tab_title,15));
				this.maintab.setTitle(tab_title);
				if (this.search_input.getSearchKeyword() != "") {
	                this.maintab.setIcon(this.getResourceURL("images/find.png"));
	            }
	            else {
	                this.maintab.setIcon(mailbox["icon"]);
	            }
			}
			else {
				this.goSelectedPage(this.search_input.getSearchKeyword() != "");
			}
		}
		if (this.MULTIPLE_CALLS) {
		    // Solicitar información asociada a todos los mailboxes en peticiones individuales
		    for (var i=0; i<folderList.length; i++) {
		        this.getFolderInfo(folderList[i].name);
		    }
		}
		else {
	        this.getAllFoldersInfo();
		}
	}
	else {
	    this.enableGeneralUID();
	}
}

ClienteCorreo.prototype.onSuccessGetMail = function(transport) {
    var response = eval("(" + transport.responseText + ")");
    var account = AccountsManager.getInAccount();
	if ((account != null) && account.compareTo(response["account"])) {
	    var response = eval("(" + transport.responseText + ")");
	    var mail = response["mail"][0];
	
	    var content_right = document.createElement("div");
        EzWebExt.addClassName(content_right,"content_right");
            
        var headerrow = document.createElement("div");
        EzWebExt.addClassName(headerrow, "headerrow");
        EzWebExt.addClassName(headerrow, "mail");
        content_right.appendChild(headerrow);
            
        var row = document.createElement("div");
	    EzWebExt.addClassName(row, "row");
	    EzWebExt.addClassName(row, "mail");
	    EzWebExt.addClassName(row, "bold");
	
	    row.appendChild(this._createCell(document.createTextNode(_("Subject") + ":"), "title"));
	    var sub = (mail["subject"])?mail["subject"]:"";
	    var subject = this._createCell(document.createTextNode(sub), "value", sub);
	    EzWebExt.addClassName(subject, "first_line");
	    row.appendChild(subject);
	
	    var text;
	    if (mail["text_html"] == "") {
	        var div = document.createElement('div');
	        var pre = document.createElement('pre');
            div.appendChild(pre);
            if (EzWebExt.Browser.isIE() && (EzWebExt.Browser.getShortVersion() < 8)) {
                pre.innerText = mail["text_plain"];
            }
            else {
                pre.textContent = mail["text_plain"];
            }
		    text = div.innerHTML;
	    }
	    else {
		    text = mail["text_html"];
	    }
	    
	    var send_events_button = new HeaderButton(this.getResourceURL("images/send-events.png"), this.getResourceURL("images/send-events-disabled.png"), _("Send events"), EzWebExt.bind(function() { 
		    this.fromEvent.set((mail["from"])?mail["from"].mail:"");
            var mails = "";
		    if (!(mail["to"] instanceof Array)) {
		        mail["to"] = [];
		    }
		    if (!(mail["cc"] instanceof Array)) {
		        mail["cc"] = [];
		    }
		    if (!(mail["bcc"] instanceof Array)) {
		        mail["bcc"] = [];
		    }
		    var mailList = (mail["to"].concat(mail["cc"])).concat(mail["bcc"]);
		    for (var i=0; i<mailList.length; i++) {
                if (i > 0) {
	                mails += ", ";
	            }
	            mails += mailList[i].mail;
		    }
            this.recipientsEvent.set(mails);
            this.subjectEvent.set((mail["subject"])?mail["subject"]:"");
            this.textEvent.set(text);
            this.dateEvent.set((mail["date"])?mail["date"]:"");
            this.sizeEvent.set((mail["size"])?mail["size"]:"");
            this.hasAttachmentsEvent.set(("files" in mail) && (mail["files"].length > 0));
			this.webdavDirEvent.set(this.webdavDirectory);
	    }, this));
	
	    send_events_button.insertInto(row);
        
        var reply_all_button = new HeaderButton(this.getResourceURL("images/mail-reply-all.png"), this.getResourceURL("images/mail-reply-all-disabled.png"),_("Reply all"), EzWebExt.bind(function() { 
		    this.form_send["subject"].setValue("Re: " + ((mail["subject"])?mail["subject"]:""));
		    var cc = "";
		    if (!(mail["to"] instanceof Array)) {
		        mail["to"] = [];
		    }
		    if (!(mail["cc"] instanceof Array)) {
		        mail["cc"] = [];
		    }
		    var mailList = mail["to"].concat(mail["cc"]);
		    for (var i=0; i<mailList.length; i++) {
		        if (mailList[i].mail != AccountsManager.getOutAccount.account) {
		            if (i > 0) {
		                cc += ", ";
		            }
		            cc += mailList[i].mail;
		        }
		    }
		    this.form_send["to"].setValue(mail["from"].mail);
		    this.form_send["cc"].setValue(cc);
		    this.form_send["bcc"].reset();
		    
		    var message = document.createElement("div");
		    message.appendChild(document.createElement("br"));
		    var div = document.createElement("div");
		    var date = (mail["date"])?Utils.formatDate(mail["date"]):"";
	        div.appendChild(document.createTextNode(date + " - " + mail["from"].name + " <"));
	        var link = document.createElement("a");
	        link.href = "mailto:" + mail["from"].mail;
	        link.textContent = mail["from"].mail;
		    div.appendChild(link);
		    div.appendChild(document.createTextNode("> " + _("wrote") + ":"));
		    message.appendChild(div);
		    var blockquote = document.createElement("blockquote");
		    blockquote.type = "cite";
		    blockquote.innerHTML = text;
		    message.appendChild(blockquote);
		    tinyMCE.get(this.form_send["message"]).setContent(message.innerHTML);

		    this.form_send["multi_selector"].reset();
		    this.showAlternative(this.SEND_ALTERNATIVE);
	    }, this));
	
	    reply_all_button.insertInto(row);
	
	    var reply_button = new HeaderButton(this.getResourceURL("images/mail-reply.png"), this.getResourceURL("images/mail-reply-disabled.png"),_("Reply"), EzWebExt.bind(function() { 
		    this.form_send["subject"].setValue("Re: " + ((mail["subject"])?mail["subject"]:""));
		    this.form_send["to"].setValue(mail["from"].mail);
		    this.form_send["cc"].reset();
		    this.form_send["bcc"].reset();
		    
		    var message = document.createElement("div");
		    message.appendChild(document.createElement("br"));
		    var div = document.createElement("div");
		    var date = (mail["date"])?Utils.formatDate(mail["date"]):"";
	        div.appendChild(document.createTextNode(date + " - " + mail["from"].name + " <"));
	        var link = document.createElement("a");
	        link.href = "mailto:" + mail["from"].mail;
	        link.textContent = mail["from"].mail;
		    div.appendChild(link);
		    div.appendChild(document.createTextNode("> " + _("wrote") + ":"));
		    message.appendChild(div);
		    var blockquote = document.createElement("blockquote");
		    blockquote.type = "cite";
		    blockquote.innerHTML = text;
		    message.appendChild(blockquote);
		    tinyMCE.get(this.form_send["message"]).setContent(message.innerHTML);

		    this.form_send["multi_selector"].reset();
		    this.showAlternative(this.SEND_ALTERNATIVE);
	    }, this));
	
	    reply_button.insertInto(row);
	
        var forward_button = new HeaderButton(this.getResourceURL("images/mail-forward.png"), this.getResourceURL("images/mail-forward-disabled.png"),_("Forward"), EzWebExt.bind(function() { 
		    this.form_send["subject"].setValue("\[Fwd: " + ((mail["subject"])?mail["subject"]:"") + "\]");
		    this.form_send["to"].reset();
		    this.form_send["cc"].reset();
		    this.form_send["bcc"].reset();
		    this.form_send["multi_selector"].reset();
		    tinyMCE.get(this.form_send["message"]).setContent(text);
		    this.showAlternative(this.SEND_ALTERNATIVE);
		    // TODO Falta reenviar adjuntos
	    }, this));
	
	    forward_button.insertInto(row);

	    headerrow.appendChild(row);
	
	    var row_date = document.createElement("div");
	    EzWebExt.addClassName(row_date, "row");
	    EzWebExt.addClassName(row_date, "mail");
	    row_date.appendChild(this._createCell(document.createTextNode(_("Date") + ":"), "title"));
	    var date = (mail["date"])?Utils.formatDate(mail["date"]):"";
	    row_date.appendChild(this._createCell(document.createTextNode(date), "value", date));
	    row_date.style.display = "none";
	    headerrow.appendChild(row_date);
	
	    row = document.createElement("div");
	    EzWebExt.addClassName(row, "row");
	    EzWebExt.addClassName(row, "mail");
	    row.appendChild(this._createCell(document.createTextNode(_("From") + ":"), "title"));
	    row.appendChild(this._createCell(this._createMailLink(mail["from"]), "value"));
	    headerrow.appendChild(row);
	
	    row = document.createElement("div");
	    EzWebExt.addClassName(row, "row");
	    EzWebExt.addClassName(row, "mail");
	    row.appendChild(this._createCell(document.createTextNode(_("To") + ":"), "title"));
	    var to = document.createElement("div");
	    if (mail["to"]) {
		    for (var i=0; i<mail["to"].length; i++) {
			    to.appendChild(this._createMailLink(mail["to"][i]));
			    if (i < (mail["to"].length-1))
				    to.appendChild(document.createTextNode(", "));
		    }
	    }
	    row.appendChild(this._createCell(to, "value"));
	    headerrow.appendChild(row);
	
	    row = document.createElement("div");
	    EzWebExt.addClassName(row, "row");
	    EzWebExt.addClassName(row, "mail");
	    row.appendChild(this._createCell(document.createTextNode(_("Cc") + ":"), "title"));
	    var cc = document.createElement("div");
	    if (mail["cc"]) {
		    for (var i=0; i<mail["cc"].length; i++) {
			    cc.appendChild(this._createMailLink(mail["cc"][i]));
			    if (i < (mail["cc"].length-1))
				    cc.appendChild(document.createTextNode(", "));
		    }
	    }
	    row.appendChild(this._createCell(cc, "value"));
	    headerrow.appendChild(row);
	
	    row = document.createElement("div");
	    EzWebExt.addClassName(row, "row");
	    EzWebExt.addClassName(row, "mail");
	    EzWebExt.addClassName(row, "attach");	
	    row.appendChild(this._createCell(document.createTextNode(_("Attachments") + ":"), "title"));
	    var attach_div = document.createElement("div");
	    EzWebExt.addClassName(attach_div, "attach");
	
	    var responseIframe = document.createElement("iframe");
	    responseIframe.name = "response_iframe";
	    document.body.appendChild(responseIframe);
	
	    if (mail["files"]) {
		    for (var i=0; i<mail["files"].length; i++) {
			    var new_row = document.createElement('div');
	            EzWebExt.addClassName(new_row, "attach_file");
	
	            var form = document.createElement("form");
	            form.action = Utils.urlJoin(
	                this.mailproxyURL,
	                "imap/mailbox/messages/uid/",
	                mail["uid"],
	                "file"
	            );
	            form.method = "POST";
	            form.onsubmit = "return false;";
	            form.target = "response_iframe";
	            new_row.appendChild(form);
	            
	            var config = document.createElement("input");
	            config.name = "config";
	            config.type = "hidden";
	            config.value = Utils.toJSON(AccountsManager.getInAccount().getConfig());
	            form.appendChild(config);
	            
	            var mailbox = document.createElement("input");
	            mailbox.name = "mailbox";
	            mailbox.type = "hidden";
	            mailbox.value = AccountsManager.getInAccount().getSelectedMailboxName();
	            form.appendChild(mailbox);
	            
	            var filename = document.createElement("input");
	            filename.name = "filename";
	            filename.type = "hidden";
	            filename.value = mail["files"][i]["filename"];
	            form.appendChild(filename);
	            
	            var new_row_span = document.createElement('span');
	            new_row_span.appendChild(document.createTextNode(Utils.subFileName(mail["files"][i]["filename"], 30)));
	            new_row_span.title = mail["files"][i]["filename"] + " - " + Utils.sizeToString(mail["files"][i]["size"]);
	            form.appendChild(new_row_span);
	            var context = {self: this, form: form};
	            EzWebExt.addEventListener(new_row, "click", EzWebExt.bind(function(e) {
	                if (AccountsManager.isConfigured()) {
        		        // TODO Enviar un chequeo de configuración al servidor
        		        this.form.submit();
        		    }
       	        }, context), false);
       	        EzWebExt.addEventListener(new_row, "mouseover", EzWebExt.bind(function(e) {
		            this.style.backgroundColor = "#FCD18E";
	            }, new_row), false);
	            EzWebExt.addEventListener(new_row, "mouseout", EzWebExt.bind(function(e) {
		            this.style.backgroundColor = "#FFFFFF";
	            }, new_row), false);
	
	            attach_div.appendChild(new_row)
		    }
	    }
	    row.appendChild(this._createCell(attach_div, "value"));;
	    headerrow.appendChild(row);
		
        var tablebody = document.createElement("div");
        EzWebExt.addClassName(tablebody, "tablebody");
        EzWebExt.addClassName(tablebody, "mail");
        content_right.appendChild(tablebody);
        
        var tablebodyObj = document.createElement("iframe");
        EzWebExt.addClassName(tablebodyObj, "text");
        EzWebExt.addClassName(tablebodyObj, "read");
        tablebodyObj.type = "text/html";
        
        var objectHandler = EzWebExt.bind(function(doc) {
            var style = doc.createElement("link");
            style.rel = "stylesheet";
            style.type = "text/css";
            style.href = this.getResourceURL("css/read_message.css");
            
            if (doc.body == null) {
                doc.appendChild(doc.createElement("body"));
            }
            
            var head = doc.getElementsByTagName("head");
            if (head.length > 0) {
                head = head[0];
                head.appendChild(style);
            }
            
            var body = doc.body;            
            body.innerHTML = body.innerHTML + text;
            
            var links = body.getElementsByTagName("a");
	        var removeLinks = [];
	        for (var i=0; i<links.length; i++) {
		        var link = links[i];
		        if (link.href.substring(0, 7).toLowerCase() == "mailto:") {
			        link.parentNode.insertBefore(this._createMailLink({
				        mail: link.href.substring(7, link.href.length), 
				        name: link.text
			        }), link);
			        removeLinks.push(link);
		        }
		        else {
			        link.target = "_blank";
		        }
	        }
	        for (var i=0; i<removeLinks.length; i++) {
		        EzWebExt.removeFromParent(removeLinks[i]);
	        }
	
	        var images = body.getElementsByTagName("img");
	        for (var i=0; i<images.length; i++) {
		        var image = images[i];
		        var imageId = image.src.substring(4, image.src.length); // TODO Mejorar con expresion regular
		        if (Utils.containElement(mail["contentids"], imageId, false)) {
		            this.getEmbedImage(mail, image, imageId);
		        }
	        }
        }, this);
        
        if (this.browser.isIE()) {
            var handler = function() {
                var doc = tablebodyObj.contentWindow.document;
                if (doc.readyState == "complete") {
                    EzWebExt.removeEventListener(tablebodyObj, "readystatechange", handler, true);
                    objectHandler(doc);
                }
            };
            EzWebExt.addEventListener(tablebodyObj, "readystatechange", handler, true);
        }
        else {
            tablebodyObj.src = "about:blank";
            EzWebExt.addEventListener(tablebodyObj, "load", function() {
                objectHandler(tablebodyObj.contentDocument);
            }, true);            
        }
	    
	    tablebody.appendChild(tablebodyObj);
	    
	    var tab = this.notebook.createTab({name: Utils.subString(mail["subject"],15), initiallyVisible: true, title: mail["subject"]});
	    tab.appendChild(content_right);
	    tab.setIcon(this.getResourceURL("images/message.png"));
	
	    var openDetails = document.createElement("img");
	    openDetails.src = this.getResourceURL("images/open-details.png");
	    openDetails.title = _("Show details");
	    EzWebExt.addClassName(openDetails,"details_button");
	
	    var closeDetails = document.createElement("img");
	    closeDetails.src = this.getResourceURL("images/close-details.png");
	    closeDetails.title = _("Hide details");
	    EzWebExt.addClassName(closeDetails,"details_button");
	    closeDetails.style.display = "none";
	
	    EzWebExt.addEventListener(openDetails, "click", EzWebExt.bind(function(e) {
		    headerrow.style.height = "160px";
		    tablebody.style.top = "170px";
		    closeDetails.style.display = "block";
		    e.target.style.display = "none";
		    row_date.style.display = "block";
		    tab.repaint(false);
	    }, this), false);
	
	    EzWebExt.addEventListener(closeDetails, "click", EzWebExt.bind(function(e) {
		    headerrow.style.height = "44px";
		    tablebody.style.top = "54px";
		    openDetails.style.display = "block";
		    e.target.style.display = "none";
		    row_date.style.display = "none";
		    tab.repaint(false);
	    }, this), false);
	
	    headerrow.appendChild(openDetails);
	    headerrow.appendChild(closeDetails);
	
	    tab.repaint(false);
	    
	    this.enableGeneralUID();
	    
	    if (mail["flags_updated"]) {
	        this.getFolderInfo(response["mailbox"]);
	    }
	}
	else {
	    this.enableGeneralUID();
	}
}

ClienteCorreo.prototype.getEmbedImage = function(mail, image, imageId) {
	
	var context = {self: this, image: image};
	
	if (AccountsManager.isConfigured()) {
		this.sendPost(
			Utils.urlJoin(
			    this.mailproxyURL, 
			    "imap/mailbox/messages/uid/", 
			    mail["uid"], 
			    "image"
			),
			Utils.urlParams({
			    config: Utils.toJSON(AccountsManager.getInAccount().getConfig()),
			    mailbox: AccountsManager.getInAccount().getSelectedMailboxName(),
			    imageid: imageId
			}),
			EzWebExt.bind(function(transport){
			    this.self.onSuccessGetEmbedImage(transport, this.image);
			}, context),			
			function(){},
			function(){}
		);
	}
}

ClienteCorreo.prototype.onSuccessGetEmbedImage = function(transport, image) {
    if (image) {
	    image.src = transport.responseText;
	}
}

ClienteCorreo.prototype.onSuccessGetMailsByFolder = function(transport) {
	this._getMails(transport, false);
}

ClienteCorreo.prototype.onSuccessSearchMails = function(transport) {
	this._getMails(transport, true);
}

ClienteCorreo.prototype.onSuccessSendMail = function(transport) {
	this.showAlternative(this.MAIN_ALTERNATIVE);
	this.form_send["subject"].reset();
	this.form_send["to"].reset();
	this.form_send["cc"].reset();
	this.form_send["bcc"].reset();
	tinyMCE.get(this.form_send["message"]).setContent("");
	this.form_send["multi_selector"].reset();
	this.enableGeneralUID();
}

//////////////////////////////////////////////////
/////// Class AccountsManagerBasic ///////////////
//////////////////////////////////////////////////

var AccountsManagerBasic = function() {

	// Available Protocols
	this.IMAP = "IMAP";
	this.POP3 = "POP3";
	this.SMTP = "SMTP";
	
	// Security
	this.NON_SECURE = "NON_SECURE";
	this.TLS = "TLS";
	this.SSL = "SSL";
	
	this.inAccount = null;
	this.outAccount = null;
}

AccountsManagerBasic.prototype.setInAccount = function(config) {
	this.inAccount = new Account(config);
}

AccountsManagerBasic.prototype.getInAccount = function() {
	return this.inAccount;
}

AccountsManagerBasic.prototype.setOutAccount = function(config) {
	this.outAccount = new Account(config);
}

AccountsManagerBasic.prototype.getOutAccount = function() {
	return this.outAccount;
}

AccountsManagerBasic.prototype.toJSON = function() {
	return Utils.toJSON({
		inAccount: this.inAccount, 
		outAccount: this.outAccount
	});
}

AccountsManagerBasic.prototype.isConfigured = function() {
	return (this.inAccount != null) && (this.outAccount != null);
}

AccountsManagerBasic.prototype.save = function() {
	ClienteCorreo.accountsProp.set(this.toJSON());
}

AccountsManagerBasic.prototype.restore = function() {
    try {
        var accounts = eval("(" + ClienteCorreo.accountsProp.get() + ")");
        if (accounts) { 
            if (("inAccount" in accounts) && (accounts.inAccount != null)) {
                this.setInAccount(accounts.inAccount);
            }
            if (("outAccount" in accounts) && (accounts.outAccount != null)) {
                this.setOutAccount(accounts.outAccount);
            }
        }
    }
    catch(e){}
}

AccountsManagerBasic.prototype.saveForm = function() {
    if (!this.validateForm()) {
        return false;
    }
	this.setInAccount({
		name:       "",
		account:    ClienteCorreo.form_in_config["account"].getValue(),
		protocol:   ClienteCorreo.form_in_config["protocol"].getValue(),
		connection: ClienteCorreo.form_in_config["connection"].getValue(),
		host:       ClienteCorreo.form_in_config["host"].getValue(),
		port:       ClienteCorreo.form_in_config["port"].getValue(),
		username:   ClienteCorreo.form_in_config["username"].getValue(),
		password:   ClienteCorreo.form_in_config["password"].getValue()
	});
	this.setOutAccount({
		name:       ClienteCorreo.form_out_config["name"].getValue(),
		account:    ClienteCorreo.form_out_config["account"].getValue(),
		protocol:   ClienteCorreo.form_out_config["protocol"].getValue(),
		connection: ClienteCorreo.form_out_config["connection"].getValue(),
		host:       ClienteCorreo.form_out_config["host"].getValue(),
		port:       ClienteCorreo.form_out_config["port"].getValue(),
		username:   ClienteCorreo.form_out_config["username"].getValue(),
		password:   ClienteCorreo.form_out_config["password"].getValue()
	});
	this.save();
	return true;
}

AccountsManagerBasic.prototype.validateForm = function() {
    for (var k in ClienteCorreo.form_in_config) {
        if (ClienteCorreo.form_in_config[k] == "") {
            return false;
        }
    }
    for (var k in ClienteCorreo.form_out_config) {
        if (ClienteCorreo.form_out_config[k] == "") {
            return false;
        }
    }
    return true;
}

AccountsManagerBasic.prototype.resetForm = function() {
	if (this.inAccount != null) {
		ClienteCorreo.form_in_config["account"].setValue(this.inAccount["account"]);
		ClienteCorreo.form_in_config["host"].setValue(this.inAccount["host"]);
		ClienteCorreo.form_in_config["port"].setValue(this.inAccount["port"]);
		ClienteCorreo.form_in_config["protocol"].setValue(this.inAccount["protocol"]);
		ClienteCorreo.form_in_config["connection"].setValue(this.inAccount["connection"]);
		ClienteCorreo.form_in_config["username"].setValue(this.inAccount["username"]);
		ClienteCorreo.form_in_config["password"].setValue(this.inAccount["password"]);
	}
	else {
		if (ClienteCorreo.form_in_config["account"]) ClienteCorreo.form_in_config["account"].reset();
		if (ClienteCorreo.form_in_config["host"]) ClienteCorreo.form_in_config["host"].reset();
		if (ClienteCorreo.form_in_config["port"]) ClienteCorreo.form_in_config["port"].reset();
		if (ClienteCorreo.form_in_config["protocol"]) ClienteCorreo.form_in_config["protocol"].reset();
		if (ClienteCorreo.form_in_config["connection"]) ClienteCorreo.form_in_config["connection"].reset();
		if (ClienteCorreo.form_in_config["username"]) ClienteCorreo.form_in_config["username"].reset();
		if (ClienteCorreo.form_in_config["password"]) ClienteCorreo.form_in_config["password"].reset();
	}
	if (this.outAccount != null) {
	    ClienteCorreo.form_out_config["name"].setValue(this.outAccount["name"]);
		ClienteCorreo.form_out_config["account"].setValue(this.outAccount["account"]);
		ClienteCorreo.form_out_config["host"].setValue(this.outAccount["host"]);
		ClienteCorreo.form_out_config["port"].setValue(this.outAccount["port"]);
		ClienteCorreo.form_out_config["protocol"].setValue(this.outAccount["protocol"]);
		ClienteCorreo.form_out_config["connection"].setValue(this.outAccount["connection"]);
		ClienteCorreo.form_out_config["username"].setValue(this.outAccount["username"]);
		ClienteCorreo.form_out_config["password"].setValue(this.outAccount["password"]);
	}
	else {
	    if (ClienteCorreo.form_out_config["name"]) ClienteCorreo.form_out_config["name"].reset();
		if (ClienteCorreo.form_out_config["account"]) ClienteCorreo.form_out_config["account"].reset();
		if (ClienteCorreo.form_out_config["host"]) ClienteCorreo.form_out_config["host"].reset();
		if (ClienteCorreo.form_out_config["port"]) ClienteCorreo.form_out_config["port"].reset();
		if (ClienteCorreo.form_out_config["protocol"]) ClienteCorreo.form_out_config["protocol"].reset();
		if (ClienteCorreo.form_out_config["connection"]) ClienteCorreo.form_out_config["connection"].reset();
		if (ClienteCorreo.form_out_config["username"]) ClienteCorreo.form_out_config["username"].reset();
		if (ClienteCorreo.form_out_config["password"]) ClienteCorreo.form_out_config["password"].reset();
	}
}

/////////////////////////////////////////////
////////// Class Account ////////////////////
/////////////////////////////////////////////

var Account = function(config) {
	this.name = (config["name"])?config["name"]:"";
	this.account = (config["account"])?config["account"]:"";
	this.protocol = (config["protocol"])?config["protocol"]:AccountsManager.IMAP;
	this.connection = (config["connection"])?config["connection"]:AccountsManager.SSL;
	this.host = (config["host"])?config["host"]:"";
	this.port = (config["port"])?config["port"]:993;
	this.username = (config["username"])?config["username"]:"";
	this.password = (config["password"])?config["password"]:"";
	
	this.mailboxList = {};
	this.oldState = {};
	
	this.DEFAULT_MAILBOX = "INBOX";
	this.selectedMailbox = null;
	this.resetSelectedMailbox();
}

Account.prototype.compareTo = function(account) {
    return this.account = account;
}

Account.prototype.setSelectedMailbox = function(mailbox) {
    if (this.mailboxList[mailbox]) {
        this.selectedMailbox = mailbox;
    }
    else {
        this.resetSelectedMailbox();
    }
}

Account.prototype.getSelectedMailbox = function() {
    return this.mailboxList[this.selectedMailbox];
}

Account.prototype.getSelectedMailboxName = function() {
    return this.selectedMailbox;
}

Account.prototype.resetSelectedMailbox = function() {
    this.selectedMailbox = this.DEFAULT_MAILBOX;
}

Account.prototype.clearMailboxList = function() {
    this.oldState = this.mailboxList;
	this.mailboxList = {};
}

Account.prototype.addMailbox = function(mailbox) {
    // Devuelve true si el mailbox debe estar desplegado en el arbol de directorios
    mailbox["icon"] = this._getFolderIcon(mailbox.full_name, false);
    mailbox["icon_selected"] = this._getFolderIcon(mailbox.full_name, true);
    mailbox["name"] = this.getFolderName(mailbox.full_name, mailbox.name);
	this.mailboxList[mailbox["full_name"]] = mailbox;
	if (this.oldState[mailbox["full_name"]] && (this.oldState[mailbox["full_name"]].state == "opened")) {
	    return true;
	}
	else {
	    return false;
	}
}

Account.prototype.getMailboxCounter = function(key) {
    if (this.mailboxList[key]) {
        if (this.mailboxList[key]["counter"]) {
            return this.mailboxList[key]["counter"];
        }
        if (this.oldState[key] && this.oldState[key]["counter"]) {
            return this.oldState[key]["counter"];
        }
    }
    return 0;
}

Account.prototype.getMailboxIcon = function(key, selected) {
	return this.mailboxList[key][(selected)?"icon_selected":"icon"];
}

Account.prototype.getMailboxById = function(key) {
	return this.mailboxList[key];
}

Account.prototype.getMailboxShortName = function(key) {
	return this.mailboxList[key].name;
}

Account.prototype.getConfig = function() {
	return {
	    name: this.name,
		account: this.account,
		connection: this.connection,
		host: this.host,
		port: this.port,
		username: this.username,
		password: this.password
	};
}


Account.prototype.getFolderName = function(full_name, name) {
    var nameList = ["inbox", "trash", "junk", "spam", "sent", "drafts"];
    if (full_name.toLowerCase() == name.toLowerCase()) {
        if (Utils.containElement(nameList, name, true)) {
            name = _(name.toLowerCase());
        }
    }
    return name;
}

Account.prototype._getFolderIcon = function(name, selected) {
    var images = ["inbox", "trash", "spam", "sent", "drafts"];
    var image = "folder";
    switch(name.toLowerCase()) {
        case "inbox":
            image = images[0];
            break;
        case "trash":
            image = images[1];
            break;
        case "junk":
        case "spam":
            image = images[2];
            break;
        case "sent":
            image = images[3];
            break;
        case "drafts":
            image = images[4];
            break;
    }
    return ClienteCorreo.getResourceURL("images/" + image + ((selected)?"-selected":"") + ".png");
}

/////////////////////////////////////////////
////////// HeaderButton /////////////////////
/////////////////////////////////////////////

var HeaderButton = function(enable_image, disable_image, title, handler, className) {
    this.enable_image = enable_image;
    this.disable_image = disable_image;
    this.title = title;
    this.handler = handler;
    
    className = (className)?className:null;
    
    this._createInterface(className);
    this.setDisabled(false);
}

HeaderButton.prototype._createInterface = function(className) {
    this.uid = document.createElement("div");
	EzWebExt.addClassName(this.uid, "image");
	if (className)
	    EzWebExt.addClassName(this.uid, className);
	
	this.img = document.createElement("img");
	EzWebExt.addEventListener(this.img, "click", EzWebExt.bind(function() {
	    if (!this.disable) {
	        this.handler();
	    }
	}, this), false);
	this.uid.appendChild(this.img);
}

HeaderButton.prototype.hide = function(hide) {
	this.uid.style.display = (hide)?"none":"block";
}

HeaderButton.prototype.setDisabled = function(disable) {
    this.disable = disable;
    if (disable) {
        this.setImage(this.disable_image);
        this.img.title = "";
        EzWebExt.addClassName(this.img, "disabled");
    }
    else {
        this.setImage(this.enable_image);
        this.setTitle(this.title);
        EzWebExt.removeClassName(this.img, "disabled");
    }
}

HeaderButton.prototype.setTitle = function(title) {
    this.title = title;
    this.img.title = title;
}

HeaderButton.prototype.setImage = function(image) {
    this.img.src = image;
}

HeaderButton.prototype.changeImage = function(enable_image, disable_image) {
    this.setImage((this.disable)?disable_image:enable_image);
    this.enable_image = enable_image;
    this.disable_image = disable_image;
}

HeaderButton.prototype.insertInto = function(parent) {
    parent.appendChild(this.uid);
}

/////////////////////////////////////////////
////////// SearchInput //////////////////////
/////////////////////////////////////////////

var SearchInput = function(enable_image, disable_image, title, handler) {
    // Constants
	this.SEARCH_SUBJECT         = "SUBJECT";
	this.SEARCH_FROM            = "FROM";
	this.SEARCH_SUBJECT_OR_FROM = "SUBJECT_OR_FROM";
	this.SEARCH_TO_OR_CC        = "TO_OR_CC";
	this.SEARCH_BODY            = "BODY";
    
    this.searchOption = this.SEARCH_SUBJECT;
	this.searchKeyword = "";
    
    // Attributes
    this.enable_image = enable_image;
    this.disable_image = disable_image;
    this.title = title;
    this.handler = handler;
    
    this._createInterface();
    this.setDisabled(false);
}

SearchInput.prototype._createInterface = function() {
    this.uid = document.createElement("div");
	EzWebExt.addClassName(this.uid, "input");
	
	this.input = new StyledElements.StyledTextField();
	EzWebExt.addEventListener(this.input.inputElement, "keypress", EzWebExt.bind(function(e) {
		if (e.keyCode == 13) {
		    if (!this.disable) {
	           this.handler(e);
	        }
		}
	}, this), false);
	this.input.insertInto(this.uid);
	
	this.img = document.createElement("img");
	EzWebExt.addEventListener(this.img, "click", EzWebExt.bind(function(){
	    this.openDialog();
	}, this), false);
	this.uid.appendChild(this.img);
	
	this.search_options = document.createElement("div");
	this.search_options.id = "search_options";
	this.search_options.style.display = "none";
	EzWebExt.addEventListener(this.search_options, "click", EzWebExt.bind(function() {
		this.closeDialog();
	}, this), false);
	document.body.appendChild(this.search_options);
	
	this.search_options_menu = document.createElement("div");
	this.search_options_menu.id = "search_options_menu";
	this.search_options_menu.appendChild(this._createOption(_("Subject"), this.SEARCH_SUBJECT, true));
	this.search_options_menu.appendChild(this._createOption(_("Sender"), this.SEARCH_FROM, false));
	this.search_options_menu.appendChild(this._createOption(_("Subject or Sender"), this.SEARCH_SUBJECT_OR_FROM, false));
	this.search_options_menu.appendChild(this._createOption(_("For or Cc"), this.SEARCH_TO_OR_CC, false));
	this.search_options_menu.appendChild(this._createOption(_("Body"), this.SEARCH_BODY, false));
	this.search_options.appendChild(this.search_options_menu);
}

SearchInput.prototype._createOption = function(text, value, checked) {
	var option = document.createElement("div");
	EzWebExt.addClassName(option, "option");
	var context = {element: option, self: this};
	EzWebExt.addEventListener(option, "mouseover", EzWebExt.bind(function() {
	    if (!this.self.disable) {
		    this.element.style.backgroundColor = "#FCD18E";
		}
	}, context), false);
	EzWebExt.addEventListener(option, "mouseout", EzWebExt.bind(function() {
		this.element.style.backgroundColor = "transparent";
	}, context), false);
	
	var span = document.createElement("span");
	var radio = document.createElement("input");
	radio.type = "radio";
	radio.name = "search_options";
	radio.value = value;
	span.appendChild(radio);
	option.appendChild(span);
	
	span = document.createElement("span");
	EzWebExt.addClassName(span, "text");
	span.appendChild(document.createTextNode(text));
	option.appendChild(span);
	
	EzWebExt.addEventListener(option, "click", EzWebExt.bind(function() {
	    if (!this.disable) {
    		this.selectSearchOption(radio);
        }
	}, this), false);

  	if (checked) 
		radio.checked = true;

	return option;
}

SearchInput.prototype.selectSearchOption = function(radioButton) {
	radioButton.checked = 'checked';
	this.searchOption = radioButton.value;
}

SearchInput.prototype.getSearchOption = function() {
	return this.searchOption;
}

SearchInput.prototype.getSearchKeyword = function() {
	return this.searchKeyword;
}

SearchInput.prototype.setSearchKeyword = function(value) {
	this.searchKeyword = value;
}

SearchInput.prototype.openDialog = function() {
	if (!this.disable) {
	    this.search_options.style.display = "block";
	}
}

SearchInput.prototype.closeDialog = function() {
	this.search_options.style.display = "none";
}

SearchInput.prototype.hide = function(hide) {
	this.uid.style.display = (hide)?"none":"block";
}

SearchInput.prototype.setDisabled = function(disable) {
    this.disable = disable;
    if (disable) {
        this.setImage(this.disable_image);
        this.img.title = "";
        EzWebExt.addClassName(this.img, "disabled");
        EzWebExt.addClassName(this.search_options_menu, "disabled");
        EzWebExt.addClassName(this.uid, "disabled");
    }
    else {
        this.setImage(this.enable_image);
        this.setTitle(this.title);
        EzWebExt.removeClassName(this.img, "disabled");
        EzWebExt.removeClassName(this.search_options_menu, "disabled");
        EzWebExt.removeClassName(this.uid, "disabled");
    }
}

SearchInput.prototype.setTitle = function(title) {
    this.title = title;
    this.img.title = title;
}

SearchInput.prototype.setImage = function(image) {
    this.img.src = image;
}

SearchInput.prototype.insertInto = function(parent) {
    parent.appendChild(this.uid);
}

/////////////////////////////////////////////
////////// Class MultiSelector //////////////
/////////////////////////////////////////////

var MultiSelector = function(target, list_target) {
	this.target = target;
	this.list_target = list_target;
	this.files = [];
	this.urls = [];
	this.reset();
	
	this.URL_SEPARATOR = "/";
	this.FILE_SEPARATOR = "/";
	if (navigator.platform && (navigator.platform.toLowerCase().substring(0,3) == "win")) {
	    this.FILE_SEPARATOR = "\\";
	}
}

MultiSelector.prototype.isFile = function(element) {
    return ((typeof element).toLowerCase() == 'object') && 
        ("tagName" in element) && 
        (element.tagName.toLowerCase() == 'input') && 
        (element.type.toLowerCase() == 'file');
}

MultiSelector.prototype.isURL = function(element) {
    return (typeof element).toLowerCase() == 'string';
}

MultiSelector.prototype.getSize = function() {
    return this.urls.length + this.files.length - 1;
}

MultiSelector.prototype.getURLs = function() {
    return this.urls;
}

MultiSelector.prototype.add = function(element) {
    if (this.isFile(element)) {
        this._addFile(element);
    }
    else if (this.isURL(element)) {
        this._addURL(element);
    }
}

MultiSelector.prototype.remove = function(element) {
    if (this.isFile(element)) {
        this._removeFile(element);
    }
    else if (this.isURL(element)) {
        this._removeURL(element);
    }
}

MultiSelector.prototype.exist = function(element) {
    if (this.isFile(element)) {
        return this._existFile(element);
    }
    else if (this.isURL(element)) {
        return this._existURL(element);
    }
    return false;
}

MultiSelector.prototype.getName = function(element) {
    if (this.isFile(element)) {
        return this._getFileName(element);
    }
    else if (this.isURL(element)) {
        return this._getURLName(element);
    }
    return "";
}

MultiSelector.prototype.getPath = function(element) {
    if (this.isFile(element)) {
        return this._getFilePath(element);
    }
    else if (this.isURL(element)) {
        return this._getURLPath(element);
    }
    return "";
}

MultiSelector.prototype._createFileElement = function() {
	var attach_file = document.createElement("input");
	attach_file.type = "file";
	attach_file.title = _("Attach files");
	
	return attach_file;
}

MultiSelector.prototype._getFilePath = function(file) {
    return file.value;
}

MultiSelector.prototype._getFileName = function(file) {
	if (file.files && (file.files.length > 0)) {
        return file.files[0].fileName;
    }
    var fileName = this._getFilePath(file).split(this.FILE_SEPARATOR);
    return fileName[fileName.length-1];
}

MultiSelector.prototype._getURLName = function(url) {
	var urlName = url.split(this.URL_SEPARATOR);
    return urlName[urlName.length-1];
}

MultiSelector.prototype._addFile = function(element) {
	element.name = 'file_' + this.files.length;
    EzWebExt.addEventListener(element, "change", EzWebExt.bind(function(e) {
		if (e.target.value == "") {
		    return;
		}
		if (this.exist(e.target)) {
		    ClienteCorreo.alert(_("Warning"), _("Already added a file with the name") + ": \"" + this.getName(e.target) + "\"", EzWebExt.ALERT_WARNING);
		    e.target.value = "";
		    return;
		}
		var new_element = this._createFileElement();
		e.target.parentNode.insertBefore(new_element, e.target);
		this.add(new_element);
		this.addListRow(e.target);
		e.target.style.display = "none";
	}, this), false);
	
	this.files.push(element);
}

MultiSelector.prototype._addURL = function(element) {
    element = Utils.urlNormalize(element);
	if (element == "" || this.exist(element)) {
	    return;
	}
	this.addListRow(element);
	this.urls.push(element);
}

MultiSelector.prototype.addListRow = function(element) { 
	var new_row = document.createElement('div');
	EzWebExt.addClassName(new_row, "attach_file");
	
	var name = this.getName(element);
	var new_row_span = document.createElement('span');
	new_row_span.appendChild(document.createTextNode(Utils.subFileName(name, 30)));
	new_row_span.title = name;
	new_row.appendChild(new_row_span);
	
	var new_row_button = document.createElement('img');
	new_row_button.src = ClienteCorreo.getResourceURL("images/delete-attach.png");
	new_row_button.title = _("Delete");
	new_row_button.style.display = "none";
	EzWebExt.addEventListener(new_row_button, "click", EzWebExt.bind(function(e) {
	    if (this.isFile(element)) {
		    EzWebExt.removeFromParent(element);
		}
		EzWebExt.removeFromParent(e.target.parentNode);
		this.remove(element);
	}, this), false);
	new_row.appendChild(new_row_button);
	
	EzWebExt.addEventListener(new_row, "mouseover", function(e) {
		new_row.style.backgroundColor = "#FCD18E";
		new_row_button.style.display = "block";
	}, false);
	EzWebExt.addEventListener(new_row, "mouseout", function(e) {
		new_row.style.backgroundColor = "#FFFFFF";
		new_row_button.style.display = "none";
	}, false);
	
	this.list_target.appendChild(new_row);
}

MultiSelector.prototype._existURL = function(url) {
    return Utils.containElement(this.urls, url, true);
}

MultiSelector.prototype._existFile = function(file) {
    var fileName = file.value;
    var size = 0;
    for (var i=0; i<this.files.length-1; i++) {
        if (this.getName(this.files[i]) == fileName) {
            return true;
        }
    }
    return false;
}

MultiSelector.prototype._removeFile = function(file) {
	var index = Utils.getIndexElement(this.files, file, false);
	if (index != -1) {
	    this.files.splice(index,1);
	    this._recalculateFileNames();
	}
}

MultiSelector.prototype._removeURL = function(url) {
	var index = Utils.getIndexElement(this.urls, url, true);
	if (index != -1) {
	    this.urls.splice(index,1);
	}
}

MultiSelector.prototype._recalculateFileNames = function() {
	for (var i=0; i<this.files.length; i++) {
		this.files[i].name = "files_" + i;
	}
}

MultiSelector.prototype.reset = function() {
	for (var i=0; i<this.files.length; i++) {
		try {
			EzWebExt.removeFromParent(this.files[i]);
		} catch(e){}
	}
	this.list_target.innerHTML = "";
	this.urls = [];
	this.files = [];
	var attach_file = this._createFileElement();
	this.target.appendChild(attach_file);
	this.add(attach_file);
}

MultiSelector.prototype.haveAttach = function() {
	return this.getSize() > 0;
}

MultiSelector.prototype.hidden = function() {
	if (this.files[this.files.length-1])
		EzWebExt.addClassName(this.files[this.files.length-1], "hidden");
}

MultiSelector.prototype.show = function() {
	if (this.files[this.files.length-1])
		EzWebExt.removeClassName(this.files[this.files.length-1], "hidden");
}

/////////////////////////////////////////////
////////// Class Timer //////////////////////
/////////////////////////////////////////////

var Timer = function(handler, minutes) {
    this.MINUTE = 60*1000;
    this.MIN_TIME = 5 * this.MINUTE;
    this.interval = 0;
    this.handler = handler;
    this.time = 0;
    this.setTimeInMinutes(minutes);
}

Timer.prototype.start = function() {
    this.restart();
}

Timer.prototype.restart = function() {
    this.stop();
    if (this.time >= this.MIN_TIME) {
        this.interval = setInterval(this.handler, this.time);
    }
}

Timer.prototype.stop = function() {
    try {
        clearInterval(this.interval);
    }
    catch(e){}
}

Timer.prototype.setTimeInMinutes = function(minutes) {
    this.time = minutes * this.MINUTE;
}

/////////////////////////////////////////////
////////// Class Utils //////////////////////
/////////////////////////////////////////////

var Utils = function() {
}

Utils.prototype.compareStrings = function(a, b) {
	if (a == b) {
	    return 0;
	}
	else if (a > b) {
	    return 1;
	}
	else {
	    return -1;
	}
}

Utils.prototype.evalMailList = function(mails) {
	if (mails.length == 1 && mails[0] == "")
		return true;
	for (var i=0; i<mails.length; i++) {
		var re = new RegExp(/\S+[\.\S+]*@\S+[\.\S+]+/);
  		if (!mails[i].match(re))
    			return false;
	}
	return true;
}

Utils.prototype.containElement = function(list, element, ignoreCase) {
	return this.getIndexElement(list, element, ignoreCase) >= 0;
}

Utils.prototype.getIndexElement = function(list, element, ignoreCase) {
	for (var i=0; i<list.length; i++) {
		if ((!ignoreCase && (list[i] == element)) || 
			(ignoreCase && (list[i].toUpperCase() == element.toUpperCase()))) {
			
			return i;
		}
	}
	return -1;
}

Utils.prototype.stopEvent = function(e) {
    if (!e) e = window.event;
    if (e.stopPropagation) {
        e.stopPropagation();
    } else {
        e.cancelBubble = true;
    }
}

Utils.prototype.subFileName = function(fileName, maxSize) {
	if (!fileName)
		fileName = ""; 
	if (fileName.length > maxSize) {
		var aux = fileName.split(".");
		var ext = aux[aux.length-1];
		if ((aux.length > 1) && (ext.length <= 10)) {
			var name = fileName.substring(0, fileName.length-ext.length-1);
			fileName = this.subString(name, maxSize-ext.length+1) + ext;
		}
		else {
			fileName = this.subString(fileName, maxSize);
		}
	}
	return fileName;
}

Utils.prototype.subString = function(word, maxSize) {
	if (!word)
		word = ""; 
	if (word.length > maxSize) {
		word = word.substring(0, maxSize-4) + "...";
	}
	return word;
}

Utils.prototype.formatDate = function(longDate) {
	var date = new Date(longDate);
	return this.numberToString(date.getDate()) + "/" + this.numberToString(date.getMonth()+1) + "/" + date.getFullYear() + 
		" " + this.numberToString(date.getHours()) + ":" + this.numberToString(date.getMinutes());
}

Utils.prototype.sizeToString = function(size) {
    var units = [" bytes", " KB", " MB", " GB"];
    var i = 0;
    while ((i<3) && (size>=1024)) {
        size = size / 1024;
        i++;
    }
    return Math.round(size) + units[i];   
}

Utils.prototype.numberToString = function(number) {
	return ((number < 10)? "0":"") + number;
}

Utils.prototype.toJSON = function(object) {
	return JSON.stringify(object, function (key, value) {
	    return value;
	});
}

Utils.prototype.addLoadingImage = function() {
	this.removeLoadingImage();
	var image = document.createElement('img');
	image.id = "loading_image";
	image.setAttribute('src', ClienteCorreo.getResourceURL('images/ajax-loader.gif'));
	document.body.appendChild(image);
}

Utils.prototype.removeLoadingImage = function() {
	var image = document.getElementById("loading_image");
	if (image != null)
		document.body.removeChild(image);
}

Utils.prototype.nonNegative = function(number) {
	return (number > 0)? number: 0;
}

Utils.prototype._searchChildByName = function(root, name) {
    for (var i in root.childNodes) {
        var childNode = root.childNodes[i];
        if (childNode.tagName && (childNode.tagName.toLowerCase() == name)) {
            return childNode;
        }
    }
    return null;
}

Utils.prototype.urlJoin = function(/* arguments */) {
	var path = "";
	for (var i=0; i<arguments.length; i++) {
	    path += this.urlNormalize("" + arguments[i], i!=0) + "/";
	}
    return path.substring(0, path.length-1);
}

Utils.prototype.urlNormalize = function(url, replaceInitialBars) {
    if (!replaceInitialBars) {
		return url.replace(/(^\s*|\/*\s*$)/g, ''); /**/
	}
	else {
	    return url.replace(/(^\s*\/*|\/*\s*$)/g, ''); /**/
	}
}

Utils.prototype.urlParams = function(params) {
	var p = "";
	for (var key in params) {
		p += (key + "=" + encodeURIComponent(params[key]) + "&");
	}
    return p.substring(0, p.length-1);
}

///////////////////////////////////////	
///////////// EzWebExt ////////////////
///////////////////////////////////////

if (EzWebExt.Browser.isIE() && (EzWebExt.Browser.getShortVersion() < 8)) {
    StyledElements.Tab.prototype.repaint = function(temporal) {
        StyledElements.Container.prototype.repaint.call(this, temporal);
        
        if (!temporal) {
            var tablebody = EzWebExt.getElementsByClassName(this.wrapperElement, "tablebody");
            if (tablebody.length > 0) {
                tablebody = tablebody[0];
                var iframe = tablebody.getElementsByTagName("iframe");
                if (iframe.length > 0) {
                    iframe = iframe[0];
                    iframe.style.height = tablebody.offsetHeight + "px";
                }
            }
        }
    }
}

///////////////////////////////////////	
////////////// TinyMCE ////////////////
///////////////////////////////////////

var tinyMCE_config = {
    // General options
    mode : "textareas",
    theme : "advanced",
    editor_selector : "mceSend",
    oninit: ClienteCorreo._resizeTinyMCE,
    //plugins : "safari",

    // Theme options
    theme_advanced_buttons1 : 
	    "bold,italic,underline,strikethrough,|," + 
	    "undo,redo,|," +
	    "justifyleft,justifycenter,justifyright,justifyfull,|," +
	    "fontselect,fontsizeselect,|," +
	    "forecolor,backcolor,|," +
	    "bullist,numlist",
    theme_advanced_buttons2 : "",
    theme_advanced_buttons3 : "",
    theme_advanced_buttons4 : "",
    theme_advanced_toolbar_location : "top",
    theme_advanced_toolbar_align : "left",
    theme_advanced_statusbar_location: "none",
    theme_advanced_font_sizes : "1,2,3,4,5,6,7",
    theme_advanced_more_colors : false
};
