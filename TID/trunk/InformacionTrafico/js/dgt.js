///////////////////////////////////////////
//////////// Class InformacionTrafico /////
///////////////////////////////////////////

var InformacionTrafico = function(){
    /* Call to the parent constructor */
  
    EzWebGadget.call(this,{translatable:false});
}


/* Extend from EzWebGadget */
InformacionTrafico.prototype = new EzWebGadget();
InformacionTrafico.prototype.resourcesURL = "http://demo.ezweb.morfeo-project.org/repository/InformacionTrafico/";

InformacionTrafico.prototype.init = function(){

// Alternatives

    this.PRINCIPAL_VIEW = 0;
    this.CREATE_VIEW = 1;
    this.ADD_VIEW = 2;
    this.EDIT_VIEW = 3;

//Initialize EzWeb variables
    this.time = EzWebAPI.createRGadgetVariable("time", this.setInterval);
    this.route = EzWebAPI.createRWGadgetVariable("route");
    this.urlImage = EzWebAPI.createRWGadgetVariable("URLImage");
    this.nameImage = EzWebAPI.createRWGadgetVariable("nameImage");
    this.nameRoute = EzWebAPI.createRWGadgetVariable("nameRoute");
    if (this.route.get() == ""){
	this.listRoutes = {};
	this.listRoutes.trayectos = {};
	this.listRoutes.numElem = 0;
	this.listRoutes.addRoute = function(k,v){
	    this.trayectos[k]=v;
	    this.numElem += 1;
	}
	this.listRoutes.delRoute = function(k){
	    delete(this.trayectos[k]);
	    this.numElem -= 1;
	}
	this.listRoutes.esVacia = function(){
	    return this.numElem == 0;
	}
	this.listRoutes.getFirst = function(){
	    var encontrado = false;
	    var r;
	    for (var i in this.trayectos){
		if (!encontrado){
		    r = i;
		    encontrado = true;
		}
	    }
	    return r;
	}
	
    }
    else{
	this.listRoutes = eval("("+this.route.get()+")");
	this.listRoutes.addRoute = function(k,v){
	    this.trayectos[k]=v;
	    this.numElem += 1;
	}
	this.listRoutes.delRoute = function(k){
	    delete(this.trayectos[k]);
	    this.numElem -= 1;
	}
	this.listRoutes.esVacia = function(){
	    return this.numElem == 0;
	}
	this.listRoutes.getFirst = function(){
	    var encontrado = false;
	    var r;
	    for (var i in this.trayectos){
		if (!encontrado){
		    r = i;
		    encontrado = true;
		}
	    }
	    return r;
	}
    }

//Initialize global variables

    this.alternatives = null;
    this.camaras = [];
    this.play = "stop";
    this.contador_trayectos = 0;
    
// Call methods
   
    this._createUserInterface();
    
}

//******************** USER INTERFACE METHODS **************************

