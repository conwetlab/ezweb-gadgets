var MAX_ZOOM = 200;
var MIN_ZOOM = 5;
var DEFAULT_ZOOM = 100;
var INC = 5;

var actualZoom = DEFAULT_ZOOM;

var urlSlot = EzWebAPI.createRGadgetVariable("imageUrl", setNewImage);
var firstTime = true;
var height = EzWebAPI.createRGadgetVariable("height", function() {
	setSize(actualZoom);
});
var urlEvent = EzWebAPI.createRWGadgetVariable('sentUrl');

function init ()
{

}
			
function setNewImage(value)
{
	if (!firstTime) {
		if (value != "" && value != undefined && value != null) {
			document.getElementById('image').src = value;
		}
		else {
			document.getElementById('image').src = urlSlot.get();
		}
	} else {
		firstTime = false;
	}
}

function setSize(value)
{	
	var value_t = value - 5;
	var content = document.getElementById('content');
	var image = document.getElementById('image');
	
	var r_image = trunc(image.offsetWidth/image.offsetHeight,2);
	var r_gadget = trunc(content.offsetWidth/content.offsetHeight,2);
	
	if (r_image >= r_gadget) {
		image.style.width = value_t + '%';
		image.style.height = 'auto';
	} else {
		image.style.height = value_t + '%';
		image.style.width = 'auto';
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

function nextImage()
{
	if (actualImage < (selectedImages.length-1))
	{
		setSelectedImage(++actualImage);
	}
}

function sentURL()
{
	urlEvent.set (urlSlot.get());
}

// Trunca el número 'num' a 'ndec' decimales.
function trunc(num, ndec) {
  var fact = Math.pow(10, ndec); // 10 elevado a ndec

  /* Se desplaza el punto decimal ndec posiciones,
    se trunca el número y se vuelve a colocar
    el punto decimal en su sitio. */
  return parseInt(num * fact) / fact;
} 