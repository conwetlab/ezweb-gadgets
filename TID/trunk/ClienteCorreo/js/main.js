/////////////////////////////////////////////
////////// Class ClienteCorreo //////////////
/////////////////////////////////////////////

var ClienteCorreo = function() {
	/* Call to the parent constructor */
	EzWebGadget.call(this, {translatable: false, useWidthVar: true});
}

ClienteCorreo.prototype = new EzWebGadget(); /* Extend from EzWebGadget */
ClienteCorreo.prototype.resourcesURL = "http://ezweb.tid.es/repository/ezweb-gadgets/ClienteCorreo/ClienteCorreo_1.6/";

/******************** OVERWRITE METHODS **************************/

ClienteCorreo.prototype.init = function() {
	// Constants
	this.MULTIPLE_CALLS         = true; // Si vale false, se realiza una única petición para solocitar al servidor la lista de directorios y 
	                                    // la información de cada uno de ellos, no se recomienda ya que la petición es muy pesada
	
	this.MAIN_ALTERNATIVE       = 0;
	this.SEND_ALTERNATIVE       = 1;
	this.CONFIG_ALTERNATIVE     = 2;
	this.MAIN_TAB               = 1;

    this.MAILPROXY_URL          = "http://ezweb.tid.es/mailproxy/";
	this.INTERVAL_SIZE          = 20;
	
    // Initialize EzWeb variables
    this.accounts = EzWebAPI.createRWGadgetVariable('accounts');
    this.refreshTime = EzWebAPI.createRGadgetVariable('refresh_time', EzWebExt.bind(this.setRefreshTime, this));
    this.languageCtx = language;
    this.message = EzWebAPI.createRGadgetVariable('emailDetails', EzWebExt.bind(this.showMessageFromSlot, this));
    this.mailsSlot = EzWebAPI.createRGadgetVariable('emails', EzWebExt.bind(this.sendEmailsSlot, this));
    this.subjectSlot = EzWebAPI.createRGadgetVariable('subject', EzWebExt.bind(this.sendSubjectSlot, this));
    this.textSlot = EzWebAPI.createRGadgetVariable('text', EzWebExt.bind(this.sendTextSlot, this));
    this.fromEvent = EzWebAPI.createRWGadgetVariable('fromEvent');
    this.recipientsEvent = EzWebAPI.createRWGadgetVariable('recipientsEvent');
    this.subjectEvent = EzWebAPI.createRWGadgetVariable('subjectEvent');
    this.textEvent = EzWebAPI.createRWGadgetVariable('textEvent');
    this.dateEvent = EzWebAPI.createRWGadgetVariable('dateEvent');
    this.sizeEvent = EzWebAPI.createRWGadgetVariable('sizeEvent');
    
    this.language = this.languageCtx.get();
    
    // Initialize global variables
	// User inteface
	this.alternatives = null;
	this.notebook = null;
		
	this._createUserInterface();
	
	// Load data
	AccountsManager.restore();
	AccountsManager.resetForm();
	this.showAlternative(this.MAIN_ALTERNATIVE);
	this.repaint();
	
	this.timer = new Timer(EzWebExt.bind(function(){
        this.reload(false);
    }, this), parseInt(this.refreshTime.get()));
    this.timer.start();
	
	this.reload(true);
}

ClienteCorreo.prototype.setRefreshTime = function(value) {
    this.timer.setTimeInMinutes(parseInt(value));
    this.timer.restart();
}

ClienteCorreo.prototype.disableGeneralUID = function() {
    Utils.addLoadingImage();
    this.maintab.setDisabled(true);
    this.hpaned.getLeftPanel().setDisabled(true);
    this.refresh_button.setDisabled(true);
    //this.mailbox_button.setDisabled(true);
    //this.send_button.setDisabled(true);
    //this.config_button.setDisabled(true);
    this.send_mail_button.setDisabled(true);
    this.save_config_button.setDisabled(true);
    this.search_input.setDisabled(true);
}

ClienteCorreo.prototype.enableGeneralUID = function() {
    Utils.removeLoadingImage();
    this.maintab.setDisabled(false);
    this.hpaned.getLeftPanel().setDisabled(false);
    this.refresh_button.setDisabled(false);
    //this.mailbox_button.setDisabled(false);
    //this.send_button.setDisabled(false);
    //this.config_button.setDisabled(false);
    this.send_mail_button.setDisabled(false);
    this.save_config_button.setDisabled(false);
    this.search_input.setDisabled(false);
    
}