InformacionTrafico.prototype._createUserInterface = function(){
    this.form_in_config ={};
    var body = document.getElementsByTagName ("body")[0];
    this.alternatives = new StyledElements.StyledAlternatives ({id: 'alternatives1',defaultEffect: "None"});
   
    var mainAlternative = this.alternatives.createAlternative();
   //  ALTERNATIVES
    var routeAlternative = this.alternatives.createAlternative();
    var roadsAlternative = this.alternatives.createAlternative();
    var configureAlternative = this.alternatives.createAlternative();
   
    /* Contenedor de las cámaras en la ventana de edición */
    this.camsContent = document.createElement("div");
    EzWebExt.addClassName(this.camsContent,"content");
    configureAlternative.appendChild(this.camsContent);
    
    /* Contenedor del selector de cámaras en la ventana de selección*/
    this.roadsContent = document.createElement("div");
    EzWebExt.addClassName(this.roadsContent,"content");
    roadsAlternative.appendChild(this.roadsContent);
  
    /* Contenedor de la ventana de creación de trayectos*/
    this.addContent = document.createElement("div");
    EzWebExt.addClassName(this.addContent,"content");
    routeAlternative.appendChild(this.addContent);

    var mainContent =  document.createElement("div");
    this.divSelects = document.createElement("div");
    EzWebExt.addClassName(this.divSelects, "selectRoad");
    this.divSelects.appendChild(this._createHeaderButton("images/back.png", "Volver a edición de cámaras", EzWebExt.bind(function() { 
	this.createAlternativeConfig();
	this.showAlternative(this.EDIT_VIEW);
    }, this)));
    this.divCams = document.createElement("div");
    this.getRoads();
  
   
 
    // MAIN ALTERNATIVE

    this.content_img = document.createElement("img");
    this.content_img.id = "content_img";
    var menu_options = document.createElement("div");
    menu_options.id = "menu_options";
    var menu_route = document.createElement("div");
    menu_route.id = "menu_route";
    
    //MENÚ OPCIONES
    
    var content_button_options = document.createElement("div");
    content_button_options.style.width = '100px';
    content_button_options.style.margin = "0 auto";
    var src;
    content_button_options.appendChild(this._createHeaderButton("images/anterior.png", "Anterior", EzWebExt.bind(function() { 
	if(!this.listRoutes.esVacia()){
	    this.content_img.setAttribute("src",this.getPrevCam(this.content_img._srcOld));
	}
	
    }, this)));
    
    this.divPlay = this._createHeaderButton("images/play.png", "Play", EzWebExt.bind(function() {
	this.getPlay();
    }, this));
    
    content_button_options.appendChild(this.divPlay);
    content_button_options.appendChild(this._createHeaderButton("images/siguiente.png", "Siguiente", EzWebExt.bind(function() { 
	if(!this.listRoutes.esVacia()){
	    this.content_img.setAttribute("src",this.getNextCam(this.content_img._srcOld));
	}
	
    }, this)));

	var div = document.createElement("div");
    	div.style.cursor="pointer";
    	EzWebExt.addClassName(div, "imageEnviar");
    	div.style.background = 'url(' + this.getResourceURL("images/avion.png") + ')';
    	div.addEventListener("click", EzWebExt.bind(function(){
	var srcCam = this.content_img._srcOld;
	var titleCam =this.getTitle(srcCam);
	this.urlImage.set(srcCam);
	this.nameImage.set(titleCam);
	this.nameRoute.set(this.actualRoute);

	},this), false);
    	div.setAttribute("title","Enviar eventos");
    	content_button_options.appendChild(div);
	menu_options.appendChild(content_button_options);
    
    //MENÚ SELECCIÓN DEL TRAYECTO
    
    var content_button_route = document.createElement("div");
    content_button_route.style.width = '100px';
    content_button_route.style.margin = "0 auto 0 20px";
    
    content_button_route.appendChild(this._createHeaderButton("images/add.png", "Añadir Trayecto", EzWebExt.bind(function() { 
	this.createAlternativeRoute();
	this.showAlternative(this.CREATE_VIEW);
	
    }, this)));

    content_button_route.appendChild(this._createHeaderButton("images/configure.png", "Modificar Trayecto", EzWebExt.bind(function() { 
	this.actualRoute = this.form_in_config["route"].getValue();

	if(!this.listRoutes.esVacia()){
	    this.createAlternativeConfig();
	    this.showAlternative(this.EDIT_VIEW);
	}
    }, this)));
    this.select = document.createElement("div");
    EzWebExt.addClassName(this.select,"select");
    var routes = this.getRoutes();
    menu_route.appendChild(content_button_route);
    this._createSelectRoute(routes,this.select);
    this.actualRoute = this.form_in_config["route"].getValue();
    menu_route.appendChild(this.select);
    
    /* Añadimos los div al contenedor principal */   
    mainContent.appendChild(this.content_img);
    mainContent.appendChild(menu_route);
    mainContent.appendChild(menu_options);
    mainAlternative.appendChild(mainContent);
    this.getFirstCam();
    this.resetPeriod();
    this.alternatives.insertInto(body);
  
    
}



