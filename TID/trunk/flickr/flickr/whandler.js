/* 
* This code is licensed under terms shown on this link:
* http://forge.morfeo-project.org/wiki/index.php/Gadgets_2009_License
*/

var frameNotices = (function() {
	var frame = document.createElement('div');
	frame.setAttribute("class", "frame");
	frame.setAttribute("id", "notices");

	frame.error = function(msg) {
		frame.clean();

		var err = document.createElement('div');
		err.setAttribute("class", "error");
		err.innerHTML = msg;
		frame.appendChild(err);
		setTimeout("frameNotices.clean()", 5000);
	};

	frame.info = function(msg) {
		frame.clean();

		var info = document.createElement('div');
		info.setAttribute("class", "info");
		info.innerHTML = msg;
		frame.setAttribute("class", "popup");
		frame.appendChild(info);
		setTimeout("frameNotices.clean()", 5000);
	};

	frame.clean = function() {
		frame.innerHTML = '';
		frame.setAttribute("class", "frame");
	};

	return frame;
})();

var frameLogin = (function() {
	var frame = document.createElement('div');
	frame.setAttribute("id", "flogin");

	var box = document.createElement('div');
	box.setAttribute("id", "fbox");
	box.setAttribute("class", "box text");
	box.innerHTML = "<p>Para poder acceder a fotografias privadas es necesario que primero se registre en Flickr.</p>\
	<p>Si no desea registrarse, presione el boton <em>Continue</em> y podrá seguir accediendo al contenido público \
	<p>Al presionar el boton <em>Login</em> comenzará el proceso de registro. Para ello, se abrirá una nueva ventana \
	en la que podrá aceptar las credenciales, y al terminar deberá regresar al gadget para porder continuar.</p>";
	frame.appendChild(box);

	var button_layer = document.createElement('div');
	button_layer.setAttribute("id", "fbuttons");
	button_layer.setAttribute("class", "flickr_buttons");
	
	var cbutton = document.createElement('span');
	cbutton.innerHTML = "Continue";
	cbutton.setAttribute('class', 'buttom accept');
	cbutton.addEventListener('click', 
		function (ev){
			access.set('public');
			showPhotos();		
		}, true);

	var lbutton = document.createElement('span');
	lbutton.innerHTML = "Login";
	lbutton.setAttribute('class', 'buttom accept');
	lbutton.addEventListener('click', 
		function (ev){
			access.set('private');		
			login();		
		}, true);

	button_layer.appendChild(cbutton);
	button_layer.appendChild(lbutton);
	frame.appendChild(button_layer);

	frame.show = function() {
		frame.style.display = '';
	};
	frame.hidden = function() {
		frame.style.display = 'none';
	};

	return frame;
})();

var frameInitSession = (function() {
	var frame = document.createElement('div');
	
	var box = document.createElement('div');
	box.setAttribute("class", "box text");
	box.innerHTML = "<p>Despues de aceptar las credenciales en la ventana que se acaba de abrir, regrese a esta ventana y continue con el <em>Inicio de Sesión</em></p>";
	frame.appendChild(box);

	var butom = document.createElement('span');
	butom.innerHTML = "Iniciar Sessión";
	butom.setAttribute('class', 'buttom right accept');
	butom.addEventListener('click', initSession, true);
	frame.appendChild(butom);

	frame.show = function() {
		frame.style.display = '';
	};
	frame.hidden = function() {
		frame.style.display = 'none';
	};

	return frame;
})();


var headerLayer = (function() {
	// Creates the header
	var header = document.createElement ('div');
	header.setAttribute ('id', 'header');
	var img = document.createElement('img');
	img.setAttribute ('id', 'logo');
	img.setAttribute ('src', 'http://ezweb.tid.es/repository/ezweb-gadgets/flickr/flickr_3.31/img/flickr.png');
	var a = document.createElement ('a');
	a.setAttribute ('href', 'http://www.flickr.com');
	a.setAttribute ('target', '_blank');
	a.setAttribute ('title', 'Flickr');
	a.appendChild(img);
	var imglogout = document.createElement('img');
	imglogout.setAttribute ('id', 'logout_photo');
	imglogout.setAttribute ('title', 'Logout');
	imglogout.src ='http://ezweb.tid.es/repository/ezweb-gadgets/flickr/flickr_3.31/img/logout.png';
	imglogout.setAttribute ('onclick', 'logout();');
	var imgrefresh = document.createElement('img');
	imgrefresh.setAttribute ('id', 'refreshimg');
	imgrefresh.setAttribute ('title', 'Refresh');
	imgrefresh.src ='http://ezweb.tid.es/repository/ezweb-gadgets/flickr/flickr_3.31/img/refresh.png';
	imgrefresh.setAttribute ('onclick', 'setNumberOfPhotos();');
	header.appendChild (imgrefresh);
	header.appendChild (imglogout);
	header.appendChild (a);

	header.show = function() {
		this.style.display = '';
	};
	header.hidden = function() {
		this.style.display = 'none';
	};

	return header;
})();