ClienteCorreo.prototype.repaint = function() {
	var height = (document.defaultView.innerHeight - document.getElementById('header').offsetHeight);
	document.getElementById('content').style.height = height + 'px';
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
	tinyMCE.get(this.form_send["message"].id).setContent(value);
}

ClienteCorreo.prototype.sendSubjectSlot = function(value) {
	this.showAlternative(this.SEND_ALTERNATIVE);
	this.form_send["subject"].setValue(value);
}

/******************** USER INTERFACE METHODS **************************/

ClienteCorreo.prototype._initTinyMCE = function() {
	this._resizeTinyMCE();
	var buttonColors = EzWebExt.getElementsByClassName(document.getElementById("send_message_tbl"), "mceSplitButton");
	for (var i=0; i<buttonColors.length; i++) {
	        var context = {button: buttonColors[i]};
	        context.func = EzWebExt.bind(this._removeColorsTinyMCE, context);
		buttonColors[i].addEventListener("click", context.func, false);
	}
}

ClienteCorreo.prototype._resizeTinyMCE = function() {
	var editor_id = "send_message";
    	var editor = document.getElementById(editor_id); 
    	if (editor) { 
    		if (document.getElementById(editor_id + "_tbl")) {
    			document.getElementById(editor_id + "_tbl").style.height = editor.parentNode.offsetHeight + "px";
    			document.getElementById(editor_id + "_tbl").style.width = "100%";
    		}
    		if (document.getElementById(editor_id + "_ifr"))
    			document.getElementById(editor_id + "_ifr").style.height = (editor.parentNode.offsetHeight - 51) + "px";
    	} 
}