// Creación del alternative de configuración
InformacionTrafico.prototype.createAlternativeConfig = function(){
    this.camsContent.innerHTML = "";
    this.div = document.createElement("div");

    this.div.appendChild(this._createHeaderButton("images/back.png", "Volver a vista principal", EzWebExt.bind(function() { 
	this.getFirstCam();
    }, this)));
    this.div.appendChild(this._createHeaderButton("images/add.png", "Añadir nueva cámara", EzWebExt.bind(function() { 
	this.createAlternativeSelectCam();
	this.showAlternative(this.ADD_VIEW);
    }, this))); 
    this.div.appendChild(this._createHeaderButton("images/delete.png", "Borrar trayecto", EzWebExt.bind(function() { 
	this.deleteRoute();	
	this.getFirstCam();
    }, this)));
 
    if(this.listRoutes.trayectos[this.actualRoute].length==0){
	var src = "images/backdes.png";
	this.div.childNodes[0].style.background = 'url(' + this.getResourceURL(src) + ')';
    }
    var divTitle = document.createElement("span");
    divTitle.appendChild(document.createTextNode("Editar cámaras del trayecto"));
    EzWebExt.addClassName(divTitle,"tituloModificar");
    this.div.appendChild(divTitle);
    this.camsContent.appendChild(this.div);
    var listNames = this.getNamesCamsRoute();
    var listPhotos = this.getCamsRoute();
    this._createSelectCamsRoute(listPhotos,listNames);
    this.camsContent.appendChild(this._createSelectCamsRoute(listPhotos,listNames)); 

}

// Creación del alternative de crear trayecto

InformacionTrafico.prototype.createAlternativeRoute = function(){
    this.addContent.innerHTML = "";
    var table = document.createElement("table");
    EzWebExt.addClassName(table,"center");

    var trTitulo = document.createElement("tr");
    var tdTitulo = document.createElement("td");
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    var divtitle = document.createElement("div");
    divtitle.appendChild(document.createTextNode("Crear trayecto nuevo"));
    EzWebExt.addClassName(divtitle,"tituloCrear");
    tdTitulo.appendChild(divtitle);
    trTitulo.appendChild(tdTitulo);
    table.appendChild(trTitulo);
    
    var div = document.createElement("div");
    div.innerHTML = '<label id="trayecto">Trayecto</label>';
    var inputName = document.createElement("input");
    inputName.type = "text";
    inputName.value = "Nombre";
    inputName.size = "10";
    var self = this;
    var context = {self: this, inputName: inputName};
    div.appendChild(inputName);
    td.appendChild(div);
 
    // Elimino el anterior div
    div = document.createElement("div"); 
    div.style.marginTop = "20px"; 
    var spanAccept = document.createElement("span");
    EzWebExt.addClassName(spanAccept,"boton");

    // Botones aceptar y cancelar //
    spanAccept.appendChild(document.createTextNode("Aceptar"));
    spanAccept.style.backgroundImage = 'url(' + this.getResourceURL("images/accept.png") + ')';
    spanAccept.addEventListener("click",EzWebExt.bind(function(){
	self.addRoute(this.inputName);
	self.createAlternativeSelectCam();
	self.showAlternative(self.ADD_VIEW);
    },context), false);
    div.appendChild(spanAccept);
    var spanCancel = document.createElement("span");
    EzWebExt.addClassName(spanCancel,"boton");
    spanCancel.appendChild(document.createTextNode("Cancelar"));
    spanCancel.style.backgroundImage = 'url(' + this.getResourceURL("images/cancel.png") + ')';
    spanCancel.addEventListener("click",EzWebExt.bind(function(){
	this.showAlternative(this.PRINCIPAL_VIEW);
    },this), false);
    div.appendChild(spanCancel);
    td.appendChild(div);
    tr.appendChild(td);
    table.appendChild(tr);
    this.addContent.appendChild(table);


}

