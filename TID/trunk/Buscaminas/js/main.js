/////////////////////////////////////////////
////////// Class Buscaminas /////////////////
/////////////////////////////////////////////

var Buscaminas = function() {
	/* Call to the parent constructor */
	EzWebGadget.call(this, {translatable: false});
}

Buscaminas.prototype = new EzWebGadget(); /* Extend from EzWebGadget */

Buscaminas.prototype.resourcesURL = "http://demo.ezweb.morfeo-project.org/repository/Buscaminas/";

Buscaminas.prototype.BORDER_WIDTH = 4;

/******************** OVERWRITE METHODS **************************/

Buscaminas.prototype.init = function() {

	this.LEVELS = {};
	this.LEVELS["easy"]   = [8,8,12];
	this.LEVELS["medium"] = [12,12,25];
	this.LEVELS["hard"]   = [16,16,50];

	this.eventTime = EzWebAPI.createRWGadgetVariable("event_time");
	this.eventLevel = EzWebAPI.createRWGadgetVariable("event_level");
	
	this.level = EzWebAPI.createRGadgetVariable("level", EzWebExt.bind(function(value){
		this.changeLevel(value);
	}, this));
	

	this.selectedTheme = "orange";
	this.theme = EzWebAPI.createRGadgetVariable("theme", EzWebExt.bind(function(value){
		this.changeTheme(value);
	}, this));

	this.times = EzWebAPI.createRWGadgetVariable("times");
	
	var newTimes = this.times.get();
	if (newTimes && (newTimes != "")) {
		this.maxTimes = eval("(" + newTimes + ")");
	}
	else {
		this.maxTimes = {easy: [-1, "??:??"], medium: [-1, "??:??"], hard: [-1, "??:??"]};
	}
	
	var body = document.getElementsByTagName("body")[0];
	
	this.header = document.createElement("div");
	this.header.id = "header";
	body.appendChild(this.header);
	
	this.flagsCounter = document.createElement("div");
	this.flagsCounter.id = "flags_counter";
	this.flagsCounter.title = "Banderas";
	this.header.appendChild(this.flagsCounter);
	
	this.mainButton = document.createElement("div");
	this.mainButton.id = "main_button";
	this.mainButton.title = "Nuevo juego";
	this.mainButton.addEventListener("click", EzWebExt.bind(function(e) {
		this.newGame();
	}, this), false);
	this.header.appendChild(this.mainButton);
	
	this.timer = document.createElement("div");
	this.timer.id = "timer";
	this.header.appendChild(this.timer);
	
	this.content = document.createElement("div");
	this.content.id = "content";
	body.appendChild(this.content);

	document.oncontextmenu = function(e) { // disable context menu
		Utils.stopEvent(e); 
		return false; 
	};
	document.onmousedown = function(e) { // disable text selection
		Utils.stopEvent(e); 
		return false; 
	};
	
	this.changeLevel(this.level.get());
}

Buscaminas.prototype.changeLevel = function(value) {
	var level = this.LEVELS[value];
	this.width = level[0];
	this.height = level[1];
	this.bombs = level[2];
	this.updateTimeTitle();
	this.newGame();
}

Buscaminas.prototype.changeTheme = function(value) {
	this.board.changeTheme(this.selectedTheme, value);
	this.selectedTheme = value;
}

Buscaminas.prototype.saveTime = function(newTimeInMillis, newTime) {
	var oldTime = this.maxTimes[this.level.get()][0];
	if ((oldTime < 0) || (newTimeInMillis < oldTime)) {
		this.maxTimes[this.level.get()] = [newTimeInMillis, newTime];
		this.updateTimeTitle();
		this.times.set(Utils.toJSON(this.maxTimes));
	}
}

Buscaminas.prototype.updateTimeTitle = function() {
	this.timer.title = "Mejor tiempo - " + this.maxTimes[this.level.get()][1];
}

Buscaminas.prototype.newGame = function() {
	this.content.innerHTML = "";
	try {this.board.timer.stop();}
	catch(e){}
	this.board = new Board(this.width, this.height, this.bombs, this.content);
	this.mainButton.style.backgroundImage = "url(" + this.getResourceURL("images/face-smile.png") + ")";
	setTimeout(EzWebExt.bind(function() {
		this.mainButton.style.backgroundImage = "url(" + this.getResourceURL("images/face-cool.png") + ")";
	}, this), 500);
	this.changeTheme(this.theme.get());
	this.repaint();
}

