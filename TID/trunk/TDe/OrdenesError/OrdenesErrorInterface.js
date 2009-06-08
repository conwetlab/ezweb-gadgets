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
				'TDeSubscriberID',
				'Error date',
				'Error code',
				'Error description'];
			
var datos = [['133670-20090529-OR001996',	'IN PROCESS',	'orderConfirmation',	'27/07/2009.00:00:00', '',	'',		'4030799',	'05/06/2009.11:14:27',	'-1',	'Not accepted (5210) \'\''],
['133670-20090526-OR002298',	'IN PROCESS',	'orderConfirmation',	'17/06/2009.00:00:00', '',		'9571387',	'4022495',	'04/06/2009.08:24:14',	'-1',	'Not accepted (42570) \'4257: Es liegt bereits ein Transfer-Auftrag (RNFlip) vor. (beginning: 4141660694, endnr: 4141660694, RNFlip count: 1)\''],
['133670-20090504-OR003791',	'EXECUTED',	'lineActivation',	'14/05/2009.00:00:00',	'',	'9474267',	'3969339',	'26/05/2009.11:57:29',	'-1',	''],
['133670-20090423-OR000299',	'EXECUTED',	'lineActivation',	'15/05/2009.00:00:00',	'',	'9474139',	'3942242',	'26/05/2009.11:55:34',	'-1',	''],
['133670-20080804-CA000582',	'EXECUTED',	'terminationExecution',  '',	'',		'7314459', 	'2507911',	'23/02/2009.15:55:40',	'-1',	'Error updating subscriber (42240) \'4224: Kunde kann nicht deaktiviert werden, solange offene Portierungen existieren! (7314459: offene Portierungen: 1)\''],
['133670-20080415-CA000397',	'EXECUTED',	'terminationExecution',  '',	'',		'7331105',	 '2496087',	'23/02/2009.15:06:08',	'-1',	'Error updating subscriber (42230) \'4223: Kunde kann nicht deaktiviert werden, solange Nummern aktiv sind! (7331105: aktive Nummern: 1)\''],
['133670-20080613-CA000908',	'EXECUTED',	'terminationExecution',  '',	'',	'7146686',	'2183012',	'23/02/2009.15:04:10',	'-1',	'Error updating subscriber (42240) \'4224: Kunde kann nicht deaktiviert werden, solange offene Portierungen existieren! (7146686: offene Portierungen: 1)\''],
['133670-20080515-CA000396',	'EXECUTED',	'terminationExecution',  '',	'',		'7340799',	'2536911',	'23/02/2009.15:03:46',	'-1',	'Error updating subscriber (42230) \'4223: Kunde kann nicht deaktiviert werden, solange Nummern aktiv sind! (7340799: aktive Nummern: 2)\''],
['133670-20080516-CA000488',	'EXECUTED',	'terminationExecution',	'',	'',	'6894437',	'1988240',	'23/02/2009.15:03:06',	'-1',	'Error updating subscriber (42230) \'4223: Kunde kann nicht deaktiviert werden, solange Nummern aktiv sind! (6894437: aktive Nummern: 2)\''],
['133670-20080603-CA000778',	'EXECUTED',	'terminationExecution',	'',	'',	'6790204',	'1003062',	'23/02/2009.15:02:37',	'-1',	'Error updating subscriber (42240) \'4224: Kunde kann nicht deaktiviert werden, solange offene Portierungen existieren! (6790204: offene Portierungen: 1)\''],
['133670-20080528-CA000178',	'EXECUTED',	'terminationExecution',	'',	'',	'7377793',	'2607220',	'23/02/2009.15:02:36',	'-1',	'Error updating subscriber (42230) \'4223: Kunde kann nicht deaktiviert werden, solange Nummern aktiv sind! (7377793: aktive Nummern: 1)\'']
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
					textinfo += "<td><span class='send' onclick='sendEvent(\""+datos[j][i]+"\","+j+")'>"+datos[j][i]+"<span></td>";	
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

	description.set(datos[desc][0]+": "+datos[desc][9]);
}

/*************************************************************************/
/*	Funciones para cubrir la funcionalidad del gadget		 */
/*************************************************************************/


