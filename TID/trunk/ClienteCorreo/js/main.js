/////////////////////////////////////////////
////////// Class ClienteCorreo //////////////
/////////////////////////////////////////////

var ClienteCorreo = function() {
	/* Call to the parent constructor */
	EzWebGadget.call(this, {translatable: false});
}

ClienteCorreo.prototype = new EzWebGadget(); /* Extend from EzWebGadget */

ClienteCorreo.prototype.resourcesURL = "http://demo.ezweb.morfeo-project.org/repository/ClienteCorreo/";

/******************** OVERWRITE METHODS **************************/

ClienteCorreo.prototype.init = function() {
	// Constants
	this.MAIN_ALTERNATIVE      = 0;
	this.SEND_ALTERNATIVE      = 1;
	this.CONFIG_ALTERNATIVE    = 2;
	this.MAIN_TAB              = 1;

        this.MAILPROXY_URL         = "http://demo.ezweb.morfeo-project.org/mailproxy/";
	this.INTERVAL_SIZE         = 20;
	
	// Search constants
	this.SEARCH_SUBJECT        = "SUBJECT";
	this.SEARCH_FROM           = "FROM";
	this.SEARCH_SUBJET_OR_FROM = "SUBJET_OR_FROM";
	this.SEARCH_TO_OR_CC       = "TO_OR_CC";
	this.SEARCH_BODY           = "BODY";
        
        // Initialize EzWeb variables
        this.accounts = EzWebAPI.createRWGadgetVariable('accounts');
        this.message = EzWebAPI.createRGadgetVariable('emailDetails', EzWebExt.bind(this.showMessageFromSlot, this));
        
        // Initialize global variables
	this.searchOption = this.SEARCH_SUBJECT;
	this.searchKeyword = ""
	
	// User inteface
	this.alternatives = null;
	this.notebook = null;
		
	this._createUserInterface();
	
	// Load data
	AccountsManager.restore();
	AccountsManager.resetForm();
	this.reload();
}

