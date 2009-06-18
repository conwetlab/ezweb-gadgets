/*************************************************************************/
/*	Definicion de las variables de XML - Preferencias y Wirings	 */
/*	Definicion de variables globales				 */
/*	Definicion de los manejadores de las funciones			 */
/*************************************************************************/

var orderId = EzWebAPI.createRWGadgetVariable ('numBoletinOrigen');
var direccion = EzWebAPI.createRWGadgetVariable ('direccion');
var telefono = EzWebAPI.createRWGadgetVariable ('telefono');
var material = EzWebAPI.createRWGadgetVariable ('material');

/* Variables Globales */
var value = '';
var informacion = new StyledElements.StyledNotebook({'id':'informacion'});



var headers = ['Actuación',
				'Estado',
				'Boletín Origen',
				'NdA',
				'Tecnología',
				'Central',
				'Provincia',
				'Fecha Creación',
				'Técnico',
				'Teléfono Móvil',
				'Repuesto',
				'Material',
				'Autonomía GMO',
				'Observaciones',
				'Dirección'				
				];
			
var datos = [
['106984034','Retenida','INC-0000012153','9','CORRIENTE CONTINUA','--','ALBACETE','03/06/2009 13:43','--','--','elementos baterias','00671282','A3','03/06/2009 13:49:22 t125208 EGOT INDICA QUE SE RETENGA DE FALTA DE MATERIAL','Av de Pedro Manuel Vila, 7, 02600, Villarrobledo, Albacete, Castilla-La Mancha'],
['106811632','Retenida','INC-0000012155','9','EFICIENCIA ENERGETICA','--','ALBACETE','14/04/2009 2:22','--','--','AR4/AR3 y polímetro','00687916','A1','Incidencia generada por Omega-Energia FactorPotencia','Calle de los Mártires, 6, 02630, La Roda, Albacete, Castilla-La Mancha'],
['107021049','En Curso','INC-0000012157','28','S12','AL/ALBORAN V+TSED','ALMERIA','16/06/2009 9:06','PEREZ SALVADOR,ANGEL','618987034','50269348,LEN=3785;RIT=4 A 3 35;ALIC;671282,950269348,RUIDOS EN LINEA, AISLADO Y BIEN SITUADO, NO PRUEBA, VERIFY: TERMINA','00687588','A4','+++ OMEGA +++ No se han ejecutado comandos SCTSC REPU(75)ACTUACION GMO','AVDA. VILCHES, 20 , Almería, España'],
['107019326','En Curso','INC-0000012168','39','GigADSL','--','ALMERIA','15/06/2009 20:54','LOPEZ BISBAL,JUAN JOSE','679470902','VP/VC:8/32 NO SINCRONIZA LIM-HB-72.687916,LPM-72.687677,FILTRO-CORNING.687588,AMPER.687618,MONTSENY.687626,MONTSENY 687895','00687618','A4','OBSERVACIONES: 617715437 Francisco. Zyxel P660 inalambrico. WVista. Wifi. No sincroniza. Reinicio. Microfiltros ok. Cableado ok. RJ11 ok. No jalones pendientes. AF reciente. Linea de voz ok.16/06/2009 00:31:58 t116270 INFORMADO TECNICO. 16/06/2009 05:27:42 t116270 informa gmo., no tenemos router para sincronizar. se deja pendiente turno de mañana.','HOSPITAL TORRECARDENAS , Almería, España'],
['106980081','Retenida','INC-0000012170','9','RIMA','--','ALMERIA','02/06/2009 14:38','--','--','682039 ETHERNET Módulo Ethernet (4 puertos) TNT-SL-E100-ND-C','00687626','No','--','AV.MEDITERRÁNEO, 178 , Almería, España'],
['106941999','Retenida','INC-0000012177','9','RIMA','--','ALMERIA','25/05/2009 10:46','--','--','cod.telefonico: 682055 FUENTE D Fuente de alimentación DC TNT-SP-DC-H','00687405','No','--','CAMINO DE LOS MOLINOS,63 , Almería, España'],
['106885693','Retenida','INC-0000012174','9','MODULO DE ENERGIA','--','ALMERIA','06/05/2009 7:29','--','--','ETAPA DE MEDIDAS ANALOGICAS 6 P. 21 Y 22','00671282','A3','--','C/RAMIRO DE MAEZTU, S/N , Almería, España'],
['107019131','Adjudicada','INC-0000012164','28','P1000','DON BENITO P-1000','BADAJOZ','15/06/2009 19:40','CORDERO FUENTES,RAFAEL GUSTAVO','630019736','NO','00687432','A2','--','C/ESTACION, 7 , Almería, España'],
['107019226','En Curso','INC-0000012167','85','GigaADSL','--','BADAJOZ','15/06/2009 20:14','PARDO BANDA,FRANCISCO JAVIER','659518529','E1NT-C 687405, E1NC-C 687413, E1NC-C 687456, E1LT-B 687359, E1LC-C 687367','00682039','A1','15/06/2009 20:15:27 t135018 David.- Consultado EGOT. Se retiene para el T/M por ser ruta MIC.','PASEO SAN FRANCISCO, 10 Badajoz, España'],
['107019149','En Curso','INC-0000012158','28','P1000','DON BENITO P-1000','BADAJOZ','15/06/2009 19:47','CORDERO FUENTES,RAFAEL GUSTAVO','630019736','NO','00687341','A2','15/06/2009 19:49:07 t126289 Retenida a petición de egot','C/ZURBARAN 20 Badajoz, España']
];

var Ordenes = function() {
    /* Call to the parent constructor */
    EzWebGadget.call(this, {});
}

Ordenes.prototype = new EzWebGadget(); /* Extend from EzWebGadget */

Ordenes.prototype.resourcesURL = "http://ezwuc.hi.inet/repository/sdr/gaom"; 

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
					textinfo += "<td><span class='send' onclick='sendEvent("+j+")'>"+datos[j][i]+"<span></td>";	
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

function sendEvent(data_index){
	orderId.set(datos[data_index][2]);
	direccion.set(datos[data_index][14]);
	telefono.set(datos[data_index][09]);
	material.set(datos[data_index][11]);
}

/*************************************************************************/
/*	Funciones para cubrir la funcionalidad del gadget		 */
/*************************************************************************/


