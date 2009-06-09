/*************************************************************************/
/*	Definicion de las variables de XML - Preferencias y Wirings	 */
/*	Definicion de variables globales				 */
/*	Definicion de los manejadores de las funciones			 */
/*************************************************************************/
var preferences = EzWebAPI.createRWGadgetVariable("preferencesUser");
var time = EzWebAPI.createRGadgetVariable("time", resetInterval);
// Events and Slots
var sendCompanyInfoFinance = EzWebAPI.createRWGadgetVariable("value-finance-company");
var sendMarketInfoFinance = EzWebAPI.createRWGadgetVariable("value-finance-market");
var companyNameSlot = EzWebAPI.createRGadgetVariable("company-name", getCompany);
var marketNameSlot = EzWebAPI.createRGadgetVariable("market-name", getMarket);


var urlimage = 'http://demo.ezweb.morfeo-project.org/repository/BolsaGadget/images/';
var urlYahooImage = "http://es.ichart.yahoo.com/b?s=";
var alternatives = new StyledElements.StyledAlternatives();
var panelMain = new StyledElements.StyledNotebook({
    'id': 'panelMain'
});
var panelSettings = new StyledElements.StyledNotebook({
    'id': 'panelSettings'
});

var symbols = new Array();
var tags = new Array();
var tagsDic = {}
var value = "";
var alternativeList = [];
var interval = null;
var tabsIndexSettings = {
    "MarketEnterprise": 0,
    "EnterpriseInformation": 1,
    "FollowUp": 2
};



function resetInterval(){
    var value = time.get();
    if (interval != null) {
        try {
            clearInterval(interval);
        } 
        catch (e) {
        }
    }
    
    interval = setInterval("reload()", value * 60000);
}

var BolsaGadget = function(){
    EzWebGadget.call(this, {
        translatable: true
    });
}

BolsaGadget.prototype = new EzWebGadget();
BolsaGadget.prototype.resourcesURL = "http://demo.ezweb.morfeo-project.org/repository/BolsaGadget"
BolsaGadget.prototype.init = function(){

    var preferences = EzWebAPI.createRWGadgetVariable("preferencesUser");
    // Inicializamos las preferencias si no estan activas
    if (preferences.get() == "") 
        startPreferences();
    
    symbols = ["^IBEX", "^IBEXC", "^FTSE", "^GDAXI", "^FCHI", "^SPMIB", "^DJI", "^IXIC", "^HXC"];
    
    // Obtenemos los tags de información que serán mostrados para las listas de 
    // empresas y mercados
    var preferencesAux = eval('(' + preferences.get() + ')');
    tags = preferencesAux.list;
    
    var alternativeInfo = alternatives.createAlternative();
    var alternativeSettings = alternatives.createAlternative();
    
    alternativeList = [alternativeInfo.getId(), alternativeSettings.getId()];

    resetInterval();
    
    // CREATE HEADER && CONTENT DIV
    var header = document.createElement("div");
    header.id = "header";
    var img = document.createElement("img");
    img.src = urlimage + "view-refresh.png";
    img.addEventListener("click", displayAlternativeInfo, false);
    img.setAttribute("title", BolsaGadget.getTranslatedLabel("buttonSynchronize"));
    header.appendChild(img);
    
    var img = document.createElement("img");
    img.src = urlimage + "config.png";
    img.addEventListener("click", displayAlternativeSettings, false);
    img.setAttribute("title", BolsaGadget.getTranslatedLabel("buttonPreferences"));
    header.appendChild(img);
    
    var content = document.createElement("div");
    content.id = "content"
    document.body.appendChild(header);
    document.body.appendChild(content);
    alternatives.insertInto(document.getElementById('content'));
    alternativeInfo.appendChild(panelMain);
    
    
    var divSettings = document.createElement("div");
    divSettings.id = "settings";
    alternativeSettings.appendChild(divSettings);
	
    alternatives.showAlternative(alternativeList[0]);
    getQuoteMarket(symbols, tags);	
}


BolsaGadget = new BolsaGadget();

/*
 * RECARGA TODAS LAS PESTAÑAS Y LA INFORMACIÓN DE LAS MISMAS
 */
function reload(){
    var panelLength = panelMain.getNumberOfTabs();
    for (var i = 0; i < panelLength; i++) {
        var currentTab = panelMain.getTabByIndex(i);
        refresh(currentTab.__context.type, currentTab.__context.symbols, currentTab.__context.tags, i);
    }
}


/*
 * FUNCION QUE MUESTRA INFORMACIÓN SOBRE LOS PRINCIPALES MERCADOS BURSATILES
 */
function displayQuoteMarket(info, context){
    var div = document.createElement("div");
    div.setAttribute("class", "quote");
    var table = document.createElement("table");
    table.setAttribute("class", "quoteTable");
    var preferencesAux = eval("(" + preferences.get() + ")");
    
    for (var i = 0; i < preferencesAux.list.length; i++) {
        if (preferencesAux.list[i] == "t1") {
            var th = document.createElement("th");
            th.id = "Time";
            th.setAttribute("title", BolsaGadget.getTranslatedLabel("Time"));
            th.appendChild(document.createTextNode(BolsaGadget.getTranslatedLabel("Time")));
            table.appendChild(th);
            var th = document.createElement("th");
            th.id = "Date";
            th.setAttribute("title", BolsaGadget.getTranslatedLabel("Date"));
            th.appendChild(document.createTextNode(BolsaGadget.getTranslatedLabel("Date")));
            table.appendChild(th);
        }
        else {
            var th = document.createElement("th");
            th.id = preferencesAux.list[i];
            th.setAttribute("title", BolsaGadget.getTranslatedLabel(preferencesAux.list[i]));
            th.appendChild(document.createTextNode(BolsaGadget.getTranslatedLabel(preferencesAux.list[i])));
            table.appendChild(th);
        }
    }
    
    for (var i = 0; i < info.length; i++) {
        var tr = document.createElement("tr");
        
        if ((i % 2) == 0) 
            tr.setAttribute("class", "even");
        else 
            tr.setAttribute("class", "odd");
        
        var tagsAux = preferencesAux.list;
        var t = "";
        for (var k = 0; k < tagsAux.length; k++) 
            t += tagsAux[k];
        
        var contextEvent = {
            info: info[i][1],
            t: t
        };
        tr.addEventListener("click", EzWebExt.bind(function(e){
            getQuoteFile(["@" + this.info], [this.t]);
        }, contextEvent), false);
        
        for (var j = 0; j < info[i].length; j++) {
            var td = document.createElement("td");
            
            if (j == 0) 
                td.setAttribute("class", "company");
            else 
                if (j == 1) 
                    td.setAttribute("class", "symbol");
            
            td.appendChild(document.createTextNode(info[i][j].replace(/\^/g, "")));
            
            if ((j != 0) && (info[i][j].indexOf("+") >= 0)) 
                td.setAttribute("class", "positive");
            
            if ((j != 0) && (info[i][j].indexOf("-") >= 0)) 
                td.setAttribute("class", "negative");
            
            tr.appendChild(td);
        }
        if (tr.innerHTML != "") 
            table.appendChild(tr);
    }
    div.appendChild(table);
    
    if (context.newTab) {
		if (value == "MAIN") {
			var preferencesAux = eval('(' + preferences.get() + ')');
			var currentTab = panelMain.createTab({
				"name": BolsaGadget.getTranslatedLabel("followUpTab"),
				closeable: false
			});
			currentTab["__context"] = {};
			currentTab.__context["type"] = 1;
			currentTab.__context["symbols"] = preferencesAux.followUp;
			currentTab.__context["tags"] = preferencesAux.list;
			refresh(currentTab.__context.type, currentTab.__context.symbols, currentTab.__context.tags, 0);
			var followUp = panelMain.getTabByIndex(0);
			panelMain.goToTab(followUp.getId());
			var tab1 = panelMain.createTab({
				"name": BolsaGadget.getTranslatedLabel(value),
				closeable:false
			});
			tab1.appendChild(div);
			tab1.__context = {};
			tab1.__context["symbols"] = context.symbols;
			tab1.__context["tags"] = context.tags;
			tab1.__context["type"] = 0;
			
		}
		else {
			var tab1 = panelMain.createTab({"name": BolsaGadget.getTranslatedLabel(value)});
			tab1.appendChild(div);
			tab1.__context = {};
			tab1.__context["symbols"] = context.symbols;
			tab1.__context["tags"] = context.tags;
			tab1.__context["type"] = 0;
			panelMain.goToTab(tab1.getId());
		}
	}
	else {
		var tab = panelMain.getTabByIndex(context.indexTab);
		tab.clear();
		tab.appendChild(div);
	}
    
    removeLoadingImage();
}

/*
 * FUNCION QUE MUESTRA LAS EMPRESAS QUE COTIZAN EN BOLSA EN UN MERCADO BURSATIL DETERMINADO
 */
function displayQuote(info, context){
    var div = document.createElement("div");
    div.setAttribute("class", "quote");
    var table = document.createElement("table");
    table.setAttribute("class", "quoteTable");
    var preferencesAux = eval("(" + preferences.get() + ")");
    
    for (var i = 0; i < preferencesAux.list.length; i++) {
        if (preferencesAux.list[i] == "t1") {
            var th = document.createElement("th");
            th.id = "Time";
            th.setAttribute("title", BolsaGadget.getTranslatedLabel("Time"));
            th.appendChild(document.createTextNode(BolsaGadget.getTranslatedLabel("Time")));
            table.appendChild(th);
            var th = document.createElement("th");
            th.id = "Date";
            th.setAttribute("title", BolsaGadget.getTranslatedLabel("Date"));
            th.appendChild(document.createTextNode(addTitle(BolsaGadget.getTranslatedLabel("Date"))));
            table.appendChild(th);
        }
        else {
            var th = document.createElement("th");
            th.id = preferencesAux.list[i];
            th.setAttribute("title", BolsaGadget.getTranslatedLabel(preferencesAux.list[i]));
            th.appendChild(document.createTextNode(BolsaGadget.getTranslatedLabel(preferencesAux.list[i])));
            table.appendChild(th);
        }
    }
    

    for (var i = 0; i < info.length; i++) {
        var tr = document.createElement("tr");
        
        if ((i % 2) == 0) 
            tr.setAttribute("class", "even");
        else 
            tr.setAttribute("class", "odd");
        
        var tagsAux = preferencesAux.enterprise;
        
        var t = "";
        for (var k = 0; k < tagsAux.length; k++) 
            t += tagsAux[k];
        
        var contextEvent = {
            info: info[i][1],
            t: t
        };

        tr.addEventListener("click", EzWebExt.bind(function(e){
            getQuoteEnterprise(["@" + this.info], [this.t]);
        }, contextEvent), false);
        
        for (var j = 0; j < info[i].length; j++) {
            var td = document.createElement("td");
            
            if (j == 0) 
                td.setAttribute("class", "company");
            else 
                if (j == 1) 
                    td.setAttribute("class", "symbol");
            
            td.appendChild(document.createTextNode(info[i][j].replace(/\^/g, "")));
            
            if ((j != 0) && (info[i][j].indexOf("+") >= 0)) 
                td.setAttribute("class", "positive");
            
            if ((j != 0) && (info[i][j].indexOf("-") >= 0)) 
                td.setAttribute("class", "negative");
            
            tr.appendChild(td);
        }
        if (tr.innerHTML != "") 
            table.appendChild(tr);
    }
    div.appendChild(table);
    
    if (context.newTab) {
	// Check tabs
	enc = false;
	var panelLength = panelMain.getNumberOfTabs();
	for (var i = 0; ((i < panelLength) && (!enc)); i++) 
	    {
		currentTab = panelMain.getTabByIndex(i);
		symbols1 = '';
		symbols2 = '';
		if (currentTab.__context)
		    {
			for(var j = 0; j < currentTab.__context.symbols.length; j++)
			    symbols1 += currentTab.__context.symbols[j];
			
			for(var j = 0; j < context.symbols.length; j++)
			    symbols2 += context.symbols[j];
			enc = (symbols1 == symbols2);
		    }
	    }
	
	if (enc)
	    {
		// Go to tab
		panelMain.goToTab(currentTab.getId());
	    }
	else
	    {
		// Create a new tab
		var tab1 = panelMain.createTab({
			"name": addTitle(value)
		    });
		tab1.appendChild(div);
		tab1.__context = {};
		tab1.__context["symbols"] = context.symbols;
		tab1.__context["tags"] = context.tags;
		tab1.__context["type"] = 1; // Type Market Enterprises
		panelMain.goToTab(tab1.getId());
	    }
    }
    else {
        var tab = panelMain.getTabByIndex(context.indexTab);
        tab.clear();
        tab.appendChild(div);
    }
    
    removeLoadingImage();
}


