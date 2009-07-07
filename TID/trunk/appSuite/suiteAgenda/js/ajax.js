var response;
var numeroContactos;
var xmlUrl = "http://ezweb.tid.es:8180/appSuite/contactos.xml";
var texto = new Array();	
var item;
var nombre;
var correo;
var direccion;
var telefono;
var movil;
var cumple;
var alias;
var correoS;
var direccionS;
var telefonoS;
var movilS;
var cumpleS;
var fin;
var inicio;
var deleteUrl = "http://ezweb.tid.es:8180/appSuite/deleteContact?id=";
var editUrl = "http://ezweb.tid.es:8180/appSuite/editContact?";
var addUrl = "http://ezweb.tid.es:8180/appSuite/newContact?";
var imgVaciaUrl = "http://demo.ezweb.morfeo-project.org/repository/appSuite/suiteAgenda/img/nada.gif";
var imgPequeVaciaUrl = "http://demo.ezweb.morfeo-project.org/repository/appSuite/suiteAgenda/img/nadaPeque.gif";

function set(event){
	correo = event.target.sCorreo;
	setCorreo(correo);
}

function verC(event){
	
	verContacto(event.target.contacto);
}
	
function getRandom (){
	return Math.random() * 10000000;
}

function displayErrorShow(resp){
	alert("Error al cargar los contactos");
}

function ok(resp){
	iniciarArray();
	
	response = resp.responseXML;
	numeroContactos = response.getElementsByTagName('contacto').length;
	
	
	if(numeroContactos>=4){
		fin = numeroContactos-4;
		inicio = numeroContactos-1;
		j=0;
	}else{
		fin = 0;
		inicio = numeroContactos-1;
		j=0;
	}
	
	//Borramos la tabla de antes
	
	for (indice=0; indice<4;indice++){
		document.getElementById('grupo'+indice).innerHTML = "";
		document.getElementById('img'+indice).src = imgVaciaUrl;
		document.getElementById('sobre'+indice).src = imgPequeVaciaUrl;
		document.getElementById('edit'+indice).src = imgPequeVaciaUrl;
		document.getElementById('grupo'+indice).style.backgroundColor  = "#ffffff";
		document.getElementById('grupo'+indice).style.color  = "#ffffff";
		document.getElementById('alias'+indice).innerHTML = "";
	}
	
	//Buscamos el id del ultimo contacto
	ultimoItem = response.getElementsByTagName('contacto')[inicio];
	ultimoId = ultimoItem.getElementsByTagName('id')[0].firstChild.data;
	ultimoIdEntero = parseInt(ultimoId);
	  
	  
	//Limitamos el número de contactos mostrados a los cuatro últimos
	for (i=inicio; i>=fin; i--){
		item = response.getElementsByTagName('contacto')[i];
	  idContacto = item.getElementsByTagName('id')[0].firstChild.data;
  
	 if (item.getElementsByTagName('nombre')[0].firstChild == null){
			nombre ="";
		}else{
			nombre = item.getElementsByTagName('nombre')[0].firstChild.data;
			if(nombre.length>20)
				nombre = nombre.substring(0,20);
		}
	  
	  if (item.getElementsByTagName('direccion')[0].firstChild == null){
			direccion ="";
			direccionS ="";
		}else{
			direccion = item.getElementsByTagName('direccion')[0].firstChild.data;
			direccionS = "<br><br><b> Direcci&oacute;n: </b>" + direccion;
		}
	  if (item.getElementsByTagName('correo')[0].firstChild == null){
			correo ="";
			correoS ="";
		} else {
			correo = item.getElementsByTagName('correo')[0].firstChild.data;
			correoS = "<br><b> e-Mail: </b>" + correo;
		}
	  if (item.getElementsByTagName('telefono')[0].firstChild == null){
			telefono ="";
			telefonoS ="";
		} else {
			telefono = item.getElementsByTagName('telefono')[0].firstChild.data;
			telefonoS = "<br><b> Tel&eacute;fono: </b>" + telefono;
		}
	  if (item.getElementsByTagName('movil')[0].firstChild == null){
			movil ="";
			movilS ="";
		} else {
			movil = item.getElementsByTagName('movil')[0].firstChild.data;
			movilS = "<br><b> M&oacute;vil: </b>" + movil;
		}
	  if (item.getElementsByTagName('cumple')[0].firstChild == null){
			cumple ="";
			cumpleS ="";
		} else {
			cumple = item.getElementsByTagName('cumple')[0].firstChild.data;
			cumpleS = "<br><br><b> Cumple: </b>" + cumple;
		}
		
		if (item.getElementsByTagName('img')[0].firstChild == null){
			img = imgVaciaUrl;
		} else {
		  img = item.getElementsByTagName('img')[0].firstChild.data;
		}
		
		if (item.getElementsByTagName('alias')[0].firstChild == null){
			alias = "";
		} else {
		  alias = item.getElementsByTagName('alias')[0].firstChild.data;
		}
		
		if (item.getElementsByTagName('grupo')[0].firstChild == null){
			grupo = "";
		}else{
			grupo = item.getElementsByTagName('grupo')[0].firstChild.data;
		}

		document.getElementById('grupo'+j).innerHTML = nombre;
		document.getElementById('alias'+j).innerHTML = alias;
		document.getElementById('img'+j).src = img;
		document.getElementById('img'+j).name = idContacto;

		document.getElementById('img'+j).setAttribute("onmouseover","getEvent('" +correo+ "')");
		
		document.getElementById('sobre'+j).setAttribute("onmousedown","setData('" +correo+ "')");
	    	document.getElementById('edit'+j).src = "http://demo.ezweb.morfeo-project.org/repository/appSuite/suiteAgenda/img/edit.jpg";
    		//document.getElementById('edit'+j).contacto = idContacto;
		//document.getElementById('edit'+j).onclick = verC;
		document.getElementById('e'+j).href = "javascript:verContacto(" +idContacto +")";
		document.getElementById('s'+j).href = "javascript:setCorreo('"+ correo +"')";
    		
		document.getElementById('sobre'+j).src = "http://demo.ezweb.morfeo-project.org/repository/appSuite/suiteAgenda/img/sobreAgenda.png";
		//document.getElementById('sobre'+j).sCorreo = correo;
		//document.getElementById('sobre'+j).onclick = set;
    
		if(grupo=="Amigos"){
			document.getElementById('grupo'+j).style.backgroundColor  = "#999999";
			document.getElementById('grupo'+j).style.color  = "#000000";
		}else if(grupo == "Trabajo"){
			document.getElementById('grupo'+j).style.backgroundColor  = "#000066";
			document.getElementById('grupo'+j).style.color  = "#ffffff";
		}else if (grupo == "Familia"){
			document.getElementById('grupo'+j).style.backgroundColor  = "#ff9900";
			document.getElementById('grupo'+j).style.color  = "#000000";
		}
		
		agregarContacto(idContacto,nombre,direccion,telefono,movil,correo,cumple,img,alias,grupo);
		//document.getElementById(j).name = correo;
		//texto[j] = "<b> Nombre: </b>" + nombre + direccionS + telefonoS + movilS + correoS + cumpleS;
		j++;
	}
}

