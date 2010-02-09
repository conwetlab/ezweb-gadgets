/*
 *
 * Copyright 2009 (C) Fundación CTIC <http://www.fundacionctic.org/>
 *
 * This file is part of the generic visualizadorMapas/visualizadorIDEZar Gadgets
 * for the EzWeb Platform
 *
 * visualizadorMapas/visualizadorIDEZar Gadgets are free software: you can
 * redistribute them and/or modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * visualizadorMapas/visualizadorIDEZar Gadgets is distributed in the hope that it
 * will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with visualizadorMapas/visualizadorIDEZar Gadgets. If not, see
 * <http://www.gnu.org/licenses/>.
 *
 */
/**
 * Class: IDEZar_API.Map
 * Mapa basado en OpenLayers, con capas y controles.
 */
IDEZar_API.Map = function(div, options) {
	
	/**
	* Property: map
	* {OpenLayers.Map.IAAA_Map} Mapa de OpenLayers.
	*/
	this.map = null;
	
	/**
	* Property: div
	* {DOMElement} DIV del mapa.
	*/
	this.div = null;
	
	/**
	* Property: srs
	* {String} SRS del mapa.
	*/
	this.srs = null;

	/**
	* Property: maxExtent
	* {IDEZar_API.Bounds} Extent maximo del mapa.
	*/
	this.maxExtent = null;
	
	/**
	* Property: initialExtent
	* {IDEZar_API.Bounds} Extent inicial del mapa.
	*/
	this.initialExtent = null;
	
	/**
	* Property: toolbar
	* {IDEZar_API.Tool.ToolBar} Barra de herramientas.
	*/
	this.toolbar = null;
	
	/**
	* Property: scalebar
	* {IDEZar_API.Tool.ScaleBar} Barra de escala.
	*/
	this.scalebar = null;
	
	/**
	* Property: tabgroup
	* {OpenLayers.Control.IAAA_TabGroup} Gestor de pestañas del mapa.
	*/
	this.tabgroup = null;
	
	/**
	* Property: ProxyHost
	* {String} Proxy para realizar algunos tipos de peticiones HTTP.
	*/
	this.ProxyHost = null;
	
	/**
	* Constructor: IDEZar_API.Map
	* Crea un mapa con las caracteristicas introducidas.
	*
	* Parameters:
	* div - {DOMElement}
	* options - {Object} Listado de opciones a aplicar al mapa.
	*/
	this.addWMS = addWMS;
	this.addTools = addTools;
	this.addTool = addTool;
	this.setExtent = setExtent;
	this.loadGML = loadGML;
	this.onLoadGML = onLoadGML;
	this.loadKML = loadKML;
	this.loadGeoRSS = loadGeoRSS;
	this.loadGeoJSON = loadGeoJSON;
	
	this.div = div;
	
	// Establecer las opciones del mapa
	var newOptions = {};
	if (options) {
		if (options.srs) {
			this.srs = options.srs;
			newOptions.projection = this.srs;
		}
		if (options.maxExtent) {
			this.maxExtent = options.maxExtent;
			newOptions.maxExtent = this.maxExtent.bounds;
		}
		if (options.ProxyHost) {
			this.ProxyHost = options.ProxyHost;
			OpenLayers.ProxyHost = this.ProxyHost;
		}
	}
	
	// Asignar SRS por defecto al mapa, si no tiene
	if (this.srs == null) {
		this.srs = "EPSG:4258";
		newOptions.projection = this.srs;
	}

	// Transformar el Extent maximo al SRS del mapa
	if (this.maxExtent) {
		if (this.maxExtent.srs) {
			var newSrs = this.srs;
			if (this.maxExtent.srs != newSrs) {
				this.maxExtent.transformSrs(newSrs);
			}
			newOptions.maxExtent = this.maxExtent.bounds;
		} else {
			this.maxExtent.srs = this.srs;
		}
	} else {
		// El extent maximo (-180, -90, 180, 90) no funciona correctamente en UTM
		// Extent maximo del mundo, corregido
		//this.maxExtent = new IDEZar_API.Bounds(-179.99, -89.99, 179.99, 89.99, "EPSG:4258");
		// Extent maximo de España
		this.maxExtent = new IDEZar_API.Bounds(-20.0, 26.0, 4.0, 44.0, "EPSG:4258");
		this.maxExtent.transformSrs(this.srs);
		newOptions.maxExtent = this.maxExtent.bounds;
	}
	
	// Opciones usadas en caso de que el mapa sea redimensionable
	newOptions.windowSizeForMinMapSize = new OpenLayers.Size(100, 100);
	newOptions.minWidth = 95;
	newOptions.minHeight = 90;
	// Crear mapa (sin controles)
	newOptions.controls = [];
	this.map = new OpenLayers.Map.IAAA_Map(this.div, newOptions);
	this.map.initResolutionsFromParameters(this.maxExtent.bounds, 0);
	this.map.zoomToExtent(this.maxExtent.bounds);
	
	// Añadir ToolBar por defecto
	this.toolbar = new IDEZar_API.Tool.ToolBar("top","left");
	this.map.addControl(this.toolbar.tb);
	
	// Crear el Facade externo, para la comunicacion del OpenLayers de la API con otros componentes
	IDEZar_API.ExternalFacade = new OpenLayersClientFCFacade(this.map);
	// Crear el Facade propio, para la comunicacion de la API con otros componentes
	if (IDEZar_API.Facade) {
		IDEZar_API.MyFacade = new IDEZar_API.Facade(this);
	}
	
	/**
	* Function: addWMS
	* Añadir WMS al mapa.
	*
	* Parameters:
	* wms - {IDEZar_API.WMS}
	*/
	function addWMS(wms) {
		// Asignar el SRS del mapa a la capa
		if (wms.srsList == null) {
			wms.srsList = [this.map.getProjection()];
			if (wms.CLASS_NAME != "IDEZar_API.WMS.GoogleMaps") {
				wms.layer.SRSList = wms.srsList;
				wms.layer.selectedSRS = 0;
			}
		// Seleccionar el SRS de la capa en base al del mapa (si lo soporta)
		} else {
			var ancientSrs = this.srs;
			var supported = false;
			var index;
			for (index = 0; index < wms.srsList.length; index++) {
				if (wms.srsList[index] == ancientSrs) {
					supported = true;
					break;
				}
			}
			if (supported) {
				wms.layer.projection = ancientSrs;
				wms.layer.selectedSRS = index;
			}
		}
		
		// Establecer unidades
		if (this.srs.startsWith("EPSG:2")) {
			wms.layer.units = "m";
		}
		
		// Añadir capa al mapa
		this.map.addLayer(wms.layer);
		
		// Si la capa añadida es de GoogleMaps la situo como capa base
		if (wms.CLASS_NAME == "IDEZar_API.WMS.GoogleMaps") {
			for (var i in this.map.layers) {
				if (this.map.layers[i].id != wms.layer.id) {
					this.map.layers[i].isBaseLayer = false;
					this.map.layers[i].setVisibility(true);
				}
			}
			this.map.setBaseLayer(wms.layer);
			wms.layer.setVisibility(true);
		}
	};
	
	/**
	* Function: addTools
	* Añadir herramientas al mapa.
	*
	* Parameters:
	* tools - {[IDEZar_API.Tool]}
	*/
	function addTools(tools) {
		for (var i in tools) {
			this.addTool(tools[i]);
		}
	};
	
	/**
	* Function: addTool
	* Añadir herramienta al mapa.
	*
	* Parameters:
	* tool - {IDEZar_API.Tool}
	*/
	function addTool(tool) {
		switch (tool.CLASS_NAME) {
			case "IDEZar_API.Tool.ToolBar":
			case "IDEZar_API.Tool.DefaultToolBar":
				this.toolbar = tool;
				this.map.addControl(this.toolbar.tb);
				if (tool.defaultControls) {
					this.addTools(tool.defaultControls);
				}
				break;
			case "IDEZar_API.Tool.OverviewMap":
				tool.control.initExtent = this.map.getExtent();
				if ((this.toolbar.verticalPosition == "top") && (this.toolbar.horizontalPosition == "right")) {
					tool.control.align = "left";
				} else {
					tool.control.align = "right";
				}
				this.toolbar.addToolToBar(tool);
				break;
			case "IDEZar_API.Tool.FullExtent":
				this.toolbar.addToolToBar(tool);
				break;
			case "IDEZar_API.Tool.ZoomBox":
				this.toolbar.addToolToBar(tool);
				break;
			case "IDEZar_API.Tool.ZoomOut":
				this.toolbar.addToolToBar(tool);
				break;
			case "IDEZar_API.Tool.Dragpan":
				this.toolbar.addToolToBar(tool);
				break;
			case "IDEZar_API.Tool.Distance":
				if (this.scalebar) {
					if (this.scalebar.position == "left") {
						tool.control.changePosition("right");
					} else {
						tool.control.changePosition("left");
					}
				}
				this.toolbar.addToolToBar(tool);
				break;
			case "IDEZar_API.Tool.Area":
				if (this.scalebar) {
					if (this.scalebar.position == "left") {
						tool.control.changePosition("right");
					} else {
						tool.control.changePosition("left");
					}
				}
				this.toolbar.addToolToBar(tool);
				break;
			case "IDEZar_API.Tool.NavBarInfo":
				this.map.addControl(tool.control);
				break;
			case "IDEZar_API.Tool.ScaleBar":
				this.scalebar = tool;
				if (this.toolbar) {
					for (var i in this.toolbar.tb.controlList) {
						if ((this.toolbar.tb.controlList[i].CLASS_NAME == "OpenLayers.Control.IAAA_AreaMeasure") ||
							(this.toolbar.tb.controlList[i].CLASS_NAME == "OpenLayers.Control.IAAA_DistanceMeasure")) {
								if (this.scalebar.position == "left") {
									this.toolbar.tb.controlList[i].changePosition("right");
								} else {
									this.toolbar.tb.controlList[i].changePosition("left");
								}
							}
					}
				}
				this.map.addControl(tool.control);
				break;
			case "IDEZar_API.Tool.MouseWheelZoom":
				this.map.addControl(tool.control);
				break;
			case "IDEZar_API.Tool.LoadingMap":
				this.map.addControl(tool.control);
				break;
			case "IDEZar_API.Tool.Tab":
				if (this.tabgroup == null) {
					this.tabgroup = new OpenLayers.Control.IAAA_TabGroup();
					this.map.addControl(this.tabgroup);
				}
				this.tabgroup.addTab(tool.control);
				if (this.initialExtent) {
					var targetExtent = this.initialExtent.bounds.clone();
					if (targetExtent.srs) {
						var newSrs = this.map.getProjection();
						if (targetExtent.srs != newSrs) {
							targetExtent.transformSrs(newSrs);
						}
					}
					this.map.zoomToExtent(targetExtent);
				}
				break;
			case "IDEZar_API.Tool.Nomenclator":
				this.toolbar.addToolToBar(tool);
				break;
			case "IDEZar_API.Tool.KMLSelector":
				this.toolbar.addToolToBar(tool);
				this.toolbar.kmlSelector = tool;
				this.map.addControl(tool.controlIcons);
				tool.controlIcons.deactivate();
				break;
			case "IDEZar_API.Tool.DrawPoint":
				this.toolbar.addToolToBar(tool);
				this.toolbar.drawPoint = tool;
				break;
			default: break;
		}
	};
	
	/**
	* Function: setExtent
	* Establecer extent del mapa.
	*
	* Parameters:
	* bounds - {IDEZar_API.Bounds}
	*/
	function setExtent(bounds) {
		if (bounds.srs) {
			var newSrs = this.map.getProjection();
			if (bounds.srs != newSrs) {
				bounds.transformSrs(newSrs);
			}
		} else {
			bounds.setSrs(this.map.getProjection());
		}
		this.map.zoomToExtent(bounds.bounds);
		
		// Establecer el Extent introducido como Extent inicial
		this.initialExtent = bounds;
		for (var i in this.toolbar.tb.controlList) {
			if (this.toolbar.tb.controlList[i].CLASS_NAME == "OpenLayers.Control.IAAA_FullExtent") {
				this.toolbar.tb.controlList[i].initialExtent = bounds.bounds;
				break;
			}
		}
	};
	
	/**
	* Function: loadGML
	* Carga en el mapa el GML indicado.
	*
	* Parameters:
	* gml - {IDEZar_API.File.GML}
	*/
	function loadGML(gml) {
		var requestManagerForGML = new OpenLayers.IAAA_Request("", gml.url, "GET");
		requestManagerForGML.doRequest();
		requestManagerForGML.events.register("loaddata", this, function() {this.onLoadGML(requestManagerForGML, gml);});
	};
	
	/**
	* Function: onLoadGML
	* Parsear el contenido del GML cargado.
	*
	* Parameters:
	* requestManagerForGML - {OpenLayers.IAAA_Request}
	* gml - {IDEZar_API.File.GML}
	*/
	function onLoadGML(requestManagerForGML, gml) {
		var doc = requestManagerForGML.getResponse();
		
		// Leer features del GML
		var mapSrs = this.map.getProjection();
		var onError = function(e) { alert(messages["errorLoadingGML"] + " (" + gml.url + ")"); };
		var GMLParser = new IDEZar_API.Parser.GML(mapSrs, onError);
		var geometries = GMLParser.getGeometriesFromGML(doc);
		
		// Transformar las geometrías al SRS del mapa
		for (var i in geometries) {
			geometries[i].transformSrs(mapSrs);
		}
		
		// Cargar features en el mapa
		var featuresLayer = new OpenLayers.Layer.Vector("GML_Layer",
				{style: gml.style,
				displayOutsideMaxExtent: true,
				alwaysInRange: true,
				resolutions: this.map.baseLayer.resolutions,
				maxExtent: this.map.baseLayer.maxExtent});
		this.map.addLayer(featuresLayer);
		for (var i in geometries) {
			var featurePolygon = new OpenLayers.Feature.Vector(geometries[i].geometry);
			featuresLayer.addFeatures(featurePolygon);
		}
	};
	
	/**
	* Function: loadKML
	* Carga en el mapa el KML indicado.
	*
	* Parameters:
	* kml - {IDEZar_API.File.KML}
	*/
	function loadKML(kml) {
		// Comportamiento ante eventos de cada Feature del KML
		var onPopupClose = function (evt) {
			OpenLayers.myKMLSelector.control.unselectAll();
		};
		var onFeatureSelect = function () {
			var feature = this;
			var content = "";
			if ((feature.attributes.name) && (feature.attributes.description)) {
				content = "<h2>" + feature.attributes.name + "</h2>" + feature.attributes.description;
			} else if (feature.attributes.name) {
				content = "<h2>" + feature.attributes.name + "</h2>";
			} else {
				content = feature.id;
			}
			if (content.search("<script") != -1) {
				content = "Content contained Javascript! Escaped content below.<br />" + content.replace(/</g, "&lt;");
			}
			popup = new OpenLayers.Popup.FramedCloud("featurePopup", 
				feature.geometry.getBounds().getCenterLonLat(),
				new OpenLayers.Size(100,100),
				content,
				null, true, onPopupClose);
			feature.popup = popup;
			this.layer.map.addPopup(popup);
		};
		var onFeatureUnselect = function () {
			var feature = this;
			if (feature.popup) {
				this.layer.map.removePopup(feature.popup);
				feature.popup.destroy();
				delete feature.popup;
			}
		};
		
		// Capa que contiene las features del KML y su comportamiento
		var strategy = new OpenLayers.Strategy.IAAA_Fixed(
				{onFeatureSelect: onFeatureSelect,
				onFeatureUnselect: onFeatureUnselect});
		var projection = (kml.srs ? kml.srs: this.map.getProjection());
		var kmlLayer = new OpenLayers.Layer.Vector("KML_Layer", {
			projection: this.map.getProjection(),
			strategies: [strategy],
			additionalInfo: true,
			protocol: new OpenLayers.Protocol.HTTP({
				url: kml.url,
				format: new OpenLayers.Format.KML({
					extractStyles: true,
					extractAttributes: true
				})
			})
		});

		// Control de selección de features de la capa KML (OpenLayers.myKMLSelector)
		// Se establece como variable global para que sea accesible desde métodos anónimos
		if (this.toolbar.kmlSelector) {
			kmlLayer.setMap(this.map);
			kmlLayer.afterAdd();
			kmlLayer.selectionControl = this.toolbar.kmlSelector.control;
			kmlLayer.selectionControlIcons = this.toolbar.kmlSelector.controlIcons;
			kmlLayer.events.register("loadend", kmlLayer, function() {
				this.selectionControl.layer.addFeatures(this.features);
				this.selectionControlIcons.layer.addFeatures(this.features);
			});
		} else {
			this.map.addLayer(kmlLayer);
			OpenLayers.myKMLSelector = new IDEZar_API.Tool.KMLSelector(kmlLayer);
			this.addTool(OpenLayers.myKMLSelector);
		}
	};
	
	/**
	* Function: loadGeoRSS
	* Carga en el mapa el GeoRSS indicado.
	*
	* Parameters:
	* geoRss - {IDEZar_API.File.GeoRSS}
	*/
	function loadGeoRSS(geoRss) {
		// Capa que contiene la información GeoRSS
		var parts = geoRss.url.split("/");
		var geoRssLayer = new OpenLayers.Layer.IAAA_GeoRSS(parts[parts.length-1], geoRss.url, {
				visibility: true,
				showLoadingIcon: true,
				additionalInfo: true,
				dataSRS: geoRss.srs
			}, {
				outputType: 1
			}
		);
		// Al añadirse la capa al mapa se realiza la transformación de SRS si es necesario
		this.map.addLayer(geoRssLayer);
	};
	
	/**
	* Function: loadGeoJSON
	* Carga en el mapa el GeoJSON indicado.
	*
	* Parameters:
	* geoJson - {IDEZar_API.File.GeoJSON}
	*/
	function loadGeoJSON(geoJson) {
		// Capa que contiene la información GeoJSON (se incluye un parámetro para
		// indicar que los datos vectoriales provienen de un GeoJSON)
		var geoJsonLayer = new OpenLayers.Layer.Vector("GeoJSON_layer",
			{style: geoJson.style,
			displayOutsideMaxExtent: true,
			alwaysInRange: true,
			resolutions: this.map.baseLayer.resolutions,
			maxExtent: this.map.baseLayer.maxExtent,
			GeoJSONdata: true});
		this.map.addLayer(geoJsonLayer);
		// Leer contenido del objeto GeoJSON
		var geoJsonFormat = new OpenLayers.Format.GeoJSON();
		geoJsonFormat.parseGeometry = function(obj) {
			// Se modifica el comportamiento original para que se ignoren las excepciones
	    	if (obj == null) {
	            return null;
	        }
	        var geometry, collection = false;
	        if(obj.type == "GeometryCollection") {
	            var numGeom = obj.geometries.length;
	            var components = new Array(numGeom);
	            for(var i=0; i<numGeom; ++i) {
	                components[i] = this.parseGeometry.apply(
	                    this, [obj.geometries[i]]
	                );
	            }
	            geometry = new OpenLayers.Geometry.Collection(components);
	            collection = true;
	        } else {
	            try {
	                geometry = this.parseCoords[obj.type.toLowerCase()].apply(
	                    this, [obj.coordinates]
	                );
	            } catch(err) {
	                // deal with bad coordinates
	                throw err;
	            }
	        }
	        // We don't reproject collections because the children are reprojected
	        // for us when they are created.
	        if (this.internalProjection && this.externalProjection && !collection) {
	            geometry.transform(this.externalProjection, 
	                               this.internalProjection); 
	        }                       
	        return geometry;
	    };
	    // Evitar errores en puntos con 3 dimensiones
	    geoJsonFormat.parseCoords["point"] = function(array) {
		    if (array.length >= 2) {
		        return new OpenLayers.Geometry.Point(array[0], array[1]);
		    }
		};
	    var featuresGeoJSON = geoJsonFormat.read(geoJson.url);

		// Transformar las geometrías al SRS del mapa
		for (var i in featuresGeoJSON) {
			var newGeometry = new OpenLayers.IAAA_SRSGeometry(featuresGeoJSON[i].geometry, geoJson.srs);
			newGeometry.transformSrs(this.map.getProjection());
			featuresGeoJSON[i].geometry = newGeometry.geometry.clone();
		}
		// Añadir contenido del objeto GeoJSON
		geoJsonLayer.addFeatures(featuresGeoJSON);
	};

	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.Map";
};