Buscaminas.prototype.win = function() {
	this.mainButton.style.backgroundImage = "url(" + this.getResourceURL("images/face-win.png") + ")";
	this.saveTime(this.board.timer.getTimeInMillis(), this.board.timer.getTime());
	this.eventTime.set(this.board.timer.getTime());
	this.eventLevel.set(this.level.get());
}

Buscaminas.prototype.lost = function() {
	this.mainButton.style.backgroundImage = "url(" + this.getResourceURL("images/face-sad.png") + ")";
}

Buscaminas.prototype.repaint = function() {
	var height = document.defaultView.innerHeight - this.header.offsetHeight;
	var width = document.defaultView.innerWidth;
	
	this.content.style.height = height + "px";
	this.content.style.width = width + "px";
	
	var size = Utils.min(width-10, height-10);
	this.board.resize(size, size);
	
	this.board.element.style.left = ((width - this.board.element.offsetWidth)/2) + "px";
	this.board.element.style.top = ((height - this.board.element.offsetHeight)/2) + "px";
	
	this.mainButton.style.left = ((width - this.mainButton.offsetWidth)/2) + "px";
}

Buscaminas = new Buscaminas();

var Board = function(width, height, bombs, parentElement) {
	this.tiles = [];
	this.tileCounter = 0;
	this.width = width;
	this.height = height;
	this.element = null;
	this.bombs = bombs;
	this.flags = 0;
	this.opennedTiles = 0;
	this.end = false;
	
	this.timer = new Clock(Buscaminas.timer);
	this.runTime = false;
	this.timer.paint();
	
	this.tilesUpdated = {};
	
	this._createInterface(parentElement);
	this._initTiles();
	this._initBombs();
}

Board.prototype._initTiles = function() {
	this.tiles = [];
	for (var x=0; x<this.height; x++) {
		this.tiles[x] = [];
		for (var y=0; y<this.width; y++) {
			this.tiles[x][y] = new Tile(x,y,this);
		}
	}
}

Board.prototype._initBombs = function() {
	var candidates = [];
	for (var i=0; i<(this.width*this.height); i++) {
		candidates[i] = i;
	}
	for (var i=0; i<this.bombs; i++) {
		var index = Math.floor(Math.random()*(candidates.length-1));
		var y = Math.floor(candidates[index]/this.width);
		var x = candidates[index]%this.width;
		this.tiles[x][y].setBomb(true);
		
		try {this.tiles[x][y+1].incNearBombs();}
		catch(e) {}
		try {this.tiles[x][y-1].incNearBombs();}
		catch(e) {}
		try {this.tiles[x-1][y].incNearBombs();}
		catch(e) {}
		try {this.tiles[x+1][y].incNearBombs();}
		catch(e) {}
		try {this.tiles[x+1][y+1].incNearBombs();}
		catch(e) {}
		try {this.tiles[x-1][y-1].incNearBombs();}
		catch(e) {}
		try {this.tiles[x-1][y+1].incNearBombs();}
		catch(e) {}
		try {this.tiles[x+1][y-1].incNearBombs();}
		catch(e) {}

		candidates = Utils.removeElementByIndex(candidates, index);
	}
}

Board.prototype.changeTheme = function(oldTheme, newTheme) {
	for (var x=0; x<this.height; x++) {
                for (var y=0; y<this.width; y++) {
                        this.tiles[x][y].changeTheme(oldTheme, newTheme);
                }
        }
}

