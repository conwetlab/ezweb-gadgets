/* 
* This code is licensed under terms shown on this link:
* http://forge.morfeo-project.org/wiki/index.php/Gadgets_2009_License
*/

/*** NOTIFICATION LAYER ***/
function NotificationLayer () {
	this.content = document.createElement('div');
	Element.extend(this.content);
	this.content.addClassName("frame");
	this.content.style.display = 'block';
	this.content.setAttribute("id", "notices");
}

NotificationLayer.prototype.getContent = function() {
	return this.content;
}

NotificationLayer.prototype.error = function(_msg) {
	var err = document.createElement('div');
	Element.extend(err);
	err.addClassName("error");
	err.innerHTML = _msg;
	this.clean();
	this.content.appendChild(err);
	this.content.style.display = 'block';
	setTimeout("GadgetViewFactory.getInstance().getNotification().clean()", 5000);
}
	
NotificationLayer.prototype.info = function(_msg) {
	var info = document.createElement('div');
	Element.extend(info);
	info.addClassName("info");
	info.innerHTML = _msg;
	this.clean();
	this.content.addClassName("popup");
	this.content.appendChild(info);
	this.content.style.display = 'block';
	setTimeout("GadgetViewFactory.getInstance().getNotification().clean()", 5000);
}

NotificationLayer.prototype.clean = function() {	
	this.content.style.display = 'none';
	this.content.innerHTML = '';
	this.content.addClassName("frame");
}

/*** Screen Blocker ***/
function ScreenBlocker () {
	this._content = document.createElement('div');
	this._content.setAttribute("id", "loading");
}

ScreenBlocker.prototype.getContent = function() {
	return this._content;
}

ScreenBlocker.prototype.show = function() {
	this._content.style.display = 'block';
}

ScreenBlocker.prototype.hide = function() {
	this._content.style.display = 'none';
}

/*** UPLOAD PHOTO FORM ***/
function UploadPhotoForm (key_, token_) {
	var translator = FlickrGadgetFactory.getInstance().getTranslator();
	
	this._content = document.createElement('div');
	Element.extend(this._content);	
	this._content.setAttribute('class', 'frame');
	this._content.setAttribute('id', 'send_photo');
	
	this._form = document.createElement('form');
	Element.extend(this._form);	
	this._form.setAttribute('method', 'post');
	this._form.setAttribute('action', 'http://api.flickr.com/services/upload/');
	if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)){ 
		this._form.setAttribute('encoding', "multipart/form-data");
	} else {
		this._form.setAttribute('enctype', "multipart/form-data");
	}
	this._form.setAttribute('target', 'uploadIframe');
	this._content.appendChild(this._form);

	var iapi_sig = document.createElement('input');
	iapi_sig.setAttribute('id', 'api_sig');
	iapi_sig.setAttribute('name', 'api_sig');
	iapi_sig.setAttribute('type', 'hidden');
	
	var iapi_key = document.createElement('input');
	iapi_key.setAttribute('id', 'api_key');
	iapi_key.setAttribute('name', 'api_key');
	iapi_key.setAttribute('type', 'hidden');
	iapi_key.setAttribute('value', key_);
	
	var iauth_token = document.createElement('input');
	iauth_token.setAttribute('id', 'auth_token');
	iauth_token.setAttribute('name', 'auth_token');
	iauth_token.setAttribute('type', 'hidden');
	iauth_token.setAttribute('value', token_);

	this.iPhoto = document.createElement('input');
	Element.extend(this.iPhoto);	
	this.iPhoto.setAttribute('id', 'photo');
	this.iPhoto.setAttribute('name', 'photo');
	this.iPhoto.setAttribute('type', 'file');

	var lTitle = document.createElement('label');
	lTitle.setAttribute('id', 'ltitle'); 
	lTitle.innerHTML = translator.getLabel('ltitle');

	this.iTitle = document.createElement('input');
	Element.extend(this.iTitle);	
	this.iTitle.setAttribute('id', 'title'); 
	this.iTitle.setAttribute('name', 'title'); 
	this.iTitle.setAttribute('type', 'text');

	var lDescription = document.createElement('label');
	lDescription.setAttribute('id', 'ldescription'); 
	lDescription.innerHTML = translator.getLabel('ldescription');

	this.iDescription = document.createElement('input');
	Element.extend(this.iDescription);	
	this.iDescription.setAttribute('id', 'description');
	this.iDescription.setAttribute('name', 'description');
	this.iDescription.setAttribute('type', 'text');

	this._form.appendChild(iapi_sig);
	this._form.appendChild(iapi_key);
	this._form.appendChild(iauth_token);

	var p = document.createElement('p');
	p.appendChild(this.iTitle);
	p.appendChild(lTitle);
	this._form.appendChild(p);

	p = document.createElement('p');
	p.appendChild(this.iDescription);
	p.appendChild(lDescription);
	this._form.appendChild(p);

	p = document.createElement('p');
	p.appendChild(this.iPhoto);
	this._form.appendChild(p);

	this._uploadiframe = $('uploadIframe');
	if (!this._uploadiframe){
		this._uploadiframe = document.createElement('iframe');
		Element.extend(this._uploadiframe);	
		this._uploadiframe.setAttribute('id', 'uploadIframe');
		this._uploadiframe.setAttribute('name', 'uploadIframe');
		this._uploadiframe.style.display = "none";
		this._content.appendChild(this._uploadiframe);
	}
}

