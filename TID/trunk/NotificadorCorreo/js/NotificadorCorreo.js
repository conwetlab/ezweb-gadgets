var time = EzWebAPI.createRGadgetVariable("time", resetInterval);
var size = 0;
var popup = null;
var interval = null;
var mailboxList = {}; 
var accounts = EzWebAPI.createRWGadgetVariable("config");


var details = EzWebAPI.createRWGadgetVariable("details");
var to = EzWebAPI.createRWGadgetVariable("to");
var to_username = EzWebAPI.createRWGadgetVariable("to_username");
var from = EzWebAPI.createRWGadgetVariable("from");
var from_name = EzWebAPI.createRWGadgetVariable("from_name");
var subject = EzWebAPI.createRWGadgetVariable("subject");
var date = EzWebAPI.createRWGadgetVariable("date");
var uid = EzWebAPI.createRWGadgetVariable("uid");
var mailbox = EzWebAPI.createRWGadgetVariable("mailbox");
var newMails = EzWebAPI.createRWGadgetVariable("newMails");

var alternatives = new StyledElements.StyledAlternatives();
var alternativesList = [];


var NotificadorCorreo = function()
{
    EzWebGadget.call(this, {translatable:true});
}

NotificadorCorreo.prototype = new EzWebGadget();
NotificadorCorreo.prototype.resourcesURL = "http://ezweb.tid.es/repository/ezweb-gadgets/NotificadorCorreo/NotificadorCorreo_1.4/";
NotificadorCorreo.prototype.init = function(){

    var alternativeMails = alternatives.createAlternative({defaultEffect:'None'});
    var alternativeAccounts = alternatives.createAlternative({defaultEffect:'None'});
    var alternativeAdd = alternatives.createAlternative({defaultEffect:'None'});
    var alternativeModify = alternatives.createAlternative({defaultEffect:'None'});

    alternativeList = [alternativeMails.getId(), alternativeAccounts.getId(), alternativeAdd.getId(), alternativeModify.getId()];

    alternatives.insertInto(document.getElementById('content'));
    var divSettings = document.createElement("div");
    var divAccountsMailList = document.createElement("div");
    var divAdd = document.createElement("div");
    var divModify = document.createElement("div");
    divSettings.id = "settings";
    divAccountsMailList.id = "accountsMailList";
    divAdd.id = "addSettings";
    divModify.id = "modifySettings";

    var divHeaderButtons = document.createElement("div");
    divHeaderButtons.id="buttonsHeader";
    document.getElementById("header").appendChild(divHeaderButtons);

    alternativeMails.appendChild(divAccountsMailList);
    alternativeAccounts.appendChild(divSettings);
    alternativeAdd.appendChild(divAdd);
    alternativeModify.appendChild(divModify);

    createMailboxList();  
    reload();
    resetInterval(time.get());
    
}

NotificadorCorreo.prototype.repaint = function (){
	alternatives.repaint();
}

NotificadorCorreo = new NotificadorCorreo();


function addAccount()
{
    var textServerMail = contextAdd["_serverMail"].getValue();
    var textPort = contextAdd["_port"].getValue();
    var textUsername = contextAdd["_username"].getValue();
    var textPassword = contextAdd["_password"].getValue();
    var textProtocol = contextAdd["_protocol"].getValue();
    var textName = contextAdd["_name"].getValue();
    var textEmail = contextAdd["_email"].getValue();
    var i=0;
 
    if ((textServerMail != "") && 
	(textPort != "") && 
	(parseInt(textPort) > 0) && 
	(textUsername != "") && 
	(textPassword != "") &&
	(textName != "") &&
	(textEmail != ""))
	{

	    if (accounts.get() != "")
		{
		    auxAccounts = eval('('+ accounts.get() + ')');
		    for(var i = 0; i < auxAccounts.length; i++)
			{
			    if(textEmail == auxAccounts[i].email)
				{
				    NotificadorCorreo.alert("Error", NotificadorCorreo.getTranslatedLabel("errorAddUser"),EzWebExt.ALERT_ERROR);
				    return;
				}
			}
		}
	    else
		auxAccounts = new Array();
		
	    auxAccounts[i] = {serverMail: textServerMail, 
			      port: textPort, 
			      connection: textProtocol, 
			      username: textUsername, 
			      password: textPassword,
			      account: textEmail,
			      name: textName};
	    
	    accounts.set(to_json(auxAccounts));
	    displayAccounts();
	}
    else
	NotificadorCorreo.alert("Error", NotificadorCorreo.getTranslatedLabel("errorAdd"),EzWebExt.ALERT_ERROR);	
}