/*
 * FUNCION QUE MUESTRA LA INFORMACIONN RESPECTIVA A LA EMPRESA QUE COTIZA EN BOLSA
 */
function displayQuoteEnterprise(info, context){

    var hpaned = new StyledElements.StyledHPaned({
        "handlerPosition": 20
    });
    
    hpaned.getRightPanel().repaint = function(temporal){
        StyledElements.Container.prototype.repaint.call(this, temporal);
        
        if (this.wrapperElement.getElementsByClassName("imgQuote").length > 0) {
            var divImage = this.wrapperElement.getElementsByClassName("imgQuote")[0];
            var image = divImage.childNodes[0];
            image.style.cssText = "";
            image.style.cssText += "width:" + (this.wrapperElement.offsetWidth - 70) + "px;";
            image.style.cssText += "height:" + (this.wrapperElement.offsetHeight - 100) + "px;";
        }
    }
    
    var div = document.createElement("div");
    div.setAttribute("class", "enterpriseInfo");
    var divHpanned = document.createElement("div");
    
    divHpanned.setAttribute("class", "infoEnterprise");
    var divHeader = document.createElement("div");
    divHeader.setAttribute("class", "headerInfoEnterprise");
    var span = document.createElement("span");
    span.appendChild(document.createTextNode(BolsaGadget.getTranslatedLabel("details")));
    span.setAttribute("class", "alternative_title");
    divHeader.appendChild(span);
    
    //botones de seguimiento
    var divButtonsDetails = document.createElement("div");
    divButtonsDetails.setAttribute("class", "buttonsDetails");
    
	
    // Comprobamos si se esta realizando seguimiento de la empresa
    var preferencesAux = eval('('+preferences.get()+')');
    
    if (inList(context.symbols[0].replace(/@/g, ""), preferencesAux.followUp, 0)) {
	var imgRemoveFollowUp = document.createElement("img");
	var contextImg = {"image": imgRemoveFollowUp, "symbol":context.symbols[0].replace(/@/g, "")};
	imgRemoveFollowUp.src = urlimage + "remove.png";
	imgRemoveFollowUp.setAttribute("title", BolsaGadget.getTranslatedLabel("removeToFollowUp"));
	imgRemoveFollowUp.addEventListener("click", EzWebExt.bind(removeFollowUp, contextImg), false);
	divButtonsDetails.appendChild(imgRemoveFollowUp);
    }
    else {
	var imgAddFollowUp = document.createElement("img");
	var contextImg = {"image": imgAddFollowUp, "symbol":context.symbols[0].replace(/@/g, "")};
	imgAddFollowUp.src = urlimage + "add.png";
		imgAddFollowUp.setAttribute("title", BolsaGadget.getTranslatedLabel("addToFollowUp"));
		imgAddFollowUp.addEventListener("click", EzWebExt.bind(addFollowUp, contextImg), false);
		divButtonsDetails.appendChild(imgAddFollowUp);
    }
    imgSendEvent = document.createElement("img");
    imgSendEvent.src = "/ezweb/images/wiring21px.png";
    divButtonsDetails.appendChild(imgSendEvent);
    
    divHeader.appendChild(divButtonsDetails);
    div.appendChild(divHeader);
    hpaned.insertInto(divHpanned);
    div.appendChild(divHpanned);
    
    var divTable = document.createElement("div");
    divTable.setAttribute("class", "InfoQuote");
    var divContentImg = document.createElement("div");
    divContentImg.setAttribute("class", "imgInfoQuote");
    var table = document.createElement("table");
    table.setAttribute("class", "tableInfoQuote");
    var preferencesAux = eval("(" + preferences.get() + ')');
    values = [];
    
    for (var i = 0; i < preferencesAux.enterprise.length; i++) {
	var tr = document.createElement("tr");
	var td = document.createElement("td");
	td.appendChild(document.createTextNode(BolsaGadget.getTranslatedLabel(preferencesAux.enterprise[i])));
	td.id = preferencesAux.enterprise[i];
	td.setAttribute("class", "titleTableInfoQuote");
	tr.appendChild(td);
	
	var td = document.createElement("td");
	td.innerHTML = info[0][i];
	
	if ((i != 0) && (info[0][i].indexOf("+") >= 0)) 
		td.setAttribute("class", "positive");
	else 
            if ((i != 0) && (info[0][i].indexOf("-") >= 0) &&
		(info[0][i].indexOf("N/A -") < 0) &&
		(preferencesAux.enterprise[i] != "l") &&
		(preferencesAux.enterprise[i] != "m") &&
		(preferencesAux.enterprise[i] != "q") &&
		(preferencesAux.enterprise[i] != "r1") &&
		(preferencesAux.enterprise[i] != "w")) 
                td.setAttribute("class", "negative");
            else 
                td.setAttribute("class", "valueTableInfoQuote");
        
	values[i] = [BolsaGadget.getTranslatedLabel(preferencesAux.enterprise[i]), info[0][i]];
        tr.appendChild(td);        
        table.appendChild(tr);
    }
    
    divTable.appendChild(table);
    
    // Send Event Company
    // Company Name
    company = values[0][1]; 
    sendEventCompany(company, values);
    contextEvent ={'company':company, 'info':values};
    imgSendEvent.addEventListener("click", 
    EzWebExt.bind(function(e){
	    sendEventCompany(this.company,
			     this.info); 
	}, contextEvent), false);
    
    
    if (context.newTab) {

	// Check tabs
	enc = false;
	var panelLength = panelMain.getNumberOfTabs();
	for (var i = 0; ((i < panelLength) && (!enc)); i++) 
	    {
		currentTab = panelMain.getTabByIndex(i);
		symbols1 = '';
		symbols2 = '';
		if (currentTab.__context)
		    {
			for(var j = 0; j < currentTab.__context.symbols.length; j++)
			    symbols1 += currentTab.__context.symbols[j];
			
			for(var j = 0; j < context.symbols.length; j++)
			    symbols2 += context.symbols[j];
			enc = (symbols1 == symbols2.replace(/@/g, ""));
		    }
	    }
	if(enc)
	    {
		panelMain.goToTab(currentTab.getId());
		removeLoadingImage();
		return;
	    }
	else
	    {
		var tab = panelMain.createTab({
			"name": addTitle(value)
		    });
		tab.appendChild(div);
		tab.__context = {};
		tab.__context["symbols"] = [context.symbols[0].replace(/@/g, "")];
		tab.__context["tags"] = context.tags;
		tab.__context["type"] = 2; // Type Enterprises
		panelMain.goToTab(tab.getId());
	    }
    }
    else {
        var tab = panelMain.getTabByIndex(context.indexTab);
        tab.clear();
        tab.appendChild(div);
    }
    var divSettingsHidden = document.createElement("div");
	var divSettingsImage = document.createElement("div");
	
	var imgHidden = document.createElement("img");
	imgHidden.src = urlimage + "close-details.png";
	imgHidden.title = BolsaGadget.getTranslatedLabel("hidden");
	divSettingsHidden.appendChild(imgHidden);
	
	var contextHidden = {"image":imgHidden, "settings":divSettingsImage}	
    imgHidden.addEventListener("click", EzWebExt.bind(closeSettingsImage, contextHidden), false);
	
	divSettingsHidden.setAttribute("class", "settingsHidden");
    divSettingsImage.setAttribute("class", "settingsImage");
    
    var table = document.createElement("table");
    table.setAttribute("class", "rangeTable");
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    
    var span = document.createElement("span");
    span.setAttribute("class", "option_title_image");
    span.appendChild(document.createTextNode(BolsaGadget.getTranslatedLabel("range")));
    span.id = "range";
    td.appendChild(span);
    tr.appendChild(td);
    
    var td = document.createElement("td");
    var entries = [["1d", BolsaGadget.getTranslatedLabel("1d")], ["5d", BolsaGadget.getTranslatedLabel("5d")], ["3m", BolsaGadget.getTranslatedLabel("3m")], ["6m", BolsaGadget.getTranslatedLabel("6m")], ["1y", BolsaGadget.getTranslatedLabel("1y")], ["2y", BolsaGadget.getTranslatedLabel("2y")], ["5y", BolsaGadget.getTranslatedLabel("5y")], ["my", BolsaGadget.getTranslatedLabel("my")]];
    
    if (context.newTab) 
        var imgContext = {
            "range": "1d",
            "type": "l",
            "scale": "off"
        }
    else 
        var imgContext = tab.__context["img"];
    
    var select = new StyledElements.StyledSelect({
        initialEntries: entries,
        initialValue: imgContext["range"],
        "class": "inputRange"
    });
    var selectContext = {
        tab: tab,
        idSelect: 0
    };
    select.addEventListener("change", EzWebExt.bind(refreshImage, selectContext));
    
    select.insertInto(td);
    tr.appendChild(td);
    table.appendChild(tr);
    divSettingsImage.appendChild(table);
    
    var table = document.createElement("table");
    table.setAttribute("class", "typeTable");
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    
    var span = document.createElement("span");
    span.setAttribute("class", "option_title_image");
    span.appendChild(document.createTextNode(BolsaGadget.getTranslatedLabel("type")));
    span.id = "type";
    td.appendChild(span);
    tr.appendChild(td);
    
    var td = document.createElement("td");
    var entries = [["b", BolsaGadget.getTranslatedLabel("bar")], ["l", BolsaGadget.getTranslatedLabel("lineal")], ["c", BolsaGadget.getTranslatedLabel("candle")]];
    
    var select = new StyledElements.StyledSelect({
        initialEntries: entries,
        initialValue: imgContext["type"],
        "class": "inputType"
    });
    var selectContext = {
        tab: tab,
        idSelect: 1
    };
    select.addEventListener("change", EzWebExt.bind(refreshImage, selectContext));
    select.insertInto(td);
    tr.appendChild(td);
    table.appendChild(tr);
    divSettingsImage.appendChild(table);
    
    var table = document.createElement("table");
    table.setAttribute("class", "scaleTable");
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    
    var span = document.createElement("span");
    span.setAttribute("class", "option_title_image");
    span.appendChild(document.createTextNode(BolsaGadget.getTranslatedLabel("scale")));
    span.id = "scale";
    td.appendChild(span);
    tr.appendChild(td);
    
    var td = document.createElement("td");
    var entries = [["off", BolsaGadget.getTranslatedLabel("off")], ["on", BolsaGadget.getTranslatedLabel("on")]];
    
    var select = new StyledElements.StyledSelect({
        initialEntries: entries,
        initialValue: imgContext["scale"],
        "class": "inputScale"
    });
    var selectContext = {
        tab: tab,
        idSelect: 1
    };
    select.addEventListener("change", EzWebExt.bind(refreshImage, selectContext));
    select.insertInto(td);
    tr.appendChild(td);
    table.appendChild(tr);
    divSettingsImage.appendChild(table);

    divContentImg.appendChild(divSettingsHidden);
    divContentImg.appendChild(divSettingsImage);
    var divImg = document.createElement("div");
    divImg.setAttribute("class", "imgQuote");
    var img = document.createElement("img");
    var aleatorio = Math.random();
    
    imgContext["imgage"] = img;
    imgContext["url"] = urlYahooImage + info[0][1].replace(/\^/g, "").replace(/@/g, "");
    
    img.src = urlYahooImage + info[0][1].replace(/\^/g, "").replace(/@/g, "") +
    "&t=" +
    imgContext["range"] +
    "&l=" +
    imgContext["scale"] +
    "&z=m&q=" +
    imgContext["type"] +
    "&aleatorio=" +
    aleatorio;
    divImg.appendChild(img);
    divContentImg.appendChild(divImg);
    
    tab.__context["img"] = imgContext;
    hpaned.getLeftPanel().appendChild(divTable);
    hpaned.getRightPanel().appendChild(divContentImg);
    
    removeLoadingImage();
    hpaned.repaint();
}




