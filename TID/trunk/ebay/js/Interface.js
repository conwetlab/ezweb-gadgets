
var notebook = new StyledElements.StyledNotebook({'id':'notebook'}, {'initiallyVisible': true});
var msg = 0;
var usd = new Array();

var tabArray = new Array(); 



usd["15"] = "AUD";
usd["16"] = "€";
usd["2"] = "C$";
usd["71"] = "€";
usd["77"] = "€";
usd["203"] = "Rs";
usd["101"] = "€";
usd["146"] = "fl";
usd["186"] = "€";
usd["193"] = "CHF";
usd["3"] = "£";
usd["0"] = "$";


/*EbayGadget constructor*/
var EbayGadget = function() {
    /* Call to the parent constructor */
    EzWebGadget.call(this, {translatable: false});
    this.siteIdValue = EzWebAPI.createRGadgetVariable("siteId", EzWebExt.bind(this.changeSite, this));
    this.howmanyresultsValue = EzWebAPI.createRGadgetVariable("howmanyresults", EzWebExt.bind(this.changeResults, this));
    this.keyword = EzWebAPI.createRGadgetVariable("keyword", EzWebExt.bind(this.searchKeyword, this));
    this.itemName = EzWebAPI.createRWGadgetVariable("name");
    this.itemTitle = EzWebAPI.createRWGadgetVariable("title");
    this.itemBid = EzWebAPI.createRWGadgetVariable("bid");
    this.itemImage = EzWebAPI.createRWGadgetVariable("image");
    this.wordSearch = EzWebAPI.createRWGadgetVariable("wordSearch");
}

EbayGadget.prototype = new EzWebGadget(); /* Extend from EzWebGadget */

EbayGadget.prototype.resourcesURL = "http://demo.ezweb.morfeo-project.org/repository/ebay/"; 

EbayGadget.prototype.setItemTitle = function(value){
    this.itemTitle.set(value);
}

EbayGadget.prototype.setItemBid = function(value){
    this.itemBid.set(value);
}

EbayGadget.prototype.setItemImage = function(value){
    this.itemImage.set(value);
}

EbayGadget.prototype.changeResults = function(){
    this.ebay.setMaxEntries();
    this.ebay.repaint();
}

EbayGadget.prototype.changeSite = function(){
    this.ebay.setSite();
}

EbayGadget.prototype.searchKeyword = function(){
    this.setInput();
    goSearchInputText();
}
    
EbayGadget.prototype.init = function() {

    /*Crate the main structure*/
    var topPanel = document.createElement ('div');
    topPanel.setAttribute ('id', 'topPanel');
    
    bottomPanel = document.createElement ('div');
    bottomPanel.setAttribute ('id', 'bottomPanel');

    finalPanel = document.createElement ('div');
    finalPanel.setAttribute ('id', 'finalPanel');

    input = document.createElement ('input');
    input.setAttribute ('id', 'text_search');
    input.setAttribute ('class', 'text_field');
    input.setAttribute ('type', 'text');
    input.setAttribute ('autocomplete', 'on');
    input.setAttribute ('onkeypress', "onReturn (event, goSearchInputText);");
    

    var button = document.createElement('button');
    button.setAttribute ('id', 'search-button');
    button.setAttribute ('title', 'Search');
    button.addEventListener ('click', function(){
	    goSearchInputText();
	}, false);
    button.appendChild (document.createTextNode('Search'));

    topPanel.appendChild(input);
    topPanel.appendChild(button);

    document.body.appendChild(topPanel);
    document.body.appendChild(bottomPanel);
    document.body.appendChild(finalPanel);

    notebook.insertInto(document.getElementById('bottomPanel'));
    
    com.ebay.widgets.needs({
	    baseUrl: 'http://w-1.ebay.com/js/587/min/',
	    files:['GetSingleItem.js', 'FindItems.js'],	
	    resources: [].concat(com.ebay.shoppingservice.Shopping.getSingleItem, com.ebay.shoppingservice.Shopping.findItems),
	    callback:
	    EzWebExt.bind(function() {		
		imgPath = 'http://w-1.ebay.com/images/';
		image = 'http://w-1.ebay.com/images/stockimage1.jpg';
		this.goSearch({g_queryKeywords: "wii"});
		}, this)
	});
	this.searchKeyword(this.wordSearch.get());

}

EbayGadget.prototype.setInput = function() {
    input.value = this.keyword.get();
    this.wordSearch.set(input.value);
}

/**
 * Search items with the seller or keyword 
 * @param {Object} params
 */
