/**************************************************************************************************
 * Autor: Enric Mogas Nonell                                                                      *
 * Compañía: Intercom Factory, S.L.                                                               *
 * ---------------------------------------------------------------------------------------------- *
 * Componente: Gadget Búsquedas para la plataforma EzWeb                                          *
 * Fecha de Creación: 18-Sep-2008                                                                 *
 **************************************************************************************************/



// Constantes Globales
Columna.ORDEN_Ascendente = 1;
Columna.ORDEN_Ninguno = 0;
Columna.ORDEN_Descendente = -1;



/**************************************************************************************************
 * CLASE Columna                                                                                  *
 **************************************************************************************************/
function Columna(Nombre, Titulo, Clave) {
	this.Nombre = Nombre;
	this.Titulo = Titulo;
	this.Clave = Clave;
	}

	Columna.prototype.Nombre = "";
	Columna.prototype.Titulo = "";
	Columna.prototype.Clave = false;
	Columna.prototype.Visible = false;
	Columna.prototype.Peso = 0;
	Columna.prototype.Orden = Columna.ORDEN_Ninguno;
	Columna.prototype.PesoOrden = 0;



/**************************************************************************************************
 * CLASE GadgetBusquedas                                                                          *
 **************************************************************************************************/
function GadgetBusquedas() {
    }

    //
	// Constantes de la clase GadgetBusquedas
    // Constantes para el control del estado del gadget
	GadgetBusquedas.INICIAL = 0;
	GadgetBusquedas.IDENTIFICANDO_ORIGEN = 1;
	GadgetBusquedas.CONFIGURANDO = 2;
	GadgetBusquedas.CARGANDO = 3;
	GadgetBusquedas.FILTRANDO = 4;
	GadgetBusquedas.CARGADO = 5;

	// Variables de la clase GadgetBusquedas
	GadgetBusquedas.Estado = -1;
	GadgetBusquedas.EzWebAPI = null;
	GadgetBusquedas.URL = "";
	GadgetBusquedas.ezURL = null;
	GadgetBusquedas.Filtro = "";
	GadgetBusquedas.ezFiltro = null;
	GadgetBusquedas.ezSeleccionado = null;
	GadgetBusquedas.Nombre = "";
	GadgetBusquedas.Descripcion = "";
	GadgetBusquedas.MensajeFiltro = "";
	GadgetBusquedas.Columnas = new Array();
	GadgetBusquedas.Ordenes = new Array();

	// Métodos de la clase GadgetBusquedas
	// Inicializa el estado del Gadget
	GadgetBusquedas.inicializar = function() {
		// Cambiamos al estado INICIAL para ajustar los elementos visuales del Gadget
		this._cambiarEstado(this.INICIAL);

		// Asignamos los objetos necesarios de para trabajar
		this.EzWebAPI = new _EzWebAPI();

		// Asignamos los datos iniciales
		this.ezURL = this.EzWebAPI.createRGadgetVariable("url", this._urlChangedHandler);
		this.ezDsURL = this.EzWebAPI.createRGadgetVariable("dsURL", this._urlChangedHandler);
		this.ezFiltro = this.EzWebAPI.createRGadgetVariable("filtro", this._filtroHandler);
		this.ezSeleccionado = this.EzWebAPI.createRWGadgetVariable("seleccionado");
        this._urlChangedHandler(this.ezURL.get());
		}

	// Ajustamos el estado del gadget controlando su aspecto
    GadgetBusquedas._cambiarEstado = function(NuevoEstado) {
		switch(NuevoEstado) {
		case this.INICIAL:
		case this.IDENTIFICANDO_ORIGEN:
            $$(".espera").each(Element.show);
            $$(".configuracion").each(Element.hide);
			$$(".visualizacion").each(Element.hide);
            break;

		case this.CONFIGURANDO:
            $$(".configuracion").each(Element.show);
			$$(".espera").each(Element.hide);
            $$(".visualizacion").each(Element.hide);
			break;

		case this.CARGADO:
            $$(".visualizacion").each(Element.show);
			$$(".espera").each(Element.hide);
			$$(".configuracion").each(Element.hide);
			break;
			}

		// Cambiamos la variable de estado
		this.Estado = NuevoEstado;

        // Realizamos las Acciones Post Cambio
		switch(NuevoEstado) {
		case this.IDENTIFICANDO_ORIGEN:
            this._solicitarMetadatos();
			break;

		case this.CONFIGURANDO:
            this._paintConfiguracion();
			break;

		case this.CARGANDO:
			this._solicitarDatos();
			break;

		case this.FILTRANDO:
            this._filtrar();
            this._cambiarEstado(this.CARGADO);
			break;

		case this.CARGADO:
            this._paint();
			break;
			}
		}

	// Gestor de eventos para la recepción de la URL via REST
	GadgetBusquedas._urlChangedHandler = function(urlString) {
		if(urlString!=null && typeof(urlString)!="undefined") {
			GadgetBusquedas.URL = urlString;
            GadgetBusquedas._cambiarEstado(GadgetBusquedas.IDENTIFICANDO_ORIGEN);
			}
		}

	// Solicita los metadatos (información de la estructura de la tabla
	GadgetBusquedas._solicitarMetadatos = function() {
		// Realizamos la petición de datos via REST
        if(this.URL != "" && typeof(this.URL) != "undefined") {
            this.EzWebAPI.send_get(this.URL + "/metadata", this, this._metadataHandler, this._metadataErrorHandler);
			}
    	}

	// Gestor de eventos para la recepción de los metadatos de la tabla de búsqueda
	GadgetBusquedas._metadataHandler = function(data) {
	    var configuracion = eval('('+data.responseText+')');
	    this.Nombre = configuracion.nombre;
	    this.Descripcion = configuracion.descripcion;
	    this.MensajeFiltro = configuracion.mensajeFiltro;
        this.Columnas = new Array();

	    for(var contador=0; contador<configuracion.columnas.size(); contador++) {
            // Gestionamos las columnas
            var columnaActual = configuracion.columnas[contador];
	    	var columna = new Columna(columnaActual.nombre, columnaActual.cabecera, columnaActual.clave);
	    	columna.Visible = columnaActual.visible;
	    	columna.Tipo = columnaActual.tipo;
            switch(columnaActual.alineacion) {
            case "derecha":
                columna.Alineacion = "right";
                break;
            case "centro":
                columna.Alineacion = "center";
                break;
            case "justificado":
                columna.Alineacion = "justify";
                break;
            default:
                columna.Alineacion = "left";
                break;
                }
	    	columna.Peso = columnaActual.peso;
            switch(columnaActual.orden) {
            case "ascendente":
                columna.Orden = Columna.ORDEN_Ascendente;
                break;
            case "descendente":
                columna.Orden = Columna.ORDEN_Descendente;
                break;
            default:
                columna.Orden = Columna.ORDEN_Ninguno;
                break;
                }
	    	columna.PesoOrden = columnaActual.pesoOrden;
	    	this.Columnas.push(columna);
	    	}
        this._cambiarEstado(this.CONFIGURANDO);
        }

	// Gestor de eventos para la recepción de los errores en la recepción de metadatos
	GadgetBusquedas._metadataErrorHandler = function(data) {
        alert("Ha habido un error al recuperar LA ESTRUCTURA del origen de información");
	    this._cambiarEstado(this.INICIAL);
		}

    GadgetBusquedas._paintConfiguracion = function() {
        if(this.Estado==this.CONFIGURANDO) {
            var tabla = $("gb_configuracion_tabla").tBodies[0];
            var ultimaFila = 0;

            // Borramos las filas preexistentes
            tabla.innerHTML = "";

            for(var contador=0; contador<this.Columnas.size(); contador++) {
                // Añadimos cada columna como una fila de la tabla de configuración
                var columna = this.Columnas[contador];
                fila = tabla.insertRow(ultimaFila++);
                fila.columna_id = contador;
                fila.peso = columna.Peso;
                celda = fila.insertCell(0);
                celda.innerHTML = columna.Nombre;
                celda = fila.insertCell(1);
                celda.innerHTML = columna.Titulo;
                celda = fila.insertCell(2);
                if(columna.Visible)
                    celda.innerHTML = "<input type=\"checkbox\" checked=\"checked\" onchange=\"GadgetBusquedas._ajustarVisibilidadHandler(event);\">";
                else
                    celda.innerHTML = "<input type=\"checkbox\" onchange=\"GadgetBusquedas._ajustarVisibilidadHandler(event);\">";

                celda = fila.insertCell(3);
                if(contador>0)
                    celda.innerHTML = "<a href=\"javascript:void(0)\" onclick=\"GadgetBusquedas._subirColumnaHandler(event);\">Subir</a>";
                celda = fila.insertCell(4);
                if(contador<this.Columnas.size()-1)
                    celda.innerHTML = "<a href=\"javascript:void(0)\" onclick=\"GadgetBusquedas._bajarColumnaHandler(event);\">Bajar</a>";
                }
            }
        }

    // Ajustamos la visibilidad de una columna (evento del div configuracion)
    GadgetBusquedas._ajustarVisibilidadHandler = function(evento) {
        var filaActual = evento.target.parentNode.parentNode;
        this.Columnas[filaActual.columna_id].Visible = evento.target.checked;
        }

    // Cambiamos la posicion de la columna (mover a la izquierda)
    GadgetBusquedas._subirColumnaHandler = function(evento) {
        var filaActual = evento.target.parentNode.parentNode;
        var filaAnterior = filaActual.previousSibling;
        var temporal = this.Columnas[filaActual.columna_id];
        this.Columnas[filaActual.columna_id] = this.Columnas[filaAnterior.columna_id];
        this.Columnas[filaAnterior.columna_id] = temporal;
        this._paintConfiguracion();
        }

    // Cambiamos la posicion de la columna (mover a la derecha)
    GadgetBusquedas._bajarColumnaHandler = function(evento) {
        var filaActual = evento.target.parentNode.parentNode;
        var filaSiguiente = filaActual.nextSibling;
        var temporal = this.Columnas[filaActual.columna_id];
        this.Columnas[filaActual.columna_id] = this.Columnas[filaSiguiente.columna_id];
        this.Columnas[filaSiguiente.columna_id] = temporal;
        this._paintConfiguracion();
        }

	// Solicita los datos de la tabla
	GadgetBusquedas._solicitarDatos = function() {
		// Realizamos la petición de datos via REST
        if(this.URL != "" && typeof(this.URL) != "undefined") {
            this.EzWebAPI.send_get(this.URL + "/_", this, this._dataHandler, this._dataErrorHandler);
			}
    	}

	// Gestor de eventos para la recepción de los metadatos de la tabla de búsqueda
	GadgetBusquedas._dataHandler = function(data) {
        var datos = eval('('+data.responseText+')');
	    this.datos = datos.datos;
	    this._cambiarEstado(this.CARGADO);
		}

	// Gestor de eventos para la recepción de los errores en la recepción de datos
	GadgetBusquedas._dataErrorHandler = function(data) {
        alert("Ha habido un error al recuperar LOS DATOS del origen de información");
	    this._cambiarEstado(this.CONFIGURANDO);
		}

    // Realiza el filtrado de los datos
	GadgetBusquedas._filtrar = function() {
        if(this.Estado>=this.FILTRANDO) {
            var texto = $("gb_filtro").value.toLowerCase().split(" ");

            for(var numeroFila=0; numeroFila<this.datos.size(); numeroFila++) {
                var fila = this.datos[numeroFila];
                fila._filtrado = false;
                for(var numeroPalabra=0; numeroPalabra<texto.length; numeroPalabra++) {
                    var encontrada = false;
                    for(var dato in fila ) {
                        if(dato!="_filtrado") {
                            var valor = fila[dato];
                            if(typeof(valor)=="number")
                                valor = new Number(valor).toString();
                            if(typeof(valor)=="boolean")
                                valor = new Boolean(valor).toString();
                            if(valor.toLowerCase().indexOf(texto[numeroPalabra])>-1) {
                                encontrada = true;
                                break;
                                }
                            }
                        }
                    if(!encontrada) {
                        fila._filtrado = true;
                        break;
                        }
                    }
                }
            }
        }

    // Creamos la tabla de visualizacion de los datos
    GadgetBusquedas._paint = function() {
        if(this.Estado>=this.CARGADO) {
            var tabla = $("gb_cuerpo");
            var cabecera = $("gb_cabecera");
            var ultimaFila = 0;

            // Borramos las filas preexistentes
            tabla.innerHTML = "";
            cabecera.innerHTML = "";

            $("gb_p_mensaje_filtro").innerHTML = this.MensajeFiltro;
            // Creamos la fila de titulos
            var fila = cabecera.insertRow(0);
            var ultimaColumna = 0;
            for(var contadorColumna=0; contadorColumna<this.Columnas.size(); contadorColumna++) {
                if(this.Columnas[contadorColumna].Visible) {
                    var celda = fila.insertCell(ultimaColumna++);
                    celda.className = "header";
                    celda.columna_id = contadorColumna;
                    celda.onclick = this._ordenarHandler;
                    celda.innerHTML = this.Columnas[contadorColumna].Titulo;
                    }
                }

            // Creamos las filas de datos
            for(var contador=0; contador<this.datos.size(); contador++) {
                if(!this.datos[contador]._filtrado) {
                    fila = tabla.insertRow(ultimaFila++);
                    if(ultimaFila%2==0)
                        fila.className = "par";
                    else
                        fila.className = "impar";
                    ultimaColumna = 0;
                    fila.fila_id = contador;
                    fila.onclick = this._seleccionarFilaHandler;
                    for(contadorColumna=0; contadorColumna<this.Columnas.size(); contadorColumna++) {
                        if(this.Columnas[contadorColumna].Visible) {
                            celda = fila.insertCell(ultimaColumna++);
                            celda.onclick = this._seleccionarFilaHandler;
                            celda.align = this.Columnas[contadorColumna].Alineacion;
                            celda.innerHTML = this.datos[contador][this.Columnas[contadorColumna].Nombre];
                            }
                        }
                    }
                }
            }
        }

	// Gestor de eventos para la recepción del filtro via REST
	GadgetBusquedas._filtroHandler = function(nuevoFiltro) {
		if(nuevoFiltro!=null && typeof(nuevoFiltro)!="undefined") {
			$("gb_filtro").value = nuevoFiltro;
			GadgetBusquedas._filtrar();
            GadgetBusquedas._paint();
			}
		}

    // Gestor de eventos para la ordenacion de las columnas
    GadgetBusquedas._ordenarHandler = function(evento) {
        var columna = evento.target.columna_id;

        switch(GadgetBusquedas.Columnas[columna].Orden) {
        case Columna.ORDEN_Ascendente:
            GadgetBusquedas.Columnas[columna].Orden = Columna.ORDEN_Descendente;
            GadgetBusquedas.Ordenes.clear();
            GadgetBusquedas.Ordenes.push(GadgetBusquedas.Columnas[columna]);
            break;
        case Columna.ORDEN_Ninguno:
        case Columna.ORDEN_Descendente:
            GadgetBusquedas.Columnas[columna].Orden = Columna.ORDEN_Ascendente;
            GadgetBusquedas.Ordenes.clear();
            GadgetBusquedas.Ordenes.push(GadgetBusquedas.Columnas[columna]);
            break;
            }
        GadgetBusquedas.datos.sort(GadgetBusquedas._orden);
        GadgetBusquedas._filtrar();
        GadgetBusquedas._paint();
		}

    // Funcion de soporte para la clasificacion
    GadgetBusquedas._orden = function(a, b) {
        for(var contador=0; contador<GadgetBusquedas.Ordenes.size(); contador++) {
            var nombre = GadgetBusquedas.Ordenes[contador].Nombre;
            if(a[nombre]>b[nombre])
                return 1*GadgetBusquedas.Ordenes[contador].Orden;
            if(a[nombre]<b[nombre])
                return -1*GadgetBusquedas.Ordenes[contador].Orden;
            }
        return 0;
        }

    // Gestor de eventos para la seleccion de una fila en la tabla de datos
    GadgetBusquedas._seleccionarFilaHandler = function(event) {
        var fila = GadgetBusquedas.datos[event.target.parentNode.fila_id];
        var filaJSON = Object.toJSON(fila);
        GadgetBusquedas.ezSeleccionado.set(filaJSON);
    }

    // Gestor de eventos para el cambio de tamaño del gadget
    GadgetBusquedas._cambiarTamanyoHandler = function(event) {
        var tabla = $("gb_tabla");
        var principal = tabla.parentNode;
        var cuerpo = $("gb_cuerpo");

        var diferencia = tabla.clientHeight - cuerpo.clientHeight;
        tabla.setStyle({height: 'auto'});
        cuerpo.setStyle({height: 'auto'});
        if(tabla.clientHeight>principal.clientHeight) {
            tabla.setStyle({height: ''+principal.clientHeight+'px'});
            cuerpo.setStyle({height: ''+(principal.clientHeight-diferencia)+'px'});
            }
        }