InformacionTrafico.prototype.createAlternativeSelectCam = function(){
    this.roadsContent.innerHTML= "";
    var titulo = document.createElement("div");
    EzWebExt.addClassName(titulo,"tituloAlternative");
    titulo.appendChild(document.createTextNode("Seleccionar cámaras del trayecto"));
    this.roadsContent.appendChild(titulo);
    this.roadsContent.appendChild(this.divSelects);
    this.roadsContent.appendChild(this.divCams);
   
  

}

// Obtención de nombres de cámaras del trayecto

InformacionTrafico.prototype.getNamesCamsRoute = function(){
    var list = [];
    for (var i = 0; i< this.listRoutes.trayectos[this.actualRoute].length;i++){
	list[list.length] = this.listRoutes.trayectos[this.actualRoute][i][0][0];
    }
    return list;
}
// Obtención de las url de cámaras del trayecto

InformacionTrafico.prototype.getCamsRoute = function(){
    var list = [];
    for (var i = 0; i< this.listRoutes.trayectos[this.actualRoute].length;i++){
	list[list.length] = this.listRoutes.trayectos[this.actualRoute][i][0][1];
    }
    return list;
    
}

// Devuelve el primero de la lista

InformacionTrafico.prototype.getFirstCam = function(){
    var src;
    if (this.listRoutes.esVacia()){
	this.createAlternativeRoute();
	this.showAlternative(this.CREATE_VIEW);
	
    }
    else if (this.listRoutes.trayectos[this.actualRoute].length==0)
    {
	this.createAlternativeConfig();
	src = "images/backdes.png";
	this.div.childNodes[1].style.background = 'url(' + this.getResourceURL(src) + ')';
	this.showAlternative(this.EDIT_VIEW);
    }
    
    else{
	src = this.listRoutes.trayectos[this.actualRoute][0][0][1];
	var title =this.listRoutes.trayectos[this.actualRoute][0][0][0];
	this.content_img.setAttribute("title",this.listRoutes.trayectos[this.actualRoute][0][0][0]);
	
	this.content_img.setAttribute("src",src);
	this.content_img._srcOld = src;
	this.showAlternative(this.PRINCIPAL_VIEW);
    }
    
}


//Función Play

InformacionTrafico.prototype.getPlay = function(){
    if (!(this.listRoutes.esVacia()) && (this.listRoutes.trayectos[this.actualRoute].length != 0)){
	
	if(this.play =="stop"){
	    this.divPlay.style.background = 'url(' + this.getResourceURL("images/pause.png") + ')';
	    this.resetInterval();
	    this.play = "play";
	}
	else{
	    this.divPlay.style.background = 'url(' + this.getResourceURL("images/play.png") + ')';
	    try 
	    {
		clearInterval(this.interval);
	    }
	    catch(e) {}
	    this.play = "stop";
	}
    }
    
    
}

InformacionTrafico.prototype.setInterval = function(){
    if (this.play == "play"){
	this.getPlay();
	this.getPlay();
    }

}

// Devuelve la cámara siguiente

InformacionTrafico.prototype.getNextCam = function(src){
    var cam;
    var encontrado = false;
    var i = 0;
    var finalList = false;
    var s = new Date().getMinutes().toString();
    if(this.listRoutes.esVacia()){
	return src;
    }
    else{
	while((!encontrado) &&(i<this.listRoutes.trayectos[this.actualRoute].length)){
	    if (this.listRoutes.trayectos[this.actualRoute][i][0][1] == src){
		encontrado = true;
		if (i == this.listRoutes.trayectos[this.actualRoute].length -1){
		    src = this.listRoutes.trayectos[this.actualRoute][0][0][1];
		    finalList = true;
		}
	    }
	    i++;
	}
	if(encontrado && !finalList){
	    src = this.listRoutes.trayectos[this.actualRoute][i][0][1];
	    this.content_img.setAttribute("title",this.listRoutes.trayectos[this.actualRoute][i][0][0]);
	}
	this.content_img._srcOld = src;
	src = src+"?random="+s;
	return src;
    }
    
    
}