/*
 *
 */
function refreshImage(select){
    var tab = this.tab;
    var idSelect = this.idSelect;
    var img = tab.__context["img"];
    
    if (idSelect == 0) 
        img.range = select.getValue();
    else 
        if (idSelect == 1) 
            img.type = select.getValue();
        else 
            img.scale = select.getValue();
    
    var aleatorio = Math.random();
    img.imgage.src = img.url + "&t=" + img.range + "&z=m" + "&q=" + img.type +
    "&l=" +
    img.scale +
    "&aleatorio=" +
    aleatorio;
}

/*
 * MUESTRA EL PANEL DE PESTAÑAS QUE MUESTRA LA INFORMACION DE LA BOLSA
 */
function displayAlternativeInfo(){

    // Deseleccionamos el listado de las pestañas de configuración
    if (panelSettings.getNumberOfTabs() > 0) {
        var tab = panelSettings.getTabByIndex(0);
        var left = tab.__context["left"];
        var right = tab.__context["right"];
        left.cleanSelection();
        right.cleanSelection();
        
        var tab = panelSettings.getTabByIndex(1);
        var left = tab.__context["left"];
        var right = tab.__context["right"];
        left.cleanSelection();
        right.cleanSelection();
    }
    reload();
    alternatives.showAlternative(alternativeList[0]);
}

/*
 * MUESTRA LA PANTALLA DE OPCIONES DE PREFERENCIA DE USUARIO
 */
function displayAlternativeSettings(){
    displaySettings();
    alternatives.showAlternative(alternativeList[1]);
}

/*
 * INICIALIZA LAS OPCIONES DE PREFERENCIA DE USUARIO ALMACENANDOLAS
 */
function startPreferences(){
    preferences.set(to_json({
        "list": ["n", "s"],
        "enterprise": ["n", "s"],
        "followUp": []
    }));
}

/*
 * FUNCION QUE MUESTRA EL FORMULARIO QUE PERMITE SELECCIONAR AL USUARIO LA INFORMACIÓN QUE SE MOSTRARA
 * TANTO EN LAS LISTAS DE EMPRESAS Y MERCADOS BURSATILES COMO LA INFORMACIÓN QUE SE MOSTRARA PARA UNA EMPRESA
 */
function displaySettings(){

    if (panelSettings.getNumberOfTabs() <= 0) {
        document.getElementById("settings").innerHTML = "";
        var divSettingsHeader = document.createElement("div");
        var span = document.createElement("span")
        span.setAttribute("class", "alternative_title");
        span.appendChild(document.createTextNode(BolsaGadget.getTranslatedLabel("preferences")));
        span.id = "preferences";
        divSettingsHeader.appendChild(span);
        
        var divButtonsSettingsHeader = document.createElement("div");
        divButtonsSettingsHeader.id = "buttonsSettingsHeader";
        
        var imgSave = document.createElement("img");
        imgSave.src = urlimage + "save.png";
        imgSave.addEventListener("click", savePreferences, false);
        imgSave.setAttribute("title", BolsaGadget.getTranslatedLabel("save"));
        var imgCancel = document.createElement("img");
        imgCancel.src = urlimage + "cancel.png";
        imgCancel.setAttribute("class", "cancel");
        imgCancel.addEventListener("click", cancelPreferences, false);
        
        divButtonsSettingsHeader.appendChild(imgSave);
        divButtonsSettingsHeader.appendChild(imgCancel);
        divSettingsHeader.appendChild(divButtonsSettingsHeader);
        
        var divSettingsContent = document.createElement("div");
        
        divSettingsHeader.id = "settingsHeader";
        divSettingsContent.id = "settingsContent";
        
        document.getElementById("settings").appendChild(divSettingsHeader);
        document.getElementById("settings").appendChild(divSettingsContent);
        
        var nameTab = BolsaGadget.getTranslatedLabel("columns");
        var tab = panelSettings.createTab({
            name: nameTab,
            closeable: false
        });
        var nameTab = BolsaGadget.getTranslatedLabel("detailsPreferences");
        var tab = panelSettings.createTab({
            name: nameTab,
            closeable: false
        });
        var nameTab = BolsaGadget.getTranslatedLabel("followUp");
        var tab = panelSettings.createTab({
            name: nameTab,
            closeable: false
        });
        panelSettings.insertInto(divSettingsContent);
        // Creamos el contenido de la pestaña de información de mercados y empresas de un mercado
        createTabSettings("MarketEnterprise");
        // Creamos el contenido de la pestaña de preferencias de información para la empresa
        createTabSettings("EnterpriseInformation");
        // Creamos el contenido de la pestaña de las empresas que se mostrarán en el panel principal
        createTabFollowUp();
    }
    
    
}


/*
 * DETERMINA SI UNA EMPRESA SE ESTA REALIZANDO EL SEGUIMIENTO DE UNA EMPRESA
 */
function followUp(ticker){

}


/*
 * DETERMINA SI UN ELEMENTO ESTA DENTRO DE UNA LISTA
 */
function inList(element, l, typeList){
	var enc = false;
	for (var i = 0; ((i < l.length) && (!enc)); i++) {
		if (typeList == 0) 
			enc = (element == l[i]);
		else 
			enc = (element == l[i][0]);
	}
    return enc;
}

/*
 *****************************************************************************************
 ******************** EVENTOS ASOCIADOS A LISTAS ****************************************
 *****************************************************************************************
 */
/*
 * HABILITA O DESHABILITA EL BOTON DE AÑADIR
 */
function enableButtonsLeft(component, valueSelected){
    var context = this;
    var tab = panelSettings.getTabByIndex(tabsIndexSettings[context.key]);
    tab.__context["right"].cleanSelection();
    var listLeft = tab.__context["listLeft"];
    var listRight = tab.__context["listRight"];
    
    var imgAdd = document.createElement("img");
    var imgDelete = document.createElement("img");
    var imgAddAll = document.createElement("img");
    var imgDeleteAll = document.createElement("img");
    var imgUp = document.createElement("img");
    var imgDown = document.createElement("img");
    
    imgAdd.setAttribute("class", "imgAdd" + context.key);
    imgAddAll.setAttribute("class", "imgAddAll" + context.key);
    imgDelete.setAttribute("class", "imgDelete" + context.key);
    imgDeleteAll.setAttribute("class", "imgDeleteAll" + context.key);
    imgUp.setAttribute("class", "imgUp" + context.key);
    imgDown.setAttribute("class", "imgDown" + context.key);
    
    imgAdd.src = urlimage + ((valueSelected.length > 0) ? ("forward.png") : ("forward-disabled.png"));
    imgAddAll.src = urlimage + ((listLeft.length > 0) ? ("forward-all.png") : ("forward-all-disabled.png"));
    imgDeleteAll.src = urlimage + "back-all-disabled.png";
    imgDelete.src = urlimage + "back-disabled.png";
    imgUp.src = urlimage + "up-disabled.png";
    imgDown.src = urlimage + "down-disabled.png";
    
    if (valueSelected.length > 0) 
        imgAdd.addEventListener("click", EzWebExt.bind(addList, context), false);
    
    if (listLeft.length > 0) 
        imgAddAll.addEventListener("click", EzWebExt.bind(addListAll, context), false);
    
    if (listRight.length > 0) {
        imgDeleteAll.src = urlimage + "back-all.png";
		if(context.key ==  "FollowUp")
        	imgDeleteAll.addEventListener("click", EzWebExt.bind(removeListAllFollowUp, context), false);
		else
          	imgDeleteAll.addEventListener("click", EzWebExt.bind(removeListAll, context), false);

    }
    
    document.getElementById("centerLeftBox" + context.key).innerHTML = "";
    document.getElementById("rightBox" + context.key).innerHTML = "";
    document.getElementById("centerLeftBox" + context.key).appendChild(imgAddAll);
    document.getElementById("centerLeftBox" + context.key).appendChild(imgAdd);
    document.getElementById("centerLeftBox" + context.key).appendChild(imgDelete);
    document.getElementById("centerLeftBox" + context.key).appendChild(imgDeleteAll);
    document.getElementById("rightBox" + context.key).appendChild(imgUp);
    document.getElementById("rightBox" + context.key).appendChild(imgDown);
}

/*
 * HABILITA O DESHABILITA EL BOTON DE ELIMINAR Y BOTONES ARRIBA Y ABAJO
 */
