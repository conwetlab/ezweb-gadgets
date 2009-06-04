/*************************************************************************/
/*	Definicion de las variables de XML - Preferencias y Wirings	 */
/*	Definicion de variables globales				 */
/*	Definicion de los manejadores de las funciones			 */
/*************************************************************************/

var orderId = EzWebAPI.createRWGadgetVariable ('orderId');

/* Variables Globales */
var value = '';
var informacion = new StyledElements.StyledNotebook({'id':'informacion'});

var headers = ['Direction',
				'Workflow-Id',
				'Operation',
				'Date',
				'Date Ack',
				'Message',
				'Message Ack'];
				
var datos = [['Incoming',
				'a15632082807',
				'TAL.LineOrder',
				'13/01/2009, 02:00:00',
				'13/01/2009, 02:00:01'],
			['Outgoing',
				'20090113162225948290-1',
				'Order Acceptance',
				'13/01/2009, 02:23:13',
				'13/01/2009, 02:23:14'],
			['Outgoing',
				'a1563208280',
				'Order Confirmation',
				'13/01/2009, 02:25:23',
				'13/01/2009, 02:25:26'],
			['Outgoing',
				'a1563208280',
				'Order Execution',
				'13/01/2009, 02:25:23',
				'13/01/2009, 02:25:26'],
			['Incoming',
				'352676531',
				'TAL.MoveVoiceService',
				'13/01/2009, 04:25:13',
				'13/01/2009, 05:25:16'],
			['Outgoing',
				'352676531',
				'MoveVoiceService',
				'14/01/2009, 14:25:13',
				'14/01/2009, 14:25:16']	
				];

var ConsultaMensaje = function() {
    /* Call to the parent constructor */
    EzWebGadget.call(this, {});
}

ConsultaMensaje.prototype = new EzWebGadget(); /* Extend from EzWebGadget */

ConsultaMensaje.prototype.resourcesURL = "http://jaimgc.hi.inet/repository/TDe/OrdenesError"; 

ConsultaMensaje.prototype.init = function() {
	var header = document.createElement ('div');
	header.setAttribute ('id', 'header');
	var div1 = document.createElement ('div');
	div1.setAttribute ('class', 'text');
	document.body.appendChild(div1);
	
	var content = document.createElement('div');
	content.setAttribute ('id', 'content');
	document.body.appendChild (content);
	
		
	var textinfo = "<table align='center' cellspacing='2'>";
		textinfo +="<tr>";
			for(i=0;i<headers.length;i++){
					textinfo += "<th>"+headers[i]+"</th>";
			}	
		textinfo +="</tr>";
	
	for (j=0;j<datos.length;j++){
		if(j%2==0){
			textinfo += "<tr class='even'>";
		}else{
			textinfo += "<tr class='odd'>";
		}
				
		for(i=0;i<headers.length-2;i++){
			textinfo += "<td>"+datos[j][i]+"</td>";
		}
		
		textinfo += "<td><span class='view'>View</span></td>";
		textinfo += "<td><span class='view'>View</span></td>";
		textinfo +"</tr>";
		
	}	
	textinfo += "</table>";
	
	var info = document.createElement('div');
	info.setAttribute ('id', 'info');
	info.innerHTML = textinfo;
	
	content.appendChild(info);
	
	
}

/* Instanciate the Gadget class */
ConsultaMensaje = new ConsultaMensaje();

function orderId_handler (value){

}

/*************************************************************************/
/*	Funciones para cubrir la funcionalidad del gadget		 */
/*************************************************************************/