Board.prototype.openTile = function(x,y) {
	var tile = this.tiles[x][y];
	this.tilesUpdated[x + "-" + y] = true;

	if (tile.getState() != tile.STATE_OPEN) {
		tile.open();
		if (tile.getBomb() && (tile.getState() != tile.STATE_MARK)) { // Ha explotado
			this.finish();
		}
		else if (tile.getNearBombs() == 0) {
			if (this.tiles[x]) {
				if (this.tiles[x][y+1] && !(this.tilesUpdated[x + "-" + (y+1)])) {
					this.openTile(x,y+1);
				}
				if (this.tiles[x][y-1] && !(this.tilesUpdated[x + "-" + (y-1)])) {
					this.openTile(x,y-1);
				}
			}
			if (this.tiles[x-1]) {
				if (this.tiles[x-1][y] && !(this.tilesUpdated[(x-1) + "-" + y])) {
					this.openTile(x-1,y);
				}
				if (this.tiles[x-1][y-1] && !(this.tilesUpdated[(x-1) + "-" + (y-1)])) {
					this.openTile(x-1,y-1);
				}
				if (this.tiles[x-1][y+1] && !(this.tilesUpdated[(x-1) + "-" + (y+1)])) {
					this.openTile(x-1,y+1);
				}
			}
			if (this.tiles[x+1]) {
				if (this.tiles[x+1][y] && !(this.tilesUpdated[(x+1) + "-" + y])) {
					this.openTile(x+1,y);
				}
				if (this.tiles[x+1][y-1] && !(this.tilesUpdated[(x+1) + "-" + (y-1)])) {
					this.openTile(x+1,y-1);
				}
				if (this.tiles[x+1][y+1] && !(this.tilesUpdated[(x+1) + "-" + (y+1)])) {
					this.openTile(x+1,y+1);
				}
			}
		}
	}
}

Board.prototype.reOpenTile = function(x,y) {
	var tile = this.tiles[x][y];
	this.tilesUpdated[x + "-" + y] = true;
	if ((tile.getState() == tile.STATE_OPEN) && (!this.end) && 
		(tile.getEstimatedNearBombs() != tile.getNearBombs()) && 
		(tile.getEstimatedNearBombs() <= 0)) {
	
		if (this.tiles[x]) {
			if (this.tiles[x][y+1] && !(this.tilesUpdated[x + "-" + (y+1)])) {
				this.reOpenTileInternal(x,y+1);
			}
			if (this.tiles[x][y-1] && !(this.tilesUpdated[x + "-" + (y-1)])) {
				this.reOpenTileInternal(x,y-1);
			}
		}
		if (this.tiles[x-1]) {
			if (this.tiles[x-1][y] && !(this.tilesUpdated[(x-1) + "-" + y])) {
				this.reOpenTileInternal(x-1,y);
			}
			if (this.tiles[x-1][y-1] && !(this.tilesUpdated[(x-1) + "-" + (y-1)])) {
				this.reOpenTileInternal(x-1,y-1);
			}
			if (this.tiles[x-1][y+1] && !(this.tilesUpdated[(x-1) + "-" + (y+1)])) {
				this.reOpenTileInternal(x-1,y+1);
			}
		}
		if (this.tiles[x+1]) {
			if (this.tiles[x+1][y] && !(this.tilesUpdated[(x+1) + "-" + y])) {
				this.reOpenTileInternal(x+1,y);
			}
			if (this.tiles[x+1][y-1] && !(this.tilesUpdated[(x+1) + "-" + (y-1)])) {
				this.reOpenTileInternal(x+1,y-1);
			}
			if (this.tiles[x+1][y+1] && !(this.tilesUpdated[(x+1) + "-" + (y+1)])) {
				this.reOpenTileInternal(x+1,y+1);
			}
		}
	}
}

Board.prototype.reOpenTileInternal = function(x,y) {
	var tile = this.tiles[x][y];
	this.tilesUpdated[x + "-" + y] = true;
	if (tile.getNearBombs() > 0) {
		tile.open();
		if (tile.getBomb() && (tile.getState() != tile.STATE_MARK)) { // Ha explotado
			this.finish();
		}
	}
	else if (tile.state != tile.STATE_MARK) {
		this.openTile(x,y);
	}
}

