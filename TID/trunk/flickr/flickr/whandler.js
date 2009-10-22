/* 
* This code is licensed under terms shown on this link:
* http://forge.morfeo-project.org/wiki/index.php/Gadgets_2009_License
*/

var frameNotices = (function() {
	var frame = document.createElement('div');
	Element.extend(frame);
	frame.addClassName("frame");
	frame.style.display = '';
	frame.setAttribute("id", "notices");

	frame.error = function(msg) {
		frame.clean();

		var err = document.createElement('div');
		Element.extend(err);
		err.addClassName("error");
		err.innerHTML = msg;
		frame.appendChild(err);
		frame.style.display = '';
		setTimeout("frameNotices.clean()", 5000);
	};

	frame.info = function(msg) {
		frame.clean();

		var info = document.createElement('div');
		Element.extend(info);
		info.addClassName("info");
		info.innerHTML = msg;
		frame.addClassName("popup");
		frame.appendChild(info);
		frame.style.display = '';
		setTimeout("frameNotices.clean()", 5000);
	};

	frame.clean = function() {
		frame.style.display = 'none';
		frame.innerHTML = '';
		frame.addClassName("frame");
	};

	return frame;
})();

var frameLogin = (function() {
	var frame = document.createElement('div');
	frame.setAttribute("id", "flogin");

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
	frame.appendChild(box);

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
			access.set('public');
			showPhotos();		
		});

	var lbutton = document.createElement('span');
	Element.extend(lbutton);
	lbutton.setAttribute('id', 'login_button');
	lbutton.addClassName('buttom accept');
	Event.observe(lbutton, 'click', 
		function (ev){
			access.set('private');		
			login();		
		});

	button_layer.appendChild(cbutton);
	button_layer.appendChild(lbutton);
	frame.appendChild(button_layer);

	frame.show = function() {
		frame.style.display = '';
	};
	frame.hidden = function() {
		frame.style.display = 'none';
	};

	return Element.extend(frame);
})();

var frameInitSession = (function() {
	var frame = document.createElement('div');
	
	var box = document.createElement('div');
	Element.extend(box);
	box.addClassName("box text");
	
	var box_text = document.createElement('p');
	box_text.setAttribute("id", "fbox_text");
	box.appendChild(box_text);
	frame.appendChild(box);

	var butom = document.createElement('span');
	Element.extend(butom);
	butom.setAttribute('id', 'session_button');
	butom.addClassName('buttom right accept');
	Event.observe(butom, 'click', initSession);
	frame.appendChild(butom);

	frame.show = function() {
		frame.style.display = '';
	};
	frame.hidden = function() {
		frame.style.display = 'none';
	};

	return Element.extend(frame);
})();


var headerLayer = (function() {
	// Creates the header
	var header = document.createElement ('div');
	header.setAttribute ('id', 'header');
	var img = document.createElement('img');
	img.setAttribute ('id', 'logo');
	img.setAttribute ('src', 'http://ezweb.tid.es/repository/ezweb-gadgets/flickr/flickr_3.5/img/flickr.png');
	var a = document.createElement ('a');
	a.setAttribute ('href', 'http://www.flickr.com');
	a.setAttribute ('target', '_blank');
	a.setAttribute ('title', 'Flickr');
	a.appendChild(img);
	var imglogout = document.createElement('img');
	imglogout.setAttribute ('id', 'logout_photo');
	imglogout.src ='http://ezweb.tid.es/repository/ezweb-gadgets/flickr/flickr_3.5/img/logout.png';
	Event.observe(imglogout, 'click', 
		function (ev){
			logout();	
		});
	var imgrefresh = document.createElement('img');
	imgrefresh.setAttribute ('id', 'refreshimg');
	imgrefresh.src ='http://ezweb.tid.es/repository/ezweb-gadgets/flickr/flickr_3.5/img/refresh.png';
	Event.observe(imgrefresh, 'click', 
		function (ev){
			setNumberOfPhotos();	
		});
	header.appendChild (imgrefresh);
	header.appendChild (imglogout);
	header.appendChild (a);

	header.show = function() {
		this.style.display = '';
	};
	header.hidden = function() {
		this.style.display = 'none';
	};

	return Element.extend(header);
})();

