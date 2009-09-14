var auth_token = EzWebAPI.createRWGadgetVariable("auth_token");
frameSendPhoto.setAPIKey(flickr.key);;

/*
var frameLoading = (function() {
	var frame = document.createElement('div');

  return frame;
})();
*/


var frameScreenBlocker = (function() {

	var frame = document.createElement('div');
	frame.setAttribute("id", "loading-indicator");

	frame.show = function() {
		frame.style.display = '';
//		frame.childNodes[0].childNodes[1].style.display = 'none';
	}
	frame.hidden = function() {
		frame.style.display = 'none';
//		frame.childNodes[0].childNodes[1].style.display = 'none';
	}

	return frame;

})();


var frameConfirm = (function() {

	var frame = document.createElement('div');
	frame.setAttribute("id", "alert_menu");
	frame.setAttribute("class", "window_menu");
//	frame.style.width = parent.offSetWidth < 200) ? 

	frame.show = function () {
		frame.style.display = '';
		//frameScreenBlocker.show();
//		frame.show();
//		frame.childNodes[0].childNodes[1].style.display = '';
	}

	frame.hidden = function () {
		frame.style.display = 'none';
		//frameScreenBlocker.hidden();
//		frame.hidden();
//		frame.childNodes[0].childNodes[1].style.display = 'none';
	}

	var top = document.createElement('div');
	top.setAttribute("class", "window_top")
	var title = document.createElement('label');
	title.setAttribute("id", "alert_window_title")
	title.setAttribute("class", "window_top");
	title.innerHTML = 'Aviso';
	top.appendChild(title);

	var content = document.createElement('div');
	content.setAttribute("class", "window_content");
	var warning = document.createElement('img');
	warning.src = 'http://demo.ezweb.morfeo-project.com/repository/flickr/myFlickrPhotos/img/warning.png';
	warning.setAttribute("alt", "alert")
	var msg = document.createElement('div');
	msg.src = 'http://demo.ezweb.morfeo-project.com/repository/flickr/myFlickrPhotos/img/warning.png';
	msg.setAttribute("id", "alert_window_msg");
	msg.setAttribute("class", "window_msg");
	msg.innerHTML = '¡Atención! ¡Está a punto de eliminar la fotografia seleccionada de su cuenta de Flickr! ¿Está seguro de que quiere realizar esta operación?';
	content.appendChild(warning);
	content.appendChild(msg);

	var footer = document.createElement('div');
	footer.setAttribute("class", "window_bottom");
	var accept = document.createElement('button');
	accept.setAttribute("id", "alert_btn1");
	accept.setAttribute("class", "buttom");
	accept.innerHTML = 'Aceptar';
	accept.addEventListener ('click', 
		function (e){
			frameConfirm.hidden();
			frameScreenBlocker.show();			
			deleteImage(selectedimg);
		}, false);
	var cancel = document.createElement('button');
	cancel.setAttribute("id", "alert_btn2");
	cancel.setAttribute("class", "buttom");
	cancel.innerHTML = 'Cancelar';
	cancel.addEventListener ('click', 
		function (e){
			frameConfirm.hidden();
		}, false);
	footer.appendChild(accept);
	footer.appendChild(cancel);

	frame.appendChild(top);
	frame.appendChild(content);
	frame.appendChild(footer);

//	frame.appendChild(confirm);
	
	

/*
<div style="display: block; top: 142px; left: 205.5px;" class="window_menu" id="alert_menu">
	<div class="window_top">
		<label class="window_title" id="alert_window_title">Aviso</label>
		<input type="button" onclick="LayoutManagerFactory.getInstance().hideCover();" class="closebutton button"/>
	</div>
	<div class="window_content">
		<img alt="alert" src="/ezweb/images/warning.png"/>
		<div class="window_msg" id="alert_window_msg">¡Atención! ¡Está a punto de eliminar todas las versiones de este gadget! ¿Está seguro de que quiere realizar esta operación?</div>
	</div>
	<div class="window_bottom">
		<button id="alert_btn1">Aceptar</button>
		<button onclick="LayoutManagerFactory.getInstance().hideCover();" id="alert_btn2">Cancelar</button>
	</div>
</div>
*/

	return frame;
})();

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
	box.innerHTML = "<p>Despues de aceptar las credenciales en la ventana que se acaba de abrir, regrese a esta ventana y continue con el <em>Inicio de Sesión</em></p>";
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

/* Window Load Event (MAIN) */
window.addEventListener('load', function() {

	document.body.appendChild(frameConfirm);
	document.body.appendChild(frameScreenBlocker);
	document.body.appendChild(frameNotices);
//	document.body.appendChild(frameLoading);
	document.body.appendChild(frameLogin);
	document.body.appendChild(frameInitSession);
	document.body.appendChild(framePhotos);
//	document.getElementById('upload_div').appendChild(frameSendPhoto);

	frameConfirm.hidden();
	frameScreenBlocker.hidden();
	framePhotos.hidden();
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
	framePhotos.hidden();
	frameInitSession.show();
}

function showFlickrLogin() {
	frameInitSession.hidden();
	frameSendPhoto.hidden();
	framePhotos.hidden();
	frameLogin.show();
}

function showSendPhotoForm() {
	frameInitSession.hidden();
	frameLogin.hidden();
	frameNotices.clean();
	frameSendPhoto.show();
}

function showPhotos() {
	frameInitSession.hidden();
	frameLogin.hidden();
	frameSendPhoto.hidden();
	frameNotices.clean();
	framePhotos.show();
}

function toggleSendPhoto() {
	frameInitSession.hidden();
	frameLogin.hidden();
	frameNotices.clean();
	frameSendPhoto.toggle();			
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
	showPhotos();
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
			if (perms != 'delete')
				onError("El token no tiene permisos de escritura")
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
			var url = flickr.auth.getLoginURL('delete', frob);
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



