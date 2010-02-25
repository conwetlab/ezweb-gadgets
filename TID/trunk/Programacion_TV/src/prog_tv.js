
var languageCtx = EzWebAPI.createRGadgetVariable("language", function(){});


var ProgramacionTV = function() {
    /* Call to the parent constructor */
    EzWebGadget.call(this, {translatable: false});
}

ProgramacionTV.prototype = new EzWebGadget(); /* Extend from EzWebGadget */

ProgramacionTV.prototype.imageURL = 'http://ezweb.tid.es/repository/ezweb-gadgets/Programacion_TV/Programacion_TV_1.22/logos/logo';

ProgramacionTV.prototype.init = function() {
	
	this.descriptionEvent = EzWebAPI.createRWGadgetVariable("description");
	this.titleEvent = EzWebAPI.createRWGadgetVariable("title");
	this.timeEvent = EzWebAPI.createRWGadgetVariable("time");
	this.channelEvent = EzWebAPI.createRWGadgetVariable("channel");
	
	this.heightCtx = EzWebAPI.createRGadgetVariable("height", EzWebExt.bind(function(){
		this.dictionary.repaint(false);
	}, this));
	
	this.dictionary = new StyledElements.StyledNotebook({'id':'dictionary'});
	this.dictionary.insertInto(document.body);
	//this.languagePref = EzWebAPI.createRGadgetVariable('languagePref',EzWebExt.bind(function(e){return;},this));

	//this.languageCtx = EzWebAPI.createRGadgetVariable('language', EzWebExt.bind(function(){}, this));
	//this.language = this.languageCtx.get();
	this.language = languageCtx.get();

	
	this.channelList = [
		new Channel("tve1", "TVE1", "http://www.miguiatv.com/rss/tve1.xml"),
		new Channel("la2", "La2", "http://www.miguiatv.com/rss/la2.xml"),
		new Channel("antena3", "Antena3", "http://www.miguiatv.com/rss/antena3.xml"),
		new Channel("cuatro", "Cuatro", "http://www.miguiatv.com/rss/cuatro.xml"),
		new Channel("telecinco", "Telecinco", "http://www.miguiatv.com/rss/telecinco.xml"),
		new Channel("lasexta", "La Sexta", "http://www.miguiatv.com/rss/la-sexta.xml"),
		new Channel("clantve", "Clan", "http://www.miguiatv.com/rss/clan-tve-50.xml"),
		new Channel("teledeporte", "Teledeporte", "http://www.miguiatv.com/rss/teledeporte.xml"),
		new Channel("cnnplus", "CNN+", "http://www.miguiatv.com/rss/cnn-plus.xml"),
		new Channel("disneychannel", "Disney Channel", "http://www.miguiatv.com/rss/disney-channel.xml"),
		new Channel("40latino", "40 Latino", "http://www.miguiatv.com/rss/40-latino.xml"),
		new Channel("fdf", "FDF", "http://www.miguiatv.com/rss/factoria-de-ficcion.xml"),
		new Channel("cplus", "CANAL+", "http://www.miguiatv.com/rss/canal-plus.xml"),
		new Channel("cplus2", "CANAL+ 2", "http://www.miguiatv.com/rss/canal-plus-2.xml"),
		new Channel("axn", "AXN", "http://www.miguiatv.com/rss/axn.xml"),
		new Channel("tcm", "TCM", "http://www.miguiatv.com/rss/tcm.xml"),
		new Channel("cplus_accion", "C+ Acción", "http://www.miguiatv.com/rss/canal-plus-accion.xml"),
		new Channel("cplus_comedia", "C+ Comedia", "http://www.miguiatv.com/rss/canal-plus-comedia.xml"),
		new Channel("cplus_dcine", "C+ DCine", "http://www.miguiatv.com/rss/canal-plus-decine.xml"),
		new Channel("calle13", "Calle 13", "http://www.miguiatv.com/rss/calle-13.xml"),
		new Channel("cplus_futbol", "C+ Fútbol", "http://www.miguiatv.com/rss/canal-plus-futbol.xml"),
		new Channel("cplus_deportes", "C+ Deportes", "http://www.miguiatv.com/rss/canal-plus-deporte.xml"),
		new Channel("sportmania", "SPORTMANIA", "http://www.miguiatv.com/rss/sportmania.xml"),
		new Channel("cplus_golf", "C+ Golf", "http://www.miguiatv.com/rss/golf-plus.xml")
	];
	
	//this.NUMBER_OF_CHANNELS = 24;
	this.channelsCounter = 0;	 


	this.mainTab = this.dictionary.createTab({'name':_("Channels"),closeable:false})
	var div = document.createElement('div');
	// Creamos la vista con todos los logos
	for (var i=0;i<this.channelList.length;i++) {
		var channel = this.channelList[i];
		var img = document.createElement ('img');
		img.src = this.imageURL + channel.getId() + ".jpg";
		img.title = channel.getName();
		
		EzWebExt.addEventListener(img,"click",EzWebExt.bind(function(){
			this.show();
		},channel),false);
		
		
		
		
		div.appendChild (img);
	}

	this.mainTab.appendChild(div);
	
	this.currentTab = this.dictionary.createTab({'name':_("What's on TV now?"),closeable:false});
	this.dictionary.goToTab(this.mainTab.getId());
	this.currentDiv = document.createElement('div');
	this.currentTab.appendChild(this.currentDiv);

	this.interval = setInterval(EzWebExt.bind(function(){
		this.updateChannels();
	}, this), 300000);
}

