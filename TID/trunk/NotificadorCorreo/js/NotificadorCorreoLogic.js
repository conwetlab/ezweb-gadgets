function createMailboxList()
{
    if (accounts.get() == "")
	{
	    mailboxList = {};
	    displayAccounts();

	    return;
	}

    var auxAccounts = eval('('+accounts.get()+')');
    mailboxList = {};

    for (var i = 0; i < auxAccounts.length; i++)
	{
	    mailboxList[auxAccounts[i].account] = {}
	    mailboxList[auxAccounts[i].account]["list-mails"] = new Array();
	    mailboxList[auxAccounts[i].account]["state"] = "closed";
	    mailboxList[auxAccounts[i].account]["name"] = auxAccounts[i].name;

	}
}


function getRecentMails() 
{
    if(accounts.get() == "")
	return;

    addLoadingImage();
    var configs = eval('('+accounts.get()+')');
    for(var i = 0; i < configs.length; i++)
	{
	    var config = {account: configs[i].account, 
			  username: configs[i].username,
			  password: configs[i].password,
			  host: configs[i].serverMail,
			  port: configs[i].port,
			  connection: configs[i].connection}

	    NotificadorCorreo.sendPost("http://demo.ezweb.morfeo-project.org:13000/mailproxy/imap/recent/1/20/", "config=" + 
			      encodeURIComponent(to_json(config)), 
			      onSuccessGetSize, 
			      onError);
	}
}


function onError(transport)
{
    try 
	{
	    var response = eval('('+transport.responseText+')');
	    var account = ((response.account)?response.account:"");

	    mailboxList[account]["state"] = "offline";    
	    mailboxList[account]["list-mails"] = new Array();
	    removeLoadingImage();
	    displayMailList();
	}
    catch (e) 
	{
	    var auxAccounts = eval ('('+accounts.get()+')');
	    for(var i=0; i < auxAccounts.length; i++)
		{
		    mailboxList[auxAccounts[i].account]["state"] = "offline";
		    mailboxList[auxAccounts[i].account]["list-mails"] = new Array();
		}
	    removeLoadingImage();
	    displayMailList();
	}
}



function onSuccessGetSize(transport)
{
    try{
	var response = eval("("+transport.responseText+')');
	if(response.size > 0)
	    {
		var enc = false;
		var configs = eval("("+accounts.get()+")");

		for(var i=0; (i < configs.length) && (!enc); i++)
		    {
			var account = ((response.account)?response.account:"");
			to_username.set(account);
			newMails.set(response.size);

			if(configs[i].account == account)
			    {
				var config = {account: configs[i].account, 
					      username: configs[i].username,
					      password: configs[i].password,
					      host: configs[i].serverMail,
					      port: configs[i].port,
					      connection: configs[i].connection}

				NotificadorCorreo.sendPost("http://demo.ezweb.morfeo-project.org:13000/mailproxy/imap/recent/1/"+response.size+"/", "config=" + 
						  encodeURIComponent(to_json(config)), 
						  onSuccessGetRecentMails, 
						  onError);
				enc = true;
			    }
		    }

	    }
	else
	    {
		mailboxList[response.account]["list-mails"] = new Array();
		removeLoadingImage();
		displayMailList();
	    }
    }
    catch (e) 
	{
	    removeLoadingImage();
	    alert(e.message);
	}
	
}

function onSuccessGetRecentMails(transport) {
	try {
		var response = eval("(" + transport.responseText + ")");
		//var size = response.size;
		//var mailList = response.mailList;
		var mails = new Array();

		for (var i=0; i < response.mailList.length; i++) 
		    {
			var mail = {};
			mail['subject'] = ((response.mailList[i]["subject"])?response.mailList[i]["subject"]:"");
			mail['from'] = ((response.mailList[i]["from"])?response.mailList[i]["from"]:"");
			
			if (response.mailList[i]["from"]&& 
			    (response.mailList[i]["from"].name != ""))
			    mail['from_name'] = response.mailList[i]["from"].name;
			else
			    mail['from_name'] = mail["from"].mail; 
			
			mail['date'] = ((response.mailList[i]["date"])?getDate(response.mailList[i]["date"]):"");
			mail['uid'] = ((response.mailList[i]["uid"])?response.mailList[i]["uid"]:"");
			mail['mailbox'] = ((response["mailbox"])?response["mailbox"]:"");
			mails[i] = mail;
		    }

		mailboxList[response.account]["list-mails"] = mails;
		removeLoadingImage();
		displayMailList();

		/*		if (size > 0) {
			removePopup();
			popup = EzWebExt.alert("Se ha" + ((size!=1)?"n":"") + " recibido " + size + " mensaje" + ((size!=1)?"s":"") + " nuevo" + ((size!=1)?"s":""),"Mensajes nuevos",EzWebExt.ALERT_INFO);
			} */
	}
	catch (e) {
		removeLoadingImage();
		alert(e.message);
	}
}


function removePopup() {
	if (popup != null) {
		try {
			document.body.removeChild(popup.background);
		}
		catch(e){}
		try {
			document.body.removeChild(popup.popup);
		}
		catch(e){}
	}
}

function getDate(longDate) {
	var date = new Date(longDate);
	return numberToString(date.getDate()) + "/" + numberToString(date.getMonth()+1) + "/" + date.getFullYear() + " " + numberToString(date.getHours()) + ":" + numberToString(date.getMinutes());
}

function numberToString(number) {
	return ((number < 10)? "0":"") + number;
}
	

function to_json(object) {
	return JSON.stringify(object, function (key, value) {
	    return value;
	});
}
