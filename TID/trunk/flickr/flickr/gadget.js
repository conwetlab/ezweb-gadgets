/* 
* This code is licensed under terms shown on this link:
* http://forge.morfeo-project.org/wiki/index.php/Gadgets_2009_License
*/

var agent = navigator.userAgent;
var is_iphone = (agent.indexOf('iPhone')!=-1);

/* Preferences */
var defKey = EzWebAPI.createRGadgetVariable('defaultKey', setKeyByDefault);
var time = EzWebAPI.createRGadgetVariable('time', resetInterval);
var nphotosPref = EzWebAPI.createRGadgetVariable("photosperpage", setNumberOfPhotos);
var photosRec = EzWebAPI.createRGadgetVariable("photosfromserver", setNumberOfPhotosRec);

/* Properties */
var auth_token = EzWebAPI.createRWGadgetVariable("auth_token");
var last_key = EzWebAPI.createRWGadgetVariable("last_keyword");
var access = EzWebAPI.createRWGadgetVariable("access_method");

/* Connectables */
var photokeySlot = EzWebAPI.createRGadgetVariable("photo_key_slot", photoKeywordHandler);
var peopleKeySlot = EzWebAPI.createRGadgetVariable("people_key_slot", peopleKeywordHandler);
var groupKeySlot = EzWebAPI.createRGadgetVariable("group_key_slot", groupKeywordHandler);
var photoKey = EzWebAPI.createRWGadgetVariable("photo_key");
var peopleKey = EzWebAPI.createRWGadgetVariable("people_key");
var groupKey = EzWebAPI.createRWGadgetVariable("group_key");
var titleEvent = EzWebAPI.createRWGadgetVariable ('title');
var authorEvent = EzWebAPI.createRWGadgetVariable ('author');
var urlImage = EzWebAPI.createRWGadgetVariable("urlImage");

/* Global variables */
var interval = null;     // Automatic refreshment
var translator = null;   // Language translator
var previousimgs = [];   // Previous images of the pagination 
var currentimgs = [];    // Current images of the pagination
var nextimgs = [];       // Next images of the pagination
var id2user = {};        // Information about user [nsid -> username] 

/* Variable handlers */
function setKeyByDefault (value){
	if (hasAccess()) {
		displayPhotos();	
	}
}

function resetInterval (value){
	if (!hasAccess()) {
		return;	
	}

	if (interval !== null)
	{
		try {
			clearInterval (interval);
		}catch(e){}
	}
	interval = setInterval(function(){
		if (hasAccess()){		
			displayPhotos(); 
		}
	}, value*60000);
}

function setNumberOfPhotos() {
	if (hasAccess()) {
		displayPhotos();	
	}
}

function setNumberOfPhotosRec() {
	if (hasAccess()) {
		displayPhotos();	
	}
}


function photoKeywordHandler (key_) {
	if (hasAccess()){
		displayFromPhoto(key_);	
	}
}


function peopleKeywordHandler (key_) {
	if (hasAccess()){
		displayFromPeople(key_);	
	}
}


function groupKeywordHandler (key_) {
	if (hasAccess()) {
		displayFromGroup(key_);
	}
}


/* Gadget functionality	*/ 
function displayPhotos () {
	if (hasAccess()) {
		if (!last_key.get()){
			displayDefaultPhotos();
		} else {
			displayLastPhotos();
		} 
	}
}

function displayDefaultPhotos () {
	if (!last_key.get()){
		// User property is used by default
		if (defKey.get()){
			displayFromPhoto (defKey.get());
		} else {
			// If there is no user property
			displayFromPhoto ('interestingness');
		}
		// Next time, the photos by default will be shown again	
		last_key.set('');
	}	
}

// Display the last shown photos
function displayLastPhotos () {
	switch (last_key.get()){
		case 'photo':
			displayFromPhoto(photoKey.get());
			break;
		case 'people':	 
			displayFromPeople(peopleKey.get());
			break;
		case 'group':
			displayFromGroup(groupKey.get());
			break;
		default:
			break;
	}
}

// Search photos by tags
function displayFromPhoto (key_) {
	photoKey.set(key_);
	last_key.set('photo');
	flickr.photos.search (key_, null, null, displayOk, displayError);
}

