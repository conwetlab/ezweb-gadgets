// EzWeb context variables
var width = EzWebAPI.createRGadgetVariable("width", repaint);
var height = EzWebAPI.createRGadgetVariable("height", repaint);
var images = EzWebAPI.createRWGadgetVariable("images");
var cells = EzWebAPI.createRGadgetVariable("cells", setNCells);
var theme = EzWebAPI.createRGadgetVariable("theme", setTheme);
// EzWeb Events
var imagesSlot = EzWebAPI.createRGadgetVariable("imagesSlot", setGrid);
var url = EzWebAPI.createRWGadgetVariable("url");


// HANDLER FUNCTIONS
function setLock(value){
  return;
}

function setUser(value){
  return;
}

function setTheme(value){
  gallery.setTheme();
  return;
}

function repaint(value){
  gallery.repaint();
  return;
}

/*
 * Handler cells preference
 */

function setNCells(value){
  var nCells = (value > 0)?value:1;
  gallery.setGrid(nCells);
  gallery.repaint();
  return;
}
   
/*
 * Handler imagesSlot slot
 */
function setGrid(value){
  var nCells = (cells.get() > 0)?cells.get():1;
  gallery.setImages($.parseJSON(value));
  gallery.setGrid(nCells);
  gallery.repaint();
  return;
}

