var urladaptor = EzWebAPI.createRGadgetVariable("urlMediaWikiAdaptor", setURL);


// This function manage the read variable urlMediaWikiAdaptor
function setURL ()
{ }


// This class save the title, description, url and links of an article
function Details(title, description, url)
{
    this.title = title;
    this.description = description;
    this.url = url;
}


// This class saves the error data
function Error(code, description)
{
    this.code = code;
    this.description = description;
}
/****************************************************************************************/
/****************************************************************************************/
/*******************   GET AND DISPLAY A SEARCH INTO A WIKIPEDIA ************************/
/****************************************************************************************/
/****************************************************************************************/
var search_result = null;
var contador = 0;
var maximo = 0;
// This function searchs in a wiki the value given
function getSearch(value, sroffset, srlimit, targetTab)
{
	var urlRequest = urlbaseApi + '?action=query' + '&list=search' + '&sroffset=' + sroffset +
	    '&srlimit=' + srlimit + '&srsearch=' + encodeURIComponent(value.replace(/ /g, '_')) + '&format=xml';
        var context = {"value":value, "pagesearch": (sroffset/srlimit), "targetTab": targetTab, "next":null}
	EzWebAPI.send_get(urlRequest, context, onSuccessSearch, onError);
} //end getSearch

//  This function parses the xml tree given from adaptor
function onSuccessSearch(response)
{
	var context = this;
	var children = response.responseXML.getElementsByTagName('p');
	var next = response.responseXML.getElementsByTagName('query-continue');
	if (next.length == 0)
		context.next = false;
	else
		context.next = true;
	search_result= null;
	if (children.length > 0)
	{
		search_result = new Array(children.length);
		for(var i = 0; i < children.length; i++)
		{
			var title = children[i].attributes.title.nodeValue;
			search_result[i]= new Details (title, null, null);
		}
		contador = 0;
		maximo = children.length;
		getDetails (search_result[contador].title, context);
	}
	else
	{
		search_result = new Array ();
		displaySearch (search_result, context);
	}
}// end onSuccessSearch
/****************************************************************************************/
/****************************************************************************************/
/***********   GET A LITTLE DESCRIPTION OF AN ARTICLE FROM A WIKIPEDIA ******************/
/****************************************************************************************/
/****************************************************************************************/
// This function gets article description given form a wikipedia
function getDetails(value, context)
{
	var urlRequest = urlbaseApi + '?action=opensearch' + '&search=' + encodeURIComponent(value.replace(/ /g, '_')) + '&format=xml';
	EzWebAPI.send_get(urlRequest, context, onSuccessDescription, onError);
}

// This function parses the xml tree given from wikipedia api
function onSuccessDescription(response)
{
	var context = this;
	var title = response.responseXML.getElementsByTagName ('Query')[0].firstChild.nodeValue;
	var items = response.responseXML.getElementsByTagName('Item');
	var encontrado = false;
	for (var i=0; (i<items.length) &&(!encontrado); i++)
	{
		var text = items[i].getElementsByTagName('Text')[0].childNodes[0].nodeValue;
		var description = items[i].getElementsByTagName('Description')[0].childNodes[0].nodeValue;
		var url = items[i].getElementsByTagName ('Url')[0].childNodes[0].nodeValue;
		encontrado = (title.replace(/_/g, " ") == text.replace(/_/g, " "));
	}
	if (encontrado) {
		search_result [contador].description = description;
		search_result [contador].url = url;
	}
	else {
		search_result [contador].description = 'Error';
		search_result [contador].url ='#';
	}
	contador ++;
	if (contador < maximo) {
		getDetails (search_result[contador].title, context);
	}
	else
		displaySearch(search_result, context);
}


/****************************************************************************************/
/****************************************************************************************/
/**************************   GET AN ARTICLE FROM A WIKIPEDIA ***************************/
/****************************************************************************************/
/****************************************************************************************/
/*
 * This function get article from wikipedia
 */
function getArticle(value)
{
    var urlRequest = urladaptor.get() + '/MediaWikiAdaptor/'+ urlbaseWiki + '/content/' + encodeURIComponent(value.replace(/ /g, '_'));
    EzWebAPI.send_get(urlRequest, this, onSuccessArticle, onError);
}

function onSuccessArticle(response)
{
	var content = '';
	var childs = response.responseXML.getElementsByTagName ('contentArticle')[0].childNodes;
	for (var i=0; i <childs.length; i++)
		content+=childs[i].nodeValue;
	displayArticle (content);
}

/****************************************************************************************/
/****************************************************************************************/
/***************************   FUNCIONES MISCENALEAS ************************************/
/****************************************************************************************/
/****************************************************************************************/
/*
 * this function manage the errors
 */
function onError (response)
{
	var error = null;
	var children;
	try
	{
		children = response.responseXML.getElementsByTagName('error');
	}
	catch (Exception)
	{
		error = new Error(500, "Error");
		displayError (error);
		return;
	}

	if (children.length == 0)
	{
	    error = new Error(500, "Error");
	}
	else
	{
		child = children[0];
		var code = child.getElementsByTagName('description')[0].childNodes[0].nodeValue;
		var description = child.getElementsByTagName('description')[0].childNodes[0].nodeValue;
		error = new Error(code, description)
	}
	displayError (error);
}

function encode (string) {
	string = string.replace(/\r\n/g,"\n");
	var utftext = "";

	for (var n = 0; n < string.length; n++) {
		var c = string.charCodeAt(n);
		if (c < 128) {
			utftext += String.fromCharCode(c);
		}
		else if((c > 127) && (c < 2048)) {
			utftext += String.fromCharCode((c >> 6) | 192);
			utftext += String.fromCharCode((c & 63) | 128);
		}
		else {
			utftext += String.fromCharCode((c >> 12) | 224);
			utftext += String.fromCharCode(((c >> 6) & 63) | 128);
			utftext += String.fromCharCode((c & 63) | 128);
		}
	}
	return utftext;
}
function decode (utftext) {
	var string = "";
	var i = 0;
	var c = c1 = c2 = 0;

	while ( i < utftext.length ) {
		c = utftext.charCodeAt(i);

		if (c < 128) {
			string += String.fromCharCode(c);
			i++;
		}
		else if((c > 191) && (c < 224)) {
			c2 = utftext.charCodeAt(i+1);
			string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
			i += 2;
		}
		else {
			c2 = utftext.charCodeAt(i+1);
			c3 = utftext.charCodeAt(i+2);
			string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
			i += 3;
		}
	}
		return string;
}