/**
 * Class: IDEZar_API.WMS
 * Servicio de mapas estandar generico.
 */
IDEZar_API.WMS = function(name, url, options) {
	
	/**
	* Property: layer
	* {OpenLayers.Layer.IAAA_Server} Capa WMS de OpenLayers.
	*/
	this.layer = null;
	
	/**
	* Property: name
	* {String} Nombre del WMS.
	*/
	this.name = null;
	
	/**
	* Property: url
	* {String} URL del WMS.
	*/
	this.url = null;
	
	/**
	* Property: layers
	* {[String]} Capas del WMS.
	*/
	this.layers = null;
	
	/**
	* Property: tiled
	* {Boolean} Realizar o no peticiones tileadas al WMS.
	*/
	this.tiled = null;
	
	/**
	* Property: styles
	* {[String]} Estilos de las capas del WMS.
	*/
	this.styles = null;
	
	/**
	* Property: srsList
	* {String} Lista de SRS del WMS.
	*/
	this.srsList = null;
	
	/**
	* Property: format
	* {String} Formato solicitado para las respuestas del WMS.
	*/
	this.format = null;
	
	/**
	* Property: transparent
	* {Boolean} Transparencia solicitada para las respuestas del WMS.
	*/
	this.transparent = null;
	
	/**
	* Property: bgColor
	* {Boolean} Color de fondo solicitado para las respuestas del WMS.
	*/
	this.bgColor = null;
	
	/**
	* Property: version
	* {String} Version del WMS.
	*/
	this.version = null;
	
	/**
	* Property: serviceType
	* {String} Tipo de WMS.
	*/
	this.serviceType = null;
	
	/**
	* Property: resolutions
	* {[Float]} Resoluciones del WMS.
	*/
	this.resolutions = null;
	
	/**
	* Property: isWMSC
	* {Boolean} ¿WMS-C?
	*/
	this.isWMSC = null;
	
	/**
	* Property: maxExtent
	* {IDEZar_API.Bounds} Extent maximo de la capa
	*/
	this.maxExtent = null;
	
	/**
	* Constructor: IDEZar_API.WMS
	* Crea un WMS generico.
	*
	* Parameters:
	* name - {String} Nombre del servicio.
	* url - {String} URL del servicio.
	* options - {Object} Listado de opciones del WMS.
	*/
	this.name = name;
	this.url = url;
	var newOptions = {};
	var newParams = {};
	if (options) {
		if (options.layers) {
			this.layers = options.layers;
		}
		if (options.tiled != null) {
			this.tiled = options.tiled;
			newOptions.singleTile = !(this.tiled);
		}
		if (options.styles) {
			this.styles = [];
			for (var i in options.styles) {
				this.styles.push(new OpenLayers.IAAA_Style(options.styles[i]));
			}
		}
		if (options.srsList) {
			this.srsList = options.srsList;
			newParams.SRS = this.srsList[0];
			newOptions.SRSList = this.srsList;
			newOptions.selectedSRS = 0;
			newOptions.projection = this.srsList[0];
		}
		if (options.format) {
			this.format = options.format;
			newParams.format = this.format;
		}
		if (options.transparent) {
			this.transparent= options.transparent;
			newParams.transparent = this.transparent;
		}
		if (options.bgColor) {
			this.bgColor = options.bgColor;
			newParams.bgColor = this.bgColor;
		}
		if (options.version) {
			this.version = options.version;
			newParams.version = this.version;
		}
		if (options.serviceType) {
			this.serviceType = options.serviceType;
			newOptions.serviceType = this.serviceType;
		}
		if (options.resolutions) {
			this.resolutions = options.resolutions;
			newOptions.resolutions = this.resolutions;
		}
		if (options.isWMSC) {
			this.isWMSC = options.isWMSC;
			newOptions.isWMSC = this.isWMSC;
		}
		if (options.maxExtent) {
			this.maxExtent = options.maxExtent;
			newOptions.maxExtent = this.maxExtent.bounds;
		}
		if (options.otherParameters) {
			for (var i in options.otherParameters) {
				newOptions[i] = options.otherParameters[i];
			}
		}
	}
	if (this.tiled == null) {
		if (this.isWMSC) {
			this.tiled = true;
			newOptions.singleTile = false;
		} else {
			this.tiled = false;
			newOptions.singleTile = true;
		}
	}
	if (this.srsList == null) {
		this.srsList = ["EPSG:4258","EPSG:4230","EPSG:4326","EPSG:25828","EPSG:25829","EPSG:25830","EPSG:25831","EPSG:23028","EPSG:23029","EPSG:23030","EPSG:23031"];
		newParams.SRS = this.srsList[0];
		newOptions.SRSList = this.srsList;
		newOptions.selectedSRS = 0;
		newOptions.projection = this.srsList[0];
	}
	
	newOptions.isBaseLayer = false;
	newOptions.ratio = 1.0;
	newOptions.showLoadingIcon = true;
	newOptions.delayDisplay = false;
	this.layer = new OpenLayers.Layer.IAAA_Server(this.name, this.url, newParams, newOptions);
	for (var i in this.layers) {
		var child_style = this.styles ? (this.styles[i] ? this.styles[i] : new OpenLayers.IAAA_Style("default")) : new OpenLayers.IAAA_Style("default");
		var child_layer = new OpenLayers.IAAA_WMS(this.layers[i], null, [child_style]);
		this.layer.addLayer(child_layer);
		child_layer.setVisibility(true);
	}
	
	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.WMS";	
};

