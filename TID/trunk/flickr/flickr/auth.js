/* 
* This code is licensed under terms shown on this link:
* http://forge.morfeo-project.org/wiki/index.php/Gadgets_2009_License
*/

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
	access.set('');
	auth_token.set('');
	last_key.set('');
	showFlickrLogin();
}

function initSession()
{
	if (!frob){
		showFlickrLogin();
	}else{
		getToken(frob, auth_success, auth_fail);
	}
}

function authenticate()
{
	if (!hasAccess()){
		showFlickrLogin();
	} else if (isPublicAccess()) {
		showPhotos();	
	} else {
		validateToken(auth_success, auth_fail);
	}

}

function auth_success(token, perm, user)
{
	auth_token.set(token);
	showPhotos();
}



function auth_fail(msg)
{
	error(msg);
	showFlickrLogin();
}

function is_auth()
{
	return auth_token.get();
}

function isPublicAccess()
{
	return access.get() == 'public';
}

function hasAccess()
{
	return access.get();
}

function validateToken(onSuccess, onError)
{
	checkToken(auth_token.get(),
		function(token, perms, user)
		{
			if (perms != 'write'){
				onError("El token no tiene permisos de escritura")
			}else{
				onSuccess(token, user)
			}
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



