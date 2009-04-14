
var URL = "http://demo.ezweb.morfeo-project.org/repository/ChisteDiario";

var Vista = {
init: function() {
	this._body = document.getElementsByTagName('body')[0];

	this._body.style.background = "url("+ URL +"/images/load.gif)"
	this._body.style.backgroundRepeat = 'no-repeat';
	this._body.style.backgroundAttachment = 'fixed';
	this._body.style.backgroundPosition = 'center center';

	this._main = document.createElement('div');
	this._body.innerHTML = "";
	this._body.appendChild(this._main);

	this._main.innerHTML = '\
		<div id="main" style="display:none;">\
		<div id="head">\
			<a target="blank" id="title"></a>\
			<span id="date"></span>\
			<div id="menu">\
				<img src="'+ URL +'/images/fi.gif" id="left" /> \
				<span id="page">1</span>/<span id="pages">1</span>\
				<img src="'+ URL +'/images/fd.gif" id="right" />\
			</div>\
		</div> <!-- head -->\
		<div id="body">\
			<table style="height:100%; margin:0 auto;"><tr><td>\
			<div id="text"></div>\
			<div id="source"><a id="sourceLink"target="blank"></a></div>\
			</td></tr></table>\
		</div> <!-- body -->\
		</div> <!-- main -->\
		<div id="messages"></div>\
	';

	this._main   = document.getElementById('main');

	this._index  = document.getElementById('body');
	this._date   = document.getElementById('date');
	this._title  = document.getElementById('title');
	this._text   = document.getElementById('text');
	this._source = document.getElementById('sourceLink');
	this._msgs   = document.getElementById('messages');
	this._left   = document.getElementById('left');
	this._right  = document.getElementById('right');

	this._menu  = document.getElementById('menu');
	this._page  = document.getElementById('page');
	this._pages = document.getElementById('pages');
},

showMessage: function(type, msg) {
	var box = document.createElement('div');
	box.className = type;
	box.innerHTML = msg;
	this._msgs.appendChild(box);
},

showChiste: function(title, date, text, url, source) {
	this._date.innerHTML  = date.toLocaleDateString();
	this._title.innerHTML = title;
	this._title.href = url;
	this._text.innerHTML  = text;
	this._source.href = source.link;
	this._source.innerHTML = source.name;
},

evUpdate: function(obj) {
	var title  =  obj.getTitle();
	var date   = obj.getDate();
	var text   = obj.getText();
	var source = obj.getSource();
	var url    = obj.getUrl();

	this._page.innerHTML = obj.getNum()+1;
	this._pages.innerHTML = obj.getLength();

	this._left.style.MozOpacity = (obj.getNum() == 0)? 0.1 : 1.0;
	this._right.style.MozOpacity = (obj.getNum()+1 == obj.getLength())? 0.1 : 1.0;

	this._menu.style.display = (obj.getLength() < 2)? 'none': 'block';
	
	this.showChiste(title, date, text, url, source);

	this._main.style.display = 'block';
},

evError: function(obj) {
	this.showMessage('error', 'No se puedo conectar a la fuente')
}

} // END VISTA

function Modelo() {
	this._num_item = 0;
	this._self = this; // Eliminar
}

Modelo.prototype.load = function() {
	
// HACK

	Vista._main.style.display = 'none';

	EzWebAPI.send_get(
		this._source.xml,
		this,
		this._loadSuccess,
		this._loadError );
}

Modelo.prototype._getDOMItem = function() {
	return this._items[this._num_item];
}

Modelo.prototype._getDOMValue = function(value) {
	return this._getDOMItem().getElementsByTagName(value)[0].firstChild.nodeValue
}

Modelo.prototype.getLength = function() {
	return this._items.length;
}

Modelo.prototype.getNum = function() {
	return this._num_item;
},

Modelo.prototype.getTitle = function() {
	return this._getDOMValue('title');
}

Modelo.prototype.getUrl = function() {
	return this._getDOMValue('link');
}

Modelo.prototype.getDate = function() {
	return new Date(Date.parse(this._getDOMValue('pubDate')));
}

Modelo.prototype.getText = function() {
	return this._getDOMValue('description');
},

Modelo.prototype.getSource = function() {
	return this._source
}

Modelo.prototype.first = function() {
	this._num_item = 0;
	this.notifyUpdate();
}

Modelo.prototype.next = function() {
	if (this._num_item < this._items.length-1) {
		this._num_item += 1;
		this.notifyUpdate();
	}
}

Modelo.prototype.last = function() {
	if (this._num_item > 0) {
		this._num_item -= 1;
		this.notifyUpdate();
	}
}

Modelo.prototype.setIntervalReload = function(sec) {
	var self = this;
	this._ireload = window.setInterval(function(){self.load()}, sec * 1000);
}

Modelo.prototype.clearIntervalReload = function() {
	windows.clearInterval(this._ireload);
}

Modelo.prototype.notifyUpdate = function() {
	Vista.evUpdate(this);
}

Modelo.prototype.notifyError = function() {
	Vista.evError(this);
}

Modelo.prototype._loadSuccess = function(request) {
	var xmldoc = request.responseXML;
	this._items = xmldoc.getElementsByTagName('channel')[0].getElementsByTagName('item');
	this.first();
}

Modelo.prototype._loadError = function(error,ex) {
	alert(ex);
	this.notifyError();
}

var ChistesDotCom = function() {
	this._source = { name: 'Chistes.com',
	                 link: 'http://www.chistes.com/',
	                 xml:  'http://www.chistes.com/XML/ChisteDelDia.xml.asp' };
}
ChistesDotCom.prototype = new Modelo();
ChistesDotCom.prototype.getTitle = function() {
	return Modelo.prototype.getTitle.call(this).replace(/^\s*\[.*\]\s*-\s*/,'');
}



var ChisteWebDotCom = function() {
	this._source = { name: 'Chisteweb.com',
	                 link: 'http://www.chisteweb.com/',
	                 xml:  'http://www.chisteweb.com/feed' };
}
ChisteWebDotCom.prototype = new Modelo();
ChisteWebDotCom.prototype.getText = function() {
	return Modelo.prototype.getText.call(this).replace(/\n/g,"<br />");
}


// MAL
var ChistematonDotCom = function() {
	this._source = { name: 'Chistematon.com',
	                 link: 'http://www.chistematon.com/',
	                 xml:  'http://www.chistematon.com/feeds/posts/default?alt=rss' };
}

ChistematonDotCom.prototype = new Modelo();
ChistematonDotCom.prototype.getText = function() {
	return Modelo.prototype._getDOMValue.call(this, 'atom:summary').replace(/\n/g,"<br />");
}

// MAL
var TodochistesDotNet = function() {
	this._source = { name: 'Todochistes.net',
	                 link: 'http://www.todochistes.net/',
	                 xml:  'http://www.todochistes.net/rss.xml' };
}
TodochistesDotNet.prototype = new Modelo();
TodochistesDotNet.prototype.getText = function() {
	return Modelo.prototype.getText.call(this);
}

var language = EzWebAPI.createRGadgetVariable("language", function(){});
var SourceGadget = EzWebAPI.createRGadgetVariable("source", setSourceGadget);


var Sources = {
	'1': new ChistesDotCom(),
	'2': new ChisteWebDotCom(),
	'3': new ChistematonDotCom()
}

function setSourceGadget(value) {
	Source = Sources[value];
	Source.load();
	Source.setIntervalReload(60*60);
	Vista._left.onclick = function() {Source.last();};
	Vista._right.onclick = function() {Source.next();};
}

function initGadget() {
	Vista.init();
	setSourceGadget(SourceGadget.get())
}
