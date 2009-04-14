var urlApi = "http://es.old.finance.yahoo.com/d/quotes.csv";
var urlApi2 = "http://download.finance.yahoo.com/d/quotes.csv"


function refresh(type, _symbols, _tags, indexTab)
{
	addLoadingImage();
	var s = "";
	var t = "";
	
	// CONCATENATE SYMBOLS REQUEST
    for(var i = 0; i < _symbols.length; i++)
	{
	    if (s != "")
		{
		    s += "+" + encodeURIComponent(_symbols[i].replace(/ /g, ""));
		}
	    else
		{
		    s += "+" + encodeURIComponent(_symbols[i].replace(/ /g, ""));
		}
	}
	

	var preferencesAux = eval('('+preferences.get()+')');
	
	if (type == 0)
	{
	    var preferencesAux = eval('('+preferences.get()+')');
	    var tagsAux = preferencesAux.list;
	    
	    // CONCATENATE TAGS REQUEST
	    for(var i = 0; i < tagsAux.length; i++)
		t += tagsAux[i];
	    
	    var context = {symbols: _symbols, tags: tagsAux, newTab: false, indexTab : indexTab}		
	    var urlRequest = urlApi + "?s=" + s + "&f=" + t;
	    EzWebAPI.send_get(urlRequest, context, onSuccessGetQuoteMarket, onError);
	}
	else if(type == 1)
	    {
		var tagsAux = preferencesAux.list;
		// CONCATENATE TAGS REQUEST
		for(var i = 0; i < tagsAux.length; i++)
		    t += tagsAux[i];
		
		
		var context = {symbols: _symbols, tags: tagsAux, newTab: false, indexTab : indexTab}			
		var urlRequest = urlApi + "?s=" + s + "&f=" + t;
		EzWebAPI.send_get(urlRequest, context, onSuccessGetQuoteFile, onError);
	}
	else
	{
		var tagsAux = preferencesAux.enterprise;
		// CONCATENATE TAGS REQUEST
    	for(var i = 0; i < tagsAux.length; i++)
			t += tagsAux[i];
		
		var context = {symbols: _symbols, tags: tagsAux, newTab: false, indexTab : indexTab}
		var urlRequest = urlApi2 + "?s=" + s + "&f=" + t;
    	EzWebAPI.send_get(urlRequest, context, onSuccessGetQuoteEnterprise, onError);
	}
}

function getNamesMarkets(_symbols)
{
	addLoadingImage();
	var s="";
	for(var i=0; i < _symbols.length; i++)
	{
		if (s != "")
		    s += "+" + encodeURIComponent(_symbols[i].replace(/ /g, ""));
	    else
		    s += "+" + encodeURIComponent(_symbols[i].replace(/ /g, ""));
	}
	
	var t = "ns";
	var urlRequest = urlApi + "?s=" + s + "&f=" + t;
	EzWebAPI.send_get(urlRequest, this, onSuccessGetNameQuoteMarket, onError);
}


function getNamesEnterprises(list, value)
{
	addLoadingImage();
	var s="";
	for(var i=0; i < value.length; i++)
	{
		if (s != "")
		    s += "+" + encodeURIComponent("@"+value[i].replace(/ /g, ""));
	    else
		    s += "+" + encodeURIComponent("@"+value[i].replace(/ /g, ""));
	}
	
	var t="ns";
	context = {"marketSelected": value[0]};
	var urlRequest = urlApi + "?s=" + s + "&f=" + t;
	EzWebAPI.send_get(urlRequest, context, onSuccessGetNameQuoteEnterprise, onError);
}


function getNamesEnterprisesSelected(_symbols)
{
	addLoadingImage();
	var s="";
	for(var i=0; i < _symbols.length; i++)
	{
		if (s != "")
		    s += "+" + encodeURIComponent(_symbols[i].replace(/ /g, ""));
	    else
		    s += "+" + encodeURIComponent(_symbols[i].replace(/ /g, ""));
	}
	
	var t="ns";
	var urlRequest = urlApi + "?s=" + s + "&f=" + t;
	EzWebAPI.send_get(urlRequest, this, onSuccessGetNameQuoteEnterpriseSelected, onError);
}


function getQuoteMarket(symbols, tags)
{
	addLoadingImage();
    var s = "";
    var t = "";
	
	if (value == "")
		value = "MAIN";
	else
		value = symbols[0].replace(/@/g, "").replace(/\^/g, "");

    // CONCATENATE SYMBOLS REQUEST
    for(var i = 0; i < symbols.length; i++)
	{
		if (s != "")
			s += "+" + encodeURIComponent(symbols[i]);
		else
			s += encodeURIComponent(symbols[i]);
    }
	
    // CONCATENATE TAGS REQUEST
    for(var i = 0; i < tags.length; i++)
		t += tags[i];

  	var context = {symbols: symbols, tags: tags, newTab: true}
    var urlRequest = urlApi + "?s=" + s + "&f=" + t;
    EzWebAPI.send_get(urlRequest, context, onSuccessGetQuoteMarket, onError);
}

