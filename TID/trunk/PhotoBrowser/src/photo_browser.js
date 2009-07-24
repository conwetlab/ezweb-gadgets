
var PhotoBrowser = function() {
    /* Call to the parent constructor */
    EzWebGadget.call(this, {translatable: true});
}

PhotoBrowser.prototype = new EzWebGadget(); /* Extend from EzWebGadget */

PhotoBrowser.prototype.resourcesURL = "http://demo.ezweb.morfeo-project.org/repository/PhotoBrowser/src"; 
PhotoBrowser.prototype.imageURL = 'http://demo.ezweb.morfeo-project.org/repository/PhotoBrowser/images';

PhotoBrowser.prototype.init = function(){

	this.images_url = "http://demo.ezweb.morfeo-project.org/repository/PhotoBrowser/images/"
	this.url = EzWebAPI.createRGadgetVariable("url", EzWebExt.bind(this.start,this));
	this.linkEvent = EzWebAPI.createRWGadgetVariable("link");
	this.titleEvent = EzWebAPI.createRWGadgetVariable("title");
	this.nphotosPref = EzWebAPI.createRGadgetVariable("photosperpage", EzWebExt.bind(function(e){
		this.setNumberOfPhotos();
	},this));
// 	this.nphotos = this.nphotosPref.get(); // Default photos number
	this.img_list = [];
	this.tag_list = [];
	this.current_imgs = [];
	this.next_imgs = [];
	this.previous_imgs = [];
	// Events
	this.linkEvent = EzWebAPI.createRWGadgetVariable("link");
	this.titleEvent = EzWebAPI.createRWGadgetVariable("title");
	// header
	this.header = document.createElement('div');
	this.header.setAttribute('id','header');
	document.body.appendChild(this.header);
	this.refresh = document.createElement('img');
	this.refresh.setAttribute('src',this.images_url + "refresh.png");
	this.refresh.setAttribute('title', 'Refresh');
	this.header.appendChild(this.refresh);
	
	// main
	this.main = document.createElement('div');
	if (this.nphotos == 1)
		EzWebExt.addClassName(this.main, "main_one");
	else
		EzWebExt.addClassName(this.main, "main");
	document.body.appendChild(this.main);
	
	// Create Browse buttons, footer
	this.buttons = document.createElement('div');
	this.buttons.setAttribute('id','buttons');
	this.go_next = document.createElement('img');
	this.go_next.setAttribute('src',this.images_url + "go-next.png");
	this.go_next.setAttribute('title', 'Go Next');
	this.go_previous = document.createElement('img');
	this.go_previous.setAttribute('src',this.images_url + "go-previous.png");
	this.go_previous.setAttribute('title', 'Go Previous');
	this.go_first = document.createElement('img');
	this.go_first.setAttribute('src',this.images_url + "go-first.png");
	this.go_first.setAttribute('title', 'Go First');
	this.go_last = document.createElement('img');
	this.go_last.setAttribute('src',this.images_url + "go-last.png");
	this.go_last.setAttribute('title', 'Go Last');
	this.buttons.appendChild(this.go_first);
	this.buttons.appendChild(this.go_previous);
	this.buttons.appendChild(this.go_next);
	this.buttons.appendChild(this.go_last);

	// append browse buttons
	document.body.appendChild(this.buttons);

	// Events
	this.refresh.addEventListener("click", EzWebExt.bind(function(e){
				this.start();
			}, this), false);
			
	this.go_first.addEventListener("click", EzWebExt.bind(function(e){
				this.setArrays(0);
			}, this), false);
			
	this.go_previous.addEventListener("click", EzWebExt.bind(function(e){
				this.setArrays(1);
			}, this), false);
			
	this.go_next.addEventListener("click", EzWebExt.bind(function(e){
				this.setArrays(2);
			}, this), false);
			
	this.go_last.addEventListener("click", EzWebExt.bind(function(e){
				this.setArrays(3);
			}, this), false);
	
}

