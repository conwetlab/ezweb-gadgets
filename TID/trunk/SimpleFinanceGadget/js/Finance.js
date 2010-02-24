// EzWeb context variables
width = EzWebAPI.createRGadgetVariable("width", repaint);
height = EzWebAPI.createRGadgetVariable("height", repaint);
lockStatus = EzWebAPI.createRGadgetVariable("lockStatus", setLock);
user = EzWebAPI.createRGadgetVariable("lockStatus", setUser);
timer = EzWebAPI.createRGadgetVariable("time", setTimer);
theme = EzWebAPI.createRGadgetVariable("theme", setTheme);
preferences = EzWebAPI.createRWGadgetVariable("preferences");

// EzWeb Events and Slots 
querySlot = EzWebAPI.createRGadgetVariable("querySlot", query);
symbolEvent = EzWebAPI.createRWGadgetVariable("symbolEvent");
companyEvent = EzWebAPI.createRWGadgetVariable("companyEvent");
valueEvent = EzWebAPI.createRWGadgetVariable("valueEvent");
timeEvent = EzWebAPI.createRWGadgetVariable("timeEvent");
dateEvent = EzWebAPI.createRWGadgetVariable("dateEvent");
dataEvent = EzWebAPI.createRWGadgetVariable("dataEvent");
dataValueEvent = EzWebAPI.createRWGadgetVariable("dataValueEvent");
queryEvent = EzWebAPI.createRWGadgetVariable("queryEvent");
chart = EzWebAPI.createRWGadgetVariable("chart");

/*******************************************************************************
* HANDLER FUNCTIONS CONTEXT VARIBLES AND SLOTS
*******************************************************************************/
function repaint(value){
  Finance.repaint();
  return;
}

function setLanguage(value){
  return;
}

function setLanguage(value){
  return;
}

function setLock(value){
  return;
}

function setUser(value){
  return;
}

function setTimer(value){
  if (timer.get() > 0) 
    Finance.initTimer();
}

function setTheme(value){
  Finance.setTheme();  
}

function query(value){
  // [Symbol, QuerySymbol]
  // For more information about Query Symbols: http://www.gummy-stuff.org/Yahoo-data.htm
  var elements = querySlot.get().evalJSON();
  if (elements.length == 2){
    Finance.setQuery(elements[0], elements[1]);
    Finance.getInfo();}
  return;
}

/*******************************************************************************
* FINANCE CLASS
*******************************************************************************/
var Finance = function() {
	/* Call to the parent constructor */
	EzWebGadget.call(this, {translatable: false});
}

Finance.prototype = new EzWebGadget();

/*******************************************************************************
* INITIAL FUNCTION
*******************************************************************************/
Finance.prototype.init = function(){
  // Yahoo api
  this.yahoo_api = "http://es.old.finance.yahoo.com/d/quotes.csv";
  this.yahoo_api_chart = "http://es.ichart.yahoo.com/z";
  
  // Initial Attributes
  // - Name
  // - Last Trade Date
  // - Last Trade Time  
  this.attributes = {"n"  : null,
                     "d1" : null,
                     "t1" : null,
                     "c"  : null,
                     "query":null};

  // Alert window
  this.alert_window = null;
                      
  // Header
  this.header = document.createElement("div");
  EzWebExt.appendClassName(this.header, "header-gadget");
  document.body.appendChild(this.header);

  var table = document.createElement("table");
  var tbody = document.createElement("tbody");
  table.appendChild(tbody);
  
  var tr = tbody.insertRow(-1);
  var td = tr.insertCell(-1);
  EzWebExt.appendClassName(td,"label");
  td.appendChild(document.createTextNode(_("s")));

  // Input TextBox Company Symbol  
  td = tr.insertCell(-1);
  EzWebExt.appendClassName(td, "form");
  var input = document.createElement("input");
  input.setAttribute("type", "text");
  input.onkeyup = EzWebExt.bind(function(){this.checkSave();}, this);
  input.setAttribute("default", "TEF.MC");
  td.appendChild(input);
  this.company = input;
  
  // Select Attributes
  var select = document.createElement("select");  
  td.appendChild(select);
  symbols = ["a2", "b", "c1","d", "e", "g", "h", 
             "j", "k", "l1", "m3", "m4", "o", "p2", "r", "s1", "v", "y"];
  for(var i=0; i < symbols.length; i++){
    var option = document.createElement("option");
    option.setAttribute("value", symbols[i]);
    var node = document.createTextNode(_(symbols[i]));
    option.appendChild(node);
    select.appendChild(option);
  }
  this.query = select;
  this.header.appendChild(table);

  // Header Icons
  td = tr.insertCell(-1);
  EzWebExt.appendClassName(td, "icons");

  var image = document.createElement("img");
  image.id = "save";
  image.src = this.getResourceURL("images/coins-icon-disabled.png");
  image.onclick = EzWebExt.bind(function(){this.savePreferences();this.getInfo();}, this);
  image.setAttribute("title", _("save"));  
  td.appendChild(image);

  var image = document.createElement("img");
  image.src = this.getResourceURL("images/info.png");
  image.onclick = EzWebExt.bind(function(){this.getSymbols();}, this);
  image.setAttribute("title", _("help"));  
  td.appendChild(image);

  var image = document.createElement("img");
  image.src = this.getResourceURL("images/close_details.png");
  image.onclick = EzWebExt.bind(function(){this.hiddenHeader();}, this);
  image.setAttribute("title", _("hidden"));
  td.appendChild(image);
  
  // Div Content
  this.content = document.createElement("div");
  EzWebExt.appendClassName(this.content, "content-gadget");
  document.body.appendChild(this.content);

  this.setTheme();  
  this.restorePreferences();  
  this.checkSave();
  this.getInfo();
  this.initTimer();
}