Board.prototype.markTile = function(x,y) {
	var tile = this.tiles[x][y];
	if (tile.getState() != tile.STATE_OPEN) {
		tile.mark();
		if (tile.getState() == tile.STATE_MARK) {
			try {this.tiles[x][y-1].decEstimatedNearBombs();}
			catch(e) {}
			try {this.tiles[x][y+1].decEstimatedNearBombs();}
			catch(e) {}
			try {this.tiles[x-1][y].decEstimatedNearBombs();}
			catch(e) {}
			try {this.tiles[x+1][y].decEstimatedNearBombs();}
			catch(e) {}
			try {this.tiles[x-1][y-1].decEstimatedNearBombs();}
			catch(e) {}
			try {this.tiles[x+1][y+1].decEstimatedNearBombs();}
			catch(e) {}
			try {this.tiles[x+1][y-1].decEstimatedNearBombs();}
			catch(e) {}
			try {this.tiles[x-1][y+1].decEstimatedNearBombs();}
			catch(e) {}
		}
		else if (tile.getState() == tile.STATE_MARK_QUESTION) {
			try {this.tiles[x][y-1].incEstimatedNearBombs();}
			catch(e) {}
			try {this.tiles[x][y+1].incEstimatedNearBombs();}
			catch(e) {}
			try {this.tiles[x-1][y].incEstimatedNearBombs();}
			catch(e) {}
			try {this.tiles[x+1][y].incEstimatedNearBombs();}
			catch(e) {}
			try {this.tiles[x-1][y-1].incEstimatedNearBombs();}
			catch(e) {}
			try {this.tiles[x+1][y+1].incEstimatedNearBombs();}
			catch(e) {}
			try {this.tiles[x+1][y-1].incEstimatedNearBombs();}
			catch(e) {}
			try {this.tiles[x-1][y+1].incEstimatedNearBombs();}
			catch(e) {}
		}
	}
}

Board.prototype.incOpennedTiles = function() {
	this.opennedTiles++;
	if (((this.width*this.height)-this.bombs) <= this.opennedTiles) {
		for (var x=0; x<this.height; x++) {
			for (var y=0; y<this.width; y++) {
				this.tiles[x][y].paintWin();
			}
		}
		this.end = true;
		this.timer.stop();
		this.runTime = false;
		this.flags = this.bombs;
		this.paintFlagsCounter();
		Buscaminas.win();
	}
}

Board.prototype.incFlags = function() {
	this.flags++;
	this.paintFlagsCounter();
}

Board.prototype.decFlags = function() {
	this.flags--;
	this.paintFlagsCounter();
}

Board.prototype.paintFlagsCounter = function() {
	Buscaminas.flagsCounter.innerHTML = this.flags + "/" + this.bombs;
	if (this.flags > this.bombs) {
		EzWebExt.addClassName(Buscaminas.flagsCounter, "flags_error");
		EzWebExt.removeClassName(Buscaminas.flagsCounter, "flags_ok");
	}
	else if (this.flags == this.bombs) {
		EzWebExt.addClassName(Buscaminas.flagsCounter, "flags_ok");
		EzWebExt.removeClassName(Buscaminas.flagsCounter, "flags_error");
	}
	else {
		EzWebExt.removeClassName(Buscaminas.flagsCounter, "flags_error");
		EzWebExt.removeClassName(Buscaminas.flagsCounter, "flags_ok");
	}
}

Board.prototype.appendChild = function(tile) {
	this.element.appendChild(tile);
}

Board.prototype.finish = function() {
	for (var x=0; x<this.height; x++) {
		for (var y=0; y<this.width; y++) {
			this.tiles[x][y].paintLost();
		}
	}
	this.end = true;
	this.timer.stop();
	this.runtime = false;
	Buscaminas.lost();
}

Board.prototype.resize = function(width, height) {
	this.element.style.width = width + "px";
	this.element.style.height = height + "px";
	for (var x=0; x<this.height; x++) {
		for (var y=0; y<this.width; y++) {
			this.tiles[x][y].resize((width-(Buscaminas.BORDER_WIDTH*this.width)-1)/this.width, (height-(Buscaminas.BORDER_WIDTH*this.height)-1)/this.height);
		}
	}
}

Board.prototype._createInterface = function(parentElement) {
	this.element = document.createElement("div");
	EzWebExt.addClassName(this.element, "board");
	this.element.style.width = (this.width * Buscaminas.TILE_WIDTH) + "px";
	this.element.style.height = (this.height * Buscaminas.TILE_HEIGHT) + "px";
	parentElement.appendChild(this.element);
	this.paintFlagsCounter();
}

