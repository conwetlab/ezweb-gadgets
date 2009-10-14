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
	alert("en init");
	//if(!urlSlot.get()) return;
	//setNewImage(urlSlot.get());
	//document.getElementById('content').style.height = (document.getElementById('content').parentNode.offsetHeight - document.getElementById('header').offsetHeight - document.getElementById('default_footer').offsetHeight) + 'px';
	//document.getElementById('image_container').style.height = document.getElementById('content').offsetHeight + 'px';
}
			
function setNewImage(value)
{
	if (!firstTime) {
		if (value != "" && value != undefined && value != null) {
			document.getElementById('image').src = value;
		//document.getElementById('label').innerHTML = value;
		//setSize(DEFAULT_ZOOM);
		
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
	//document.getElementById('image').src = "http://tugues.primera-clase.com/wp-content/uploads/2007/02/balon-de-la-copa-america.jpg";
	//alert(document.getElementById('image').src);
	
	var value_t = value - 5;
	var content = document.getElementById('content');
	var image = document.getElementById('image');
	
	var r_image = image.offsetWidth/image.offsetHeight;
	var r_gadget = content.offsetWidth/content.offsetHeight;
	
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
/*
  var dragging = false;
  var x = 0;
  var y = 0;

  document.addEventListener("mousedown",startDragScroll,false);
  
  document.addEventListener("mouseup",stopDragScroll,false);

  document.addEventListener("mousemove",dragScroll,false);

  function startDragScroll(e){
    if (e.button == 0) {
      dragging=true;
      x=e.clientX;
      y=e.clientY;
    }
  }

  function stopDragScroll(e){ 
    dragging=false;
  }

  function dragScroll(e) {
    if (dragging) {
      document.getElementById("image_container").scrollTop += y-e.clientY;
      document.getElementById("image_container").scrollLeft += x-e.clientX;
    }
  }*/