/*******************************************************************************
* CREATE A TIMER TO UPDATE COMPANY INFORMATION
*******************************************************************************/
Finance.prototype.initTimer = function(){
  if (this.timer)
    try{
      clearInterval(this.timer);
    }
    catch(e){
    }
  if (timer.get() > 0)
    this.timer = setInterval("Finance.getInfo();",timer.get()*60*1000);
}

/*******************************************************************************
* CHECK IF SAVE BUTTON SHOULD BE DISABLED
*******************************************************************************/
Finance.prototype.checkSave = function(){
  var image = "coins-icon" + ((this.company.value != "")?".png":"-disabled.png");
  document.getElementById("save").src = this.getResourceURL("images/" + image);
}

/*******************************************************************************
* SET QUERY
*******************************************************************************/
Finance.prototype.setQuery = function(company, query){
    this.attributes['query'] = [this.company.value, this.query.value];
    // Save preferences???  TODO
    // preferences.set(this.attributes['query'].toJSON());
}

/*******************************************************************************
* SAVE THE PREFERENCES
*******************************************************************************/
Finance.prototype.savePreferences = function(){
  if (this.company.value != ""){
    this.attributes['query'] = [this.company.value, this.query.value];
    preferences.set(this.attributes['query'].toJSON());
    this.hiddenHeader();    
  }
}

/*******************************************************************************
* RESTORE THE PREFERENCES
*******************************************************************************/
Finance.prototype.restorePreferences = function(){
  // Restore preferences
  if (preferences.get() != ""){
    this.attributes['query'] = preferences.get().evalJSON();
    this.company.value = this.attributes['query'][0];
    this.query.value = this.attributes['query'][1];
    this.hiddenHeader();    
  }
}

/*******************************************************************************
* REQUEST INFO FINANCE
*******************************************************************************/
Finance.prototype.getInfo = function(){
  if (this.attributes['query']){
    var url = this.yahoo_api + "?s=" + encodeURIComponent(this.attributes['query'][0]);    
    url += '&f=nd1t1' + this.attributes['query'][1];
    url += '&e=.csv';
    this.sendGet(url, this.parserInfo, this.onError, this.onException);}
  else
    this.displayInfo();
  return;
}

/*******************************************************************************
* PARSER RESULTS RESPONSE
*******************************************************************************/
Finance.prototype.parserInfo = function(response){
  var text = response.responseText;
  var elements = text.split(";");
  this.attributes["n"] = elements[0];
  this.attributes["d1"] = elements[1];
  this.attributes["t1"] = elements[2];
  this.attributes["query"][2]=elements[3];
  this.displayInfo();
  return;
}

/*******************************************************************************
* HANDLER ONERROR
*******************************************************************************/
Finance.prototype.onError = function(response){
  this.hiddenHeader();
  var span = document.createElement("span");
  EzWebExt.appendClassName(span, "query-error");
  span.appendChild(document.createTextNode(_("errorQuery")));
  this.removeAlertWindow();
  this.alert_window = new StyledElements.StyledAlert("Error", span, {"type":2});
  this.alert_window.insertInto(document.body);
  this.alert_window.repaint();
  this.displayInfo();  
  return;
}

/*******************************************************************************
* HANDLER ONEXCEPTION
*******************************************************************************/
Finance.prototype.onException = function(value){
  this.hiddenHeader();
  var span = document.createElement("span");
  EzWebExt.appendClassName(span, "query-error");
  span.appendChild(document.createTextNode(_("errorQuery")));
  this.removeAlertWindow();
  this.alert_window = new StyledElements.StyledAlert("Error", span, {"type":2});
  this.alert_window.insertInto(document.body);
  this.alert_window.repaint();
  this.displayInfo();  
  return;
}

