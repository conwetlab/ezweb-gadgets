/**************************************************************************************************
 * Autor: Enric Mogas Nonell                                                                      *
 * Compañía: Intercom Factory, S.L.                                                               *
 * ---------------------------------------------------------------------------------------------- *
 * Componente: Gadget Menú para la plataforma EzWeb                                               *
 * Fecha de Creación: 18-Sep-2008                                                                 *
 **************************************************************************************************/

// Definimos las constantes asociadas a teclas
const TECLA_Funcion_Base = 111;
const TECLA_F1  = 112;
const TECLA_F2  = 113;
const TECLA_F3  = 114;
const TECLA_F4  = 115;
const TECLA_F5  = 116;
const TECLA_F6  = 117;
const TECLA_F7  = 118;
const TECLA_F8  = 119;
const TECLA_F9  = 120;
const TECLA_F10 = 121;
const TECLA_F11 = 122;
const TECLA_F12 = 123;

/**************************************************************************************************
 * CLASE Tecla                                                                                    *
 **************************************************************************************************/
function Tecla(Nombre, ValorTecla, Mayusculas, Control, Alt) {
    this._Nombre = Nombre;
    this._ValorTecla = ValorTecla;
    this._Mayusculas = Mayusculas;
    this._Control = Control;
    this._Alt = Alt;
    Tecla.Teclas[Tecla.ultimoID++] = this;
	}

	Tecla.ultimoID = 0;
	Tecla.Teclas = new Array();
	Tecla.prototype._Nombre;
	Tecla.prototype._ValorTecla;
	Tecla.prototype._Control;
	Tecla.prototype._Alt;
	Tecla.prototype._Mayusculas;





/**************************************************************************************************
 * CLASE Accion                                                                                   *
 **************************************************************************************************/
function Accion(tipo, id, descripcion, imagenURL, ejecutar) {
	this.tipo = tipo;
	this.id = id;
	this.descripcion = descripcion;
	this.imagenURL = imagenURL;
	this.ejecutar = ejecutar;
	}

	Accion.prototype.tipo = "";
	Accion.prototype.id = 0;
	Accion.prototype.descripcion = "";
	Accion.prototype.imagenURL = "";
	Accion.prototype.ejecutar = function() {
		return false;
		};


function AccionNavegador(id, descripcion, imagenURL, ejecutar) {
	Accion.call(this, 'N', id, descripcion, imagenURL, ejecutar);
	}

function AccionPlataforma(id, descripcion, imagenURL, ejecutar) {
	Accion.call(this, 'P', id, descripcion, imagenURL, ejecutar);
	}

function AccionIGadget(id, descripcion, imagenURL, ejecutar) {
	Accion.call(this, 'I', id, descripcion, imagenURL, ejecutar);
	}






/**************************************************************************************************
 * CLASE Atajo                                                                                    *
 **************************************************************************************************/
function Atajo(tecla, accion, iGadgetId) {
	this.tecla = tecla;
	this.accion = accion;
	this.iGadgetId = iGadgetId;
	}

	Atajo.prototype.tecla = new Object();
	Atajo.prototype.accion = new Object();
	Atajo.prototype.iGadgetId = 0;





/**************************************************************************************************
 * CLASE GadgetMenu                                                                               *
 **************************************************************************************************/