InformacionTrafico.prototype.getTitle = function(src){

	var encontrado = false;
	var titlecam="";
	var i = 0;
	while(!encontrado && i<this.listRoutes.trayectos[this.actualRoute].length){
	    if (this.listRoutes.trayectos[this.actualRoute][i][0][1] == src){
		encontrado = true;
		titlecam = this.listRoutes.trayectos[this.actualRoute][i][0][0];
		
	    }
	    i++;
	}
	return titlecam;
}
 

// Devuelve la cámara anterior

InformacionTrafico.prototype.getPrevCam = function(src){
    var cam;
    var encontrado = false;
    var i = 0;
    var finalList = false;
    var s = new Date().getMinutes().toString();
    if(this.listRoutes.esVacia()){
	return src;
    }
    else{
	while(!encontrado && i<this.listRoutes.trayectos[this.actualRoute].length){
	    if (this.listRoutes.trayectos[this.actualRoute][i][0][1] == src){
		encontrado = true;
		if (i == 0){
		    src = this.listRoutes.trayectos[this.actualRoute][this.listRoutes.trayectos[this.actualRoute].length-1][0][1];
		    finalList = true;
		}
	    }
	    i++;
	}
	if(encontrado && !finalList){
	    src = this.listRoutes.trayectos[this.actualRoute][i-2][0][1];
	    this.content_img.setAttribute("title",this.listRoutes.trayectos[this.actualRoute][i-2][0][0]);
	}
	
	this.content_img._srcOld = src;    
	src = src+"?random"+s;
	return src;
    }
}

// Reproducción del Play
InformacionTrafico.prototype.resetInterval= function() {
    
    if (this.interval != null) 
    {
	try 
	{
	    clearInterval(this.interval);
	}
	catch(e) {}
    }
    var self = this;
    this.interval = setInterval(function(){
	self.content_img.setAttribute("src",self.getNextCam(self.content_img._srcOld));
	self.resetPeriod();
    }, this.time.get()*1000);
}

InformacionTrafico.prototype.resetPeriod = function(){
    if(this.period != null){
	try{
	    clearInterval(this.period);
	}
	catch(e){
	    
	}
    }
    var self = this;
    this.period = setInterval(function(){
	self.refresh()},this.time.get()*1000);
}

InformacionTrafico.prototype.refresh = function(){
    var src = this.content_img._srcOld;
    var s = new Date().getMinutes().toString();
    this.content_img.setAttribute("src",src+"?random"+s);
}

// Eliminación de un trayecto

InformacionTrafico.prototype.deleteRoute = function(){
    for(var i in this.listRoutes.trayectos){
	if (i == this.actualRoute){

	    for (var j = 0; j <this.listRoutes.trayectos[i].length; j++){
		for(var k = 0;k<this.camaras.length;k++){
		    if(this.listRoutes.trayectos[i][j][0][0]==this.camaras[k][0][0]){
			this.camaras.splice(i,1);
		    }
		}
	    }
	    this.listRoutes.delRoute(i);
	    this.route.set(this.toJSON(this.listRoutes));
	    if(this.listRoutes.esVacia()){
		this.createAlternativeRoute();
		this.showAlternative(this.CREATE_VIEW);
	    }
	    else{
		this.actualRoute = this.listRoutes.getFirst();
	    }
	}
    }
    //TODO: ELIMINAR LAS CÁMARAS DEL TRAYECTO DE LA LISTA DE CÁMARAS
    this.repaintRoute();
}

// Función que elimina una cámara 