ClienteCorreo.prototype._removeColorsTinyMCE = function() {
	// Eliminar todos los elementos "More Colors"
    	var moreColors = EzWebExt.getElementsByClassName(document.getElementsByTagName("body")[0], "mceMoreColors");
    	for (var i=0; i<moreColors.length; i++)
    		EzWebExt.removeFromParent(moreColors[i].parentNode);
    	// Elimina el handler
    	this.button.removeEventListener("click", this.func, false);
    	this.func = null;
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
	}, this));
	
	this.refresh_button.insertInto(header_left);
	
	this.mailbox_button = new HeaderButton(this.getResourceURL("images/mail-mailbox.png"), this.getResourceURL("images/mail-mailbox-disabled.png"), _("Mailbox"), EzWebExt.bind(function() { 
	    this.showAlternative(this.MAIN_ALTERNATIVE);
	}, this));
	
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
    this.hpaned = new StyledElements.StyledHPaned({handlerPosition: 30, leftMinWidth: 180, rightMinWidth: 400});
	var mainAlternative = this.alternatives.createAlternative();
	mainAlternative.appendChild(this.hpaned);
	
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
	var sendAlternative = this.alternatives.createAlternative();
	
	var send_content = document.createElement("div");
    EzWebExt.addClassName(send_content,"content_right");
    EzWebExt.addClassName(send_content,"send_mail");
        
    sendAlternative.appendChild(send_content);
       
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
		tinyMCE.get(this.form_send["message"].id).setContent("");
	}, this));
	
	cancel_button.insertInto(row);

	this.send_mail_button = new HeaderButton(this.getResourceURL("images/mail-send.png"), this.getResourceURL("images/mail-send-disabled.png"), _("Send"), EzWebExt.bind(function() { 
		var subject = this.form_send["subject"].getValue();
		var to = this.form_send["to"].getValue();
		var cc = this.form_send["cc"].getValue();
		var bcc = this.form_send["bcc"].getValue();
		var message = tinyMCE.get(this.form_send["message"].id).getContent();

		if (subject == "" || (to == "" && cc == "" && bcc == "")) {
			this.alert(_("Warning"), _("Must fill in all form fields"), {type: EzWebExt.ALERT_WARNING});
		}
		else {
			to = to.split(/\s*,\s*/);
			cc = cc.split(/\s*,\s*/);
			bcc = bcc.split(/\s*,\s*/);
			
			if (Utils.evalMailList(to) && Utils.evalMailList(cc) && Utils.evalMailList(bcc))
				this.sendMail(subject, message, to, cc, bcc);
			else
				this.alert(_("Warning"), _("All email recipients must be valid"), {type: EzWebExt.ALERT_WARNING});
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
	
	var openDetails = document.createElement("img");
	openDetails.src = this.getResourceURL("images/open-details.png");
	openDetails.title = _("Show details");
	EzWebExt.addClassName(openDetails,"details_button");
	
	var closeDetails = document.createElement("img");
	closeDetails.src = this.getResourceURL("images/close-details.png");
	closeDetails.title = _("Hide details");
	EzWebExt.addClassName(closeDetails,"details_button");
	closeDetails.style.display = "none";
	
	var attach_div = document.createElement("div");
	EzWebExt.addClassName(attach_div, "attach");
	this.form_send["attach"] = attach_div;
	
	var attach = document.createElement("div");
	EzWebExt.addClassName(attach, "attach_button");
		
	this.form_send["multi_selector"] = new MultiSelector(attach, attach_div, -1);
	
	openDetails.addEventListener("click", EzWebExt.bind(function(e) {
		this.form_send["header"].style.height = "191px";
		this.form_send["header"].scrollTop = "0px"
		this.form_send["body"].style.top = "205px";
		this._resizeTinyMCE();
		closeDetails.style.display = "block";
		e.target.style.display = "none";
		EzWebExt.removeClassName(this.form_send["row_cc"], "hidden");
		EzWebExt.removeClassName(this.form_send["row_bcc"], "hidden");
		EzWebExt.removeClassName(this.form_send["row_att"], "hidden");
		this.form_send["multi_selector"].show();
	}, this), false);
	
	closeDetails.addEventListener("click", EzWebExt.bind(function(e) {
		this.form_send["header"].style.height = "83px";
		this.form_send["header"].scrollTop = "0px";
		this.form_send["body"].style.top = "97px";
		this._resizeTinyMCE();
		openDetails.style.display = "block";
		e.target.style.display = "none";
		EzWebExt.addClassName(this.form_send["row_cc"], "hidden");
		EzWebExt.addClassName(this.form_send["row_bcc"], "hidden");
		EzWebExt.addClassName(this.form_send["row_att"], "hidden");
		this.form_send["multi_selector"].hidden();
	}, this), false);
	
	row.appendChild(openDetails);
	row.appendChild(closeDetails);
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
	form.action = this.MAILPROXY_URL + "smtp/sender";
	form.method = "POST";
	form.onsubmit = function(){
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
        send_message.id = "send_message";
        tablebody.appendChild(send_message);
        
        this.form_send["message"] = send_message;
	
	//PANEL CONFIGURACION
	var configAlternative = this.alternatives.createAlternative();
	
	var config_content = document.createElement("div");
        EzWebExt.addClassName(config_content,"content_right");
        EzWebExt.addClassName(config_content,"send_mail");
        
        configAlternative.appendChild(config_content);
        
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
		    if (
			    this.form_in_config &&
			    this.form_out_config &&
			    this.form_in_config["account"].getValue() != "" &&
			    this.form_in_config["host"].getValue() != "" &&
			    this.form_in_config["username"].getValue() != "" &&
			    this.form_in_config["password"].getValue() != "" &&
			    this.form_out_config["account"].getValue() != "" &&
			    this.form_out_config["host"].getValue() != "" &&
			    this.form_out_config["username"].getValue() != "" &&
			    this.form_out_config["password"].getValue() != "") {
			
			    AccountsManager.saveForm();
			    this.showAlternative(this.MAIN_ALTERNATIVE);
			    this.reload(true);
		    }
		    else {
			    this.alert(_("Error"), _("Must fill in all form fields"), {type: EzWebExt.ALERT_WARNING});
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
        
        this.form_in_config = {};
	
	var in_account_text = new StyledElements.StyledTextField();
	var in_host_text = new StyledElements.StyledTextField();
	var in_port_text = new StyledElements.StyledNumericField({initialValue: 993, minValue: 0, maxValue: 65535});
	var in_protocol_text = new StyledElements.StyledSelect({initialEntries: [['IMAP']], initialValue: 'IMAP'});
	var in_connection_text = new StyledElements.StyledSelect({initialEntries: [['NON_SECURE', _('Non secure')], ['SSL']], initialValue: 'SSL'});
	var in_username_text = new StyledElements.StyledTextField();
	var in_password_text = new StyledElements.StyledPasswordField();

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

	this.form_out_config = {};
	
	var out_name_text = new StyledElements.StyledTextField();
	var out_account_text = new StyledElements.StyledTextField();
	var out_host_text = new StyledElements.StyledTextField();
	var out_port_text = new StyledElements.StyledNumericField({initialValue: 25, minValue: 0, maxValue: 65535});
	var out_protocol_text = new StyledElements.StyledSelect({initialEntries: [['SMTP']], initialValue: 'SMTP'});
	var out_connection_text = new StyledElements.StyledSelect({initialEntries: [['NON_SECURE', _("Non secure")], ['TLS'], ['SSL']], initialValue: 'NON_SECURE'});
	var out_username_text = new StyledElements.StyledTextField();
	var out_password_text = new StyledElements.StyledPasswordField();

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

	folder.addEventListener("click", EzWebExt.bind(function() {
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
	imageIcon.setAttribute('style', 'visibility:hidden');
	imageIcon.setAttribute('src', this.getResourceURL('images/open.png'));
	imageIcon.addEventListener("click", EzWebExt.bind(function(e) {
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
	children.setAttribute('style', 'display:none');
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
			image.addEventListener("click", EzWebExt.bind(function(){
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
			image.addEventListener("click", EzWebExt.bind(function(){
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
			image.addEventListener("click", EzWebExt.bind(function(){
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
			image.addEventListener("click", EzWebExt.bind(function(){
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
		    row.addEventListener("mouseover", function(){
			    EzWebExt.addClassName(this, "selected");
		    }, false);
		    row.addEventListener("mouseout", function(){
			    EzWebExt.removeClassName(this, "selected");
		    }, false);
		    row.addEventListener("click", EzWebExt.bind(function(){
			    EzWebExt.removeClassName(this.row, "bold");
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

	link.addEventListener("click", EzWebExt.bind(function(e) { 
		this.form_send["subject"].setValue((params["subject"])?params["subject"]:"");
		this.form_send["to"].setValue(mail_addr);
		this.form_send["cc"].setValue((params["cc"])?params["cc"]:"");
		this.form_send["bcc"].setValue((params["bcc"])?params["bcc"]:"");
		tinyMCE.get(this.form_send["message"].id).setContent((params["body"])?params["body"]:"");
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
			this.MAILPROXY_URL + "imap/mailbox/messages/" + this.begin + "/" + this.end, 
			"config=" + encodeURIComponent(Utils.toJSON(AccountsManager.getInAccount().getConfig())) + 
				"&mailbox=" + encodeURIComponent(AccountsManager.getInAccount().getSelectedMailboxName()), 
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
			this.MAILPROXY_URL + "imap/mailbox/messages/search/" + encodeURIComponent(this.search_input.getSearchOption()) + "/" + 
				encodeURIComponent(this.search_input.getSearchKeyword()) + "/" + this.begin + "/" + this.end, 
			"config=" + encodeURIComponent(Utils.toJSON(AccountsManager.getInAccount().getConfig())) + 
				"&mailbox=" + encodeURIComponent(AccountsManager.getInAccount().getSelectedMailboxName()), 
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
			this.MAILPROXY_URL + "imap/mailbox/all" + ((!this.MULTIPLE_CALLS)?"/info":""),
			"config=" + encodeURIComponent(Utils.toJSON(AccountsManager.getInAccount().getConfig())),
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
			        this.MAILPROXY_URL + "imap/mailbox",
			        "config=" + encodeURIComponent(Utils.toJSON(AccountsManager.getInAccount().getConfig())) + 
			            "&mailbox=" + encodeURIComponent(full_name),
			        this.onSuccessGetFolderInfo,
			        function(){},
			        function(){}
		        );
	        }
	    }
	}
}

ClienteCorreo.prototype.getMail = function(mailbox, uid) {
	try {
	if (AccountsManager.isConfigured()) {
		this.disableGeneralUID();
		this.sendPost(
			this.MAILPROXY_URL + "imap/mailbox/messages/uid/" + uid,
			"config=" + encodeURIComponent(Utils.toJSON(AccountsManager.getInAccount().getConfig())) + 
				"&mailbox=" + encodeURIComponent(mailbox),
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
			this.MAILPROXY_URL + "smtp/sender",
			"config=" + encodeURIComponent(Utils.toJSON(outAccount.getConfig())) + 
				"&destination=" + encodeURIComponent(Utils.toJSON(destination)),
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
	this.alert(_("Exception"), _("Line") + ":" + e.lineNumber + " \n" + _("Message") + ": " + e.message, {type: EzWebExt.ALERT_ERROR});
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
		this.alert(_("Error"), response["error"], {type: EzWebExt.ALERT_ERROR});
	}
	else {
		this.alert(_("Error"), response, {type: EzWebExt.ALERT_ERROR});
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

ClienteCorreo.prototype.onSuccessGetFolders = function(transport) {
    var response = eval("(" + transport.responseText + ")");
    var account = AccountsManager.getInAccount();
	if ((account != null) && account.compareTo(response["account"])) {
	    var folderList = response["folderList"];
		document.getElementById("content_left").innerHTML = "";
		account.clearMailboxList();
				
		var priorityFolders = ["inbox", "drafts", "sent", "junk", "spam","trash"];
		
		for (var i=priorityFolders.length-1; i>=0; i--) {
		    // Ponemos en la parte superior de la lista los directorios prioritarios
		    var index = -1;
		    for (var j=0; j<folderList.length; j++) {
		        if (folderList[j].name.toLowerCase() == priorityFolders[i].toLowerCase()) {
		            index = j;
		            break;
		        }
		    }
		    if (index > 0) {
		        var folder = folderList[index];
		        folderList.splice(index,1);
		        //folderList = folderList.slice(0,index).concat(folderList.slice(index+1, folderList.length)); // Sustituido por el splice
		        folderList.unshift(folder);
		    }
		}
		
		for (var i=0; i<folderList.length; i++) {
			var full_name = folderList[i].name;
			var separator = folderList[i].separator;
			var name = full_name.split(separator)[full_name.split(separator).length-1];
			var parent = full_name.substr(0,full_name.length-name.length-separator.length);
			var flags = folderList[i].flags;
			var counter = 0;
			if (folderList[i]["info"]) {
			    counter = parseInt(folderList[i].info.unseen);
			}
			var open = account.addMailbox({
				full_name: full_name,
				flags: flags,
				name: name,
				parent: parent,
				separator: separator,
				state:  "closed",
				counter: counter
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
	
	    var text = "";
	    if (mail["text_html"] == "") {
		    text = "<pre>" + mail["text_plain"].split("\r").join("") + "</pre>";
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
		    tinyMCE.get(this.form_send["message"].id).setContent("<p>" + mail["from"].name + " " + _("wrote") + ":</p><blockquote type='cite'>" + text + "</blockquote>");
		    this.form_send["multi_selector"].reset();
		    this.showAlternative(this.SEND_ALTERNATIVE);
	    }, this));
	
	    reply_all_button.insertInto(row);
	
	    var reply_button = new HeaderButton(this.getResourceURL("images/mail-reply.png"), this.getResourceURL("images/mail-reply-disabled.png"),_("Reply"), EzWebExt.bind(function() { 
		    this.form_send["subject"].setValue("Re: " + ((mail["subject"])?mail["subject"]:""));
		    this.form_send["to"].setValue(mail["from"].mail);
		    this.form_send["cc"].reset();
		    this.form_send["bcc"].reset();
		    tinyMCE.get(this.form_send["message"].id).setContent("<p>" + mail["from"].name + " " + _("wrote") + ":</p><blockquote type='cite'>" + text + "</blockquote>");
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
		    tinyMCE.get(this.form_send["message"].id).setContent(text);
		    this.showAlternative(this.SEND_ALTERNATIVE);
		    // TODO Falta reenviar adjuntos (es un marron)
	    }, this));
	
	    forward_button.insertInto(row);

	    headerrow.appendChild(row);
	
	    row = document.createElement("div");
	    EzWebExt.addClassName(row, "row");
	    EzWebExt.addClassName(row, "mail");
	    row.appendChild(this._createCell(document.createTextNode(_("Date") + ":"), "title"));
	    var date = (mail["date"])?Utils.formatDate(mail["date"]):"";
	    row.appendChild(this._createCell(document.createTextNode(date), "value", date));
	    headerrow.appendChild(row);
	
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
	            form.action = this.MAILPROXY_URL + "imap/mailbox/messages/uid/" + mail["uid"] + "/file";
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
	            new_row.addEventListener("click", EzWebExt.bind(function(e) {
	                if (AccountsManager.isConfigured()) {
        		        // TODO Enviar un chequeo de configuración al servidor
        		        this.form.submit();
        		    }
       	        }, context), false);
       	        new_row.addEventListener("mouseover", EzWebExt.bind(function(e) {
		            this.style.backgroundColor = "#FCD18E";
	            }, new_row), false);
	            new_row.addEventListener("mouseout", EzWebExt.bind(function(e) {
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
            var tablebodyObj = document.createElement("object");
            EzWebExt.addClassName(tablebody, "tablebody");
            tablebody.appendChild(tablebodyObj);

	    tablebodyObj.innerHTML = text;
	
	    var links = tablebodyObj.getElementsByTagName("a");
	    var removeLinks = [];
	    for (var i=0; i<links.length; i++) {
		    var link = links[i];
		    if (link.href.substring(0,7).toUpperCase() == "MAILTO:") {
			    link.parentNode.insertBefore(this._createMailLink({
				    mail: link.href.substring(7,link.href.length), 
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
	
	    var images = tablebodyObj.getElementsByTagName("img");
	    for (var i=0; i<images.length; i++) {
		    var image = images[i];
		    var imageId = image.src.substring(4,image.src.length); // TODO Mejorar con expresion regular
		    if (Utils.containElement(mail["contentids"], imageId, false)) {
		        this.getEmbedImage(mail, image, imageId);
		    }
	    }
	
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
	
	    openDetails.addEventListener("click", EzWebExt.bind(function(e) {
		    headerrow.style.height = "160px";
		    tablebody.style.top = "170px";
		    closeDetails.style.display = "block";
		    e.target.style.display = "none";
	    }, this), false);
	
	    closeDetails.addEventListener("click", EzWebExt.bind(function(e) {
		    headerrow.style.height = "70px";
		    tablebody.style.top = "80px";
		    openDetails.style.display = "block";
		    e.target.style.display = "none";
	    }, this), false);
	
	    headerrow.appendChild(openDetails);
	    headerrow.appendChild(closeDetails);
	
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
			this.MAILPROXY_URL + "imap/mailbox/messages/uid/" + mail["uid"] + "/image",
			"config=" + encodeURIComponent(Utils.toJSON(AccountsManager.getInAccount().getConfig())) +
			"&mailbox=" + encodeURIComponent(AccountsManager.getInAccount().getSelectedMailboxName()) +
			"&imageid=" + encodeURIComponent(imageId),
			
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
	tinyMCE.get(this.form_send["message"].id).setContent("");
	this.form_send["multi_selector"].reset();
	this.enableGeneralUID();
}

/* Instanciate the Gadget class */
ClienteCorreo = new ClienteCorreo();

/////////////////////////////////////////////
/////// Class AccountsManager ////////////////
/////////////////////////////////////////////

var AccountsManager = function(config) {

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

AccountsManager.prototype.setInAccount = function(config) {
	this.inAccount = new Account(config);
}

AccountsManager.prototype.getInAccount = function() {
	return this.inAccount;
}

AccountsManager.prototype.setOutAccount = function(config) {
	this.outAccount = new Account(config);
}

AccountsManager.prototype.getOutAccount = function() {
	return this.outAccount;
}

AccountsManager.prototype.toJSON = function() {
	return Utils.toJSON({
		inAccount: this.inAccount, 
		outAccount: this.outAccount
	});
}

AccountsManager.prototype.isConfigured = function() {
	return (this.inAccount != null) && (this.outAccount != null);
}

AccountsManager.prototype.save = function() {
	ClienteCorreo.accounts.set(this.toJSON());
}

AccountsManager.prototype.restore = function() {

	try {
		var accounts = eval("(" + ClienteCorreo.accounts.get() + ")");
		try {
			var inAccount = accounts.inAccount;
			if (inAccount) {
				this.setInAccount(inAccount);
			}
		}
		catch(e){};
		try {
			var outAccount = accounts.outAccount;
			if (outAccount) {
				this.setOutAccount(outAccount);
			}
		}
		catch(e){}
	}
	catch(e){}
}

AccountsManager.prototype.saveForm = function() {
	this.setInAccount({
		name: "",
		account: ClienteCorreo.form_in_config["account"].getValue(),
		protocol: ClienteCorreo.form_in_config["protocol"].getValue(),
		connection: ClienteCorreo.form_in_config["connection"].getValue(),
		host: ClienteCorreo.form_in_config["host"].getValue(),
		port: ClienteCorreo.form_in_config["port"].getValue(),
		username: ClienteCorreo.form_in_config["username"].getValue(),
		password: ClienteCorreo.form_in_config["password"].getValue()
	});
	this.setOutAccount({
		name: ClienteCorreo.form_out_config["name"].getValue(),
		account: ClienteCorreo.form_out_config["account"].getValue(),
		protocol: ClienteCorreo.form_out_config["protocol"].getValue(),
		connection: ClienteCorreo.form_out_config["connection"].getValue(),
		host: ClienteCorreo.form_out_config["host"].getValue(),
		port: ClienteCorreo.form_out_config["port"].getValue(),
		username: ClienteCorreo.form_out_config["username"].getValue(),
		password: ClienteCorreo.form_out_config["password"].getValue()
	});
	this.save();
}

AccountsManager.prototype.resetForm = function() {
	if (this.inAccount != undefined && this.inAccount != null) {
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
	if (this.outAccount != undefined && this.outAccount != null) {
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
/* Instanciate the AccountsManager class */
AccountsManager = new AccountsManager();

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
    mailbox["icon"] = this._getFolderIcon(mailbox.name, false);
    mailbox["icon_selected"] = this._getFolderIcon(mailbox.name, true);
    mailbox["name"] = this._getFolderName(mailbox.name);
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


Account.prototype._getFolderName = function(name) {
    var nameList = ["inbox", "trash", "junk", "spam", "sent", "drafts", "borradores", "todos", "enviados", "papelera"];
    var b = Utils.containElement(nameList, name, true);
    if (b) {
        name = _(name.toLowerCase());
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
        case "papelera":
            image = images[1];
            break;
        case "junk":
        case "spam":
            image = images[2];
            break;
        case "sent":
        case "enviados":
            image = images[3];
            break;
        case "drafts":
        case "borradores":
            image = images[4];
            break;
    }
    return ClienteCorreo.getResourceURL("images/" + image + ((selected)?"-selected":"") + ".png");
}

/////////////////////////////////////////////
////////// HeaderButton /////////////////////
/////////////////////////////////////////////

var HeaderButton = function(enable_image, disable_image, title, handler) {
    this.enable_image = enable_image;
    this.disable_image = disable_image;
    this.title = title;
    this.handler = handler;
    
    this._createInterface();
    this.setDisabled(false);
}

HeaderButton.prototype._createInterface = function() {
    this.uid = document.createElement("div");
	EzWebExt.addClassName(this.uid, "image");
	
	this.img = document.createElement("img");
	this.img.addEventListener("click", EzWebExt.bind(function() {
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
	this.input.inputElement.addEventListener("keypress", EzWebExt.bind(function(e) {
		if (e.keyCode == 13) {
		    if (!this.disable) {
	           this.handler(e);
	        }
		}
	}, this), false);
	this.input.insertInto(this.uid);
	
	this.img = document.createElement("img");
	this.img.addEventListener("click", EzWebExt.bind(function(){
	    this.openDialog();
	}, this), false);
	this.uid.appendChild(this.img);
	
	this.search_options = document.createElement("div");
	this.search_options.id = "search_options";
	this.search_options.setAttribute("style","display:none;");
	this.search_options.addEventListener("click", EzWebExt.bind(function() {
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
	option.addEventListener("mouseover", EzWebExt.bind(function() {
	    if (!this.self.disable) {
		    this.element.style.backgroundColor = "#FCD18E";
		}
	}, context), false);
	option.addEventListener("mouseout", EzWebExt.bind(function() {
		this.element.style.backgroundColor = "transparent";
	}, context), false);
	
	var span = document.createElement("span");
	var radio = document.createElement("input");
	radio.type = "radio";
	radio.name = "search_options";
	radio.value = value;
	if (checked) 
		radio.checked = "checked";
	span.appendChild(radio);
	option.appendChild(span);
	
	span = document.createElement("span");
	EzWebExt.addClassName(span, "text");
	span.appendChild(document.createTextNode(text));
	option.appendChild(span);
	
	option.addEventListener("click", EzWebExt.bind(function() {
	    if (!this.disable) {
    		this.selectSearchOption(radio);
        }
	}, this), false);

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
        //this.input.inputElement.disable();
        EzWebExt.addClassName(this.img, "disabled");
        EzWebExt.addClassName(this.search_options_menu, "disabled");
        EzWebExt.addClassName(this.uid, "disabled");
    }
    else {
        this.setImage(this.enable_image);
        this.setTitle(this.title);
        //this.input.inputElement.enable();
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

var MultiSelector = function(target, list_target, max) {
	this.target = target;
	this.list_target = list_target;
	this.files = [];
	this.max = (max)?max:-1;
	this.reset();
}


MultiSelector.prototype.MAX_ATTACHMENT = 1048576;

MultiSelector.prototype.createFileElement = function() {
	var attach_file = document.createElement("input");
	attach_file.type = "file";
	attach_file.title = _("Attach files");
	
	return attach_file;
}

MultiSelector.prototype.addElement = function(element) {
	if( element.tagName.toUpperCase() == 'INPUT' && element.type.toUpperCase() == 'FILE' ) { //File input element
		element.name = 'file_' + this.files.length;
		element.addEventListener("change", EzWebExt.bind(function(e) {
		    if (e.target.value == "") {
		        return;
		    }
		    if (this.exist(e.target.value)) {
		        ClienteCorreo.alert(_("Warning"), _("Already added a file with the name") + ": \"" + e.target.value + "\"", {type: EzWebExt.ALERT_WARNING});
		        e.target.value = "";
		        return;
		    }
		    if (this.getSize() > this.MAX_ATTACHMENT) {
		        ClienteCorreo.alert(_("Warning"), _("The max size for attachment files is") + ": " + Utils.sizeToString(this.MAX_ATTACHMENT), {type: EzWebExt.ALERT_WARNING});
		        e.target.value = "";
		        return;
		    }
			var new_element = this.createFileElement();
			e.target.parentNode.insertBefore(new_element, e.target);
			this.addElement(new_element);
			this.addListRow(e.target);
			e.target.style.display = "none";
		}, this), false);
		
		this.files.push(element);
		
		if(this.max != -1 && this.files.length >= this.max) {
			element.disabled = true;
		}
	}
}

MultiSelector.prototype.addListRow = function(element) { 
	var new_row = document.createElement('div');
	EzWebExt.addClassName(new_row, "attach_file");
	
	var new_row_span = document.createElement('span');
	new_row_span.appendChild(document.createTextNode(Utils.subFileName(element.value, 30)));
	var size = 0;
	for (var i=0; i<element.files.length; i++) {
        size += element.files[i].fileSize;
    }
	new_row_span.title = element.value + " - " + Utils.sizeToString(size);
	new_row.appendChild(new_row_span);
	
	var new_row_button = document.createElement('img');
	new_row_button.src = ClienteCorreo.getResourceURL("images/delete-attach.png");
	new_row_button.title = _("Delete");
	new_row_button.style.display = "none";
	new_row_button.addEventListener("click", EzWebExt.bind(function(e) {
		EzWebExt.removeFromParent(element);
		EzWebExt.removeFromParent(e.target.parentNode);
		this.removeFile(element);
		this.recalculateNames();
		if (this.files[this.files.length-1])
			this.files[this.files.length-1].disabled = false;
	}, this), false);
	new_row.appendChild(new_row_button);
	
	new_row.addEventListener("mouseover", function(e) {
		new_row.style.backgroundColor = "#FCD18E";
		new_row_button.style.display = "block";
	}, false);
	new_row.addEventListener("mouseout", function(e) {
		new_row.style.backgroundColor = "#FFFFFF";
		new_row_button.style.display = "none";
	}, false);
	
	this.list_target.appendChild(new_row);
}

MultiSelector.prototype.getFileIndex = function(file) {
	for (var i=0; i<this.files.length; i++) {
		if (this.files[i] == file)
			return i;
	}
	return -1;
}

MultiSelector.prototype.exist = function(fileName) {
    var size = 0;
    for (var i=0; i<this.files.length-1; i++) {
        for (var j=0; j<this.files[i].files.length; j++) {
            if (this.files[i].files[j].fileName == fileName) {
                return true;
            }
        }
    }
    return false;
}

MultiSelector.prototype.getSize = function() {
    var size = 0;
    for (var i=0; i<this.files.length; i++) {
        for (var j=0; j<this.files[i].files.length; j++) {
            size += this.files[i].files[j].fileSize;
        }
    }
    return size;
}

MultiSelector.prototype.removeFile = function(file) {
	var index = this.getFileIndex(file);
	if (index != -1) {
	    this.files.splice(index,1);
		//this.files = this.files.slice(0,index).concat(this.files.slice(index+1, this.files.length)); // Sustituido por el splice
	}
}

MultiSelector.prototype.recalculateNames = function() {
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
	this.files = [];
	var attach_file = this.createFileElement();
	this.target.appendChild(attach_file);
	this.addElement(attach_file);
}

MultiSelector.prototype.haveAttach = function() {
	return this.files.length > 1;
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
	for (var i=0; i<list.length; i++) {
		if ((!ignoreCase && (list[i] == element)) || 
			(ignoreCase && (list[i].toUpperCase() == element.toUpperCase()))) {
			
			return true;
		}
	}
	return false;
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

Utils = new Utils();

///////////////////////////////////////	
////////////// TinyMCE ////////////////
///////////////////////////////////////
tinyMCE.init({
	// General options
	mode : "textareas",
	theme : "advanced",
	plugins : "safari",

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
	theme_advanced_statusbar_location : "bottom",
	theme_advanced_resizing : false,
	
	oninit : EzWebExt.bind(ClienteCorreo._initTinyMCE, ClienteCorreo),
});
