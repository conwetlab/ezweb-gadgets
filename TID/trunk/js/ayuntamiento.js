params="width=1024, height=768, toolbar=yes, status=yes, titlebar=yes, menubar=yes, localtion=yes, directories=yes, resizable=yes, scrollbars=yes";

var tablaFarmacias;

function getXMLDocument( ajax )
{
	if (typeof DOMParser == "undefined") 
	{
                DOMParser = function()
                {};

                DOMParser.prototype.parseFromString = function(str, contentType)
                {
                        if (typeof ActiveXObject != "undefined") {
                                var doc = new ActiveXObject("MSXML.DomDocument");
                                doc.loadXML(str);
                                return doc;
                        } else if ( typeof XMLHttpRequest != "undefined" ) {
                                var req = new XMLHttpRequest();
                                req.open("GET", "data:" + (contentType || "application/xml") + ";charset=utf-8," + encodeURIComponent(str), false);
                                if ( req.overrideMimeType )
                                        req.overrideMimeType(contentType);
                                req.send(null);
                                return req.responseXML;
                        } else
                                throw new FatalException( "Can't find a valid xml parser", "AJAX::getXMLDocument()" );
                }
        }


	var str = ajax.responseText;
	//str = str.replace(/(<meta[^>]+[^\/])>/ig, "$1/>");
	//str = str.replace(/(<img[^>]+[^\/])>/ig, "$1/>");

	//str = str.replace(/(<body[^>]+[^\/])>/ig, "$1/>");
	//str = str.replace(/(<html[^>]+[^\/])>/ig, "$1/>");

	// Filtro para Trafico
	//str = str.replace(/id="banner"/g, "");
	//str = str.replace(/target="_blank"/g, "onclick=\"this.target = '_blank';\"");
	
        var strDocument = str;
        var xmlDocument = ajax.responseXML;
        try {
                if( ! xmlDocument || xmlDocument.childNodes.length === 0 )
                        xmlDocument = (new DOMParser()).parseFromString( strDocument, "text/xml" );
                return xmlDocument;
        } catch( e ) {
                return null;
        }
} 

function muestraErrorNoticias(respuesta)
{
	alert("Error: " + respuesta.responseText);
}

function muestraMensajeNoticias(respuesta)
{
	var doc = getXMLDocument(respuesta);
	var noticias = $('noticias');
	//var noticiasHome = doc.getElementById('noticiasHome');

	noticias.innerHTML = doc.documentElement.innerHTML;
	//noticias.innerHTML = noticiasHome.innerHTML;
}

function muestraNoticias()
{
	//EzWebAPI.send_get("http://www.google.es", this, muestraMensajeNoticias, muestraErrorNoticias);
	//EzWebAPI.send_get("http://www.ayto-navalcarnero.es/navalcarnero/opencms/site/web/portada", this, muestraMensajeNoticias, muestraErrorNoticias);
	EzWebAPI.send_get("http://28fmx080220x", this, muestraMensajeNoticias, muestraErrorNoticias);
}

function muestraErrorElTiempo(respuesta)
{
        alert("Error el tiempo: " + respuesta.responseText);
}

function muestraMensajeElTiempo(respuesta)
{
        var doc = getXMLDocument(respuesta);

        var tiempo = $('tiempo');
	var contenedor_tiempo = doc.getElementsByClassName("contenedor_central_izq")[0];

	var codigo = contenedor_tiempo.innerHTML.replace(/\/imagenes/g, "http://localhost/repository/images");
        tiempo.innerHTML = codigo;
}

function muestraElTiempo()
{
        EzWebAPI.send_get("http://www.aemet.es/es/eltiempo/prediccion/localidades?l=28470&p=28", this, muestraMensajeElTiempo, muestraErrorElTiempo);
}

function muestraErrorAutobuses(respuesta)
{
        alert("Error autobuses: " + respuesta.responseText);
}

function muestraMensajeAutobuses(respuesta)
{
        var doc = getXMLDocument(respuesta);

        var autobuses = $('autobuses');
        var contenedor_autobuses = doc.documentElement.getElementsByClassName("content")[0];

        var codigo = contenedor_autobuses.innerHTML.replace(/\/imagenes/g, "http://localhost/repository/images");
        autobuses.innerHTML = codigo;
}

function muestraAutobuses()
{
        EzWebAPI.send_get("http://www.ctm-madrid.es/servlet/RedTransServlet?xh_TIPO=32&xh_ACCION=0&xh_TIPO_SEL=T&CODPANTALLA=12&xh_CLAVE=096000%23Navalcarnero&x=42&y=16", this, muestraMensajeAutobuses, muestraErrorAutobuses);
}

function muestraErrorCercanias(respuesta)
{
        alert("Error cercanias: " + respuesta.responseText);
}