function removeAccount()
{
    var elements = 0;
    if (accounts.get() == "")
	return;

    var oldAccounts = eval('('+accounts.get()+')');
    var newAccounts = new Array();

    for (var i=0; i < oldAccounts.length; i++)
	{
	    if (!document.getElementById("checkedAccount"+i).checked)
		{
		    newAccounts[elements] = oldAccounts[i];
		    elements += 1;
		}
	}
    if (elements == 0)
	accounts.set("");
    else
	accounts.set(to_json(newAccounts));
    displayAccounts();
}


function modifyAccount(element)
{
    var modifyAccounts = eval('('+accounts.get()+')');
    var textServerMail = contextModify["_serverMail"].getValue();
    var textPort = contextModify["_port"].getValue();
    var textUsername = contextModify["_username"].getValue();
    var textPassword = contextModify["_password"].getValue();
    var textProtocol = contextModify["_protocol"].getValue();
    var textName = contextModify["_name"].getValue();
    var textEmail = contextModify["_email"].getValue();

    if ((textServerMail != "") 
	&& (textPort != "") 
	&& (parseInt(textPort) > 0) 
	&& (textUsername != "") 
	&& (textPassword != "")
	&& (textName != "")
	&& (textEmail != ""))
	{   
	    for(var i=0; i < modifyAccounts.length; i++)
		{
		    if((i != element) && (textEmail == modifyAccounts[i].email))
			{
			    NotificadorCorreo.alert("Error", NotificadorCorreo.getTranslatedLabel("errorAddUser"),EzWebExt.ALERT_ERROR);
			    return;
			}
		}
		
	    modifyAccounts[element] = {serverMail: textServerMail, 
				       port: textPort, 
				       connection: textProtocol, 
				       username: textUsername, 
				       password: textPassword,
				       account: textEmail,
				       name: textName};
	    
	    accounts.set(to_json(modifyAccounts));
	    displayAccounts();

	    // Modify mailboxList
	    createMailboxList();
	}
    else
	NotificadorCorreo.alert("Error", NotificadorCorreo.getTranslatedLabel("errorAdd"),EzWebExt.ALERT_ERROR);	

}


function displayAddAccount()
{
  contextAdd = {};
	document.getElementById("addSettings").innerHTML = "";    

	var content = document.createElement("div");
	content.id = "contentSetConfiguration";

	var header = document.getElementById("buttonsHeader");
	header.innerHTML = "";
	var divButtons = document.createElement("div");
	divButtons.className = "buttonsSettings";

	var imgAccept = document.createElement("img");
	var imgCancel = document.createElement("img");
	
	imgAccept.src = NotificadorCorreo.resourcesURL+"images/save.png";
	imgCancel.src = NotificadorCorreo.resourcesURL+"images/cancel.png";
	EzWebExt.addEventListener(imgAccept, "click", addAccount, false);
	EzWebExt.addEventListener(imgCancel, "click", displayAccounts, false);

	divButtons.appendChild(imgAccept);
	divButtons.appendChild(imgCancel);
	header.appendChild(divButtons);

	var table = document.createElement("table");
	var tbody = document.createElement("tbody");
	table.appendChild(tbody);
	table.id = "tableSetAccount";	
	// NAME ACCOUNT
	var tr = tbody.insertRow(-1);
	var td = tr.insertCell(-1);
	td.id = "name";
	td.appendChild(document.createTextNode(NotificadorCorreo.getTranslatedLabel("name")));
	
	var td = tr.insertCell(-1);
	var input = new StyledElements.StyledTextField("_name", "");
	contextAdd["_name"]=input;
	input.insertInto(td);
 
	// EMAIL
	var tr = tbody.insertRow(-1);
	var td = tr.insertCell(-1);
	td.id = "email";
	td.appendChild(document.createTextNode(NotificadorCorreo.getTranslatedLabel("email")));
 
	var td = tr.insertCell(-1);
	var input = new StyledElements.StyledTextField("_email", "");
	contextAdd["_email"]=input;
	input.insertInto(td);
	 
	// SERVER MAIL
	var tr = tbody.insertRow(-1);
	var td = tr.insertCell(-1);
	td.id = "serverMail";
	td.appendChild(document.createTextNode(NotificadorCorreo.getTranslatedLabel("serverMail")));
	 
	var td = tr.insertCell(-1);
	var input = new StyledElements.StyledTextField("_serverMail", "");
	input.insertInto(td);
	contextAdd["_serverMail"]=input;
	 
	// PORT
	var tr = tbody.insertRow(-1);
	var td = tr.insertCell(-1);
	td.id = "port";
	td.appendChild(document.createTextNode(NotificadorCorreo.getTranslatedLabel("port")));
	 
	var td = tr.insertCell(-1);
	var input = new StyledElements.StyledNumericField({initialValue: 993, min_value:1, max_value: 65535});
	input.insertInto(td);
	contextAdd["_port"]=input;
	 
	// USERNAME
	var tr = tbody.insertRow(-1);
	var td = tr.insertCell(-1);
	td.id = "username";
	td.appendChild(document.createTextNode(NotificadorCorreo.getTranslatedLabel("username")));
	 
	var td = tr.insertCell(-1);
	var input = new StyledElements.StyledTextField("_username", "");
	input.insertInto(td);
	contextAdd["_username"]=input;
	 
	// PASSWORD
	var tr = tbody.insertRow(-1);
	var td = tr.insertCell(-1);
	td.id = "password";
	td.appendChild(document.createTextNode(NotificadorCorreo.getTranslatedLabel("password")));
	 

	var td = tr.insertCell(-1);
	var input = new StyledElements.StyledPasswordField("_password", "");
	input.insertInto(td);
	contextAdd["_password"]=input;
	 
	// PROTOCOL
	var tr = tbody.insertRow(-1);
	var td = tr.insertCell(-1);
	td.id = "protocol";
	td.appendChild(document.createTextNode(NotificadorCorreo.getTranslatedLabel("protocol")));
	 

	var td = tr.insertCell(-1);
	var select = new StyledElements.StyledSelect({initialEntries:[['None', '---'], ['SSL', 'SSL']], 
						      initialValue:'None'});
	select.insertInto(td);
	contextAdd["_protocol"]=select;
	 
	content.appendChild(table);
	document.getElementById("addSettings").appendChild(content);
	alternatives.showAlternative(alternativeList[2]);
}