function peticion(){
	xmlUrlFinal = xmlUrl+"?ran="+getRandom();
	EzWebAPI.send_get(xmlUrlFinal, this, ok, displayErrorShow);
}

function okDelete(){
	setTimeout("cargarXML()",1500);
}

function displayErrorDelete(){
	alert("Error en la peticion");
}

function deleteContact(){
	deleteUrlFinal  = deleteUrl+contactoActual+"&ran="+getRandom();
	EzWebAPI.send_get(deleteUrlFinal, this, okDelete, displayErrorDelete);
	
}

function okEdit(){
	cargarXML();
}

function displayErrorEdit(){
	alert("Error en la peticion");
	}

function editContact(){
	if (imgContactoActual==""){
		imgContactoNuevo = imgVaciaUrl;
	}
	editUrlFinal = editUrl+"id="+contactoActual+"&nombre="+nombreContactoActual+"&direccion="+direccionContactoActual+"&telefono="+telefonoContactoActual+"&movil="+movilContactoActual+"&correo="+correoContactoActual+"&cumple="+cumpleContactoActual+"&img="+imgContactoActual+"&alias="+aliasContactoActual+"&grupo="+grupoContactoActual+"&idEdit="+contactoActual+"&ran="+getRandom();
	EzWebAPI.send_get(editUrlFinal, this, okEdit, displayErrorEdit);
}

function okNew(){
	cargarXML();
}

function displayErrorNew(resp){
	alert("Error en la peticion"+resp.responseXML);
	}

function newContact(){
	idNuevoContacto = ultimoIdEntero+1;
	if (imgContactoNuevo==""){
		imgContactoNuevo = imgVaciaUrl;
	}
	newUrlFinal = addUrl+"id="+idNuevoContacto+"&nombre="+nombreContactoNuevo+"&direccion="+direccionContactoNuevo+"&telefono="+telefonoContactoNuevo+"&movil="+movilContactoNuevo+"&correo="+correoContactoNuevo+"&cumple="+cumpleContactoNuevo+"&img="+imgContactoNuevo+"&alias="+aliasContactoNuevo+"&grupo="+grupoContactoNuevo;
alert(newUrlFinal);
	EzWebAPI.send_get(newUrlFinal, this, okNew, displayErrorNew);
}