PhotoBrowser.prototype.start = function() {
	
		// Initialize list
		this.img_list = [];
		
		this.main.innerHTML = "";
		// Get url value
		var html_source = this.url.get();
		// Get html source
		EzWebAPI.send_get(
			html_source,
			this, 
			this.onSuccess, 
			this.error);		
		
}

PhotoBrowser.prototype.onSuccess = function(response) {
	var div_aux = document.createElement('div');
	this.img_list = [];
	this.tag_list = [];
	div_aux.innerHTML = response.responseText;
	// Get img elements
	this.tag_list  = div_aux.getElementsByTagName('img');
	
	this.current_imgs = [];
	this.previous_imgs = [];
	this.next_imgs = [];
	
	for (var i = 0; i < this.tag_list.length; i++) {
		if (!this.repeatImage(this.tag_list[i].src)) {
			var url_root = document.URL.split("xhtml");	
			var result = this.tag_list[i].src.split(url_root[0]);
			if (result.length <= 1) {
				result = this.tag_list[i].src.split(document.referrer);
				if (result.length <= 1) {
					this.img_list.push({
						'src': this.tag_list[i].src,
						'title': this.tag_list[i].title
					});
				}
				else {
					this.img_list.push({
					'src': this.url.get()+"/"+ result[1],
					'title': this.tag_list[i].title
					});
				}
			}
			else {
				this.img_list.push({
					'src': this.url.get()+"/"+ result[1],
					'title': this.tag_list[i].title
				});
			}
		}
	}
	
	this.setArrays(null);
	
}

// Draw the images
PhotoBrowser.prototype.displayImages = function() {
	this.main.innerHTML = "";
	var img_aux = [];
	var div1 = document.createElement('div');
	
	for (var i=0;i<this.current_imgs.length;i++) {
		
		var img = document.createElement('img');
		img.setAttribute('src', this.current_imgs[i].src);
		img_aux.push(img);
		
		var context = {
			self: PhotoBrowser,
			link: this.current_imgs[i].src,
			title: this.current_imgs[i].title
		};
		
		img.addEventListener("click", EzWebExt.bind(function(e){
				this.self.dispatchEvents(this.link, this.title);
		}, context), false);
		
		var div = document.createElement('div');
		if (this.nphotos == 1) {
			EzWebExt.addClassName(div1, "big_container");
			EzWebExt.addClassName(img, "big_img");
			div1.appendChild(img);
			this.main.appendChild(div1);
		}
		else {
			EzWebExt.addClassName(div, "container");
			EzWebExt.addClassName(img, "standard_img");
			div.appendChild(img);
			this.main.appendChild(div);
		}
	}
	
	// Get paddingTops and align the images
	for (var j=0;j<img_aux.length;j++) {
		var tam = img_aux[j].height;
		if (this.nphotos == 1) {
			img_aux[j].style.paddingTop = (div1.offsetHeight/2) - (tam/2);
		}
		else {
			if (tam > 75) {
				tam = 75;
			}
			img_aux[j].style.paddingTop = 37.5 - (tam/2);
		}
	}
}


// Not repeated images
PhotoBrowser.prototype.repeatImage = function (src) {
	for (var i=0; i<this.img_list.length;i++) {
		if (src==this.img_list[i].src) {
			return true;
		}
	}
	return false;
}


PhotoBrowser.prototype.error = function(response,e) {
	alert("error en la peticion");
	try {
		
	}
	catch(e){
		alert("excepcion");
	}
}