/**
 * Class: IDEZar_API.WMS.IDEEBase
 * Servicio de mapas IDEE-Base.
 */
IDEZar_API.WMS.IDEEBase = function(options) {

	/**
	* Constructor: IDEZar_API.WMS.IDEEBase
	* Crea WMS de IDEEBase.
	*
	* Parameters:
	* options - {Object} Listado de opciones del WMS.
	*/
	this._super = IDEZar_API.WMS;
	var newOptions = {};
	for (var k in options) {
		newOptions[k] = options[k];
	}
	if (newOptions.layers == null) {
		newOptions.layers = [];
		newOptions.layers[0] = "Todas";
	}
	newOptions.srsList = ["EPSG:4258","EPSG:4230","EPSG:4326","EPSG:25828","EPSG:25829","EPSG:25830","EPSG:25831","EPSG:23028","EPSG:23029","EPSG:23030","EPSG:23031"];
	newOptions.version = "1.1.0";
	this._super("IDEE-Base",
		"http://www.idee.es/wms/IDEE-Base/IDEE-Base",
		newOptions);
	
	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.WMS.IDEEBase";	
};

/**
 * Class: IDEZar_API.WMS.Cartociudad
 * Servicio de mapas Cartociudad.
 */
IDEZar_API.WMS.Cartociudad = function(options) {

	/**
	* Constructor: IDEZar_API.WMS.Cartociudad
	* Crea WMS de Cartociudad.
	*
	* Parameters:
	* options - {Object} Listado de opciones del WMS.
	*/
	this._super = IDEZar_API.WMS;
	var newOptions = {};
	for (var k in options) {
		newOptions[k] = options[k];
	}
	if (newOptions.layers == null) {
		newOptions.layers = [];
		newOptions.layers[0] = "Todas";
	}
	newOptions.serviceType = "WMSC";
	newOptions.isWMSC = true;
	newOptions.maxExtent = new IDEZar_API.Bounds(-180.000000, -90.000000, 180.000000, 90.000000);
	newOptions.version = "1.1.1";
	newOptions.srsList = ["EPSG:4258"];
	newOptions.resolutions = [0.70312500000000000000, 0.35156250000000000000, 0.17578125000000000000,
	0.08789062500000000000, 0.04394531250000000000, 0.02197265625000000000, 0.01098632812500000000,
	0.00549316406250000000, 0.00274658203125000000, 0.00137329101562500000, 0.00068664550781250000,
	0.00034332275390625000, 0.00017166137695312500, 0.00008583068847656250, 0.00004291534423828125,
	0.00002145767211914063, 0.00001072883605957031, 0.00000536441802978516, 0.00000268220901489258,
	0.00000134110450744629];
	newOptions.tiled = true;
	this._super("CartoCiudad WMS-C",
		"http://www.cartociudad.es/wms-c/CARTOCIUDAD/CARTOCIUDAD",
		newOptions);
	
	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.WMS.Cartociudad";	
};

/**
 * Class: IDEZar_API.WMS.PNOA
 * Servicio de mapas PNOA.
 */
IDEZar_API.WMS.PNOA = function(options) {

	/**
	* Constructor: IDEZar_API.WMS.PNOA
	* Crea WMS de PNOA.
	*
	* Parameters:
	* options - {Object} Listado de opciones del WMS.
	*/
	this._super = IDEZar_API.WMS;
	var newOptions = {};
	for (var k in options) {
		newOptions[k] = options[k];
	}
	if (newOptions.layers == null) {
		newOptions.layers = [];
		newOptions.layers[0] = "PNOA";
	}
	newOptions.serviceType = "WMSC";
	newOptions.isWMSC = true;
	newOptions.maxExtent = new IDEZar_API.Bounds(-180.000000, -90.000000, 180.000000, 90.000000);
	newOptions.version = "1.1.1";
	newOptions.srsList = ["EPSG:4258"];
	newOptions.resolutions = [0.70312500000000000000, 0.35156250000000000000, 0.17578125000000000000,
	0.08789062500000000000, 0.04394531250000000000, 0.02197265625000000000, 0.01098632812500000000,
	0.00549316406250000000, 0.00274658203125000000, 0.00137329101562500000, 0.00068664550781250000,
	0.00034332275390625000, 0.00017166137695312500, 0.00008583068847656250, 0.00004291534423828125,
	0.00002145767211914063, 0.00001072883605957031, 0.00000536441802978516, 0.00000268220901489258,
	0.00000134110450744629];
	newOptions.tiled = true;
	this._super("PNOA WMS-C",
		"http://www.idee.es/wms-c/PNOA/PNOA",
		newOptions);
	
	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.WMS.PNOA";	
};