UploadPhotoForm.prototype.show = function() {
	this._content.style.display = 'block';
}

UploadPhotoForm.prototype.hide = function() {
	this._content.style.display = 'none';
}

UploadPhotoForm.prototype.getContent = function() {
	return this._content;
}

UploadPhotoForm.prototype.getForm = function() {
	return this._form;
}

UploadPhotoForm.prototype.getIFrame = function() {
	return this._uploadiframe;
}

UploadPhotoForm.prototype.getFile = function() {
	return this.iPhoto;
}

UploadPhotoForm.prototype.toggle = function() {
	if (this._content.style.display == 'none'){
		this.show();
	} else {
		this.hidden();
	}		
}

UploadPhotoForm.prototype.cleanForm = function() {
	this.iTitle.value = '';
	this.iDescription.value = '';
	this.iPhoto.value = '';
}

/*** POPUP ***/
function PopUp (basis_, type_, title_, message_, onAccept_, onCancel_) {
	var translator = FlickrGadgetFactory.getInstance().getTranslator();
	this._content = document.createElement('div');
	Element.extend(this._content);	
	this._content.setAttribute("id", "alert_menu");
	this._content.setAttribute("class", "window_menu");
	this._upform = null;

	var top = document.createElement('div');
	top.setAttribute("id", "ie_window_top");
	top.setAttribute("class", "window_top");

	var img_title = document.createElement('img');
	if (type_ == this.UPDATE){
		img_title.src = basis_ + '/img/icon-info.gif';
		img_title.setAttribute("alt", "info");
	} else {
		img_title.src = basis_ + '/img/warning.png';
		img_title.setAttribute("alt", "warning")
	}

	var title = document.createElement('label');
	title.setAttribute("id", "ie_window_title");
	title.setAttribute("class", "window_title");
	title.innerHTML = title_;
	top.appendChild(img_title);
	top.appendChild(title);

	var content = document.createElement('div');
	content.setAttribute("id", "ie_window_content");
	content.setAttribute("class", "window_content");

	if (type_ == this.UPDATE){
		this._upform = new UploadPhotoForm(flickr.API_KEY, FlickrAuthFactory.getInstance().getAuthToken());
		content.appendChild(this._upform.getContent());
	}else{
		var msg = document.createElement('div');
		msg.setAttribute("id", "ie_window_msg");
		msg.setAttribute("class", "window_msg");	
		msg.innerHTML = message_;
		content.appendChild(msg);
	}	

	var footer = document.createElement('div');
	footer.setAttribute("id", "ie_window_bottom");
	footer.setAttribute("class", "window_bottom");

	var accept = document.createElement('button');
	Element.extend(accept);	
	accept.setAttribute("id", "alert_btn1");
	accept.setAttribute("class", "buttom");
	accept.innerHTML = translator.getLabel('alert_btn1');
	Event.observe(accept, 'click', onAccept_);

	var cancel = document.createElement('button');
	Element.extend(cancel);	
	cancel.setAttribute("id", "alert_btn2");
	cancel.setAttribute("class", "buttom");
	cancel.innerHTML = translator.getLabel('alert_btn2');
	Event.observe(cancel, 'click', onCancel_);
	footer.appendChild(accept);
	footer.appendChild(cancel);

	this._content.appendChild(top);
	this._content.appendChild(content);
	this._content.appendChild(footer);
}

PopUp.prototype.UPDATE = 0;
PopUp.prototype.WARNING = 1;

PopUp.prototype.getContent = function() {
	return this._content;
}

PopUp.prototype.getUploadForm = function() {
	return this._upform;
}

PopUp.prototype.show = function() {
	this._content.style.display = 'block';
}

