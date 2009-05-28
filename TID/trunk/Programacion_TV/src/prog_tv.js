var dictionary = new StyledElements.StyledNotebook({'id':'dictionary'});
var tabP;
/*
var canales = new Array('tve1','la2','antena3','cuatro','telecinco','lasexta','tve24h','clantve',
						'teledeporte','cnnplus','neox','nova','telecinco2','veo','tiendaenveo',
						'sony','fdf','disneychannel','40latino','intereconomiatv','hogar10');
*/
var canales = new Array('tve1','la2','antena3','cuatro','telecinco','lasexta','clantve',
						'teledeporte','cnnplus','disneychannel','40latino');

var hora_actual = new Date();


var ProgramacionTV = function() {
    /* Call to the parent constructor */
    EzWebGadget.call(this, {translatable: "false"});
}

ProgramacionTV.prototype = new EzWebGadget(); /* Extend from EzWebGadget */

ProgramacionTV.prototype.resourcesURL = "http://demo.ezweb.morfeo-project.org/repository/Programacion_TV/src"; 

ProgramacionTV.prototype.init = function() {
	dictionary.insertInto(document.body);
	
	var tab1 = dictionary.createTab({'name':'Cadenas',closeable:false})
	var img, img2, img3, img4, img5, img6;
	var urllogo;

	var div = document.createElement('div');
	
	// Creamos la vista con todos los logos
	for (var i=0;i<canales.length;i++) {
		img = document.createElement ('img');
		img.setAttribute('id', canales[i]);
		urllogo = 'http://demo.ezweb.morfeo-project.org/repository/Programacion_TV/logos/logo'+canales[i]+'.jpg'
		img.setAttribute('src', urllogo);
		img.setAttribute('onClick','seleccionCadena(\''+canales[i]+'\')');
		div.appendChild (img);
	}

	tab1.appendChild (div);
	dictionary.goToTab(tab1.getId());
	
	//displayParrilla();

}

/* Instanciate the Gadget class */
ProgramacionTV = new ProgramacionTV();

// Funcion que creara la pestana donde se encontrara la programacion actual
function displayParrilla() {
	var tab2 = dictionary.createTab({'name':'Parrilla',closeable:false});
	
}

// Funcion que mostrara la programacion de la cadena seleccionada
function seleccionCadena(canal) {
	var url;

	switch (canal) {
		case "tve1":
			//alert("tve1");
			tabP = dictionary.createTab({'name':'TVE1'});
			url = "http://www.miguiatv.com/rss/tve1.xml";
			break;
		case "la2":
			//alert("tve2");
			tabP = dictionary.createTab({'name':'La2'});
			url = "http://www.miguiatv.com/rss/la2.xml";
			break;
		case "antena3":
			//alert("antena3");
			tabP = dictionary.createTab({'name':'Antena3'});
			url = "http://www.miguiatv.com/rss/antena3.xml";
			break;
		case "cuatro":
			//alert("cuatro");
			tabP = dictionary.createTab({'name':'Cuatro'});
			url = "http://www.miguiatv.com/rss/cuatro.xml";
			break;
		case "telecinco":
			//alert("telecinco");
			tabP = dictionary.createTab({'name':'Telecinco'});
			url = "http://www.miguiatv.com/rss/telecinco.xml";
			break;
		case "lasexta":
			//alert("lasexta");
			tabP = dictionary.createTab({'name':'La Sexta'});
			url = "http://www.miguiatv.com/rss/la-sexta.xml";
			break;
		/*
case "tve24h":
			tabP = dictionary.createTab({'name':'24h'});
			url = "http://www.miguiatv.com/rss/24-horas.xml";
			break;
*/
		case "clantve":
			tabP = dictionary.createTab({'name':'Clan'});
			url = "http://www.miguiatv.com/rss/clan-tve-50.xml";
			break;
		case "teledeporte":
			tabP = dictionary.createTab({'name':'TeleDeporte'});
			url = "http://www.miguiatv.com/rss/teledeporte.xml";
			break;
		case "cnnplus":
			tabP = dictionary.createTab({'name':'CNN+'});
			url = "http://www.miguiatv.com/rss/cnn-plus.xml";
			break;
/*
		case "neox":
			tabP = dictionary.createTab({'name':'Neox'});
			url = "http://www.miguiatv.com/rss/neox.xml";
			break;
		case "nova":
			tabP = dictionary.createTab({'name':'Nova'});
			url = "http://www.miguiatv.com/rss/nova.xml";
			break;
		case "telecinco2":
			tabP = dictionary.createTab({'name':'Telecinco2'});
			url = "http://www.miguiatv.com/rss/telecinco2.xml";
			break;
		case "veo":
			tabP = dictionary.createTab({'name':''});
			url = "http://www.miguiatv.com/rss/.xml";
			break;
		case "tiendaenveo":
			tabP = dictionary.createTab({'name':''});
			url = "http://www.miguiatv.com/rss/.xml";
			break;
		case "sony":
			tabP = dictionary.createTab({'name':''});
			url = "http://www.miguiatv.com/rss/.xml";
			break;
		case "fdf":
			tabP = dictionary.createTab({'name':'FDF'});
			url = "http://www.miguiatv.com/rss/factoria-de-ficcion.xml";
			break;
*/
		case "disneychannel":
			tabP = dictionary.createTab({'name':'Disney Channel'});
			url = "http://www.miguiatv.com/rss/disney-channel.xml";
			break;
		case "40latino":
			tabP = dictionary.createTab({'name':'40 Latino'});
			url = "http://www.miguiatv.com/rss/40-latino.xml";
			break;
/*
		case "intereconomiatv":
			tabP = dictionary.createTab({'name':''});
			url = "http://www.miguiatv.com/rss/.xml";
			break;
		case "hogar10":
			tabP = dictionary.createTab({'name':''});
			url = "http://www.miguiatv.com/rss/.xml";
			break;
*/
		
			
	}
	// Realizamos la peticion a la url
	EzWebAPI.send_get(url, this, onSuccess, onError);
	dictionary.goToTab(tabP.getId());
}