function muestraMensajeCercanias(respuesta)
{
        var doc = getXMLDocument(respuesta);

        var cercanias = $('cercanias');
        var contenedor_cercanias = doc.documentElement.getElementsByClassName("TA")[0];

        var codigo = contenedor_cercanias.innerHTML.replace(/\/imagenes/g, "http://localhost/repository/images");
        cercanias.innerHTML = codigo;
}

function muestraCercanias()
{
        EzWebAPI.send_get("http://horarios.renfe.es/cer/hjcer300.jsp?NUCLEO=10", this, muestraMensajeCercanias, muestraErrorCercanias);
}

function muestraErrorFarmacia(respuesta)
{
        alert("Error farmacia: " + respuesta.responseText);
}

function muestraMensajeFarmacia(respuesta)
{
        var doc = getXMLDocument(respuesta);

        var farmacia = $('farmacia');
        var contenedor_farmacia = doc.documentElement.getElementsByClassName("listado_tipo1")[0];

        var codigo = contenedor_farmacia.innerHTML.replace(/\/imagenes/g, "http://localhost/repository/images");

	var dl = contenedor_farmacia.getElementsByTagName("dl");
	if (dl != undefined)
	{
		var dt = dl[0].getElementsByTagName("dt");
		var num_farmacias = dt.length;

		tablaFarmacias = new Array(num_farmacias);

		for (i=0; i<num_farmacias; i++)
		{
			tablaFarmacias[i] = new Array(2);
			tablaFarmacias[i][0] = dt[i].lastChild.nodeValue.replace(/\n/g, "");
		}

		var dd = dl[0].getElementsByTagName("dd");
		for (i=0; i<num_farmacias; i++)
                {
			tablaFarmacias[i][0] += dd[i].childNodes[2].nodeValue.replace(/\n/g, "") + dd[i].childNodes[5].nodeValue.replace(/\n/g, "");

			if (dd[i].childNodes.length > 7)
			{
				tablaFarmacias[i][1] = dd[i].childNodes[7].lastChild.nodeValue.replace(/\n/g, "");
			}
			else
			{
				tablaFarmacias[i][1] = "";
			}
                }

	        // Farmacias
        	mHTML = "<table id=\"Farmacias\" class=\"listTable\">" + "\n";
		mHTML += "\t" + "<th>" + "Farmacias" + "</th>" + "\n";
		mHTML += "\t" + "<th>" + "Observaciones" + "</th>" + "\n";
		for (indice=0; indice<num_farmacias; indice++)
        	{
			var fila = indice+1;

			mHTML += "<tr id=\"" + fila + "\">" + "\n";
			mHTML += "\t\t" + "<td>" + tablaFarmacias[indice][0] + "</td>" + "\n";
			mHTML += "\t\t" + "<td>" + tablaFarmacias[indice][1] + "</td>" + "\n";
                        mHTML += "</tr>" + "\n";
        	}

		mHTML += "</table>"

        	farmacia.innerHTML = mHTML;

		FarmaciasListTable = new ListTable('Farmacias','Farmacias.action');
	}
}

function muestraFarmacia()
{
        EzWebAPI.send_post("http://www.cofm.es/index.asp?MP=2&MS=15&MN=2", "accion=si&lanzamiento=buscador&municipio=NAVALCARNERO", this, muestraMensajeFarmacia, muestraErrorFarmacia);
}

function muestraErrorTrafico(respuesta)
{
        alert("Error trafico: " + respuesta.responseText);
}

function muestraMensajeTrafico1(respuesta)
{
        var doc = getXMLDocument(respuesta);

        var trafico1 = $('trafico1');
        var contenedor_trafico = doc.documentElement.getElementsByClassName("cuadroCentral");

        var codigo = contenedor_trafico.innerHTML.replace(/\/imagenes/g, "http://localhost/repository/images");
        trafico1.innerHTML = codigo;
}

function muestraMensajeTrafico2(respuesta)
{
        var doc = getXMLDocument(respuesta);

        var trafico2 = $('trafico2');
        var contenedor_trafico = doc.documentElement.getElementsByClassName("cuadroCentral");

        var codigo = contenedor_trafico.innerHTML.replace(/\/imagenes/g, "http://localhost/repository/images");
        trafico2.innerHTML = codigo;
}

function muestraTrafico()
{
        EzWebAPI.send_get("http://www.dgt.es/portal/es/informacion_carreteras/camaras_trafico/camaras035.htm", this, muestraMensajeTrafico1, muestraErrorTrafico);
        EzWebAPI.send_get("http://www.dgt.es/portal/es/informacion_carreteras/camaras_trafico/camaras036.htm", this, muestraMensajeTrafico2, muestraErrorTrafico);
}