PopUp.prototype.hide = function() {
	this._content.style.display = 'none';
}

PopUp.prototype.remove = function() {
	this._content.remove();
}

/*** LOGIN LAYER ***/
function LoginLayer () {
	this.content = document.createElement('div');
	this.content.setAttribute("id", "flogin");

	var box = document.createElement('div');
	Element.extend(box);
	box.setAttribute("id", "fbox");
	box.addClassName("box text");
	
	var box_t1 = document.createElement('p');
	box_t1.setAttribute("id", "fbox_text1");
	box.appendChild(box_t1);
	
	var box_t2 = document.createElement('p');
	box_t2.setAttribute("id", "fbox_text2");
	box.appendChild(box_t2);
	
	var box_t3 = document.createElement('p');
	box_t3.setAttribute("id", "fbox_text3");
	box.appendChild(box_t3);
	this.content.appendChild(box);

	var button_layer = document.createElement('div');
	Element.extend(button_layer);
	button_layer.setAttribute("id", "fbuttons");
	button_layer.addClassName("flickr_buttons");
	
	var cbutton = document.createElement('span');
	Element.extend(cbutton);
	cbutton.setAttribute('id', 'continue_button');
	cbutton.addClassName('buttom accept');
	Event.observe(cbutton, 'click', 
		function (ev){
			FlickrGadgetFactory.getInstance().publicAccess();
		}
	);

	var lbutton = document.createElement('span');
	Element.extend(lbutton);
	lbutton.setAttribute('id', 'login_button');
	lbutton.addClassName('buttom accept');
	Event.observe(lbutton, 'click', 
		function (ev){
			FlickrGadgetFactory.getInstance().privateAccess();
		}
	);

	button_layer.appendChild(cbutton);
	button_layer.appendChild(lbutton);
	this.content.appendChild(button_layer);
	Element.extend(this.content);
}

LoginLayer.prototype.getContent = function() {
	return this.content;
}

LoginLayer.prototype.show = function() {
	this.content.style.display = 'block';
}

LoginLayer.prototype.hide = function() {
	this.content.style.display = 'none';
}

/*** INIT SESSION LAYER ***/
function InitSessionLayer () {
	this.content = document.createElement('div');
	
	var box = document.createElement('div');
	Element.extend(box);
	box.addClassName("box text");
	
	var box_text = document.createElement('p');
	box_text.setAttribute("id", "fbox_text");
	box.appendChild(box_text);
	this.content.appendChild(box);

	var butom = document.createElement('span');
	Element.extend(butom);
	butom.setAttribute('id', 'session_button');
	butom.addClassName('buttom right accept');
	Event.observe(butom, 'click', 
		function (ev){
			FlickrGadgetFactory.getInstance().initSession();
		}
	);

	this.content.appendChild(butom);
	Element.extend(this.content);
}

InitSessionLayer.prototype.getContent = function() {
	return this.content;
}
	
InitSessionLayer.prototype.show = function() {
	this.content.style.display = 'block';
}

InitSessionLayer.prototype.hide = function() {
	this.content.style.display = 'none';
}