ProgramacionTV.prototype.updateChannels = function() {
	for (var i=0; i<this.channelList.length; i++) {
		this.channelList[i].update();
	}
}

ProgramacionTV.prototype.updateCurrentTab = function() {
	this.channelsCounter++;
	if (this.channelsCounter < this.channelList.length) {
		return;
	}
	this.channelsCounter = 0;
	// Creo el titulo
	this.currentDiv.innerHTML = '';
	var div1 = document.createElement('div');
	EzWebExt.addClassName(div1, "cadena");
	this.currentDiv.appendChild(div1);
	var p = document.createElement('p');
	p.appendChild(document.createTextNode(_("What's on TV now?")));
	div1.appendChild(p);
	
	// Div que contendra la tabla
	var div2 = document.createElement('div');
	var table = document.createElement('table');
	var tbody = document.createElement('tbody');
	table.appendChild(tbody);
	EzWebExt.addClassName(table, "current");
	div2.appendChild(table);
	this.currentDiv.appendChild(div2);
	
	// 6 es el numero de canales principales para mostrar su informacion actual
	for (var i=0; i<6;i++) {
		var channel = this.channelList[i];
		var tr = tbody.insertRow(-1);
		var td1 = tr.insertCell(-1);
		var td2 = tr.insertCell(-1);
		var td3 = tr.insertCell(-1);
		var img = document.createElement('img');
		EzWebExt.addClassName(td2, "hora");
		EzWebExt.addClassName(td3, "programa");

		img.src = this.imageURL + channel.getId() + ".jpg";
		
		EzWebExt.addEventListener(img, "click", EzWebExt.bind(function(){
			this.show();
		},channel),false);
		
		
		td1.appendChild (img);
		
		td2.appendChild(document.createTextNode(channel.getCurrentTime()));
		td3.appendChild(document.createTextNode(channel.getCurrentTitle()));
		
		var context = {self:this, channel:channel};
		EzWebExt.addEventListener(td3, "click", EzWebExt.bind(function(e){
		this.self.showDescription(e.clientX, e.clientY, this.channel.getCurrentDescription(), 
									this.channel.getCurrentTime(), this.channel.getCurrentTitle(),
									this.channel.getName());
		}, context), false);
					
	}
}

