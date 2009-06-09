/*************************************************************************/
/*	Definicion de las variables de XML - Preferencias y Wirings	 */
/*	Definicion de variables globales				 */
/*	Definicion de los manejadores de las funciones			 */
/*************************************************************************/

var orderId = EzWebAPI.createRGadgetVariable ('orderId',orderId_handler);

/* Variables Globales */
var value = '';
var informacion = new StyledElements.StyledNotebook({'id':'informacion'});

var headers = ['Direction',
				'Workflow-Id',
				'MessageType',
				'Msg. Date',
				'ACK date'
				];

var datos = [['133670-20061115-OR001369',	'Incoming',	'617131',	'RESERVE_PORT',	'15/11/2006.19:00:41',	'15/11/2006.19:00:41'],
['133670-20061115-OR001369',		'Outgoing',	'617131',	'RESERVE_PORT',	'15/11/2006.19:00:45',	'15/11/2006.19:00:45'],
['133670-20061115-OR001369',		'Outgoing',	'650950',	'ORDER_PORT',	'23/11/2006.14:26:44',	'23/11/2006.14:26:44'],
['133670-20080415-CA000397',		'Incoming',	'3305583',	'HN.TerminatePort',	'15/04/2008.16:11:05',	'15/04/2008.16:11:05'],
['133670-20080415-CA000397',		'Outgoing',	'3305583',	'TERMINATE_PORT',	'15/04/2008.16:13:13',	'15/04/2008.16:13:13'],
['133670-20080415-CA000397',		'Incoming',	'3557048',	'HN.PortSwitchingConfirmation',	'31/05/2008.03:29:52',	'31/05/2008.03:29:52'],
['133670-20080415-CA000397',		'Outgoing',	'3557048',	'PORT_SWITCHING_CONFIRMATION',	'31/05/2008.03:55:24',	'31/05/2008.03:55:24'],
['133670-20080515-CA000396',		'Incoming',	'3476997',	'HN.TerminatePort',	'15/05/2008.14:33:22',	'15/05/2008.14:33:22'],
['133670-20080515-CA000396',		'Outgoing',	'3476997',	'TERMINATE_PORT',	'15/05/2008.14:35:09',	'15/05/2008.14:35:09'],
['133670-20080515-CA000396',		'Incoming',	'3720284',	'HN.PortSwitchingConfirmation',	'02/07/2008.05:35:23',	'02/07/2008.05:35:23'],
['133670-20080515-CA000396',		'Outgoing',	'3720284',	'PORT_SWITCHING_CONFIRMATION',	'02/07/2008.05:35:28',	'02/07/2008.05:35:28'],
['133670-20080516-CA000488',		'Incoming',	'3483506',	'HN.TerminatePort',	'16/05/2008.14:28:02',	'16/05/2008.14:28:02'],
['133670-20080516-CA000488',		'Outgoing',	'3483506',	'TERMINATE_PORT',	'16/05/2008.14:32:37',	'16/05/2008.14:32:37'],
['133670-20080516-CA000488',		'Incoming',	'3645752',	'HN.PortSwitchingConfirmation',	'17/06/2008.10:26:02',	'17/06/2008.10:26:02'],
['133670-20080516-CA000488',		'Outgoing',	'3645752',	'PORT_SWITCHING_CONFIRMATION',	'17/06/2008.11:26:13',	'17/06/2008.11:26:13'],
['133670-20080528-CA000178',		'Incoming',	'3540713',	'HN.TerminatePort',	'28/05/2008.11:10:42',	'28/05/2008.11:10:42'],
['133670-20080528-CA000178',		'Outgoing',	'3540713',	'TERMINATE_PORT',	'28/05/2008.11:18:05',	'28/05/2008.11:18:05'],
['133670-20080528-CA000178',		'Incoming',	'3581771',	'HN.PortSwitchingConfirmation',	'04/06/2008.00:02:52',	'04/06/2008.00:02:52'],
['133670-20080528-CA000178',		'Outgoing',	'3581771',	'PORT_SWITCHING_CONFIRMATION',	'04/06/2008.00:10:47',	'04/06/2008.00:10:47'],
['133670-20080603-CA000778',		'Incoming',	'3580159',	'HN.TerminatePort',	'03/06/2008.15:27:32',	'03/06/2008.15:27:32'],
['133670-20080603-CA000778',		'Outgoing',	'3580159',	'TERMINATE_PORT',	'03/06/2008.15:38:24',	'03/06/2008.15:38:24'],
['133670-20080603-CA000778',		'Incoming',	'3721090',	'HN.PortSwitchingConfirmation',	'02/07/2008.06:56:23',	'02/07/2008.06:56:23'],
['133670-20080603-CA000778',		'Outgoing',	'3721090',	'PORT_SWITCHING_CONFIRMATION',	'02/07/2008.06:56:30',	'02/07/2008.06:56:30'],
['133670-20080613-CA000908',		'Incoming',	'3636572',	'HN.TerminatePort',	'13/06/2008.18:25:12',	'13/06/2008.18:25:12'],
['133670-20080613-CA000908',		'Outgoing',	'3636572',	'TERMINATE_PORT',	'13/06/2008.18:25:13',	'13/06/2008.18:25:13'],
['133670-20080613-CA000908',		'Incoming',	'3873412',	'HN.PortSwitchingConfirmation',	'02/08/2008.06:56:55',	'02/08/2008.06:56:55'],
['133670-20080613-CA000908',		'Outgoing',	'3873412',	'PORT_SWITCHING_CONFIRMATION',	'02/08/2008.06:57:00',	'02/08/2008.06:57:00'],
['133670-20080804-CA000582',		'Incoming',	'3883121',	'HN.TerminatePort',	'04/08/2008.13:27:05',	'04/08/2008.13:27:05'],
['133670-20080804-CA000582',		'Outgoing',	'3883121',	'TERMINATE_PORT',	'04/08/2008.13:27:11',	'04/08/2008.13:27:11'],
['133670-20080804-CA000582',		'Incoming',	'3887090',	'HN.PortSwitchingConfirmation',	'05/08/2008.06:47:05',	'05/08/2008.06:47:05'],
['133670-20080804-CA000582',		'Outgoing',	'3887090',	'PORT_SWITCHING_CONFIRMATION',	'05/08/2008.06:47:10',	'05/08/2008.06:47:10'],
['133670-20090423-OR000299',		'Incoming',	'5186076',	'HN.ReservePort',	'23/04/2009.11:42:38',	'23/04/2009.11:42:38'],
['133670-20090423-OR000299',		'Outgoing',	'5186076',	'RESERVE_PORT',	'23/04/2009.11:42:42',	'23/04/2009.11:42:42'],
['133670-20090423-OR000299',		'Incoming',	'5259802',	'HN.OrderPort',	'11/05/2009.20:03:09',	'11/05/2009.20:03:09'],
['133670-20090423-OR000299',		'Outgoing',	'5259802',	'ORDER_PORT',	'11/05/2009.20:03:14',	'11/05/2009.20:03:14'],
['133670-20090423-OR000299',		'Outgoing',	'2,00905E+19',	'CreateVoipSubscriber',	'11/05/2009.20:03:32',	'11/05/2009.20:03:32'],
['133670-20090423-OR000299',		'Incoming',	'2,00905E+19',	'CreateVoipSubscriber',	'11/05/2009.20:03:40',	'11/05/2009.20:03:40'],
['133670-20090423-OR000299',		'Outgoing',	'2,00905E+19',	'CreateVoipSubscriber',	'13/05/2009.11:11:09',	'13/05/2009.11:11:09'],
['133670-20090423-OR000299',		'Incoming',	'2,00905E+19',	'CreateVoipSubscriber',	'13/05/2009.11:11:11',	'13/05/2009.11:11:11'],
['133670-20090423-OR000299',		'Outgoing',	'2,00905E+19',	'InsertPortedNumber',	'13/05/2009.11:11:13',	'13/05/2009.11:11:13'],
['133670-20090423-OR000299',		'Incoming',	'5280928',	'HN.PortSwitchingConfirmation',	'16/05/2009.14:25:59',	'16/05/2009.14:25:59'],
['133670-20090423-OR000299',		'Outgoing',	'5280928',	'PORT_SWITCHING_CONFIRMATION',	'16/05/2009.14:26:00',	'16/05/2009.14:26:00'],
['133670-20090423-OR000299',		'Incoming',	'2,00905E+19',	'InsertPortedNumber',	'26/05/2009.11:55:33',	'26/05/2009.11:55:33'],
['133670-20090504-OR003791',		'Incoming',	'5230156',	'HN.ReservePort',	'04/05/2009.18:29:49',	'04/05/2009.18:29:49'],
['133670-20090504-OR003791',		'Outgoing',	'5230156',	'RESERVE_PORT',	'04/05/2009.18:29:52',	'04/05/2009.18:29:52'],
['133670-20090504-OR003791',		'Incoming',	'5266484',	'HN.OrderPort',	'13/05/2009.11:50:29',	'13/05/2009.11:50:29'],
['133670-20090504-OR003791',		'Outgoing',	'5266484',	'ORDER_PORT',	'13/05/2009.11:50:34',	'13/05/2009.11:50:34'],
['133670-20090504-OR003791',		'Outgoing',	'2,00905E+19',	'CreateVoipSubscriber',	'13/05/2009.11:50:57',	'13/05/2009.11:50:57'],
['133670-20090504-OR003791',		'Incoming',	'2,00905E+19',	'CreateVoipSubscriber',	'13/05/2009.11:50:59',	'13/05/2009.11:50:59'],
['133670-20090504-OR003791',		'Outgoing',	'2,00905E+19',	'InsertPortedNumber',	'13/05/2009.11:51:01',	'13/05/2009.11:51:01'],
['133670-20090504-OR003791',		'Incoming',	'5272255',	'HN.PortSwitchingConfirmation',	'14/05/2009.15:21:59',	'14/05/2009.15:21:59'],
['133670-20090504-OR003791',		'Outgoing',	'5272255',	'PORT_SWITCHING_CONFIRMATION',	'14/05/2009.15:22:00',	'14/05/2009.15:22:00'],
['133670-20090504-OR003791',		'Incoming',	'2,00905E+19',	'InsertPortedNumber',	'26/05/2009.11:57:29',	'26/05/2009.11:57:29'],
['133670-20090526-OR002298',		'Incoming',	'5316720',	'HN.ReservePort',	'26/05/2009.15:37:19',	'26/05/2009.15:37:19'],
['133670-20090526-OR002298',		'Outgoing',	'5316720',	'RESERVE_PORT',	'26/05/2009.15:37:23',	'26/05/2009.15:37:23'],
['133670-20090526-OR002298',		'Incoming',	'5352395',	'HN.OrderPort',	'03/06/2009.22:25:42',	'03/06/2009.22:25:42'],
['133670-20090526-OR002298',		'Outgoing',	'5352395',	'ORDER_PORT',	'03/06/2009.22:25:45',	'03/06/2009.22:25:45'],
['133670-20090526-OR002298',		'Outgoing',	'2,00906E+19',	'CreateVoipSubscriber',	'03/06/2009.22:26:07',	'03/06/2009.22:26:07'],
['133670-20090526-OR002298',		'Incoming',	'2,00906E+19',	'CreateVoipSubscriber',	'03/06/2009.22:26:08',	'03/06/2009.22:26:08'],
['133670-20090526-OR002298',		'Outgoing',	'2,00906E+19',	'InsertPortedNumber',	'03/06/2009.22:26:09',	'03/06/2009.22:26:09'],
['133670-20090526-OR002298',		'Incoming',	'2,00906E+19',	'InsertPortedNumber',	'03/06/2009.22:26:11',	'03/06/2009.22:26:11'],
['133670-20090526-OR002298',		'Outgoing',	'2,00906E+19',	'InsertPortedNumber',	'04/06/2009.08:24:12',	'04/06/2009.08:24:12'],
['133670-20090526-OR002298',		'Incoming',	'2,00906E+19',	'InsertPortedNumber',	'04/06/2009.08:24:13',	'04/06/2009.08:24:13'],
['133670-20090529-OR001996',		'Incoming',	'5331004',	'HN.ReservePort',	'29/05/2009.14:44:29',	'29/05/2009.14:44:29'],
['133670-20090529-OR001996',		'Outgoing',	'5331004',	'RESERVE_PORT',	'29/05/2009.14:44:33',	'29/05/2009.14:44:33'],
['133670-20090529-OR001996',		'Incoming',	'5358522',	'HN.OrderPort',	'05/06/2009.11:14:03',	'05/06/2009.11:14:03'],
['133670-20090529-OR001996',		'Outgoing',	'5358522',	'ORDER_PORT',	'05/06/2009.11:14:08',	'05/06/2009.11:14:08'],
['133670-20090529-OR001996',		'Outgoing',	'2,00906E+19',	'CreateVoipSubscriber',	'05/06/2009.11:14:26',	'05/06/2009.11:14:26'],
['133670-20090529-OR001996',		'Incoming',	'2,00906E+19',	'CreateVoipSubscriber',	'05/06/2009.11:14:27',	'05/06/2009.11:14:27']
];



