/**************************************************************************************************
 * Autor: Enric Mogas Nonell                                                                      *
 * Compañía: Intercom Factory, S.L.                                                               *
 * ---------------------------------------------------------------------------------------------- *
 * Componente: Gadget Display e Impresión para la plataforma EzWeb                                *
 * Fecha de Creación: 19-Nov-2008                                                                 *
 **************************************************************************************************/



/**************************************************************************************************
 * CLASE GadgetDisplayImpresion                                                                   *
 **************************************************************************************************/
function GadgetDisplayImpresion() {
    }

    // Variables del GadgetDisplayImpresion
    GadgetDisplayImpresion.ezXmlURL = null;
    GadgetDisplayImpresion.ezXslURL = null;
    GadgetDisplayImpresion.ezDatos  = null;
    GadgetDisplayImpresion.ezEstilo = null;
    GadgetDisplayImpresion.ezAccion = null;
    GadgetDisplayImpresion.URLDatos = "";
    GadgetDisplayImpresion.URLEstilo = "";
    GadgetDisplayImpresion.datos = "";
    GadgetDisplayImpresion.estilo = "";
    GadgetDisplayImpresion.accion = "";

    // Funcion de inicialización. Crea los gestores de eventos para controlar
    //   las preferencias y ranuras
    GadgetDisplayImpresion.inicializar = function() {
        this.ezXmlURL = EzWebAPI.createRGadgetVariable("xmlURL", this.setXmlURL);
        this.ezXslURL = EzWebAPI.createRGadgetVariable("xslURL", this.setXslURL);
        this.ezDatos  = EzWebAPI.createRGadgetVariable("datos",  this.setDatos);
        this.ezEstilo = EzWebAPI.createRGadgetVariable("estilo", this.setEstilo);
        this.ezAccion = EzWebAPI.createRGadgetVariable("accion", this.setAccion);
        this.setXmlURL(this.ezXmlURL.get());
        this.setXslURL(this.ezXslURL.get());
        }

    // Cambia la URL de datos del gadget y procede a ajustar la parte visual
    GadgetDisplayImpresion.setXmlURL = function(texto) {
        this.URLDatos = texto;
        if((this.URLDatos!="") && (typeof(this.URLDatos)!='undefined'))
            EzWebAPI.send_get(this.URLDatos, this, this._setContenidoDatosHandler, this._setContenidoDatosErrorHandler);
        }

    // Cambia la URL de la hoja de estilo XSL del gadget y procede a ajustar la
    //   parte visual
    GadgetDisplayImpresion.setXslURL = function(texto) {
        this.URLEstilo = texto;
        if((this.URLEstilo!="") && (typeof(this.URLEstilo)!='undefined'))
            EzWebAPI.send_get(this.URLEstilo, this, this._setContenidoEstiloHandler, this._setContenidoEstiloErrorHandler);
        }

    // Cambia los datos del gadget de forma directa (no por URL) y procede a
    //   ajustar la parte visual
    GadgetDisplayImpresion.setDatos = function(texto) {
        if(texto!="") {
            var parser = new DOMParser();
            this.datos = parser.parseFromString(texto, "text/xml");
            _ajustarHTML();
            }
        } 

    // Cambia la hoja de estilo XSL del gadget de forma directa (no por URL) y
    //   procede a ajustar la parte visual
    GadgetDisplayImpresion.setEstilo = function(texto) {
        if(texto!="") {
            var parser = new DOMParser();
            this.estilo = parser.parseFromString(texto, "text/xml");
            _ajustarHTML();
            }
        }

    // Gestiona las acciones provinientes de la ranura accion
    GadgetDisplayImpresion.setAccion = function(texto) {
        // Solicitan la impresion del contenido
        if(texto=="print") {
            var html = $("gdi_datos").innerHTML;
            var ventanaImpresion = window.open('about:blank', 'Ventana de Impresión');
            ventanaImpresion.document.documentElement.innerHTML = html;
            ventanaImpresion.document.close();
            ventanaImpresion.print();
            ventanaImpresion.close();
            return;
            }
        // Solicitan actualizar los datos y estilo del gadget
        if(texto=="actualizar") {
            this.setXmlURL(this.ezXmlURL.get());
            this.setXslURL(this.ezXslURL.get());
            }
        }

    // Ajusta el contenido del gadget aplicando la transformación de la hoja de 
    // estilos a los datos, ya sean provinientes de forma directa o bien a 
    // partir de URLs
    GadgetDisplayImpresion._ajustarHTML = function() {
        if((this.datos!="") &&(this.estilo!="")) {
            var xsltProc  = new XSLTProcessor();
            xsltProc.importStylesheet(this.estilo);
            var htmlDoc = xsltProc.transformToDocument(this.datos, document);
            $("gdi_datos").innerHTML = htmlDoc.body.innerHTML;
            }
        }

    // Gestores de eventos para la recepción del documento XML
    GadgetDisplayImpresion._setContenidoDatosHandler = function(respuesta) {
        this.datos = respuesta.responseXML;
        this._ajustarHTML();
        }
    GadgetDisplayImpresion._setContenidoDatosErrorHandler = function(respuesta) {
        this.datos = "";
        this._ajustarHTML();
        }

    // Gestores de eventos para la recepción del documento XSL
    GadgetDisplayImpresion._setContenidoEstiloHandler = function(respuesta) {
        this.estilo = respuesta.responseXML;
        this._ajustarHTML();
        }
    GadgetDisplayImpresion._setContenidoEstiloErrorHandler = function(respuesta) {
        this.estilo = "";
        this._ajustarHTML();
        }
