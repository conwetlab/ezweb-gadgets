/* 
* This code is licensed under terms shown on this link:
* http://forge.morfeo-project.org/wiki/index.php/Gadgets_2009_License
*/

/* Preferences */
var defKey = EzWebAPI.createRGadgetVariable('defaultKey', setKeyByDefault);
var useKey = EzWebAPI.createRGadgetVariable('useKey', setCategByDefault);
var time = EzWebAPI.createRGadgetVariable('time', resetInterval);
var nphotosPref = EzWebAPI.createRGadgetVariable("photosperpage", setNumberOfPhotos);
var photosRec = EzWebAPI.createRGadgetVariable("photosfromserver", setNumberOfPhotosRec);
var api_key = EzWebAPI.createRGadgetVariable("apiKey", function (value_){if(value_!='') flickr.API_KEY=value_;});
var shared_secret = EzWebAPI.createRGadgetVariable("sharedSecret", function (value_){if(value_!='') flickr.SHARED_SECRET=value_;});
var defTab = EzWebAPI.createRGadgetVariable("defaultTab", setDefaultTab);

/* Properties */
var auth_token = EzWebAPI.createRWGadgetVariable("auth_token");
var last_key = EzWebAPI.createRWGadgetVariable("last_keyword");
var last_use = EzWebAPI.createRWGadgetVariable("last_use");
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
var urlThumb = EzWebAPI.createRWGadgetVariable("urlThumb");

/* Variable handlers */
function setKeyByDefault (value_){
	FlickrGadgetFactory.getInstance().loadPhotosFromServer(value_, useKey.get());
}

function setCategByDefault (value_){
	FlickrGadgetFactory.getInstance().loadPhotosFromServer(defKey.get(), value_);
}

function resetInterval (value_){
	FlickrGadgetFactory.getInstance().setRefresh(value_);
}

function setNumberOfPhotos(value_) {
	var gadget = FlickrGadgetFactory.getInstance();
	gadget.setNumberShownPhotos(value_);
	FlickrGadgetFactory.getInstance().displayPhotos();
}

function setNumberOfPhotosRec() {
	var gadget = FlickrGadgetFactory.getInstance();
	gadget.loadMyPhotosFromServer();
	gadget.loadContactPhotosFromServer();
	gadget.loadPhotosFromServer(last_key.get(), last_use.get());
}

function photoKeywordHandler (key_) {
	FlickrGadgetFactory.getInstance().loadPhotosFromServer(key_, 'photos');
}

function peopleKeywordHandler (key_) {
	FlickrGadgetFactory.getInstance().loadPhotosFromServer(key_, 'people');
}

function groupKeywordHandler (key_) {
	FlickrGadgetFactory.getInstance().loadPhotosFromServer(key_, 'groups');
}

function setDefaultTab (tab_) {
	FlickrGadgetFactory.getInstance().setDefaultTab(tab_);
}