// Funcion que mostrara la descripcion en un div
ProgramacionTV.prototype.showDescription = function(clientx, clienty, desc, time, title, channel) {
	
	if (desc.length > 2) {
		// Se hace esta comprobacion para que no muestre divs vacios
		var positionX, positionY;
		var divout = document.createElement('div');
		divout.id = "background";
		divout.style.cssText = "top:0;bottom:0;right:0;left:0;position:absolute;z-index:3000;background:white;filter: alpha(opacity=40); opacity: .40"
		
		EzWebExt.addEventListener(divout, "click", function(e){
			e = e ? e : window.event;
			if (e.stopPropagation) {
				e.stopPropagation();
				document.body.removeChild(divout);
				document.body.removeChild(div);
			}
			else {
				e.cancelBubble = true;
			}
			return false;
		}, false);
		
		//var tam_gadget = ProgramacionTV.prototype.getHeight;
		
		var div = document.createElement('div');
		div.innerHTML = '';
		div.id = "descripcion";
		div.appendChild(document.createTextNode(desc));
		div.style.cssText = 'z-index:3001; position:absolute; top: 0px; left: 0px;';
		
		document.body.appendChild(divout);
		document.body.appendChild(div);
		
		// Coloco el div
		var height_divout = divout.offsetHeight;
		var width_divout = divout.offsetWidth;
		var height_div = div.offsetHeight;
		var width_div = div.offsetWidth;
		var max_width = 210;
		
		// Comprobamos la posicion para ver si el div tiene que salir hacia arriba o hacia abajo
		if ((clienty + height_div) > height_divout) {
			var top = clienty - height_div;
			div.style.top = top.toString() + "px";
		}
		else {
			div.style.top = clienty.toString() + "px";
		}
		if ((clientx + max_width) > width_divout) {
			var left = width_divout - max_width;
			div.style.left = left.toString() + "px";
		}
		else {
			div.style.left = clientx.toString() + "px";
		}
	}
	this.descriptionEvent.set((desc)?desc:"");
	this.timeEvent.set((time)?time:"");
	this.titleEvent.set((title)?title:"");
	this.channelEvent.set((channel)?channel:"");
}


ProgramacionTV.prototype.showTab = function(tab) {
	this.dictionary.goToTab(tab.getId());
}

ProgramacionTV.prototype.newTab = function(name) {
	return this.dictionary.createTab({'name':name});
}

/* Instanciate the Gadget class */
ProgramacionTV = new ProgramacionTV();




var Channel = function(id, name, url) {
	this.id = id;
	this.name = name;
	this.url = url;
	this.tab = null;
	this.programs = [];
	this.lista_trs = [];
	this.update();
}

Channel.prototype.show = function() {
	if (this.tab == null) {
		this.tab = ProgramacionTV.newTab(this.name);
		this.tab.addEventListener("close", EzWebExt.bind(function(){
			this.tab = null;
			this.lista_trs = [];
		}, this));
	}
	this.draw();
	this.lista_trs = [];
	ProgramacionTV.showTab(this.tab);

}

Channel.prototype.update = function() {
	EzWebAPI.send_get(
		this.url,
		this, 
		this.onSuccessUpdate, 
		this.error);
}

Channel.prototype.error = function(response){

}

Channel.prototype.onSuccessUpdate = function(response) {
	this.programs = [];
	this.lista_trs = [];
	
	// Obtener los datos
	var children_title = response.responseXML.getElementsByTagName('title');
	var children_description = response.responseXML.getElementsByTagName('description');

	for (var i = 0; i < children_title.length; i++) {
	
		var child = children_title[i].firstChild.nodeValue;
		
		// Obtencion de datos
		var programa = child.split('-');
		var titulo = programa[0];
		var fecha = programa[programa.length - 1].split(' ');
		var hora = fecha[fecha.length - 1];
		var cad_description = children_description[i].firstChild.nodeValue.split('>');
		var description = cad_description[cad_description.length - 1];
		// Inserto en la lista de horas y programas
		this.programs.push({
			time: hora,
			title: titulo,
			description: description
		});
	}
	if (this.tab != null) {
		this.draw();
	}
	ProgramacionTV.updateCurrentTab();
}