/*******************************************************************************
* SHOW THE COMPANY VALUES IF HAVE CHANGED
*******************************************************************************/
Finance.prototype.displayInfo = function(){
  this.content.innerHTML = "";

  // Header Content
  var header = document.createElement("div");
  EzWebExt.appendClassName(header, "content-header");  
  var table = document.createElement("table");
  var tbody = document.createElement("tbody");  
  table.appendChild(tbody);

  // Name company
  var tr = tbody.insertRow(-1);
  var td = tr.insertCell(-1);
  if(this.attributes['n']){
    var text = this.attributes['n'] + ' (' + this.company.value + ')';
    var node = document.createTextNode(text);
    td.appendChild(node);}
    
  // Open preferences
  td = tr.insertCell(-1);
  EzWebExt.appendClassName(td, "icons");
  var image = document.createElement("img")
  image.src = this.getResourceURL("images/open_details.png");
  image.onclick = EzWebExt.bind(function(){this.hiddenHeader();}, this);
  image.setAttribute("title", _("preferences"));
  td.appendChild(image);
  header.appendChild(table);
  
  // Query value
  var query = document.createElement("div");
  EzWebExt.appendClassName(query, "content-query");
  table = document.createElement("table");
  tbody = document.createElement("tbody");  
  table.appendChild(tbody);

  tr = tbody.insertRow(-1);
  td = tr.insertCell(-1);
  td.id = "query-value";
  EzWebExt.appendClassName(td, "query-value");
  text = (this.attributes["query"])?this.attributes["query"][2]:"";
  node = document.createTextNode(text);
  td.appendChild(node);
  
  // Color in change value
  if (text.search("-") == 0) 
      EzWebExt.appendClassName(td, "negative");      
  if (text.search("\\+") == 0)
      EzWebExt.appendClassName(td, "positive");  
      
  query.appendChild(table);
  
  // Footer Content
  var footer = document.createElement("div");
  EzWebExt.appendClassName(footer, "content-footer");
  table = document.createElement("table");
  tbody = document.createElement("tbody");  
  table.appendChild(tbody);

  tr = tbody.insertRow(-1);
  td = tr.insertCell(-1);
  EzWebExt.appendClassName(td, "time-value");
  text = (this.attributes["d1"])?this.attributes["d1"]+" ":"";
  text += (this.attributes["t1"])?this.attributes["t1"]:"";  
  node = document.createTextNode(text);
  td.appendChild(node);
  footer.appendChild(table)
  
  this.content_header = header;
  this.content_query = query;
  this.content_footer = footer;
  this.content.appendChild(header);
  this.content.appendChild(query);
  this.content.appendChild(footer);
  this.sendEvents();
  this.repaint();
  return;
}

/*******************************************************************************
* DISPLAY VALUES COMPANY
*******************************************************************************/
Finance.prototype.displayHelp = function(){
  return;
}

/*******************************************************************************
* GET COMPANY SYMBOLS
*******************************************************************************/
Finance.prototype.getSymbols = function(){
  url = this.yahoo_api + "?s=" + encodeURIComponent("@^IBEX");    
  url += '&f=sn';
  url += '&e=.csv';
  this.sendGet(url, this.helpInfo, this.onErrorHelp, this.onExceptionHelp);
}

/*******************************************************************************
* HANDLER ERROR HELP
*******************************************************************************/
Finance.prototype.onErrorHelp = function(response){
  this.hiddenHeader();
  var span = document.createElement("span");
  EzWebExt.appendClassName(span, "query-error");
  span.appendChild(document.createTextNode(_("errorHelp")));
  this.removeAlertWindow();
  this.alert_window = new StyledElements.StyledAlert("Error", span, {"type":2});
  this.alert_window.insertInto(document.body);
  this.alert_window.repaint();
  this.displayInfo();  
  return;
}

/*******************************************************************************
* HANDLER EXCEPTION HELP
*******************************************************************************/
Finance.prototype.onExceptionHelp = function(response){
  this.hiddenHeader();
  var span = document.createElement("span");
  EzWebExt.appendClassName(span, "query-error");
  span.appendChild(document.createTextNode(_("errorHelp")));
  this.removeAlertWindow();
  this.alert_window = new StyledElements.StyledAlert("Error", span, {"type":2});
  this.alert_window.insertInto(document.body);
  this.alert_window.repaint();
  this.displayInfo();
  return;
}

