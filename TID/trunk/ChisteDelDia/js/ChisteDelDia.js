var resourcesURL = "http://ezweb.tid.es/repository/ezweb-gadgets/ChisteDelDia/ChisteDelDia_0.7/";

var language, SourceGadget, RssSourceGadget, ColorThemeGadget, FontSizeGadget, refreshTime, titleEvent, textEvent, urlEvent, sourceUrlEvent, width, height;
var nextJoke, lastJoke, reload, sendText;

var Sources = {
	1: {
		name:'Chisteweb.com',
		link:'http://www.chisteweb.com/',
		url:'http://www.chisteweb.com/feed',
		filters: {
			text: function(value) {
				return value.replace(/\n/g,"<br />");
			}
		}
	},
	
	2:{
		name:'Chistes.com',
		link:'http://www.chistes.com/',
		url:'http://www.chistes.com/XML/ChisteDelDia.xml.asp',
		filters: {
			title: function(value) {
				return value.replace(/^\s*\[.*\]\s*-\s*/,'');
			}
		}
	},

	3: {
		name:'Comedy Central',
		link:'http://www.comedycentral.com',
		url:'http://www.comedycentral.com/rss/jokes/index.jhtml '
	},

	4: {
		name:'Jokes4all.net',
		link:'http://jokes4all.net',
		url:'http://jokes4all.net/rss/440010111/jokes.xml'
	}
}

