/*************************************************************************/
/*	Definicion de las variables de XML - Preferencias y Wirings	 */
/*	Definicion de variables globales				 */
/*	Definicion de los manejadores de las funciones			 */
/*************************************************************************/
var definition = EzWebAPI.createRWGadgetVariable('definition');
var keywordEvent = EzWebAPI.createRWGadgetVariable('keywordEvent');
var keyword = EzWebAPI.createRGadgetVariable ('keyword', setKeyword);
var urlimage = 'http://demo.ezweb.morfeo-project.org/repository/BuscadorRAE/images/';
/* Variables Globales */
var value = '';
var dictionary = new StyledElements.StyledNotebook({'id':'dictionary'});


var BuscadorRAE = function() {
    /* Call to the parent constructor */
    EzWebGadget.call(this, {translatable: "true"});
}
BuscadorRAE.prototype = new EzWebGadget(); /* Extend from EzWebGadget */

BuscadorRAE.prototype.resourcesURL = "http://demo.ezweb.morfeo-project.org/repository/BuscadorRAE"; 

BuscadorRAE.prototype.init = function() {
	var header = document.createElement ('div');
	header.setAttribute ('id', 'header');
	var div1 = document.createElement ('div');
	div1.setAttribute ('class', 'text');
	var input = document.createElement ('input');
	input.setAttribute ('id', 'text_search');
	input.setAttribute ('class', 'text_field');
	input.setAttribute ('type', 'text');
	input.setAttribute ('autocomplete', 'on');
	input.setAttribute ('onkeypress', "onReturn (event, goSearchInputText);");
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
	button.setAttribute ('onclick', 'goSearchInputText();');
	button.appendChild (document.createTextNode(this.getTranslatedLabel('search-button')));
	div2.appendChild (select);
	div2.appendChild (button);
	header.appendChild (div1);
	header.appendChild (div2);
	var content = document.createElement('div');
	content.setAttribute ('id', 'content');
	document.body.appendChild (header);
	document.body.appendChild (content);
	dictionary.insertInto(document.getElementById('content'));
}

/* Instanciate the Gadget class */
BuscadorRAE = new BuscadorRAE();

BuscadorRAE.prototype.repaint = function () {
	dicitionary.repaint()
}

/* Definicion de funciones para las variables del XML */
function setKeyword ()
{
	value = keyword.get();
	goSearch();
}
function goSearchInputText()
{
	value = document.getElementById('text_search').value;
	goSearch();
}
function onReturn ()
{}
/*************************************************************************/
/*	Funciones para auxiliares					 */
/*************************************************************************/
function onReturn(event_, handler_){
	if (!event_) 
	    event_ = window.event;
	if (event_ && event_.keyCode && event_.keyCode == 13) 
	    handler_();
}

function addLoadingImage() {
	removeLoadingImage();
	var body = document.getElementsByTagName("body")[0];
	var background = document.createElement('div');
	background.id = "loading_background";
	// cancels the call to startdrag function
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
function addTitle (word) {
	var maxSize = 15;
	if (word.length > maxSize) {
		word = word.substring(0, maxSize-4) + "...";
	}
	return word;
}
/*************************************************************************/
/*	Funciones para cubrir la funcionalidad del gadget		 */
/*************************************************************************/
function goSearch()
{
	var selected = document.getElementById ('TIPO_BUS').value;
	getSearch (value, selected);
}
function displaySearch(response)
 {
	var tab1 = dictionary.createTab ({'name':addTitle(value)});
	definition.set(response.innerHTML);
	tab1.appendChild (response);
	parseContent (tab1);
	dictionary.goToTab(tab1.getId());
	removeLoadingImage();
}