ClienteCorreo.prototype.repaint = function() {
	var height = (document.defaultView.innerHeight - document.getElementById('header').offsetHeight);
	document.getElementById('content').style.height = height + 'px';
	this.alternatives.repaint();
	this.config_hpaned.repaint();
	this._resizeTinyMCE();
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
	var search_options = document.createElement("div");
	search_options.id = "search_options";
	search_options.setAttribute("style","display:none;");
	search_options.addEventListener("click", function() {
		this.style.display = 'none';
	}, false);
	body.appendChild(search_options);
	
	var search_options_menu = document.createElement("div");
	search_options_menu.id = "search_options_menu";
	search_options_menu.appendChild(this._createOption("Asunto", this.SEARCH_SUBJECT, true));
	search_options_menu.appendChild(this._createOption("Remitente", this.SEARCH_FROM, false));
	search_options_menu.appendChild(this._createOption("Asunto o remitente", this.SEARCH_SUBJECT_OR_FROM, false));
	search_options_menu.appendChild(this._createOption("Para o Cc", this.SEARCH_TO_OR_CC, false));
	search_options_menu.appendChild(this._createOption("Cuerpo del mensaje", this.SEARCH_BODY, false));
	search_options.appendChild(search_options_menu);
	
	var header = document.createElement("div");
	header.id = "header";
	body.appendChild(header);
	
	var header_left = document.createElement("div");
	header_left.id = "header_left";
	header.appendChild(header_left);
	
	header_left.appendChild(this._createHeaderButton("images/view-refresh.png", "Sincronizar", EzWebExt.bind(function() { 
		this.notebook.goToTab(this.MAIN_TAB);
		this.showAlternative(this.MAIN_ALTERNATIVE);
		this.reload();
	}, this)));
	header_left.appendChild(this._createHeaderButton("images/mail-new.png", "Enviar email", EzWebExt.bind(function() { 
		this.showAlternative(this.SEND_ALTERNATIVE);
	}, this)));
	header_left.appendChild(this._createHeaderButton("images/config.png", "Configurar", EzWebExt.bind(function() { 
		this.showAlternative(this.CONFIG_ALTERNATIVE);
		this.repaint();
	}, this)));
	
	var header_right = document.createElement("div");
	header_right.id = "header_right";
	header.appendChild(header_right);
	
	var search_div = document.createElement("div");
	EzWebExt.addClassName(search_div, "input");
	header_right.appendChild(search_div);
	
	var search_input = new StyledElements.StyledTextField();
	search_input.inputElement.addEventListener("keypress", EzWebExt.bind(function(e) {
		if (e.keyCode == 13) {
			this.searchMails(e.target.value);
		}
	}, this), false);
	search_input.insertInto(search_div);
	
	var search_img = document.createElement("img");
	search_img.src = this.getResourceURL("images/find-arrow.png");
	search_img.title = "Opciones de búsqueda";
	search_img.addEventListener("click", function(){
		search_options.style.display = "block";
	}, false);
	search_div.appendChild(search_img);
	
	var content = document.createElement("div");
	content.id = "content";
	body.appendChild(content);

	// PANEL PRINCIPAL	
        var hpaned = new StyledElements.StyledHPaned({handlerPosition: 30, leftMinWidth: 180, rightMinWidth: 400});
	var mainAlternative = this.alternatives.createAlternative();
	mainAlternative.appendChild(hpaned);
	
        var content_left = document.createElement("div");
        content_left.id = "content_left";
        hpaned.getLeftPanel().appendChild(content_left);
	
	var content_right = document.createElement("div");
	content_right.id =  "main_content_right";
	EzWebExt.addClassName(content_right, "content_right");
        
        this.notebook = new StyledElements.StyledNotebook();
	
	var maintab = this.notebook.createTab({closeable: false});
        maintab.appendChild(content_right);
        hpaned.getRightPanel().appendChild(this.notebook);
        
        var headerrow = document.createElement("div");
        headerrow.id = "main_headerrow";
        EzWebExt.addClassName(headerrow, "headerrow");
        content_right.appendChild(headerrow);
        
        headerrow.appendChild(this._createHeaderCell("Subject", "subject"));
        headerrow.appendChild(this._createHeaderCell("From", "from"));
        headerrow.appendChild(this._createHeaderCell("Date", "date"));
        
        var tablebody = document.createElement("div");
        tablebody.id = "main_tablebody";
        EzWebExt.addClassName(tablebody, "tablebody");
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
	title.appendChild(document.createTextNode("ENVIAR E-MAIL"));
	
	row.appendChild(title);
	
	row.appendChild(this._createHeaderButton("images/cancel.png", "Cancelar", EzWebExt.bind(function() { 
		this.showAlternative(this.MAIN_ALTERNATIVE);
		this.form_send["subject"].reset();
		this.form_send["to"].reset();
		this.form_send["cc"].reset();
		this.form_send["bcc"].reset();
		this.form_send["multi_selector"].reset();
		tinyMCE.get(this.form_send["message"].id).setContent("");
	}, this)));
	
	row.appendChild(this._createHeaderButton("images/mail-send.png", "Enviar", EzWebExt.bind(function() { 
		var subject = this.form_send["subject"].getValue();
		var to = this.form_send["to"].getValue();
		var cc = this.form_send["cc"].getValue();
		var bcc = this.form_send["bcc"].getValue();
		var message = tinyMCE.get(this.form_send["message"].id).getContent();

		if (subject == "" || (to == "" && cc == "" && bcc == "") || message == "") {
			this.alert("Advertencia", "Deben rellenarse todos los campos del formulario", {type: EzWebExt.ALERT_WARNING});
		}
		else {
			to = to.split(/\s*,\s*/);
			cc = cc.split(/\s*,\s*/);
			bcc = bcc.split(/\s*,\s*/);
			
			if (Utils.evalMailList(to) && Utils.evalMailList(cc) && Utils.evalMailList(bcc))
				this.sendMail(subject, message, to, cc, bcc);
			else
				this.alert("Advertencia", "Todos los correos de los destinatarios deben ser válidos", {type: EzWebExt.ALERT_WARNING});
		}
	}, this)));
	
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
	row.appendChild(this._createCell(document.createTextNode("Subject:"), "title"));
	row.appendChild(this._createCell(subject_text, "value"));
	headerrow.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "send");
	row.appendChild(this._createCell(document.createTextNode("To:"), "title"));
	row.appendChild(this._createCell(to_text, "value"));
	
	var openDetails = document.createElement("img");
	openDetails.src = this.getResourceURL("images/open-details.png");
	openDetails.title = "Mostrar detalles";
	EzWebExt.addClassName(openDetails,"details_button");
	
	var closeDetails = document.createElement("img");
	closeDetails.src = this.getResourceURL("images/close-details.png");
	closeDetails.title = "Ocultar detalles";
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
		this.form_send["cc"].removeClassName("hidden");
		this.form_send["bcc"].removeClassName("hidden");
		this.form_send["multi_selector"].show();
	}, this), false);
	
	closeDetails.addEventListener("click", EzWebExt.bind(function(e) {
		this.form_send["header"].style.height = "83px";
		this.form_send["header"].scrollTop = "0px";
		this.form_send["body"].style.top = "97px";
		this._resizeTinyMCE();
		openDetails.style.display = "block";
		e.target.style.display = "none";
		this.form_send["cc"].addClassName("hidden");
		this.form_send["bcc"].addClassName("hidden");
		this.form_send["multi_selector"].hidden();
	}, this), false);
	
	row.appendChild(openDetails);
	row.appendChild(closeDetails);
	headerrow.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "send");
	cc_text.addClassName("hidden");
	row.appendChild(this._createCell(document.createTextNode("Cc:"), "title"));
	row.appendChild(this._createCell(cc_text, "value"));
	headerrow.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "send");
	bcc_text.addClassName("hidden");
	row.appendChild(this._createCell(document.createTextNode("Bcc:"), "title"));
	row.appendChild(this._createCell(bcc_text, "value"));
	headerrow.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "send");
	EzWebExt.addClassName(row, "attach");
	row.appendChild(this._createCell(document.createTextNode("Attach:"), "title"));	
	row.appendChild(this._createCell(attach_div, "value"));
	headerrow.appendChild(row);
	
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
	attach_img.title = "Adjuntar archivos";
	attach.appendChild(attach_img);
	
	form.appendChild(attach);
	row.appendChild(form);
	
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
	title.appendChild(document.createTextNode("CONFIGURAR"));
	
	row.appendChild(title);
	
	row.appendChild(this._createHeaderButton("images/cancel.png", "Cancelar", EzWebExt.bind(function() { 
		this.showAlternative(this.MAIN_ALTERNATIVE);
		AccountsManager.resetForm();
	}, this)));
	
	row.appendChild(this._createHeaderButton("images/save.png", "Guardar", EzWebExt.bind(function() { 
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
			this.reload();
		}
		else {
			this.alert("Error", "Deben rellenarse todos los campos del formulario", {type: EzWebExt.ALERT_WARNING});
		}
	}, this)));
	
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
	var in_connection_text = new StyledElements.StyledSelect({initialEntries: [['NON_SECURE', 'No seguro'], ['SSL']], initialValue: 'SSL'});
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
	row.appendChild(document.createTextNode("Servidor de entrada"));
	config_left.appendChild(row);

        row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	EzWebExt.addClassName(row, "big");
	row.appendChild(this._createCell(document.createTextNode("Account:"), "title"));
	row.appendChild(this._createCell(in_account_text, "value"));
	config_left.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	EzWebExt.addClassName(row, "big");
	row.appendChild(this._createCell(document.createTextNode("Host:"), "title"));
	row.appendChild(this._createCell(in_host_text, "value"));
	config_left.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	row.appendChild(this._createCell(document.createTextNode("Port:"), "title"));
	row.appendChild(this._createCell(in_port_text, "value"));
	config_left.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	row.appendChild(this._createCell(document.createTextNode("Protocol:"), "title"));
	row.appendChild(this._createCell(in_protocol_text, "value"));
	config_left.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	row.appendChild(this._createCell(document.createTextNode("Connection:"), "title"));
	row.appendChild(this._createCell(in_connection_text, "value"));
	config_left.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	row.appendChild(this._createCell(document.createTextNode("Username:"), "title"));
	row.appendChild(this._createCell(in_username_text, "value"));
	config_left.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	row.appendChild(this._createCell(document.createTextNode("Password:"), "title"));
	row.appendChild(this._createCell(in_password_text, "value"));
	config_left.appendChild(row);
	
	var config_right = document.createElement("div");
	EzWebExt.addClassName(config_right, "config_content");
        this.config_hpaned.getRightPanel().appendChild(config_right);

	this.form_out_config = {};
	
	var out_account_text = new StyledElements.StyledTextField();
	var out_host_text = new StyledElements.StyledTextField();
	var out_port_text = new StyledElements.StyledNumericField({initialValue: 25, minValue: 0, maxValue: 65535});
	var out_protocol_text = new StyledElements.StyledSelect({initialEntries: [['SMTP']], initialValue: 'SMTP'});
	var out_connection_text = new StyledElements.StyledSelect({initialEntries: [['NON_SECURE', 'No seguro'], ['TLS'], ['SSL']], initialValue: 'NON_SECURE'});
	var out_username_text = new StyledElements.StyledTextField();
	var out_password_text = new StyledElements.StyledPasswordField();

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
	row.appendChild(document.createTextNode("Servidor de salida"));
	config_right.appendChild(row);

	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	EzWebExt.addClassName(row, "big");
	row.appendChild(this._createCell(document.createTextNode("Account:"), "title"));
	row.appendChild(this._createCell(out_account_text, "value"));
	config_right.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	EzWebExt.addClassName(row, "big");
	row.appendChild(this._createCell(document.createTextNode("Host:"), "title"));
	row.appendChild(this._createCell(out_host_text, "value"));
	config_right.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	row.appendChild(this._createCell(document.createTextNode("Port:"), "title"));
	row.appendChild(this._createCell(out_port_text, "value"));
	config_right.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	row.appendChild(this._createCell(document.createTextNode("Protocol:"), "title"));
	row.appendChild(this._createCell(out_protocol_text, "value"));
	config_right.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	row.appendChild(this._createCell(document.createTextNode("Connection:"), "title"));
	row.appendChild(this._createCell(out_connection_text, "value"));
	config_right.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	row.appendChild(this._createCell(document.createTextNode("Username:"), "title"));
	row.appendChild(this._createCell(out_username_text, "value"));
	config_right.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	row.appendChild(this._createCell(document.createTextNode("Password:"), "title"));
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

