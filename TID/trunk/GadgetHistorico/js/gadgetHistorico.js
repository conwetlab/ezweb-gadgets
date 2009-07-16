//Slot EzWeb
var inText = EzWebAPI.createRGadgetVariable("inText", function(){pushElement(arrayElems,createNewElement())});

//Property EzWeb
var textProperty = EzWebAPI.createRWGadgetVariable("texts");

var srcImg = "http://demo.ezweb.morfeo-project.org/repository/GadgetHistorico/images/";
var arrayElems = new Array(); 		//Array
var arrayResult = new Array();		//Search Result
var tableSearch = false;

// Element Object
function element (inDate, text){

	this.pubDate 	= inDate;
	this.text	= text;
}

function elementPosition( inDate, text, pos){
	this.pubDate	= inDate;
	this.text	= text;
	this.pos	= pos;
}

function doHighlight(bodyText, searchTerm, highlightStartTag, highlightEndTag) 
{
  // the highlightStartTag and highlightEndTag parameters are optional
  if ((!highlightStartTag) || (!highlightEndTag)) {
    highlightStartTag = "<strong>";
    highlightEndTag = "</strong>";
  }
  
  // find all occurences of the search term in the given text,
  // and add some "highlight" tags to them (we're not using a
  // regular expression search, because we want to filter out
  // matches that occur within HTML tags and script blocks, so
  // we have to do a little extra validation)
  var newText = "";
  var i = -1;
  var lcSearchTerm = searchTerm.toLowerCase();
  var lcBodyText = bodyText.toLowerCase();
    
  while (bodyText.length > 0) {
    i = lcBodyText.indexOf(lcSearchTerm, i+1);
    if (i < 0) {
      newText += bodyText;
      bodyText = "";
    } else {
      // skip anything inside an HTML tag
      if (bodyText.lastIndexOf(">", i) >= bodyText.lastIndexOf("<", i)) {
        // skip anything inside a <script> block
        if (lcBodyText.lastIndexOf("/script>", i) >= lcBodyText.lastIndexOf("<script", i)) {
          newText += bodyText.substring(0, i) + highlightStartTag + bodyText.substr(i, searchTerm.length) + highlightEndTag;
          bodyText = bodyText.substr(i + searchTerm.length);
          lcBodyText = bodyText.toLowerCase();
          i = -1;
        }
      }
    }
  }
  
  return newText;
}


function searchTextArray(a, text){
	var result = new Array();
	
	var keySearch = text.toLowerCase();

	for (var i=0; i<a.length; i++){

		var arrayText = a[i].text.toLowerCase();

		if(arrayText.indexOf(new String(keySearch)) != -1){		//found

			result.push(new elementPosition(a[i].pubDate,doHighlight(a[i].text, text) , i));
		}
	}
	return result;
}
			

function elementJson(inDate,text){
	this.pubDate	= inDate;
	this.text	= text;
}

function compareElement(obj1,obj2){

	if (obj1.pubDate < obj2.pubDate){
		return obj1;
	}
	else{
		return obj2;
	}
}

function sortArray(a){
	a.sort(compareElement);
}

function delElement(pos, a){

	a.splice(pos,1);

	textProperty.set(toJSON(fromArray(a)));	//Save Json

}

function delAll(a){
	arrayElems = new Array();
	createTable(arrayElems);
	
	textProperty.set(toJSON(fromArray(arrayElems)));    //Save Json

}

function delSelected(a){

	for (var i=a.length-1; i>=0; i--){
		delElement((a[i].pos),arrayElems);
	}

	arrayResult = new Array();
	a = new Array();	
	createTableSearch(arrayResult);

        textProperty.set(toJSON(fromArray(arrayElems)));    //Save Json
	
}

function createNewElement(){
	return new element(new Date(), inText.get());
}

function pushElement(a, elem){
		
	a.push(elem);
	sortArray(a);

	textProperty.set(toJSON(fromArray(a)));    //Save Json
	
	if (!tableSearch){
		createTable(a);			//Repaint Table
	}
	
}

function toJSON(object) {
	return JSON.stringify(object, function (key, value) {
	    return value;
	});
}

function fromJSON(json) {
	
	return eval("(" + json + ")");
}

function getTime(obj){
	return obj.pubDate.toLocaleTimeString();
}

function getDate(obj){
	return obj.pubDate.toLocaleDateString();
}

function toArray(a){
	var result = new Array();	
	for (var i=0; i< a.length; i++){
		result[i] = new element(new Date(Date.parse(a[i].pubDate)),a[i].text);
	}
	return result;
}

function fromArray(a){
	var result = new Array();
	for (var i=0; i< a.length; i++){
		
		result[i] = new elementJson(a[i].pubDate.toUTCString(), a[i].text);
	}
	return result;
}

function init(){

	if (textProperty.get() != ""){
		arrayElems = toArray(fromJSON(textProperty.get()));
		
	}
	createGadget(arrayElems);
}