/* Gadget functionality	*/ 
var FlickrGadgetFactory = function () {
	
	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;
	
	// *********************************
	// CONSTRUCTOR
	// *********************************
	function FlickrGadget () {
		
		/********************** PRIVATE VARIABLES **************************************/
		
		this._is_iphone = (navigator.userAgent.indexOf('iPhone')!=-1);
		this._interval = null;       // Automatic refreshment
		this._translator = null;     // Language translator
		this._id2user = $H();        // Information about user [nsid -> username] 	
		this._initReload = false;    // Automatic reload in the beginning
		this._view = GadgetViewFactory.getInstance();  // Gadget view
		this._auth = FlickrAuthFactory.getInstance();  // Gadget authorization module
		this._myPhotos = new PhotoCollection(nphotosPref.get());        // Photo data structure
		this._contactPhotos = new PhotoCollection(nphotosPref.get());   // Photo data structure
		this._exploredPhotos = new PhotoCollection(nphotosPref.get());  // Photo data structure
		
		/*********************** PRIVATE METHODS ***************************************/	
		
		//*****************************************************************************//
		//********************** HTTP HANDLERS ****************************************//
		//*****************************************************************************//
		
		//********************* PHOTO LOAD HANDLERS ***********************************//
		
		// Loads photos searched by user 
		this._loadExploredPhotos = function (resp_) {
			if (resp_.stat == "fail"){
				this._view.unblock();
				onError_(FlickrGadgetFactory.getInstance().getTranslator().getLabel('flickrerror'));
				return;
			}			
			// No image at first (sometimes occurs)
			if ((resp_.photos.photo.length == 0) && !this._initReload) {
				this._initReload = true;
				this.reloadLastPhotos();
				return;
			}
			this._loadSuccess (resp_, this._exploredPhotos);
			if ((this._view.getCurrentTab() == this._view.NO_TAB) || (this._view.getCurrentTab() == this._view.EXPLORE)){
				this._exploredPhotos.show();
			}
			this._view.unblock();
		}.bind(this);
		
		// Gets the photo informaton from Flickr 
		this._loadSuccess = function (resp_, photos_) {
			// At first, saving the images content into a new structure
			var photosFromServer = [];
			for (var i = 0; i < resp_.photos.photo.length ; i++) {
					if ((i==9) && this._is_iphone){
					break;
				}
				var photo = resp_.photos.photo[i];
				// Get the photo urls (original and thumbs)
				photo.url = "http://farm" + photo.farm + ".static.flickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + ".jpg";
				photo.urlThumb = "http://farm" + photo.farm + ".static.flickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_s.jpg";
				photo.urlThumbEvent = "http://farm" + photo.farm + ".static.flickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_t.jpg";
				photosFromServer[i] = photo;
			}
			photos_.setPhotos (photosFromServer);
			// Sets the automatic refresh
			if (!this._interval){
				this._interval = setInterval(
					function(){
						this.reloadLastPhotos();
					}.bind(this), 
					time.get()*60000
				);		
			}
		}
		
		// Load error
		this._loadError = function (resp_) {
			// TODO: nothing to do?
			this._view.unblock();
		}.bind(this);
		
		//**************** AUTHENTICATION HANDLERS ************************************// 
		
		// User has access to his account
		this._authSuccess = function (resp_) {
			this.getContactList();
			this.loadMyPhotosFromServer();
			this.loadContactPhotosFromServer();
			this._loadDefaultPhotos();
			this.setDefaultTab(defTab.get());
		}.bind(this);
		
		// User has not access
		this._authError = function (msg_) {
			this._view.getNotification().error(msg_);
			this._view.showFlickrLogin();
		}.bind(this);
				
		//******************** LOGIN HANDLERS *****************************************//
				
		this._loginSuccess = function (resp_) {
			this._view.showInitSession();
		}.bind(this);
		
		this._loginError = function (msg_) {
			this._authError(msg_);
		}.bind(this);
		
		//*****************************************************************************//
		//**************** SIG IN *****************************************************//
		//*****************************************************************************//
		
		FlickrGadget.prototype._login = function () {
			if (!this._auth.hasAccess()){
				this._view.showFlickrLogin();
			} else if (this._auth.isPublicAccess()) {
				this._loadDefaultPhotos();
				this.selectTab(this._view.NO_TAB);				
			} else {
				this._auth.authenticate(this._authSuccess, this._authError);
			}		
		}
		
		//*****************************************************************************//
		//**************** PHOTO LOADER ***********************************************//
		//*****************************************************************************//
		
		// Search photos by tags
		FlickrGadget.prototype._searchFromPhoto = function (key_) {
			// Send the events
			photoKey.set(key_);
			// Set the properties
			last_key.set(key_);
			last_use.set('photos');
			flickr.photos.search (key_, null, null, this._loadExploredPhotos, this._loadError);
		}
		
		// Search people photos by email or username
		FlickrGadget.prototype._searchFromPeople = function (key_) {
			// Send the events
			peopleKey.set(key_);
			// Set the properties
			last_key.set(key_);
			last_use.set('people');
			if (Util.isValidEmail(key_)){
				// By email
				flickr.people.findByEmail (key_, 
					function(resp) {
						if (!resp.user){
							this._view.unblock();
							this._view.getNotification().info(this._translator.getLabel('unotfound'));
							return;
						}
						var nsid = resp.user.nsid;
						flickr.photos.search (null, nsid, null, this._loadExploredPhotos, this._loadError);
					}.bind(this), 
					function(resp) {
						this._view.unblock();
						this._view.getNotification().info(this._translator.getLabel('unotfound'));
					}.bind(this)		
				);
			} else {
				// By username
				// Have been already registered the username?
				var idKeys = this._id2user.keys();
				var i=0;
				for (; i<idKeys.length; i++){
					if (this._id2user[idKeys[i]] == key_){
						break;
					}
				}
				if (i != idKeys.length){
					flickr.photos.search (null, idKeys[i], null, this._loadExploredPhotos, this._loadError);
					return;
				}
				// We must request the nsid for the username
				flickr.people.findByUsername (key_,  
					function(resp) {
						if (!resp.user){
							this._view.unblock();
							this._view.getNotification().info(this._translator.getLabel('unotfound'));
							return;
						}
						var nsid = resp.user.nsid;
						this._id2user[nsid] = resp.user.username._content;
						flickr.photos.search (null, nsid, null, this._loadExploredPhotos, this._loadError);
					}.bind(this), 
					function(resp) {
						this._view.unblock();
						this._view.getNotification().info(this._translator.getLabel('unotfound'));
					}.bind(this)	
				);
			}
		}		
		
		// Search group photos
		FlickrGadget.prototype._searchFromGroup = function (key_) {
			// Send the events
			groupKey.set(key_);
			// Set the properties
			last_key.set(key_);
			last_use.set('groups');
			flickr.groups.search (key_, 
				function(resp_) {
					if (resp_.stat == "fail"){
						this._view.unblock();
						onError_(FlickrGadgetFactory.getInstance().getTranslator().getLabel('flickrerror'));
						return;
					}			
					// Gets the first one
					if (resp_.groups.group.length === 0){
						this._view.unblock();
						this._view.getNotification().info(this._translator.getLabel('gnotfound'));
						return;
					}
					var nsid = resp_.groups.group[0].nsid;
					flickr.photos.search (null, null, nsid, this._loadExploredPhotos, this._loadError);	
				}.bind(this),
				function(resp_) {
					this._view.unblock();
					this._view.getNotification().info(this._translator.getLabel('gnotfound'));
				}.bind(this)		
			);
		}
		
		FlickrGadget.prototype._loadDefaultPhotos = function () {
			if (!this._auth.hasAccess()) {
				return;
			}
			var defk = (defKey.get() != '') ? defKey.get() : 'interestingness';
			this._view.copyInInputs(defk, useKey.get());
			this.loadPhotosFromServer(defk, useKey.get());
		}
		
		/**************************** PUBLIC METHODS ***********************************/	
		
		//*****************************************************************************//
		//*************************** GET & SET METHODS *******************************//
		//*****************************************************************************//
		
		FlickrGadget.prototype.getId2User = function () {
			return this._id2user;
		}
		
		FlickrGadget.prototype.getTranslator = function () {
			return this._translator;
		}
		
		FlickrGadget.prototype.setNumberShownPhotos = function (num_) {
			this._view.setNumberShownPhotos(num_);
			this._myPhotos.setNumberShownPhotos(num_);
			this._contactPhotos.setNumberShownPhotos(num_);
			this._exploredPhotos.setNumberShownPhotos(num_);
		}
		
		FlickrGadget.prototype.setAccess = function (value_) {
			access.set(value_);
		}
		
		FlickrGadget.prototype.setAuthToken = function (value_) {
			auth_token.set(value_);			
		}
		
		FlickrGadget.prototype.setRefresh = function (value_) {
			if (!this._auth.hasAccess() || isNaN(parseInt(value_))) {
				return;	
			}
			if (this._interval){
				try {
					clearInterval (this._interval);
				}catch(e){}
			}
			if (value_ <= 0){
				this._interval = null;
			} else {
				this._interval = setInterval(
					function(){
						this.reloadLastPhotos();
					}.bind(this), 
					value_*60000
				);		
			}
		}
		
		//*****************************************************************************//
		//*************************** WINDOW EVENTS ***********************************//
		//*****************************************************************************//
				
		// onload
		FlickrGadget.prototype.init = function () {
			this._translator = new EzWebExt.Translator(labels, "language");
			if (api_key.get() != '')
				flickr.API_KEY = api_key.get();
			if (shared_secret.get() != '')
				flickr.SHARED_SECRET = shared_secret.get();
			this._view.init(nphotosPref.get());
			this._auth.init(access.get(), auth_token.get());
			this._login();
			this._translator.translate();
		}
		
		// onunload
		FlickrGadget.prototype.remove = function () {
			this._myPhotos.empty();
			this._contactPhotos.empty();
			this._exploredPhotos.empty();
			this._view.remove();
			if (this._interval){
				try {
					clearInterval (this._interval);
				}catch(e){}
			}
		}
		
		// onresize
		FlickrGadget.prototype.resize = function () {
			this._view.resize();
		}
		
		//*****************************************************************************//
		//**************** USER ACTIONS ***********************************************//
		//*****************************************************************************//
		
		// User clicks "continue"
		FlickrGadget.prototype.publicAccess = function () {
			this._auth.setPublicAccess();
			this._loadDefaultPhotos();
			this.selectTab(this._view.NO_TAB);
		}
		
		// User clicks "register"
		FlickrGadget.prototype.privateAccess = function () {
			this._auth.setPrivateAccess();		
			this._auth.login(this._loginSuccess, this._loginError);		
		}
		
		// User clicks "init session"
		FlickrGadget.prototype.initSession = function () {
			this._auth.initSession(this._authSuccess, this._authError);
		}
		
		// Load user photos from Flickr 
		FlickrGadget.prototype.loadMyPhotosFromServer = function () {
			if (!this._auth.hasAccess() || this._auth.isPublicAccess()){
				return;
			}
			flickr.people.getMyPhotos ( 
				function(resp_) {
					if (resp_.stat == "fail"){
						this._view.unblock();
						onError_(FlickrGadgetFactory.getInstance().getTranslator().getLabel('flickrerror'));
						return;
					}
					// No image at first (sometimes occurs)
					if ((resp_.photos.photo.length == 0) && !this._initReload) {
						this._initReload = true;
						this.reloadLastPhotos();
						return;
					}
					this._loadSuccess(resp_, this._myPhotos);
					if (this._view.getCurrentTab() == this._view.GALLERY){
						this._myPhotos.show();
					}		
					this._view.unblock();
				}.bind(this),
				function(resp_) {
					this._view.unblock();
					this._view.getNotification().info(this._translator.getLabel('myphotoserror'));
				}.bind(this)		
			);
		}
		
		// Load user photos from Flickr 
		FlickrGadget.prototype.loadContactPhotosFromServer = function () {
			if (!this._auth.hasAccess() || this._auth.isPublicAccess()){
				return;
			}
			flickr.photos.getContactsPhotos ( 
				function(resp_) {
					if (resp_.stat == "fail"){
						this._view.unblock();
						onError_(FlickrGadgetFactory.getInstance().getTranslator().getLabel('flickrerror'));
						return;
					}
					// No image at first (sometimes occurs)
					if ((resp_.photos.photo.length == 0) && !this._initReload) {
						this._initReload = true;
						this.reloadLastPhotos();
						return;
					}
					this._loadSuccess(resp_, this._contactPhotos);
					if (this._view.getCurrentTab() == this._view.CONTACTS){
						this._contactPhotos.show();
					}		
					this._view.selectNoContact();
					this._view.unblock();
				}.bind(this),
				function(resp_) {
					this._view.unblock();
					this._view.getNotification().info(this._translator.getLabel('contactphotoserror'));
				}.bind(this)		
			);
		}
		
		// Load photos from Flickr (user's searchs)
		FlickrGadget.prototype.loadPhotosFromServer = function (key_, categ_) {
			if (!this._auth.hasAccess()){
				return;
			}
			// Copy in the inputs
			this._view.copyInInputs(key_, categ_);
			switch (categ_){
				case 'photos':
					this._searchFromPhoto(key_);
					break;
				case 'people':	 
					this._searchFromPeople(key_);
					break;
				case 'groups':
					this._searchFromGroup(key_);
					break;
				default:
					break;
			}
		}

		// User clicks "reload"
		FlickrGadget.prototype.reloadLastPhotos = function () {
			// Reloaded from the server to the latest searched
			switch (this._view.getCurrentTab()){
				case this._view.GALLERY:
					this.loadMyPhotosFromServer();
					break;
				case this._view.CONTACTS:
					this.loadContactPhotosFromServer();
					break;
				case this._view.NO_TAB:
				case this._view.EXPLORE:
					this.loadPhotosFromServer(last_key.get(), last_use.get());
					break;
				default:
					break;			
			}
		}
		
		// Display the local photos again (user's properties)
		FlickrGadget.prototype.displayPhotos = function () {
			if (!this._auth.hasAccess()) {
				return;
			}
			switch (this._view.getCurrentTab()){
				case this._view.GALLERY:
					this._myPhotos.first();
					break;
				case this._view.CONTACTS:
					this._contactPhotos.first();
					break;
				case this._view.NO_TAB:
				case this._view.EXPLORE:
					this._exploredPhotos.first();
					break;
				default:
					break;			
			}
		}
		
		// User selects a tab
		FlickrGadget.prototype.setDefaultTab = function (tab_) {
			switch (tab_){
				case 'gallery':	
					if (this._auth.hasAccess() && !this._auth.isPublicAccess()){
						this.selectTab(this._view.GALLERY);
					}
					break;
				case 'contacts':
					if (this._auth.hasAccess() && !this._auth.isPublicAccess()){
						this.selectTab(this._view.CONTACTS);
					}
					break;
				case 'explore':
				default:
					if (this._auth.hasAccess()){
						this.selectTab(this._view.EXPLORE);
					}
					break;			
			}
		}
		
		// User selects a tab
		FlickrGadget.prototype.selectTab = function (tab_) {
			if (this._view.getCurrentTab() == tab_)
				return;
			switch (tab_){
				case this._view.GALLERY:
					this._view.showPhotos();	
					this._myPhotos.show();
					break;
				case this._view.CONTACTS:
					this._view.showPhotos();	
					this._contactPhotos.show();
					break;
				case this._view.NO_TAB:
				case this._view.EXPLORE:
					this._view.showPhotos();
					this._exploredPhotos.show();					
					break;
				default:
					break;			
			}
			// 'setCurrentTab' is invoked even after 'showPhotos'
			this._view.setCurrentTab (tab_);
		}
		
		// User accesses your contact list
		FlickrGadget.prototype.getContactList = function () {
			flickr.contacts.getList ( 
				function(resp_) {
					if (resp_.stat == "fail"){
						onError_(FlickrGadgetFactory.getInstance().getTranslator().getLabel('flickrerror'));
						return;
					}
					if (resp_.contacts && resp_.contacts.contact){
						for (var i=0; i<resp_.contacts.contact.length; i++){
							var ct = resp_.contacts.contact[i];
							this._id2user[ct.nsid] = ct.username;
							Util.ListExt.addItem (this._view.getContactSelector().getSelector(), ct.nsid, ct.username, ct.nsid);
						}
					}
				}.bind(this),
				function(resp_) {
					this._view.getNotification().info(this._translator.getLabel('contactnotfound'));
				}.bind(this)		
			);
		}
		
		// User uploads a photo 
		FlickrGadget.prototype.uploadPhoto = function () {
			this._view.showPopUp(
				PopUp.prototype.UPDATE,
				this._translator.getLabel('update_photo'), null,
				function (){
					if (this._view.getPhotoTitle() == ''){
						this._view.getNotification().info(this._translator.getLabel('withouttitle'));
						return;
					}
					if (this._view.getPathFile() == ''){
						this._view.getNotification().info(this._translator.getLabel('withoutfile'));
						return;
					}
					this._view.setApiSigInput ( 
						flickr.signParams(
							$H({
								title: this._view.getPhotoTitle(),
								description: this._view.getPhotoDescription(),
								api_key: flickr.API_KEY,
								auth_token: FlickrAuthFactory.getInstance().getAuthToken()
							})
						)
					);					
					this._view.block();
					Event.observe(this._view.getUploadIFrame(), 'load', 
						function(){
							this._view.cleanUploadForm();
							this._view.getNotification().clean();
							this._view.hidePopUp();
							this._view.unblock();
							this.loadMyPhotosFromServer();
						}.bind(this)
					);
					this._view.submitUploadForm();
				}.bind(this),
				function (){
					this._view.hidePopUp();
					this._view.unblock();
				}.bind(this)
			);
		}		
		
		// User deletes a photo 
		FlickrGadget.prototype.deletePhoto = function (photo_) {
			this._view.showPopUp(
				PopUp.prototype.WARNING,
				this._translator.getLabel('warning'),
				this._translator.getLabel('delete_photo'),
				function (){
					this._view.hidePopUp();
					this._view.block()
					flickr.photos.deletePhoto(this._view.getSelectedPhoto().id,
						function(resp_) {
							this._view.unblock();
							this.loadMyPhotosFromServer();
						}.bind(this),
						function(resp_) {
							this._view.unblock();
							this._view.getNotification().error(this._translator.getLabel('flickrerror'));
						}.bind(this)		
					);
				}.bind(this),
				function (){
					this._view.hidePopUp();
				}.bind(this)				
			);
		}
		
		// User clicks a photo 
		FlickrGadget.prototype.propagateGadgetEvents = function (photo_) {
			titleEvent.set (photo_.title);
			urlImage.set (photo_.url);
			urlThumb.set (photo_.urlThumbEvent);
			if (!this._id2user[photo_.owner]){
				this._id2user[photo_.owner] = 'PROCESSING';
				flickr.people.getInfo(photo_.owner,
					function(resp_) {
						if (resp_.stat == "fail"){
							onError_(FlickrGadgetFactory.getInstance().getTranslator().getLabel('flickrerror'));
							return;
						}
						this._id2user[resp_.person.nsid] = resp_.person.username._content;
						authorEvent.set(resp_.person.username._content);
					}.bind(this),
					function(resp_) {
						this._view.getNotification().error(this._translator.getLabel('flickrerror'));
					}.bind(this)
				);
			} else if (this._id2user[photo_.owner] != 'PROCESSING') {
				authorEvent.set (this._id2user[photo_.owner]);
			}
		}
		
		// User select a contact
		FlickrGadget.prototype.selectContact = function (contact_) {
			if (!contact_){
				this.loadContactPhotosFromServer();
			} else {
				flickr.people.getContactPhotos (contact_, 
					function(resp_) {
						if (resp_.stat == "fail"){
							this._view.unblock();
							onError_(FlickrGadgetFactory.getInstance().getTranslator().getLabel('flickrerror'));
							return;
						}
						// No image at first (sometimes occurs)
						if ((resp_.photos.photo.length == 0) && !this._initReload) {
							this._initReload = true;
							this.reloadLastPhotos();
							return;
						}
						this._loadSuccess(resp_, this._contactPhotos);
						if (this._view.getCurrentTab() == this._view.CONTACTS){
							this._contactPhotos.show();
						}
						this._view.unblock();						
					}.bind(this),
					function(resp_) {
						this._view.unblock();						
						this._view.getNotification().info(this._translator.getLabel('contactphotoserror'));
					}.bind(this)		
				);
			}
		}
				
		// Photo's pagination
		FlickrGadget.prototype.first = function () {
			switch (this._view.getCurrentTab()){
				case this._view.GALLERY:
					this._myPhotos.first();
					break;
				case this._view.CONTACTS:
					this._contactPhotos.first();
					break;
				case this._view.NO_TAB:
				case this._view.EXPLORE:
					this._exploredPhotos.first();
					break;
				default:
					break;			
			}			
		}
		
		// Photo's pagination
		FlickrGadget.prototype.previous = function () {
			switch (this._view.getCurrentTab()){
				case this._view.GALLERY:
					this._myPhotos.previous();
					break;
				case this._view.CONTACTS:
					this._contactPhotos.previous();
					break;
				case this._view.NO_TAB:
				case this._view.EXPLORE:
					this._exploredPhotos.previous();
					break;
				default:
					break;			
			}			
		}
		
		// Photo's pagination
		FlickrGadget.prototype.next = function () {
			switch (this._view.getCurrentTab()){
				case this._view.GALLERY:
					this._myPhotos.next();
					break;
				case this._view.CONTACTS:
					this._contactPhotos.next();
					break;
				case this._view.NO_TAB:
				case this._view.EXPLORE:
					this._exploredPhotos.next();
					break;
				default:
					break;			
			}	
		}
		
		// Photo's pagination
		FlickrGadget.prototype.last = function () {
			switch (this._view.getCurrentTab()){
				case this._view.GALLERY:
					this._myPhotos.last();
					break;
				case this._view.CONTACTS:
					this._contactPhotos.last();
					break;
				case this._view.NO_TAB:
				case this._view.EXPLORE:
					this._exploredPhotos.last();
					break;
				default:
					break;			
			}	
		}
		
		// Use clicks "logout"
		FlickrGadget.prototype.logout = function () {
			last_key.set('');
			last_use.set('');
			this.remove();
			this._auth.logout();	
			this._view.showFlickrLogin();
		}
	}

	// *********************************
	// SINGLETON GET INSTANCE
	// *********************************
	return new function() {
		this.getInstance = function() {
			if (instance == null) {
				instance = new FlickrGadget();
			}
		return instance;
		}
	}

}();	

// OnResize: Only for IE
Event.observe(window, 'resize', 
	function () {
		FlickrGadgetFactory.getInstance().resize();
	}
);

// OnLoad
Event.observe(window, 'load', 
	function() {
		FlickrGadgetFactory.getInstance().init();
	}
);

// OnUnload
Event.observe(window, 'unload', 
	function() {
		FlickrGadgetFactory.getInstance().remove();
	}
);