/*** HEADER ***/
function HeaderLayer (basis_) {
	// Creates the header
	this.content = document.createElement ('div');
	this.content.setAttribute ('id', 'header');
	
	var img = document.createElement('img');
	img.setAttribute ('id', 'logo');
	img.setAttribute ('src', basis_ + '/img/flickr.png');
	
	var a = document.createElement ('a');
	a.setAttribute ('href', 'http://www.flickr.com');
	a.setAttribute ('target', '_blank');
	a.setAttribute ('title', 'Flickr');
	a.appendChild(img);
	
	var imglogout = document.createElement('img');
	Element.extend(imglogout);
	imglogout.setAttribute ('id', 'logout_photo');
	imglogout.setAttribute ('src', basis_ + '/img/logout.png');
	imglogout.addClassName ('action_image logout_photo');
	Event.observe(imglogout, 'click', 
		function (ev){
			FlickrGadgetFactory.getInstance().logout();			
		}
	);
	
	var imgrefresh = document.createElement('img');
	Element.extend(imgrefresh);
	imgrefresh.setAttribute ('id', 'refreshimg');
	imgrefresh.setAttribute ('src', basis_ + '/img/refresh.png');
	imgrefresh.addClassName ('action_image refreshimg');
	Event.observe(imgrefresh, 'click', 
		function (ev){
			GadgetViewFactory.getInstance().block();
			FlickrGadgetFactory.getInstance().reloadLastPhotos();
		}
	);
	
	var uploadImg = document.createElement('img');
	Element.extend(uploadImg);
	uploadImg.setAttribute ('id', 'uploadimg');
	uploadImg.setAttribute ('src', basis_ + '/img/upload2.png');
	uploadImg.addClassName ('action_image uploadimg');
	Event.observe(uploadImg, 'click', 
		function (ev){
			FlickrGadgetFactory.getInstance().uploadPhoto();
		}
	);
	
	var deleteImg = document.createElement('img');
	Element.extend(deleteImg);
	deleteImg.setAttribute ('id', 'deleteimg');
	deleteImg.setAttribute ('src', basis_ + '/img/delete2.png');
	deleteImg.addClassName ('action_image deleteimg');
	Event.observe(deleteImg, 'click', 
		function (ev){
			var selectedPhoto = GadgetViewFactory.getInstance().getSelectedPhoto();
			if (selectedPhoto)
				FlickrGadgetFactory.getInstance().deletePhoto(selectedPhoto);
		}
	);
	
	var link_cont = document.createElement ('div');
	link_cont.setAttribute ('id', 'tab_cont');
	
	var arrow_b = document.createElement ('span');
	Element.extend(arrow_b);
	arrow_b.setAttribute ('id', 'gallery_arrow');
	arrow_b.addClassName('arrow');
	arrow_b.innerHTML = ' &raquo; ';
	link_cont.appendChild(arrow_b);
	
	var gallery_link = document.createElement ('a');
	Element.extend(gallery_link);
	gallery_link.setAttribute ('id', 'gallery_link');
	gallery_link.setAttribute ('href', 'javascript:void(0);');
	gallery_link.addClassName('tab');
	Event.observe(gallery_link, 'click', 
		function (ev){
			FlickrGadgetFactory.getInstance().selectTab(GadgetViewFactory.getInstance().GALLERY);
		}
	);
	link_cont.appendChild(gallery_link);
	
	var arrow_a = document.createElement ('span');
	Element.extend(arrow_a);
	arrow_a.setAttribute ('id', 'contact_arrow');
	arrow_a.addClassName('arrow');
	arrow_a.innerHTML = ' &raquo; ';
	link_cont.appendChild(arrow_a);
	
	var contact_link = document.createElement ('a');
	Element.extend(contact_link);
	contact_link.setAttribute ('id', 'contact_link');
	contact_link.setAttribute ('href', 'javascript:void(0);');
	contact_link.addClassName('tab');
	Event.observe(contact_link, 'click', 
		function (ev){
			FlickrGadgetFactory.getInstance().selectTab(GadgetViewFactory.getInstance().CONTACTS);
		}
	);
	link_cont.appendChild(contact_link);
	
	var arrow_c = document.createElement ('span');
	Element.extend(arrow_c);
	arrow_c.setAttribute ('id', 'explore_arrow');
	arrow_c.addClassName('arrow');
	arrow_c.innerHTML = ' &raquo; ';
	link_cont.appendChild(arrow_c);
	
	var serch_link = document.createElement ('a');
	Element.extend(serch_link);
	serch_link.setAttribute ('id', 'search_link');
	serch_link.setAttribute ('href', 'javascript:void(0);');
	serch_link.addClassName('tab');
	Event.observe(serch_link, 'click', 
		function (ev){
			FlickrGadgetFactory.getInstance().selectTab(GadgetViewFactory.getInstance().EXPLORE);
		}
	);
	link_cont.appendChild(serch_link);
	
	this.content.appendChild (link_cont);
	this.content.appendChild (deleteImg);
	this.content.appendChild (uploadImg);
	this.content.appendChild (imgrefresh);
	this.content.appendChild (imglogout);
	this.content.appendChild (a);
	Element.extend(this.content);
}

HeaderLayer.prototype.getContent = function() {
	return this.content;
}
	
HeaderLayer.prototype.show = function() {
	this.content.style.display = 'block';
}

HeaderLayer.prototype.hide = function() {
	this.content.style.display = 'none';
}	