/**
 * Class: IDEZar_API.WMS.GoogleMaps
 * Servicio de mapas GoogleMaps.
 */
IDEZar_API.WMS.GoogleMaps = function(options) {

	/**
	* Property: layer
	* {OpenLayers.Layer.Google} Capa GoogleMaps de OpenLayers.
	*/
	this.layer = null;
	
	/**
	* Property: type
	* {GMapType} Tipo de Capa de GoogleMaps (G_NORMAL_MAP, G_PHYSICAL_MAP, G_HYBRID_MAP, G_SATELLITE_MAP)
	*/
	this.type = null;
	
	/**
	* Property: srsList
	* {String} Lista de SRS del WMS.
	*/
	this.srsList = null;

	/**
	* Constructor: IDEZar_API.WMS.GoogleMaps
	* Crea WMS de GoogleMaps.
	*
	* Parameters:
	* options - {Object} Listado de opciones del WMS.
	*/
	var newOptions = {};
	if (options != null) {
		if (options.type) {
			this.type = options.type;
			newOptions.type = this.type;
		}
	}
	newOptions.showLoadingIcon = true;
	newOptions.sphericalMercator = true;
	// EPSG:900913 equivale a sphericalMercator
	this.srsList = ["EPSG:900913"];
	this.layer = new OpenLayers.Layer.Google("Google Maps", newOptions);
	
	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.WMS.GoogleMaps";	
};

/**
 * Class: IDEZar_API.Tool
 * Herramienta del mapa.
 */
 IDEZar_API.Tool = function(options) {
	
	/**
	* Property: toggle
	* {Boolean} Si la herramienta tiene estado pulsado y no pulsado.
	*/
	this.toggle = null;
	
	/**
	* Property: excluder
	* {Boolean} Si la herramienta es excluyente con el resto de botones,
	* en caso de estar contenida en la barra de herramientas.
	*/
	this.excluder = null;
	
	/**
	* Property: imageStable
	* {String} Ruta del icono, para el estado "estable".
	*/
	this.imageStable = null;
	
	/**
	* Property: imageOver
	* {String} Ruta del icono, para el estado "sobre el icono".
	*/
	this.imageOver = null;
	
	/**
	* Property: imageSelected
	* {String} Ruta del icono, para el estado "pulsado".
	*/
	this.imageSelected = null;
	
	/**
	* Constructor:  IDEZar_API.Tool
	* Crea una herramienta generica.
	*
	* Parameters:
	* tool - {IDEZar_API.Tool}
	* toggle - {Boolean}
	* excluder - {Boolean}
	*/	
	if (options) {
		if (options.toggle != null) {
			this.toggle = options.toggle;
		}
		if (options.excluder != null) {
			this.excluder = options.excluder;
		}
		if (options.icons) {
			// Asegurar que todos los iconos tengan imagen asociada, por si alguna no esta definida
			if (options.icons.imageStable) this.imageStable = options.icons.imageStable;
			else if (options.icons.imageOver) this.imageStable = options.icons.imageOver;
			else if (options.icons.imageSelected) this.imageStable = options.icons.imageSelected;
			if (options.icons.imageOver) this.imageOver = options.icons.imageOver;
			else if (options.icons.imageStable) this.imageOver = options.icons.imageStable;
			else if (options.icons.imageSelected) this.imageOver = options.icons.imageSelected;
			if (options.icons.imageSelected) this.imageSelected = options.icons.imageSelected;
			else if (options.icons.imageStable) this.imageSelected = options.icons.imageStable;
			else if (options.icons.imageOver) this.imageSelected = options.icons.imageOver;
		}
	}
	
	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.Tool";
 };

/**
 * Class: IDEZar_API.Tool.ToolBar
 * Barra de herramientas del mapa.
 */
IDEZar_API.Tool.ToolBar = function(verticalPosition, horizontalPosition, external) {
	
	/**
	* Property: tb
	* {OpenLayers.Control.IAAA_GenericToolBar} Barra de herramientas de OpenLayers.
	*/
	this.tb = null;	
	
	/**
	* Property: verticalPosition
	* {String} Posicion vertical de la barra de herramientas ("top" / "bottom")
	*/
	this.verticalPosition = null;
	
	/**
	* Property: horizontalPosition
	* {String} Posicion horizontal de la barra de herramientas ("left" / "right")
	*/
	this.horizontalPosition = null;
	
	/**
	* Property: external
	* {String} Situar fuera del mapa o dentro
	*/
	this.external = null;
	
	/**
	* Property: kmlSelector
	* {IDEZar_API.Tool.KMLSelector} Control de selección de features dentro de un KML
	*/
	this.kmlSelector = null;
	
	/**
	* Property: drawPoint
	* {IDEZar_API.Tool.DrawPoint} Control para pintar puntos sobre el mapa
	*/
	this.drawPoint = null;
	
	/**
	* Constructor: IDEZar_API.Tool.ToolBar
	* Crea una barra de herramientas vacia.
	*
	* Parameters:
	* verticalPosition - {String} top / bottom
	* horizontalPosition - {String} left / right
	* external - {Boolean} ¿Fuera del mapa?
	*/
	this.addToolToBar = addToolToBar;
	
	this.verticalPosition = verticalPosition;
	this.horizontalPosition = horizontalPosition;
	this.external = external;
	var newOptions = {
		verticalPosition: this.verticalPosition,
		horizontalPosition: this.horizontalPosition,
		margin: new OpenLayers.Pixel(5,5),
		toolSeparationWidth: 4
	};
	if (!this.external) {
		this.tb = new OpenLayers.Control.IAAA_GenericToolBar(newOptions);
	} else {
		this.tb = new OpenLayers.Control.IAAA_ExternalGenericToolBar(newOptions);
	}

	/**
	* Function: addToolToBar
	* Añadir herramienta a la barra de herramientas.
	*
	* Parameters:
	* tool - {IDEZar_API.Tool}
	* toggle - {Boolean} Si tiene estado pulsado y no pulsado
	* excluder - {Boolean} Si es excluyente con el resto de botones
	*/
	function addToolToBar(tool) {
		this.tb.addTool(tool.control, tool.toggle, tool.excluder, tool.imageStable, tool.imageOver, tool.imageSelected);
	};
	
	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.Tool.ToolBar";	
};

/**
 * Class: IDEZar_API.Tool.DefaultToolBar
 * Barra de herramientas del mapa con herramientas por defecto.
 */
IDEZar_API.Tool.DefaultToolBar = function(verticalPosition, horizontalPosition, external) {
	
	/**
	* Property: defaultControls
	* {[IDEZar_API.Tool]} Lista de herramientas por defecto de la barra.
	*/
	this.defaultControls = null;
	
	/**
	* Constructor: IDEZar_API.Tool.DefaultToolBar
	* Crea una barra de herramientas vacia.
	*
	* Parameters:
	* verticalPosition - {String} top / bottom
	* horizontalPosition - {String} left / right
	*/
	this._super = IDEZar_API.Tool.ToolBar;
	this._super(verticalPosition, horizontalPosition, external);

	var fullExtent = new IDEZar_API.Tool.FullExtent();
	var pan = new IDEZar_API.Tool.Dragpan();
	var zBox = new IDEZar_API.Tool.ZoomBox();
	var zOut = new IDEZar_API.Tool.ZoomOut();
	this.defaultControls = [fullExtent, pan, zBox, zOut];
	
	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.Tool.DefaultToolBar";	
};

/**
 * Class: IDEZar_API.Tool.OverviewMap
 * Herramienta para visualizar el mapa de situacion.
 */
IDEZar_API.Tool.OverviewMap = function(icons) {
	
	/**
	* Property: control
	* {OpenLayers.Control.IAAA_OverviewMap}
	*/
	this.control = null;

	/**
	* Constructor: IDEZar_API.Tool.OverviewMap
	* Crea la herramienta Overview Map.
	*
	* Parameters:
	* icons - {Object} Lista de las rutas de la imagenes a establecer como iconos.
	*/
	this._super = IDEZar_API.Tool;
	if (icons) {
		this._super({toggle: true, excluder: false, icons: icons});
	} else {
		this._super({toggle: true, excluder: false});
		this.imageStable = OverviewMap.imageStable;
		this.imageOver = OverviewMap.imageOver;
		this.imageSelected = OverviewMap.imageSelected;
	}
	var overviewLayers = [new OpenLayers.Layer.IAAA_WMS(
		'capa overview',
		'http://www.idee.es/wms/IDEE-Base/IDEE-Base',
		{layers: 'Todas', styles: 'default'}, {visibility: true, singleTile: true})];
	this.control = new OpenLayers.Control.IAAA_OverviewMap({
		title: messages["toggleOverviewTooltip"],
		size: new OpenLayers.Size(140, 78),
		layers: overviewLayers,
		styleExtentBox: '1px solid red',
		updateOverviewMapExtent: true,
		maxRatio: 160.0,
		minRatio: 15.0,
		mapOptions: {
			resolutions: [6.72, 3.36, 1.68, 0.84, 0.42, 0.21, 0.105, 0.0525, 0.02625, 0.01312, 0.00651, 0.00325, 0.00112, 0.00056, 0.00028, 0.00014, 0.00007, 0.00003, 0.00001],
			projection: "EPSG:4258"
		}
	});
	
	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.Tool.OverviewMap";	
};

/**
 * Class: IDEZar_API.Tool.FullExtent
 * Herramienta para volver al extent inical.
 */