function enableButtonsRight(component, valueSelected){
    var context = this;
    var tab = panelSettings.getTabByIndex(tabsIndexSettings[context.key]);
    tab.__context["left"].cleanSelection();
    var listRight = tab.__context["listRight"];
    var listLeft = tab.__context["listLeft"];
    
    var imgAdd = document.createElement("img");
    var imgDelete = document.createElement("img");
    var imgAddAll = document.createElement("img");
    var imgDeleteAll = document.createElement("img");
    var imgUp = document.createElement("img");
    var imgDown = document.createElement("img");
    
    imgAdd.setAttribute("class", "imgAdd" + context.key);
    imgAddAll.setAttribute("class", "imgAddAll" + context.key);
    imgDelete.setAttribute("class", "imgDelete" + context.key);
    imgDeleteAll.setAttribute("class", "imgDeleteAll" + context.key);
    imgUp.setAttribute("class", "imgUp" + context.key);
    imgDown.setAttribute("class", "imgDown" + context.key);
    
    imgAdd.src = urlimage + "forward-disabled.png";
    imgAddAll.src = urlimage + "forward-all-disabled.png";
    imgDeleteAll.src = urlimage + ((listRight.length > 0) ? ("back-all.png") : ("back-all-disabled.png"));
    imgDelete.src = urlimage + ((valueSelected.length > 0) ? ("back.png") : ("back-disabled.png"));
    imgUp.src = urlimage + "up-disabled.png";
    imgDown.src = urlimage + "down-disabled.png";
    
    if (listRight.length > 0) {
		if(context.key == "FollowUp")
			imgDeleteAll.addEventListener("click", EzWebExt.bind(removeListAllFollowUp, context), false);
		else
			imgDeleteAll.addEventListener("click", EzWebExt.bind(removeListAll, context), false);
	}
    
    if (valueSelected.length > 0) {
		if(context.key == "FollowUp")
        	imgDelete.addEventListener("click", EzWebExt.bind(removeListFollowUp, context), false);
		else
           	imgDelete.addEventListener("click", EzWebExt.bind(removeList, context), false);

        if (valueSelected.length == 1) {
            if (listRight[0][0] != valueSelected[0]) {
                imgUp.src = urlimage + "up.png"
                imgUp.addEventListener("click", EzWebExt.bind(upList, context), false);
            }
            
            if (listRight[listRight.length - 1][0] != valueSelected[0]) {
                imgDown.src = urlimage + "down.png";
                imgDown.addEventListener("click", EzWebExt.bind(downList, context), false);
            }
        }
    }
    else {
        imgUp.src = urlimage + "up-disabled.png";
        imgDown.src = urlimage + "down-disabled.png";
    }
    
    if (listLeft.length > 0) {
        imgAddAll.src = urlimage + "forward-all.png";
        imgAddAll.addEventListener("click", EzWebExt.bind(addListAll, context), false);
        
    }
    
    document.getElementById("centerLeftBox" + context.key).innerHTML = "";
    document.getElementById("rightBox" + context.key).innerHTML = "";
    document.getElementById("centerLeftBox" + context.key).appendChild(imgAddAll);
    document.getElementById("centerLeftBox" + context.key).appendChild(imgAdd);
    document.getElementById("centerLeftBox" + context.key).appendChild(imgDelete);
    document.getElementById("centerLeftBox" + context.key).appendChild(imgDeleteAll);
    document.getElementById("rightBox" + context.key).appendChild(imgUp);
    document.getElementById("rightBox" + context.key).appendChild(imgDown);
}

/*
 *****************************************************************************************
 ******************** EVENTOS ASOCIADOS A BOTONES ****************************************
 *****************************************************************************************
 */
/*
 * AÑADE TODOS LOS ELEMENTOS DE LA LISTA IZQUIERDA A LA LISTA DERECHA
 */
function addListAll(){
    var context = this;
    tab = panelSettings.getTabByIndex(tabsIndexSettings[context.key]);
    var listLeft = tab.__context["listLeft"];
    var listRight = tab.__context["listRight"];
    var divLeft = document.getElementById("leftBox" + context.key);
    var divCenterRight = document.getElementById("centerRightBox" + context.key);
    var elementsSelected = [];
    
    for (var i = 0; i < listLeft.length; i++) {
        elementsSelected[elementsSelected.length] = listLeft[i][0];
        listRight[listRight.length] = listLeft[i];
    }
    
    var left = new StyledElements.StyledList({
        full: true,
        multivalued: true,
        onChange: enableButtonsLeft
    });
    var right = new StyledElements.StyledList({
        full: true,
        multivalued: true,
        onChange: enableButtonsRight
    });
    left.addEventListener("change", EzWebExt.bind(enableButtonsLeft, context));
    // Evento que desabilita el boton de eliminar cuando no hay selección
    right.addEventListener("change", EzWebExt.bind(enableButtonsRight, context));
    divCenterRight.innerHTML = "";
    divLeft.innerHTML = "";
    left.insertInto(divLeft);
    right.addEntries(listRight);
    //right.select(elementsSelected);
    right.insertInto(divCenterRight);
    
    tab.__context["listRight"] = listRight;
    tab.__context["listLeft"] = [];
    tab.__context["right"] = right;
    tab.__context["left"] = left;
    
    var imgAdd = document.createElement("img");
    var imgDelete = document.createElement("img");
    var imgAddAll = document.createElement("img");
    var imgDeleteAll = document.createElement("img");
    var imgUp = document.createElement("img");
    var imgDown = document.createElement("img");
    
    imgAdd.setAttribute("class", "imgAdd" + context.key);
    imgAddAll.setAttribute("class", "imgAddAll" + context.key);
    imgDelete.setAttribute("class", "imgDelete" + context.key);
    imgDeleteAll.setAttribute("class", "imgDeleteAll" + context.key);
    imgUp.setAttribute("class", "imgUp" + context.key);
    imgDown.setAttribute("class", "imgDown" + context.key);
    
    imgAdd.src = urlimage + "forward-disabled.png";
    imgAddAll.src = urlimage + "forward-all-disabled.png";
    imgDelete.src = urlimage + "back-disabled.png";
    imgDeleteAll.src = urlimage + "back-all.png";
    imgUp.src = urlimage + "up-disabled.png";
    imgDown.src = urlimage + "down-disabled.png";
    
	if(context.key == "FollowUp")
	 	imgDeleteAll.addEventListener("click", EzWebExt.bind(removeListAllFollowUp, context), false);
	else
   		imgDeleteAll.addEventListener("click", EzWebExt.bind(removeListAll, context), false);
    
    document.getElementById("centerLeftBox" + context.key).innerHTML = "";
    document.getElementById("rightBox" + context.key).innerHTML = "";
    document.getElementById("centerLeftBox" + context.key).appendChild(imgAddAll);
    document.getElementById("centerLeftBox" + context.key).appendChild(imgAdd);
    document.getElementById("centerLeftBox" + context.key).appendChild(imgDelete);
    document.getElementById("centerLeftBox" + context.key).appendChild(imgDeleteAll);
    document.getElementById("rightBox" + context.key).appendChild(imgUp);
    document.getElementById("rightBox" + context.key).appendChild(imgDown);
}


/*
 * AÑADE LOS ELEMENTOS SELECCIONADOS DE LA LISTA IZQUIERDA EN LA LISTA DERECHA
 */
function addList(){
    var context = this;
    var tab = panelSettings.getTabByIndex(tabsIndexSettings[context.key]);
    var left = tab.__context["left"];
    var right = tab.__context["right"];
    var listLeft = tab.__context["listLeft"];
    var listRight = tab.__context["listRight"];
    var divLeft = document.getElementById("leftBox" + context.key);
    var divCenterRight = document.getElementById("centerRightBox" + context.key);
    
    var elementsSelected = left.getSelection();
    if (elementsSelected.length <= 0) 
        return;
    
    var listAux = [];
    var nElements = 0;
    for (var i = 0; i < listLeft.length; i++) {
        var enc = false;
        for (var j = 0; ((j < elementsSelected.length) && (!enc)); j++) 
            enc = (listLeft[i][0] == elementsSelected[j]);
        
        if (!enc) 
            listAux[nElements++] = listLeft[i];
        else 
            listRight[listRight.length] = listLeft[i];
    }
    
    listLeft = listAux;
    left = new StyledElements.StyledList({
        full: true,
        multivalued: true,
        onChange: enableButtonsLeft
    });
    right = new StyledElements.StyledList({
        full: true,
        multivalued: true,
        onChange: enableButtonsRight
    });
    // Evento que desabilita el boton de añadir cuando no hay selección
    left.addEventListener("change", EzWebExt.bind(enableButtonsLeft, context));
    // Evento que desabilita el boton de eliminar cuando no hay selección
    right.addEventListener("change", EzWebExt.bind(enableButtonsRight, context));
    divCenterRight.innerHTML = "";
    divLeft.innerHTML = "";
    left.addEntries(listLeft);
    right.addEntries(listRight);
    left.insertInto(divLeft);
    //right.select(elementsSelected);
    right.insertInto(divCenterRight);
    
    tab.__context["listRight"] = listRight;
    tab.__context["listLeft"] = listLeft;
    tab.__context["right"] = right;
    tab.__context["left"] = left;
    
    var imgAdd = document.createElement("img");
    var imgDelete = document.createElement("img");
    var imgAddAll = document.createElement("img");
    var imgDeleteAll = document.createElement("img");
    var imgUp = document.createElement("img");
    var imgDown = document.createElement("img");
    
    imgAdd.setAttribute("class", "imgAdd" + context.key);
    imgAddAll.setAttribute("class", "imgAddAll" + context.key);
    imgDelete.setAttribute("class", "imgDelete" + context.key);
    imgDeleteAll.setAttribute("class", "imgDeleteAll" + context.key);
    imgUp.setAttribute("class", "imgUp" + context.key);
    imgDown.setAttribute("class", "imgDown" + context.key);
    
    imgAdd.src = urlimage + "forward-disabled.png";
    imgAddAll.src = urlimage + "forward-all-disabled.png";
    imgDelete.src = urlimage + "back-disabled.png";
    imgDeleteAll.src = urlimage + "back-all.png";
    imgUp.src = urlimage + "up-disabled.png";
    imgDown.src = urlimage + "down-disabled.png";
    
	if(context.key == "FollowUp")
    	imgDeleteAll.addEventListener("click", EzWebExt.bind(removeListAllFollowUp, context), false);
	else
		imgDeleteAll.addEventListener("click", EzWebExt.bind(removeListAll, context), false);
    
    if (listLeft.length > 0) {
        imgAddAll.src = urlimage + "forward-all.png";
        imgAddAll.addEventListener("click", EzWebExt.bind(addListAll, context), false);
    }
        
    document.getElementById("centerLeftBox" + context.key).innerHTML = "";
    document.getElementById("rightBox" + context.key).innerHTML = "";
    document.getElementById("centerLeftBox" + context.key).appendChild(imgAddAll);
    document.getElementById("centerLeftBox" + context.key).appendChild(imgAdd);
    document.getElementById("centerLeftBox" + context.key).appendChild(imgDelete);
    document.getElementById("centerLeftBox" + context.key).appendChild(imgDeleteAll);
    document.getElementById("rightBox" + context.key).appendChild(imgUp);
    document.getElementById("rightBox" + context.key).appendChild(imgDown);
}

/*
 * ELIMINA LOS ELEMENTOS SELECCIONADOS DE LA LISTA DERECHA AÑADIENDOLOS EN LA LISTA IZQUIERDA
 */