function GadgetMenu() {
	// Generamos las teclas de control
	for(NumeroTecla = 1; NumeroTecla<13; NumeroTecla++) {
		var NombreTecla = "F"+NumeroTecla;
		var ValorTecla = NumeroTecla + TECLA_Funcion_Base;
		new Tecla(NombreTecla, ValorTecla+TECLA_Funcion_Base, false, false, false);
		new Tecla(NombreTecla, ValorTecla+TECLA_Funcion_Base, true,  false, false);
		new Tecla(NombreTecla, ValorTecla+TECLA_Funcion_Base, false, true,  false);
		}

	// Generamos las Acciones
	GadgetMenu.acciones[0] = new AccionNavegador(0, "No hacer nada", "", function() {
		});
	GadgetMenu.acciones[101] = new AccionNavegador(101, "Imprimir", "", function() {
		window.print();
		});
	/*GadgetMenu.acciones[102] = new AccionNavegador(102, "Cerrar el Navegador", "", function() {
		window.parent.opener = "x";
		window.parent.close();
		});*/
	GadgetMenu.acciones[201] = new AccionNavegador(201, "Acceder al CatÃ¡logo", "", function() {
		EzWebAPI.platform.OpManagerFactory.getInstance().catalogue.show();
		});
	/*GadgetMenu.acciones[202] = new AccionNavegador(201, "Acceder a la CatÃ¡logo", "", function() {
		EzWebAPI.platform.OpManagerFactory.getInstance().catalogue.show();
		});*/
	GadgetMenu.acciones[301] = new AccionIGadget(301, "Minimizar el Gadget", "", function(iGadgetID) {
		EzWebAPI.platform.LayoutManagerFactory.getInstance().currentView.iGadgets[iGadgetID].setMinimizeStatus(true);
		});
	GadgetMenu.acciones[302] = new AccionIGadget(302, "Maximizar el Gadget", "", function(iGadgetID) {
		EzWebAPI.platform.LayoutManagerFactory.getInstance().currentView.iGadgets[iGadgetID].setMinimizeStatus(false);
		});
	GadgetMenu.acciones[303] = new AccionIGadget(303, "Cerrar el Gadget", "", function(iGadgetID) {
		EzWebAPI.platform.LayoutManagerFactory.getInstance().currentView.iGadgets[iGadgetID].destroy();
		});
	GadgetMenu.acciones[304] = new AccionIGadget(304, "Activar el Gadget", "", function(iGadgetID) {
		// Buscamos el gadget por si no estuviera visible
		opManager = EzWebAPI.platform.OpManagerFactory.getInstance();
		for(_workspace in opManager.workSpaceInstances) {
			var workspace = opManager.workSpaceInstances[_workspace];
			if(typeof(workspace.tabInstances)!="undefined") {
				for(_tab in workspace.tabInstances) {
					var tab = workspace.tabInstances[_tab];
					if(typeof(tab.dragboard)!="undefined") {
						for(_igadget in tab.dragboard.iGadgets) {
							if(_igadget==iGadgetID)
								if(typeof(tab.dragboard.iGadgets[_igadget].id)!="undefined") {
									workspace.show();
									tab.show();
									tab.dragboard.iGadgets[_igadget].focus();
									}
							}
						}
					}
				}
			}
		});

	// Cargamos los atajos a traves de una variable de plataforma
    GadgetMenu.variableAtajos = EzWebAPI.createRWGadgetVariable("atajos");
    var atajosTmp = eval( GadgetMenu.variableAtajos.get() );
    GadgetMenu.atajos = new Array();
    for(atajo in atajosTmp ) {
    	if(typeof(atajosTmp[atajo].accion)!="undefined") {
	    	GadgetMenu.atajos[atajosTmp[atajo].tecla] = atajosTmp[atajo];
    		GadgetMenu.atajos[atajosTmp[atajo].tecla].accion = GadgetMenu.acciones[atajosTmp[atajo].accion.id];
    		}
    	}
	}

	// CONSTANTES
	// Definimos los estados en los que puede estar un Menu
	GadgetMenu.EN_USO = 0;
	GadgetMenu.CONFIGURACION = 1;

	// VARIABLES MIEMBRO ESTATICAS
	GadgetMenu.acciones = new Array();
	GadgetMenu.variableAtajos = new Object();
	GadgetMenu.atajos = new Array();

	// FUNCIONES MIEMBRO ESTATICAS
	GadgetMenu.Configurar = function () {
		// Mostramos el panel de configuración y ocultamos el panel de uso
		var configuracion = $('configuracion');
		configuracion.show();
		var teclado = $('teclado');
		teclado.hide();
		// Ajustamos el tamaño del gadget
		var iGadgetID = EzWebAPI.id;
		EzWebAPI.platform.LayoutManagerFactory.getInstance().currentView.iGadgets[iGadgetID]._setSize(12, 54, false, true);

		var catalogo = EzWebAPI.platform.CatalogueFactory.getInstance();
		catalogo.reloadCompleteCatalogue();
		var res = catalogo.getResources();

		// Ajustamos las listas de acciones
		// Primero cargamos la primera lista (F1)
		var listaAcciones = $$('.listaAcciones');
		listaAcciones[0].innerHTML = '';
		for(accionID in GadgetMenu.acciones) {
			// var numeroAccion=0; numeroAccion<GadgetMenu.acciones.length; numeroAccion++) {
			if(typeof(GadgetMenu.acciones[accionID].id)!="undefined") {
				var opt = document.createElement('option');
				opt.text = GadgetMenu.acciones[accionID].descripcion;
				opt.value = GadgetMenu.acciones[accionID].id;
				try {
					listaAcciones[0].add(opt,null);
					}
				catch(ex) {
					listaAcciones[0].add(opt);
					}
				}
			}
		// Propagamos a las siguientes listas (F2-F12)
		for(var numeroTecla=1; numeroTecla<listaAcciones.length; numeroTecla++) {
			listaAcciones[numeroTecla].innerHTML = listaAcciones[0].innerHTML;
			}
		for(var numeroTecla=0; numeroTecla<listaAcciones.length; numeroTecla++) {
			listaAcciones[numeroTecla].tecla = numeroTecla;
			listaAcciones[numeroTecla].onchange = function(evt) {
				lig = $("lista_igadgets_"+evt.target.tecla);
				if((evt.target.value>=300) && (evt.target.value<400))
					lig.show();
				else
					lig.hide();
				};
			}

		// Ajustamos la lista de IGadgets
		// Obtenemos los gadgets de EzWeb
		var iGadgetsList = new Array();
		opManager = EzWebAPI.platform.OpManagerFactory.getInstance();
		for(_workspace in opManager.workSpaceInstances) {
			var workspace = opManager.workSpaceInstances[_workspace];
			if(typeof(workspace.tabInstances)!="undefined") {
				for(_tab in workspace.tabInstances) {
					var tab = workspace.tabInstances[_tab];
					if(typeof(tab.dragboard)!="undefined") {
						for(_igadget in tab.dragboard.iGadgets) {
							if(typeof(tab.dragboard.iGadgets[_igadget].name)!="undefined")
								iGadgetsList[_igadget] = tab.dragboard.iGadgets[_igadget];
							}
						}
					}
				}
			}
		// Primero ajustamos la primera lista (F1)
		var listaIGadgets = $$('.listaIGadgets');
		listaIGadgets[0].innerHTML = '';
		// for(var numeroIGadget=0; numeroIGadget<EzWebAPI.platform.LayoutManagerFactory.getInstance().currentView.igadgets.length; numeroIGadget++) {
		for(_igadget in iGadgetsList) {
			if(typeof(iGadgetsList[_igadget].id)!="undefined") {
				var opt = document.createElement('option');
				// opt.text = EzWebAPI.platform.LayoutManagerFactory.getInstance().currentView.igadgets[numeroIGadget].name;
				// opt.value = EzWebAPI.platform.LayoutManagerFactory.getInstance().currentView.igadgets[numeroIGadget].id;

				opt.text = iGadgetsList[_igadget].name;
				opt.value = iGadgetsList[_igadget].id;
				try {
					listaIGadgets[0].add(opt,null);
					}
				catch(ex) {
					listaIGadgets[0].add(opt);
					}
				}
			}
		listaIGadgets[0].hide();
		// Propagamos a las siguientes listas (F2-F12)
		for(var numeroTecla=1; numeroTecla<listaAcciones.length; numeroTecla++) {
			listaIGadgets[numeroTecla].innerHTML = listaIGadgets[0].innerHTML;
			listaIGadgets[numeroTecla].hide();
			}
		for(var numeroTecla=0; numeroTecla<listaAcciones.length; numeroTecla++) {
			listaIGadgets[numeroTecla].id = "lista_igadgets_"+numeroTecla;
			}

		// Ajustamos los valores según los atajos
		for(atajoId in GadgetMenu.atajos) {
			var atajo = GadgetMenu.atajos[atajoId];
			for(var numeroOpcion=0; numeroOpcion<listaAcciones[atajo.tecla-TECLA_F1].options.length; numeroOpcion++) {
				if(listaAcciones[atajo.tecla-TECLA_F1].options[numeroOpcion].value==atajo.accion.id) {
					listaAcciones[atajo.tecla-TECLA_F1].options[numeroOpcion].selected = true;
					break;
					}
				}
			if((atajo.accion.id>=300) && (atajo.accion.id<400)) {
				for(var numeroOpcion=0; numeroOpcion<listaIGadgets[atajo.tecla-TECLA_F1].options.length; numeroOpcion++) {
					if(listaIGadgets[atajo.tecla-TECLA_F1].options[numeroOpcion].value==atajo.iGadgetId) {
						listaIGadgets[atajo.tecla-TECLA_F1].options[numeroOpcion].selected = true;
						break;
						}
					}
				listaIGadgets[atajo.tecla-TECLA_F1].show();
				}
			}
		}

	// Guarda la información en una variable
	GadgetMenu.Guardar = function () {
		var listaAcciones = $$('.listaAcciones');
		var listaIGadgets = $$('.listaIGadgets');
		var imagenes = $$('.imagen_tecla');

		GadgetMenu.atajos = new Array();
		for(var numeroTecla=0; numeroTecla<listaAcciones.length; numeroTecla++) {
			var accionID = listaAcciones[numeroTecla].options[listaAcciones[numeroTecla].selectedIndex].value;
			if(accionID!=0) {
				var iGadgetID = listaIGadgets[numeroTecla].options[listaIGadgets[numeroTecla].selectedIndex].value;
				GadgetMenu.atajos[TECLA_F1+numeroTecla] = new Atajo(TECLA_F1+numeroTecla, GadgetMenu.acciones[accionID], iGadgetID);
				}
			}
		GadgetMenu.variableAtajos.set(GadgetMenu.atajos.toJSON());
		}

	// Cambia a modo de uso
	GadgetMenu.Usar = function () {
		// Muestra el panel de teclado
		var teclado = $('teclado');
		teclado.show();
		var configuracion = $('configuracion');
		configuracion.hide();
		// Ajusta el tamaño del gadget Menu
		var iGadgetId = EzWebAPI.id;
		EzWebAPI.platform.LayoutManagerFactory.getInstance().currentView.iGadgets[iGadgetId]._setSize(12, 12, false, true);
		}

	// Ejecuta la accion solicitada por el usuario
	GadgetMenu.AjustarTeclado = function(evt) {
		if(typeof(evt)!="undefined") {
			if(window.event)
				keynum = evt.keyCode;
			else if(evt.which)
				keynum = evt.which;
			GadgetMenu.Ejecutar(keynum);
			}

		/*
		$$(".teclado_normal")[0].style.display = "none";
		$$(".teclado_normal")[1].style.display = "none";
		$$(".teclado_mayus")[0].style.display = "none";
		$$(".teclado_mayus")[1].style.display = "none";
		$$(".teclado_control")[0].style.display = "none";
		$$(".teclado_control")[1].style.display = "none";
		var teclado = "";
		if(typeof(evt)=='undefined')
			teclado = ".teclado_normal";
		else {
			if((!evt.shiftKey) && (!evt.ctrlKey))
				teclado = ".teclado_normal";
			if(evt.shiftKey)
				teclado = ".teclado_mayus";
			if(evt.ctrlKey)
				teclado = ".teclado_control";
			}
		$$(teclado)[0].style.display = "";
		$$(teclado)[1].style.display = "";
		//$("#gm_if_menu")[0].focus();
		$("teclado").focus();
		$$(teclado)[0].focus();
		//$$("._tecla").focus();*/
		}

	GadgetMenu.Ejecutar = function(tecla) {
		if(typeof(GadgetMenu.atajos[tecla])!="undefined")
			GadgetMenu.atajos[tecla].accion.ejecutar(GadgetMenu.atajos[tecla].iGadgetId);
		}

var miMenu = new GadgetMenu();
