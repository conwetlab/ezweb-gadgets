var auth_token = EzWebAPI.createRWGadgetVariable("auth_token");

/*
var frameLoading = (function() {
	var frame = document.createElement('div');

  return frame;
})();
*/


var frameNotices = (function() {
	var frame = document.createElement('div');
	frame.setAttribute("class", "frame");
	frame.setAttribute("id", "notices");

	frame.error = function(msg) {
		var err = document.createElement('div');
		err.setAttribute("class", "error");
		err.innerHTML = msg;
		frame.appendChild(err);
	}

	frame.info = function(msg) {
		var info = document.createElement('div');
		info.setAttribute("class", "info");
		info.innerHTML = msg;
		frame.appendChild(info);
	}

	frame.clean = function() {
		frame.innerHTML = '';
	}

	return frame;
})();

var frameLogin = (function() {
	var frame = document.createElement('div');

	var box = document.createElement('div');
	box.setAttribute("class", "box text");
	box.innerHTML = "<p>Para poder subir sus fotos es necesario que se registre primero en Flickr.</p>\
	<p>Cuando presione el boton <em>Login</em> se abrirá una nueva ventana para que acepte \
	las credenciales y al terminar deberá regresar al gadget para porder continuar.</p>";
	frame.appendChild(box);

	var butom = document.createElement('span');
	butom.innerHTML = "Login";
	butom.setAttribute('class', 'buttom right accept');
	butom.addEventListener('click', login, true);
	box.appendChild(butom);

	frame.show = function() {
		frame.style.display = '';
	}
	frame.hidden = function() {
		frame.style.display = 'none';
	}

	return frame;
})();

var frameInitSession = (function() {
	var frame = document.createElement('div');
	
	var box = document.createElement('div');
	box.setAttribute("class", "box text");
	box.innerHTML = "<p>Despues de aceptar las credenciales en la ventana que se acaba de abrrir, regrese a esta ventana y continue con el <em>Inicio de Sesión</em></p>";
	frame.appendChild(box);

	var butom = document.createElement('span');
	butom.innerHTML = "Iniciar Sessión";
	butom.setAttribute('class', 'buttom right accept');
	butom.addEventListener('click', initSession, true);
	frame.appendChild(butom);

	frame.show = function() {
		frame.style.display = '';
	}
	frame.hidden = function() {
		frame.style.display = 'none';
	}

	return frame;
})();


var frameSendPhoto = (function() {
	var frame = document.createElement('div');
	frame.setAttribute('class', 'frame');
	frame.setAttribute('id', 'send_photo');

	var logout = document.createElement('span');
	logout.innerHTML = 'Logout';
	logout.setAttribute('id', 'logout');
	frame.appendChild(logout);
	logout.addEventListener('click', function(){
		setAuthToken('');
		autenticate();
	}, true);

	var title = document.createElement('h1');
	title.innerHTML = "Cargar una foto";
	frame.appendChild(title);

	var form = document.createElement('form');
	form.setAttribute('method', 'post');
	form.setAttribute('action', 'http://api.flickr.com/services/upload/');
	form.setAttribute('enctype', "multipart/form-data");
	form.setAttribute('target', 'flickrIFranePhoto');
	frame.appendChild(form);

	var api_sig = document.createElement('input');
	api_sig.setAttribute('name', 'api_sig');
	api_sig.setAttribute('type', 'text');
	api_sig.style.display = "none";

	var api_key = document.createElement('input');
	api_key.setAttribute('name', 'api_key');
	api_key.setAttribute('type', 'text');
	api_key.style.display = "none";

	var auth_token = document.createElement('input');
	auth_token.setAttribute('name', 'auth_token');
	auth_token.setAttribute('type', 'text');
	auth_token.style.display = "none";

	var lPhoto = document.createElement('label');
	lPhoto.innerHTML = "Fichero";

	var iPhoto = document.createElement('input');
	iPhoto.setAttribute('name', 'photo');
	iPhoto.setAttribute('type', 'file');

	var lTitle = document.createElement('label');
	lTitle.innerHTML = "Titulo";

	var iTitle = document.createElement('input');
	iTitle.setAttribute('name', 'title'); 
	iTitle.setAttribute('type', 'text');

	var lDescription = document.createElement('label');
	lDescription.innerHTML = "Descripción";

	var iDescription = document.createElement('input');
	iDescription.setAttribute('name', 'description');
	iDescription.setAttribute('type', 'text');


	var enviar = document.createElement('buttom');
	enviar.innerHTML = "Cargar Foto";
	enviar.setAttribute('class', 'buttom accept');


	form.appendChild(api_sig);
	form.appendChild(api_key);
	form.appendChild(auth_token);

	var p = document.createElement('p');
	p.appendChild(iTitle);
	p.appendChild(lTitle);
	form.appendChild(p);

	p = document.createElement('p');
	p.appendChild(iDescription);
	p.appendChild(lDescription);
	form.appendChild(p);

	p = document.createElement('p');
	p.appendChild(iPhoto);
	form.appendChild(p);

	p = document.createElement('div');
	p.setAttribute('class', 'buttoms');
	p.appendChild(enviar);
	frame.appendChild(p);

	var iframe = document.createElement('iframe');
	iframe.style.display = "none";
	iframe.setAttribute('name', 'flickrIFranePhoto');
	frame.appendChild(iframe);


	var x = false;

	enviar.addEventListener('click', function(e) { 
		api_sig.value = flickr.signParams({
			title: iTitle.value,
			description: iDescription.value,
			api_key: api_key.value,
			auth_token: auth_token.value
		});

		if (!x) {
			x = true;
			iframe.addEventListener('load', function(){
				frame.cleanForm();
				notices.clean();
				notices.info("Imagen enviada a flickr");
			}, true);
		}
		form.submit();
		return true;
	}, false);

	frame.show = function() {
		frame.style.display = '';
	}
	frame.hidden = function() {
		frame.style.display = 'none';
	}

	frame.setAPIKey = function(value) {
		api_key.value = value;
	}

	frame.setAuthToken = function(value) {
		auth_token.value = value;
	}

	frame.cleanForm = function() {
		iTitle.value = '';
		iDescription.value = '';
		iPhoto.value = '';
	}

  return frame;
})();