ClienteCorreo.prototype._createOption = function(text, value, checked) {
	var option = document.createElement("div");
	EzWebExt.addClassName(option, "option");
	option.addEventListener("mouseover", function() {
		this.style.backgroundColor="#FCD18E";
	}, false);
	option.addEventListener("mouseout", function() {
		this.style.backgroundColor="#FFFFFF";
	}, false);
	
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
		this.selectSearchOption(radio);
	}, this), false);

	return option;
}

ClienteCorreo.prototype._createHeaderButton = function(src, title, handler) {
	var div = document.createElement("div");
	EzWebExt.addClassName(div, "image");
	
	var img = document.createElement("img");
	img.src = this.getResourceURL(src);
	img.title = title;
	img.addEventListener("click", handler, false);
	div.appendChild(img);

	return div
}

ClienteCorreo.prototype._createHeaderCell = function(text, className) {
	var cell = document.createElement("div");
	EzWebExt.addClassName(cell, "headercell");
	EzWebExt.addClassName(cell, className);
	var span = document.createElement("span");
	span.appendChild(document.createTextNode(text));
	//cell.appendChild(span);
	//var img = document.createElement("img");
	//img.src = this.getResourceURL("images/arrow-botton.png");
	//img.addEventListener("click", EzWebExt.bind(function() {
	//	this.orderBy(className);
	//}, this), false);
	cell.appendChild(span);
	return cell;
}