InformacionTrafico.prototype.delCam = function(div){
    
    var src = div.childNodes[1].src;
    var encontrado = false;
    var i = 0;
    while(!encontrado && i<this.listRoutes.trayectos[this.actualRoute].length){

	if(this.listRoutes.trayectos[this.actualRoute][i][0][1] == src){
	    encontrado = true;
	    this.listRoutes.trayectos[this.actualRoute].splice(i,1);
	    this.route.set(this.toJSON(this.listRoutes));
	}
	i++;
	
    }
    this.createAlternativeConfig();
    
}
// Función que crea un nuevo trayecto

InformacionTrafico.prototype.addRoute = function (spanText){
    
    var encontrado = false;
    for (var i in this.listRoutes){

	if (spanText.value == i){

	    encontrado = encontrado || true;
	}
    }
    if (!encontrado){
	this.listRoutes.addRoute(spanText.value,[]);
	this.route.set(this.toJSON(this.listRoutes));
	this.repaintRoute();
	this.actualRoute = spanText.value;
    }
    else{
	this.alert("El nombre del trayecto ya existe");
    }
    
}

// Recarga el select de los trayectos

InformacionTrafico.prototype.repaintRoute = function(){
    var routes = this.getRoutes();
    this._createSelectRoute(routes,this.select);
}

// Creación del select de los trayectos

InformacionTrafico.prototype._createSelectRoute = function(list,select){
  if (this.form_in_config["route"] === undefined) {
      var in_route_text = new StyledElements.StyledSelect({initialEntries:list,initialValue:list[0]});
      this.form_in_config["route"] = in_route_text;
      in_route_text.addEventListener("change", EzWebExt.bind(function(select){
	  this.actualRoute = this.form_in_config["route"].getValue();
	  this.getFirstCam();
      },this));
     
      in_route_text.wrapperElement.style.margin="3px auto";
      in_route_text.insertInto(select);
    } else {
        var in_route_text = this.form_in_config["route"];
        in_route_text.clear();
        in_route_text.addEntries(list);
    }
   
}

// Creación del select de las carreteras

InformacionTrafico.prototype._createSelectRoad = function(list){
    if(this.form_in_config["road"]===undefined){
	var in_road_text = new StyledElements.StyledSelect({initialEntries: list,initialValue:list[0]})
	this.form_in_config["road"] = in_road_text;
	in_road_text.addEventListener("change",
				      EzWebExt.bind(function(select){
					  this.getStretch();
				      },this));
	in_road_text.wrapperElement.style.margin="3px auto";
    }
    else{
	var in_road_text = this.form_in_config["stretch"];
        in_road_text.clear();
        in_road_text.addEntries(list);
	
    }
    in_road_text.insertInto(this.divSelects);
    this.getStretch();
   
}

//Creación del select de los tramos

InformacionTrafico.prototype._createSelectStretch = function(list,div){
    if (this.form_in_config["stretch"] === undefined) {
        var in_stretch_text = new StyledElements.StyledSelect({initialEntries:list,initialValue:list[0]});
	this.form_in_config["stretch"] = in_stretch_text;
	in_stretch_text.addEventListener("change",
					 EzWebExt.bind(function(select){
					     this.getCameras();
					 },this));

	in_stretch_text.wrapperElement.style.margin="3px auto";
	in_stretch_text.insertInto(div);
    } else {
        var in_stretch_text = this.form_in_config["stretch"];
        in_stretch_text.clear();
        in_stretch_text.addEntries(list);
	in_stretch_text.insertInto(div);
    }
    this.getCameras();
}

//Visualización de las cámaras de la carretera seleccionada

InformacionTrafico.prototype._createSelectListCam = function(listPhotos,listNames){
   
    var subcontentg_cam = document.createElement("div");
    EzWebExt.addClassName(subcontentg_cam,"subcontent_cam");
    var camList = [];
   
    for(var i = 0; i<listPhotos.length;i++){
	var img_cam = document.createElement("div");
	var img = document.createElement("img");
	var text = document.createElement("div");
	img_cam.appendChild(img);
	img_cam.appendChild(text);
	camList[i] = img_cam;
	img_cam.id = i.toString();

	EzWebExt.addClassName(img_cam,"camara");
	EzWebExt.addClassName(text,"despripcion");
	img.setAttribute("src",listPhotos[i][0]);
	var self = this;
	var context = {self: this, img_cam: img_cam};
	img_cam.addEventListener("click", EzWebExt.bind(function(){ self.selectCam(this.img_cam);},context), false);
	var text_foto = document.createTextNode(listNames[i][0]);
	text.appendChild(text_foto);

	subcontentg_cam.appendChild(img_cam);
	
    } 
    return subcontentg_cam;
}