Channel.prototype.draw = function () {
	this.tab.wrapperElement.innerHTML = "";
	// Creo un div para el nombre de la cadena y otro para la programacion
	var div1 = document.createElement('div');
	EzWebExt.addClassName(div1, "cadena");
	var div2 = document.createElement('div');
	var channel = this;
	// Creo la tabla que contendra la programacion
	var table = document.createElement('table');
	table.id = "tabla";
	div2.appendChild(table);
	var tbody = document.createElement('tbody');
	table.appendChild(tbody);
	
	
	for (var i=0; i<this.programs.length; i++) {
		if (i == 0) {
/*			var p = document.createElement('p');

			p.appendChild(document.createTextNode(this.programs[i].title));
			div1.appendChild(p);
			this.tab.appendChild(div1); */
			// Caso de que no contenga mas que el titulo
			if (this.programs.length == 1) {
				var p2 = document.createElement('p');
				p2.appendChild(document.createTextNode("Sin información"));
				EzWebExt.addClassName(p2, "cadena");
				this.tab.appendChild(p2);
			}

		}
		else {

			var tr = tbody.insertRow(-1);
			if (i % 2 == 0) {
				EzWebExt.addClassName(tr, "par");
			}
			else {
				EzWebExt.addClassName(tr, "impar");
			}
			var td1 = tr.insertCell(-1);
			EzWebExt.addClassName(td1,"programa");
			var td2 = tr.insertCell(-1);
			EzWebExt.addClassName(td2, "hora");
			
			// Creacion de la estructura
			td1.appendChild(document.createTextNode(this.programs[i].title));
			td2.appendChild(document.createTextNode(this.programs[i].time));
			div2.appendChild(table);
			this.tab.appendChild(div2);
			
			var description = this.programs[i].description;
			var title = this.programs[i].title;
			var time = this.programs[i].time;

			var context = {
				self: ProgramacionTV,
				description: description,
				title: title,
				time: time,
				channel: this.getName()
			};

			EzWebExt.addEventListener(td1, "click", EzWebExt.bind(function(e){
				this.self.showDescription(e.clientX, e.clientY, this.description, this.time, this.title, this.channel);
			}, context), false);
			
			this.lista_trs.push(tr);
		}
	}
	this.getCurrent();
}

// Getters

Channel.prototype.getName = function() {
	return this.name;
}

Channel.prototype.getId = function() {
	return this.id;
}

Channel.prototype.getCurrentTitle = function() {
	var hora_actual = new Date();
	var enc = false;
	var hora_p;
	var ms_actuales = hora_actual.getTime();
	var dia = hora_actual.getDate();
	var mes = hora_actual.getMonth();
	var ano = hora_actual.getFullYear();
	var i = 0;
	var id_actual = 0;
	
	while (i<this.programs.length & !enc) {
		// Obtengo los numeros de hora y minutos
		var aux = this.programs[i].time.split(':');
		if (aux[0][0]==0) {
			hora_p = parseInt(aux[0][1]);
		} else {
			hora_p = parseInt(aux[0]);
		}
		var minutos_p = parseInt(aux[1]);
		// Creo otro objeto fecha
		var fecha_aux = new Date();
		fecha_aux.setDate(dia);
		fecha_aux.setMonth(mes);
		fecha_aux.setYear(ano);
		fecha_aux.setHours(hora_p);
		fecha_aux.setMinutes(minutos_p);
		// Comparo los ms
		if (ms_actuales<fecha_aux.getTime()) {
			enc = true;
			id_actual = i-1;	
		} else {
			i++;
		}
		
	}
	if (i==this.programs.length) {
		id_actual = i-1;
	}
	try {
		return this.programs[id_actual].title;
	}
	catch(e) {
		return "Sin información";
	}
}

