	var mails = new Array();
	var to;
	var subject;
	var body;
	
	function mailIMAP(id,fecha,de,para,asunto,cuerpo,estado,orderIMAP) {
		this.id = id;
		this.fecha=fecha;
		this.de =de;
		this.para =para;
		this.asunto=asunto;
		this.cuerpo=cuerpo;
		this.estado=estado;
		this.orderIMAP=orderIMAP;
	}
	
	function iniciarArray(){
		mails.splice(0, mails.length);
	}
	
	function agregarMailIMAP(id,fecha,de,para,asunto,cuerpo,estado,orderIMAP){
			mails [mails.length] = new mailIMAP(id,fecha,de,para,asunto,cuerpo,estado,orderIMAP);
	}

	function getMailByID(id) {
		var actual = "";
	  for (i=0;i<mails.length;i++){
		  actual = mails[i];
		  if (actual.id == id) {
		  	return actual;
	    }
	  }
	  return actual;
	}
	
	function setEstadoByID(id,valor) {
		var actual = "";
	  for (i=0;i<mails.length;i++){
			actual = mails[i];
		  if (actual.id == id)
		  	actual.estado = valor;
		}
	}
	

