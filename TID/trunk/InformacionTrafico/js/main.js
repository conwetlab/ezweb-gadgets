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

    // Constants
    this.FAVOUR_ALTERNATIVE = 0;
    this.CONFIG_ALTERNATIVE = 1;

    // User Interface
    this.alternatives = null;
    this.interval = null;
    this.value = "";
    this.time = EzWebAPI.createRGadgetVariable("time",this.resetInterval);
    this._createUserInterface();
    this.cameras= EzWebAPI.createRWGadgetVariable("cameras");
    if (this.cameras.get() == ""){
	this.camSelected = {};
    }
    else{
	this.camSelected =  eval("("+this.cameras.get()+")");  
    }
    this.createListRoads();
    this.refresh();
    this.resetInterval();
    this.displayCameras();
//    this.getStretch();
    
}

/***************** USER INTERFACE METHODS *************************/
 
InformacionTrafico.prototype._createUserInterface = function(){

    var body = document.getElementsByTagName("body")[0];
    this.alternatives = new StyledElements.StyledAlternatives({id: 'alternatives1',defaultEffect: "None"});

    var header = document.createElement("div");
    header.id = "header";
    body.appendChild(header);
    
    var header_left = document.createElement("div");
    header_left.id = "header_left";
    header.appendChild(header_left);
    header_left.appendChild(this._createHeaderButton("images/camara22.png","Favoritos",
						     EzWebExt.bind(function(){
							 this.showAlternative(this.FAVOUR_ALTERNATIVE);							 
						     },this)));

    header_left.appendChild(this._createHeaderButton("images/config.png","Configurar",
						     EzWebExt.bind(function(){
							 this.showAlternative(this.CONFIG_ALTERNATIVE);
							 this.paintSelectCam(this.camaras);
						     },this)));
    
    var content = document.createElement("div");
    content.id = "content";
    body.appendChild(content);
    
    //PANEL PRINCIPAL
    this.hpaned = new StyledElements.StyledHPaned({handlerPosition:30,
                                                  leftMinWidth:180,
                                                   rigthMinWidth:400,
                                                   id: 'hpaned1'});
    var mainAlternative = this.alternatives.createAlternative();
    mainAlternative.appendChild(this.hpaned);
    
    this.content_left = document.createElement("div");
    this.content_left.id = "content_left";
    this.hpaned.getLeftPanel().appendChild(this.content_left);
    this.content_right = document.createElement("div");
    this.content_right.id = "content_right";
    this.hpaned.getRightPanel().appendChild(this.content_right);
    
    
    //PANEL CONFIGURACIÓN
    
    var  configAlternative = this.alternatives.createAlternative();    
    var config_content = document.createElement("div");
    config_content.id = "contenedor_config";
    EzWebExt.addClassName(config_content,"content_right");
    EzWebExt.addClassName(config_content,"send_mail");
    configAlternative.appendChild(config_content);

    var content_title = document.createElement("div");
    EzWebExt.addClassName(content_title,"headerrow");
    EzWebExt.addClassName(content_title,"config");
    config_content.appendChild(content_title);
    var title = document.createElement("div");
    EzWebExt.addClassName(title,"row");
    EzWebExt.addClassName(title,"config");

    var text_title = document.createElement("span");
    EzWebExt.addClassName(text_title, "alternative_title");
    text_title.appendChild(document.createTextNode("CONFIGURACIÓN DE LAS CÁMARAS"));
    title.appendChild(text_title);

    title.appendChild(this._createHeaderButton("images/cancel.png", "Cancelar", EzWebExt.bind(function() { 
	this.showAlternative(this.FAVOUR_ALTERNATIVE);
	this.camSelected =  eval("("+this.cameras.get()+")"); 
	}, this)));
    title.appendChild(this._createHeaderButton("images/save.png", "Guardar", EzWebExt.bind(function() { 
	this.cameras.set(this.toJSON(this.camSelected));
	this.displayCameras();

    },this)));
    
    content_title.appendChild(title);
    this.config_hpaned =  new StyledElements.StyledHPaned({handlerPosition:70,
                                                  leftMinWidth:400,
                                                   rigthMinWidth:100,
                                                   id: 'hpaned2'});
    var content_hpaned = document.createElement("div");
    EzWebExt.addClassName(content_hpaned,"tablebody");
    EzWebExt.addClassName(content_hpaned,"config");
    config_content.appendChild(content_hpaned);

    var content_left_config = document.createElement("div");
    content_left_config.id = "content_left_config"
    this.content_info = document.createElement("div");
    EzWebExt.addClassName(this.content_info,"content_info");
    content_left_config.appendChild(this.content_info);

    this.content_cam = document.createElement("div");
    EzWebExt.addClassName(this.content_cam,"content_cam");
    content_left_config.appendChild(this.content_cam);

    this.config_hpaned.getLeftPanel().appendChild(content_left_config);
    this.content_right_config = document.createElement("div");
    this.content_right_config.id = "content_right_config";
    this.config_hpaned.getRightPanel().appendChild(this.content_right_config);

    this.config_hpaned.insertInto(content_hpaned);

    this.form_in_config = {};
    this.created_selectStretch = false;
    this.getRoads();
    this.alternatives.insertInto(content);
    
     
}