function LoadJokeGadget() {

document.getElementById('reload').onclick = function() {reload();};

var errorFrameObject = {
	frame: document.getElementById('error_frame'),

	setMessage: function(text) {
		
	},
	show: function() {
		this.frame.style.display = '';
	},
	hidden: function() {
		this.frame.style.display = 'none';
	}
}

var jokeFrameObject = {
	frame:      document.getElementById('joke_frame'),
	jokeText:   document.getElementById('joke_frame_text'),
	jokeLink:   document.getElementById('joke_frame_link'),
	jokeTitle:  document.getElementById('joke_frame_title'),
	jokeSource: document.getElementById('joke_frame_source'),
	jokeDate:	document.getElementById('joke_frame_date'),
	jokeFrameMenu: document.getElementById('joke_frame_menu'),
	jokeLeftButtom: document.getElementById('left_buttom'),
	jokeRightButtom: document.getElementById('right_buttom'),

	jokeNum: document.getElementById('joke_num'),
	numJokes: document.getElementById('num_jokes'),
	
	setJokeNum: function(value) {
		function deshabilitar(htmlObj) {
			htmlObj.style.opacity = '.3';
			htmlObj.style.filter = "alpha(opacity = 30)";
			htmlObj.style.cursor = 'default';
		};
		function habilitar (htmlObj) {
			htmlObj.style.opacity = '1';
			htmlObj.style.filter = "alpha(opacity = 100)";
			htmlObj.style.cursor = 'pointer';
		};
		this.jokeNum.innerHTML = value;
		(value == 1) ? deshabilitar(this.jokeLeftButtom) : habilitar(this.jokeLeftButtom);
		(value == this._numJokes) ? deshabilitar(this.jokeRightButtom) : habilitar(this.jokeRightButtom);
	},
	setJokeText: function(value) {
		this.jokeText.innerHTML = value +
			' <a class="opacity" href="javascript:sendText();" title="Send Text">[→]</a>'
	},
	setJokeLink: function(value) {
		this.jokeTitle.setAttribute('href', value);
	},
	setJokeTitle: function(value) {
		this.jokeTitle.innerHTML = value;
		this.jokeTitle.setAttribute('title', value);
	},
	setJokeDate: function(value) {
		this.jokeDate.innerHTML = value;
	},
	setSourceName: function(value) {
		this.jokeSource.innerHTML = value;
		this.jokeSourceName = value;
	},
	setSourceLink: function(value) {
		this.jokeSource.setAttribute('href', value);
	},
	setSourceNumJokes: function(value) {
		this.jokeFrameMenu.style.display = (value <= 1) ? 'none' : '';
		this.numJokes.innerHTML = value;
		this._numJokes = value;
	},
	show: function() {
		this.frame.style.display = ''
	},
	hidden: function() {
		this.frame.style.display = 'none';
	}
}

var jokeGadgetUI = {
	jokeFrame: jokeFrameObject,
	errorFrame: errorFrameObject,
	
	notify: function(model) {
		if (model.isLoading()) {
			this.showLoading();
			return;
		}
		if (model.haveError()) {
			this.showError();
			return;
		}
		this.showJokeFrame(model);
	},
	showLoading: function() {
		this.jokeFrame.hidden();
		this.errorFrame.hidden();
	},
	showError: function() {
		this.errorFrame.show();
		this.jokeFrame.hidden();
	},
	showJokeFrame: function(src) {
		this.updateJokeFrame(src);
		this.jokeFrame.show();
		this.errorFrame.hidden();
		repaint();
	},
	updateJokeFrame: function(src) {
		with(this.jokeFrame) {
			setSourceNumJokes(src.getNumJokes());
			setSourceName(src.getName());
			setSourceLink(src.getLink());
			setJokeNum(src.getJokeNum());
			setJokeLink(src.getJokeLink());
			setJokeText(src.getJokeText());
			setJokeTitle(src.getJokeTitle());
			setJokeDate(src.getJokeDate());

			titleEvent.set(src.getJokeTitle());
			textEvent.set(src.getJokeText());
			urlEvent.set(src.getJokeLink());
			sourceUrlEvent.set(src.getLink());
			repaint();
		}
	}
}

var JokeGadgetModel = {

	configure: function(options) {
		this.setUrl(options.url || 'undefined');
		this.setName(options.name);
		this.setLink(options.link);
		this.setFilters(options.filters);
	},
	
	
	setUrl: function(value) {
		this.url = value;
	},
	setName: function(value) {
		this.name = value;
	},
	setLink: function(value) {
		this.link = value;
	},
	setFilters: function(value) {
		this.filters = value || {};
	},
	
	
	notify: function() {
		jokeGadgetUI.notify(this);
	},


	update: function() {
		this.resetError();
		this.loadingBegin();
		EzWebAPI.send_get(this.url, this,
			this.updateSuccess,
			this.updateError);
	},
	updateSuccess: function(request) {
		setRefreshTime();
		this.parseRequest(request);
		this.setFirstJoke();
		this.loadingEnd();
		repaint();
		
	},
	updateError: function(err) {
		clearRefreshTime();
		this.setError(err);
		this.loadingEnd();
	},

	isLoading: function() {
		return (typeof(this.loading) == "undefined") ? false : this.loading;
	},
	loadingBegin: function() {
		this.loading = true;
		this.notify();
	},
	loadingEnd: function() {
		this.loading = false;
		this.notify();
	},

	setError: function(error) {
		this.errors = true;
		this.notify();
	},
	resetError: function() {
		this.errors = false;
	},
	haveError: function(error) {
		return (typeof(this.errors) == "undefined") ? false : this.errors;
	},
	
	
	parseRequest: function(request) {
		this.xmlDoc = request.responseXML;
	},
	
	
	getName: function() {
		return this.name || function() {
			return this.getLink().replace(/(^http[s]?:\/\/(www.)?)|(\/.*)/gi, '');
		}.call(this);
	},

	getLink: function() {
		return this.link || function() {
			return this.xmlDoc.getElementsByTagName('channel')[0]
			.getElementsByTagName('link')[0]
			.firstChild.nodeValue;
		}.call(this);
	},
	getNumJokes: function() {
		return this.getItems().length;
	},
	
	
	setFirstJoke: function() {
		this.jokeNum = 0;
		this.notify();
	},
	setNextJoke: function() {
		if (this.jokeNum < this.getItems().length-1) {
			this.jokeNum += 1;
			this.notify();
		}
	},
	setLastJoke: function() {
		if (this.jokeNum > 0) {
			this.jokeNum -= 1;
			this.notify();
		}
	},

	getJokeNum: function() {
		return this.jokeNum + 1;
	},
	getJokeTitle: function() {
		var title = this.getItemsValueOfTag('title')
		if (this.filters.title)
			title = this.filters.title(title);
		return title
	},
	getJokeLink: function() {
		var link = this.getItemsValueOfTag('link')
		if (this.filters.link)
			link = this.filters.link(link);
		return link
	},
	getJokeText: function() {
		var text = this.getItemsValueOfTag('description')
		if (this.filters.text)
			text = this.filters.text(text);
		return text
	},
	
	getJokeDate: function() {
		var text = this.getItemsValueOfTag('pubDate')
		if (this.filters.text) {
			text = this.filters.text(text);
		}
		if (jokeFrameObject.jokeSourceName == "Comedy Central") {
			var date = new Date();
			var elements = text.split('-');
			date.setFullYear(elements[0]);
			date.setMonth(elements[1]-1);
			date.setDate(elements[2]);
		}
		else {
			var date = new Date(text);
		}
		return this.getDate(date) + '/' + this.getMonth(date) + '/' + date.getFullYear();
	},
	
	
	getItemsValueOfTag: function(tag) {
		return this.getItem(this.jokeNum)
			.getElementsByTagName(tag)[0]
				.firstChild.nodeValue;
	},
	getItem: function(num) {
		return this.getItems()[num];
	},
	getItems: function() {
		return this.xmlDoc.getElementsByTagName('channel')[0]
			.getElementsByTagName('item');
	},
	
	getDate: function(date) {
		day = date.getDate();
		if (day < 10) 
			return '0' + day;
		else
			return day;
	},
	
	getMonth: function(date) {
		month = date.getMonth() + 1;
		if (month < 10) 
			return '0' + month;
		else
			return month;
	}
}

nextJoke = function() {
	JokeGadgetModel.setNextJoke();
}

lastJoke = function() {
	JokeGadgetModel.setLastJoke();
}

reload = function() {
	JokeGadgetModel.update();
}
sendText = function() {
	textEvent.set(JokeGadgetModel.getJokeText());
}

function setSourceJokes(sourceIndex) {
	if (sourceIndex == '0') {
		JokeGadgetModel.configure({url:RssSourceGadget.get()});
	} else {
		JokeGadgetModel.configure(Sources[sourceIndex]);
	}
	JokeGadgetModel.update()
}

function setRssSourceJokes() {
	if (SourceGadget.get() == '0') {
		setSourceJokes(SourceGadget.get());
	}
}

function setFontSize(size) {
	document.body.style.fontSize = size;
	repaint();
}

function setColorTheme(color) {
	document.getElementById('color_theme').href = resourcesURL+'css/'+color+'.css';
}

function clearRefreshTime() {
	window.clearInterval(interval);
}

function setRefreshTime() {
	clearRefreshTime();
	interval = window.setInterval(reload, 1000 * 60 * refreshTime.get()); // Minutes
}

function repaint() {
    var body = document.getElementById("body");
    var width = document.getElementById("joke_frame").offsetHeight - document.getElementById("head").offsetHeight - 2;
    if (width >= 0) {
        document.getElementById("body").style.height = width + "px";
    }
    
    var table = body.getElementsByTagName("table")[0];
    if (table != null) {
        var margin = (body.offsetWidth - table.offsetWidth) / 2;
        if (margin >= 0) {
            table.style.marginLeft = margin + "px";
        }
    }
}

var interval;

// EzWebVars
language = EzWebAPI.createRGadgetVariable("language", function(){});
SourceGadget = EzWebAPI.createRGadgetVariable("source", setSourceJokes);
RssSourceGadget = EzWebAPI.createRGadgetVariable("rss_source", setRssSourceJokes);
ColorThemeGadget = EzWebAPI.createRGadgetVariable("color_theme", setColorTheme);
FontSizeGadget = EzWebAPI.createRGadgetVariable("font_size", setFontSize);
refreshTime = EzWebAPI.createRGadgetVariable("refreshTime", setRefreshTime);
width  = EzWebAPI.createRGadgetVariable("height", repaint);
height = EzWebAPI.createRGadgetVariable("width", repaint);

// EzWebEvents
titleEvent = EzWebAPI.createRWGadgetVariable ('title');
textEvent  = EzWebAPI.createRWGadgetVariable ('text');
urlEvent   = EzWebAPI.createRWGadgetVariable ('url');
sourceUrlEvent = EzWebAPI.createRWGadgetVariable ('sourceUrl');

// Initialize
setFontSize(FontSizeGadget.get());
setColorTheme(ColorThemeGadget.get());
setSourceJokes(SourceGadget.get());
setRefreshTime();
repaint();
}