function removeList(){
    var context = this;
    var tab = panelSettings.getTabByIndex(tabsIndexSettings[context.key]);
    var left = tab.__context["left"];
    var right = tab.__context["right"];
    var listLeft = tab.__context["listLeft"];
    var listRight = tab.__context["listRight"];
    var divLeft = document.getElementById("leftBox" + context.key);
    var divCenterRight = document.getElementById("centerRightBox" + context.key);
    
    if (context.key == "MarketEnterprise") {
        var ids = ['a', 'a2', 'b', 'b4', 'b6', 'c', 'c1', 'd', 'd2', 'e1', 'e7', 'e8', 'f6', 'g', 'h', 'j', 'k', 'j4', 'k3', 'l', 'l1', 'm3', 'm4', 'o', 'p', 'p2', 'p5', 'p6', 'q', 's1', 's7', 't1', 't6', 't7', 't8', 'v', 'x', 'y'];
    }
    else {
        var ids = ['a', 'a2', 'a3', 'b', 'b2', 'b3', 'b4', 'b6', 'c', 'c1', 'c3', 'c6', 'c8', 'd', 'd1', 'd2', 'e', 'e1', 'e7', 'e8', 'e9', 'f6', 'g', 'h', 'j', 'k', 'g1', 'g3', 'g4', 'g5', 'i', 'i5', 'j1', 'j3', 'j4', 'j5', 'j6', 'k1', 'k2', 'k3', 'k4', 'k5', 'l', 'l1', 'l2', 'l3', 'm', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'n4', 'o', 'p', 'p1', 'p2', 'p5', 'p6', 'q', 'r', 'r1', 'r2', 'r5', 'r6', 'r7', 's1', 's7', 't1', 't7', 't8', 'v', 'v7', 'w', 'w1', 'w4', 'x', 'y'];
    }
    
    var elementsSelected = right.getSelection();
    if (elementsSelected.length <= 0) 
        return;
    
    var listAuxLeft = [];
    var nElementsLeft = 0;
    var listAuxRight = [];
    var nElementsRight = 0;
    
    for (var i = 0; i < ids.length; i++) {
        if (inList(ids[i], listLeft, 1)) 
            listAuxLeft[nElementsLeft++] = [ids[i], BolsaGadget.getTranslatedLabel(ids[i])];
        else {
            if (inList(ids[i], elementsSelected, 0)) 
                listAuxLeft[nElementsLeft++] = [ids[i], BolsaGadget.getTranslatedLabel(ids[i])];
        }
    }
    
    for (var i = 0; i < listRight.length; i++) {
        if (!inList(listRight[i][0], elementsSelected, 0)) 
            listAuxRight[nElementsRight++] = listRight[i];
    }
    
    listLeft = listAuxLeft;
    listRight = listAuxRight;
    left = new StyledElements.StyledList({
        full: true,
        multivalued: true,
        onChange: enableButtonsLeft
    });
    right = new StyledElements.StyledList({
        full: true,
        multivalued: true,
        onChange: enableButtonsRight
    });
    // Evento que desabilita el boton de añadir cuando no hay selección
    left.addEventListener("change", EzWebExt.bind(enableButtonsLeft, context));
    // Evento que desabilita el boton de eliminar cuando no hay selección
    right.addEventListener("change", EzWebExt.bind(enableButtonsRight, context));
    divCenterRight.innerHTML = "";
    divLeft.innerHTML = "";
    left.addEntries(listLeft);
    //left.select(elementsSelected);
    right.addEntries(listRight);
    left.insertInto(divLeft);
    right.insertInto(divCenterRight);
    
    tab.__context["listRight"] = listRight;
    tab.__context["listLeft"] = listLeft;
    tab.__context["right"] = right;
    tab.__context["left"] = left;
    
    var imgAdd = document.createElement("img");
    var imgDelete = document.createElement("img");
    var imgAddAll = document.createElement("img");
    var imgDeleteAll = document.createElement("img");
    var imgUp = document.createElement("img");
    var imgDown = document.createElement("img");
    
    imgAdd.setAttribute("class", "imgAdd" + context.key);
    imgAddAll.setAttribute("class", "imgAddAll" + context.key);
    imgDelete.setAttribute("class", "imgDelete" + context.key);
    imgDeleteAll.setAttribute("class", "imgDeleteAll" + context.key);
    imgUp.setAttribute("class", "imgUp" + context.key);
    imgDown.setAttribute("class", "imgDown" + context.key);
    
    imgAdd.src = urlimage + "forward-disabled.png";
    imgAddAll.src = urlimage + "forward-all.png";
    imgDelete.src = urlimage + "back-disabled.png";
    imgDeleteAll.src = urlimage + "back-all-disabled.png";
    imgUp.src = urlimage + "up-disabled.png";
    imgDown.src = urlimage + "down-disabled.png";
    
    imgAddAll.addEventListener("click", EzWebExt.bind(addListAll, context), false);
    
    if (listRight.length > 0) {
        imgDeleteAll.src = urlimage + "back-all.png";
		if(context.key == "FollowUp")
        	imgDeleteAll.addEventListener("click", EzWebExt.bind(removeListAllFollowUp, context), false);
		else
			imgDeleteAll.addEventListener("click", EzWebExt.bind(removeListAll, context), false);
    }
    
    document.getElementById("centerLeftBox" + context.key).innerHTML = "";
    document.getElementById("rightBox" + context.key).innerHTML = "";
    document.getElementById("centerLeftBox" + context.key).appendChild(imgAddAll);
    document.getElementById("centerLeftBox" + context.key).appendChild(imgAdd);
    document.getElementById("centerLeftBox" + context.key).appendChild(imgDelete);
    document.getElementById("centerLeftBox" + context.key).appendChild(imgDeleteAll);
    document.getElementById("rightBox" + context.key).appendChild(imgUp);
    document.getElementById("rightBox" + context.key).appendChild(imgDown);
}

/*
 * AÑADE TODOS LOS ELEMENTOS DE LA LISTA DERECHA A LA LISTA IZQUIERDA
 */
function removeListAll(){
    var context = this;
    var tab = panelSettings.getTabByIndex(tabsIndexSettings[context.key]);
    var divLeft = document.getElementById("leftBox" + context.key);
    var divCenterRight = document.getElementById("centerRightBox" + context.key);
    
    if (context.key == "MarketEnterprise") {
    
        var ids = ['a', 'a2', 'b', 'b4', 'b6', 'c', 'c1', 'd', 'd2', 'e1', 'e7', 'e8', 'f6', 
		'g', 'h', 'j', 'k', 'j4', 'k3', 'l', 'l1', 'm3', 'm4', 'o', 'p', 'p2', 'p5', 'p6', 
		'q', 's', 's1', 's7', 't1', 't6', 't7', 't8', 'v', 'x', 'y'];
    }
    else {
    
        var ids = ['a', 'a2', 'a3', 'b', 'b2', 'b3', 'b4', 'b6', 'c', 'c1', 'c3', 'c6', 'c8',
		 'd', 'd1', 'd2', 'e', 'e1', 'e7', 'e8', 'e9', 'f6', 'g', 'h', 'j', 'k', 'g1', 'g3',
		  'g4', 'g5', 'i', 'i5', 'j1', 'j3', 'j4', 'j5', 'j6', 'k1', 'k2', 'k3', 'k4', 'k5',
		   'l', 'l1', 'l2', 'l3', 'm', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'n4', 'o', 
		   'p', 'p1', 'p2', 'p5', 'p6', 'q', 'r', 'r1', 'r2', 'r5', 'r6', 'r7', 's1', 's7', 
		   't1', 't7', 't8', 'v', 'v7', 'w', 'w1', 'w4', 'x', 'y'];
    }
    
    var listLeft = []
    for (var i = 0; i < ids.length; i++) 
        listLeft[listLeft.length++] = [ids[i], BolsaGadget.getTranslatedLabel(ids[i])];
    
    var left = new StyledElements.StyledList({
        full: true,
        multivalued: true,
        onChange: enableButtonsLeft
    });
    var right = new StyledElements.StyledList({
        full: true,
        multivalued: true,
        onChange: enableButtonsRight
    });
    left.addEventListener("change", EzWebExt.bind(enableButtonsLeft, context));
    // Evento que desabilita el boton de eliminar cuando no hay selección
    right.addEventListener("change", EzWebExt.bind(enableButtonsRight, context));
    divCenterRight.innerHTML = "";
    divLeft.innerHTML = "";
    left.addEntries(listLeft);
    left.insertInto(divLeft);
    //left.select(ids);
    right.insertInto(divCenterRight);
    
    tab.__context["listRight"] = [];
    tab.__context["listLeft"] = listLeft;
    tab.__context["right"] = right;
    tab.__context["left"] = left;
    
    var imgAdd = document.createElement("img");
    var imgDelete = document.createElement("img");
    var imgAddAll = document.createElement("img");
    var imgDeleteAll = document.createElement("img");
    var imgUp = document.createElement("img");
    var imgDown = document.createElement("img");
    
    imgAdd.setAttribute("class", "imgAdd" + context.key);
    imgAddAll.setAttribute("class", "imgAddAll" + context.key);
    imgDelete.setAttribute("class", "imgDelete" + context.key);
    imgDeleteAll.setAttribute("class", "imgDeleteAll" + context.key);
    imgUp.setAttribute("class", "imgUp" + context.key);
    imgDown.setAttribute("class", "imgDown" + context.key);
    
    imgAdd.src = urlimage + "forward-disabled.png";
    imgAddAll.src = urlimage + "forward-all.png";
    imgDelete.src = urlimage + "back-disabled.png";
    imgDeleteAll.src = urlimage + "back-all-disabled.png";
    imgUp.src = urlimage + "up-disabled.png";
    imgDown.src = urlimage + "down-disabled.png";
    
    imgAddAll.addEventListener("click", EzWebExt.bind(addListAll, context), false);
    
    document.getElementById("centerLeftBox" + context.key).innerHTML = "";
    document.getElementById("rightBox" + context.key).innerHTML = "";
    document.getElementById("centerLeftBox" + context.key).appendChild(imgAddAll);
    document.getElementById("centerLeftBox" + context.key).appendChild(imgAdd);
    document.getElementById("centerLeftBox" + context.key).appendChild(imgDelete);
    document.getElementById("centerLeftBox" + context.key).appendChild(imgDeleteAll);
    document.getElementById("rightBox" + context.key).appendChild(imgUp);
    document.getElementById("rightBox" + context.key).appendChild(imgDown);
}

/*
 * MODIFICA DE POSICIÓN UN ELEMENTO DE LA LISTA IZQUIERDA SUBIENDOLO UNA POSICIÓN
 */
function upList(){
    var context = this;
    var tab = panelSettings.getTabByIndex(tabsIndexSettings[context.key]);
    var right = tab.__context["right"];
    var listRight = tab.__context["listRight"];
    var divCenterRight = document.getElementById("centerRightBox" + context.key);
    
    var elementsSelected = right.getSelection();
    if ((elementsSelected.length <= 0) || (elementsSelected.length > 1)) 
        return;
    
    for (var i = 1; i < listRight.length; i++) {
        if (inList(listRight[i][0], elementsSelected, 0)) {
            var elementAux = listRight[i - 1];
            listRight[i - 1] = listRight[i];
            listRight[i] = elementAux;
            
            var imgUp = document.createElement("img");
            var imgDown = document.createElement("img");
            
            if (listRight[0][0] == elementsSelected[0]) 
                imgUp.src = urlimage + "up-disabled.png";
            else {
                imgUp.src = urlimage + "up.png";
                imgUp.addEventListener("click", EzWebExt.bind(upList, context), false);
            }
            
            if (listRight[listRight.length - 1][0] == elementsSelected[0]) 
                imgDown.src = urlimage + "down-disabled.png";
            else {
                imgDown.src = urlimage + "down.png";
                imgDown.addEventListener("click", EzWebExt.bind(downList, context), false);
            }
            
            document.getElementById("rightBox" + context.key).innerHTML = "";
            document.getElementById("rightBox" + context.key).appendChild(imgUp);
            document.getElementById("rightBox" + context.key).appendChild(imgDown);
            break;
        }
    }
    
    divCenterRight.innerHTML = "";
    right = new StyledElements.StyledList({
        full: true,
        multivalued: true,
        onChange: enableButtonsRight
    });
    right.addEntries(listRight);
    right.select([elementsSelected[0]]);
    // Evento que desabilita el boton de eliminar cuando no hay selección
    
    right.addEventListener("change", EzWebExt.bind(enableButtonsRight, context));
    right.insertInto(divCenterRight);
    
    tab.__context["listRight"] = listRight;
    tab.__context["right"] = right;
}