function displayModifyAccount()
{
    var i = 0;
    var auxAccounts = eval('('+accounts.get()+')');

    while((!document.getElementById("checkedAccount"+i).checked) && (i < auxAccounts.length))
	i++;
    
    var serverMail = auxAccounts[i].serverMail;
    var port = auxAccounts[i].port;
    var username = auxAccounts[i].username;
    var password = auxAccounts[i].password;
    var protocol = auxAccounts[i].connection;
    var email = auxAccounts[i].account;
    var name = auxAccounts[i].name;

    var header = document.getElementById("buttonsHeader");
    header.innerHTML = "";
    var divButtons = document.createElement("div");
    divButtons.className = "buttonsSettings";
    var imgAccept = document.createElement("img");
    var imgCancel = document.createElement("img");
    
    imgAccept.src = NotificadorCorreo.resourcesURL+'images/save.png';
    imgCancel.src = NotificadorCorreo.resourcesURL+'images/cancel.png';
    EzWebExt.addEventListener(imgCancel,"click", displayAccounts, false);
    EzWebExt.addEventListener(imgAccept, "click", 
    													EzWebExt.bind(
																						function(){
																								modifyAccount(this.i);
																						},
																						{'i':i}), 
															false);
    
    divButtons.appendChild(imgAccept);
    divButtons.appendChild(imgCancel);
    header.appendChild(divButtons);
    
    var content = document.createElement("div");
    content.id = "contentSetConfiguration";
    var table = document.createElement("table");
    var tbody = document.createElement("tbody");
    table.appendChild(tbody);
    table.id = "tableSetAccount";    
    contextModify = {};

    // NAME ACCOUNT
    var tr = tbody.insertRow(-1);
    var td = tr.insertCell(-1);
    td.id = "name";
    td.appendChild(document.createTextNode(NotificadorCorreo.getTranslatedLabel("name")));
         
    var td = tr.insertCell(-1);
    var input = new StyledElements.StyledTextField("_name", "");
    input.setValue(name);
    input.insertInto(td);
    contextModify["_name"]=input;
    
    // EMAIL
    var tr = tbody.insertRow(-1);
    var td = tr.insertCell(-1);
    td.id = "email";
    td.appendChild(document.createTextNode(NotificadorCorreo.getTranslatedLabel("email")));
     
    var td = tr.insertCell(-1);
    var input = new StyledElements.StyledTextField("_email", "");
    input.setValue(email);
    input.insertInto(td);
    contextModify["_email"]=input;
   
    // SERVER MAIL
    var tr = tbody.insertRow(-1);
    var td = tr.insertCell(-1);
    td.id = "serverMail";
    td.appendChild(document.createTextNode(NotificadorCorreo.getTranslatedLabel("serverMail")));
         
    var td = tr.insertCell(-1);
    var input = new StyledElements.StyledTextField("_serverMail", "");
    input.setValue(serverMail);
    input.insertInto(td);
    contextModify["_serverMail"]=input;
     
    // PORT
    var tr = tbody.insertRow(-1);
    var td = tr.insertCell(-1);
    td.id = "port";
    td.appendChild(document.createTextNode(NotificadorCorreo.getTranslatedLabel("port")));
         
    var td = tr.insertCell(-1);  
    var input = new StyledElements.StyledNumericField({initialValue: parseInt(port), min_value:1, max_value: 65535});
    input.insertInto(td);
    contextModify["_port"]=input;
    
    // USERNAME
    var tr = tbody.insertRow(-1);
    var td = tr.insertCell(-1);
    td.id = "username";
    td.appendChild(document.createTextNode(NotificadorCorreo.getTranslatedLabel("username")));
     
    var td = tr.insertCell(-1);
    var input = new StyledElements.StyledTextField("_username", "");
    input.setValue(username);
    input.insertInto(td);
    contextModify["_username"]=input;

    // PASSWORD
    var tr = tbody.insertRow(-1);
    var td = tr.insertCell(-1);
    td.id = "password";
    td.appendChild(document.createTextNode(NotificadorCorreo.getTranslatedLabel("password")));
     
    var td = tr.insertCell(-1);
    var input = new StyledElements.StyledPasswordField("_password", "");
    input.setValue(password);
    input.insertInto(td);
    contextModify["_password"]=input;
    
    // PROTOCOL
    var tr = tbody.insertRow(-1);
    var td = tr.insertCell(-1);
    td.id = "protocol";
    td.appendChild(document.createTextNode(NotificadorCorreo.getTranslatedLabel("protocol")));
     
    var td = tr.insertCell(-1);
    var select = new StyledElements.StyledSelect({initialEntries:[['None', '---'], ['SSL', 'SSL']], 
						  initialValue:protocol});
    select.insertInto(td);
    contextModify["_protocol"]=select;    
    content.appendChild(table);
  
    document.getElementById("modifySettings").innerHTML = "";
    document.getElementById("modifySettings").appendChild(content);
    alternatives.showAlternative(alternativeList[3]);
}



