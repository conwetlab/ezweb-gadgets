
	var response; 
	var nuevos;
	var mostrar;
	var id;
	var item;
	var de;
	var para;
	var fecha;
	var asunto;
	var cuerpo;
	var estado;
	var orderIMAP;
	var feedUrl = "http://ezweb.tid.es:8180/appSuite/getMails?user=";
	var sendUrl = "http://ezweb.tid.es:8180/appSuite/sendMail?user=";
	var markUrl = "http://ezweb.tid.es:8180/appSuite/markMail?user=";
	var numeroMensajes;
	
	function peticionAjax(){
		setVars();
	}
	
	function setVars(){
		feedUrlAux = feedUrl+user+"@telefonica.net&pass=suite_app"+"&ran="+getRandom();
		EzWebAPI.send_get(feedUrlAux, this, displayOk, displayErrorShow);
	}
	
		function enviar(){
		var to = document.getElementById('to').value;
		var subject = document.getElementById('subject').value;
		var body = document.getElementById('message').value;
		
	
sendUrlTemp = sendUrl+user+"&pass=&para="+to+"&cuerpo="+encodeURIComponent(body)+"&asunto="+encodeURIComponent(subject)+"&ran="+getRandom();
//alert(sendUrlTemp);
		EzWebAPI.send_get(sendUrl, this, ok, displayErrorSend);
	}
	
	function cancelar(){
		document.getElementById('to').value = "";
		document.getElementById('subject').value = "";
		document.getElementById('message').value = "";
		deleteBuffer();
		mostrarMailbox();
	}
	
	function ok(resp) {
		//alert(resp.responseXML);
		cancelar();
		//deleteBuffer();
		//mostrarMailbox();
	}
	
	

	function resize(text, size){
		if (text.length > size){
			text = text.substring(0,size);
		}
  return text
	}
	
	function resizeAsunto(text, size){
		if (text.length > size){
			text = text.substring(0,size);
			text = text+"...";
		}
  	return text
	}
	
	function deleteChar(s){
	  	var posComillas = s.indexOf('"',0);
		if (posComillas != -1){
			s = s.substring(posComillas+1);
		}

		var pos = s.indexOf("<",0); 
		var pos2 = s.indexOf("@",0);

		if( pos < pos2){
			if(pos != -1)
	  			s = s.substring(0,pos-1);
	  		else if (pos2 != -1)
				s = s.substring(0,pos2);
	  	}
		else{	
			if(pos2 != -1)
	  			s = s.substring(0,pos2);
	  		else if (pos != -1)
				s = s.substring(0,pos-1);
		}
		return s;
	}

	function displayOk(resp){
		iniciarArray();
		//alert("hemos hecho la peticion al servidor IMAP y nos devuelve un OK");
		nuevos = 0;
		id = 0;

		response = resp.responseXML;	
		
		numeroMensajes = response.getElementsByTagName('mail').length;

		//Relleno el array MailIMAP de mas nuevo (0) a mas antiguo (length -1)	
		for(i = response.getElementsByTagName('mail').length -1; i >= 0 ; i--){
				item = response.getElementsByTagName('mail')[i];
				
				de = item.getElementsByTagName('de')[0].firstChild.data;
				de = resize(de,18);
				de = deleteChar(de);
	      //alert("DE: "+de);
	      
	      fecha = item.getElementsByTagName('fecha')[0].firstChild.data;
	      fecha = resize(fecha,10);
	      //alert("FECHA: "+fecha);
				
				para = item.getElementsByTagName('para')[0].firstChild.data;
				if (item.getElementsByTagName('asunto')[0].firstChild == null){
					asunto ="";
				} else {
					asunto = item.getElementsByTagName('asunto')[0].firstChild.data;
					asunto = resizeAsunto(asunto,36);
				}
				//alert("ASUNTO: "+asunto);
				
				if (item.getElementsByTagName('cuerpo')[0].firstChild == null){
					cuerpo ="";
				} else {
					cuerpo = item.getElementsByTagName('cuerpo')[0].firstChild.data;
				}

				if (item.getElementsByTagName('estado')[0].firstChild == null){
					estado ="";
				} else {
				estado = item.getElementsByTagName('estado')[0].firstChild.data;
				}

				orderIMAP = item.getElementsByTagName('orden')[0].firstChild.data;
				agregarMailIMAP(id,fecha,de,para,asunto,cuerpo,estado,orderIMAP);
				id++;
				
				if(estado == "recent")
					nuevos++;
				document.getElementById('bandeja').innerHTML = "&nbsp;&nbsp;Bandeja de entrada (" + nuevos + ")";
			}	
			mostrarMailbox();
			
	}
	
  //Pintamos nuestra tabla
	function mostrarMailbox(){
		
			if(limite == undefined || limite =="Todos" || limite == ""){
				mostrar = numeroMensajes;
			}
			else{
				mostrar = limite;
			}
			//Borramos la tabla de antes
			/*
			for (k=0; k<numeroMensajes; k++){
				document.getElementById('From'+k).innerHTML = "";
				document.getElementById('asunto'+k).innerHTML = "";
				document.getElementById('fecha'+k).innerHTML = "";
			}
			*/
			removeChildrenFromNode(document.getElementsByClassName("items")[0]);
			for (j= 0; j<mostrar; j++){
				agregarMail(getMailByID(j).de, getMailByID(j).asunto, getMailByID(j).fecha, j); 
			}
			
			document.getElementById("divMail").style.visibility  = "hidden";
			document.getElementById("divSendMail").style.visibility  = "hidden";
			document.getElementById("divMailbox").style.visibility  = "visible";
			document.getElementById("iconodown").style.visibility  = "hidden";
			
			if(mostrar>5){
				document.getElementById("iconodown").style.visibility  = "visible";
				}
	}
	
	
  function removeChildrenFromNode(e) {
  	if(!e) {
   		return false;
    }
    if(typeof(e)=='string') {
	    e = xGetElementById(e);
    }
    while (e.hasChildNodes()) {
	    e.removeChild(e.firstChild);
    }
    return true;
  }


  

 function displayErrorShow(resp){
  	alert("Lo sentimos. No se ha podido conectar al servidor de Correo IMAP");
	
  }

  function displayErrorSend(resp){
  	alert("Lo sentimos. No se ha podido enviar el mensaje");
	//alert(resp.responseXML);
  }
  
  function deleteMail(){
  	ordenMail = getMailByID(mailActual).orderIMAP;
  	markUrlTemp = markUrl+user+"@telefonica.net&pass=&status=deleted&order="+ordenMail+"&ran="+getRandom();
  	//alert("Eliminamos el mailActual:"+mailActual+"con url"+markUrlTemp);
  	EzWebAPI.send_get(markUrlTemp, this, okMark, displayErrorMark);
  }
  
  function okMark(){
  	peticionAjax();
  }
  
  function displayErrorMark(){
  	alert("El mensaje no se ha podido borrar");
  	}
  
	function getRandom (){
		return Math.random() * 10000000;
	}
	
	function replyMail(){
		//alert("el mensaje es de:" + getMailByID(mailActual).de);
		document.getElementById('to').value = getMailByID(mailActual).de;
		sendMail();
	}

	