var Tile = function(x, y, board) {
	this.x = x;
	this.y = y;
	this.state = this.STATE_UNMARK;
	this.bomb = false;
	this.board = board;
	this.element = null;
	this.nearBombs = 0;
	this.estimatedNearBombs = 0;
	this.selectedTheme = "orange";
	this._createInterface(board.element);
}

Tile.prototype.STATE_UNMARK = 0;
Tile.prototype.STATE_MARK = 1;
Tile.prototype.STATE_MARK_QUESTION = 2;
Tile.prototype.STATE_OPEN = 3;

Tile.prototype.changeTheme = function(oldTheme, newTheme) {
	if (this.state != this.STATE_OPEN) { 
		EzWebExt.removeClassName(this.element, "theme_" + oldTheme);
		EzWebExt.addClassName(this.element, "theme_" + newTheme);
		this.selectedTheme = newTheme;
	}
}

Tile.prototype.open = function() {
	if ((this.state == this.STATE_UNMARK) || (this.state == this.STATE_MARK_QUESTION)) {
		this.state = this.STATE_OPEN;
		this.paint();
		if (!this.bomb) {
			this.board.incOpennedTiles();
		}
	}
}

Tile.prototype.mark = function() {
	if (this.state != this.STATE_OPEN) {
		switch (this.state) {
			case this.STATE_MARK_QUESTION:
				this.state = this.STATE_UNMARK;
				break;
			case this.STATE_MARK:
				this.state = this.STATE_MARK_QUESTION;
				this.board.decFlags();
				break;
			default:
				this.state = this.STATE_MARK
				this.board.incFlags();
				break;
		}
		this.paint();
	}
	
	
}

Tile.prototype.setBomb = function(bomb) {
	this.bomb = bomb;
}

Tile.prototype.getBomb = function() {
	return this.bomb;
}

Tile.prototype.getState = function() {
	return this.state;
}

Tile.prototype.getNearBombs = function() {
	return this.nearBombs;
}

Tile.prototype.incNearBombs = function() {
	this.nearBombs++;
	this.estimatedNearBombs++;
}

Tile.prototype.getEstimatedNearBombs = function() {
	return this.estimatedNearBombs;
}

Tile.prototype.incEstimatedNearBombs = function() {
	this.estimatedNearBombs++;
}

Tile.prototype.decEstimatedNearBombs = function() {
	this.estimatedNearBombs--;
}

Tile.prototype.paint = function() {
	var image = "";
	this.element.innerHTML = "";
	switch (this.state) {
		case this.STATE_UNMARK:
			break;
		case this.STATE_MARK_QUESTION:
			image = "images/tile-mark-question.png";
			break;
		case this.STATE_MARK:
			image = "images/tile-mark.png";
			break;
		case this.STATE_OPEN:
			EzWebExt.removeClassName(this.element, "theme_" + this.selectedTheme);
			EzWebExt.removeClassName(this.element, "close");
			EzWebExt.addClassName(this.element, "open");
			this.element.innerHTML = ((this.nearBombs>0)?this.nearBombs:"");
			break;
	}

	EzWebExt.removeClassName(this.element, "tile_" + (this.nearBombs-1));
	EzWebExt.removeClassName(this.element, "tile_" + (this.nearBombs+1));
	EzWebExt.addClassName(this.element, "tile_" + this.nearBombs);
	if (image != "") {
		this.element.appendChild(this._createImage(image));
	}
}

Tile.prototype.paintLost = function() {
	var image = "";
	if (this.bomb) {
		this.element.innerHTML = "";
		switch (this.state) {
			case this.STATE_UNMARK:
			case this.STATE_MARK_QUESTION:
				image = "images/tile-bomb.png";
				break;
			case this.STATE_MARK:
				image = "images/tile-mark.png";
				break;
			case this.STATE_OPEN:
				image = "images/tile-bang.png";
				break;
		}
		this.element.innerHTML = "";
		this.element.appendChild(this._createImage(image));
	}
	if ((this.state == this.STATE_MARK) && !this.bomb) {
		this.element.innerHTML = "";
		this.element.appendChild(this._createImage("images/tile-mark-fail.png"));
	}
}

Tile.prototype.paintWin = function() {
	if (this.bomb) {
		this.element.innerHTML = "";
		this.element.appendChild(this._createImage("images/tile-mark.png"));
	}
}