InformacionTrafico.prototype.createListRoads = function(){

    if(InformacionTrafico.cameras.get() == ""){
	this.listRoads = {};
	return;
    }
    var auxRoads = eval('('+ InformacionTrafico.cameras.get() + ')');
    this.listRoads ={};
    for (k in auxRoads){
	this.listRoads[k] = {};
	this.listRoads[k]["list_stretch"] = auxRoads[k];
	this.listRoads[k]["state"] = "closed";
	this.listRoads[k]["div_children"] = new Array();
	for (i in auxRoads[k]){
	   this.listRoads[k]["list_stretch"][i]["div_children"] = new Array();
	   this.listRoads[k]["list_stretch"][i]["state"] = "closed";
	}
    }
}


InformacionTrafico.prototype.toJSON = function(object) {
	return JSON.stringify(object, function (key, value) {
	    return value;
	});
}

InformacionTrafico.prototype._createHeaderButton = function(src, title, handler) {
    var div = document.createElement("div");
    EzWebExt.addClassName(div, "image");
    
    var img = document.createElement("img");
    img.src = this.getResourceURL(src);
    img.title = title;
    img.addEventListener("click", handler, false);
    div.appendChild(img);
    
    return div;
}


InformacionTrafico.prototype.showAlternative = function(alternative) {
	this.alternatives.showAlternative(alternative);
    
}

InformacionTrafico.prototype.repaint = function() {
    var height = (this.getHeight() - document.getElementById('header').offsetHeight);
    document.getElementById('alternatives1').style.height = height + 'px';
    this.hpaned.repaint();
}


// Método de selección de las cámaras

InformacionTrafico.prototype.selectCam = function(divImg){

    var encontrado = false;
    var i = 0;
    var carretera = this.form_in_config["road"].getValue();
    var tramo = this.form_in_config["stretch"].textDiv.firstChild.data;
    

    if(this.camSelected[carretera] == null){
	this.camSelected[carretera] = {};
	this.camSelected[carretera][tramo] = [];
	this.camSelected[carretera][tramo][0] =	[[divImg.childNodes[1].firstChild.data,
						 divImg.childNodes[0].src]];
	divImg.style.background= "SteelBlue";
	this.camaras[this.camaras.length]=[[divImg.childNodes[1].firstChild.data,
						 divImg.childNodes[0].src]];
	
    }
    else{
	if(this.camSelected[carretera][tramo] == null){
	 
	    this.camSelected[carretera][tramo] = [];
	    this.camSelected[carretera][tramo][0] = [[divImg.childNodes[1].firstChild.data,
						 divImg.childNodes[0].src]];
	    divImg.style.background= "SteelBlue";
	    this.camaras[this.camaras.length] =  [[divImg.childNodes[1].firstChild.data,
						 divImg.childNodes[0].src]];
	}
	else{
	    while(!encontrado && i< this.camSelected[carretera][tramo].length){
		if(this.camSelected[carretera][tramo][i][0][0] == divImg.childNodes[1].firstChild.data ){
		    var j = 0;
		    var contiene = false;
		    this.camSelected[carretera][tramo].splice(i,1);
		    divImg.style.background = "transparent";
		    encontrado = true;
		    while(!contiene && j<this.camaras.length){
			if(this.camaras[j][0][0] == divImg.childNodes[1].firstChild.data){
			    contiene = true;
			    this.camaras.splice(j,1);
			}
			j++;
		    }
		    
		    
		    
		}else{
		    i++;
		}
	    }
	    if (!encontrado){
		this.camSelected[carretera][tramo][i] = [[divImg.childNodes[1].firstChild.data,
							  divImg.childNodes[0].src]];
		divImg.style.background= "SteelBlue";
		this.camaras[this.camaras.length] = [[divImg.childNodes[1].firstChild.data,
							  divImg.childNodes[0].src]];
		
	    }
	}
    }
    
    
    this.paintSelectCam(this.camaras);
    
}