/*
 * MODIFICA DE POSICIÓN UN ELEMENTO DE LA LISTA DERECHA SUBIENDOLO UNA POSICIÓN
 */
function downList(){
    var context = this;
    var tab = panelSettings.getTabByIndex(tabsIndexSettings[context.key]);
    var right = tab.__context["right"];
    var listRight = tab.__context["listRight"];
    var divCenterRight = document.getElementById("centerRightBox" + context.key);
    
    var elementsSelected = right.getSelection();
    if ((elementsSelected.length <= 0) || (elementsSelected.length > 1)) 
        return;
    
    for (var i = 0; i < listRight.length - 1; i++) {
        if (inList(listRight[i][0], elementsSelected, 0)) {
            var elementAux = listRight[i + 1];
            listRight[i + 1] = listRight[i];
            listRight[i] = elementAux;
            
            var imgUp = document.createElement("img");
            var imgDown = document.createElement("img");
            
            if (listRight[0][0] == elementsSelected[0]) 
                imgUp.src = urlimage + "up-disabled.png";
            else {
                imgUp.src = urlimage + "up.png";
                imgUp.addEventListener("click", EzWebExt.bind(upList, context), false);
            }
            
            if (listRight[listRight.length - 1][0] == elementsSelected[0]) 
                imgDown.src = urlimage + "down-disabled.png";
            else {
                imgDown.src = urlimage + "down.png";
                imgDown.addEventListener("click", EzWebExt.bind(downList, context), false);
            }
            
            document.getElementById("rightBox" + context.key).innerHTML = "";
            document.getElementById("rightBox" + context.key).appendChild(imgUp);
            document.getElementById("rightBox" + context.key).appendChild(imgDown);
            break;
        }
    }
    divCenterRight.innerHTML = "";
    right = new StyledElements.StyledList({
        full: true,
        multivalued: true,
        onChange: enableButtonsRight
    });
    right.addEntries(listRight);
    right.select([elementsSelected[0]]);
    // Evento que desabilita el boton de eliminar cuando no hay selección
    right.addEventListener("change", EzWebExt.bind(enableButtonsRight, context));
    right.insertInto(divCenterRight);
    
    tab.__context["listRight"] = listRight;
    tab.__context["right"] = right;
}


/*
 * ELIMINA EN LA PESTAÑA DE SEGUIMIENTO TODOS LOS ELEMENTOS DE LA LISTA DE LA DERECHA
 * AÑADIENDOLOS SI ES NECESARIO EN LA LISTA DE LA IZQUIERDA
 */
function removeListAllFollowUp(){
    var context = this;
    var tab = panelSettings.getTabByIndex(tabsIndexSettings[context.key]);
    var divLeft = document.getElementById("leftBox" + context.key);
    var divCenterRight = document.getElementById("centerRightBox" + context.key);
         
    var enterprise = new StyledElements.StyledList({
        full: true,
        multivalued: true,
        onChange: enableButtonsLeft
    });
    var enterpriseSelected = new StyledElements.StyledList({
        full: true,
        multivalued: true,
        onChange: enableButtonsRight
    });
    enterprise.addEventListener("change", EzWebExt.bind(enableButtonsLeft, context));
    // Evento que desabilita el boton de eliminar cuando no hay selección
    enterpriseSelected.addEventListener("change", EzWebExt.bind(enableButtonsRight, context));
    
	divCenterRight.innerHTML = "";
    divLeft.innerHTML = "";
    enterprise.insertInto(divLeft);
    //left.select(ids);
    enterpriseSelected.insertInto(divCenterRight);
    enterprise.addEntries(tab.__context["listLeftInit"]);
	
    tab.__context["listRight"] = [];
    tab.__context["listLeft"] = tab.__context["listLeftInit"];
    tab.__context["right"] = enterpriseSelected;
    tab.__context["left"] = enterprise;
    
    var imgAdd = document.createElement("img");
    var imgDelete = document.createElement("img");
    var imgAddAll = document.createElement("img");
    var imgDeleteAll = document.createElement("img");
    var imgUp = document.createElement("img");
    var imgDown = document.createElement("img");
    
    imgAdd.setAttribute("class", "imgAdd" + context.key);
    imgAddAll.setAttribute("class", "imgAddAll" + context.key);
    imgDelete.setAttribute("class", "imgDelete" + context.key);
    imgDeleteAll.setAttribute("class", "imgDeleteAll" + context.key);
    imgUp.setAttribute("class", "imgUp" + context.key);
    imgDown.setAttribute("class", "imgDown" + context.key);
    
    imgAdd.src = urlimage + "forward-disabled.png";
    imgAddAll.src = urlimage + "forward-all.png";
    imgDelete.src = urlimage + "back-disabled.png";
    imgDeleteAll.src = urlimage + "back-all-disabled.png";
    imgUp.src = urlimage + "up-disabled.png";
    imgDown.src = urlimage + "down-disabled.png";
    
    imgAddAll.addEventListener("click", EzWebExt.bind(addListAll, context), false);
    
    document.getElementById("centerLeftBox" + context.key).innerHTML = "";
    document.getElementById("rightBox" + context.key).innerHTML = "";
    document.getElementById("centerLeftBox" + context.key).appendChild(imgAddAll);
    document.getElementById("centerLeftBox" + context.key).appendChild(imgAdd);
    document.getElementById("centerLeftBox" + context.key).appendChild(imgDelete);
    document.getElementById("centerLeftBox" + context.key).appendChild(imgDeleteAll);
    document.getElementById("rightBox" + context.key).appendChild(imgUp);
    document.getElementById("rightBox" + context.key).appendChild(imgDown);
	
	
}

/*
 * ELIMINA UN ELEMENTO DE LA LISTA DE SELECCION DE LA DERECHA AÑADIENDOLO SI ES NECESARIO
 * EN LA LISTA DE LA IZQUIERDA EN LA PESTAÑA DE SEGUIMIENTO
 */
function removeListFollowUp(){
    var context = this;
    var tab = panelSettings.getTabByIndex(tabsIndexSettings[context.key]);
	var left = tab.__context["left"];
    var right = tab.__context["right"];
	var ids = tab.__context["listLeftInit"];
    var listLeft = tab.__context["listLeft"];
    var listRight = tab.__context["listRight"];
    var divLeft = document.getElementById("leftBox" + context.key);
    var divCenterRight = document.getElementById("centerRightBox" + context.key);
       
    var elementsSelected = right.getSelection();
    if (elementsSelected.length <= 0) 
        return;
    
    var listAuxLeft = [];
    var listAuxRight = [];
    
    for (var i = 0; i < ids.length; i++) {
        if (inList(ids[i][0], listLeft, 1)) 
            listAuxLeft[listAuxLeft.length] = ids[i];
        else {
            if (inList(ids[i][0], elementsSelected, 0)) 
                listAuxLeft[listAuxLeft.length] = ids[i];
        }
    }
    
    for (var i = 0; i < listRight.length; i++) {
        if (!inList(listRight[i][0], elementsSelected, 0)) 
            listAuxRight[listAuxRight.length] = listRight[i];
    }
    
    listLeft = listAuxLeft;
    listRight = listAuxRight;
    left = new StyledElements.StyledList({
        full: true,
        multivalued: true,
        onChange: null
    });
    right = new StyledElements.StyledList({
        full: true,
        multivalued: true,
        onChange: null
    });
    // Evento que desabilita el boton de añadir cuando no hay selección
    left.addEventListener("change", EzWebExt.bind(enableButtonsLeft, context));
    // Evento que desabilita el boton de eliminar cuando no hay selección
    right.addEventListener("change", EzWebExt.bind(enableButtonsRight, context));
    divCenterRight.innerHTML = "";
    divLeft.innerHTML = "";
    left.addEntries(listLeft);
    //left.select(elementsSelected);
    right.addEntries(listRight);
    left.insertInto(divLeft);
    right.insertInto(divCenterRight);
    
    tab.__context["listRight"] = listRight;
    tab.__context["listLeft"] = listLeft;
    tab.__context["right"] = right;
    tab.__context["left"] = left;
    
    var imgAdd = document.createElement("img");
    var imgDelete = document.createElement("img");
    var imgAddAll = document.createElement("img");
    var imgDeleteAll = document.createElement("img");
    var imgUp = document.createElement("img");
    var imgDown = document.createElement("img");
    
    imgAdd.setAttribute("class", "imgAdd" + context.key);
    imgAddAll.setAttribute("class", "imgAddAll" + context.key);
    imgDelete.setAttribute("class", "imgDelete" + context.key);
    imgDeleteAll.setAttribute("class", "imgDeleteAll" + context.key);
    imgUp.setAttribute("class", "imgUp" + context.key);
    imgDown.setAttribute("class", "imgDown" + context.key);
    
    imgAdd.src = urlimage + "forward-disabled.png";
    imgAddAll.src = urlimage + "forward-all.png";
    imgDelete.src = urlimage + "back-disabled.png";
    imgDeleteAll.src = urlimage + "back-all-disabled.png";
    imgUp.src = urlimage + "up-disabled.png";
    imgDown.src = urlimage + "down-disabled.png";
    
    imgAddAll.addEventListener("click", EzWebExt.bind(addListAll, context), false);
    
    if (listRight.length > 0) {
        imgDeleteAll.src = urlimage + "back-all.png";
        imgDeleteAll.addEventListener("click", EzWebExt.bind(removeListAllFollowUp, context), false);
    }
    
    document.getElementById("centerLeftBox" + context.key).innerHTML = "";
    document.getElementById("rightBox" + context.key).innerHTML = "";
    document.getElementById("centerLeftBox" + context.key).appendChild(imgAddAll);
    document.getElementById("centerLeftBox" + context.key).appendChild(imgAdd);
    document.getElementById("centerLeftBox" + context.key).appendChild(imgDelete);
    document.getElementById("centerLeftBox" + context.key).appendChild(imgDeleteAll);
    document.getElementById("rightBox" + context.key).appendChild(imgUp);
    document.getElementById("rightBox" + context.key).appendChild(imgDown);
}


/*
 * SALVA LAS PREFERENCIAS DE USUARIO
 */
function savePreferences(){
    var tab0 = panelSettings.getTabByIndex(tabsIndexSettings["MarketEnterprise"]);
    var tab1 = panelSettings.getTabByIndex(tabsIndexSettings["EnterpriseInformation"]);
	var tab2 = panelSettings.getTabByIndex(tabsIndexSettings["FollowUp"]);
    //var tab2 = panelSettings.getTabByIndex(1);
    
    // Salvamos las preferencias de la primera pestaña
    var listRight = tab0.__context["listRight"];
    dictPreferences = {}
    var listAux = ['n', 's'];
    
    for (var i = 0; i < listRight.length; i++) 
        listAux[listAux.length] = listRight[i][0];
    
    dictPreferences["list"] = listAux;
    
    // Salvamos las preferencias de la segunda pestaña
    var listRight = tab1.__context["listRight"];
    var listAux = ['n', 's'];
    
    for (var i = 0; i < listRight.length; i++) 
        listAux[listAux.length] = listRight[i][0];
    
	dictPreferences["enterprise"] = listAux;
	
	var listRight = tab2.__context["listRight"];
	var listAux = [];
	
	for(var i=0; i < listRight.length; i++)
		listAux[listAux.length] = listRight[i][0];
	
 	dictPreferences["followUp"] = listAux;
    preferences.set(to_json(dictPreferences));
    
	var currentTab = panelMain.getTabByIndex(0);
	currentTab["__context"] = {};
	currentTab.__context["type"] = 1;
	currentTab.__context["symbols"] = dictPreferences.followUp;
	currentTab.__context["tags"] = dictPreferences.list;
	
    // Volvemos a la pantalla principal
    displayAlternativeInfo();
}