Tile.prototype.resize = function(width, height) {
	this.element.style.width = width + "px";
	this.element.style.height = height + "px";
	this.element.style.lineHeight = height + "px";
	this.element.style.fontSize = (height * 0.8) + "px";
}

Tile.prototype._createInterface = function(parentElement) {
	this.element = document.createElement("div");
	EzWebExt.addClassName(this.element, "tile");
	EzWebExt.addClassName(this.element, "close");
	this.element.addEventListener("mousedown", EzWebExt.bind(function(e) {
		if (!this.board.end) {
			if (!this.board.runTime) {
				this.board.runTime = true;
				this.board.timer.start();
			}
			if ((Utils.isRightButton(e)) && (this.state != this.STATE_OPEN)) {
				this.board.markTile(this.x, this.y);
			}
			else if (this.state == this.STATE_OPEN) {
				this.board.tilesUpdated = {};
				this.board.reOpenTile(this.x, this.y);
			} 
			else if (this.state != this.STATE_MARK) {
				this.board.tilesUpdated = {};
				this.board.openTile(this.x, this.y);
			}
		}
	}, this), false);
	this.paint();
	parentElement.appendChild(this.element);
}

Tile.prototype._createImage = function(src) {
	var image = document.createElement("img");
	image.setAttribute("src", Buscaminas.getResourceURL(src));
	return image;
}

var Clock = function(element) {
	this.initialTime = new Date();
	this.lastTime = new Date();
	this.run = false;
	this.interval = 0;
	this.element = element;
}

Clock.prototype.SECOND = 1000;
Clock.prototype.MINUTE = 60000;
Clock.prototype.HOUR = 3600000;

Clock.prototype.reset = function() {
	this.initialTime = new Date();
	this.lastTime = new Date();
	this.run = true;
}

Clock.prototype.update = function() {
	this.lastTime = new Date();
}

Clock.prototype.getTimeInMillis = function() {
	if (this.run) {
		this.update();
	}
	return this.lastTime.getTime() - this.initialTime.getTime();
}

Clock.prototype.getTime = function() {
	var millis = this.getTimeInMillis();
	var hours = Math.floor(millis / this.HOUR);
	millis = millis - (hours * this.HOUR);
	var minutes = Math.floor(millis / this.MINUTE);
	millis = millis - (minutes * this.MINUTE);
	var seconds = Math.round(millis / this.SECOND);
	return	Utils.numberToString(minutes) + ":" + 
		Utils.numberToString(seconds);
}

Clock.prototype.start = function() {
	this.reset();
	this.interval = setInterval(EzWebExt.bind(function(){
		this.paint();
	}, this), this.SECOND);
}

Clock.prototype.stop = function() {
	clearInterval(this.interval);
	this.run = false;
}

Clock.prototype.paint = function() {
	this.element.innerHTML = this.getTime();
	var oldTime = Buscaminas.maxTimes[Buscaminas.level.get()][0];
	if ((oldTime<0) || (this.getTimeInMillis() < oldTime)) {
		EzWebExt.addClassName(this.element, "record");
	}
	else {
		EzWebExt.removeClassName(this.element, "record");
	}
}

/////////////////////////////////////////////
////////// Class Utils //////////////////////
/////////////////////////////////////////////

var Utils = function() {
}

Utils.prototype.stopEvent = function(e) {
    if (!e) e = window.event;
    if (e.stopPropagation) {
        e.stopPropagation();
    } else {
        e.cancelBubble = true;
    }
}

Utils.prototype.isRightButton = function(e) {
    if (!e) e = window.event;
    return (e.button == 2);
}

Utils.prototype.min = function(val1, val2) {
    return (val1 >= val2)?val2:val1;
}

Utils.prototype.toJSON = function(object) {
	return JSON.stringify(object, function (key, value) {
	    return value;
	});
}

Utils.prototype.removeElementByIndex = function(list, index) {
	if (index != -1) {
		list = list.slice(0,index).concat(list.slice(index+1,list.length));
	}
	return list;
}

Utils.prototype.numberToString = function(number) {
	return ((number < 10)? "0":"") + number;
}

Utils = new Utils();