var GalleryImages =  function(){

  /*
   * Class Attributes
   */
  this.images = [];

  /*
   * Init function
   */
  this.init = function(){
    // Background Div
    var content = document.createElement("div");
    document.body.appendChild(content);
    content.id = "content-gadget";
    $(content).addClass("content-gadget");
    var height = $(content).attr("offsetHeight");

    // Image container & Slider Container
    var table = document.createElement("table");
    var tbody = document.createElement("tbody");
    table.appendChild(tbody);
    content.appendChild(table);
    
    var tr = tbody.insertRow(-1);
    $(tr).addClass("row-image");    
    $(tr).css("height", (height*0.75)+'px');
    var td = tr.insertCell(-1);
    $(td).attr("colspan",3);
    this.container_image = document.createElement("div");
    td.appendChild(this.container_image);

    this.image = document.createElement("img");
    this.image.id = "main-image";
    $(this.image).addClass("main-image");
    //this.image.style.display = "none";
    $(this.image).attr("src", "nogrid.png");
    $(this.image).css("height", (height*0.75)-20+'px');    
    this.container_image.appendChild(this.image);


    tr = tbody.insertRow(-1);
    $(tr).addClass("row-images");
    $(tr).css("height", (height*0.25)+'px');

    td = tr.insertCell(-1);
    $(td).addClass("left")
    var img = document.createElement("img");
    img.src = "left.png";
    $(img).attr("title", _("next"));    
    $(img).bind('click',function(){gallery.slideLeft();});
    td.appendChild(img);

    this.container_images = tr.insertCell(-1);
    $(this.container_images).addClass("center");
    this.container_images.appendChild(document.createTextNode(_("noimages")));
    
    td = tr.insertCell(-1);
    $(td).addClass("right");
    img = document.createElement("img");
    img.src = "right.png";
    $(img).attr("title", _("back"));
    $(img).bind('click',function(){gallery.slideRight();});
    td.appendChild(img);
    
    this.setTheme();
    this.restore_images();
  };
  
  /*
   * Set images array
   */
  this.setImages = function(images){
    this.images = images;
    this.save_images(images);
  }
  
  /*
   * Set grid images
   */
  this.setGrid = function(nCells){
    if ((this.container_images == undefined) || (this.container_images == null))
      return;
    //this.load();
    this.container_images.innerHTML = "";
    // Get Width Size & Height Size
    nCells = (nCells > this.images.length)?this.images.length:nCells;
    var height = $(".content-gadget").attr("offsetHeight");
    var width = this.container_images.offsetWidth;

    var table = document.createElement("table");
    var tbody = document.createElement("tbody");
    table.appendChild(tbody);

    this.container_images.appendChild(table);
    var tr = tbody.insertRow(-1);
    for(var i=0; (i < nCells); i++){
      var td = tr.insertCell(-1);
      $(td).addClass("cell-image");
      $(td).css("width", (width/nCells)+'px');      
      if(i < this.images.length){
        var img = document.createElement("img");
        $(img).addClass("image");
        $(img).attr("src", this.images[i]);
        $(img).css("height", (height*0.25)-10+'px');
        $(img).css("width", (width/nCells-20)+'px');
        td.appendChild(img);          
        $(img).bind('click', {"i":i}, function(event) {
          gallery.setImage(event.data.i);
          gallery.sendEvent(event.data.i);
        });
      }      
    }
    if(this.images.length > 0){
      $(this.image).attr("title",this.images[0]);
      $(this.image).css("height", (height*0.75)-20+'px');     
      $(this.image).attr("src",this.images[0]); 
      $(this.image).bind('click', function(event){
        gallery.sendEvent(0);      
      });
      $(this.image).show();
    }
    //$(".image").ready(function(){gallery.remove_load();})
  }
  
  /*
   * Slide Left images 
   */
  this.slideLeft = function(){ 
    if (this.images.length == 0) return;  
    var element = this.images[0];
    for (var i=0; i < this.images.length-1;i++) 
      this.images[i]=this.images[i+1];
    this.images[this.images.length-1]=element;
    $(".image").each(function(i){
            $(this).attr("src",gallery.images[i]);  
    });
  }

  /*
   * Slide Right images 
   */
  this.slideRight = function(){
    if (this.images.length == 0) return;
    var element = this.images[0];
    for(var i=1; i < this.images.length; i++){
      var element2 = this.images[i];
      this.images[i]=element;   
      var element = element2;
    }
    this.images[0] = element;
    $(".image").each(function(i){
            $(this).attr("src",gallery.images[i]);
    });
  }

  /*
   * Set main image and display effect
   */
  this.setImage = function(element){        
    var height = $(".content-gadget").attr("offsetHeight");
    var image = document.createElement("img");    
    this.container_image.appendChild(image);
    $(image).addClass("main-image");
    $(image).attr("title",this.images[element]);
    $(image).css("height", (height*0.75)-20+'px');     
    $(image).css("position", "absolute");
    $(image).css("top", $(this.image).attr("offsetTop") + 'px');    
    $(image).css("left", $(this.image).attr("offsetLeft") + 'px');
    $(image).css("z-index", $(this.image).css("z-index") - 1);    
    $(image).hide();
    $(image).attr("src",this.images[element]);   
    // Fade Transition
    $(image).show();    
    $(this.image).fadeOut('slow', function(){
        $(this).remove();
        $(".main-image").css("z-index",999);
    });
    //$(this.image).fadeIn('fast');
    this.image = image;
    $(this.image).bind('click', {"element":element}, function(event){
      gallery.sendEvent(event.data.element);      
    });
  }

  /*
   * Send Events
   */
  this.sendEvent = function(element){
    url.set(this.images[element]);
  }


  /*
   * Repaint Gadget
   */
  this.repaint = function(){
    if($("content-gadget")){
      var height = $(".content-gadget").attr("offsetHeight");
      $(".main-image").css("height", (height*0.75)-20+'px');
    }
    if((this.container_images == null) || (this.container_images == undefined)) return;
    if (this.images.length == 0) return;

    var nCells = (cells.get() > this.images.length)?this.images.length:cells.get();
    var width = this.container_images.offsetWidth;
    $(".row-image").css('height',(height*0.75)+'px');
    $(".row-images").css('height',(height*0.25)+'px');
    $(".image").css("height", (height*0.25)-10+'px');
    $(".image").css("width", (width/nCells-20)+'px');
    $(".cell-image").css("width", (width/nCells)+'px');

    width = $(".content-gadget").attr("offsetWidth");
    var widthImage = ($(".main-image").attr("offsetWidth") > width)?width-10+'px':"auto";
    $(".main-image").css("width", widthImage);
    $(".main-image").css("position", "static");
  } 

  /*
   * Loading GIF
   */
  this.load = function(){
    var background = document.createElement("div");
    background.id = "load-background";
    document.body.appendChild(background);
    
    var table = document.createElement("table");
    background.appendChild(table);
    var tbody = document.createElement("tbody");
    table.appendChild(tbody);
    var tr = tbody.insertRow(-1);
    var td = tr.insertCell(-1);
    
    var img = document.createElement("img");
    img.src = "ajax-loader.gif";
    td.appendChild(img);
    $(background).click(function(event){event.stopImmediatePropagation();});
  }

  this.remove_load = function(){
    $("#load-background").remove();
  }
  
  /*
   * Save the images in the state properties
   */
  this.save_images = function(elements){
    if (elements.length > 0)
      images.set($.toJSON(elements));
    return;
  }
  /*
   * Restore images saved in 
   */
  this.restore_images = function(){
    if ((images.get() != "") && ($.parseJSON(images.get()).length > 0)){
      this.images = $.parseJSON(images.get());
      // Get cells number, set grid images and repaint
      var nCells = (cells.get() > 0)?cells.get():1;
      gallery.setGrid(nCells);
      gallery.repaint();
    }
  }
  
  /*
   * Set a theme White or Black
   */  
  this.setTheme = function(){
    $("#theme").attr("href",theme.get()+".css");
    $(".left").children().attr("src", theme.get()+"-left.png");
    $(".right").children().attr("src", theme.get()+"-right.png");    
  }  
};

/*
 * Object Gallery Images
 */          
var gallery = new GalleryImages();


