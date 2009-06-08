/*************************************************************************/
/*	Definicion de las variables de XML - Preferencias y Wirings	 */
/*	Definicion de variables globales				 */
/*	Definicion de los manejadores de las funciones			 */
/*************************************************************************/

var orderId = EzWebAPI.createRGadgetVariable ('orderId', orderId_handler);
var address = EzWebAPI.createRWGadgetVariable ('address');


/* Variables Globales */
var value = '';
var informacion = new StyledElements.StyledNotebook({'id':'informacion'});

var headers = ['Telefonica Subscriber Id',
				'Reseller Order Id',
				'Line Type',
				'Current TAL Carrier',
				'Status',
				'Order Status',
				'City',
				'Street',
				'House number',
				'Postal Code'];
									
				
var datos = {'133670-20061115-OR001369': ['302095',
				'1-FD1MZQ',
				'full unbundled',
				'T-com',
				'EXECUTED',
				'orderExecution',
				'Kiel',
				'Verdieckstr.',
				'35',
				'24149'
				],
			'133670-20080515-CA000396':	['2536911',	'1-1I3L0P2',	'full unbundled',	'T-Com',	'EXECUTED',	'terminationExecution',	'Hochheim',	'Schwedenstr.',	'9',	'65239'],
			'133670-20080516-CA000488':	['1988240',	'1-1I4HNUF',	'full unbundled',	'T-Com',	'EXECUTED',	'terminationExecution',	'Ludwigsburg',	'Neckarstr.',	'52',	'71640'],
			'133670-20080528-CA000178':	['2607220',	'1-1INTIAB',	'full unbundled',	'T-Com',	'EXECUTED',	'terminationExecution',	'Rosenheim',	'Sterzinger Str.',	'25',	'83024'],
			'133670-20080603-CA000778':	['1003062',	'1-1K3ER41',	'full unbundled',	'T-Com',	'EXECUTED',	'terminationExecution',	'Schriesheim',	'In der Schanz',	'43',	'69198'],
			'133670-20080613-CA000908':	['2183012',	'1-1LRGKXZ',	'full unbundled',	'T-Com',	'EXECUTED',	'terminationExecution',	'Werne',	'Dietrich-Bonhoeffer-Str.',	'16',	'59368'],
			'133670-20080804-CA000582':	['2507911',	'1-1RP0WZI',	'full unbundled',	'T-Com',	'EXECUTED',	'terminationExecution',	'Puttlingen',	'Professor-Hirschmann-Str.',	'53',	'66346'],
			'133670-20090423-OR000299':	['3942242',	'1-2HGNIZA',	'full unbundled',	'T-Com',	'EXECUTED',	'lineActivation',	'Neukirchen-Adorf',	'Hauptstr.',	'94',	'9221'],
			'133670-20090504-OR003791':	['3969339',	'1-2I9TNL9',	'full unbundled',	'T-Com',	'EXECUTED',	'lineActivation',	'Eichwalde',	'Lessingstr.',	'20',	'15732'],
			'133670-20090526-OR002298':	['4022495',	'1-2JSSGUS',	'full unbundled',	'T-Com',	'IN PROCESS',	'orderConfirmation',	'Stade',	'Wilhelm-Raabe-Str.',	'14',	'21680'],
			'133670-20090529-OR001996': ['4030799',	'1-2K230P7',	'full unbundled',	'T-Com', 	'IN PROCESS',	'orderConfirmation',	'Lutherstadt Wittenberg',	'Wiesigk',	'9',	'6886'],
			'133670-20080415-CA000397':	['2496087',	'1-1E3X8Y4',	'full unbundled',	'T-Com',	'EXECUTED',	'terminationExecution',	'Taunusstein',	'Am Haferstuck', '14',	'65232']			
}		

var Consulta = function() {
    /* Call to the parent constructor */
    EzWebGadget.call(this, {});
}

Consulta.prototype = new EzWebGadget(); /* Extend from EzWebGadget */

Consulta.prototype.resourcesURL = "http://jaimgec.hi.inet/repository/TDe/ConsultaOrden"; 

Consulta.prototype.init = function() {
	var header = document.createElement ('div');
	header.setAttribute ('id', 'header');
	var div1 = document.createElement ('div');
	div1.setAttribute ('class', 'text');
	document.body.appendChild(div1);
	
	var content = document.createElement('div');
	content.setAttribute ('id', 'content');
	document.body.appendChild (content);
	
		
	/*var textinfo = "<table align='center' cellspacing='2'>";
	
	for(i=0;i<headers.length;i++){
		if(i%2==0){
			textinfo += "<tr class='even'><th>"+headers[i]+"</th><td>"+datos['133670-20061003-ORD00016'][i]+"</td></tr>";
		}else{
			textinfo += "<tr class='odd'><th>"+headers[i]+"</th><td>"+datos['133670-20061003-ORD00016'][i]+"</td></tr>";
		}
		
	}	
	textinfo += "</table>";
	
	var info = document.createElement('div');
	info.setAttribute ('id', 'info');
	info.innerHTML = textinfo;*/
	
	//var tab1 = informacion.createTab ({'name':'133670-20061003-ORD00016'});
	//tab1.appendChild (info);
	//informacion.goToTab(tab1.getId());
	informacion.insertInto(document.getElementById('content'));	
	//address.set(datos['133670-20061003-ORD00016'][11] + ", " + datos['133670-20061003-ORD00016'][12] + ", " + datos['133670-20061003-ORD00016'][13] + ", " + datos['133670-20061003-ORD00016'][14]);
	
}

/* Instanciate the Gadget class */
Consulta = new Consulta();

function orderId_handler (value){
	
	
	var tab1 = informacion.createTab ({'name':value});

	
	var textinfo = "<table align='center' cellspacing='2'>";
	for(i=0;i<headers.length;i++){
		if(i%2==0){
			textinfo += "<tr class='even'><th>"+headers[i]+"</th><td>"+datos[value][i]+"</td></tr>";
		}else{
			textinfo += "<tr class='odd'><th>"+headers[i]+"</th><td>"+datos[value][i]+"</td></tr>";
		}
	}	
	textinfo += "</table>";
	
	var info = document.createElement('div');
	info.setAttribute ('id', 'info');
	info.innerHTML = textinfo;
	
	tab1.appendChild (info);
	
	informacion.goToTab(tab1.getId());
	
	address.set(datos[value][6] + ", " + datos[value][7] + " " + datos[value][8] + ", " + datos[value][9]); 
	
	
	
}

/*************************************************************************/
/*	Funciones para cubrir la funcionalidad del gadget		 */
/*************************************************************************/