function checkButtonModify()
{
    var ncheckbox = 0;
    var auxAccounts = eval('('+accounts.get()+')');

    for(var i = 0; i < auxAccounts.length; i++)
	{
	    if(document.getElementById("checkedAccount"+i).checked)
		ncheckbox+=1
	}
    if (ncheckbox != 1)
	document.getElementById("buttonModify").style.display = "none";
    else
	document.getElementById("buttonModify").style.display = "inline";
}


function displayAccounts()
{
	document.getElementById("settings").innerHTML = "";
	
	var header = document.getElementById("buttonsHeader");
	header.innerHTML = "";

	var divButtons = document.createElement("div");
	divButtons.className = "buttonsSettings";
	
	var imgAdd = document.createElement("img");
	var imgModify = document.createElement("img");
	imgModify.id = "buttonModify";
	imgModify.style.display = "none";
	var imgDelete = document.createElement("img");
	var imgClose = document.createElement("img");

	imgAdd.src = NotificadorCorreo.resourcesURL+'images/add.png';
	imgModify.src = NotificadorCorreo.resourcesURL+'images/modify.png';
	imgDelete.src = NotificadorCorreo.resourcesURL+'images/delete.png';
	imgClose.src = NotificadorCorreo.resourcesURL+'images/close1.png';

	EzWebExt.addEventListener(imgAdd, "click", displayAddAccount, false);
	EzWebExt.addEventListener(imgModify, "click", displayModifyAccount, false);
	EzWebExt.addEventListener(imgDelete, "click", removeAccount, false);
	EzWebExt.addEventListener(imgClose, "click", synchronize, false);

	divButtons.appendChild(imgAdd);	
	divButtons.appendChild(imgModify);
	divButtons.appendChild(imgDelete);
	divButtons.appendChild(imgClose);

	header.appendChild(divButtons);

	var content = document.createElement("div");
	content.id = "contentConfiguration";

	var contentTable = document.createElement("div");
	contentTable.className = "contentTable";

	var table = document.createElement("table");
	var tbody = document.createElement("tbody");
	table.appendChild(tbody);
	table.id = "accounts";
	var tr = tbody.insertRow(-1);
	tr.style.cssText = "border-bottom:1px solid #888";
	tr.id = "headerContentConfiguration";
	var th = document.createElement("th");
	th.style.cssText = "width: 10%;border:0px;";
	tr.appendChild(th);
	
	var th = document.createElement("th");
	th.appendChild(document.createTextNode(NotificadorCorreo.getTranslatedLabel("email")));
	th.style.cssText = "width: 90%";
	th.id = "email";
	tr.appendChild(th);
	
	if (accounts.get() != "")
	    {
		var accountsDetails = eval('('+accounts.get()+')');
		for(var i=0; i < accountsDetails.length; i++)
		    {
			var tr = tbody.insertRow(-1);
			var td1 = tr.insertCell(-1);
			td1.className = "checkAccount";
			var td2 = tr.insertCell(-1);
			td2.className = "emailAccount";
			var input = document.createElement("input");
		
			input.setAttribute("type", "checkbox");
			input.id = "checkedAccount"+i;
			EzWebExt.addEventListener(input, "click", checkButtonModify, false);
			td1.appendChild(input);
			td2.appendChild(document.createTextNode(accountsDetails[i].account));
		    }
	    }
	else
	    table.style.cssText="border-bottom: 1px solid #888;";

	contentTable.appendChild(table);
	content.appendChild(contentTable);	
	document.getElementById("settings").appendChild(content);
	alternatives.showAlternative(alternativeList[1]);	
}