var searchLayer = (function() {
	// Creates the header
	var form = document.createElement ('div');
	form.setAttribute ('id', 'search');

	var table = document.createElement('table');
	var tbody = document.createElement('tbody');
	var row = document.createElement('tr');
	table.appendChild(tbody);
	tbody.appendChild(row);

	var inCol = document.createElement('td');
	inCol.setAttribute ("id", "search_col");
	
	var searchPhotos = function (ev){
		var searchText = document.getElementById('query').value;
		if (searchText){
			var searchOps = document.getElementById('searchOps');
			var opt = searchOps.options[searchOps.selectedIndex].value;
			if (opt == 'photos'){
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
	Event.observe(inp, 'keypress', 
		function (ev){
			var ENTER_CODE = 13;		
			var code = ev.keyCode ? ev.keyCode : ev.which;
			if (code == ENTER_CODE) {
				searchPhotos();	
			}
		});
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
	addItemToList (list, 'opphoto', '', 'photos', true);
	addItemToList (list, 'oppeople', '', 'people');
	addItemToList (list, 'opgroup', '', 'groups');
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

	return Element.extend(form);
})();


var contentLayer = (function() {
	// Creates the content layer
	var content = document.createElement ('div');
	content.setAttribute ('id', 'content_div');

	content.show = function() {
		this.style.display = '';
		// When the gadget is loaded, only the defaulf photos have to be shown
		last_key.set('');
		displayDefaultPhotos();
		resetInterval(time.get());
	};
	content.hidden = function() {
		this.style.display = 'none';
		try {
			clearInterval (interval);
		}catch(e){}
	};

	return Element.extend(content);
})();


var footerLayer = (function() {
	// Creates the footer
	var footer = document.createElement ('div');
	footer.setAttribute ('id', 'footer_div');
	img = document.createElement ('img');
	img.src = 'http://ezweb.tid.es/repository/ezweb-gadgets/flickr/flickr_3.5/img/go-first.png';
	img.setAttribute ('id', 'gofirst');
	Event.observe (img, 'click', function (e){setArrays(null,0);});
	footer.appendChild (img);
	img = document.createElement ('img');
	img.src = 'http://ezweb.tid.es/repository/ezweb-gadgets/flickr/flickr_3.5/img/go-previous.png';
	img.setAttribute ('id', 'goprevious');
	Event.observe (img, 'click', function (e){setArrays(null,1);});
	footer.appendChild (img);
	img = document.createElement ('img');
	img.src = 'http://ezweb.tid.es/repository/ezweb-gadgets/flickr/flickr_3.5/img/go-next.png';
	img.setAttribute ('id', 'gonext');
	Event.observe (img, 'click', function (e){setArrays(null,2);});
	footer.appendChild (img);
	img = document.createElement ('img');
	img.src = 'http://ezweb.tid.es/repository/ezweb-gadgets/flickr/flickr_3.5/img/go-last.png';
	img.setAttribute ('id', 'golast');
	Event.observe (img, 'click', function (e){setArrays(null,3);});
	footer.appendChild (img);

	footer.show = function() {
		this.style.display = '';
	};
	footer.hidden = function() {
		this.style.display = 'none';
	};

	return Element.extend(footer);
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

/* MAIN */

// Translator
function generateLang(){
	translator = new EzWebExt.Translator(labels, "language");
	init();
	translator.translate();
}

// OnResize: Only for IE
function resizeContent(){
	if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)){ 
		document.getElementById('footer_div').style.width = window.frameElement.getWidth() - 2 + 'px';
		document.getElementById('content_div').style.height = window.frameElement.getHeight() - 104 + 'px';
		if (currentimgs.length < (nphotosPref.get() / (nphotosPref.get() / 5)) ){
			document.getElementById('content_div').style.width = 'auto';	
		} else {
			document.getElementById('content_div').style.width = window.frameElement.getWidth() - 2 + 'px';	
		}
	}
}



function init (){
	document.body.appendChild(frameNotices);
	document.body.appendChild(frameLogin);
	document.body.appendChild(frameInitSession);
	document.body.appendChild(headerLayer);
	document.body.appendChild(searchLayer);
	document.body.appendChild(contentLayer);
	document.body.appendChild(footerLayer);
	
	// Translate some special elements 
	document.getElementById('logout_photo').setAttribute ('title', translator.getLabel('logout'));
	document.getElementById('refreshimg').setAttribute ('title', translator.getLabel('refresh'));
	renameItemsInList(document.getElementById('searchOps'));
	document.getElementById('gofirst').setAttribute ('title', translator.getLabel('gofirst_'));
	document.getElementById('goprevious').setAttribute ('title', translator.getLabel('goprevious_'));
	document.getElementById('gonext').setAttribute ('title', translator.getLabel('gonext_'));
	document.getElementById('golast').setAttribute ('title', translator.getLabel('golast_'));
	
	frameLogin.hidden();
	frameInitSession.hidden();
	headerLayer.hidden();
	searchLayer.hidden();
	contentLayer.hidden();
	footerLayer.hidden();

	authenticate();
}

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

function renameItemsInList(list_) {
	for (var i = 0; i < list_.options.length ; i++) {
		var opt = list_.options[i];
		opt.text = translator.getLabel(opt.value);
	}
}