/*** SEARCH LAYER ***/
function SearchLayer () {
	// Creates the header
	this.content = document.createElement ('div');
	this.content.setAttribute ('id', 'search');

	var table = document.createElement('table');
	var tbody = document.createElement('tbody');
	var row = document.createElement('tr');
	table.appendChild(tbody);
	tbody.appendChild(row);

	var inCol = document.createElement('td');
	inCol.setAttribute ("id", "search_col");
	
	var searchPhotos = function (ev){
		var searchText = $('query').value;
		if (searchText){
			GadgetViewFactory.getInstance().block();
			var searchOps = $('searchOps');
			var opt = searchOps.options[searchOps.selectedIndex].value;
			FlickrGadgetFactory.getInstance().loadPhotosFromServer(searchText, opt);
		}
	};

	var inp = document.createElement('input');
	inp.setAttribute ('id', 'query');
	inp.setAttribute ("type", "text");
	Event.observe(inp, 'keypress', 
		function (ev){
			var ENTER_CODE = 13;		
			var code = ev.keyCode ? ev.keyCode : ev.which;
			if (code == ENTER_CODE) {
				searchPhotos();	
			}
		}
	);
	inCol.appendChild(inp);
	
	var boCol = document.createElement('td');
	var buttom = document.createElement('span');
	Element.extend(buttom);
	buttom.setAttribute('id', 'search_button');
	buttom.addClassName('buttom');
	Event.observe(buttom, 'click', searchPhotos);
	boCol.appendChild(buttom);

	var seCol = document.createElement('td');
	var list = document.createElement('select');
	list.setAttribute('id', 'searchOps');
	Util.ListExt.addItem (list, 'opphoto', '', 'photos', true);
	Util.ListExt.addItem (list, 'oppeople', '', 'people');
	Util.ListExt.addItem (list, 'opgroup', '', 'groups');
	seCol.appendChild(list);

	row.appendChild(inCol);
	row.appendChild(boCol);
	row.appendChild(seCol);
	
	this.content.appendChild(table);
	Element.extend(this.content);
}

SearchLayer.prototype.getContent = function() {
	return this.content;
}

SearchLayer.prototype.setSearchCategory = function(categ_) {
	$('searchOps').value = categ_;
}

SearchLayer.prototype.setSearchInput = function(key_) {
	$('query').value = key_;
}
	
SearchLayer.prototype.show = function() {
	this.content.style.display = 'block';
}

SearchLayer.prototype.hide = function() {
	this.content.style.display = 'none';
}	

/*** CONTACT SELECTOR LAYER ***/
function ContactSelectorLayer () {
	// Creates the header
	this.content = document.createElement ('div');
	this.content.setAttribute ('id', 'contact_selector');

	this.list = document.createElement('select');
	this.list.setAttribute('id', 'contactOps');
	Util.ListExt.addItem (this.list, 'def', '', 'selectContact', true);
	Event.observe(this.list, 'change', 
		function (ev){
			GadgetViewFactory.getInstance().block();
			var lst = $('contactOps'); 
			var ct = lst.options[lst.selectedIndex].value;
			if (ct == 'selectContact'){
				FlickrGadgetFactory.getInstance().selectContact();
			} else {
				FlickrGadgetFactory.getInstance().selectContact(ct);
			}
		}
	);
	this.content.appendChild(this.list);
	Element.extend(this.content);
}

ContactSelectorLayer.prototype.getContent = function() {
	return this.content;
}

ContactSelectorLayer.prototype.getSelector = function() {
	return this.list;
}

ContactSelectorLayer.prototype.show = function() {
	this.content.style.display = 'block';
}

ContactSelectorLayer.prototype.hide = function() {
	this.content.style.display = 'none';
}	

/*** PHOTO LAYER ***/
function ContentLayer () {
	// Creates the content layer
	this.content = document.createElement ('div');
	this.content.setAttribute ('id', 'content_div');
	Element.extend(this.content);
}

ContentLayer.prototype.getContent = function() {
	return this.content;
}
	
ContentLayer.prototype.show = function() {
	this.content.style.display = 'block';
}

ContentLayer.prototype.hide = function() {
	this.content.style.display = 'none';
}	

/*** FOOTER ***/
function FooterLayer (basis_) {
	// Creates the footer
	this.content = document.createElement ('div');
	this.content.setAttribute ('id', 'footer_div');
	
	var img = document.createElement ('img');
	img.src = basis_ + '/img/go-first.png';
	img.setAttribute ('id', 'gofirst');
	img.style.cursor = 'pointer';
	Event.observe (img, 'click', 
		function (e){
			FlickrGadgetFactory.getInstance().first();
		}
	);
	this.content.appendChild (img);
	
	img = document.createElement ('img');
	img.src = basis_ + '/img/go-previous.png';
	img.style.cursor = 'pointer';
	img.setAttribute ('id', 'goprevious');
	Event.observe (img, 'click',  
		function (e){
			FlickrGadgetFactory.getInstance().previous();
		}
	);
	this.content.appendChild (img);
	
	img = document.createElement ('img');
	img.src = basis_ + '/img/go-next.png';
	img.style.cursor = 'pointer';
	img.setAttribute ('id', 'gonext');
	Event.observe (img, 'click',  
		function (e){
			FlickrGadgetFactory.getInstance().next();
		}
	);
	this.content.appendChild (img);
	
	img = document.createElement ('img');
	img.src = basis_ + '/img/go-last.png';
	img.style.cursor = 'pointer';
	img.setAttribute ('id', 'golast');
	Event.observe (img, 'click',  
		function (e){
			FlickrGadgetFactory.getInstance().last();
		}
	);
	this.content.appendChild (img);
	
	Element.extend(this.content);
}

