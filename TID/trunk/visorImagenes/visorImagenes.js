var MAX_ZOOM = 200;
var MIN_ZOOM = 5;
var DEFAULT_ZOOM = 100;
var INC = 5;

var actualZoom = DEFAULT_ZOOM;

var urlSlot = EzWebAPI.createRGadgetVariable("imageUrl", setNewImage);
var thumbnailUrlSlot = EzWebAPI.createRGadgetVariable("imageThumbnailUrl", function (){});

var height = EzWebAPI.createRGadgetVariable("height", function() {
	setSize(actualZoom);
});
var urlEvent = EzWebAPI.createRWGadgetVariable('sentUrl');
var thumbnailUrlEvent = EzWebAPI.createRWGadgetVariable('sentThumbnailUrl');


function init ()
{
}
			
function setNewImage(value)
{
	if (value != "" && value != undefined && value != null) {
		document.getElementById('picture').src = value;
		document.getElementById('picture').style.display = "inline";
	}
	else {
		document.getElementById('picture').src = urlSlot.get();
		document.getElementById('picture').style.display = "inline";
	}
}

function setSize(value)
{	
	var value_t = value;
	var content = document.getElementById('content');
	var header = document.getElementById('header');
	var image = document.getElementById('picture');
	var r_image = trunc(image.offsetWidth/image.offsetHeight,2);
	var r_gadget = trunc(content.offsetWidth/content.offsetHeight,2);

	content.style.height = (document.body.offsetHeight-31) + "px";
	content.style.width = document.body.offsetWidth + "px";
	
	if(ie)
		header.style.width = document.body.offsetWidth + "px";

	
	if (r_image >= r_gadget) {
		image.style.width = value_t + '%';
		image.style.height = 'auto';
	} else {
		image.style.height = value_t + '%';
		image.style.width = 'auto';
	}
	
	content.style.overflow = "auto";
	if ((image.offsetHeight <= content.offsetHeight) && 
			(image.offsetWidth <= content.offsetWidth)){
		content.style.overflow = "hidden";
	}	
}

function expandZoom()
{
	setSize((((actualZoom + INC) < MAX_ZOOM)?(actualZoom+=INC):(actualZoom=MAX_ZOOM)));
}

function reduceZoom()
{
	setSize((((actualZoom - INC) > MIN_ZOOM)?(actualZoom-=INC):(actualZoom=MIN_ZOOM)));
}

function defaultZoom()
{
	setSize(actualZoom = DEFAULT_ZOOM);
}


function sentURL()
{
	urlEvent.set (urlSlot.get());
	thumbnailUrlEvent.set(thumbnailUrlSlot.get());
}

// Trunca el número 'num' a 'ndec' decimales.
function trunc(num, ndec) {
  var fact = Math.pow(10, ndec); // 10 elevado a ndec

  /* Se desplaza el punto decimal ndec posiciones,
    se trunca el número y se vuelve a colocar
    el punto decimal en su sitio. */
  return parseInt(num * fact) / fact;
} 