/*
 * CANCELA LAS PREFERENCIAS DE USUARIO
 */
function cancelPreferences(){
    panelSettings = new StyledElements.StyledNotebook({
        'id': 'panelSettings'
    });
    displayAlternativeInfo();
}

/*
 * AÑADE A SEGUIMIENTO UNA EMPRESA
 */
function addFollowUp()
{
	var context = this;
	var preferencesAux = eval('('+ preferences.get() + ')');
	var list = preferencesAux.followUp;
	list[list.length]=context.symbol;
	
	var img = context.image;
	img.src = urlimage + "remove.png";
	img.setAttribute("title", BolsaGadget.getTranslatedLabel("removeToFollowUp"));
	img.removeEventListener("click", EzWebExt.bind(addFollowUp, context), false);
	img.addEventListener("click", EzWebExt.bind(removeFollowUp, context), false);
	
	preferencesAux.followUp = list;
	preferences.set(to_json(preferencesAux));
	panelSettings = new StyledElements.StyledNotebook({
        'id': 'panelSettings'
    });
    
	//if(preferencesAux.followUp.length > 0){
	var currentTab = panelMain.getTabByIndex(0);
	currentTab["__context"] = {};
	currentTab.__context["type"] = 1;
	currentTab.__context["symbols"] = preferencesAux.followUp;
	currentTab.__context["tags"] = preferencesAux.list;
	refresh(currentTab.__context.type, currentTab.__context.symbols, currentTab.__context.tags, 0);
	//}	
}


/*
 * ELIMINA EL SEGUIMIENTO DE UNA EMPRESA 
 */
function removeFollowUp()
{
	var context = this;
	var preferencesAux = eval('('+ preferences.get() + ')');
	var list = preferencesAux.followUp;
	var listAux = []
	
	for(var i=0; i < list.length; i++)
	{
		if(list[i] != context.symbol)
			listAux[listAux.length] = list[i];		
	}
	
	var img = context.image;
	img.src = urlimage + "add.png";
	img.removeEventListener("click", EzWebExt.bind(removeFollowUp, context), false);
	img.addEventListener("click", EzWebExt.bind(addFollowUp, context), false);
	img.setAttribute("title", BolsaGadget.getTranslatedLabel("addToFollowUp"));
		
	preferencesAux.followUp = listAux;
	preferences.set(to_json(preferencesAux));
	panelSettings = new StyledElements.StyledNotebook({
        'id': 'panelSettings'
    });
    
	if(preferencesAux.followUp.length > 0){
		var currentTab = panelMain.getTabByIndex(0);
		currentTab["__context"] = {};
		currentTab.__context["type"] = 1;
		currentTab.__context["symbols"] = preferencesAux.followUp;
		currentTab.__context["tags"] = preferencesAux.list;
		refresh(currentTab.__context.type, currentTab.__context.symbols, currentTab.__context.tags, 0);
	}	
	// OCULTAMOS LA PESTAÑA DE SEGUIMIENTO
	//displayAlternativeInfo();
}

function closeSettingsImage(){
	var context = this;
	var img = context.image;
	img.src = urlimage + "open-details.png";
	img.title = BolsaGadget.getTranslatedLabel("show");
	img.removeEventListener("click", EzWebExt.bind(closeSettingsImage, context), false);
	img.addEventListener("click", EzWebExt.bind(openSettingsImage, context), false);
	context.settings.style.display = "none";
}

function openSettingsImage(){
	var context = this;
	var img = context.image;
	img.src = urlimage + "close-details.png";
	img.title = BolsaGadget.getTranslatedLabel("hidden");
	img.removeEventListener("click", EzWebExt.bind(openSettingsImage, context), false);
	img.addEventListener("click", EzWebExt.bind(closeSettingsImage, context), false);
	context.settings.style.display = "block";
}
/*
 * CREA LAS PESTAÑAS DE SELECCION DE PREFERENCIAS PARA LA INFORMACIÓN DE MERCADOS Y EMPRESAS
 */
function createTabSettings(key){

    if (key == "MarketEnterprise") {
        var currentTab = panelSettings.getTabByIndex(0);
        currentTab.clear();
        var preferencesAux = eval('(' + preferences.get() + ')');
        var listAux = preferencesAux.list;
        // PRIMERA PESTAÑA 
        var ids = ['a', 'a2', 'b', 'b4', 'b6', 'c', 'c1', 'd', 'd2', 'e1', 'e7', 'e8', 'f6', 'g', 'h', 'j', 'k', 'j4', 'k3', 'l', 'l1', 'm3', 'm4', 'n', 'o', 'p', 'p2', 'p5', 'p6', 'q', 's', 's1', 's7', 't1', 't6', 't7', 't8', 'v', 'x', 'y'];
        
    }
    else {
        var currentTab = panelSettings.getTabByIndex(1);
        currentTab.clear();
        var preferencesAux = eval('(' + preferences.get() + ')');
        var listAux = preferencesAux.enterprise;
        
        var ids = ['a', 'a2', 'a3', 'b', 'b2', 'b3', 'b4', 'b6', 'c', 'c1', 'c3', 'c6', 'c8', 'd', 'd1', 'd2', 'e', 'e1', 'e7', 'e8', 'e9', 'f6', 'g', 'h', 'j', 'k', 'g1', 'g3', 'g4', 'g5', 'i', 'i5', 'j1', 'j3', 'j4', 'j5', 'j6', 'k1', 'k2', 'k3', 'k4', 'k5', 'l', 'l1', 'l2', 'l3', 'm', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'n', 'n4', 'o', 'p', 'p1', 'p2', 'p5', 'p6', 'q', 'r', 'r1', 'r2', 'r5', 'r6', 'r7', 's', 's1', 's7', 't1', 't7', 't8', 'v', 'v7', 'w', 'w1', 'w4', 'x', 'y'];
    }
    
    
    
    var left = new StyledElements.StyledList({
        full: true,
        multivalued: true,
        onChange: enableButtonsLeft
    });
    var right = new StyledElements.StyledList({
        full: true,
        multivalued: true,
        onChange: enableButtonsRight
    });
    
    var divRight = document.createElement("div");
    var divCenterRight = document.createElement("div");
    var divCenterLeft = document.createElement("div");
    var divLeft = document.createElement("div");
    
    var context = {
        "key": key
    }
    
    divRight.setAttribute("class", "rightBox");
    divCenterRight.setAttribute("class", "centerRightBox");
    divCenterLeft.setAttribute("class", "centerLeftBox");
    divLeft.setAttribute("class", "leftBox");
    
    divLeft.id = "leftBox" + context.key;
    divCenterLeft.id = "centerLeftBox" + context.key;
    divCenterRight.id = "centerRightBox" + context.key;
    divRight.id = "rightBox" + context.key;
    
    // Evento que desabilita el boton de añadir cuando no hay selección
    left.addEventListener("change", EzWebExt.bind(enableButtonsLeft, context));
    // Evento que desabilita el boton de eliminar cuando no hay selección
    right.addEventListener("change", EzWebExt.bind(enableButtonsRight, context));
    
    var imgAddAll = document.createElement("img");
    var imgAdd = document.createElement("img");
    var imgDelete = document.createElement("img");
    var imgDeleteAll = document.createElement("img");
    
    imgDelete.src = urlimage + "back-disabled.png";
    imgAdd.src = urlimage + "forward-disabled.png";
    imgAddAll.src = urlimage + "forward-all-disabled.png";
    imgDeleteAll.src = urlimage + "back-all-disabled.png";
    
    //	imgAddAll.addEventListener("click", EzWebExt.bind(addListAll, context), false);
    //	imgAdd.addEventListener("click", EzWebExt.bind(addList, context), false);
    //	imgDelete.addEventListener("click", EzWebExt.bind(removeList, context), false);
    //	imgDeleteAll.addEventListener("click", EzWebExt.bind(removeListAll, context), false);
    
    divCenterLeft.appendChild(imgAddAll);
    divCenterLeft.appendChild(imgAdd);
    divCenterLeft.appendChild(imgDelete);
    divCenterLeft.appendChild(imgDeleteAll);
    
    var imgUp = document.createElement("img");
    var imgDown = document.createElement("img");
    
    imgUp.src = urlimage + "up-disabled.png";
    imgDown.src = urlimage + "down-disabled.png";
    //	imgUp.addEventListener("click", EzWebExt.bind(upList, context), false);
    //	imgDown.addEventListener("click", EzWebExt.bind(downList, context), false);
    //	
    divRight.appendChild(imgUp);
    divRight.appendChild(imgDown);
    
    left.insertInto(divLeft);
    right.insertInto(divCenterRight);
    
    // Inicializamos la lista de elementos derecha e izquierda	
    listRight = [];
    var nElements = 0;
    for (var i = 0; i < listAux.length; i++) {
        if ((listAux[i] != "n") && (listAux[i] != "s")) {
            listRight[nElements] = [listAux[i], BolsaGadget.getTranslatedLabel(listAux[i])];
            nElements++;
        }
    }
    
    listLeft = [];
    var nElements = 0;
    for (var i = 0; i < ids.length; i++) {
        if (!inList(ids[i], listAux, 0)) {
            listLeft[nElements] = [ids[i], BolsaGadget.getTranslatedLabel(ids[i])];
            nElements++;
        }
    }
    
		if (listLeft.length > 0)
	{
		imgAddAll.src = urlimage+"forward-all.png";
		imgAddAll.addEventListener("click",EzWebExt.bind(addListAll, context), false);
	}
	
	if (listRight.length > 0) {
		imgAddAll.src = urlimage + "back-all.png";
		imgAddAll.addEventListener("click", EzWebExt.bind(removeListAll, context), false);
	}

	
    left.addEntries(listLeft);
    right.addEntries(listRight);
    
    divSettingsContentTab = document.createElement("div")
    divSettingsContentTab.id = "tab" + context.key;
    
    divSettingsContentTab.appendChild(divLeft);
    divSettingsContentTab.appendChild(divCenterLeft);
    divSettingsContentTab.appendChild(divCenterRight);
    divSettingsContentTab.appendChild(divRight);
    
    currentTab.appendChild(divSettingsContentTab);
    currentTab["__context"] = {
        "left": left,
        "right": right,
        "listLeft": listLeft,
        "listRight": listRight
    };
}

/*
 *	FUNCION QUE CREA LA PESTAÑA DE OPCIONES PARA EL SEGUIMIENTO DE EMPRESAS
 */