EbayGadget.prototype.goSearch = function(params) {
    input.setAttribute('disabled', true);
    var keyword = null;
    if (params) {
	keyword = params.g_queryKeywords;
    }
    
    var props = {};
    props["appId"] = "TIDba44fe-401f-4801-8ba8-79db5b774c7" ;
    props["siteId"] = this.siteIdValue.get();
    	 
    var config = new com.ebay.shoppingservice.ShoppingConfig(props);

    this.ebay = new Ebay({config:config, keyword: keyword});
    this.itemName.set(keyword);
    this.ebay.findItems();
}
    
EbayGadget.prototype.languageCallback = function(newLang) {
	EzWebGadget.prototype.languageCallback.call(this, newLang);

}

EbayGadget.prototype.getResults = function(){
	return this.howmanyresultsValue.get();
}

EbayGadget.prototype.getSite = function(){
	return this.siteIdValue.get();
}


/* Instanciate the Gadget class */
EbayGadget = new EbayGadget();



/************************************************************/
/*               Ebay class                                 */
/************************************************************/


/**
 * container class for all panels
 * @constructor
 * @param {Object} props, includes keyword or seller id, appId, affiliate tracking information, etc
 */
function Ebay (props) {
	/**
	 * config object includes keyword or seller id, appId, affiliate tracking information, etc
	 * @type Object
	 */
	this.config = props.config;
	/**
	 * seller id for search
	 * @type String
	 */
	this.seller = props.seller;
	/**
	 * keyword for search
	 * @type String
	 */
	this.keyword = props.keyword;
	/**
	 * number of items to show in each page
	 * @type int
	 */
	this.maxEntries = EbayGadget.getResults();

	this.setMaxEntries = function() {
	    this.maxEntries = EbayGadget.getResults();
	}
	/**
	 * Ebay site 
	 * @type int
	 */
	this.site = EbayGadget.getSite();

	this.setSite = function() {
	    this.site= EbayGadget.getSite();
	}
	/**
	 * number of items that are going to be retrived
	 * @type int
	 */
	this.maxResults = 30;
	
	/**
	 * current page number
	 * @type int
	 */
	this.currentPage = 1;
	
	/**
	 * storing ids of items
	 * @type Array
	 */	
	this.ids = new Array();
	/**
	 * storing items for display
	 * @type Array
	 */
	this.items = new Array();
	/**
	 * index of the array items
	 **/
	this.index = 0;

	
	/**
	 * get gallery url of the item 
	 * @param {SimpleItemType} item
	 * @return {String}, gallery url
	 */	
	this.getGalleryURL = function(item) {
		var gallery = item.galleryURL;
    		
		if (typeof(gallery) == "undefined")
        		gallery = image;
		return gallery;
	}
	/**
	 * get picture of the item
	 * @param {SimpleItemType} item
	 * @return {String}, picture url
	 */	
	this.getPicture = function(item) {
		var picture = item.pictureURL;
    	
		if (typeof(picture) != "undefined") {    
			var loc = picture.toString().search(/[,]/);
			if (loc > 1)
			    picture = picture.toString().slice(0,loc);   
	    	}
	    	if (typeof(picture) == "undefined")
			picture = image;
		return picture;
	}
	

	/**
	 * Create the an item table
	 * @param item
	 * @param block
	 */
	this.getTitleTable = function(item, block) {
	    var table = document.createElement("table");
	    /*First column*/
	    var frow = table.insertRow(0);
	    var frowfcolumn = frow.insertCell(0);	    
	    frowfcolumn.rowSpan="2";
	    
	    var image = document.createElement("img");
	    image.src = this.getGalleryURL(item);
	    image.style.cursor = "pointer";	    
	    image.addEventListener ('click', EzWebExt.bind(function(){
			this.showItemDetails(item);
		    }, this),false);


	
	    var frowscolumn = frow.insertCell(1);	    
	    frowscolumn.colSpan="2";
	    var title = document.createTextNode(eBayUtils.truncate(item.title, 35));

	    /*Second column*/
	    var srow = table.insertRow(1);	    
	    var srowfcolumn = srow.insertCell(0);
	    srowfcolumn.witdth = "80";
	    var startingBid = document.createTextNode("Starting Bid: ");
	    var srowscolumn = srow.insertCell(1);
	    srowscolumn.witdth = "80";
	    var bid = document.createTextNode(item.convertedCurrentPrice.currencyID + usd[""+this.site] + item.convertedCurrentPrice.value.toFixed(2));
	    	    
	    frowfcolumn.appendChild(image);
	    frowscolumn.appendChild(title);
	    srowfcolumn.appendChild(startingBid);
	    srowscolumn.appendChild(bid);
	    block.appendChild(table);
	    
	}
	
	
	/**
	 *Show the details of a product(item)
	 * @param item
	 */
	this.showItemDetails = function(item) {

	    var newtab = notebook.createTab({name: eBayUtils.truncate(item.title, 11)});
	    
	    EbayGadget.setItemTitle(item.title);
	    EbayGadget.setItemBid(usd[""+this.site] + item.convertedCurrentPrice.value.toFixed(2));
	    EbayGadget.setItemImage(this.getGalleryURL(item));

	    var image = document.createElement("img");
	    image.setAttribute('id', 'image');
	    image.src = this.getGalleryURL(item);

	    /*Create the table*/
	    var table = document.createElement("table");
	    table.setAttribute('id','table');
	    /*First row*/
	    var frow = table.insertRow(0);
	    
	    var frowfcolumn = frow.insertCell(0);	    
	    frowfcolumn.colSpan="2";
	    frowfcolumn.width = "220";
	    var title = document.createTextNode(item.title);
    
	    /*Second row*/
	    var srow = table.insertRow(1);	    
	    var srowfcolumn = srow.insertCell(0);
	    srowfcolumn.width = "100";
	    var startingBid = document.createTextNode("Starting Bid: ");
	    var srowscolumn = srow.insertCell(1);
	    
	    var bid = document.createTextNode(usd[""+this.site] + item.convertedCurrentPrice.value.toFixed(2));

	    /*Third row*/
	    var trow = table.insertRow(2);
	    var trowfcolumn = trow.insertCell(0);
	    var itemLocation = document.createTextNode("Item Location: ");
	    var trowscolumn = trow.insertCell(1);	
	    trowscolumn.width = "120";
	    var location = document.createTextNode(item.location);

	    /*Forth row*/
	    var forow = table.insertRow(3);
	    var forowfcolumn = forow.insertCell(0);	    	    
	    var shipsTo = document.createTextNode("Ships to: ");
	    var forowscolumn = forow.insertCell(1);	   
	    var shipsLocations = document.createTextNode(eBayUtils.truncate(item.shipToLocations.join(","), 20));

	    /*Fifth row*/
	    var firow = table.insertRow(4);
	    var firowfcolumn = firow.insertCell(0);	    	    
	    var seller = document.createTextNode("Seller: ");
	    var firowscolumn = firow.insertCell(1);
	    var sellerId = document.createTextNode(eBayUtils.truncate(item.seller.userID, 20));

	    /*Sixth row*/
	    var sirow = table.insertRow(5);
	    var sirowfcolumn = sirow.insertCell(0);	    	    
	    var feedback = document.createTextNode("Feedback: ");
	    var sirowscolumn = sirow.insertCell(1);
	    var feedbackText = document.createTextNode(item.seller.feedbackScore);
	    /*End of the table*/


	    /*Link for bidding*/
	    var anchorImg = document.createElement("img");
	    anchorImg.src = EbayGadget.resourcesURL + 'images/Skybid.gif';
	    anchorImg.border = '0';

	    var anchor = document.createElement('a');
	    anchor.setAttribute('id','anchor');
	    anchor.appendChild(anchorImg);
	    anchor.setAttribute('href', item.viewItemURLForNaturalSearch);
	    anchor.target = '_blank';

	    	    
	    frowfcolumn.appendChild(title);
	    srowfcolumn.appendChild(startingBid);
	    srowscolumn.appendChild(bid);
	    trowfcolumn.appendChild(itemLocation);
	    trowscolumn.appendChild(location);
	    forowfcolumn.appendChild(shipsTo);
	    forowscolumn.appendChild(shipsLocations);
	    firowfcolumn.appendChild(seller);
	    firowscolumn.appendChild(sellerId);
	    sirowfcolumn.appendChild(feedback);
	    sirowscolumn.appendChild(feedbackText);

	    newtab.appendChild(image);
	    newtab.appendChild(table);
	    newtab.appendChild(anchor);

	    notebook.goToTab(newtab.getId());
        
}
	

    /**
     * Display items collected and buttons for navigation
     */
	this.display = function() {

	    input.removeAttribute ('disabled');
	    	
	    /*If there are no results*/
	    if (this.items.length == 0){
		notebook.insertInto(document.getElementById('bottomPanel'));
		var text = document.getElementById('text_search').value;
		if (!text) {
		    text = "welcome";
		}
		mainTab = notebook.createTab({name: text});
		notebook.goToTab(mainTab.getId());
     
		var mesage = document.createTextNode("no item found, please try again!");
		mainTab.appendChild(mesage);
		return;
	    }
	    
	    
	    var text = document.getElementById('text_search').value;
	    if (!text) {
		    text = "welcome";
		}
	    mainTab = notebook.createTab({name: text});
	    /*Insert the new search into the array*/
	    tabArray[text] = mainTab;	    
	    mainTab.addEventListener("close", EzWebExt.bind(function(){
			delete tabArray[text];	
		}, this));	    
	    notebook.goToTab(mainTab.getId());

	    var content = document.createElement('div');
	    content.setAttribute('id', 'content');

	    for(var i=0; i<this.maxEntries; i++) {
		var title = this.getTitleTable(this.items[i], content);
	    }
	    this.index = i;
	    
	    mainTab.appendChild(content);

	    /*Create the buttons div for navigation*/
	    var buttons = document.createElement('div');
	    buttons.setAttribute('id', 'buttons');

	    /*Button to go to the previous page*/
	    var button1 = document.createElement('button');
	    button1.setAttribute ('id', 'prev-button');
	    button1.setAttribute ('disabled', true);
	    button1.setAttribute ('title', 'Go to previous page');
	    imgButton1 = document.createElement('img');
	    imgButton1.src = EbayGadget.resourcesURL + 'images/go-previous.png';
	    button1.style.opacity = 0.5;
	    button1.appendChild(imgButton1);
	    
	    buttons.appendChild(button1);
	    

	    /*Button to go to the next page*/
	    var button2 = document.createElement('button');
	    button2.setAttribute ('id', 'more-button');
	    button2.setAttribute ('title', 'Go to next page');
	    imgButton2 = document.createElement('img');
	    imgButton2.src = EbayGadget.resourcesURL + 'images/go-next.png';
	    button2.style.cursor = "pointer"; 
	    button2.appendChild(imgButton2);;

	    buttons.appendChild(button2);

	    button1.addEventListener ('click', EzWebExt.bind(function(){
			this.displayPrev(content, buttons, button1, button2);
		    }, this),false);

	    button2.addEventListener ('click', EzWebExt.bind(function(){
			this.displayMore(content, buttons, button1, button2);
		    }, this),false);
	    

	    this.displayPages(buttons);

	    mainTab.appendChild(buttons);
	    
	    

	}

	
	/**
	 * Display page number
	 * @param {div} content
	 */
	this.displayPages = function(content) {

	    pags = document.createElement("div");
	    pags.setAttribute('id','pages');
	    var pageNumber = document.createTextNode(this.currentPage + " of " + Math.ceil(this.items.length / parseInt(this.maxEntries)));
	    pags.appendChild(pageNumber);	    
	    content.appendChild(pags);

	}

	/**
	 * Display next items
	 * @param {div} content
	 * @param {div} buttons
	 * @param {button} button1
	 * @param {button} button2
	 */
	this.displayMore = function(content, buttons, button1, button2) {
	    
	    if (this.index < this.items.length){
		removeChildren(content);
		for(var i=this.index; i<(this.index + parseInt(this.maxEntries)) && i<(this.items.length); i++) {
		    this.getTitleTable(this.items[i], content);
		}
		this.index = i;
		this.currentPage++;
		button1.removeAttribute ('disabled');
		button1.style.cursor = "pointer"; 
		button1.style.opacity = 1;
		buttons.removeChild(buttons.lastChild);

		this.displayPages(buttons);

		if (this.index == this.items.length) {
		    button2.setAttribute('disabled', true);
		    button2.style.cursor = "default"; 
		    button2.style.opacity = 0.5;
		}
	    }
	    
	}

	/**
	 * Display previous items
	 * @param {div} content
	 * @param {div} buttons
	 * @param {button} button1
	 * @param {button} button2
	 */
	this.displayPrev = function(content, buttons, button1, button2){
	    if (this.index > this.maxEntries){
		if ((this.index % parseInt(this.maxEntries)) == 0){
		    this.index = this.index - (parseInt(this.maxEntries)*2);
		}
		else {
		    this.index = this.index -(parseInt(this.maxEntries) + (this.index % parseInt(this.maxEntries)))
		}
		if (this.index == 0){
		    button1.setAttribute('disabled', true);
		    button1.style.cursor = "default"; 
		    button1.style.opacity = 0.5;
		}
		removeChildren(content);
		for(var i=this.index; i<(this.index + parseInt(this.maxEntries)); i++) {
		    this.getTitleTable(this.items[i], content);		
		}
		this.index = i;
		this.currentPage--;
		buttons.removeChild(buttons.lastChild);
		this.displayPages(buttons);
		button2.removeAttribute ('disabled');
		button2.style.cursor = "pointer"; 
		button2.style.opacity = 1;		
		
	    }
	    
	}

	this.repaint = function() {
	    removeChildren(bottomPanel);
	    notebook.removeTab(mainTab.getId());
	    this.currentPage = 1;
	    this.index = 0;
	    this.display();
	}

	/**
	 * expand the panel with the specified id, while collapse all other panels
	 * @param {int} id
	 */
	this.toggle = function(id) {
	    
	    for(var i=0; i<this.panels.length; i++) {
		if(this.panels[i].id == id) {
		    this.panels[i].expand();
		} else {
		    this.panels[i].collapse();
		}
	    }
	}
	/**
	 * utility function to show message
	 * @param {String} msg
	 */	
	this.showMsg = function(msg) {
	    this.display();	    
	}
	/**
	 * get search box div
	 */
	this.getSearchBox = function() {
		var search = eBayUtils.createElement("div", {id:'searchBox', align:'center'});
		search.innerHTML = this.getSearchHTML();
		return search;
	}
	

	/**
	 * call FindItems shopping api with keyword as query parameter
	 */
	this.findItems = function (){
	    if (typeof(this.keyword) != "undefined" && this.keyword != "") {
		var service = new com.ebay.shoppingservice.Shopping(this.config);
		var fiRequest = new com.ebay.shoppingservice.FindItemsRequestType({queryKeywords: this.keyword, maxEntries:this.maxResults, itemSort: com.ebay.shoppingservice.SimpleItemSortCodeType.BestMatch});
        	service.findItems(fiRequest, {object: this, success: this.filterResults, failure: this.errorHandler});
    	     }
	}

	/**
	 * error handling functon to show error message
	 * @param {ErrorType} data
	 */	
	this.errorHandler = function(data) {
	    var errorMsg = data[0].longMessage;
	      this.showMsg(errorMsg);
	}

	/**
	 * filter empty or null return
	 * @param {FindItemsResponse} data
	 */
	this.filterResults = function(data) {
		var items = data.item;
		if(typeof(items) == "undefined" || items == null || items.length === 0) {
			this.showMsg("no item found, please try again!");
			return;
		}
	    	for (i=0;i<items.length;i++) {    
			n = items[i]['itemID'];
			this.ids[i] = n;           
	    	}
	    	this.getItems();
	}
	 /**
	 * wating for all items to be received before display
	 * @param {GetItemStatusResponse} data
	 */
	this.preToDispaly = function(data) {
		var item = data.item;
		this.items.push(item);
		if(this.items.length == this.ids.length) {
			this.display();
		}
	}
       /**
        * call GetItemStatus shopping api with previous returned items ids as query parameter
        */
	this.getItems = function () {
	    try {
		for (i=0; i<this.ids.length; i++) {
		    var service = new com.ebay.shoppingservice.Shopping(this.config);
		    var fiRequest = new com.ebay.shoppingservice.GetSingleItemRequestType({ItemID: this.ids[i], IncludeSelector: "Details"});
		    service.getSingleItem(fiRequest, {object: this, success: this.preToDispaly, failure: this.errorHandler});
		}
	    } catch(e) {
		alert(e);
	    }
	}

}



/*********************************************************/
/*                 Aux Functions                         */
/*********************************************************/

/*Get the text to look for before calling goSearch()*/
goSearchInputText = function() {
    var value = document.getElementById('text_search').value;
    this.wordSearch.set(value);
    if (tabArray[value] != undefined) {
	notebook.goToTab(tabArray[value].getId());
    }
    else {
	EbayGadget.goSearch({g_queryKeywords: value});
    }
}



function initSearch(event)
{
    if(event.keyCode == "13")
	{
	    goSearch();
	}
}

function onReturn(event_, handler_){
	if (!event_) 
	    event_ = window.event;
	if (event_ && event_.keyCode && event_.keyCode == 13) 
	    handler_();
}


/*Removes node's chidren*/
function removeChildren(node){
    while (node.hasChildNodes()) {
        node.removeChild(node.firstChild);

    }
}