// Puede ser que el padre no exista
ClienteCorreo.prototype._createParent = function(full_name, separator) {
	var name = full_name.split(separator)[full_name.split(separator).length-1];
	var parent = full_name.substr(0,full_name.length-name.length-separator.length);
	AccountsManager.getInAccount().addMailbox({
		full_name: full_name,
		flags: ["\\Noselect"],
		name: name,
		parent: parent,
		separator: separator,
		state:  "closed"
	});
		
	this._createFolder(full_name);
}

ClienteCorreo.prototype._createFolder = function(full_name) {
	var account = AccountsManager.getInAccount();
	var mailbox = account.getMailboxById(full_name);
	var folder = document.createElement('div');
	EzWebExt.addClassName(folder, "folder");

	folder.addEventListener("click", EzWebExt.bind(function() {
		this.notebook.goToTab(this.MAIN_TAB);
		if (mailbox["state"] == "closed") {
			this.openFolder(full_name);
		}
		else {
			if (this.selectedMailbox == full_name)
				this.closeFolder(full_name);
		}
		if (this.selectedMailbox != full_name) {
			this.deselectFolder(this.selectedMailbox);
			this.selectedMailbox = full_name;
			this.selectFolder(this.selectedMailbox);
			if (Utils.containElement(mailbox["flags"], "\\Noselect", true)) {
				document.getElementById("main_tablebody").innerHTML = ""; 
				document.getElementById("main_footerrow").innerHTML = "";
				this.notebook.getTabByIndex(this.MAIN_TAB-1).rename(mailbox["name"]);
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
	imageFolder.setAttribute('src', this.getResourceURL('images/folder.png'));
	folder.appendChild(imageFolder);
	mailbox["image_folder"] = imageFolder;
	var span = document.createElement('span');
	EzWebExt.addClassName(span, "node_name");
	span.appendChild(document.createTextNode(mailbox["name"]));
	folder.appendChild(span);
	mailbox["span_folder"] = span;
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

ClienteCorreo.prototype._createPaginationElement = function(search) {
	var pagination = document.createElement("span");
	EzWebExt.addClassName(pagination, "pagination");
	var image = null;
	if (this.size > 0) {
		image = document.createElement('img');
		if (this.begin > 1) {
			EzWebExt.addClassName(image, "selected");
			image.setAttribute('title', 'Primero');
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
			image.setAttribute('title', 'Atrás');
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
			image.setAttribute('title', 'Siguiente');
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
			image.setAttribute('title', 'Último');
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

ClienteCorreo.prototype._createCell = function(element, className) {
	var cell = document.createElement("div");
	EzWebExt.addClassName(cell, "cell");
	EzWebExt.addClassName(cell, className);
	var span = document.createElement("span");
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
	this.size = response["size"];
	var mailList = response["mailList"];
	var tablebody = document.getElementById("main_tablebody");
	tablebody.innerHTML = "";
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
		row.appendChild(this._createCell(document.createTextNode((mail["subject"])?mail["subject"]:""), "subject"));
		row.addEventListener("mouseover", function(){
			EzWebExt.addClassName(this, "selected");
		}, false);
		row.addEventListener("mouseout", function(){
			EzWebExt.removeClassName(this, "selected");
		}, false);
		row.addEventListener("click", EzWebExt.bind(function(){
			EzWebExt.removeClassName(this.row, "bold");
			this.self.getMail(this.self.selectedMailbox, this.mail["uid"]);
		}, context), false);
		
		row.appendChild(this._createCell(this._createMailLink(mail["from"]), "from"));
		row.appendChild(this._createCell(document.createTextNode((mail["date"])?Utils.formatDate(mail["date"]):""), "date"));
		tablebody.appendChild(row);
	}
	var footer = document.getElementById("main_footerrow");
	footer.innerHTML = "";
	footer.appendChild(this._createPaginationElement(search));
	Utils.removeLoadingImage();
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
	
	link.title = "Eviar email";
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

ClienteCorreo.prototype.reload = function() {
	this.selectedMailbox = "";
	this.begin = 1;
	this.end = this.INTERVAL_SIZE;
	this.size = 0;
	document.getElementById("main_tablebody").innerHTML = ""; 
	document.getElementById("main_footerrow").innerHTML = "";
	this.notebook.getTabByIndex(this.MAIN_TAB-1).rename(" ");
	if (AccountsManager.isConfigured()) {
		this.alternatives.showAlternative(this.MAIN_ALTERNATIVE);
		this.getFolders();
	}
	else {
		this.alternatives.showAlternative(this.CONFIG_ALTERNATIVE);
	}
	this.repaint();
}

ClienteCorreo.prototype.showAlternative = function(alternative) {
	if (AccountsManager.isConfigured()) {
		this.alternatives.showAlternative(alternative);
	}
}

ClienteCorreo.prototype.selectSearchOption = function(radioButton) {
	radioButton.checked = 'checked';
	this.searchOption = radioButton.value;
}

ClienteCorreo.prototype.searchMails = function(value) {
	this.notebook.goToTab(this.MAIN_TAB);
	this.showAlternative(this.MAIN_ALTERNATIVE);
	if ((this.selectedMailbox != "") && (AccountsManager.getInAccount().isConfigured())) {
		if  (value == "") {
			this.goFirstPage(false);
		}
		else {
			this.searchKeyword = value;
			this.begin = 1;
			this.end = this.INTERVAL_SIZE;
			this.sendSearchMails();
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
		this.searchMails();
}

// FOLDERS

ClienteCorreo.prototype.openFolder = function(mailbox) {
	var mailbox = AccountsManager.getInAccount().getMailboxById(mailbox);
	mailbox["div_children"].style.display = "block";
	mailbox["image_icon"].src = this.getResourceURL("images/close.png");
	mailbox["state"] = "opened";
}

ClienteCorreo.prototype.closeFolder = function(mailbox) {
	var mailbox = AccountsManager.getInAccount().getMailboxById(mailbox);
	mailbox["div_children"].style.display = "none";
	mailbox["image_icon"].src = this.getResourceURL("images/open.png");
	mailbox["state"] = "closed";
}

ClienteCorreo.prototype.selectFolder = function(mailbox) {
	var mailbox = AccountsManager.getInAccount().getMailboxById(mailbox);
	if (mailbox) {
		this.notebook.getTabByIndex(this.MAIN_TAB-1).rename(Utils.subString(mailbox["name"],15));
		EzWebExt.addClassName(mailbox["span_folder"], "selected_folder");
		mailbox["image_folder"].src = this.getResourceURL("images/folder_open.png");
	}
}

ClienteCorreo.prototype.deselectFolder = function(mailbox) {
	var mailbox = AccountsManager.getInAccount().getMailboxById(mailbox);
	if (mailbox) {
		mailbox["image_folder"].src = this.getResourceURL("images/folder.png");
		EzWebExt.removeClassName(mailbox["span_folder"], "selected_folder");
	}
}

// REQUESTS

ClienteCorreo.prototype.getMailsByFolder = function() {
	if (AccountsManager.isConfigured()) {
		Utils.addLoadingImage();
		this.sendPost(
			this.MAILPROXY_URL + "imap/mailbox/messages/" + this.begin + "/" + this.end, 
			"config=" + encodeURIComponent(Utils.toJSON(AccountsManager.getInAccount().getConfig())) + 
				"&mailbox=" + encodeURIComponent(this.selectedMailbox), 
			this.onSuccessGetMailsByFolder, 
			this.onError,
			this.onException
		);
	}
}

ClienteCorreo.prototype.sendSearchMails = function() {
	if (AccountsManager.isConfigured()) {
		Utils.addLoadingImage();
		this.sendPost(
			this.MAILPROXY_URL + "imap/mailbox/messages/search/" + encodeURIComponent(this.searchOption) + "/" + 
				encodeURIComponent(this.searchKeyword) + "/" + this.begin + "/" + this.end, 
			"config=" + encodeURIComponent(Utils.toJSON(AccountsManager.getInAccount().getConfig())) + 
				"&mailbox=" + encodeURIComponent(this.selectedMailbox), 
			this.onSuccessSearchMails, 
			this.onError,
			this.onException
		);
	}
}

ClienteCorreo.prototype.getFolders = function() {
	if (AccountsManager.isConfigured()) {
		Utils.addLoadingImage();
		this.sendPost(
			this.MAILPROXY_URL + "imap/mailbox/all",
			"config=" + encodeURIComponent(Utils.toJSON(AccountsManager.getInAccount().getConfig())),
			this.onSuccessGetFolders,
			this.onError,
			this.onException
		);
	}
}

ClienteCorreo.prototype.getMail = function(mailbox, uid) {
	try {
	if (AccountsManager.isConfigured()) {
		Utils.addLoadingImage();
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
		
		Utils.addLoadingImage();
		var outAccount = AccountsManager.getOutAccount();
		var destination = {
			subject: subject,
			message_html: messageHtml,
			from: outAccount.account,
			to: to,
			cc: cc,
			bcc: bcc
		}
		
		this.form_send["multi_selector"].prepareToSend();
		
		this.form_send["form"].config.value = Utils.toJSON(outAccount.getConfig());
		this.form_send["form"].destination.value = Utils.toJSON(destination);
		
		// Enviar Submit
		var evObj = document.createEvent('MouseEvents');
		evObj.initEvent( 'click', false, true );
		this.form_send["form"].button.dispatchEvent(evObj);
	}
}

ClienteCorreo.prototype.sendMailWithoutAttach = function(subject, messageHtml, to, cc, bcc) {
	if (AccountsManager.isConfigured()) {
		Utils.addLoadingImage();
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

// ONFAILURE RESPONSES

ClienteCorreo.prototype.onException = function(transport, e) {
	Utils.removeLoadingImage();
	this.alert("Exception", "Line: " + e.lineNumber + " \nMessage: " + e.message, {type: EzWebExt.ALERT_ERROR});
}

ClienteCorreo.prototype.onError = function(transport) {
	var response = eval("(" + transport.responseText + ")");
	Utils.removeLoadingImage();
	if (response["error"] && (response["error"] != "")) {
		this.alert("Error", response["error"], {type: EzWebExt.ALERT_ERROR});
	}
	else {
		this.alert("Error", "General error", {type: EzWebExt.ALERT_ERROR});
	}
}

// ONSUCCESS RESPONSES

ClienteCorreo.prototype.onSuccessGetFolders = function(transport) {
	var response = eval("(" + transport.responseText + ")");
	var folderList = response["folderList"];
	var account = AccountsManager.getInAccount();
	if (account) {
		document.getElementById("content_left").innerHTML = "";
		account.clearMailboxList();
		for (var i=0; i<folderList.length; i++) {
			var full_name = folderList[i].name;
			var separator = folderList[i].separator;
			var name = full_name.split(separator)[full_name.split(separator).length-1];
			var parent = full_name.substr(0,full_name.length-name.length-separator.length);
			var flags = folderList[i].flags;
			account.addMailbox({
				full_name: full_name,
				flags: flags,
				name: name,
				parent: parent,
				separator: separator,
				state:  "closed"
			});
		
			this._createFolder(full_name);
		}
		Utils.removeLoadingImage();
		
		var inbox = AccountsManager.getInAccount().getMailboxById("INBOX");
		if (inbox) {
			this.selectedMailbox = "INBOX";
			this.selectFolder(this.selectedMailbox);
			
			if (Utils.containElement(inbox["flags"], "\\Noselect", true)) {
				document.getElementById("main_tablebody").innerHTML = ""; 
				document.getElementById("main_footerrow").innerHTML = "";
				this.notebook.getTabByIndex(this.MAIN_TAB-1).rename(mailbox["name"]);
			}
			else {
				this.goFirstPage(false);
			}
		}
	}
}

ClienteCorreo.prototype.onSuccessGetMail = function(transport) {
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
	
	row.appendChild(this._createCell(document.createTextNode("Subject:"), "title"));
	var subject = this._createCell(document.createTextNode((mail["subject"])?mail["subject"]:""), "value");
	EzWebExt.addClassName(subject, "first_line");
	row.appendChild(subject);
	
	var text = "";
	if (mail["text_html"] == "") {
		text = "<pre>" + mail["text_plain"].split("\r").join("") + "</pre>";
	}
	else {
		text = mail["text_html"];
	}
	
	row.appendChild(this._createHeaderButton("images/mail-reply-all.png", "Responder a todos", EzWebExt.bind(function() { 
		//TODO Implementar
		this.alert("Advertencia", "Esta funcionalidad aún no ha sido implementada", {type: EzWebExt.ALERT_WARNING});
	}, this)));
	row.appendChild(this._createHeaderButton("images/mail-reply.png", "Responder", EzWebExt.bind(function() { 
		this.form_send["subject"].setValue("Re: " + ((mail["subject"])?mail["subject"]:""));
		this.form_send["to"].setValue(mail["from"].mail);
		this.form_send["cc"].reset();
		this.form_send["bcc"].reset();
		tinyMCE.get(this.form_send["message"].id).setContent("<p>" + mail["from"].name + " escribió:</p><blockquote type='cite'>" + text + "</blockquote>");
		this.form_send["multi_selector"].reset();
		this.showAlternative(this.SEND_ALTERNATIVE);
	}, this)));
	row.appendChild(this._createHeaderButton("images/mail-forward.png", "Reenviar", EzWebExt.bind(function() { 
		this.form_send["subject"].setValue("\[Fwd: " + ((mail["subject"])?mail["subject"]:"") + "\]");
		this.form_send["to"].reset();
		this.form_send["cc"].reset();
		this.form_send["bcc"].reset();
		this.form_send["multi_selector"].reset();
		tinyMCE.get(this.form_send["message"].id).setContent(text);
		this.showAlternative(this.SEND_ALTERNATIVE);
	}, this)));
	headerrow.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "mail");
	row.appendChild(this._createCell(document.createTextNode("Date:"), "title"));
	row.appendChild(this._createCell(document.createTextNode((mail["date"])?Utils.formatDate(mail["date"]):""), "value"));
	headerrow.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "mail");
	row.appendChild(this._createCell(document.createTextNode("From:"), "title"));
	row.appendChild(this._createCell(this._createMailLink(mail["from"]), "value"));
	headerrow.appendChild(row);
	
	row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "mail");
	row.appendChild(this._createCell(document.createTextNode("To:"), "title"));
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
	row.appendChild(this._createCell(document.createTextNode("Cc:"), "title"));
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
	
	this.tab = this.notebook.createTab({name: Utils.subString(mail["subject"],15), initiallyVisible: true, title: mail["subject"]});
	this.tab.appendChild(content_right);
	
	var openDetails = document.createElement("img");
	openDetails.src = this.getResourceURL("images/open-details.png");
	openDetails.title = "Mostrar detalles";
	EzWebExt.addClassName(openDetails,"details_button");
	
	var closeDetails = document.createElement("img");
	closeDetails.src = this.getResourceURL("images/close-details.png");
	closeDetails.title = "Ocultar detalles";
	EzWebExt.addClassName(closeDetails,"details_button");
	closeDetails.style.display = "none";
	
	openDetails.addEventListener("click", EzWebExt.bind(function(e) {
		headerrow.style.height = "112px";
		tablebody.style.top = "122px";
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
	
	Utils.removeLoadingImage();
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
	Utils.removeLoadingImage();
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
		name: "",
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
		ClienteCorreo.form_out_config["account"].setValue(this.outAccount["account"]);
		ClienteCorreo.form_out_config["host"].setValue(this.outAccount["host"]);
		ClienteCorreo.form_out_config["port"].setValue(this.outAccount["port"]);
		ClienteCorreo.form_out_config["protocol"].setValue(this.outAccount["protocol"]);
		ClienteCorreo.form_out_config["connection"].setValue(this.outAccount["connection"]);
		ClienteCorreo.form_out_config["username"].setValue(this.outAccount["username"]);
		ClienteCorreo.form_out_config["password"].setValue(this.outAccount["password"]);
	}
	else {
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
}

Account.prototype.clearMailboxList = function() {
	this.mailboxList = {};
}

Account.prototype.addMailbox = function(mailbox) {
	this.mailboxList[mailbox["full_name"]] = mailbox;
}

Account.prototype.getMailboxById = function(key) {
	return this.mailboxList[key];
}

Account.prototype.getConfig = function() {
	return {
		account: this.account,
		connection: this.connection,
		host: this.host,
		port: this.port,
		username: this.username,
		password: this.password
	};
}

/////////////////////////////////////////////
////////// Class MultiSelector //////////////////////
/////////////////////////////////////////////

var MultiSelector = function(target, list_target, max) {
	this.target = target;
	this.list_target = list_target;
	this.files = [];
	this.max = (max)?max:-1;
	this.reset();
}

MultiSelector.prototype.createFileElement = function() {
	var attach_file = document.createElement("input");
	attach_file.type = "file";
	attach_file.title = "Adjuntar archivos";
	return attach_file;
}

MultiSelector.prototype.addElement = function(element) {
	if( element.tagName.toUpperCase() == 'INPUT' && element.type.toUpperCase() == 'FILE' ) { //File input element
		element.name = 'file_' + this.files.length;
		element.addEventListener("change", EzWebExt.bind(function(e) { 
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
	new_row.appendChild(new_row_span);
	
	var new_row_button = document.createElement('img');
	new_row_button.src = ClienteCorreo.getResourceURL("images/delete-attach.png");
	new_row_button.title = "Borrar";
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

MultiSelector.prototype.removeFile = function(file) {
	var index = this.getFileIndex(file);
	if (index != -1) {
		this.files = this.files.slice(0,index).concat(this.files.slice(index+1, this.files.length));
	}
}

MultiSelector.prototype.recalculateNames = function() {
	for (var i=0; i<this.files.length; i++) {
		this.files[i].name = "files_" + i;
	}
}

MultiSelector.prototype.prepareToSend = function() {
	EzWebExt.removeFromParent(this.files[this.files.length-1]);
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
		if ((aux.length > 1) && (ext.length <= 4)) {
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
	var body = document.getElementsByTagName("body")[0];
	var background = document.createElement('div');
	background.id = "loading_background";
	// cancels the call to startdrag function
	background.addEventListener("mousedown", function (e) {
		Utils.stopEvent(e);
	}, false);
	body.appendChild(background);
	var image = document.createElement('img');
	image.id = "loading_image";
	image.setAttribute('src', ClienteCorreo.getResourceURL('images/ajax-loader.gif'));
	background.appendChild(image);
}

Utils.prototype.removeLoadingImage = function() {
	var body = document.getElementsByTagName("body")[0];
	var background = document.getElementById("loading_background");
	if (background != null)
		body.removeChild(background);
}

Utils = new Utils();

///////////////////////////////////////	
////////////// TinyMCE ////////////////
///////////////////////////////////////
tinyMCE.init({
	// General options
	mode : "textareas",
	theme : "advanced",
	plugins : "safari, blockquote",

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
