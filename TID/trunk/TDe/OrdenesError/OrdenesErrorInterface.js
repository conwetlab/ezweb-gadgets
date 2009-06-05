/*************************************************************************/
/*	Definicion de las variables de XML - Preferencias y Wirings	 */
/*	Definicion de variables globales				 */
/*	Definicion de los manejadores de las funciones			 */
/*************************************************************************/

var orderId = EzWebAPI.createRWGadgetVariable ('orderId');
var description = EzWebAPI.createRWGadgetVariable ('description');

/* Variables Globales */
var value = '';
var informacion = new StyledElements.StyledNotebook({'id':'informacion'});

var headers = ['TD-Order-ID',
				'Status',
				'OrderStatus',
				'Confirmed delivery date',
				'Termination date',
				'VoiceSubscriberID',
				'IDeSubscriberID',
				'Error date',
				'Error code',
				'Error description'];
				
var datos = [['133670-20061003-ORD00016',
				'IN PROCESS',
				'orderConfirmation',
				'03/10/2006, 02:00:00',
				'',
				'',
				'3383',
				'03/10/2006, 14:43:35',
				'5020',
				'Error sending message to voice system'],
			['133670-20061003-ORD00006',
				'IN PROCESS',
				'orderConfirmation',
				'03/10/2006, 02:00:00',
				'',
				'',
				'3373',
				'03/10/2006, 13:00:02',
				'5020',
				'Error sending message to voice system'],
			['133670-20061003-ORD00005',
				'IN PROCESS',
				'orderConfirmation',
				'03/10/2006, 02:00:00',
				'',
				'',
				'3372',
				'03/10/2006, 12:05:43',
				'5020',
				'Error sending message to voice system'],
			['133670-20061003-ORD00003',
				'IN PROCESS',
				'orderConfirmation',
				'03/10/2006, 02:00:00',
				'',
				'',
				'3372',
				'03/10/2006, 12:05:43',
				'5020',
				'Error sending message to voice system'],
			['133670-20061003-ORD00002',
				'IN PROCESS',
				'orderConfirmation',
				'03/10/2006, 02:00:00',
				'',
				'',
				'3372',
				'03/10/2006, 12:05:43',
				'5020',
				'Error sending message to voice system'],
			['133670-20060928-ORD00012',
				'IN PROCESS',
				'orderConfirmation',
				'03/10/2006, 02:00:00',
				'',
				'804275',
				'3372',
				'03/10/2006, 12:05:43',
				'5020',
				'Error sending message to voice system']	
				];

var Ordenes = function() {
    /* Call to the parent constructor */
    EzWebGadget.call(this, {});
}

Ordenes.prototype = new EzWebGadget(); /* Extend from EzWebGadget */

Ordenes.prototype.resourcesURL = "http://jaimgc.hi.inet/repository/TDe/OrdenesError"; 

Ordenes.prototype.init = function() {
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
				
		for(i=0;i<headers.length;i++){
				if(i==0){
					textinfo += "<td><span class='send' onclick='sendEvent(\""+datos[j][i]+"\",\""+datos[j][9]+"\")'>"+datos[j][i]+"<span></td>";	
				}else{
					textinfo += "<td>"+datos[j][i]+"</td>";
				}
		}
		textinfo +"</tr>";
		
	}	
	textinfo += "</table>";
	
	var info = document.createElement('div');
	info.setAttribute ('id', 'info');
	info.innerHTML = textinfo;

	content.appendChild(info);
	
	
}

/* Instanciate the Gadget class */
Ordenes = new Ordenes();

function sendEvent(id,desc){
	orderId.set(id);
	description.set(desc);
}

/*************************************************************************/
/*	Funciones para cubrir la funcionalidad del gadget		 */
/*************************************************************************/


