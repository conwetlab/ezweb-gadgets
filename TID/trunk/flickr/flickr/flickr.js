var agent=navigator.userAgent;
var is_iphone = (agent.indexOf('iPhone')!=-1);

var time = EzWebAPI.createRGadgetVariable('time', resetInterval);
var vkey = EzWebAPI.createRGadgetVariable("keyword", displayMenu);
var nphotosPref = EzWebAPI.createRGadgetVariable("photosperpage", setNumberOfPhotos);
var urlImage = EzWebAPI.createRWGadgetVariable("urlImage");
var vdefault = EzWebAPI.createRGadgetVariable("defaultSearch", displayMenu);
var interval = null;
var titleevent = EzWebAPI.createRWGadgetVariable ('title');
var autorevent = EzWebAPI.createRWGadgetVariable ('autor');
var keywordevent = EzWebAPI.createRWGadgetVariable("keyword_event");

var previousimgs = [];
var currentimgs = [];
var nextimgs = [];

function init (){
	// Creo la cabecera
	var header = document.createElement ('div');
	header.setAttribute ('id', 'header');
	var img = document.createElement('img');
	img.setAttribute ('id', 'logo');
	img.setAttribute ('src', 'http://demo.ezweb.morfeo-project.org/repository/flickr/flickr/flickr.png');
	var a = document.createElement ('a');
	a.setAttribute ('href', 'http://www.flickr.com');
	a.style.cssText = 'text-decoration:None; color:white;';
	a.setAttribute ('target', '_blank');
	a.setAttribute ('title', 'Flickr');
	a.appendChild(img);
	var imgrefresh = document.createElement('img');
	imgrefresh.setAttribute ('id', 'refreshimg');
	imgrefresh.setAttribute ('title', 'Refresh');
	imgrefresh.src ='http://demo.ezweb.morfeo-project.org/repository/flickr/flickr/refresh.png';
	imgrefresh.setAttribute ('onclick', 'setNumberOfPhotos();');
	imgrefresh.style.cssText = 'cursor: pointer; position:absolute; top:5px; right:5px;';
	header.appendChild (imgrefresh);
	header.appendChild (a);
	// creo el div del contenido
	var content = document.createElement ('div');
	content.setAttribute ('id', 'content_div');
	content.style.cssText = 'margin:0 auto; text-align:center; overflow:auto; position:absolute; top:40px; bottom:22px';
	var footer = document.createElement ('div');
	footer.setAttribute ('id', 'footer_div');
	footer.style.cssText = 'position:absolute; bottom:0px; left:5px; right:5px; height:22px; text-align:center;';
	img = document.createElement ('img');
	img.src = 'http://demo.ezweb.morfeo-project.org/repository/flickr/flickr/go-first.png';
	img.setAttribute ('title', 'Go First');
	img.addEventListener ('click', function (e){setArrays(null,0);}, false);
	footer.appendChild (img);
	img = document.createElement ('img');
	img.src = 'http://demo.ezweb.morfeo-project.org/repository/flickr/flickr/go-previous.png';
	img.setAttribute ('title', 'Go Previous');
	img.addEventListener ('click', function (e){setArrays(null,1);}, false);
	footer.appendChild (img);
	img = document.createElement ('img');
	img.src = 'http://demo.ezweb.morfeo-project.org/repository/flickr/flickr/go-next.png';
	img.setAttribute ('title', 'Go Next');
	img.addEventListener ('click', function (e){setArrays(null,2);}, false);
	footer.appendChild (img);
	img = document.createElement ('img');
	img.src = 'http://demo.ezweb.morfeo-project.org/repository/flickr/flickr/go-last.png';
	img.setAttribute ('title', 'Go Last');
	img.addEventListener ('click', function (e){setArrays(null,3);}, false);
	footer.appendChild (img);

	document.body.appendChild (header);
	document.body.appendChild (content);
	document.body.appendChild (footer);

	nphotos = parseInt(nphotosPref.get ());
        displayMenu(keywordevent.get(), true);

	resetInterval(time.get());
}

function setNumberOfPhotos() {
	nphotos = parseInt(nphotosPref.get ());
	displayMenu(keywordevent.get());
}

