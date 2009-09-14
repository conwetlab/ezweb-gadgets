var agent=navigator.userAgent;
var is_iphone = (agent.indexOf('iPhone')!=-1);

//var time = EzWebAPI.createRGadgetVariable('time', resetInterval);
//var vkey = EzWebAPI.createRGadgetVariable("keyword", displayMenu);
var user = EzWebAPI.createRGadgetVariable("user", userHandler);
var nphotosPref = EzWebAPI.createRGadgetVariable("photosperpage", setNumberOfPhotos);
var urlImage = EzWebAPI.createRWGadgetVariable("urlImage");
//var vdefault = EzWebAPI.createRGadgetVariable("defaultSearch", displayMenu);
//var interval = null;
var titleevent = EzWebAPI.createRWGadgetVariable ('title');
//var autorevent = EzWebAPI.createRWGadgetVariable ('author');

//var keywordevent = EzWebAPI.createRWGadgetVariable("keyword_event");

var previousimgs = [];
var currentimgs = [];
var nextimgs = [];
var imgsFromServer = [];
var selectedimg = null;

var frameSendPhoto = (function() {
	var frame = document.createElement('div');
	frame.setAttribute('class', 'frame');
	frame.setAttribute('id', 'send_photo');

//	var logout = document.createElement('span');
//	logout.innerHTML = 'Logout';
//	logout.setAttribute('id', 'logout');
//	frame.appendChild(logout);
//	logout.addEventListener('click', function(){
//		setAuthToken('');
//		autenticate();
//	}, true);

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
		frameScreenBlocker.show();
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
				//notices.info("Imagen enviada a flickr");
				frameScreenBlocker.hidden();
				showPhotos ();
			}, true);
		}
		form.submit();
		return true;
	}, false);

	frame.show = function() {
		frame.style.display = '';
		document.getElementById('content_div').style.display = 'none';
		document.getElementById('footer_div').style.display = 'none';
	}
	frame.hidden = function() {
		frame.style.display = 'none';
		document.getElementById('content_div').style.display = '';
		document.getElementById('footer_div').style.display = '';
	}

	frame.toggle = function() {
		if (frame.style.display == 'none'){
			frame.show();
		} else {
			frame.hidden();
		
		}		
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

var framePhotos = (function() {

	// Creates the layer
	var frame = document.createElement ('div');
	frame.setAttribute ('id', 'photos_frame');

	// Creates the header
	var header = document.createElement ('div');
	header.setAttribute ('id', 'header');
	var img = document.createElement('img');
	img.setAttribute ('id', 'logo');
	img.setAttribute ('src', 'http://demo.ezweb.morfeo-project.com/repository/flickr/myFlickrPhotos/img/flickr.png');
	var a = document.createElement ('a');
	a.setAttribute ('href', 'http://www.flickr.com');
	a.style.cssText = 'text-decoration:None; color:white;';
	a.setAttribute ('target', '_blank');
	a.setAttribute ('title', 'Flickr');
	a.appendChild(img);
	var imglogout = document.createElement('img');
	imglogout.setAttribute ('id', 'logout_photo');
	imglogout.setAttribute ('title', 'Logout');
	imglogout.src ='http://demo.ezweb.morfeo-project.com/repository/flickr/myFlickrPhotos/img/logout.png';
	imglogout.addEventListener('click', function(){
		setAuthToken('');
		autenticate();
	}, true);
	imglogout.style.cssText = 'cursor: pointer; position:absolute; top:5px; right:5px; width: 18px';
	var imgdelete = document.createElement('img');
	imgdelete.setAttribute ('id', 'delete_photo');
	imgdelete.setAttribute ('title', 'Delete seletected photo');
	imgdelete.src ='http://demo.ezweb.morfeo-project.com/repository/flickr/myFlickrPhotos/img/delete2.png';
	imgdelete.addEventListener ('click', function (e){confirmDeleteImage(selectedimg);}, false);
	imgdelete.style.cssText = 'cursor: pointer; position:absolute; top:5px; right:25px; width: 18px';
	var imgedit = document.createElement('img');
	imgedit.setAttribute ('id', 'edit_photo');
	imgedit.setAttribute ('title', 'Edit the selected photo properties');
	imgedit.src ='http://demo.ezweb.morfeo-project.com/repository/flickr/myFlickrPhotos/img/edit2.png';
	imgedit.addEventListener ('click',  function (e){editImage();}, false);
	imgedit.style.cssText = 'cursor: pointer; position:absolute; top:5px; right:45px; width: 18px';
	var imgup = document.createElement('img');
	imgup.setAttribute ('id', 'upload_photo');
	imgup.setAttribute ('title', 'Upload a photo');
	imgup.src ='http://demo.ezweb.morfeo-project.com/repository/flickr/myFlickrPhotos/img/upload2.png';
	imgup.addEventListener ('click', function (e){toggleSendPhoto();}, false);
	//imgup.style.cssText = 'cursor: pointer; position:absolute; top:5px; right:65px; width: 18px';
	imgup.style.cssText = 'cursor: pointer; position:absolute; top:5px; right:45px; width: 18px';
	var imgrefresh = document.createElement('img');
	imgrefresh.setAttribute ('id', 'refreshimg');
	imgrefresh.setAttribute ('title', 'Refresh');
	imgrefresh.src ='http://demo.ezweb.morfeo-project.com/repository/flickr/myFlickrPhotos/img/refresh.png';
	imgrefresh.addEventListener ('click', function (e){showPhotos ();}, false);
	//imgrefresh.style.cssText = 'cursor: pointer; position:absolute; top:5px; right:85px; width: 18px';
	imgrefresh.style.cssText = 'cursor: pointer; position:absolute; top:5px; right:65px; width: 18px';
	header.appendChild (imgrefresh);
	header.appendChild (imgup);
	//header.appendChild (imgedit);
	header.appendChild (imgdelete);
	header.appendChild (imglogout);
	header.appendChild (a);

	// Creates the content layer
	var content = document.createElement ('div');
	content.setAttribute ('id', 'content_div');
	content.style.cssText = 'margin:0 auto; text-align:center; overflow:auto; position:absolute; top:40px; bottom:22px; padding:1px;';

	// Creates the upload layer
	var upload = document.createElement ('div');
	upload.setAttribute ('id', 'upload_div');
	upload.style.cssText = 'margin:0 auto; overflow:auto;';
	upload.style.cssText += 'position:absolute; bottom:0px; left:5px; right:5px; height:22px;';
	//upload.appendChild (frameSendPhoto);

	// Creates the footer
	var footer = document.createElement ('div');
	footer.setAttribute ('id', 'footer_div');
	footer.style.cssText = 'position:absolute; bottom:0px; left:5px; right:5px; height:22px; text-align:center; display: none;';
	img = document.createElement ('img');
	img.src = 'http://demo.ezweb.morfeo-project.com/repository/flickr/myFlickrPhotos/img/go-first.png';
	img.setAttribute ('title', 'Go First');
	img.addEventListener ('click', function (e){setArrays(null,0);}, false);
	footer.appendChild (img);
	img = document.createElement ('img');
	img.src = 'http://demo.ezweb.morfeo-project.com/repository/flickr/myFlickrPhotos/img/go-previous.png';
	img.setAttribute ('title', 'Go Previous');
	img.addEventListener ('click', function (e){setArrays(null,1);}, false);
	footer.appendChild (img);
	img = document.createElement ('img');
	img.src = 'http://demo.ezweb.morfeo-project.com/repository/flickr/myFlickrPhotos/img/go-next.png';
	img.setAttribute ('title', 'Go Next');
	img.addEventListener ('click', function (e){setArrays(null,2);}, false);
	footer.appendChild (img);
	img = document.createElement ('img');
	img.src = 'http://demo.ezweb.morfeo-project.com/repository/flickr/myFlickrPhotos/img/go-last.png';
	img.setAttribute ('title', 'Go Last');
	img.addEventListener ('click', function (e){setArrays(null,3);}, false);
	footer.appendChild (img);

	frame.appendChild (header);
	//frame.appendChild (upload);
	frame.appendChild (frameSendPhoto);
	frame.appendChild (content);
	frame.appendChild (footer);

	nphotos = parseInt(nphotosPref.get ());

	frame.show = function() {
		frame.style.display = '';
		displayPhotos ();
	}
	frame.hidden = function() {
		frame.style.display = 'none';
	}

	return frame;
})();

function userHandler(usr){
	autenticate ();
}

function setNumberOfPhotos() {
	nphotos = parseInt(nphotosPref.get ());
	//setArrays (imgsFromServer, null);
	//autenticate ();
	showPhotos ();
}

function displayPhotos (onsuccess, onerror) {
	flickr.photo.getMyPhotos (displayOk, displayError);
}


function displayOk(resp){
	// At first, saving the images content into a new structure
	imgsFromServer = [];
	for (var i = 0; i < resp.photos.photo.length ; i++) {
	        if (i==9 && is_iphone)
		    break;
		var photo = resp.photos.photo[i];
/*		var id = photo.getAttribute ('id');
		//var author = photo.getAttribute ('owner');
		var author = user.get();
		var title = photo.getAttribute ('title');
		var farm = photo.getAttribute ('farm');
		var secret = photo.getAttribute ('secret');
		var server = photo.getAttribute ('server');
*/
		//photo.author = user.get();
		photo.author = photo.owner;
		photo.url = "http://farm" + photo.farm + ".static.flickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + ".jpg";
		
//		var img = {title:title, author:author, url:photoUrl};
		imgsFromServer[i] = photo;
	}
	previousimgs = [];
	currentimgs = [];
	nextimgs = [];
	setArrays (imgsFromServer, null);
}

function sendImage(urlImage_,titulo,autor)
{
	titleevent.set (titulo);
	//autorevent.set (autor);
	//urlImage.set(urlImage_.substr(0, urlImage_.length - 6) + urlImage_.substr(urlImage_.length - 4, 4));
	urlImage.set (urlImage_);
}

function displayError(res){
	alert ('Error');
}

/*
function resetInterval (value){
	if (interval != null)
	{
		try {
			clearInterval (interval);
	}
	catch(e){
		}
	}
	interval = setInterval(function(){
		displayMenu(vkey.get());
	}, value*60000);
}
*/

function setArrays (imgs, from){
	// Caso inicial
	if ((previousimgs.length==0) && (currentimgs.length==0) && (nextimgs.length==0)){ 
		// Get the number of photos in the current list
		last = (nphotos<imgs.length) ? nphotos : imgs.length;
		for (i=0; i<last; i++){
			img = imgs[i]; // get the first img
			currentimgs[i] = img; // inserting into currentimgs
		}
		// Adding the rest of the imgs in the nextimgs list
		for (i=last; i<imgs.length; i++){
			nextimgs [nextimgs.length] = imgs[i];
		}
		displayImages();
		return;
	}
	if (from == 0){ // asking for first images
		// it has all the imgs
		previousimgs = previousimgs.concat(currentimgs.concat(nextimgs));
		last = (nphotos<previousimgs.length) ? nphotos : previousimgs.length;
		currentimgs = [];
		nextimgs = [];
		for (i=0; i<last; i++){
			img = previousimgs[i]; // get the first img
			currentimgs[i] = img; // inserting into currentimgs
		}
		// Adding the rest of the imgs in the nextimgs list
		for (i=last; i<previousimgs.length; i++){
			nextimgs [nextimgs.length] = previousimgs[i];
		}
		previousimgs = [];
		displayImages();
		return;
	} 
	if (from == 1){ // asking for previous images
		if (previousimgs.length == 0)
			return;
		// Moving the currentimgs into the nextimgs list
		currentimgs = currentimgs.concat(nextimgs);
		nextimgs = currentimgs;
		currentimgs = [];
		currentimgs = previousimgs.slice (previousimgs.length-nphotos, previousimgs.length);
		previousimgs = previousimgs.slice (0, previousimgs.length-nphotos);
		displayImages();
		return;
	}
	if (from == 2){ // asking for next images
		if (nextimgs.length == 0)
			return;
		previousimgs = previousimgs.concat(currentimgs);
		currentimgs = [];
		last = (nphotos<previousimgs.length) ? nphotos : previousimgs.length;
		currentimgs = nextimgs.slice (0, last);
		nextimgs = nextimgs.slice (last, nextimgs.length);	
		displayImages();
		return;
	}
	if (from == 3){ // asking form last images
		previousimgs = previousimgs.concat(currentimgs.concat(nextimgs));
		nextimgs = [];
		currentimgs = [];
		last = previousimgs.length%nphotos;
		currentimgs = previousimgs.slice(previousimgs.length-last, previousimgs.length);
		previousimgs = previousimgs.slice(0, previousimgs.length-last);
		displayImages();
		return;
	}
}

function displayImages () {
	document.getElementById('content_div').innerHTML = '';
	for (var i=0;i<currentimgs.length;i++){
		var img = currentimgs[i]; // get the first img

		// creating image
		title = 'Photo by ' + img.author;
		var image = document.createElement ('img');
		image.src = img.url;
		image.setAttribute ('id', img.id);
		image.setAttribute ('class', 't');
		image.setAttribute ('alt', title);

		// creating link
		var context = {img:img, image:image};
		a = document.createElement('a');
		a.href = '#';
		a.addEventListener('click', EzWebExt.bind(function(e){
			if (selectedimg == this.image){
				this.image.setAttribute ('class', 't');
				selectedimg = null;
			} else {				
				if (selectedimg != null){
					selectedimg.setAttribute ('class', 't');
				}
				this.image.setAttribute ('class', 't selected');
				selectedimg = this.image;
			}
			sendImage(this.img.url, this.img.title, this.img.author);
		}, context), false);
		if (img.title != "")
			title = '\''+ img.title;// +'\' by '+ img.author;
		//else

		a.setAttribute ('title', title);
		a.appendChild(image);
		document.getElementById('content_div').appendChild(a);
	}
}

function editImage () {
	alert ('edit image')
}

function confirmDeleteImage (img) {
	if (img != null){
		frameConfirm.show();
	}
}


function deleteImage (img) {
	flickr.photo.deletePhoto(img.id, 
		function(resp) {
			showPhotos();
			frameScreenBlocker.hidden();
			selectedimg = null;
		},
		function(resp) {
			frameNotices.error("Ocurrio un error al conectar con flikr");
			frameScreenBlocker.hidden();
		}		
	);	
}
