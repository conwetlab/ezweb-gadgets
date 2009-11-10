/***************************************************************/
/*	Definition of XML gadget variables - Preferences & Wiring  */
/*	Definition of function handlers                            */
/***************************************************************/

var orderId = EzWebAPI.createRWGadgetVariable ('orderId');
var description = EzWebAPI.createRWGadgetVariable ('description');

var headers = [
	"id",
	"orderId",
	"resellerOrderId",
	"status",
	"deliveryDate",
	"workflowId",
	"retries",
	"errorDate",
	"code",
	"description",
	//"errorComment",
	"reseller"];
			

var Ordenes = function() {
    /* Call to the parent constructor */
    EzWebGadget.call(this, {});
}

Ordenes.prototype = new EzWebGadget(); /* Extend from EzWebGadget */

Ordenes.prototype.resourcesURL = "http://ezweb-ares.hi.inet/repository/TDe/OrdenesErrorSrv"; 

Ordenes.prototype.init = function() {
	
	var serviceURI = 'http://trabucco.hi.inet:8080/tdenewgui/es.tid.spci.gui.TDEGui/AsyncErrorService';
	EzWebAPI.send_get(serviceURI, this, success, error);
}

/* Instanciate the Gadget class */
Ordenes = new Ordenes();

function sendEvent(id, desc){
	orderId.set(id);
	description.set(id + ':' + desc);
}

function success(resp){
	var serviceResult = eval( '(' + resp.responseText + ')');
	
	if (serviceResult.data) {
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
		
		for (j=0;j<serviceResult.data.length;j++){
			if(j%2==0){
				textinfo += "<tr class='even'>";
			}else{
				textinfo += "<tr class='odd'>";
			}
					
			for(i=0;i<headers.length;i++){
				var cellData = eval('serviceResult.data[j].' + headers[i]);
				var descData = eval('serviceResult.data[j].' + headers[9]);
				if(i==1){
					textinfo += "<td><span class='send' onclick='sendEvent(\""+EzWebExt.escapeXML(cellData)+"\",\""+EzWebExt.escapeXML(descData)+"\")'>"+cellData+"<span></td>";	
				}else{
					textinfo += "<td>"+cellData+"</td>";
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

}

function error(resp){
	alert('Error accesing service');
}