// Funcion que parsea el XML correspondiente
function onSuccess(response) {
	var children_title;
	var children_description;
	var p;
	var tr, td1, td2;
	var child;
	var titulo;
	var programa;
	var nombre;
	var fecha;
	var hora;
	var cad_description;
	var description;
	var div1, div2;
	var table;
	var paridad;
	var horas = new Array();
	var programas = new Array();
	//var ids = new Array();
	var elem;
	
	children_title = response.responseXML.getElementsByTagName('title');
	children_description = response.responseXML.getElementsByTagName('description');
	
	// Creo un div para el nombre de la cadena y otro para la programacion
	div1 = document.createElement('div');
	div1.setAttribute('id','cadena');
	div2 = document.createElement('div');
	div2.setAttribute('id','programacion');
	
	// Creo la tabla que contendra la programacion
	table = document.createElement('table');
	table.setAttribute('border','1');
	table.setAttribute('id','tabla');
	div2.appendChild(table);
	
	

	for (var i=0;i<children_title.length;i++) {
		
		child = children_title[i].firstChild.nodeValue;
		
		if (i==0) {
			p = document.createElement ('p');
			titulo = child.split('-');
			child = titulo[0];
			p.appendChild(document.createTextNode(child));
			div1.appendChild(p);
			tabP.appendChild(div1);
		} else {
			tr = document.createElement('tr');
			tr.setAttribute('id',i);
			elem = programas.push(tr);
			if (i%2==0){
				tr.setAttribute('class','par');
			} else {
				tr.setAttribute('class','impar');
			}
			td1 = document.createElement ('td');
			td1.setAttribute('id','programa');
			td2 = document.createElement ('td');
			td2.setAttribute('id','hora');
			
			// Obtencion de datos
			programa = child.split('-');
			titulo = programa[0];
			fecha = programa[programa.length-1].split(' ');
			hora = fecha[fecha.length-1];
			// Inserto en la lista de horas y programas
			elem = horas.push(hora);
			//elem = programas.push(titulo);
			//child = hora+' '+titulo;
			cad_description = children_description[i].firstChild.nodeValue.split('>');
			description = cad_description[cad_description.length-1];
			td1.setAttribute('title',description);
			
			// Creacion de la estructura
			td1.appendChild(document.createTextNode(titulo));
			td2.appendChild(document.createTextNode(hora));
			
			tr.appendChild(td2);
			tr.appendChild(td1);
			table.appendChild(tr);
			div2.appendChild(table);
			tabP.appendChild(div2);
		}
		
	}
	obtenerActual(horas,programas);
	
}

function onError() {
	alert("Error en la peticion");
}


// Funcion que obtendra el programa que se esta emitiendo en este momento
function obtenerActual(horas,programas) {

	var ms_actuales = hora_actual.getTime();
	var dia = hora_actual.getDate();
	var mes = hora_actual.getMonth();
	var ano = hora_actual.getFullYear();
	var fecha_aux = new Date(); 
	var enc = false;
	var aux;
	var hora_p, minutos_p;
	var i = 0;
	var id_actual;
	var tr_actual;

	while (i<horas.length & !enc) {
		// Obtengo los numeros de hora y minutos
		aux = horas[i].split(':');
		if (aux[0][0]==0) {
			hora_p = parseInt(aux[0][1]);
		} else {
			hora_p = parseInt(aux[0]);
		}
		minutos_p = parseInt(aux[1]);
		// Creo otro objeto fecha
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
	if (i==horas.length) {
		id_actual = i-1;
	}
	tr_actual = programas[id_actual];
	tr_actual.setAttribute('class','actual');
	 
}