// Visualización de las cámaras del trayecto

InformacionTrafico.prototype._createSelectCamsRoute = function(listPhotos,listNames){
    var subcontent_cam = document.createElement("div");
    EzWebExt.addClassName(subcontent_cam,"subcontent_camedit");
    var camList = [];
   
    for(var i = 0; i<listPhotos.length;i++){
	var img_cam = document.createElement("div");
	var delButton = document.createElement("div");
	var img = document.createElement("img");
	var text = document.createElement("div");
	img_cam.appendChild(delButton);
	img_cam.appendChild(img);
	img_cam.appendChild(text);
	var src = "images/cancel.png"
	var self= this;
	var context = {self:this,img_cam:img_cam};
	delButton.style.background = 'url(' + this.getResourceURL(src) + ')';
	delButton.style.backgroundRepeat = "no-repeat";
	delButton.addEventListener("click",EzWebExt.bind(function(){self.delCam(this.img_cam);},context),false);

	EzWebExt.addClassName(img_cam,"camara");
	EzWebExt.addClassName(delButton,"botonCancel");
	EzWebExt.addClassName(delButton,"cancelar");
	EzWebExt.addClassName(text,"descripcion");
	delButton.setAttribute("title","Eliminar imagen");
	
	img.setAttribute("src",listPhotos[i]);

	var text_foto = document.createTextNode(listNames[i]);
	text.appendChild(text_foto);
	subcontent_cam.appendChild(img_cam);
	
    } 
    return subcontent_cam;
}


// Función que crea un botón

InformacionTrafico.prototype._createHeaderButton = function(src, title, handler) {
    var div = document.createElement("div");
    div.style.cursor="pointer";
    EzWebExt.addClassName(div, "image");
    div.style.background = 'url(' + this.getResourceURL(src) + ')';
    div.addEventListener("click", handler, false);
    div.setAttribute("title",title);
    
    return div;
}

// Función que devuelve la lista de nombres de trayectos
InformacionTrafico.prototype.getRoutes = function(){
    var list = [];
    for (var i in this.listRoutes.trayectos){
	list[list.length] = [i];
    }
    return list;
}


// Muestra el alternative
InformacionTrafico.prototype.showAlternative = function(alternative) {
	this.alternatives.showAlternative(alternative);
    
}

// Métodos SendGet

InformacionTrafico.prototype.getRoads = function(){
    this.sendGet("http://www.dgt.es/portal/informacion_carreteras/camaras_trafico/",this.onSuccessGetRoads,this.onError,this.onException);

}
InformacionTrafico.prototype.getStretch = function(){
    this.sendGet("http://www.dgt.es/portal/informacion_carreteras/camaras_trafico.do?carretera="+this.form_in_config["road"].getValue(),this.onSuccessGetStretch,this.onError,this.onException);
}

InformacionTrafico.prototype.getCameras = function(){
    this.sendGet("http://www.dgt.es"+this.form_in_config["stretch"].getValue(),this.onSuccessGetCameras,this.onError,this.onException);
}


// Métodos onSucess
InformacionTrafico.prototype.onSuccessGetRoads = function(transport){
   
    var html_response = document.createElement("div");
    html_response.innerHTML = transport.responseText;
    var roadList = html_response.getElementsByClassName('buscIntCamposEvTipoSelect width18em');
    var roads = [[]];
  

    for (var i = 0; i<roadList[0].options.length;i++){
	roads[i] = [roadList[0].options[i].value,roadList[0].options[i].value];
    }

    this._createSelectRoad(roads);
      
}