IDEZar_API.Tool.FullExtent = function(icons, initialExtent) {
	
	/**
	* Property: control
	* {OpenLayers.Control.IAAA_FullExtent}
	*/
	this.control = null;
	
	/**
	* Property: predefinedInitialExtent
	* {IDEZar_API.Bounds} Area del mapa predefinida que será mostrada al activar
	* la herramienta.
	*/
	this.predefinedInitialExtent = null;
	
	/**
	* Constructor: IDEZar_API.Tool.FullExtent
	* Crea la herramienta Full Extent.
	*
	* Parameters:
	* icons - {Object} Lista de las rutas de la imagenes a establecer como iconos.
	* initialExtent - {IDEZar_API.Bounds} Area inicial predefinida. Si no se
	* indica ninguna, se tomará del mapa.
	*/
	this._super = IDEZar_API.Tool;
	if (icons) {
		this._super({toggle: false, excluder: false, icons: icons});
	} else {
		this._super({toggle: false, excluder: false});
		this.imageStable = FullExtent.imageStable;
		this.imageOver = FullExtent.imageOver;
		this.imageSelected = FullExtent.imageSelected;
	}
	this.predefinedInitialExtent = initialExtent;
	
	if (this.predefinedInitialExtent) {
		this.control = new OpenLayers.Control.IAAA_FullExtent({
			title: messages["fullExtentTooltip"],
			predefinedInitialExtent: this.predefinedInitialExtent.bounds
		});
	} else {
		this.control = new OpenLayers.Control.IAAA_FullExtent({
			title: messages["fullExtentTooltip"]
		});
	}
	
	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.Tool.FullExtent";	
};

/**
 * Class: IDEZar_API.Tool.ZoomBox
 * Herramienta para aumentar el zoom.
 */
IDEZar_API.Tool.ZoomBox = function(icons) {
	
	/**
	* Property: control
	* {OpenLayers.Control.IAAA_ZoomBox}
	*/
	this.control = null;
	
	/**
	* Constructor: IDEZar_API.Tool.ZoomBox
	* Crea la herramienta Zoom Box.
	*
	* Parameters:
	* icons - {Object} Lista de las rutas de la imagenes a establecer como iconos.
	*/
	this._super = IDEZar_API.Tool;
	if (icons) {
		this._super({toggle: true, excluder: true, icons: icons});
	} else {
		this._super({toggle: true, excluder: true});
		this.imageStable = ZoomBox.imageStable;
		this.imageOver = ZoomBox.imageOver;
		this.imageSelected = ZoomBox.imageSelected;
	}
	this.control = new OpenLayers.Control.IAAA_ZoomBox({title: messages["zoomInCenteredTooltip"]});
	
	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.Tool.ZoomBox";	
};

/**
 * Class: IDEZar_API.Tool.ZoomOut
 * Herramienta para disminuir el zoom.
 */
IDEZar_API.Tool.ZoomOut = function(icons) {
	
	/**
	* Property: control
	* {OpenLayers.Control.IAAA_ZoomOut}
	*/
	this.control = null;
	
	/**
	* Constructor: IDEZar_API.Tool.ZoomOut
	* Crea la herramienta Zoom Out.
	*
	* Parameters:
	* icons - {Object} Lista de las rutas de la imagenes a establecer como iconos.
	*/
	this._super = IDEZar_API.Tool;
	if (icons) {
		this._super({toggle: true, excluder: true, icons: icons});
	} else {
		this._super({toggle: true, excluder: true});
		this.imageStable = ZoomOut.imageStable;
		this.imageOver = ZoomOut.imageOver;
		this.imageSelected = ZoomOut.imageSelected;
	}
	this.control = new OpenLayers.Control.IAAA_ZoomOut({title: messages["zoomOutCenteredTooltip"]});
	
	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.Tool.ZoomOut";	
};

/**
 * Class: IDEZar_API.Tool.Dragpan
 * Herramienta para moverse sobre el mapa.
 */
IDEZar_API.Tool.Dragpan = function(icons) {
	
	/**
	* Property: control
	* {OpenLayers.Control.IAAA_DragPan}
	*/
	this.control = null;
	
	/**
	* Constructor: IDEZar_API.Tool.Dragpan
	* Crea la herramienta Dragpan.
	*
	* Parameters:
	* icons - {Object} Lista de las rutas de la imagenes a establecer como iconos.
	*/
	this._super = IDEZar_API.Tool;
	if (icons) {
		this._super({toggle: true, excluder: true, icons: icons});
	} else {
		this._super({toggle: true, excluder: true});
		this.imageStable = DragPan.imageStable;
		this.imageOver = DragPan.imageOver;
		this.imageSelected = DragPan.imageSelected;
	}
	this.control = new OpenLayers.Control.IAAA_DragPan({title: messages["pannigTooltip"]});
	
	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.Tool.Dragpan";	
};

/**
 * Class: IDEZar_API.Tool.Area
 * Herramienta para medir areas sobre el mapa.
 */
IDEZar_API.Tool.Area = function(icons) {
	
	/**
	* Property: control
	* {OpenLayers.Control.IAAA_AreaMeasure}
	*/
	this.control = null;
	
	/**
	* Constructor: IDEZar_API.Tool.Area
	* Crea la herramienta Area.
	*
	* Parameters:
	* icons - {Object} Lista de las rutas de la imagenes a establecer como iconos.
	*/
	this._super = IDEZar_API.Tool;
	if (icons) {
		this._super({toggle: true, excluder: true, icons: icons});
	} else {
		this._super({toggle: true, excluder: true});
		this.imageStable = AreaMeasure.imageStable;
		this.imageOver = AreaMeasure.imageOver;
		this.imageSelected = AreaMeasure.imageSelected;
	}
	var newOptions = {};
	newOptions.geometryStyle = MeasureTools.geometryStyle;
	newOptions.textStyle = MeasureTools.textStyle;
	newOptions.visibleDIV = true;
	newOptions.measureText = messages["areaText"];
	newOptions.title = messages["measureAreaTooltip"];
	this.control = new OpenLayers.Control.IAAA_AreaMeasure(newOptions);
	
	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.Tool.Area";	
};

/**
 * Class: IDEZar_API.Tool.Distance
 * Herramienta para medir distancias sobre el mapa.
 */
IDEZar_API.Tool.Distance = function(icons) {
	
	/**
	* Property: control
	* {OpenLayers.Control.IAAA_DistanceMeasure}
	*/
	this.control = null;
	
	/**
	* Constructor: IDEZar_API.Tool.Distance
	* Crea la herramienta Distance.
	*
	* Parameters:
	* icons - {Object} Lista de las rutas de la imagenes a establecer como iconos.
	*/
	this._super = IDEZar_API.Tool;
	if (icons) {
		this._super({toggle: true, excluder: true, icons: icons});
	} else {
		this._super({toggle: true, excluder: true});
		this.imageStable = DistanceMeasure.imageStable;
		this.imageOver = DistanceMeasure.imageOver;
		this.imageSelected = DistanceMeasure.imageSelected;
	}
	var newOptions = {};
	newOptions.geometryStyle = MeasureTools.geometryStyle;
	newOptions.textStyle = MeasureTools.textStyle;
	newOptions.visibleDIV = true;
	newOptions.measureText = messages["distanceText"];
	newOptions.title = messages["measureDistanceTooltip"];
	this.control = new OpenLayers.Control.IAAA_DistanceMeasure(newOptions);
	
	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.Tool.Distance";	
};

/**
 * Class: IDEZar_API.Tool.ScaleBar
 * Herramienta para mostrar la escala del mapa.
 */
IDEZar_API.Tool.ScaleBar = function(position, size) {
	
	/**
	* Property: control
	* {OpenLayers.Control.IAAA_ImprovedScaleBar}
	*/
	this.control = null;
	
	/**
	* Property: position
	* {String} Posicion de la barra de escala sobre el mapa.
	*/
	this.position = null;

	/**
	* Property: size
	* {String} Tamaño de la barra de escala .
	*/	
	this.size = null;

	/**
	* Property: minWidth
	* {Integer} Tamaño minimo en pixels de la barra de escala .
	*/	
	this.minWidth = null;

	/**
	* Property: maxWidth
	* {Integer} Tamaño maximo en pixels de la barra de escala .
	*/	
	this.maxWidth = null;
	
	/**
	* Constructor: IDEZar_API.Tool.ScaleBar
	* Crea la herramienta ScaleBar.
	*
	* Parameters:
	* position - {String} Posicion de la barra de escala (left / right).
	* size - {String} Tamaño de la barra de escala (little / big).
	*/
	var newPosition;
	if (position) {
		this.position = position;
	} else {
		this.position = "right";
	}
	if (size) {
		this.size = size;
	} else {
		this.size = "little";
	}
	if (this.size == "little") {
		this.minWidth = 130;
		this.maxWidth = 131;
	} else {
		this.minWidth = 170;
		this.maxWidth = 171;
	}
	
	this.control = new OpenLayers.Control.IAAA_ImprovedScaleBar(
		{minWidth: this.minWidth,
		maxWidth: this.maxWidth,
		barAlign: this.position,
		align: "right",
		measurementProperties: {
			metric: {
				units: ["kilometros"],
				abbr: ["km"],
				inches: [39370.07874]
		}}});
	
	// Ajustar la posicion del DIV que contiene los numeros
	if (IDEZar_API.isNetscape()) this.control.numbersContainer.style.left = "-20px";
	
	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.Tool.ScaleBar";	
};

/**
 * Class: IDEZar_API.Tool.NavBarInfo
 * Herramienta para mostrar las coordenadas del mapa.
 */
IDEZar_API.Tool.NavBarInfo = function(icons) {
	
	/**
	* Property: control
	* {OpenLayers.Control.IAAA_NavBarInfo}
	*/
	this.control = null;
	
	/**
	* Constructor: IDEZar_API.Tool.NavBarInfo
	* Crea la herramienta NavBarInfo.
	*
	* Parameters:
	* icons - {String} Ruta de la imagen a establecer como icono.
	*/
	this.control = new OpenLayers.Control.IAAA_NavBarInfo({
		firstCoordProjection: "mapProjection",
		mapText: "Mapa",
		scaleText: "Escala",
		drawInStatusBar: true
	});
	
	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.Tool.NavBarInfo";	
};

/**
 * Class: IDEZar_API.Tool.MouseWheelZoom
 * Herramienta para realizar aumentar o disminuir el zoom con
 * la rueda del raton.
 */
IDEZar_API.Tool.MouseWheelZoom = function(icons) {
	
	/**
	* Property: control
	* {OpenLayers.Control.IAAA_MouseWheelZoom}
	*/
	this.control = null;
	
	/**
	* Constructor: IDEZar_API.Tool.MouseWheelZoom
	* Crea la herramienta MouseWheelZoom.
	*
	* Parameters:
	* icons - {String} Ruta de la imagen a establecer como icono.
	*/
	this.control = new OpenLayers.Control.IAAA_MouseWheelZoom();
	
	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.Tool.MouseWheelZoom";	
};

