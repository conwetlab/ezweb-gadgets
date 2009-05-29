var agent=navigator.userAgent;
var is_iphone = (agent.indexOf('iPhone')!=-1);

var time = EzWebAPI.createRGadgetVariable('time', resetInterval);
var vkey = EzWebAPI.createRGadgetVariable("keyword", displayMenu);
var urlImage = EzWebAPI.createRWGadgetVariable("urlImage");
var vdefault = EzWebAPI.createRGadgetVariable("defaultSearch", displayMenu);
var interval = null;
var titleevent = EzWebAPI.createRWGadgetVariable ('title');
var autorevent = EzWebAPI.createRWGadgetVariable ('autor');

function init (){
	// Creo la cabecera
	var header = document.createElement ('div');
	header.setAttribute ('id', 'header');
	var img = document.createElement('img');
	img.setAttribute ('id', 'logo');
	img.setAttribute ('title', 'Refresh');
	img.setAttribute ('src', 'http://demo.ezweb.morfeo-project.org/repository/flickr/flickr.png');
	img.setAttribute ('onclick', 'displayMenu2();');
	img.style.cssText = 'cursor: pointer';
	header.appendChild (img);
	// creo el div del contenido
	var content = document.createElement ('div');
	content.setAttribute ('id', 'content_div');
	content.style.cssText = 'margin:0 auto; text-align:center;';

	document.body.appendChild (header);
	document.body.appendChild (content);

	displayMenu(vkey.get());
	resetInterval(time.get())
}
function displayMenu2(){
	displayMenu(vkey.get());
}
function displayMenu(keyword) {
	if (keyword==""){
		if (vdefault.get()=="")
			feedUrl = "http://api.flickr.com/services/feeds/photos_public.gne?tags=ezweb&lang=en-us&format=rss_200";
		else
		        feedUrl = "http://api.flickr.com/services/feeds/photos_public.gne?tags="+vdefault.get()+"&lang=en-us&format=rss_200";
	}
	else
		feedUrl = "http://api.flickr.com/services/feeds/photos_public.gne?tags="+keyword+"&lang=en-us&format=rss_200";
	feedUrl = encodeURI(feedUrl);
	EzWebAPI.send_get(feedUrl, this, displayOk, displayError);
}

function displayOk(resp){
	var response = resp.responseXML;

	var html = "";
	var items = response.getElementsByTagName("item");
	for (var i = 0; i < items.length ; i++) {
	        if (i==9 && is_iphone)
		    break;
		var itemNodes = items.item(i).childNodes;
		for (var j = 0; j < itemNodes.length ; j++) {
			var node = itemNodes.item(j);
			if (node.nodeName=="media:thumbnail")
				var urlT = node.getAttribute("url");
			else if (node.nodeName=="link")
				var url = node.firstChild.nodeValue;
			else if (node.nodeName=="title") 
				if (node.firstChild)
					var t = node.firstChild.nodeValue;
				else var t = "";
			else if (node.nodeName=="author")
				var a = node.firstChild.nodeValue;
		}
		var autor = a.substring(a.indexOf('(')+1, a.lastIndexOf(')'));
		var titulo = t;
		if (t!="")
			t = '\''+t+'\' by '+ autor;
		else
			t = 'Photo by '+autor;

		html += '<a href="#" onclick="sendImage(\''+urlT+'\',\''+titulo+'\',\''+autor+'\');" title="'+t+'"><img src="'+urlT+'" class="t" alt="'+t+'"></a>';
		//html += '<a href="'+url+'" title="'+t+'" target="_blank"><img src="'+urlT+'" class="t" alt="'+t+'"></a>';
	}
	document.getElementById('content_div').innerHTML = html;
}

function sendImage(urlImage_,titulo,autor)
{
	titleevent.set (titulo);
	autorevent.set (autor);
	urlImage.set(urlImage_.substr(0, urlImage_.length - 6) + urlImage_.substr(urlImage_.length - 4, 4));
}

function displayError(res){
         
}

function resetInterval (value){
	if (interval != null)
	{
		try {
			clearInterval (interval);
		}
		catch(e){
		}
	}
	interval = setInterval('displayMenu2()', value*60000);
}