var ConsultaMensaje = function() {
    /* Call to the parent constructor */
    EzWebGadget.call(this, {});
}

ConsultaMensaje.prototype = new EzWebGadget(); /* Extend from EzWebGadget */

ConsultaMensaje.prototype.resourcesURL = "http://jaimegc.hi.inet/repository/TDe/OrdenesError"; 

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
			textinfo += "<th><span class='view'>Message</span></th>";
			textinfo += "<th><span class='view'>Message Ack</span></th>";
			textinfo +"</tr>";
			textinfo +="</tr>";
	
	/*for (j=0;j<datos.length;j++){
		if(j%2==0){
			textinfo += "<tr class='even'>";
		}else{
			textinfo += "<tr class='odd'>";
		}
				
		for(i=0;i<headers.length-2;i++){
			textinfo += "<td>"+datos[j][i]+"</td>";
		}
		
		textinfo += "<td><span class='view'>Message</span></td>";
		textinfo += "<td><span class='view'>Message Ack</span></td>";
		textinfo +"</tr>";
		
	}	*/
	textinfo += "</table>";
	
	var info = document.createElement('div');
	info.setAttribute ('id', 'info');
	info.innerHTML = textinfo;
	
	content.appendChild(info);
	
	
}

/* Instanciate the Gadget class */
ConsultaMensaje = new ConsultaMensaje();