function displayMenu(keyword, nonPropagate) {
	
	keyword = ((keyword != "")?keyword:((vdefault.get()!="")?vdefault.get():"ezweb"));

	feedUrl = "http://api.flickr.com/services/feeds/photos_public.gne?tags="+encodeURIComponent(keyword)+"&lang=en-us&format=rss_200";
	if (!nonPropagate) 
		keywordevent.set(keyword);
	EzWebAPI.send_get(feedUrl, this, displayOk, displayError);
}

function displayOk(resp){
	var response = resp.responseXML;
	// At first, saving the images content into a new structure
	var items = response.getElementsByTagName("item");
	var imgs = [];
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
		img = {title:titulo, autor:autor, url:urlT};
		imgs[i]=img;
	}
	previousimgs = [];
	currentimgs = [];
	nextimgs = [];
	setArrays (imgs, null);
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
	interval = setInterval(function(){
		displayMenu(vkey.get());
	}, value*60000);
}

function setArrays (imgs, from){
	// Caso inicial
	if ((previousimgs.length==0) && (currentimgs.length==0) && (nextimgs.length==0)){ 
		// Get the number of photos in the current list
		last = (nphotos<imgs.length) ? nphotos : imgs.length;
		for (i=0; i<last; i++){
			img = imgs[i]; // get the first img
			currentimgs[i] = img; // inserting into currentimgs
		}
		// Adding the rest of the imgs in the nextimgs list
		for (i=last; i<imgs.length; i++){
			nextimgs [nextimgs.length] = imgs[i];
		}
		displayImages();
		return;
	}
	if (from == 0){ // asking for first images
		// it has all the imgs
		previousimgs = previousimgs.concat(currentimgs.concat(nextimgs));
		last = (nphotos<previousimgs.length) ? nphotos : previousimgs.length;
		currentimgs = [];
		nextimgs = [];
		for (i=0; i<last; i++){
			img = previousimgs[i]; // get the first img
			currentimgs[i] = img; // inserting into currentimgs
		}
		// Adding the rest of the imgs in the nextimgs list
		for (i=last; i<previousimgs.length; i++){
			nextimgs [nextimgs.length] = previousimgs[i];
		}
		previousimgs = [];
		displayImages();
		return;
	} 
	if (from == 1){ // asking for previous images
		if (previousimgs.length == 0)
			return;
		// Moving the currentimgs into the nextimgs list
		currentimgs = currentimgs.concat(nextimgs);
		nextimgs = currentimgs;
		currentimgs = [];
		currentimgs = previousimgs.slice (previousimgs.length-nphotos, previousimgs.length);
		previousimgs = previousimgs.slice (0, previousimgs.length-nphotos);
		displayImages();
		return;
	}
	if (from == 2){ // asking for next images
		if (nextimgs.length == 0)
			return;
		previousimgs = previousimgs.concat(currentimgs);
		currentimgs = [];
		last = (nphotos<previousimgs.length) ? nphotos : previousimgs.length;
		currentimgs = nextimgs.slice (0, last);
		nextimgs = nextimgs.slice (last, nextimgs.length);	
		displayImages();
		return;
	}
	if (from == 3){ // asking form last images
		previousimgs = previousimgs.concat(currentimgs.concat(nextimgs));
		nextimgs = [];
		currentimgs = [];
		last = previousimgs.length%nphotos;
		currentimgs = previousimgs.slice(previousimgs.length-last, previousimgs.length);
		previousimgs = previousimgs.slice(0, previousimgs.length-last);
		displayImages();
		return;
	}
}

function displayImages () {
	document.getElementById('content_div').innerHTML = '';
	for (var i=0;i<currentimgs.length;i++){
		var img = currentimgs[i]; // get the first img
		// creating link
		a = document.createElement('a');
		a.href = '#';
		a.addEventListener('click', EzWebExt.bind(function(e){
			    sendImage(this.url, this.title, this.autor);
		}, img), false);
		if (img.title != "")
			title = '\''+ img.title +'\' by '+ img.autor;
		else
		title = 'Photo by ' + img.autor;
		a.setAttribute ('title', title);
		// creating image
		image = document.createElement ('img');
		image.src = img.url;
		image.setAttribute ('class', 't');
		image.setAttribute ('alt', title);
		a.appendChild(image);
		document.getElementById('content_div').appendChild(a);
	}
}
