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
				'Reseller Subscriber Id',
				'Reseller Order Id',
				'Line Type',
				'Current TAL Carrier',
				'Status',
				'Order Status',
				'Fax out to DTAG',
				'Fax DTAG in',
				'Confirmed Date',
				'Real Delivery Date',
				'City',
				'Street',
				'Number',
				'CP'];
				
var datos = {'133670-20061003-ORD00016': ['3383',
				'',
				'ANAIS-HANSENET-60083',
				'port-only',
				'T-com',
				'IN PROCESS',
				'orderConfirmation',
				'',
				'',
				'03/10/2006',
				'',
				'Madrid',
				'C/ Emilio Vargas',
				'6',
				'28080'],
			'133670-20061003-ORD00006': ['2316',
				'',
				'ANAIS-HANSENET-12327',
				'port-only',
				'T-com',
				'WAITING',
				'orderConfirmation',
				'',
				'',
				'21/05/2008',
				'',
				'Barcelona',
				'Via Augusta',
				'117',
				'08021'],
			'133670-20061003-ORD00005': ['4312',
				'',
				'ANAIS-HANSENET-12327',
				'port-only',
				'T-com',
				'IN PROCESS',
				'orderConfirmation',
				'',
				'',
				'21/05/2008',
				'',
				'Madrid',
				'Paseo Castellana',
				'134',
				'28082'],	
			'133670-20061003-ORD00003': ['2515',
				'',
				'ANAIS-HANSENET-12327',
				'port-only',
				'T-com',
				'IN PROCESS',
				'orderConfirmation',
				'',
				'',
				'21/05/2008',
				'',
				'Madrid',
				'Paseo Castellana',
				'134',
				'28082'],		
			'133670-20061003-ORD00002': ['1312',
				'',
				'ANAIS-HANSENET-12327',
				'port-only',
				'T-com',
				'IN PROCESS',
				'orderConfirmation',
				'',
				'',
				'21/05/2008',
				'',
				'Madrid',
				'Paseo Castellana',
				'134',
				'28082'],		
			'133670-20060928-ORD00012': ['5273',
				'',
				'ANAIS-HANSENET-12327',
				'port-only',
				'T-com',
				'IN PROCESS',
				'orderConfirmation',
				'',
				'',
				'22/03/2008',
				'',
				'Madrid',
				'Paseo Castellana',
				'134',
				'28082'],		
				};
				
				

var Consulta = function() {
    /* Call to the parent constructor */
    EzWebGadget.call(this, {});
}

Consulta.prototype = new EzWebGadget(); /* Extend from EzWebGadget */

Consulta.prototype.resourcesURL = "http://jaimgc.hi.inet/repository/TDe/ConsultaOrden"; 

Consulta.prototype.init = function() {
	var header = document.createElement ('div');
	header.setAttribute ('id', 'header');
	var div1 = document.createElement ('div');
	div1.setAttribute ('class', 'text');
	document.body.appendChild(div1);
	
	var content = document.createElement('div');
	content.setAttribute ('id', 'content');
	document.body.appendChild (content);
	
		
	var textinfo = "<table align='center' cellspacing='2'>";
	
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
	info.innerHTML = textinfo;
	
	var tab1 = informacion.createTab ({'name':'133670-20061003-ORD00016'});
	tab1.appendChild (info);
	informacion.goToTab(tab1.getId());
	informacion.insertInto(document.getElementById('content'));	
	address.set(datos['133670-20061003-ORD00016'][11] + ", " + datos['133670-20061003-ORD00016'][12] + ", " + datos['133670-20061003-ORD00016'][13] + ", " + datos['133670-20061003-ORD00016'][14]);
	
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
	
	address.set(datos[value][11] + ", " + datos[value][12] + " " + datos[value][13] + ", " + datos[value][14]); 
	
	
	
}

/*************************************************************************/
/*	Funciones para cubrir la funcionalidad del gadget		 */
/*************************************************************************/