function orderId_handler (value){
	var textinfo = "";
	textinfo +="<table align='center' cellspacing='2'><caption style='font-size:10pt;font-style:italic;font-weight:bold;'q>"+value+"</caption>";
			textinfo +="<tr>";
			for(i=0;i<headers.length;i++){
					textinfo += "<th>"+headers[i]+"</th>";
			}	
			textinfo += "<th><span class='view'>Message</span></th>";
			textinfo += "<th><span class='view'>Message Ack</span></th>";
			textinfo +"</tr>";
			textinfo +="</tr>";
	for (j=0;j<datos.length;j++){
		if(datos[j][0]==value){
			if(j%2==0){
				textinfo += "<tr class='even'>";
			}else{
				textinfo += "<tr class='odd'>";
			}
			
			
			for(i=0;i<headers.length;i++){
				textinfo += "<td>"+datos[j][i+1]+"</td>"
			}
			
			textinfo += "<td><span class='view'>View</span></td>";
			textinfo += "<td><span class='view'>View</span></td>";
			textinfo +"</tr>";
			
		}
	}
	textinfo += "</table>";
	document.getElementById('info').innerHTML = textinfo;
	
}

/*************************************************************************/
/*	Funciones para cubrir la funcionalidad del gadget		 */
/*************************************************************************/


