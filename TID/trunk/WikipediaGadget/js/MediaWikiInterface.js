// Preferences and wiring variables
var howmanyresults = EzWebAPI.createRGadgetVariable ("howmanyresults", setHowMany);
var savelastsearch = EzWebAPI.createRGadgetVariable ("savelastsearch", function(){});
var gotokey = EzWebAPI.createRGadgetVariable ("gotokey", goArticle);
var wikipediaApi = EzWebAPI.createRGadgetVariable ("apilanguage", setLanguageWiki);
var keyword = EzWebAPI.createRGadgetVariable ("keyword", goSearch);
var summary = EzWebAPI.createRWGadgetVariable ("summary");
var url = EzWebAPI.createRWGadgetVariable ("url");
var titleEvent = EzWebAPI.createRWGadgetVariable("title");
var imageEvent = EzWebAPI.createRWGadgetVariable("image");
var listoftabs = [];

//Properties

var keywordSearch = EzWebAPI.createRWGadgetVariable("keywordSearch");
var gotokeySearch = EzWebAPI.createRWGadgetVariable("gotokeySearch");
// Url for Api, wiki, and images
var urlbaseApi = '';
var urlbaseWiki = '';
var urlhostWiki = '';

// nresutls = numero de resultados en cada busqueda
var nresults = 12;

// Element for use of tabs
var panelArticle = new StyledElements.StyledNotebook ({'id':'panelArticle'})

var WikipediaGadget = function () {
	EzWebGadget.call (this, {translatable:false});
}
WikipediaGadget.prototype = new EzWebGadget();

// Funcion de inicio
WikipediaGadget.prototype.init = function() {

    var header = document.createElement ('div');
	header.setAttribute ('id', 'header');

    var div0 = document.createElement ('div');
	EzWebExt.addClassName(div0, 'boton');
	var button0 = document.createElement('button');
	button0.setAttribute ('id', 'home-button');
	button0.setAttribute ('title', _('Main Page'));
	EzWebExt.addEventListener (button0, 'click', function(e){
		goArticle('Main_Page');
	}, false);
	div0.appendChild (button0);
	
	var div1 = document.createElement ('div');
	EzWebExt.addClassName(div1, 'text');
	var input = document.createElement ('input');
	input.setAttribute ('id', 'text_search');
	EzWebExt.addClassName(input, 'text_field');
	input.setAttribute ('type', 'text');
	input.setAttribute ('autocomplete', 'on');
	input.setAttribute ('size', 8);
	EzWebExt.addEventListener(input, 'keypress', function(e){
		if (e.keyCode == 13)
			goArticle(e.target.value);
	}, false);
	div1.appendChild (input);
	
	var div2 = document.createElement ('div');
	EzWebExt.addClassName(div2, 'boton');
	var button1 = document.createElement('button');
	button1.setAttribute ('id', 'go-button');
	button1.setAttribute ('title', _('Go'));
	button1.innerHTML = _('Go');
	EzWebExt.addEventListener (button1, 'click', function(e){
		goArticle(input.value);
	}, false);
	var button2 = document.createElement('button');
	button2.setAttribute ('id', 'search-button');
	button2.setAttribute ('title', _('Search'));
	button2.innerHTML = _('Search');
	EzWebExt.addEventListener (button2, 'click', function(e){
		goSearch(input.value);
	}, false);
	div2.appendChild (button1);
	div2.appendChild (button2);

	header.appendChild (div0);
	header.appendChild (div1);
	header.appendChild (div2);
	
	var content = document.createElement('div');
	content.setAttribute ('id', 'content');
	
	document.body.appendChild (header);
	document.body.appendChild (content);

	setDefaultOptions();
	
	// Insertamos las pestanas en el content
	panelArticle.insertInto (document.getElementById('content'));

    var keywordTemp = keywordSearch.get();
	var gotokeyTemp = gotokeySearch.get();
	
    if (savelastsearch.get() == "true") {
        if(keywordTemp && (keywordTemp != "")) { 
	        goSearch(keywordTemp);
	    }
	    else if(gotokeyTemp && (gotokeyTemp != "")) { 
	        goArticle(gotokeyTemp);
	    }
	    else {
            goArticle('Main_Page');
	    }
	} else {
	    goArticle('Main_Page');
	}
}