/**
 * Class: IDEZar_API.Tool.LoadingMap
 * Herramienta para mostrar un mensaje de espera mientras se carga el mapa.
 */
IDEZar_API.Tool.LoadingMap = function(icons) {
	
	/**
	* Property: control
	* {OpenLayers.Control.IAAA_LoadingMap}
	*/
	this.control = null;
	
	/**
	* Constructor: IDEZar_API.Tool.LoadingMap
	* Crea la herramienta LoadingMap.
	*
	* Parameters:
	* icons - {String} Ruta de la imagen a establecer como icono.
	*/
	this.control = new OpenLayers.Control.IAAA_LoadingMap({
		messageColor: LoadingMap.messageColor,
		wmsClientFontFamily: LoadingMap.wmsClientFontFamily,
		standardFontSize: LoadingMap.standardFontSize,
		loadingMessage: messages["loadingMap"],
		loadingImg: LoadingMap.loadingImg
	});
	
	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.Tool.LoadingMap";	
};

/**
 * Class: IDEZar_API.Tool.Tab
 * Herramienta para agrupar una serie de WMS en una pestaña.
 */
IDEZar_API.Tool.Tab = function(name, wmslist) {
	
	/**
	* Property: control
	* {OpenLayers.Control.IAAA_Tab}
	*/
	this.control = null;
	
	/**
	* Property: name
	* {String}
	*/
	this.name = null;
	
	/**
	* Property: wmslist
	* {[IDEZar_API.WMS]}
	*/
	this.wmslist = null;
	
	/**
	* Constructor: IDEZar_API.Tool.Tab
	* Crea la herramienta Tab.
	*
	* Parameters:
	* name - {String}
	* wmslist - {[IDEZar_API.WMS]} Lista de WMS previamente añadidos al mapa
	*/
	this.addWMS = addWMS;
	
	this.name = name;
	this.wmslist = wmslist;
	var layerList = [];
	for (var i in wmslist) {
		layerList.push(wmslist[i].layer);
	}
	this.control = new OpenLayers.Control.IAAA_Tab({
		name: this.name,
		layerList: layerList,
		style: {
			fontFamily: Tabs.fontFamily,
			fontSize: Tabs.fontSize,
			imgLeftOff: Tabs.imgLeftOff,
			imgCenterOff: Tabs.imgCenterOff,
			imgRightOff: Tabs.imgRightOff,
			imgLeftOn: Tabs.imgLeftOn,
			imgCenterOn: Tabs.imgCenterOn,
			imgRightOn: Tabs.imgRightOn,
			imgHeight: Tabs.imgHeight
		}
	});
	
	/**
	* Function: addWMS
	* Añadir un WMS a la pestaña.
	*
	* Parameters:
	* wms - {IDEZar_API.WMS}
	*/
	function addWMS(wms) {
		this.control.addLayer(wms.layer);
	};
	
	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.Tool.Tab";	
};

/**
 * Class: IDEZar_API.Tool.Nomenclator
 * Herramienta de busqueda de toponimos y localizacion.
 */
IDEZar_API.Tool.Nomenclator = function(icons) {
	
	/**
	* Property: control
	* {OpenLayers.Control.IAAA_LocalNomenclator}
	*/
	this.control = null;
	
	/**
	* Constructor: IDEZar_API.Tool.Nomenclator
	* Crea la herramienta Nomenclator.
	*
	* Parameters:
	* icons - {Object} Lista de las rutas de la imagenes a establecer como iconos.
	*/
	this._super = IDEZar_API.Tool;
	if (icons) {
		this._super({toggle: false, excluder: false, icons: icons});
	} else {
		this._super({toggle: false, excluder: false});
		this.imageStable = Nomenclator.imageStable;
		this.imageOver = Nomenclator.imageOver;
		this.imageSelected = Nomenclator.imageSelected;
	}
	var newOptions = {};
	newOptions.title = messages["nomenclatorTitle"];
	newOptions.toponymMessage = messages["toponymText"];
	newOptions.typeMessage = messages["typeText"];
	this.control = new OpenLayers.Control.IAAA_LocalNomenclator(Nomenclator.servletUrl, Nomenclator.serviceUrl, IDEZar_API.lang, Nomenclator.style, newOptions);
	
	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.Tool.Nomenclator";
};

/**
 * Class: IDEZar_API.Tool.KMLSelector
 * Muestra información de las capas KML asociadas.
 */
IDEZar_API.Tool.KMLSelector = function(layer, icons) {
	
	/**
	* Property: control
	* {OpenLayers.Control.SelectFeature}
	*/
	this.control = null;
	
	/**
	* Property: controlIcons
	* {OpenLayers.Control.SelectFeature}
	*/
	this.controlIcons = null;
	
	/**
	* Property: kmlLayer
	* {OpenLayers.Layer.Vector}
	*/
	this.kmlLayer = null;
	
	/**
	* Constructor: IDEZar_API.Tool.KMLSelector
	* Crea la herramienta KMLSelector.
	*
	* Parameters:
	* layer - {OpenLayers.Layer.Vector}
	* icons - {Object} Lista de las rutas de la imagenes a establecer como iconos.
	*/
	this._super = IDEZar_API.Tool;
	if (icons) {
		this._super({toggle: true, excluder: true, icons: icons});
	} else {
		this._super({toggle: true, excluder: true});
		this.imageStable = KMLSelector.imageStable;
		this.imageOver = KMLSelector.imageOver;
		this.imageSelected = KMLSelector.imageSelected;
	}
	this.kmlLayer = layer;
	
	// Control que muestra un Popup al seleccionar una feature
	this.control = new OpenLayers.Control.SelectFeature(this.kmlLayer, {title: messages["kmlSelectorTooltip"]});
	// Comportamiento al seleccionar una feature
	this.control.select = function(feature) {
		var cont = this.onBeforeSelect.call(this.scope, feature);
        var layer = feature.layer;
        if(cont !== false) {
            cont = layer.events.triggerEvent("beforefeatureselected", {
                feature: feature
            });
            if(cont !== false) {
                layer.selectedFeatures.push(feature);
                this.highlight(feature);
                layer.events.triggerEvent("featureselected", {feature: feature});
                // Alternativa al uso de eventos
                if (feature.showInfo) {
                	feature.showInfo();
                }
                this.onSelect.call(this.scope, feature);
            }
        }
    };
    // Comportamiento al deseleccionar una feature
    this.control.unselect = function(feature) {
        var layer = feature.layer;
        // Store feature style for restoration later
        this.unhighlight(feature);
        OpenLayers.Util.removeItem(layer.selectedFeatures, feature);
        layer.events.triggerEvent("featureunselected", {feature: feature});
        // Alternativa al uso de eventos
        if (feature.hideInfo) {
        	feature.hideInfo();
        }
        this.onUnselect.call(this.scope, feature);
    };
    // Comportamiento al activar el control
    this.control.activate = function () {
    	// Activar el control conjunto (cambiar tamaño de icono de features)
    	if (this.additionalControl) {
    		this.additionalControl.activate();
    	}
    	if (!this.active) {
            if(this.layers) {
                this.map.addLayer(this.layer);
            }
            this.handlers.feature.activate();
            if(this.box && this.handlers.box) {
                this.handlers.box.activate();
            }
        }
        return OpenLayers.Control.prototype.activate.apply(
            this, arguments
        );
    };
    // Comportamiento al desactivar el control
    this.control.deactivate = function () {
    	// Desactivar el control conjunto (cambiar tamaño de icono de features)
    	if (this.additionalControl) {
    		this.additionalControl.deactivate();
    	}
    	if (this.active) {
            this.handlers.feature.deactivate();
            if(this.handlers.box) {
                this.handlers.box.deactivate();
            }
            if(this.layers) {
                this.map.removeLayer(this.layer);
            }
        }
        // Deseleccionar todas las features
        this.unselectAll();
        // Eliminar Popups sobre el mapa
		for (i = (this.map.popups.length - 1); i>=0; i--) {
			this.map.removePopup(this.map.popups[i]);
		}
        return OpenLayers.Control.prototype.deactivate.apply(
            this, arguments
        );
    };
    
    // Control que cambia el tamaño del icono de una features al pasar sobre ella
    var report = function(e) {
        OpenLayers.Console.log(e.type, e.feature.id);
    };
    var onFeatureOver = function (feature) {
    	if (feature && feature.style && feature.style.graphicWidth && feature.style.graphicHeight) {
    		feature.style.graphicWidth += 10;
    		feature.style.graphicHeight += 10;
    		feature.layer.drawFeature(feature);
    	}
    };
    var onFeatureOut = function (feature) {
    	if (feature && feature.style && feature.style.graphicWidth && feature.style.graphicHeight) {
    		feature.style.graphicWidth -= 10;
    		feature.style.graphicHeight -= 10;
    		feature.layer.drawFeature(feature);
    	}
    };
    this.controlIcons = new OpenLayers.Control.SelectFeature(this.kmlLayer, {
    	hover: true,
        highlightOnly: true,
        renderIntent: "temporary",
        eventListeners: {
            beforefeaturehighlighted: report,
            featurehighlighted: report,
            featureunhighlighted: report
        },
        overFeature: onFeatureOver,
        outFeature: onFeatureOut
    });
    // Comportamiento al activar el control
    this.controlIcons.activate = function () {
    	if (!this.active) {
            if(this.layers) {
                this.map.addLayer(this.layer);
            }
            this.handlers.feature.activate();
            if(this.box && this.handlers.box) {
                this.handlers.box.activate();
            }
        }
        return OpenLayers.Control.prototype.activate.apply(
            this, arguments
        );
    };
    
    // Establecer relación entre ambos controles
    this.control.additionalControl = this.controlIcons;

	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.Tool.KMLSelector";	
};

/**
 * Class: IDEZar_API.Tool.DrawPoint
 * Dibujar puntos sobre el mapa.
 */