function synchronize()
{
    document.getElementById("settings").innerHTML = "";
    var header = document.getElementById("buttonsHeader");
    header.innerHTML = "";

    createMailboxList();
    getRecentMails();
}

function displayMailList()
{
    document.getElementById("accountsMailList").innerHTML = "";
    auxAccounts = eval('('+accounts.get()+')');

    for (var i=0; i < auxAccounts.length; i++)
	createAccount(auxAccounts[i].account);

    alternatives.showAlternative(alternativeList[0]);
}
	

function openFolder(key) 
{
    mailboxList[key]["div_children"].style.display = "block";
    mailboxList[key]["image_icon"].src = NotificadorCorreo.resourcesURL+'images/close.png';
    mailboxList[key]["state"] = "opened";
}

function closeFolder(key) 
{
    mailboxList[key]["div_children"].style.display = "none";
    mailboxList[key]["image_icon"].src = NotificadorCorreo.resourcesURL+'images/open.png';
    mailboxList[key]["state"] = "closed";
}


function clickAccount(key)
{
	if(mailboxList[key]["state"]){
		if (mailboxList[key]["state"] == "closed"){
			openFolder(key);
			return null;
		}
		else{
			closeFolder(key);
			return null;
		}
	}
	openFolder(key);
	return null;
}