function getQuoteFile(symbols, tags)
{
	addLoadingImage();
    var s = "";
    var t = "";
	
	if (value == "")
		value = "MAIN";
	else
		value = symbols[0].replace(/@/g, "").replace(/\^/g, "");

    // CONCATENATE SYMBOLS REQUEST
    for(var i = 0; i < symbols.length; i++)
	{
		if (s != "")
			s += "+" + encodeURIComponent(symbols[i].replace(/ /g, ""));
		else
			s += encodeURIComponent(symbols[i].replace(/ /g, ""));
    }
	
    // CONCATENATE TAGS REQUEST
    for(var i = 0; i < tags.length; i++)
		t += tags[i];
    
	var context = {symbols: symbols, tags: tags, newTab: true}
    var urlRequest = urlApi + "?s=" + s + "&f=" + t;
    EzWebAPI.send_get(urlRequest, context, onSuccessGetQuoteFile, onError);
}


function getQuoteEnterprise(symbols, tags)
{
	addLoadingImage();
    var s = "";
    var t = "";
	
	if (value == "")
		value = "MAIN";
	else
		value = symbols[0].replace(/@/g, "").replace(/\^/g, "");

    // CONCATENATE SYMBOLS REQUEST
    for(var i = 0; i < symbols.length; i++)
	{
		if (s != "")
			s += "+" + encodeURIComponent(symbols[i].replace(/\^/g, "").replace(/@/g, ""));
		else
			s += encodeURIComponent(symbols[i].replace(/\^/g, "").replace(/@/g, ""));
    }
	
    // CONCATENATE TAGS REQUEST
    for(var i = 0; i < tags.length; i++)
		t += tags[i];
		
	if (tags.length == 2)
		t += "a";
    
	var context = {symbols: symbols, tags:tags, newTab: true}
    var urlRequest = urlApi2 + "?s=" + s + "&f=" + t;
    EzWebAPI.send_get(urlRequest, context, onSuccessGetQuoteEnterprise, onError);
}


/*

*/

function onSuccessGetQuoteMarket(response)
{
	var context = this;
    var text = response.responseText;
    var lines = text.split("\n");
    var quote = [];

    for(var i = 0; i < lines.length; i++)
	{
		if (lines[i] != "")
			{
				var info = lines[i].split(";");
				for (var j = 0; j < info.length; j++) {
					info[j] = info[j].replace(/\"/g, "");
				}
				info[1] = info[1].replace(/ /g, "");
	    		quote[i] = info;
			}			
	}
    displayQuoteMarket(quote, context);
}


function onSuccessGetQuoteFile(response)
{
	var context = this;
    var text = response.responseText;
    var lines = text.split("\n");
    var quote = [];

    for(var i = 0; i < lines.length; i++)
	{
		if (lines[i] != "")
			{
				var info = lines[i].split(";");
				for (var j = 0; j < info.length; j++) {
					info[j] = info[j].replace(/\"/g, "");
				}
				info[1] = info[1].replace(/ /g, "");
	    		quote[i] = info;
			}			
	}
    displayQuote(quote, context);
}


function onSuccessGetQuoteEnterprise(response)
{
    var context = this;
	var text = response.responseText;
    var lines = text.split("\n");
    var quote = [];

    for(var i = 0; i < lines.length; i++)
	{
		if (lines[i] != "")
			{
				var info = lines[i].split(",");
				for (var j = 0; j < info.length; j++) {
					info[j] = info[j].replace(/\"/g, "");
				}
				info[1] = info[1].replace(/ /g, "");
	    		quote[i] = info;
			}			
	}
    displayQuoteEnterprise(quote, context);
}

function onSuccessGetNameQuoteMarket(response)
{
   	var text = response.responseText;
    var lines = text.split("\n");
    var quote = [];

    for(var i = 0; i < lines.length; i++)
	{
		if (lines[i] != "")
			{
				var info = lines[i].split(";");
				info[1] = info[1].replace(/ /g, "");
	    		quote[i] = [info[1], info[0]];
			}			
	}
	
	displayNameMarket(quote);
}

function onSuccessGetNameQuoteEnterprise(response)
{
   	var text = response.responseText;
    var lines = text.split("\n");
    var quote = [];
	var context = this;
	
    for(var i = 0; i < lines.length; i++)
	{
		if (lines[i] != "")
			{
				var info = lines[i].split(";");
				info[1] = info[1].replace(/ /g, "");
	    		quote[i] = [info[1], info[0]];
			}			
	}
	
	displayNameEnterprise(context.marketSelected, quote);
}

function onSuccessGetNameQuoteEnterpriseSelected(response)
{
   	var text = response.responseText;
    var lines = text.split("\n");
    var quote = [];
		
    for(var i = 0; i < lines.length; i++)
	{
		if (lines[i] != "")
			{
				var info = lines[i].split(";");
				info[1] = info[1].replace(/ /g, "");
	    		quote[i] = [info[1], info[0]];
			}			
	}
	
	displayNameEnterpriseSelected(quote);
}

function onError()
{
	removeLoadingImage();
}