IDEZar_API.Tool.DrawPoint = function(multipoint, icons) {
	
	/**
	* Property: control
	* {OpenLayers.Control.DrawFeature}
	*/
	this.control = null;
	
	/**
	* Property: multipoint
	* {Boolean}
	*/
	this.multipoint = null;
	
	/**
	* Property: featuresTemporalLayer
	* {OpenLayers.Layer.Vector}
	*/
	this.featuresTemporalLayer = null;
	
	/**
	* Property: featuresLayer
	* {OpenLayers.Layer.Vector}
	*/
	this.featuresLayer = null;
	
	/**
	* Constructor: IDEZar_API.Tool.DrawPoint
	* Crea la herramienta DrawPoint.
	* 
	* Permite pintar múltiples puntos o sólo uno. En el segundo caso, guarda
	* una referencia en el control al punto dibujado.
	*
	* Parameters:
	* multipoint - {Boolean} Permitir pintar múltiples puntos.
	* icons - {Object} Lista de las rutas de la imagenes a establecer como iconos.
	*/
	this._super = IDEZar_API.Tool;
	this.multipoint = multipoint;
	if (icons) {
		this._super({toggle: true, excluder: true, icons: icons});
	} else {
		this._super({toggle: true, excluder: true});
		this.imageStable = DrawPoint.imageStable;
		this.imageOver = DrawPoint.imageOver;
		this.imageSelected = DrawPoint.imageSelected;
	}
	
	// Capa en la que son pintados los puntos por el handler
	this.featuresTemporalLayer = new OpenLayers.Layer.Vector("DrawPoint_Temporal_Layer", {
		style: MeasureTools.geometryStyle,
		visibility: true,
		displayOutsideMaxExtent: true,
		alwaysInRange: true
	});
	
	// Capa en la que son se mantienen los puntos pintados
	this.featuresLayer = new OpenLayers.Layer.Vector("DrawPoint_Layer", {
		style: MeasureTools.geometryStyle,
		visibility: true,
		displayOutsideMaxExtent: true,
		alwaysInRange: true,
		additionalInfo: true
	});
	
	// Control para pintar puntos
	var newOptions = {};
	newOptions.title = messages["drawPointTooltip"];
	newOptions.handlerOptions = {
		style: MeasureTools.geometryStyle
	};
	this.control = new OpenLayers.Control.DrawFeature(this.featuresTemporalLayer, OpenLayers.Handler.Point, newOptions);
	// Relacionar con capa para pintar puntos permanentemente
	this.control.handler.permanentLayer = this.featuresLayer;
	this.control.handler.multipoint = this.multipoint;
	this.control.handler.setMap = function (map) {
        this.map = map;
        this.map.addLayer(this.control.handler.permanentLayer);
        
    };
    // Comportamiento al hacer presionar el botón del ratón
	this.control.handler.mousedown = function(evt) {
		// check keyboard modifiers
        if (!this.checkModifiers(evt)) {
            return true;
        }
        // ignore double-clicks
        if (this.lastDown && this.lastDown.equals(evt.xy)) {
            return true;
        }
        // Borrar el resto de features si sólo se permite pintar una
        if (!this.multipoint) {
			this.control.handler.permanentLayer.destroyFeatures();
		}
        if (this.lastDown == null) {
            this.createFeature(evt.xy);
        }
        this.lastDown = evt.xy;
        this.drawing = true;
        var lonlat = this.map.getLonLatFromPixel(evt.xy);
        this.point.geometry.x = lonlat.lon;
        this.point.geometry.y = lonlat.lat;
        this.drawFeature();
        return false;
	};
	// Comportamiento al hacer soltar el botón del ratón
	this.control.handler.mouseup = function(evt) {
		if (this.drawing) {
			var newFeature = this.point.clone();
			this.control.handler.permanentLayer.addFeatures(newFeature);
			// Guardarse la feature si sólo se permite pintar una
	        if (!this.multipoint) {
				this.control.currentPoint = newFeature;
				this.control.currentPoint.srs = this.map.getProjection();
			}
            this.finalize();
            return false;
        } else {
            return true;
        }
	};
	
	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.Tool.DrawPoint";
};

/**
 * Class: IDEZar_API.Bounds
 * Coordenadas de un area geografica rectangular.
 */
IDEZar_API.Bounds = function(left, bottom, right, top, srs) {
	
	/**
	* Property: bounds
	* {OpenLayers.IAAA_Bounds}
	*/
	this.bounds = null;
	
	/**
	* Property: left
	* {Float}
	*/
	this.left = null;
	
	/**
	* Property: bottom
	* {Float}
	*/
	this.bottom = null;
	
	/**
	* Property: right
	* {Float}
	*/
	this.right = null;
	
	/**
	* Property: top
	* {Float}
	*/
	this.top = null;
	
	/**
	* Property: srs
	* {String} SRS de las coordenadas.
	*/
	this.srs = null;
	
	/**
	* Constructor: IDEZar_API.Bounds
	* Representa un area geografica mediante sus coordenadas. Opcionalmente,
	* puede indicarse el SRS de dichas coordenadas (recomendable). Si no, se
	* asume que es igual al del mapa al que se le vaya a asociar.
	*
	* Parameters:
	* left - {Float}
	* bottom - {Float}
	* right - {Float}
	* top - {Float}
	* srs - {String}
	*/
	this.setSrs = setSrs;
	this.transformSrs = transformSrs;
	
	this.left = left;
	this.bottom = bottom;
	this.right = right;
	this.top = top;
	this.srs = srs;
	this.bounds = new OpenLayers.IAAA_Bounds(left, bottom, right, top);
	if (this.srs != null) {
		this.bounds.setSrs(srs);
	}
	
	/**
	* Function: setSrs
	* Establecer el SRS de las coordenadas del area geografica.
	*
	* Parameters:
	* newSrs - {String}
	*/
	function setSrs(newSrs) {
		this.srs = newSrs;
		this.bounds.setSrs(this.srs);
	};
	
	/**
	* Function: transformSrs
	* Transformar el SRS de las coordenadas del area geografica.
	*
	* Parameters:
	* newSrs - {String}
	*/
	function transformSrs(newSrs) {
		this.srs = newSrs;
		this.bounds.transformSrs(this.srs);
	};

	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.Bounds";	
};

/**
 * Class: IDEZar_API.File
 * Fichero a cargar sobre el mapa.
 */
 IDEZar_API.File = function(url) {
	
	/**
	* Property: url
	* {Object} URL del fichero / Objeto con la información espacial
	*/
	this.url = null;
	
	/**
	* Constructor:  IDEZar_API.File
	* Crea un enlace a un fichero genérico.
	*
	* Parameters:
	* url - {String}
	*/	
	this.url = url;
	
	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.File";
 };

/**
 * Class: IDEZar_API.File.GML
 * Contenedor de información geográfica basada en el estándar GML.
 */
IDEZar_API.File.GML = function(url, style) {
	
	/**
	* Property: style
	* {Object} Lista de propiedades de estilo para las geometrías del GML a
	* pintar sobre el mapa. Propiedades soportadas: fillColor, fillOpacity,
	* hoverFillColor, hoverFillOpacity, strokeColor, strokeOpacity,
	* strokeWidth, strokeLinecap, strokeDashstyle, hoverStrokeColor,
	* hoverStrokeOpacity, hoverStrokeWidth, pointRadius, hoverPointRadius,
	* hoverPointUnit, pointerEvents, cursor, externalGraphic, graphicWidth,
	* graphicHeight, graphicOpacity, graphicXOffset, graphicYOffset,
	* graphicName, display.
	*/
	this.style = null;
	
	/**
	* Constructor: IDEZar_API.File.GML
	* Representa información geográfica siguiendo el estándar GML. Para ello,
	* tiene asociado la dirección local de un fichero en dicho formato.
	*
	* Parameters:
	* url - {String}
	* style - {Object}
	*/	
	this._super = IDEZar_API.File;
	this._super(url);
	if (style) {
		this.style = style;
	} else {
		this.style = GML.geometryStyle;
	}

	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.File.GML";	
};

/**
 * Class: IDEZar_API.File.KML
 * Contenedor de información geográfica basada en el estándar KML.
 */
IDEZar_API.File.KML = function(url, srs) {
	
	/**
	* Property: srs
	* {String} SRS de los datos contenidos en el KML
	*/
	this.srs = null;
	
	/**
	* Constructor: IDEZar_API.File.KML
	* Representa información geográfica siguiendo el estándar KML. Para ello,
	* tiene asociado la dirección local de un fichero en dicho formato.
	* 
	* Si no se indica lo contrario, se asume que las entidades contenidas en el
	* KML están en el mismo SRS que el mapa.
	*
	* Parameters:
	* url - {String}
	* srs - {String}
	*/	
	this._super = IDEZar_API.File;
	this._super(url);
	this.srs = srs;

	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.File.KML";	
};

/**
 * Class: IDEZar_API.File.GeoRSS
 * Contenedor de información geográfica basada en el estándar GeoRSS.
 */
IDEZar_API.File.GeoRSS = function(url, srs) {
	
	/**
	* Property: srs
	* {String} SRS de los datos contenidos en el GeoRSS
	*/
	this.srs = null;
	
	/**
	* Constructor: IDEZar_API.File.GeoRSS
	* Representa información geográfica siguiendo el estándar GeoRSS. Para
	* ello, tiene asociado la dirección de un fichero en dicho formato.
	* 
	* En este caso, la dirección del fichero GeoRSS no tiene porque ser local.
	* Si no es local, deberá definirse un Proxy por el que pasen las peticiones
	* en el mapa asociado al visualizador.
	* 
	* Si no se indica lo contrario, se asume que las entidades contenidas en el
	* GeoRSS están en el mismo SRS que el mapa.
	*
	* Parameters:
	* url - {String}
	* srs - {String}
	*/	
	this._super = IDEZar_API.File;
	this._super(url);
	this.srs = srs;

	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.File.GeoRSS";	
};

/**
 * Class: IDEZar_API.File.GeoJSON
 * Contenedor de información geográfica basada en el estándar GeoJSON.
 */
