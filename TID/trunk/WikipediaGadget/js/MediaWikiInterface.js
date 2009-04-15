// Preferences and wiring variables
var howmanyresults = EzWebAPI.createRGadgetVariable ("howmanyresults", setHowMany);
var gotokey = EzWebAPI.createRGadgetVariable ("gotokey", setGoArticleWiring);
var wikipediaApi = EzWebAPI.createRGadgetVariable ("apilanguage", setLanguageWiki);
var keyword = EzWebAPI.createRGadgetVariable ("keyword", goSearchWiring);
var summary = EzWebAPI.createRWGadgetVariable ("summary");
var url = EzWebAPI.createRWGadgetVariable ("url");
var titleEvent = EzWebAPI.createRWGadgetVariable("title");
var imageEvent = EzWebAPI.createRWGadgetVariable("image");

// Url for Api, wiki, and images
var urlbaseApi = '';
var urlbaseWiki = '';
var urlhostWiki = '';
var urlimage = 'http://demo.ezweb.morfeo-project.org/repository/WikipediaGadget/images/'; 

// value = keywords de la busqueda
var value = '';
// nresutls = numero de resultados en cada busqueda
var nresults = 12;

// Element for use of tabs
var panelArticle = new StyledElements.StyledNotebook ({'id':'panelArticle'})

var WikipediaGadget = function () {
	EzWebGadget.call (this, {translatable:true});
}
WikipediaGadget.prototype = new EzWebGadget();
WikipediaGadget.prototype.resourcesURL = "http://demo.ezweb.morfeo-project.org/repository/WikipediaGadget"
// Funcion de inicio
WikipediaGadget.prototype.init = function() {
	setDefaultOptions();
	// Traducimos los botones de busqueda
	document.getElementById('search-button').innerHTML = '';
	document.getElementById('go-button').innerHTML = '';
	document.getElementById('search-button').appendChild(document.createTextNode(this.getTranslatedLabel('search-button')));
	document.getElementById('go-button').appendChild(document.createTextNode(this.getTranslatedLabel('go-button')));
	// Insertamos las pestanas en el content
	panelArticle.insertInto (document.getElementById('content'));
	goArticle('Main_Page');
}


WikipediaGadget = new WikipediaGadget();

// Funciones manejadoras de las variables
function setDefaultOptions () {
	urlbaseWiki = wikipediaApi.get();
	urlhostWiki = wikipediaApi.get();
	urlbaseApi = 'http://'+wikipediaApi.get()+'.wikipedia.org/w/api.php';
	nresults = howmanyresults.get();
}

// Selecciona el lenguaje en el que se hace la busqueda
function setLanguageWiki() {
	urlbaseWiki = wikipediaApi.get();
	urlhostWiki = wikipediaApi.get();
	urlbaseApi = 'http://'+wikipediaApi.get()+'.wikipedia.org/w/api.php';
	goArticle('Main_Page');
}
// Indica cuantos resultados se muestran en cada busqueda
function setHowMany() {
	nresults = howmanyresults.get();
}
/****************************************************************************************/
/****************************************************************************************/
/*******************   GET AND DISPLAY A SEARCH INTO A WIKIPEDIA ************************/
/****************************************************************************************/
/****************************************************************************************/
// Coge el valor de la busqueda del cuadro de texto
function goSearchInputText()
{
	value = document.getElementById('text_search').value;
	var pagesearch = 0;
	if (value != '')
	{
		addLoadingImage();
		getSearch (value, nresults * pagesearch, nresults, null);
	}
}
// Coge el valor de la busqueda por wiring
function goSearchWiring()
{
	value = keyword.get();
	var pagesearch = 0;
	if (value != '')
	{
		addLoadingImage();
		getSearch (value, nresults * pagesearch, nresults, null);
	}
}
/*
 * Muestra los resultados de una busqueda
 */