InformacionTrafico.prototype.onSuccessGetStretch = function(transport){
    
    var html_response = document.createElement("div");
    html_response.innerHTML = transport.responseText;
    var stretchList = html_response.getElementsByClassName('camCuadroTexto');
    var stretchs = [[]];
    
    for (var i = 0; i<stretchList.length;i++){
	stretchs[i] = [stretchList[i].parentNode.childNodes[3].pathname,stretchList[i].childNodes[0].nodeValue]
    }
 
    this._createSelectStretch(stretchs,this.divSelects);
}


InformacionTrafico.prototype.onSuccessGetCameras = function(transport){
    
    var html_response = document.createElement("div");
    html_response.innerHTML = transport.responseText;
    var camNameList = html_response.getElementsByClassName("camaraTextoPie");
    var camList = html_response.getElementsByClassName("camaraImagen");
    var camerasName = [[]];
    var camerasPhoto = [[]]

    for(var i = 0; i < camNameList.length; i++){
	camerasName[i] = [camNameList[i].textContent,camNameList[i].textContent];
    }
    for(var i = 0; i <camList.length;i++){
	camerasPhoto[i]= ["http://www.dgt.es"+camList[i].attributes[1].nodeValue,"http://www.dgt.es"+camList[i].attributes[1].nodeValue];
    }

    this.divCams.innerHTML="";
    this.divCams.appendChild(this._createSelectListCam(camerasPhoto,camerasName));
    
}


// Método de selección de las cámaras

InformacionTrafico.prototype.selectCam = function(divImg){

    var encontrado = false;
    var i = 0;
    var carretera = this.form_in_config["road"].getValue();
    var tramo = this.form_in_config["stretch"].textDiv.firstChild.data;
    if (this.camaras.length == 0){
	divImg.style.background= "SteelBlue";
	this.camaras[this.camaras.length]=[[divImg.childNodes[1].firstChild.data,
					    divImg.childNodes[0].src]];
	this.listRoutes.trayectos[this.actualRoute][0]=[[divImg.childNodes[1].firstChild.data,
					    divImg.childNodes[0].src]];
	
    }
    else{
	var j = 0;
	var contiene =false;
	while(!contiene && j<this.camaras.length){
	    if(this.camaras[j][0][0] == divImg.childNodes[1].firstChild.data){
		contiene = true;
		divImg.style.background="transparent";
		this.camaras.splice(j,1);
	    }
	    j++;
	}
	if(this.listRoutes.trayectos[this.actualRoute]==[]){
	    this.listRoutes.trayectos[this.actualRoute][0]=[[divImg.childNodes[1].firstChild.data,
						divImg.childNodes[0].src]];
	}
	else{
	    var i = 0;
	    var encontrado = false;
	    while(!encontrado && i <this.listRoutes.trayectos[this.actualRoute].length){
		if(this.listRoutes.trayectos[this.actualRoute][i][0][0]==divImg.childNodes[1].firstChild.data){
		    this.listRoutes.trayectos[this.actualRoute].splice(i,1);
		    encontrado = true;
		}
		i++;
	    }
	}
	
		    
	if (!contiene){
	    divImg.style.background= "SteelBlue";
	    this.camaras[this.camaras.length] = [[divImg.childNodes[1].firstChild.data,
						  divImg.childNodes[0].src]];
	    
	}
	if(!encontrado){
	    this.listRoutes.trayectos[this.actualRoute][i] =[[divImg.childNodes[1].firstChild.data,
						  divImg.childNodes[0].src]];
	}
    }
    
   this.route.set(this.toJSON(this.listRoutes));
    this.createAlternativeConfig();
    this.showAlternative(this.EDIT_VIEW);
    
}

InformacionTrafico.prototype.toJSON = function(object) {
	return JSON.stringify(object, function (key, value) {
	    return value;
	});
}

InformacionTrafico = new InformacionTrafico();
