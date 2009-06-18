/*************************************************************************/
/*	Definicion de las variables de XML - Preferencias y Wirings	 */
/*	Definicion de variables globales				 */
/*	Definicion de los manejadores de las funciones			 */
/*************************************************************************/
var BuscadorRAE = function() {
    /* Call to the parent constructor */
    EzWebGadget.call(this, {translatable: "true"});
}
/* Variables Globales */

BuscadorRAE.prototype = new EzWebGadget(); /* Extend from EzWebGadget */

BuscadorRAE.prototype.resourcesURL = "http://demo.ezweb.morfeo-project.org/repository/BuscadorRAE/"; 

BuscadorRAE.prototype.init = function() {
	this.value = '';
	this.dictionary = new StyledElements.StyledNotebook({'id':'dictionary'});
	this.listoftabs = [];
	this.urlimage = 'http://demo.ezweb.morfeo-project.org/repository/BuscadorRAE/images/';

	this.definition = EzWebAPI.createRWGadgetVariable('definition');
	this.keywordEvent = EzWebAPI.createRWGadgetVariable('keywordEvent');
	this.keyword = EzWebAPI.createRGadgetVariable ('keyword', EzWebExt.bind(this.setKeyword,this));

	
	var header = document.createElement ('div');
	header.setAttribute ('id', 'header');
	var div1 = document.createElement ('div');
	div1.setAttribute ('class', 'text');
	var input = document.createElement ('input');
	input.setAttribute ('id', 'text_search');
	input.setAttribute ('class', 'text_field');
	input.setAttribute ('type', 'text');
	input.setAttribute ('autocomplete', 'on');
	input.setAttribute ('size', 8);

	input.addEventListener('keypress', EzWebExt.bind (function (e){
		if (e.keyCode == 13)
			this.goSearchInputText();
	}, this), false);
	div1.appendChild (input);
	var div2 = document.createElement ('div');
	div2.setAttribute ('class', 'boton');
	var select = document.createElement ('select');
	select.setAttribute ('id','TIPO_BUS'); 
	select.setAttribute ('name', 'TIPO_BUS');
	select.setAttribute ('style', 'font-size:11px');
	var option3 = document.createElement ('option');
	option3.setAttribute ('id', 'option3');
	option3.setAttribute ('value', '3');
	option3.setAttribute ('selected', 'selected');
	option3.appendChild (document.createTextNode(this.getTranslatedLabel('option3')));
	var option0 = document.createElement ('option');
	option0.setAttribute ('id', 'option0');
	option0.setAttribute ('value', '0');
	option0.appendChild (document.createTextNode(this.getTranslatedLabel('option0')));
	var option1 = document.createElement ('option');
	option1.setAttribute ('id', 'option1');
	option1.setAttribute ('value', '1');
	option1.appendChild (document.createTextNode(this.getTranslatedLabel('option1')));
	var option2 = document.createElement ('option');
	option2.setAttribute ('id', 'option2');
	option2.setAttribute ('value', '2');
	option2.appendChild (document.createTextNode(this.getTranslatedLabel('option2')));
	select.appendChild (option3);
	select.appendChild (option0);
	select.appendChild (option1);
	select.appendChild (option2);
	var button = document.createElement('button');
	button.setAttribute ('id', 'search-button');
	button.setAttribute ('title', 'Search');
	button.addEventListener ('click', EzWebExt.bind (function (e){
		this.goSearchInputText();
	}, this), false);
	button.appendChild (document.createTextNode(this.getTranslatedLabel('search-button')));
	div2.appendChild (select);
	div2.appendChild (button);
	header.appendChild (div1);
	header.appendChild (div2);
	var content = document.createElement('div');
	content.setAttribute ('id', 'content');
	document.body.appendChild (header);
	document.body.appendChild (content);

	this.dictionary.insertInto(document.getElementById('content'));
}

BuscadorRAE.prototype.repaint = function () {
	this.dictionary.repaint()
}

BuscadorRAE.prototype.goSearchInputText = function () {
	this.value = document.getElementById('text_search').value;
	this.goSearch();
}

/************************************************************************/
/*	Funciones para auxiliares					 						*/
/************************************************************************/
BuscadorRAE.prototype.addLoadingImage = function () {
	this.removeLoadingImage();
	var body = document.getElementsByTagName("body")[0];
	var background = document.createElement('div');
	background.id = "loading_background";
	// cancels the call to startdrag function
	body.appendChild(background);
	var image = document.createElement('img');
	image.id = "loading_image";
	image.setAttribute('src', this.urlimage+'ajax-loader.gif');
	background.appendChild(image);
}

BuscadorRAE.prototype.removeLoadingImage = function () {
	var body = document.getElementsByTagName("body")[0];
	var background = document.getElementById("loading_background");
	if (background != null)
		body.removeChild(background);
}
BuscadorRAE.prototype.addTitle = function (word) {
	var maxSize = 15;
	if (word.length > maxSize) {
		word = word.substring(0, maxSize-4) + "...";
	}
	return word;
}

/*************************************************************************/
/*	Funciones para cubrir la funcionalidad del gadget		 */
/*************************************************************************/
BuscadorRAE.prototype.goSearch = function ()
{
	var selected = document.getElementById ('TIPO_BUS').value;
	this.getSearch (this.value, selected);
}
BuscadorRAE.prototype.displaySearch  = function (response)
{
	for (var i=0; i<this.listoftabs.length;i++) {
		if (this.listoftabs[i] === undefined)
		{}
		else if (this.listoftabs[i].title == this.value) // Exists a tab with this key
		{
			this.dictionary.goToTab(this.listoftabs[i].id);
			this.removeLoadingImage();
			return;
		}
	} 
	var tab1 = this.dictionary.createTab ({'name':this.addTitle(this.value), 'id':this.value});
	tab1.appendChild (response);
	this.parseContent (tab1);
	this.dictionary.goToTab(tab1.getId());
	this.listoftabs [this.listoftabs.length] = ({title:this.value, id:tab1.getId()});
	this.removeLoadingImage();
}