frameSendPhoto.setAPIKey(flickr.key);;


/* Window Load Event (MAIN) */
window.addEventListener('load', function() {

	document.body.appendChild(frameNotices);
//	document.body.appendChild(frameLoading);
	document.body.appendChild(frameLogin);
	document.body.appendChild(frameInitSession);

	document.body.appendChild(frameSendPhoto);

	frameSendPhoto.hidden();
	frameLogin.hidden();
	frameInitSession.hidden();

	autenticate();
}, true);

function setAuthToken(token) {
	auth_token.set(token);
}

function getAuthToken() {
	return auth_token.get();
}

function error(msg) {
	frameNotices.error(msg)
}

function showInitSession() {
	frameLogin.hidden();
	frameSendPhoto.hidden();
	frameInitSession.show();
}

function showFlickrLogin() {
	frameInitSession.hidden();
	frameSendPhoto.hidden();
	frameLogin.show();
}

function showSendPhotoForm() {
	frameInitSession.hidden();
	frameLogin.hidden();
	frameSendPhoto.show();
}

function login() {
	frob = null;
	getFrob(
		function(value){
			frob = value
			showInitSession();
		},
		function(err){
			error(err);
			showFlickrLogin()
		}
	);
}

function logout() {
	setAuthToken('');
	showFlickrLogin();
}

function initSession()
{
	if (!frob)
		showFlickrLogin();
	else
		getToken(frob, auth_success, auth_fail);
}

function autenticate()
{
	if (!getAuthToken())
		showFlickrLogin();
	else
		validateToken(auth_success, auth_fail);
}

function auth_success(token, user)
{
	setAuthToken(token);
	frameSendPhoto.setAuthToken(token);
	showSendPhotoForm();
}

function auth_fail(msg)
{
	error(msg);
	showFlickrLogin();
}

function validateToken(onSuccess, onError)
{
	checkToken(getAuthToken(),
		function(token, perms, user)
		{
			if (perms != 'write')
				onError("El token no tiene permisos de es")
			else
				onSuccess(token, user)
		},
		function(e)
		{
			onError(e)
		}
	);
}

function getFrob(onSuccess, onError)
{
	flickr.auth.getFrob(
		function(resp) {
			frob = resp.frob._content;
			var url = flickr.auth.getLoginURL('write', frob);
			window.open(url, 'FlickrLogin');
			onSuccess(frob);
		},
		function(resp) {
			onError("Ocurrio un error al conectar con flikr");
		}
	);
}

function getToken(frob, onSuccess, onError)
{
	flickr.auth.getToken(frob,
		function(resp)
		{
			var user  = resp.auth.user;
			var perms = resp.auth.perms._content;
			var token = resp.auth.token._content;
			onSuccess(token, perms, user);
		},
		function(resp)
		{
			onError('Ocurrio un error al conectar con flikr');
		}
	);
}

function checkToken(token, onSuccess, onError)
{
	flickr.auth.checkToken(token,
		function(resp)
		{
			var user  = resp.auth.user;
			var perms = resp.auth.perms._content;
			var token = resp.auth.token._content;
			onSuccess(token, perms, user);
		},
		function(resp)
		{
			onError('Ocurrio un error al conectar con flikr')
		}
	);
}