/*******************************************************************************
* PARSER COMPANY SYMBOLS AND RETURN HELP INFO
*******************************************************************************/
Finance.prototype.helpInfo = function(response){
  var text = response.responseText;
  var lines = text.split("\n");

  // Table with pairs symbol-company name 
  var table = document.createElement("table");
  EzWebExt.appendClassName(table, "query-symbols");  
  var tbody = document.createElement("tbody");
  table.appendChild(tbody);
  
  // New info window  
  this.removeAlertWindow();
  this.alert_window = new StyledElements.StyledAlert(_("symbols"), table, {"type":0});
  this.alert_window.insertInto(document.body);
  
  // Fill the alert window content
  for (var i=0; i < lines.length; i++){
    var elements = lines[i].split(";");
    if((elements[0] != undefined) && 
        (elements[0] != null) &&
        (elements[1] != undefined) && 
        (elements[1] != null)){
      var tr = tbody.insertRow(-1);
      var td = tr.insertCell(-1);
      EzWebExt.appendClassName(td, "symbol");
      td.appendChild(document.createTextNode(elements[0]));
      td.onclick = EzWebExt.bind(function(){
                                  // Set symbol
                                  this.company.value = this.value;
                                  Finance.checkSave();
                                  Finance.removeAlertWindow();
                                 }, 
                        {"company":this.company, "value":elements[0]});
      var td = tr.insertCell(-1);
      EzWebExt.appendClassName(td, "company");      
      td.appendChild(document.createTextNode(elements[1]));}
  }
  

  
  return;  
}

/*******************************************************************************
* HIDDEN HEADER
*******************************************************************************/
Finance.prototype.removeAlertWindow = function(){
  if (this.alert_window && this.alert_window.wrapperElement){
    document.body.removeChild(this.alert_window.wrapperElement);
    this.alert_window =  null;}
}

/*******************************************************************************
* HIDDEN HEADER
*******************************************************************************/
Finance.prototype.hiddenHeader = function(){
  this.header.style.display = (this.header.style.display != "none")?"none":"";
  if (this.attributes['query']){
    this.company.value = this.attributes['query'][0];
    this.query.value = this.attributes['query'][1];
  }
  this.checkSave();
  this.repaint();
  return;
}

/*******************************************************************************
* SET COLOR GADGET
*******************************************************************************/
Finance.prototype.setTheme = function(){
  var link = document.getElementById("theme");
  link.setAttribute("href", "css/" + theme.get() + ".css");
  return;
}

/*******************************************************************************
* REPAINT GADGET
*******************************************************************************/
Finance.prototype.repaint = function(){

  // If there is alert_window it is repainted
  if (this.alert_window && this.alert_window.wrapperElement){
    this.alert_window.repaint();
  }

  // Set minwidth header and content
  var width = (document.body.offsetWidth > 165)?"auto":"150px";
  width = ((this.header.style.display != "none") && (document.body.offsetWidth <= 270))?"270px":width;
  this.header.style.width = width;
  this.content.style.width = width;
  
  // Set min height content
  this.content.style.height = (document.body.offsetHeight > 130)?"auto":"110px";
  
  // Resize content query div
  if ((this.content_header) && (this.content_header.offsetHeight > 0) && 
    (this.content_footer.offsetHeight > 0)){
    this.content_query.style.top = this.content_header.offsetHeight + 'px';
    this.content_query.style.bottom = this.content_footer.offsetHeight + 'px';
    var height = this.content.offsetHeight - this.content_header.offsetHeight - 
                                      this.content_footer.offsetHeight + "px";
    this.content_query.style.height = (height < 0)?0:height;
    
    // Resize fonts
    var size = this.content_query.offsetHeight - 10;
    document.getElementById("query-value").style.fontSize = size + 'px';
    var table = this.content_query.firstChild;
    while(table.offsetWidth > this.content_query.offsetWidth){
      size-=5;
      document.getElementById("query-value").style.fontSize = size + 'px';    
    }
  }

}

/*******************************************************************************
* GET CHART URL
*******************************************************************************/
Finance.prototype.getChartURL = function(){
  return (this.yahoo_api_chart + "?s=" + this.attributes['query'][0]);
}

/*******************************************************************************
* SEND EVENTS
*******************************************************************************/
Finance.prototype.sendEvents = function(){
  if (this.attributes.n && this.attributes.t1 && this.attributes.d1 &&
    this.attributes.query && (this.attributes.query.length == 3)){
    symbolEvent.set(this.attributes['query'][0]);
    companyEvent.set(this.attributes["n"]);
    valueEvent.set(this.attributes['query'][2]);
    timeEvent.set(this.attributes["t1"]);
    dateEvent.set(this.attributes["d1"]);  
    dataEvent.set(this.attributes['query'][1]);  
    dataValueEvent.set(_(this.attributes['query'][1]));
    queryEvent.set(this.attributes['query'].toJSON());
    chart.set(this.getChartURL());
    }
  return;
}

/*******************************************************************************
CREATE NEW OBJECT FINANCE CLASS
*******************************************************************************/
Finance = new Finance();