// Método paint de las cámaras seleccionadas

InformacionTrafico.prototype.paintSelectCam = function (list){

    this.content_right_config.innerHTML = "";
    var text_selectedCam = document.createElement("div");
    EzWebExt.addClassName(text_selectedCam,"title_config");
    text_selectedCam.appendChild(document.createTextNode("Cámaras seleccionadas"));
    this.content_right_config.appendChild(text_selectedCam)
    
    this.cont_camSel = document.createElement("div");
    EzWebExt.addClassName(this.cont_camSel,"selCam");
    this.content_right_config.appendChild(this.cont_camSel);
    
    for(var i = 0; i<list.length;i++){
	var img_cam = document.createElement("div");
	EzWebExt.addClassName(img_cam,"img_cam");
	img = document.createElement("img");
	img.setAttribute("src",list[i][0][1]);
	img.setAttribute("title",list[i][0][0]);
	img.setAttribute("width","50");
	img.setAttribute("height","35");
	img_cam.appendChild(img);
	this.cont_camSel.appendChild(img_cam);

    }
   
   
}

// Métodos create Select

InformacionTrafico.prototype._createCell = function(element, className) {
    var cell = document.createElement("div");
    EzWebExt.addClassName(cell, "cell");
    EzWebExt.addClassName(cell, className);
    var span = document.createElement("span");
    span.id = "value_select";
    if (element instanceof StyledElements.StyledElement) {
	element.insertInto(span);
    }
	else {
	    span.appendChild(element);
	}
    cell.appendChild(span);
    return cell;
}

InformacionTrafico.prototype._createSelectRoad = function(list){
    var in_road_text = new StyledElements.StyledSelect({initialEntries: list});
    in_road_text.addEventListener("change",
                                  EzWebExt.bind(function(select) {
                                      this.getStretch();
				  }, this));
    this.form_in_config["road"] = in_road_text;


    var row = document.createElement("div");
    EzWebExt.addClassName(row, "row");
    EzWebExt.addClassName(row, "config");
    EzWebExt.addClassName(row, "big");
    row.appendChild(this._createCell(document.createTextNode("Carretera:"), "title"));
    row.appendChild(this._createCell(in_road_text, "value"));
    


    return row;


}

InformacionTrafico.prototype._createSelectStretch = function(list){
    if (this.form_in_config["stretch"] === undefined) {
        var in_stretch_text = new StyledElements.StyledSelect({initialEntries: list});
	in_stretch_text.addEventListener("change",
					 EzWebExt.bind(function(select){
					     this.getCameras();
					 },this));
	this.form_in_config["stretch"] = in_stretch_text;
	
	var row = document.createElement("div");
	EzWebExt.addClassName(row, "row");
	EzWebExt.addClassName(row, "config");
	EzWebExt.addClassName(row, "big");
	row.appendChild(this._createCell(document.createTextNode("Tramo:"), "title"));
	row.appendChild(this._createCell(in_stretch_text, "value"));
	this.content_info.appendChild(row);
    } else {
        var in_stretch_text = this.form_in_config["stretch"];
        in_stretch_text.clear();
        in_stretch_text.addEntries(list);
    }

}