// Search people photos by email or username
function displayFromPeople (key_) {
	peopleKey.set(key_);
	last_key.set('people');
	if (isValidEmail(key_)){
		// By email
		flickr.people.findByEmail (key_, 
			function(resp) {
				if (!resp.user){
					frameNotices.info(translator.getLabel('unotfound'));
					return;
				}
				var nsid = resp.user.nsid;
				flickr.photos.search (null, nsid, null, displayOk, displayError);
			}, 
	 		function(resp) {
				frameNotices.info(translator.getLabel('unotfound'));
			}		
		);
	} else {
		// By username
		flickr.people.findByUsername (key_,  
			function(resp) {
				if (!resp.user){
					frameNotices.info(translator.getLabel('unotfound'));
					return;
				}
				var nsid = resp.user.nsid;
				flickr.photos.search (null, nsid, null, displayOk, displayError);
			}, 
	 		function(resp) {
				frameNotices.info(translator.getLabel('unotfound'));
			}		
		);
	}
}


// Search group photos
function displayFromGroup (key_) {
	groupKey.set(key_);
	last_key.set('group');
	flickr.groups.search (key_, 
		function(resp) {
			// Gets the first one
			if (resp.groups.group.length === 0){
				frameNotices.info(translator.getLabel('gnotfound'));
				return;
			}
			var nsid = resp.groups.group[0].nsid;
			flickr.photos.search (null, null, nsid, displayOk, displayError);		
		},
 		function(resp) {
			frameNotices.info(translator.getLabel('gnotfound'));
		}		
	);
}


// Gets the photo informaton from Flickr and shows the photos
function displayOk(resp){
	// At first, saving the images content into a new structure
	var imgsFromServer = [];
	for (var i = 0; i < resp.photos.photo.length ; i++) {
	        if (i==9 && is_iphone){
		    break;
		}
		var photo = resp.photos.photo[i];
		// Get the photo urls (original and thumbs)
		photo.url = "http://farm" + photo.farm + ".static.flickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + ".jpg";
		photo.urlThumb = "http://farm" + photo.farm + ".static.flickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_s.jpg";
		imgsFromServer[i] = photo;
	}
	previousimgs = [];
	currentimgs = [];
	nextimgs = [];
	setArrays (imgsFromServer, null);
}

function displayError(res){
	// Nothing to do?
}

function propagateGadgetEvents(photo_)
{
	titleEvent.set (photo_.title);
	urlImage.set (photo_.url);

	if (!id2user[photo_.owner]){
		flickr.people.getInfo(photo_.owner,
			function(resp) {
				id2user[resp.person.nsid] = resp.person.username._content;
				authorEvent.set(resp.person.username._content);
			},
			function(resp) {
				displayError(translator.getLabel('flickrerror'));
			}
		);
	} else {
		authorEvent.set (id2user[photo_.owner]);
	}
}

// Create the data structures
function setArrays (imgs, from){
	// Initial case
	var nphotos = parseInt(nphotosPref.get(),10);
	if ((previousimgs.length === 0) && (currentimgs.length === 0) && (nextimgs.length === 0)){ 
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
	if (from === 0){ // asking for first images
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
		if (previousimgs.length === 0)
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
		if (nextimgs.length === 0)
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
		last = ((previousimgs.length%nphotos) === 0) ? nphotos : previousimgs.length%nphotos;
		currentimgs = previousimgs.slice(previousimgs.length-last, previousimgs.length);
		previousimgs = previousimgs.slice(0, previousimgs.length-last);
		displayImages();
		return;
	}
}

// Creates the photos
function displayImages () {
	document.getElementById('content_div').innerHTML = '';
	for (var i=0;i<currentimgs.length;i++){
		var img = currentimgs[i]; // get the first img

		// creating image
		var image = document.createElement ('img');
		image.src = img.urlThumb;
		image.setAttribute ('id', img.id);
		image.setAttribute ('class', 't');
		if (img.title){
			image.setAttribute ('alt', img.title);
		}

		// creating link
		var a = document.createElement('a');
		a.href = '#';
		if (img.title){
			a.setAttribute ('title', img.title);
		}

		var context = {image:image, jsonImg:img, link:a};

		a.addEventListener('click', (function(e){
			propagateGadgetEvents(this.jsonImg);	
		}).bind(context), false);

		var eventHander = (function(e) {
			var title = '';
			if (id2user[this.jsonImg.owner]){
				if (this.jsonImg.title){
					title += '\''+ this.jsonImg.title +'\' by '+ id2user[this.jsonImg.owner];
				} else {
					title += 'Photo by ' + id2user[this.jsonImg.owner];
				}
				this.image.setAttribute ('alt', title);
				this.link.setAttribute ('title', title);
				EzWebAPI.platform.Event.stopObserving(this.link,'mouseover');							
			}
		}).bind(context);
		a.addEventListener('mouseover', eventHander, false);
		a.appendChild(image);
		document.getElementById('content_div').appendChild(a);
	}
}

function isValidEmail(email_) {
	var filter = /^(\w+(?:\.\w+)*)@((?:\w+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
	return filter.test(email_);
}