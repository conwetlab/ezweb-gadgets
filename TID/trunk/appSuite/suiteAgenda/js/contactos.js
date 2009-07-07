var contactos = new Array();

function contacto(id,nombre,direccion,telefono,movil,correo,cumple,img,alias,grupo) {
	this.id = id;
	this.nombre=nombre;
	this.telefono = telefono;
	this.movil = movil;
	this.direccion= direccion;
	this.correo=correo;
	this.cumple=cumple;
	this.img=img;
	this.alias=alias;
	this.grupo=grupo;
}

function iniciarArray(){
	contactos.splice(0, contactos.length);
}

function agregarContacto(id,nombre,direccion,telefono,movil,correo,cumple,img,alias,grupo){
	contactos [contactos.length] = new contacto(id,nombre,direccion,telefono,movil,correo,cumple,img,alias,grupo);
}


function getContactoByID(id) {
	var actual = "";
	for (i=0;i<contactos.length;i++){
		actual = contactos[i];
		if (actual.id == id) {
		 	return actual;
	  }
	 }

 return actual;
}

function URLEncode(url){
	var a = url.indexOf("á");
	var e = url.indexOf("é");
	var i = url.indexOf("í");
	var o = url.indexOf("ó");
	var u = url.indexOf("ú");
	var fin = url.length;
	var url1 = "";
	var url2 = "";

	alert(url+" "+url1+" "+url2);
  if( a != 0 ){	
		url1 = url.substring (0,a);
		url2 = url.substring (a+1,fin);
		url = url1+"\u00e1"+url2;
	}
	else if( e != 0 ){	
		url1 = url.substring (0,e);
		url2 = url.substring (e+1,fin);
		url = url1+"\u00e9"+url2;
	}
	else if( i != 0 ){	
		url1 = url.substring (0,i);
		url2 = url.substring (i+1,fin);
		url = url1+"\u00ed"+url2;
	}
	else if( o != 0 ){	
		url1 = url.substring (0,o);
		url2 = url.substring (o+1,fin);
		url = url1+"\u00f3"+url2;
	}
	else if( u != 0 ){	
		url1 = url.substring (0,u);
		url2 = url.substring (u+1,fin);
		url = url1+"\u00fa"+url2;
	}
	else
		url=url;
		
	return url;
}