WikipediaGadget.prototype.repaint = function(){
	panelArticle.repaint();
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

function setKeywordSearch(value){
	keywordSearch.set(value);
	gotokeySearch.set("");
}

function setGotokeySearch(value){
	keywordSearch.set("");
	gotokeySearch.set(value);
}

function goSearch(value)
{
	var pagesearch = 0;
	if (value != '')
	{
    	setKeywordSearch(value);
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
		'id':'Search_'+context.value,
		closeable:true
	});

	// Creamos los divs que necesitamos para pintar el resultado
	var div = document.createElement ('div');
	
	// No hay resultados de la busqueda
	if (search.length == 0)
	{	
		var h4 = document.createElement ("h4");
		h4.setAttribute ("id", 'noSearchResult');
		h4.appendChild(document.createTextNode (_('No page text matches')));
		div.appendChild (h4);
	}
 	else if (search.length > 1)
	{
		// headers
		var h3 = document.createElement ("h3");
		h3.appendChild(document.createTextNode (_('Resultados Encontrados')));
		var hr = document.createElement ("hr");
		div.appendChild (h3);
		div.appendChild (hr);
		// tabla con el resultado de la busqueda
		
		var result = document.createElement("div");
		var wordsearch = context.value.split (" ");
		for (var i=0; i <search.length; i++)
		{
			var name = search[i].title;
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
					EzWebExt.addClassName(span, 'remarked');
					span.appendChild(document.createTextNode (wordresult[k]+' '));
					a.appendChild (span);
				}
				else
				{
					a.appendChild (document.createTextNode(wordresult[k]+' '));
				}
			}
			a.setAttribute ('title', search[i].description);
			if (search[i].url != '#') {
			    var tempContext = {name: name};
				EzWebExt.addEventListener(a, 'click', EzWebExt.bind(function() {
				    goArticle(this.name);
			    }, tempContext), true);
			}
			result.appendChild (a);
		}
		div.appendChild (result);
	}
	else // Si solo hay un resultado se muestra el contenido del articulo
	{
		/* Show page details */
		goArticle (search[i]);
		return;
	}
	// Creating the search navigationbar
	var navigationvar = document.createElement ("table");
	var tbody = document.createElement ("tbody");
	navigationvar.appendChild(tbody);
	EzWebExt.addClassName(navigationvar, "navigationbar");
	var tr = document.createElement ("tr");
	// Boton de anterior
	var td1 = document.createElement ("td");
	var a = document.createElement ("a");
	var img = document.createElement ("img");
	if (context.pagesearch == 0)
		img.src = 'images/back_disable.png';
	else
	{ // Si no es la primera pagina, da opcion de volver
		var context = {"value":context.value,"pagesearch":context.pagesearch,"targetTab":tab1, "next":context.next}; 
		EzWebExt.addEventListener(a, 'click', EzWebExt.bind(goBackSearch, context), true);
		a.setAttribute('id', 'search-back-button');
		img.src = 'images/back_enable.png';
	}
	a.appendChild(img);
	td1.appendChild(a);
	tr.appendChild(td1);
	// Celda con el numero de pagina
	var td2 = document.createElement ("td");
	var span = document.createElement ("span");
	EzWebExt.addClassName(span, 'pagesearch');
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
		EzWebExt.addEventListener(a, 'click', EzWebExt.bind(goNextSearch, context), true);
		a.setAttribute('id', 'search-next-button');
		img.src = 'images/front_enable.png';
	}
	else
	{
		img.src = 'images/front_disable.png';
	}
	a.appendChild(img);
	td3.appendChild(a);
	tr.appendChild(td3);
	// Inserto la fila en la tabla y la tabla en el div
	tbody.appendChild (tr);
	var buttons = document.createElement ('div');
	EzWebExt.addClassName(buttons, 'navigation-buttons');
	buttons.appendChild (navigationvar);
	div.appendChild (buttons);

	// Inserto el div en la pestana y voy a ella
	tab1.appendChild (div);
	EzWebExt.addClassName(div.parentNode, "search");
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
function goArticle (value)
{
	if (value != '')
	{
       	setGotokeySearch(value);
		addLoadingImage();
		getArticle(encodeURIComponent(ucFirst(value)));
	}
}

