
Object.create = function(o) {
	function F(){}
	F.prototype = o;
	return new F();
}

var TiraRss = {
	reload: function(onSuccess, onError) {
		frameLoad.show();
		EzWebAPI.send_get(this.url, this,
			function(request) { /* Success */
				var xml = request.responseXML;
				var channel = xml.getElementsByTagName('channel')[0];
				var item = channel.getElementsByTagName('item')[0];
				var description = item.getElementsByTagName('description')[0].firstChild.nodeValue;
				var div = document.createElement('div');
				div.innerHTML = description;
				this.name = channel.getElementsByTagName('title')[0].firstChild.nodeValue;
				this.title = item.getElementsByTagName('title')[0].firstChild.nodeValue;
				this.image = div.getElementsByTagName('img')[0].src;
				onSuccess.call(this);
			},
			function(){ onError.call(this); }); /* Error */
	}
};

var xkcd = Object.create(TiraRss);
xkcd.url = "http://xkcd.com/rss.xml";

var emezeta = Object.create(TiraRss);
emezeta.url = "http://tira.emezeta.com/index.xml";

var legionDelEspacio = Object.create(TiraRss);
legionDelEspacio.url = "http://www.legiondelespacio.com/rss/strips/";

var mauroeEnTrialgo = Object.create(TiraRss);
mauroeEnTrialgo.url = "http://blogs.publico.es/mauroentrialgo/feed/";

var tiraEcol = {
	title:"Tira Ecol",
	image:"http://www.tiraecol.net/modules/comic/cache/shots/tiraecol.png",
	reload: function(onSuccess, onError) { onSuccess.call(this); }
};

sources = {1:xkcd, 2:legionDelEspacio, 3:tiraEcol, 4:emezeta, 5:mauroeEnTrialgo};

var frameLoad = (function() {
	var frame = document.createElement('div');
	frame.style.top = "0";
	frame.style.left = "0";
	frame.style.width = "100%";
	frame.style.height = "100%";
	frame.style.display = "table";
	frame.style.position = "fixed";
	frame.style.background = "url("+resourcesURL+"imgs/fbg.png) repeat";
	frame.style.zIndex = "9000";
	frame.show = function(){
		this.style.visibility = "visible";
	}
	frame.hidden = function(){
		this.style.visibility = "hidden";
	}
	frame.hidden();

	var contenido = document.createElement('div');
	contenido.style.width = "100%";
	contenido.style.height = "100%";
	contenido.style.backgroundImage = "url("+resourcesURL+"imgs/load.gif)";
	contenido.style.backgroundRepeat = "no-repeat";
	contenido.style.backgroundAttachment = "fixed";
	contenido.style.backgroundPosition = "center center";
	frame.appendChild(contenido);

	return frame;
})();

var frameError = (function() {
	var frame = document.createElement('div');
	frame.style.top = "0";
	frame.style.left = "0";
	frame.style.width = "100%";
	frame.style.height = "100%";
	frame.style.display = "table";
	frame.style.background = "url("+resourcesURL+"imgs/fbg.png) repeat";
	frame.style.position = "fixed";
	frame.style.zIndex = "9999";
	frame.style.fontSize = "11px";
	frame.show = function(){
		this.style.visibility = "visible";
	};
	frame.hidden = function(){
		this.style.visibility = "hidden";
	};
	frame.setMenssage = function(msg) {
		mensaje.innerHTML = msg;
	};
	frame.hidden();

	var centrado = document.createElement('div');
	centrado.style.display = "table-cell";
	centrado.style.verticalAlign = "middle";
	centrado.style.textAlign = "center";
	frame.appendChild(centrado);

	var contenido = document.createElement('div');
	contenido.style.margin = "0 auto";
	contenido.style.width = "200px";
	contenido.style.background = "#FFEFEF";
	contenido.style.border = ".3em solid #9F3131";
	centrado.appendChild(contenido);

	var mensaje = document.createElement('p')
	mensaje.style.color = "#9F3131";
	mensaje.innerHTML = "A ocurrido un error";
	contenido.appendChild(mensaje);

	var boton = document.createElement('button')
	boton.style.margin = "0 0 5px 0";
	boton.innerHTML = "Aceptar"
	contenido.appendChild(boton);
	boton.addEventListener('click', function(){
		setSource(sourcePreference.get());
		frame.hidden();
	}, false);

	return frame;
})();


