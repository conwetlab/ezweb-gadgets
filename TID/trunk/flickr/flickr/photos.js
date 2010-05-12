/* 
* This code is licensed under terms shown on this link:
* http://forge.morfeo-project.org/wiki/index.php/Gadgets_2009_License
*/

function PhotoCollection (num_, photos_) {
	/**** PRIVATE VARIABLES ****/
	this._previousimgs = [];   // Previous images of the pagination 
	this._currentimgs = [];    // Current images of the pagination
	this._nextimgs = [];       // Next images of the pagination
	this._photosNum = 5;
	
	if (num_){
		this.setNumberShownPhotos(num_);
	}
	
	if (photos_){
		this.setPhotos(photos_);
	}
	
	/**** PRIVATE METHODS ****/
	PhotoCollection.prototype._paint = function (){
		var view = GadgetViewFactory.getInstance();
		view.cleanPhotos();
		for (var i=0;i<this._currentimgs.length;i++){
			view.paintPhoto(this._currentimgs[i]);
		}
		// Only in IE
		view.setNumberCurrentPhotos(this._currentimgs.length);	
		view.resize();
		return;
	}
	
	PhotoCollection.prototype._createPhoto = function (img_) {
		// creating image
		var image = document.createElement ('img');
		Element.extend(image);
		image.src = img_.urlThumb;
		image.setAttribute ('id', img_.id);
		image.addClassName ('t');
		if (img_.title){
			image.setAttribute ('alt', img_.title);
		}
		// creating link
		var a = document.createElement('a');
		Element.extend(a);
		a.href = '#';
		a.addClassName ('tl');
		if (img_.title){
			a.setAttribute ('title', img_.title);
		}
		var context = {
			image:   image, 
			jsonImg: img_, 
			link:    a, 
			id2user: FlickrGadgetFactory.getInstance().getId2User()
		};
		Event.observe(a, 'click', (function(e){
			GadgetViewFactory.getInstance().selectPhoto(this.image);
			FlickrGadgetFactory.getInstance().propagateGadgetEvents(this.jsonImg);	
		}).bind(context));
		var eventHander = (function(e) {
			var title = '';
			if (this.id2user[this.jsonImg.owner]){
				if (this.jsonImg.title){
					title += '\''+ this.jsonImg.title +'\' by '+ this.id2user[this.jsonImg.owner];
				} else {
					title += 'Photo by ' + this.id2user[this.jsonImg.owner];
				}
				this.image.setAttribute ('alt', title);
				this.link.setAttribute ('title', title);
				Event.stopObserving(this.link,'mouseover');							
			}
		}).bind(context);
		Event.observe(a, 'mouseover', eventHander);
		a.appendChild(image);
		return a;
	}
}
	
/**** PUBLIC METHODS ****/
PhotoCollection.prototype.setNumberShownPhotos = function (pref_){
	this._photosNum = parseInt(pref_,10);
	if (isNaN(this._photosNum)){
		this._photosNum = 5;
	}
	if (this._photosNum <= 0){
		this._photosNum = 1;
	}	
}

// Create the data structures
PhotoCollection.prototype.setPhotos = function (imgs_){
	this._previousimgs = [];
	this._currentimgs = [];
	this._nextimgs = [];
	// Get the number of photos in the current list
	var last = (this._photosNum < imgs_.length) ? this._photosNum : imgs_.length;
	for (var i=0; i<last; i++){
		this._currentimgs[i] = this._createPhoto(imgs_[i]); 
	}
	// Adding the rest of the imgs_ in the nextimgs list
	for (i=last; i<imgs_.length; i++){
		this._nextimgs [this._nextimgs.length] = this._createPhoto(imgs_[i]);
	}
}

PhotoCollection.prototype.first = function (){
	// It has all the imgs
	this._previousimgs = this._previousimgs.concat(this._currentimgs.concat(this._nextimgs));
	var last = (this._photosNum < this._previousimgs.length) ? this._photosNum : this._previousimgs.length;
	this._currentimgs = [];
	this._nextimgs = [];
	for (var i=0; i<last; i++){
		this._currentimgs[i] = this._previousimgs[i]; // get the first img, inserting into currentimgs
	}
	// Adding the rest of the imgs in the nextimgs list
	for (i=last; i<this._previousimgs.length; i++){
		this._nextimgs [this._nextimgs.length] = this._previousimgs[i];
	}
	this._previousimgs = [];
	this._paint();
} 
	
PhotoCollection.prototype.previous = function (){			
	if (this._previousimgs.length === 0)
		return;
	// Moving the currentimgs into the nextimgs list
	this._currentimgs = this._currentimgs.concat(this._nextimgs);
	this._nextimgs = this._currentimgs;
	this._currentimgs = [];
	this._currentimgs = this._previousimgs.slice (this._previousimgs.length-this._photosNum, this._previousimgs.length);
	this._previousimgs = this._previousimgs.slice (0, this._previousimgs.length - this._photosNum);
	this._paint();
}

PhotoCollection.prototype.next = function (){			
	if (this._nextimgs.length === 0)
		return;
	this._previousimgs = this._previousimgs.concat(this._currentimgs);
	this._currentimgs = [];
	var last = (this._photosNum < this._previousimgs.length) ? this._photosNum : this._previousimgs.length;
	this._currentimgs = this._nextimgs.slice (0, last);
	this._nextimgs = this._nextimgs.slice (last, this._nextimgs.length);	
	this._paint();
}

PhotoCollection.prototype.last = function (){			
	this._previousimgs = this._previousimgs.concat(this._currentimgs.concat(this._nextimgs));
	this._nextimgs = [];
	this._currentimgs = [];
	var last = ((this._previousimgs.length % this._photosNum) === 0) ? this._photosNum : this._previousimgs.length % this._photosNum;
	this._currentimgs = this._previousimgs.slice(this._previousimgs.length-last, this._previousimgs.length);
	this._previousimgs = this._previousimgs.slice(0, this._previousimgs.length-last);
	this._paint();
}

PhotoCollection.prototype.show = function (){			
	this.first();
}

PhotoCollection.prototype.empty = function (){			
	for (var i=0; i<this._previousimgs.length; i++){
		delete this._previousimgs[i];
	}
	for (i=0; i<this._currentimgs.length; i++){
		delete this._currentimgs[i];
	}
	for (i=0; i<this._nextimgs.length; i++){
		delete this._nextimgs[i];
	}
	this._previousimgs = []; 
	this._currentimgs = [];  
	this._nextimgs = [];     
}