var searchLayer = (function() {
	// Creates the header
	var form = document.createElement ('div');
	form.setAttribute ('id', 'search');

	var table = document.createElement('table');
	var row = document.createElement('tr');
	table.appendChild(row);

	var inCol = document.createElement('td');
	inCol.setAttribute ("id", "search_col");
	
	var searchPhotos = function (ev){
		var searchText = document.getElementById('query').value;
		if (searchText){
			var searchOps = document.getElementById('searchOps');
			var opt = searchOps.options[searchOps.selectedIndex].value;
			if (opt == 'photo'){
				displayFromPhoto(searchText);
			} else if (opt == 'people'){
				peopleKeywordHandler(searchText);
			} else {
				groupKeywordHandler(searchText);
			}
		}
	};

	var inp = document.createElement('input');
	inp.setAttribute ('id', 'query');
	inp.setAttribute ("type", "text");
	inp.addEventListener('keypress', 
		function (ev){
			var ENTER_CODE = 13;		
			var code = ev.keyCode ? ev.keyCode : ev.which;
			if (code == ENTER_CODE) {
				searchPhotos();	
			}
		}, true);
	inCol.appendChild(inp);
	
	var boCol = document.createElement('td');
	var buttom = document.createElement('span');
	buttom.innerHTML = "Buscar";
	buttom.setAttribute('class', 'buttom');
	buttom.addEventListener('click', searchPhotos, true);
	boCol.appendChild(buttom);

	var seCol = document.createElement('td');
	var list = document.createElement('select');
	list.setAttribute('id', 'searchOps');
	addItemToList (list, 'opphoto', 'Fotografias', 'photo', true);
	addItemToList (list, 'oppeople', 'Personas', 'people');
	addItemToList (list, 'opgroup', 'Grupos', 'group');
	seCol.appendChild(list);

	row.appendChild(inCol);
	row.appendChild(boCol);
	row.appendChild(seCol);

	form.appendChild(table);

	form.show = function() {
		this.style.display = '';
	};
	form.hidden = function() {
		this.style.display = 'none';
	};

	return form;
})();


var contentLayer = (function() {
	// Creates the content layer
	var content = document.createElement ('div');
	content.setAttribute ('id', 'content_div');

	content.show = function() {
		this.style.display = '';
		displayPhotos();
		resetInterval(time.get());
	};
	content.hidden = function() {
		this.style.display = 'none';
		try {
			clearInterval (interval);
		}catch(e){}
	};

	return content;
})();


var footerLayer = (function() {
	// Creates the footer
	var footer = document.createElement ('div');
	footer.setAttribute ('id', 'footer_div');
	img = document.createElement ('img');
	img.src = 'http://ezweb.tid.es/repository/ezweb-gadgets/flickr/flickr_3.31/img/go-first.png';
	img.setAttribute ('title', 'Go First');
	img.addEventListener ('click', function (e){setArrays(null,0);}, false);
	footer.appendChild (img);
	img = document.createElement ('img');
	img.src = 'http://ezweb.tid.es/repository/ezweb-gadgets/flickr/flickr_3.31/img/go-previous.png';
	img.setAttribute ('title', 'Go Previous');
	img.addEventListener ('click', function (e){setArrays(null,1);}, false);
	footer.appendChild (img);
	img = document.createElement ('img');
	img.src = 'http://ezweb.tid.es/repository/ezweb-gadgets/flickr/flickr_3.31/img/go-next.png';
	img.setAttribute ('title', 'Go Next');
	img.addEventListener ('click', function (e){setArrays(null,2);}, false);
	footer.appendChild (img);
	img = document.createElement ('img');
	img.src = 'http://ezweb.tid.es/repository/ezweb-gadgets/flickr/flickr_3.31/img/go-last.png';
	img.setAttribute ('title', 'Go Last');
	img.addEventListener ('click', function (e){setArrays(null,3);}, false);
	footer.appendChild (img);

	footer.show = function() {
		this.style.display = '';
	};
	footer.hidden = function() {
		this.style.display = 'none';
	};

	return footer;
})();

function error(msg) {
	frameNotices.error(msg);
}

function showFlickrLogin() {
	frameLogin.show();
	frameInitSession.hidden();
	headerLayer.hidden();
	searchLayer.hidden();
	contentLayer.hidden();
	footerLayer.hidden();
}

function showInitSession() {
	frameLogin.hidden();
	frameInitSession.show();
	headerLayer.hidden();
	searchLayer.hidden();
	contentLayer.hidden();
	footerLayer.hidden();
}

function showPhotos() {
	frameNotices.clean();
	frameLogin.hidden();
	frameInitSession.hidden();
	headerLayer.show();
	searchLayer.show();
	contentLayer.show();
	footerLayer.show();
}

/* Window Load Event (MAIN) */
window.addEventListener('load', function() {
	
	document.body.appendChild(frameNotices);
	document.body.appendChild(frameLogin);
	document.body.appendChild(frameInitSession);
	document.body.appendChild(headerLayer);
	document.body.appendChild(searchLayer);
	document.body.appendChild(contentLayer);
	document.body.appendChild(footerLayer);

	frameLogin.hidden();
	frameInitSession.hidden();
	headerLayer.hidden();
	searchLayer.hidden();
	contentLayer.hidden();
	footerLayer.hidden();

	authenticate();
}, true);

/* DOM utils */
function addItemToList(list, id, text, value, selected) {
	var option = new Option(text, value);
	option.id = id;
	if (selected){
		option.selected = true;	
	}
	try {
        	list.add(option);
	} catch (e) {
        	list.appendChild(option);
	}
}