// DISPLAY AN ACCOUNT
function createAccount(key)
{
    var name = document.createElement('div');
    name.className = 'open_tag';

    if (mailboxList[key]["list-mails"].length > 0)
	    EzWebExt.addEventListener(name, "click",
	    													EzWebExt.bind(
	    														function(){
	    															clickAccount(this.key);
	    														}, {'key':key}),
	    													false
	    													);

    mailboxList[key]["div_header"] = name;

    var imageIcon = document.createElement('img');
    imageIcon.className = "small_image";

    if(mailboxList[key]["list-mails"].length > 0)
			imageIcon.style.cssText = 'visibility:visible;float:left;padding-top:5px;';
    else
			imageIcon.style.cssText = 'visibility:hidden;float:left;padding-top:5px;';

    imageIcon.src = NotificadorCorreo.resourcesURL+"images/open.png";
    name.appendChild(imageIcon);
    mailboxList[key]["image_icon"] = imageIcon;

    var imageFolder = document.createElement('img');
    imageFolder.className = "folder_image";

    if(mailboxList[key]["state"] == "offline")
			imageFolder.src = NotificadorCorreo.resourcesURL+"images/account-offline.png";
    else
			imageFolder.src = NotificadorCorreo.resourcesURL+"images/account-online.png";

    name.appendChild(imageFolder);
    mailboxList[key]["image_folder"] = imageFolder;
    var div = document.createElement('div');
    div.id = key;
    div.style.cssText = "float:left";
    var span = document.createElement('span');
    span.className = 'node_name';
    span.appendChild(document.createTextNode(mailboxList[key].name));
    div.appendChild(span);
    name.appendChild(div);
    mailboxList[key]["span_folder"] = span;
    
    var children = document.createElement('div');
    children.className = "children";
    children.style.cssText = 'display:none;';
    if (mailboxList[key]["list-mails"].length > 0)
	{
	    var span = document.createElement("span");
	    span.className = "newMails";
	    span.appendChild(document.createTextNode("("+mailboxList[key]["list-mails"].length+")"));
	    name.appendChild(span);
	    for(var i = 0; i < mailboxList[key]['list-mails'].length; i++)
		{
		    var div = document.createElement("div");
		    EzWebExt.addEventListener(div, 
		    													"click", 
		    													EzWebExt.bind(
		    														function(){
		    															getMailDetails(this.key, this.i);
		    														}, {'key':key, 'i':i}),
		    													false
		    													);
		    													
		    var img = document.createElement("img");
		    img.src = NotificadorCorreo.resourcesURL+"images/mail.png";
		    var date = document.createElement("span");
		    date.className = "date";
		    var subject = document.createElement("span");
		    subject.className = "subject";
		    var from_name = document.createElement("span");
		    var from = document.createElement("a");
		    from.href = "mailto:"+mailboxList[key]['list-mails'][i].from.mail;
		    from.className = "from";
		    date.appendChild(document.createTextNode(mailboxList[key]['list-mails'][i].date));
		    subject.appendChild(document.createTextNode(mailboxList[key]['list-mails'][i].subject));
		    from_name.appendChild(document.createTextNode(mailboxList[key]['list-mails'][i].from.name));
		    div.appendChild(img);
		    div.appendChild(date);
		    div.appendChild(subject);
		    from.appendChild(from_name);
		    div.appendChild(from);
		    children.appendChild(div);
		}
	}
    mailboxList[key]["div_children"] = children;
    document.getElementById("accountsMailList").appendChild(name);
    document.getElementById("accountsMailList").appendChild(children);
    
	if(mailboxList[key]["state"]){
		if(mailboxList[key]["state"] == "opened"){
		openFolder(key);
		}
	}
    
}


function getMailDetails(key, emailIndex)
{
    var auxAccounts = eval("("+accounts.get()+")");
    

    for(var i=0; i < auxAccounts.length; i++)
	{
	    if(auxAccounts[i].account == key)
		{
			to.set(key);
			to_username.set(auxAccounts[i].username);
			from.set(mailboxList[key]["list-mails"][emailIndex].from.mail);
			from_name.set(mailboxList[key]["list-mails"][emailIndex].from.name);
			subject.set(mailboxList[key]["list-mails"][emailIndex].subject);
			date.set(mailboxList[key]["list-mails"][emailIndex].date);
			uid.set(mailboxList[key]["list-mails"][emailIndex].uid);
			mailbox.set(mailboxList[key]["list-mails"][emailIndex].mailbox);
			var detailsAux = {"uid":mailboxList[key]["list-mails"][emailIndex].uid,
					  "mailbox":mailboxList[key]["list-mails"][emailIndex].mailbox,
					  "account":key};
			details.set(to_json(detailsAux));
		    return;
		}
	}
}



function addLoadingImage() 
{
	removeLoadingImage();
	var body = document.getElementsByTagName("body")[0];
	var background = document.createElement('div');
	background.id = "loading_background";
	// cancels the call to startdrag function
	//background.observe("mousedown", function (e) {
	//	e = e || window.event; // needed for IE
	//	Event.stop(e);
	//});
	body.appendChild(background);
	var image = document.createElement('img');
	image.id = "loading_image";
	image.src = NotificadorCorreo.resourcesURL+'images/ajax-loader.gif';
	body.appendChild(image);
}

function removeLoadingImage() {
	var body = document.getElementsByTagName("body")[0];
	var background = document.getElementById("loading_background");
	var image = document.getElementById("loading_image");
	if (background != null)
		body.removeChild(background);
	if (image != null)
		body.removeChild(image);
}


function reload() {
    if(document.getElementById("settings").innerHTML == "")
	{
	    size = 0;
	    createMailboxList();
	    getRecentMails();
	}
}

function resetInterval(value) 
{
	if (interval != null){
		try {
			clearInterval(interval);
		}
		catch(e){
		}
	}

	if (time.get() >= 1){
		interval = setInterval("reload()",value * 60000);
	}
}