function createTabFollowUp(){
    var context = {"key": "FollowUp"}
    var currentTab = panelSettings.getTabByIndex(tabsIndexSettings[context.key]);
	currentTab["__context"] = {};
    var divFollowUp = document.createElement("div");
    
    var market = new StyledElements.StyledList({
        full: true,
        multivalued: false,
        onChange: null
    });
    var enterprise = new StyledElements.StyledList({
        full: true,
        multivalued: false,
        onChange: null
    });
    var enterpriseSelected = new StyledElements.StyledList({
        full: true,
        multivalued: false,
        onChange: null
    });
    
    // creamos los contenedores de las listas
    var divMarket = document.createElement("div");
    var divLeft = document.createElement("div");
    var divCenterLeft = document.createElement("div");
    var divCenterRight = document.createElement("div");
    var divRight = document.createElement("div");
    
    market.insertInto(divMarket);
    enterprise.insertInto(divLeft);
    enterpriseSelected.insertInto(divCenterRight);
	
	//market.addEventListener("change",EzWebExt.bind(enableButtonsLeft,context),false);
	enterprise.addEventListener("change",EzWebExt.bind(enableButtonsLeft,context));
	enterpriseSelected.addEventListener("change",EzWebExt.bind(enableButtonsRight,context));
    
    divMarket.setAttribute("class", "boxMarket")
    divLeft.setAttribute("class", "boxFollowUpLeft");
    divCenterLeft.setAttribute("class", "boxFollowUpCenterLeft");
    divCenterRight.setAttribute("class", "boxFollowUpCenterRight");
    divRight.setAttribute("class", "boxFollowUpRight");
    
    divMarket.id = "boxMarket";
    divLeft.id = "leftBox" + context.key;
    divCenterLeft.id = "centerLeftBox" + context.key;
    divCenterRight.id = "centerRightBox" + context.key;
    divRight.id = "rightBox" + context.key;
    
    var imgAddAll = document.createElement("img");
    var imgAdd = document.createElement("img");
    var imgDelete = document.createElement("img");
    var imgDeleteAll = document.createElement("img");
    
    imgDelete.src = urlimage + "back-disabled.png";
    imgAdd.src = urlimage + "forward-disabled.png";
    imgAddAll.src = urlimage + "forward-all-disabled.png";
    imgDeleteAll.src = urlimage + "back-all-disabled.png";
    
    //	imgAddAll.addEventListener("click", EzWebExt.bind(addListAll, context), false);
    //	imgAdd.addEventListener("click", EzWebExt.bind(addList, context), false);
    //	imgDelete.addEventListener("click", EzWebExt.bind(removeList, context), false);
    //	imgDeleteAll.addEventListener("click", EzWebExt.bind(removeListAll, context), false);
    
    divCenterLeft.appendChild(imgAddAll);
    divCenterLeft.appendChild(imgAdd);
    divCenterLeft.appendChild(imgDelete);
    divCenterLeft.appendChild(imgDeleteAll);
    
    var imgUp = document.createElement("img");
    var imgDown = document.createElement("img");
    
    imgUp.src = urlimage + "up-disabled.png";
    imgDown.src = urlimage + "down-disabled.png";
    //	imgUp.addEventListener("click", EzWebExt.bind(upList, context), false);
    //	imgDown.addEventListener("click", EzWebExt.bind(downList, context), false);
    //	
    divRight.appendChild(imgUp);
    divRight.appendChild(imgDown);
    
    divFollowUp.appendChild(divMarket);
    divFollowUp.appendChild(divLeft);
    divFollowUp.appendChild(divCenterLeft);
    divFollowUp.appendChild(divCenterRight);
    divFollowUp.appendChild(divRight);
    currentTab.appendChild(divFollowUp);
    
    var marketsList = ["^IBEX", "^IBEXC", "^FTSE", "^GDAXI", "^FCHI", "^SPMIB", "^DJI", "^IXIC", "^HXC"];
	
	var preferencesAux = eval('(' + preferences.get() + ')');
    var listAux = preferencesAux.followUp;
    getNamesMarkets(marketsList);
	
	currentTab.__context["listLeft"] = [];
	currentTab.__context["listRight"] = [];
	currentTab.__context["left"] = enterprise;
	currentTab.__context["right"] = enterpriseSelected;
	
	if (listAux.length > 0)
		getNamesEnterprisesSelected(listAux);
}

/*
 * MUESTRA EL NOMBRE DE LOS MERCADOS
 */
function displayNameMarket(info){
	
	var tab = panelSettings.getTabByIndex(tabsIndexSettings["FollowUp"]);
	    
    var market = new StyledElements.StyledList({
        full: true,
        multivalued: false,
        onChange: null
    });
	
	// Diccionario con la correlación simbolo - mercado
	marketSymbolsName = {};
	for(var i=0; i < info.length; i++)
		marketSymbolsName[info[i][0]] = info[i][1];
		
    market.addEntries(info);
    market.addEventListener("change", getNamesEnterprises);
    document.getElementById("boxMarket").innerHTML = "";
    market.insertInto(document.getElementById("boxMarket"));
	market.select([info[0][0]]);
	tab.__context["market"]=market;
    removeLoadingImage();
}

/*
 * MUESTRA EL NOMBRE DE LAS EMPRESAS EN LISTADO DE LA IZQUIERDA SI ESTOS NO HAN SIDO SELECCIONADOS
 */
function displayNameEnterprise(marketSelected, info){
	
	var tab = panelSettings.getTabByIndex(tabsIndexSettings["FollowUp"]);
	//tab.__context["marketSelected"] = marketSelected;
	var listRight = tab.__context["listRight"];
	
    var context = {
        "key": "FollowUp"
    }
    var enterprise = new StyledElements.StyledList({
        full: true,
        multivalued: true,
        onChange: null
    });
	
	var preferencesAux = eval("("+preferences.get()+")");
	var listSelected = preferencesAux.followUp;
	var listLeft = [];
	var listLeftInit = [];
	
	for (var i = 0; i < info.length; i++) {
		if((!inList(info[i][0], listRight, 1)) && (!(inList(info[i][0], listSelected, 0))))
			listLeft[listLeft.length] = info[i];
		listLeftInit[listLeftInit.length] = info[i];
	}
	
	var currentTab = panelSettings.getTabByIndex(tabsIndexSettings["FollowUp"]);
	var divCenterLeft = document.getElementById("centerLeftBox"+context.key);
	var imgAddAll = document.createElement("img");
    var imgAdd = document.createElement("img");
    var imgDelete = document.createElement("img");
    var imgDeleteAll = document.createElement("img");
    
    imgDelete.src = urlimage + "back-disabled.png";
    imgAdd.src = urlimage + "forward-disabled.png";
    imgAddAll.src = urlimage + "forward-all.png";
    imgDeleteAll.src = urlimage + "back-all-disabled.png";
    
    if(listLeft.length > 0)
	{
		imgAddAll.src = urlimage + "forward-all.png";
    	imgAddAll.addEventListener("click", EzWebExt.bind(addListAll, context), false);
	}
	
	if(currentTab.__context.listRight.length > 0)
	{
		imgDeleteAll.src = urlimage + "back-all.png";
    	imgDeleteAll.addEventListener("click", EzWebExt.bind(removeListAllFollowUp, context), false);
	}
	
	divCenterLeft.innerHTML = "";
    divCenterLeft.appendChild(imgAddAll);
    divCenterLeft.appendChild(imgAdd);
    divCenterLeft.appendChild(imgDelete);
    divCenterLeft.appendChild(imgDeleteAll);
	
	enterprise.addEntries(listLeft);	
    enterprise.addEventListener("change", EzWebExt.bind(enableButtonsLeft, context));
	tab.__context["listLeft"]=listLeft;
	tab.__context["listLeftInit"] = listLeftInit;
	tab.__context["left"] = enterprise;
    document.getElementById("leftBox" + context.key).innerHTML = "";
    enterprise.insertInto(document.getElementById("leftBox"+context.key));
    removeLoadingImage();
}


/*
 * MUESTRA EL NOMBRE DE LAS EMPRESAS EN LISTADO DE LA IZQUIERDA SI ESTOS NO HAN SIDO SELECCIONADOS
 */
function displayNameEnterpriseSelected(info){
	
	var tab = panelSettings.getTabByIndex(tabsIndexSettings["FollowUp"]);
	//tab.__context["marketSelected"] = marketSelected;
	var listRight = tab.__context["listRight"];
	
    var context = {
        "key": "FollowUp"
    }
    var enterpriseSelected = new StyledElements.StyledList({
        full: true,
        multivalued: true,
        onChange: null
    });
	
	var listRight = [];
		
	for (var i = 0; i < info.length; i++) {
		if(!inList(info[i][0], listRight, 1))
			listRight[listRight.length] = info[i];
	}
	
	enterpriseSelected.addEntries(listRight);	
    enterpriseSelected.addEventListener("change", EzWebExt.bind(enableButtonsRight, context));
	tab.__context["listRight"] = listRight;
	tab.__context["right"] = enterpriseSelected;
    document.getElementById("centerRightBox" + context.key).innerHTML = "";
    enterpriseSelected.insertInto(document.getElementById("centerRightBox"+context.key));
    removeLoadingImage();
	
	var currentTab = panelSettings.getTabByIndex(tabsIndexSettings["FollowUp"]);
	var divCenterLeft = document.getElementById("centerLeftBox"+context.key);
	var imgAddAll = document.createElement("img");
    var imgAdd = document.createElement("img");
    var imgDelete = document.createElement("img");
    var imgDeleteAll = document.createElement("img");
    
    imgDelete.src = urlimage + "back-disabled.png";
    imgAdd.src = urlimage + "forward-disabled.png";
    imgAddAll.src = urlimage + "forward-all.png";
    imgDeleteAll.src = urlimage + "back-all-disabled.png";
    
    if(listRight.length > 0)
	{
		imgDeleteAll.src = urlimage + "back-all.png";
    	imgDeleteAll.addEventListener("click", EzWebExt.bind(removeListAllFollowUp, context), false);
	}
	
	if(currentTab.__context.listLeft.length > 0)
	{
		imgAddAll.src = urlimage + "forward-all.png";
    	imgAddAll.addEventListener("click", EzWebExt.bind(addListAll, context), false);		
	}
	
	divCenterLeft.innerHTML = "";
    divCenterLeft.appendChild(imgAddAll);
    divCenterLeft.appendChild(imgAdd);
    divCenterLeft.appendChild(imgDelete);
    divCenterLeft.appendChild(imgDeleteAll);
}


/*
 * FUNCTIONES MISCELANEAS
 */
function addLoadingImage(){
    removeLoadingImage();
    var body = document.getElementsByTagName("body")[0];
    var background = document.createElement('div');
    background.id = "loading_background";
    
    background.addEventListener("click", function(e){
        e = e ? e : window.event;
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        else {
            e.cancelBubble = true;
        }
        return false;
    }, false);
    
    // cancels the call to startdrag function
    body.appendChild(background);
    var image = document.createElement('img');
    image.id = "loading_image";
    image.setAttribute('src', urlimage + 'ajax-loader.gif');
    background.appendChild(image);
}

function removeLoadingImage(){
    var body = document.getElementsByTagName("body")[0];
    var background = document.getElementById("loading_background");
    if (background != null) 
        body.removeChild(background);
}

function addTitle(word){
    var maxSize = 15;
    if (word.length > maxSize) {
        word = word.substring(0, maxSize - 4) + "...";
    }
    return word;
}

function to_json(object){
    return JSON.stringify(object, function(key, value){
        return value;
    });
}