FooterLayer.prototype.getContent = function() {
	return this.content;
}
	
FooterLayer.prototype.show = function() {
	this.content.style.display = 'block';
}

FooterLayer.prototype.hide = function() {
	this.content.style.display = 'none';
}	

/*** MAIN VIEW ***/
var GadgetViewFactory = function () {
	
	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;
	
	function GadgetView () {
		/**** CONSTANTS ****/
		GadgetView.prototype.BASIS_URL = 'http://ezweb.tid.es/repository/ezweb-gadgets/flickr/flickr_4.0';
		GadgetView.prototype.NO_TAB = -1;
		GadgetView.prototype.GALLERY = 0;
		GadgetView.prototype.CONTACTS = 1;
		GadgetView.prototype.EXPLORE = 2;
		
		/**** PRIVATE VARIABLES ****/
		this._notification = new NotificationLayer();
		this._blocker = new ScreenBlocker ();
		this._login = new LoginLayer();
		this._initSession = new InitSessionLayer();
		this._header = new HeaderLayer(GadgetView.prototype.BASIS_URL);
		this._search = new SearchLayer();
		this._contactSelector = new ContactSelectorLayer();
		this._content = new ContentLayer();
		this._footer = new FooterLayer(GadgetView.prototype.BASIS_URL);
		this._photosNum = 5;
		this._numImgs = 0;
		this._popup = null;
		this._currentTab = null;
		this._selectedPhoto = null;
				
		/**** PRIVATE METHODS ****/
		GadgetView.prototype._toogleTab = function(tab_) {
			if (this._currentTab == tab_)
				return;

			switch (this._currentTab){
				case GadgetView.prototype.GALLERY:
					$('gallery_arrow').className = 'arrow';
					$('gallery_link').className = 'tab';
					break;
				case GadgetView.prototype.CONTACTS:
					$('contact_arrow').className = 'arrow';
					$('contact_link').className = 'tab';
					break;
				case GadgetView.prototype.EXPLORE:
					$('explore_arrow').className = 'arrow';
					$('search_link').className = 'tab';
					break;
				default:
					break;
			}	

			switch (tab_){
				case GadgetView.prototype.GALLERY:
					$('gallery_arrow').addClassName ('current');
					$('gallery_link').addClassName ('current');
					$('uploadimg').style.display = 'block';
					$('deleteimg').style.display = 'block';
					$('refreshimg').className = 'action_image refreshimg'; 
					$('search').style.display = 'none';
					$('contact_selector').style.display = 'none';
					$('content_div').addClassName ('without_input');
					break;
				case GadgetView.prototype.CONTACTS:
					$('contact_arrow').addClassName ('current');
					$('contact_link').addClassName ('current');
					$('uploadimg').style.display = 'none';
					$('deleteimg').style.display = 'none';
					$('refreshimg').className = 'action_image deleteimg'; 
					$('search').style.display = 'none';
					$('contact_selector').style.display = 'block';
					$('content_div').className = '';
					break;
				case GadgetView.prototype.EXPLORE:
					$('explore_arrow').addClassName ('current');
					$('search_link').addClassName ('current');
					$('uploadimg').style.display = 'none';
					$('deleteimg').style.display = 'none';
					$('refreshimg').className = 'action_image deleteimg'; 					
					$('search').style.display = 'block';
					$('contact_selector').style.display = 'none';
					$('content_div').className = '';
					break;
				case GadgetView.prototype.NO_TAB:
					$('uploadimg').style.display = 'none';
					$('deleteimg').style.display = 'none';
					$('refreshimg').className = 'action_image deleteimg'; 					
					$('tab_cont').style.display = 'none';
					$('search').style.display = 'block';
					$('contact_selector').style.display = 'none';
					$('content_div').className = '';
					break;
				default:
					break;
			}	
		}	
		
		/**** PUBLIC METHODS ****/
		GadgetView.prototype.getCurrentTab = function() {
			return this._currentTab;
		}
		
		GadgetView.prototype.getSelectedPhoto = function () {
			return this._selectedPhoto;
		}
		
		GadgetView.prototype.setCurrentTab = function(tab_) {
			if (this._selectedPhoto && (tab_ != this.GALLERY))
				this.selectPhoto(this._selectedPhoto);
			this._toogleTab (tab_);
			this._currentTab = tab_;
		}
		
		GadgetView.prototype.setNumberShownPhotos = function (pref_){
			this._photosNum = parseInt(pref_,10);
			if (isNaN(this._photosNum)){
				this._photosNum = 5;
			}
			if (this._photosNum <= 0){
				this._photosNum = 1;
			}	
		}
		
		GadgetView.prototype.setNumberCurrentPhotos = function (num_){
			this._numImgs = num_;
		}
		
		GadgetView.prototype.getNotification = function() {
			return this._notification;
		}
		
		GadgetView.prototype.getLogin = function() {
			return this._login;
		}
		
		GadgetView.prototype.getBlocker = function() {
			return this._blocker;
		}
		
		GadgetView.prototype.getInitSession = function() {
			return this._initSession;
		}
		
		GadgetView.prototype.getHeader = function() {
			return this._header;
		}
		
		GadgetView.prototype.getSearch = function() {
			return this._search;
		}
		
		GadgetView.prototype.getContactSelector = function() {
			return this._contactSelector;
		}
		
		GadgetView.prototype.getContent = function() {
			return this._content;
		}
		
		GadgetView.prototype.getFooter = function() {
			return this._footer;
		}
		
		GadgetView.prototype.getFooter = function() {
			return this._footer;
		}
		
		GadgetView.prototype.getPhotoTitle = function() {
			if (!this._popup || !this._popup.getUploadForm())
				return;
				
			return this._popup.getUploadForm().getForm().title.value;
		}
		
		GadgetView.prototype.getPhotoDescription = function() {
			if (!this._popup || !this._popup.getUploadForm())
				return;
				
			return this._popup.getUploadForm().getForm().description.value;
		}

		GadgetView.prototype.getPathFile = function() {
			if (!this._popup || !this._popup.getUploadForm())
				return;
				
			return this._popup.getUploadForm().getFile().value;
		}		
		
		GadgetView.prototype.setApiSigInput = function(value_) {
			if (!this._popup || !this._popup.getUploadForm())
				return;
			
			this._popup.getUploadForm().getForm().api_sig.value = value_;			
		}
		
		GadgetView.prototype.getUploadIFrame = function() {
			if (!this._popup || !this._popup.getUploadForm())
				return;
				
			return this._popup.getUploadForm().getIFrame();
		}		
		
		GadgetView.prototype.submitUploadForm = function() {
			if (!this._popup || !this._popup.getUploadForm())
				return;
				
			return this._popup.getUploadForm().getForm().submit();
		}

		GadgetView.prototype.cleanUploadForm = function() {
			if (!this._popup || !this._popup.getUploadForm())
				return;
				
			return this._popup.getUploadForm().cleanForm();
		}
		
		GadgetView.prototype.showPopUp = function(type_, title_, message_, onAccept_, onCancel_) {
			this._popup = new PopUp(GadgetView.prototype.BASIS_URL, type_, title_, message_, onAccept_, onCancel_);
			document.body.appendChild(this._popup.getContent());
			this._popup.show();
		}
		
		GadgetView.prototype.hidePopUp = function() {
			this._popup.hide();
			this._popup.remove();
			delete this._popup;
		}
		
		GadgetView.prototype.copyInInputs = function(key_, categ_) {	
			this._search.setSearchInput(key_);
			this._search.setSearchCategory(categ_);
		}
		
		GadgetView.prototype.selectNoContact = function() {	
			this._contactSelector.getSelector().value = 'selectContact';
		}
		
		GadgetView.prototype.init = function(num_) {
			// Translates the interface
			var translator = FlickrGadgetFactory.getInstance().getTranslator();
		
			// Appends all HTML elements
			document.body.appendChild(this.getBlocker().getContent());
			document.body.appendChild(this.getNotification().getContent());
			document.body.appendChild(this.getLogin().getContent());
			document.body.appendChild(this.getInitSession().getContent());
			document.body.appendChild(this.getHeader().getContent());
			document.body.appendChild(this.getSearch().getContent());
			document.body.appendChild(this.getContactSelector().getContent());
			document.body.appendChild(this.getContent().getContent());
			document.body.appendChild(this.getFooter().getContent());
			
			// Translate some special elements 
			$('logout_photo').setAttribute ('title', translator.getLabel('logout'));
			$('refreshimg').setAttribute ('title', translator.getLabel('refresh'));
			$('uploadimg').setAttribute ('title', translator.getLabel('upload'));
			$('deleteimg').setAttribute ('title', translator.getLabel('delete'));
			
			$('gallery_link').innerHTML = translator.getLabel('gallery_link');
			$('contact_link').innerHTML = translator.getLabel('contact_link');
			$('search_link').innerHTML = translator.getLabel('search_link');
			
			Util.ListExt.renameItems($('searchOps'));
			Util.ListExt.renameItems($('contactOps'));
			$('gofirst').setAttribute ('title', translator.getLabel('gofirst_'));
			$('goprevious').setAttribute ('title', translator.getLabel('goprevious_'));
			$('gonext').setAttribute ('title', translator.getLabel('gonext_'));
			$('golast').setAttribute ('title', translator.getLabel('golast_'));
			
			// Hides all elements
			this.getBlocker().hide();
			this.getLogin().hide();
			this.getInitSession().hide();
			this.getHeader().hide();
			this.getSearch().hide();
			this.getContactSelector().hide();
			this.getContent().hide();
			this.getFooter().hide();
		
			this._photosNum = num_;
		}
		
		GadgetView.prototype.block = function() {
			this._blocker.show();
		}
		
		GadgetView.prototype.unblock = function() {
			this._blocker.hide();
		}
				
		GadgetView.prototype.error = function(_msg) {
			this._notification.error(_msg);
		}
		
		GadgetView.prototype.showFlickrLogin = function() {
			this._login.show();
			this._initSession.hide();		
			this._header.hide();
			this._search.hide();
			this._contactSelector.hide();
			this._content.hide();
			this._footer.hide();
		}
		
		GadgetView.prototype.showInitSession = function() {
			this._login.hide();
			this._initSession.show();
			this._header.hide();
			this._search.hide();
			this._contactSelector.hide();
			this._content.hide();
			this._footer.hide();
		}
		
		GadgetView.prototype.showPhotos = function() {
			this._notification.clean();
			this._login.hide();	
			this._initSession.hide();
			this._header.show();
			this._search.show();
			this._contactSelector.show();
			this._content.show();
			this._footer.show();
		}
		
		GadgetView.prototype.cleanPhotos = function () {
			$('content_div').innerHTML = '';
		}
		
		GadgetView.prototype.paintPhoto = function (ph_) {
			$('content_div').appendChild(ph_);
		}
		
		GadgetView.prototype.selectPhoto = function (photo_) {
			if (this._currentTab != this.GALLERY)
				return;
				
			Element.extend(photo_);
			Element.extend(photo_.parentNode);
			if (this._selectedPhoto == photo_){
				photo_.className = 't';
				if (/MSIE (\d+\.\d+);/.test(navigator.userAgent) && photo_.parentNode){ 
					photo_.parentNode.className = 'tl';
				}
				this._selectedPhoto = null;
			} else {				
				if (this._selectedPhoto != null){
					this._selectedPhoto.className = 't';
					if (/MSIE (\d+\.\d+);/.test(navigator.userAgent) && this._selectedPhoto.parentNode){ 
						this._selectedPhoto.parentNode.className = 'tl';
					}
				}
				photo_.addClassName ('selected');
				if (/MSIE (\d+\.\d+);/.test(navigator.userAgent) && photo_.parentNode){ 
					photo_.parentNode.addClassName ('selected');
				}
				this._selectedPhoto = photo_;
			}
		}
		
		GadgetView.prototype.resize = function() {
			if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)){ 
				if (window.frameElement.getWidth() > 0)
					$('footer_div').style.width = window.frameElement.getWidth() - 2 + 'px';
				if (window.frameElement.getHeight() > 0)
					$('content_div').style.height = window.frameElement.getHeight() - 104 + 'px';
				if (this._numImgs < (this._photosNum / (this._photosNum / 5)) ){
					$('content_div').style.width = 'auto';	
				} else {
					$('content_div').style.width = window.frameElement.getWidth() - 2 + 'px';	
				}
			}
		}
		
		GadgetView.prototype.remove = function() {
			this._popup = null;
			this._currentTab = null;
			this._selectedPhoto = null;
		}
	}	
	
	// *********************************
	// SINGLETON GET INSTANCE
	// *********************************
	return new function() {
		this.getInstance = function() {
			if (instance == null) {
				instance = new GadgetView();
			}
		return instance;
		}
	}
}();