// Displays Articleg
function displayArticle(title, text)
{
	for (var i=0; i<listoftabs.length;i++) {
		if ((listoftabs[i] !== undefined) && (listoftabs[i].title == title)) // Exists a tab with this key
		{
			panelArticle.goToTab(listoftabs[i].id);
			removeLoadingImage();
			return;
		}
	} 

	var div = document.createElement ('div');	
	var h1 = '<h1 class="title-article">'+decodeURIComponent(title).replace(/_/g, " ")+'</h1>';
	div.innerHTML = h1 + text;
	titleEvent.set(decodeURIComponent(title).replace(/_/g, " "))

	// Parche para obtener la URI base, necesario para IE7
	div.innerHTML += "<a href='/' />";
	var baseURI = div.lastChild.getAttribute("href");
	EzWebExt.removeFromParent(div.lastChild)
    
	var links = div.getElementsByTagName('a');
	
	for (var i=0; i<links.length; i++)
	{
		var href = links[i].getAttribute("href");
		if (href != null) 
		{
    		if ((href.indexOf('http://') == 0) && (href.indexOf(baseURI) != 0))
			{
				links[i].setAttribute('target', '_blank');
			}
			else if ((match = href.match("[\\s*" + baseURI + "|\\s*]/*wiki/+(.+)")) != null)
			{
				links[i].removeAttribute('href');
				var context = {href: match[1]};
		        EzWebExt.addEventListener(links[i], 'click', EzWebExt.bind(function() {
		            goArticle(decodeURIComponent(this.href));
		        }, context), true);
			}
			else if ((match = href.match("[\\s*" + baseURI + "|\\s*]/*w/+.*\\?(.+)")) != null)
			{
				var params = match[1].split ('&');
				for (var k=0;k<params.length;k++)
				{
					var param = params[k].split('=')[0];
					if (param == 'title')
					{
						var paramvalue = params[k].split('=')[1];
						links[i].removeAttribute('href');
						var context = {href: paramvalue};
						EzWebExt.addEventListener(links[i], 'click', EzWebExt.bind(function() {
		                    goArticle(decodeURIComponent(this.href));
		                }, context), true);
					}
				}
			}
			else if (links[i].getAttribute("hash") != "") {
                links[i].removeAttribute('href');
                links[i].style.textDecoration = "none";
                links[i].style.color = "black";
                links[i].style.cursor = "auto";
			}
		}
	}
	var tab1 = panelArticle.createTab ({
		"name":decodeURIComponent(title).replace(/_/g, " "),
		"id":title,
		"closeable":true
	});
	tab1.appendChild (div);
	tab1.appendChild (div);
	EzWebExt.addClassName(div.parentNode, "tab-article");

	var context = {id:tab1.getId(), listoftabs:this.listoftabs};
	tab1.addEventListener('close', EzWebExt.bind (function(e){
		for (var i=0;i<this.listoftabs.length;i++)
			if ((this.listoftabs[i] !== undefined)&&(this.listoftabs[i].id == this.id))
				delete this.listoftabs[i];
	}, context));
	panelArticle.goToTab(tab1.getId());
	listoftabs[listoftabs.length] = ({"title":title, "id":tab1.getId()})

	summary.set(div.innerHTML);
	var images = div.getElementsByTagName ('img');
	for (var i=0; i<images.length; i++)
	{
	    var src = images[i].getAttribute('src');
		if (src != null)
		{
			if (src.indexOf('http://') == -1) {
			    src = urlhostWiki+src; // TODO Necesario?
				images[i].setAttribute ('src', src);
		    }
		    var context = {src: src};
			EzWebExt.addEventListener(images[i], 'click', EzWebExt.bind(function() {
			    setImageEvent(this.src);
			}, context), true);
		}
	}
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
	EzWebExt.addEventListener(background, "click", function(e){
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
	image.setAttribute('src', 'images/ajax-loader.gif');
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
	removeLoadingImage();
}

function ucFirst (word)
{
	return word.substr(0,1).toUpperCase()+word.substr(1,word.length);
}