PhotoBrowser.prototype.setNumberOfPhotos  = function() {
	if (this.nphotosPref.get() == '1') {
		this.nphotos = 1;
		EzWebExt.addClassName(this.main, "main_one");
	}
	if (this.nphotosPref.get() == '5') {
		this.nphotos = 5;
		EzWebExt.addClassName(this.main, "main");
	}
	if (this.nphotosPref.get() == '10') {
		this.nphotos = 10;
		EzWebExt.addClassName(this.main, "main");
	}
	if (this.nphotosPref.get() == '15') {
		this.nphotos = 15;
		EzWebExt.addClassName(this.main, "main");
	}
	if (this.nphotosPref.get() == '20') {
		this.nphotos = 20;
		EzWebExt.addClassName(this.main, "main");
	}
	this.start();
}

PhotoBrowser.prototype.setArrays = function(code){

	// Caso inicial
	if ((this.previous_imgs.length == 0) && (this.current_imgs.length == 0) && (this.next_imgs.length == 0)) {
		// Get the number of photos in the current list
		last = (this.nphotos < this.img_list.length) ? this.nphotos : this.img_list.length;
		for (var i = 0; i < last; i++) {
			var img = this.img_list[i]; // get the first img
			this.current_imgs[i] = img; // inserting into this.current_imgs
		}
		// Adding the rest of the imgs in the this.next_imgs list
		for (var i = last; i < this.img_list.length; i++) {
			this.next_imgs[this.next_imgs.length] = this.img_list[i];
		}
		this.displayImages();
		return;
	}
	if (code == 0) { // asking for first images
		// it has all the imgs
		this.previous_imgs = this.previous_imgs.concat(this.current_imgs.concat(this.next_imgs));
		last = (this.nphotos < this.previous_imgs.length) ? this.nphotos : this.previous_imgs.length;
		this.current_imgs = [];
		this.next_imgs = [];
		for (var i = 0; i < last; i++) {
			img = this.previous_imgs[i]; // get the first img
			this.current_imgs[i] = img; // inserting into this.current_imgs
		}
		// Adding the rest of the imgs in the this.next_imgs list
		for (var i = last; i < this.previous_imgs.length; i++) {
			this.next_imgs[this.next_imgs.length] = this.previous_imgs[i];
		}
		this.previous_imgs = [];
		this.displayImages();
		return;
	}
	if (code == 1) { // asking for previous images
		if (this.previous_imgs.length == 0) 
			return;
		// Moving the this.current_imgs into the this.next_imgs list
		this.current_imgs = this.current_imgs.concat(this.next_imgs);
		this.next_imgs = this.current_imgs;
		this.current_imgs = [];
		this.current_imgs = this.previous_imgs.slice(this.previous_imgs.length - this.nphotos, this.previous_imgs.length);
		this.previous_imgs = this.previous_imgs.slice(0, this.previous_imgs.length - this.nphotos);
		this.displayImages();
		return;
	}
	if (code == 2) { // asking for next images
		if (this.next_imgs.length == 0) 
			return;
		this.previous_imgs = this.previous_imgs.concat(this.current_imgs);
		this.current_imgs = [];
		last = (this.nphotos < this.previous_imgs.length) ? this.nphotos : this.previous_imgs.length;
		this.current_imgs = this.next_imgs.slice(0, last);
		this.next_imgs = this.next_imgs.slice(last, this.next_imgs.length);
		this.displayImages();
		return;
	}
	if (code == 3) { // asking form last images
		this.previous_imgs = this.previous_imgs.concat(this.current_imgs.concat(this.next_imgs));
		this.next_imgs = [];
		this.current_imgs = [];
		last = this.previous_imgs.length % this.nphotos;
		this.current_imgs = this.previous_imgs.slice(this.previous_imgs.length - last, this.previous_imgs.length);
		this.previous_imgs = this.previous_imgs.slice(0, this.previous_imgs.length - last);
		this.displayImages();
		return;
	}
}
	
PhotoBrowser.prototype.dispatchEvents = function (link, title) {
	this.linkEvent.set((link)?link:"");
	this.titleEvent.set((title)?title:"");
	return;
}

PhotoBrowser = new PhotoBrowser();