BuscadorRAE.prototype.onReturn = function (event_, handler_){
	if (!event_) 
	    event_ = window.event;
	if (event_ && event_.keyCode && event_.keyCode == 13) 
	    handler_();
}

/* Definicion de funciones para las variables del XML */
BuscadorRAE.prototype.setKeyword = function ()
{
	BuscadorRAE.value = this.keyword.get();
	BuscadorRAE.goSearch();
}
/****************************************************************************************/
/****************************************************************************************/
/*******************   GET AND DISPLAY A SEARCH INTO RAE DICTIONARY *********************/
/****************************************************************************************/
/****************************************************************************************/
BuscadorRAE.prototype.getSearch = function (word, bus)
{
    this.value = word;
	this.keywordEvent.set(this.value);
    var value2 = encodeURIComponent(word.toLowerCase());
    if (value2 == '')
	return;
	this.addLoadingImage();
    var urlRequest = "http://buscon.rae.es/draeI/SrvltGUIBusUsual?" + "TIPO_BUS=" + 
	encodeURIComponent(bus) + "&LEMA=" + value2;
	this.sendGet(
		urlRequest,
		this.onSuccessSearch,
		this.onError,
		this.onException
	)
    //EzWebAPI.send_get(urlRequest, this, BuscadorRAE.onSuccessSearch, BuscadorRAE.onError);
}


BuscadorRAE.prototype.onSuccessSearch = function (response) {
    var html = response.responseText;
    var parent = document.createElement("div");
    var start = html.indexOf("<div>");
    var end = html.indexOf("</div>");

    // GET CONTENT DIVs
    while(start >= 0)
	{
	    var div = document.createElement("div");
	    div.innerHTML = html.substring(start+5, end);
	    parent.appendChild(div);
	    html = html.split(html.substring(start+5, end+6))[1];
	    start = html.indexOf("<div>");
	    end = html.indexOf("</div>");
	}
        
    // GET P AND UL 
    if (parent.innerHTML == "")
	{
	    var div = document.createElement("div");
	    var start = html.indexOf("<p");
	    var end = html.indexOf("</p>");

	    if (start >= 0)
		{
		    div.innerHTML = html.substring(start, end+4);
		    var span = div.getElementsByTagName("span");
		    if (span.length != 0)  
			span[0].removeAttribute("style");

		    var p = div.getElementsByTagName("p");
		    if (p.length != 0)
			p[0].removeAttribute("style");
		}
		
	    var start = html.indexOf("<ul");
	    var end = html.indexOf("</ul>");
	    
	    if (start >= 0)
		div.innerHTML = div.innerHTML+html.substring(start, end+5);
	    
	    if (div.innerHTML != "")
			parent.appendChild(div);   
	}
    else
		this.definition.set(parent.innerHTML);
	
	var context = {key:this.value, def:parent.innerHTML, definition:this.definition, keyword:this.keywordEvent}
	var img1 = document.createElement('img');
	img1.setAttribute ('class', 'sendevents');
	img1.setAttribute ('title', this.getTranslatedLabel('send-event'));
	img1.setAttribute ('src', '/ezweb/images/wiring16px.png'); 
	img1.addEventListener('click', EzWebExt.bind(function(e){
		this.definition.set(this.def);
		this.keyword.set(this.key);
	}, context), true);
	parent.appendChild (img1);
	this.displaySearch(parent);
}


BuscadorRAE.prototype.onError = function (response)
{
    this.removeLoadingImage();
}
BuscadorRAE.prototype.onException = function (response)
{
    this.removeLoadingImage();
}

BuscadorRAE.prototype.parseContent = function (tab)
{
    var links = tab.wrapperElement.getElementsByTagName("a");
    for(var i=0; i < links.length; i++)
	{
	    if ((links[i].href != "") && (links[i].href.search("IDLEMA") >= 0))
		{
		    EzWebExt.removeFromParent(links[i]);
		    i-=1;
		}
	    else if ((links[i].href != "") && (links[i].href.search("LEMA") >= 0))
		{
		    var parameters = links[i].href.split("?")[1];
		    parameters = parameters.split("&");
		    
		    for (var j=0; j < parameters.length; j++)
			{
			    if (parameters[j].search("LEMA") >= 0)
				var word = parameters[j].split("=")[1];
			}
		    links[i].removeAttribute("href");
			context = {value:decodeURIComponent(word), self:this};
		    links[i].addEventListener ('click', EzWebExt.bind (function(e){
				this.self.getSearch(this.value,0);
			}, context), false);
		    links[i].setAttribute("class", "link");
		}
	    else if ((links[i].href != "") && (links[i].href.search("IDVERBO") >= 0))
		{
		    EzWebExt.removeFromParent(links[i]);
		    i-=1;
		}
	}
	context = {id:tab.getId(), listoftabs:this.listoftabs};
	tab.addEventListener ('close', EzWebExt.bind(function(e){
		for (var i=0;i<this.listoftabs.length;i++) {
			if (this.listoftabs[i].id == this.id) {
				delete this.listoftabs[i];
				return;
			}
		}
	}, context), true);
}
BuscadorRAE.prototype.deleteElement = function (id)
{

}
/* Instanciate the Gadget class */
BuscadorRAE = new BuscadorRAE();