InformacionTrafico.prototype._createSelectListCam = function(listNames,listPhotos){
    var subcontent_cam = document.createElement("div");
    EzWebExt.addClassName(subcontent_cam,"subcontent_cam");
    this.content_cam.appendChild(subcontent_cam);
    var camList = [];
    for(var i = 0; i<listPhotos.length;i++){
	var img_cam = document.createElement("div");
	camList[i] = img_cam;
	img_cam.id = i.toString();
	EzWebExt.addClassName(img_cam,"img_cam");
	img = document.createElement("img");
	img.setAttribute("src",listPhotos[i][0]);
	img.setAttribute("width","150");
	img.setAttribute("height","120");
	var self = this;
	
	var context = {self: this, img_cam: img_cam};
	img.addEventListener("click", EzWebExt.bind(function(){ self.selectCam(this.img_cam);},context), false);
	img_cam.appendChild(img);
	var span_text = document.createElement("span");
	var text = document.createTextNode(listNames[i][0]);
	text.id = "textCam";
	span_text.appendChild(text);
	EzWebExt.addClassName(span_text,"div_text");
	img_cam.appendChild(span_text);
	subcontent_cam.appendChild(img_cam);
    }
  
    

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


//Métodos onSuccess

InformacionTrafico.prototype.onSuccessGetRoads = function(transport){
   
    var html_response = document.createElement("div");
    html_response.innerHTML = transport.responseText;
    var roadList = html_response.getElementsByClassName('buscIntCamposEvTipoSelect width18em');
    var roads = [[]];
  
    var title_config = document.createElement("div");
    EzWebExt.addClassName(title_config,"title_config");
    title_config.appendChild(document.createTextNode("Selección de carretera y tramo"));
    this.content_info.appendChild(title_config);

    for (var i = 0; i<roadList[0].options.length;i++){
	roads[i] = [roadList[0].options[i].value,roadList[0].options[i].value];
    }
    
    this.content_info.appendChild(this._createSelectRoad(roads));
      
}

InformacionTrafico.prototype.onSuccessGetStretch = function(transport){
    
    var html_response = document.createElement("div");
    html_response.innerHTML = transport.responseText;
    var stretchList = html_response.getElementsByClassName('camCuadroTexto');
    var stretchs = [[]];
   
    for (var i = 0; i<stretchList.length;i++){
	stretchs[i] = [stretchList[i].parentNode.childNodes[3].pathname,stretchList[i].childNodes[0].nodeValue]
    }
    this._createSelectStretch(stretchs);
}

InformacionTrafico.prototype.onSuccessGetCameras = function(transport){
    
    var html_response = document.createElement("div");
    html_response.innerHTML = transport.responseText;
    var camNameList = html_response.getElementsByClassName("camaraTextoPie");
    var camList = html_response.getElementsByClassName("camaraImagen");
    var camerasName = [[]];
    var camerasPhoto = [[]]
    this.content_cam.innerHTML="";
    var text_cam = document.createElement("div");
    EzWebExt.addClassName(text_cam, "title_config");
    text_cam.appendChild(document.createTextNode("Selección de cámaras de tráfico"));
    this.content_cam.appendChild(text_cam);
   
 
    for(var i = 0; i < camNameList.length; i++){
	camerasName[i] = [camNameList[i].textContent,camNameList[i].textContent];
    }
    for(var i = 0; i <camList.length;i++){
	camerasPhoto[i]= ["http://www.dgt.es"+camList[i].attributes[1].nodeValue,"http://www.dgt.es"+camList[i].attributes[1].nodeValue];
    }
  
    this._createSelectListCam(camerasName,camerasPhoto);
    
}


// Display carreteras,tramos y cámaras seleccionadas

InformacionTrafico.prototype.displayCameras = function(){
    this.content_left.innerHTML = "";
    this.camaras = [];
  
    if(InformacionTrafico.cameras.get() != ""){
	
	var auxCameras = eval('('+InformacionTrafico.cameras.get()+')');
	this.createListRoads();
	for (var i in auxCameras){
	    for(var k in auxCameras[i]){
		for (var x = 0; x<auxCameras[i][k].length; x++){
		this.camaras[this.camaras.length] = [[auxCameras[i][k][x][0][0],auxCameras[i][k][x][0][1]]];
		}
	    }
	    this.createCamFolder(auxCameras[i],i);
	  
	   
	}
    }
}

InformacionTrafico.prototype.openFolder= function(key) 
{
//    EzWebExt.addClassName(this.listRoads[key]["div_children"],"opened" );
   this.listRoads[key]["div_children"].style.display = "block";
    this.listRoads[key]["state"] = "opened";
}

InformacionTrafico.prototype.openFolderStretch= function(key,key1) 
{
  //  EzWebExt.addClassName(this.listRoads[key]["list_stretch"][key1]["div_children"],"opened" );
    this.listRoads[key]["list_stretch"][key1]["div_children"].style.display = "block";
    this.listRoads[key]["list_stretch"][key1]["state"] = "opened";
   
}

InformacionTrafico.prototype.closeFolder= function(key) 
{
    //EzWebExt.addClassName(this.listRoads[key]["div_children"],"closed" );
    this.listRoads[key]["div_children"].style.display = "none";
    this.listRoads[key]["state"] = "closed";
}
InformacionTrafico.prototype.closeFolderStretch = function(key,key1) 
{
//    EzWebExt.addClassName(this.listRoads[key]["list_stretch"][key1]["div_children"],"closed" );

    this.listRoads[key]["list_stretch"][key1]["div_children"].style.display = "none";
    this.listRoads[key]["list_stretch"][key1]["state"] = "closed";
    
}


InformacionTrafico.prototype.createCamFolder = function(roads,key) {
   
    var name = document.createElement("div");
    EzWebExt.addClassName(name,"open_tag");
   
    var imageFolder = document.createElement("img");
    EzWebExt.addClassName(imageFolder,"folder_image");
    imageFolder.setAttribute('src', this.getResourceURL('images/autopista22.png'));
    name.appendChild(imageFolder);
    var road = document.createElement("div");
    road.id = "road";
    road.appendChild(document.createTextNode(key));
    road.addEventListener("click", EzWebExt.bind(function() {
	if (this.listRoads[key]["state"] == "closed") {
	    this.openFolder(key);
	}
	else {
	    if (this.listRoads[key]["state"] == "opened")
		this.closeFolder(key);
	}
    }, this), false);

    name.appendChild(road);
    var children = document.createElement("div");
    EzWebExt.addClassName(children,"children");
    children.style.display = "none";
    for (i in roads){
	var div = document.createElement("div");
	EzWebExt.addClassName(div,"open_tag");

	var img = document.createElement("img");
	img.setAttribute('src', this.getResourceURL('images/hitokm.png'));
	var stretch = document.createElement("span");
	stretch.appendChild(document.createTextNode(i));
	var self = this;
	var context = { self: this,key:key, i:i}
	stretch.addEventListener("click", EzWebExt.bind(function() {
	    self.desplegar(this.key,this.i);
	    
	}, context), false);
	div.appendChild(img);
	div.appendChild(stretch);
	var childrenCam = document.createElement("div");
	EzWebExt.addClassName(childrenCam,"children");
	childrenCam.style.display = "none";
	for (var k = 0; k< roads[i].length;k++ ){
	    var divCam = document.createElement("div");
	    var imgCam = document.createElement("img");
	    imgCam.setAttribute('src',this.getResourceURL('images/webcam.png'));
	    var cam = document.createElement("span");
	    var text = roads[i][k][0][0];
	    cam.appendChild(document.createTextNode(text));
	    self = this;
	    var src = roads[i][k][0][1];
	    this.camaras[this.camaras[length]] = [[text,src]];
	    var contextsrc = {self:this,src:src}
	    cam.addEventListener("click",EzWebExt.bind(function(){
		self.mostrarCam(this.src);
	    },contextsrc),false);
	    divCam.appendChild(imgCam);
	    divCam.appendChild(cam);
	    childrenCam.appendChild(divCam);
	    this.listRoads[key]["list_stretch"][i]["div_children"] = childrenCam;
	   
	}
	div.appendChild(childrenCam);
	children.appendChild(div);
	
    }
    this.listRoads[key]["div_children"] = children;
   
    name.appendChild(children);
    this.content_left.appendChild(name);
    
}

InformacionTrafico.prototype.mostrarCam = function(src,s){
    var s = Math.random();
    this.content_right.innerHTML = "";
    var img = document.createElement("img");
    img.setAttribute("src",src+"?random="+s);
    img.src_aux = src;
    this.content_right.appendChild(img);
}

InformacionTrafico.prototype.refresh = function(){
    if (this.content_right.childNodes.length == 1){
	var src = this.content_right.childNodes[0].src_aux;
	var s = Math.random();
	this.content_right.childNodes[0].src = (src+"?random="+s);
	
    }

}

InformacionTrafico.prototype.desplegar = function(carretera,tramo){

    if (this.listRoads[carretera]["list_stretch"][tramo]["state"] == "closed") {
	this.openFolderStretch(carretera,tramo);
    }
    else {
	if (this.listRoads[carretera]["list_stretch"][tramo]["state"] == "opened")
	 
	this.closeFolderStretch(carretera,tramo);
	
    }
}


// ONFAILURE RESPONSES

InformacionTrafico.prototype.onException = function(transport, e) {

	this.alert("Exception", "Line: " + e.lineNumber + " \nMessage: " + e.message, {type: EzWebExt.ALERT_ERROR});
}

InformacionTrafico.prototype.onError = function(transport) {
	var response = eval("(" + transport.responseText + ")");
	if (response["error"] && (response["error"] != "")) {
		this.alert("Error", response["error"], {type: EzWebExt.ALERT_ERROR});
	}
	else {
		this.alert("Error", "General error", {type: EzWebExt.ALERT_ERROR});
	}
}

// REFRESH


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
    this.interval = setInterval(function(){self.refresh()}, 60000);
}


InformacionTrafico = new InformacionTrafico();