function displaySearch (search, context)
{
	// Tab que muestra los resultados de la busqueda
	if (context.targetTab != null)
	{
        	var tab1 = context.targetTab;
		tab1.clear();
	}
        else
		var tab1 = panelArticle.createTab ({
			"name":decodeURIComponent(context.value).replace(/_/g, " "),
			closeable:true
		});


	// Creamos los divs que necesitamos para pintar el resultado
	var div = document.createElement ('div');
	div.setAttribute ('id', 'search');
	div.className = 'search';
	
	// No hay resultados de la busqueda
	if (search.length == 0)
	{	
		var h4 = document.createElement ("h4");
		h4.setAttribute ("id", 'noSearchResult');
		h4.appendChild(document.createTextNode (WikipediaGadget.getTranslatedLabel('noSearchResult')));
		div.appendChild (h4);
	}
 	else if (search.length > 1)
	{
		// headers
		var h3 = document.createElement ("h3");
		h3.setAttribute ("id", 'searchResult');
		h3.appendChild(document.createTextNode (WikipediaGadget.getTranslatedLabel('searchResult')));
		var hr = document.createElement ("hr");
		div.appendChild (h3);
		div.appendChild (hr);
		// tabla con el resultado de la busqueda
		var result = document.createElement("table");
		var wordsearch = context.value.split (" ");
		for (var i=0; i <search.length; i++)
		{
			var name = search[i].title;
			var tr = document.createElement("tr");
			var a = document.createElement("a");
			var text = name.replace(/_/g," ");
			var wordresult = text.split(" ");
			for (var k = 0; k < wordresult.length; k++)
			{
				var encontrado = 0;
				for (var j = 0; j < wordsearch.length && encontrado ==0; j++)
				{
					if (wordresult[k].toLowerCase().search(wordsearch[j].toLowerCase())==0)
					{
						encontrado = 1;
					}
				}
				if (encontrado == 1)
				{
					var span = document.createElement ("span");
					span.className = 'remarked';
					span.appendChild(document.createTextNode (wordresult[k]+' '));
					a.appendChild (span);
				}
				else
				{
					a.appendChild (document.createTextNode(wordresult[k]+' '));
				}
			}
			a.setAttribute ('title', search[i].description);
			if (search[i].url != '#')
				a.setAttribute ('onClick', 'goArticle("'+ name +'");');
			tr.appendChild (a);
			result.appendChild (tr);
			div.appendChild (result);
		}
	}
	else // Si solo hay un resultado se muestra el contenido del articulo
	{
		/* Show page details */
		goArticle (search[i]);
		return;
	}
	// Creating the search navigationbar
	var navigationvar = document.createElement ("table");
	navigationvar.className = "navigationbar";
	var tr = document.createElement ("tr");
	// Boton de anterior
	var td1 = document.createElement ("td");
	var a = document.createElement ("a");
	var img = document.createElement ("img");
	if (context.pagesearch == 0)
		img.src = urlimage + 'back_disable.png';
	else
	{ // Si no es la primera pagina, da opcion de volver
		var context = {"value":context.value,"pagesearch":context.pagesearch,"targetTab":tab1, "next":context.next}; 
		a.addEventListener('click', EzWebExt.bind(goBackSearch, context), true);
		a.setAttribute('id', 'search-back-button');
		img.src = urlimage + 'back_enable.png';
	}
	a.appendChild(img);
	td1.appendChild(a);
	tr.appendChild(td1);
	// Celda con el numero de pagina
	var td2 = document.createElement ("td");
	var span = document.createElement ("span");
	span.className = 'pagesearch';
	span.appendChild(document.createTextNode(context.pagesearch+1));
	td2.appendChild (span);
	tr.appendChild(td2);
	// Boton de siguiente
	var td3 = document.createElement ("td");
	a = document.createElement ("a");
	var img = document.createElement ("img");
	if (context.next)
	{
		var context = {"value":context.value,"pagesearch":context.pagesearch,"targetTab":tab1, "next":context.next}; 
		a.addEventListener('click', EzWebExt.bind(goNextSearch, context), true);
		a.setAttribute('id', 'search-next-button');
		img.src = urlimage + 'front_enable.png';
	}
	else
	{
		img.src = urlimage + 'front_disable.png';
	}
	a.appendChild(img);
	td3.appendChild(a);
	tr.appendChild(td3);
	// Inserto la fila en la tabla y la tabla en el div
	navigationvar.appendChild (tr);
	var buttons = document.createElement ('div');
	buttons.setAttribute ('class', 'navigation-buttons');
	buttons.appendChild (navigationvar);
	div.appendChild (buttons);

	// Inserto el div en la pestana y voy a ella
	tab1.appendChild (div);
	panelArticle.goToTab (tab1.getId());
	removeLoadingImage();
}
function goNextSearch()
{
	addLoadingImage();
	var context = this;
	context.pagesearch ++;
	getSearch (context.value, context.pagesearch * nresults, nresults, context.targetTab);
}
function goBackSearch()
{
	addLoadingImage();
	var context = this;
	context.pagesearch --;
	getSearch (context.value, context.pagesearch*nresults, nresults, context.targetTab);
}
/****************************************************************************************/
/****************************************************************************************/
/********************   GET A COMPLETE ARTICLE FROM A WIKIPEDIA *************************/
/****************************************************************************************/
/****************************************************************************************/
function goArticle (value1)
{
	if (document.getElementById('wrapperarticle')==null)
	{
		var div = document.createElement('div');
		div.setAttribute ('id', 'wrapperarticle');
		div.setAttribute('class', 'wrapperarticle');
		document.getElementById('content').appendChild(div);
	}
	else
	{
		document.getElementById ('wrapperarticle').innerHTML = '';
	}
	addLoadingImage();
	value = encodeURIComponent(ucFirst(value1));
	getArticle (value);
}
// It gets the description of an article 
function goArticleInputText()
{
	if (document.getElementById('wrapperarticle')==null)
	{
		var div = document.createElement('div');
		div.setAttribute ('id', 'wrapperarticle');
		div.setAttribute('class', 'wrapperarticle');
		document.getElementById('content').appendChild(div);
	}
	else
	{
		document.getElementById ('wrapperarticle').innerHTML = '';
	}
	var value1 = document.getElementById ('text_search').value;
	if (value1 != '')
	{
		addLoadingImage();
		value = encodeURIComponent(ucFirst(value1));
		document.getElementById('text_search').value = '';
		getArticle (value);
	}
}
function setGoArticleWiring ()
{
	if (document.getElementById('wrapperarticle')==null)
	{
		var div = document.createElement('div');
		div.setAttribute ('id', 'wrapperarticle');
		div.setAttribute('class', 'wrapperarticle');
		document.getElementById('content').appendChild(div);
	}
	else
	{
		document.getElementById ('wrapperarticle').innerHTML = '';
	}
	var value1 = gotokey.get();
	if (value1 != '')
	{
		addLoadingImage();
		value = encodeURIComponent(ucFirst(value1));
		document.getElementById('text_search').value = '';
		getArticle (value);
	}
}
// Displays Article
function displayArticle(text)
{
	var div = document.createElement ('div');	
	var h1 = '<h1 class="title-article">'+decodeURIComponent(value).replace(/_/g, " ")+'</h1>';
	div.innerHTML = h1 + text;
	titleEvent.set(decodeURIComponent(value).replace(/_/g, " "))
	var links = div.getElementsByTagName('a');
	for (var i=0; i<links.length; i++)
	{
		for (var j=0; j<links[i].attributes.length; j++)
		{
			if (links[i].attributes[j].nodeName == 'href')
			{
				if (links[i].attributes.href.nodeValue.indexOf('http://') != -1)
				{
					links[i].setAttribute ('target', '_blank');
				}
				else if (links[i].attributes.href.nodeValue.indexOf('/wiki/')!=-1)
				{
					var link = links[i].attributes.href.nodeValue.split ('/wiki/');
					links[i].removeAttribute ('href');
					links[i].setAttribute ('onClick', 'goArticle("'+decodeURIComponent(link[1])+'");');
				}
				else if (links[i].attributes.href.nodeValue.indexOf('/w/')!=-1)
				{
					var params = links[i].attributes.href.nodeValue.split('?');
					params = params[1].split ('&');
					for (var k=0;k<params.length;k++)
					{
						var param = params[k].split('=')[0];
						if (param == 'title')
						{
							var paramvalue = params[k].split('=')[1];
							links[i].removeAttribute('href');
							links[i].setAttribute ('onClick', 'goArticle("'+decodeURIComponent(paramvalue)+'");');
						}
					}
				}

			}
		}
		
	}
	var images = document.getElementsByTagName ('img');
	for (var i=0; i<images.length; i++)
	{
		for (var j=0; j<images[i].attributes.length;j++)
		{
			if (images[i].attributes[j].nodeName == 'src')
			{
				var src = images[i].attributes[j].nodeValue;
				if (src.indexOf ('http://') == -1)
					images[i].setAttribute ('src', (urlhostWiki+src));
				images[i].setAttribute ('onclick', 'setImageEvent("'+images[i].attributes[j].nodeValue+'")');
			}
			
		}
	}
	var tab1 = panelArticle.createTab ({
		"name":decodeURIComponent(value).replace(/_/g, " "),
		closeable:true
	});
	tab1.appendChild (div);
	panelArticle.goToTab(tab1.getId());
	removeLoadingImage();
}
function setImageEvent (url)
{
	imageEvent.set(url);
}
/****************************************************************************************/
/****************************************************************************************/
/***************************   FUNCIONES MISCENALEAS ************************************/
/****************************************************************************************/
/****************************************************************************************/
function addTitle (word) {
	var maxSize = 15;
	if (word.length > maxSize) {
		word = word.substring(0, maxSize-4) + "...";
	}
	return word;
}
function addLoadingImage() {
	removeLoadingImage();
	var body = document.getElementsByTagName("body")[0];
	var background = document.createElement('div');
	background.id = "loading_background";
	// cancels the call to startdrag function
	background.addEventListener("click",function(e){
		e = e ? e : window.event;
		if (e.stopPropagation) {
			e.stopPropagation();
		} else {
			e.cancelBubble = true;
		}
		return false;
		}, false);
	body.appendChild(background);
	var image = document.createElement('img');
	image.id = "loading_image";
	image.setAttribute('src', urlimage+'ajax-loader.gif');
	background.appendChild(image);
}

function removeLoadingImage() {
	var body = document.getElementsByTagName("body")[0];
	var background = document.getElementById("loading_background");
	if (background != null)
		body.removeChild(background);
}
/*
 * Muestra una ventana de error
 */
function displayError (error)
{
	alert ('HTTP Error: ' + error.code + error.description);
	removeLoadingImage();
}
/*
 * Lanza el envento indicado cuando se pulsa ENTER
 */
function onReturn(event_, handler_){
	if (!event_) 
	    event_ = window.event;
	if (event_ && event_.keyCode && event_.keyCode == 13) 
	    handler_();
}
function ucFirst (word)
{
	return word.substr(0,1).toUpperCase()+word.substr(1,word.length);
}