Channel.prototype.getCurrentTime = function() {
	var hora_actual = new Date();
	var enc = false;
	var hora_p;
	var ms_actuales = hora_actual.getTime();
	var dia = hora_actual.getDate();
	var mes = hora_actual.getMonth();
	var ano = hora_actual.getFullYear();
	var i = 0;
	var id_actual = 0;
	
	while (i<this.programs.length & !enc) {
		// Obtengo los numeros de hora y minutos
		var aux = this.programs[i].time.split(':');
		if (aux[0][0]==0) {
			hora_p = parseInt(aux[0][1]);
		} else {
			hora_p = parseInt(aux[0]);
		}
		var minutos_p = parseInt(aux[1]);
		// Creo otro objeto fecha
		var fecha_aux = new Date();
		fecha_aux.setDate(dia);
		fecha_aux.setMonth(mes);
		fecha_aux.setYear(ano);
		fecha_aux.setHours(hora_p);
		fecha_aux.setMinutes(minutos_p);
		// Comparo los ms
		if (ms_actuales<fecha_aux.getTime()) {
			enc = true;
			id_actual = i-1;	
		} else {
			i++;
		}
		
	}
	if (i==this.programs.length) {
		id_actual = i-1;
	}
	try {
		return this.programs[id_actual].time;
	}
	catch(e) {
		return "00:00"
	}
}

Channel.prototype.getCurrentDescription = function() {
	var hora_actual = new Date();
	var enc = false;
	var hora_p;
	var ms_actuales = hora_actual.getTime();
	var dia = hora_actual.getDate();
	var mes = hora_actual.getMonth();
	var ano = hora_actual.getFullYear();
	var i = 0;
	var id_actual = 0;
	
	while (i<this.programs.length & !enc) {
		// Obtengo los numeros de hora y minutos
		var aux = this.programs[i].time.split(':');
		if (aux[0][0]==0) {
			hora_p = parseInt(aux[0][1]);
		} else {
			hora_p = parseInt(aux[0]);
		}
		var minutos_p = parseInt(aux[1]);
		// Creo otro objeto fecha
		var fecha_aux = new Date();
		fecha_aux.setDate(dia);
		fecha_aux.setMonth(mes);
		fecha_aux.setYear(ano);
		fecha_aux.setHours(hora_p);
		fecha_aux.setMinutes(minutos_p);
		// Comparo los ms
		if (ms_actuales<fecha_aux.getTime()) {
			enc = true;
			id_actual = i-1;	
		} else {
			i++;
		}
		
	}
	try {
		if (i == this.programs.length) {
			id_actual = i - 1;
		}
		return this.programs[id_actual].description;
	}
	catch(e){
		return "";
	}
}

Channel.prototype.getCurrent = function() {
	var hora_actual = new Date();
	var enc = false;
	var hora_p;
	var ms_actuales = hora_actual.getTime();
	var dia = hora_actual.getDate();
	var mes = hora_actual.getMonth();
	var ano = hora_actual.getFullYear();
	var i = 0;
	var id_actual = 0;
	
	while (i < this.programs.length & !enc) {
		// Obtengo los numeros de hora y minutos
		var aux = this.programs[i].time.split(':');
		if (aux[0][0] == "0") {
			hora_p = parseInt(aux[0][1]);
		}
		else {
			hora_p = parseInt(aux[0]);
		}
		var minutos_p = parseInt(aux[1]);
		// Creo otro objeto fecha
		var fecha_aux = new Date();
		fecha_aux.setDate(dia);
		fecha_aux.setMonth(mes);
		fecha_aux.setYear(ano);
		fecha_aux.setHours(hora_p);
		fecha_aux.setMinutes(minutos_p);
		// Comparo los ms
		if (ms_actuales < fecha_aux.getTime()) {
			enc = true;
			id_actual = i - 2;
		}
		else {
			i++;
		}
		
	}
	if (i == this.programs.length) {
		id_actual = i - 2;
	}
	try {

		EzWebExt.appendClassName(this.lista_trs[id_actual],'actual');
	}
	catch(e){}
}