IDEZar_API.File.GeoJSON = function(object, srs, style) {
	
	/**
	* Property: srs
	* {String} SRS de los datos contenidos en el GeoJSON
	*/
	this.srs = null;
	
	/**
	* Property: style
	* {Object} Lista de propiedades de estilo para las geometrías del GML a
	* pintar sobre el mapa. Propiedades soportadas: fillColor, fillOpacity,
	* hoverFillColor, hoverFillOpacity, strokeColor, strokeOpacity,
	* strokeWidth, strokeLinecap, strokeDashstyle, hoverStrokeColor,
	* hoverStrokeOpacity, hoverStrokeWidth, pointRadius, hoverPointRadius,
	* hoverPointUnit, pointerEvents, cursor, externalGraphic, graphicWidth,
	* graphicHeight, graphicOpacity, graphicXOffset, graphicYOffset,
	* graphicName, display.
	*/
	this.style = null;
	
	/**
	* Constructor: IDEZar_API.File.GeoJSON
	* Representa información geográfica siguiendo el estándar GeoJSON. Para
	* ello, tiene asociado un objeto en dicho formato.
	* 
	* Se intenta extraer el SRS del objeto GeoJSON. Si no lo encuentra, y no
	* se indica lo contrario, se asume que las entidades contenidas en el
	* GeoJSON están en el mismo SRS que el mapa.
	*
	* Parameters:
	* object - {Object}
	* srs - {String}
	*/	
	this._super = IDEZar_API.File;
	this._super(object);
	this.srs = srs;
	if (style) {
		this.style = style;
	} else {
		this.style = GML.geometryStyle;
	}

	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.File.GeoJSON";	
};


/**
 * Class: IDEZar_API.Parser
 * Parseador genérico.
 */
IDEZar_API.Parser = function() {

	/**
	* Constructor:  IDEZar_API.Parser
	* Crea un parseador genérico.
	*/
	
	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.Parser";	
};

/**
 * Class: IDEZar_API.Parser.GML
 * Parseador de GML.
 */
IDEZar_API.Parser.GML = function(defaultSrs, onError) {
	
	
	/**
	* Property: defaultSrs
	* {String} SRS por defecto de las geometrías leídas
	*/
	this.defaultSrs = null;
	
	/**
	* Property: onLoadGMLError
	* {function} Función a ejecutar en caso de error al parsear
	*/
	this.onLoadGMLError = null;
	
	/**
	* Constructor: IDEZar_API.Parser.GML
	* Parseador de GML. Realiza operaciones sobre ficheros basados en dicho
	* estándar.
	*/	
	this._super = IDEZar_API.Parser;
	this._super();
	
	this.getGeometriesFromGML = getGeometriesFromGML;
	this.parseSchemaLocation = parseSchemaLocation;
	
	this.defaultSrs = defaultSrs;
	if (onError != null) {
		this.onLoadGMLError = onError;
	} else {
		this.onLoadGMLError = function(e) {};
	}

	/**
	* Function: getGeometriesFromGML
	* Extraer las geometrias de un GML.
	*
	* Parameters:
	* gml - {XMLDocument / String}
	*/
	function getGeometriesFromGML(gml) {
		// Si llega una cadena, transformarla a XML
		if (typeof gml == "string") { 
			gml = OpenLayers.Format.XML.prototype.read.apply(this, [gml]);
        }
		
		// Intentar extraer el atributo schemaLocation
		try {
			var schemaLocation = gml.documentElement.getAttribute("xsi:schemaLocation");
		} catch (e) {
			this.onLoadGMLError(e);
			return [];
		}		
		var result = [];
		if (schemaLocation != null) {
			result = this.parseSchemaLocation(schemaLocation);
		}
		// Crear parsers en función de si hay o no schemaLocation
		var formatReaderV3;
		var formatReaderV2;
		var formatReaderV1 = new OpenLayers.Format.GML();
		if ((result[0]) && (result[1])) {
			formatReaderV3 = new OpenLayers.Format.GML.v3(
				{featureNS: result[0],
				featureType: result[1]});
			formatReaderV2 = new OpenLayers.Format.GML.v2(
					{featureNS: result[0],
					featureType: result[1]});
		}

		// Leer el GML para extraer las features (y tomar sus geometrías)
		// Se hacen varios intentos para parsear con las distintas versiones de GML
		// (al parsear una versión de GML con un parseador de otra versión, pude haber error)
		var basicParse = false;
		var resultFeatures;
		if (formatReaderV3 && formatReaderV2) {
			try {
				resultFeatures = formatReaderV3.read(gml);
			} catch (e) {
				try {
					resultFeatures = formatReaderV2.read(gml);
				} catch (e) {
					resultFeatures = formatReaderV1.read(gml);
					basicParse = true;
				}
			}
		} else {
			resultFeatures = formatReaderV1.read(gml);
			basicParse = true;
		}
		
		if (resultFeatures.length > 0) {
			// Guardar geometrías extraídas
			var tempGeometries = [];
			for (var i in resultFeatures) {
				if (resultFeatures[i].geometry) {
					tempGeometries.push(resultFeatures[i].geometry);
				}
			}
			
			// Probar a extraer geometrías de versiones de GML anteriores
			if ((tempGeometries.length == 0) && (!basicParse)) {
				resultFeatures = formatReaderV1.read(gml);
				for (var i in resultFeatures) {
					if (resultFeatures[i].geometry) {
						tempGeometries.push(resultFeatures[i].geometry);
					}
				}
			}
			
			// Leer el GML para extraer el SRS
			var geometriesSrs;
			var featureBoundedBy = formatReaderV1.getElementsByTagNameNS(gml.documentElement,
					"http://www.opengis.net/gml",
	                "boundedBy");
			if (featureBoundedBy.length > 0) {
				var featureEnvelope = formatReaderV1.getElementsByTagNameNS(featureBoundedBy[0],
						"http://www.opengis.net/gml",
		                "Envelope");
				if (featureEnvelope.length > 0) {
					geometriesSrs = featureEnvelope[0].getAttribute("srsName");
				} else {
					var featureBox = formatReaderV1.getElementsByTagNameNS(featureBoundedBy[0],
							"http://www.opengis.net/gml",
			                "Box");
					if (featureBox.length > 0) {
						geometriesSrs = featureBox[0].getAttribute("srsName");
					}
				}
			}
			
			// Guardar las geometrías del GML
			var geometries = [];
			var g = 0;
			for (var i in tempGeometries) {
				if ((tempGeometries[i].CLASS_NAME == "OpenLayers.Geometry.MultiPolygon")
						|| (tempGeometries[i].CLASS_NAME == "OpenLayers.Geometry.MultiPoint")
						|| (tempGeometries[i].CLASS_NAME == "OpenLayers.Geometry.Curve")) {
					for (var j in tempGeometries[i].components) {
						geometries[g] = tempGeometries[i].components[j];
						g++;
					}
				} else if ((tempGeometries[i].CLASS_NAME == "OpenLayers.Geometry.Polygon")
						|| (tempGeometries[i].CLASS_NAME == "OpenLayers.Geometry.Point")
						|| (tempGeometries[i].CLASS_NAME == "OpenLayers.Geometry.LineString")) {
					geometries[g] = tempGeometries[i];
					g++;
				}
			}
			
			// Devolver geometrias con su SRS asociado
			var SRSGeometries = [];
			for (var i in geometries) {
				if (!geometriesSrs) {
					geometriesSrs = this.defaultSrs;
				}
				SRSGeometry = new OpenLayers.IAAA_SRSGeometry(geometries[i], geometriesSrs);
				SRSGeometries.push(SRSGeometry);
			}
			return SRSGeometries;
		} else {
			this.onLoadGMLError(1);
			return [];
		}
	};
	
	/**
     * Function: parseSchemaLocation
     * Parsear el atributo schemaLocation de un GML para extraer los
     * featureNS y featureType del mismo. Algunas operaciones WPS devuelven
     * un GML del que extraer geometrias.
     * 
     * Returns:
     * {String, String}
     */
	function parseSchemaLocation(s) {
		var result = [];
		// Buscar el atributo "typeName" y su prefijo
		// Patrón: typeName=ns:tn
		var n = s.search(/typename/i);
		if (n >= 0) {
			// Primer carácter de ns (8-> longitud de "typename")
			n = n + 8 + 1;
			var ini = n;
			while ((s.charAt(n) != ':') && (n < s.length))
				n++;
			var fin = n;
			while ((s.charAt(n) != '&') && (n < s.length))
				n++;
			var fin2 = n;
			
			// Prefijo (namespace)
			var ns = s.substring(ini, fin);
			// TypeName
			var tn = s.substring(fin+1, fin2);
			
			// Buscar el valor asociado a ns
			// Patrón: xmlns(ns=nsurl)
			n = s.indexOf(ns);
			// La cadena ns aparece varias veces, busco la que nos interesa
			while ((n+ns.length < s.length) && (s.charAt(n+ns.length) != '='))
				n = s.indexOf(ns, n+ns.length);
			while ((s.charAt(n) != '=') && (n < s.length))
				n++;
			n++;
			ini = n;
			while ((s.charAt(n) != ')') && (n < s.length))
				n++;
		
			// featureNS
			var nsurl = s.substring(ini, n);
			
			result[0] = nsurl;
			result[1] = tn;
		} else {
			result[0] = "";
			result[1] = "";
		}
		return result;
	};

	/**
	* Constant: CLASS_NAME
	*/
	this.CLASS_NAME = "IDEZar_API.Parser.GML";	
};

/**
* Function: IDEZar_API.isNetscape
* Informa si el navegador acual es de la familia de Netscape.
*/
IDEZar_API.isNetscape = function() {
	if(document.all) {
		if ((navigator.userAgent.indexOf("Opera") != -1) && (document.getElementById)) {
			return true;
		}
		return false;
	} else {
		return true;
	}
};

/**
* Function: getFacade
* Devuelve el Facade del mapa.
*
* Returns:
* {OpenLayersClientFCFacade}
*/
function getFacade() {
	return IDEZar_API.ExternalFacade;
};

/**
* Function: getAPIFacade
* Devuelve el Facade de la API.
*
* Returns:
* {IDEZar_API.Facade}
*/
function getAPIFacade() {
	return IDEZar_API.MyFacade;
};

/** Propiedades internas para el uso del Facade externo */
indexReference = this;
clientReady = true;
setClientReady = function() {};