var image = document.createElement('img');
	image.style.cursor = "pointer";
	image.show = function(){
		this.style.visibility = "visible";
	};
	image.hidden = function(){
		this.style.visibility = "hidden";
	};
	image.center = function() {
		var image = this;
		image.width = image.naturalWidth +5;
		image.height = image.naturalHeight +5;
		if (image.width > document.body.clientWidth) {
			image.width = document.body.clientWidth;
			image.height = image.naturalHeight * (image.width / image.naturalWidth);
		}
		if (image.height > document.body.clientHeight) {
			image.height = document.body.clientHeight;
			image.width = image.naturalWidth * (image.height / image.naturalHeight);
		}
		image.width -= 5;
		image.height -= 5;
		image.style.position = 'absolute';
		image.style.left = (document.body.clientWidth - image.width) / 2;
		image.style.top = (document.body.clientHeight - image.height) / 2;
	};
	image.setSrc = function(src) {
		window.clearTimeout(this.timer);
		this.src = src;
		//this.hidden();
		this.timer = window.setTimeout(function(){
			frameError.setMenssage("Tiempo excedido al cargar la imagen");
			frameError.show();
			frameLoad.hidden();
		}, 30*1000);
	};
	image.setTitle = function(title) {
		this.title = title
	};
	image.addEventListener('load', function() {
		window.clearTimeout(image.timer);
		//this.show();
		this.center();
		frameLoad.hidden();
	}, true);
	image.addEventListener('click', function() {
		if (popUpPreference.get() == 'on') {
			var url = resourcesURL+'wimage.html?i='+this.src;
			var wname = 'windowImage';
			var size = 'width='+(this.naturalWidth+10)+',height='+(this.naturalHeight+10);
			window.open(url, wname, size);
		} else {
			imgUrlEvent.set(this.src);
		}
	}, false);


window.addEventListener('load', function() {
	document.body.appendChild(image);
	document.body.appendChild(frameLoad);
	document.body.appendChild(frameError);

	window.addEventListener('resize', function(){
		image.center();
	}, true);

	setSource(sourcePreference.get());
	setBackground(backgroundPreference.get());
	
}, true);


// PREFERENCES
var setSource = function() {
	sources[sourcePreference.get()].reload(
		function() { /* Success */
			image.setTitle(this.title);
			image.setSrc(this.image);
			imgUrlEvent.set(this.image);
//			frameLoad.show();
			setRefreshTime();
		},
		function() { /* Error */
			clearRefreshTime();
			frameError.setMenssage("Ocurrio un error al conectarse a la fuente");
			frameError.show();
			frameLoad.hidden();
			
		});
};
var sourcePreference = EzWebAPI.createRGadgetVariable("source", setSource);

var interval;

var clearRefreshTime = function(){
	window.clearInterval(interval);
}

var setRefreshTime = function (){
        clearRefreshTime();
        interval = window.setInterval(setSource ,refreshTime.get() * 60 * 1000);
}

var refreshTime= EzWebAPI.createRGadgetVariable("refreshTime", setRefreshTime);

var setBackground = function(value) {
	document.body.style.backgroundColor = value;
};
var backgroundPreference = EzWebAPI.createRGadgetVariable("background", setBackground);

var popUpPreference = EzWebAPI.createRGadgetVariable("pop-up", function(){});

// EVENTS
var imgUrlEvent = EzWebAPI.createRWGadgetVariable("imgUrl");
