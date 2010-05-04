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
 * Class: IDEZar_API.Facade
 * Facade propio de IDEZar_API para la comunicación con otros servicios.
 */
IDEZar_API.Facade = function(map) {
	
	/**
	* Property: myMap
	* {IDEZar_API.Map} Mapa de IDEZar_API.
	*/
	this.myMap = null;
	
	/**
	* Property: pointLayer
	* {OpenLayers.Layer.Vector} Capa para dibujar puntos desde Facade.
	*/
	this.pointLayer = null;
	
	/**
	* Constructor: IDEZar_API.Facade
	* Proporciona un interfaz para que aplicaciones externas se comuniquen
	* con las aplicaciones construidas con la IDEZar_API.
	*/
	this.myMap = map;
	
	this.addWMS = addWMS;
	this.addExclusiveWMS = addExclusiveWMS;
	this.addPredefinedWMS = addPredefinedWMS;
	this.drawPoint = drawPoint;
	this.setMapExtent = setMapExtent;
	this.loadGeoRSS = loadGeoRSS;
	this.loadExclusiveGeoRSS = loadExclusiveGeoRSS;
	this.loadGeoJSON = loadGeoJSON;
	this.loadExclusiveGeoJSON = loadExclusiveGeoJSON;
	this.getDrawnPoint = getDrawnPoint;
	this.getExtent = getExtent;
	
	// Inicializar variables globales relativas al mapa del visualizador
	IDEZar_API.FacadeUtils.myMap = this.myMap;
	
	/**
	* Function: addWMS
	* Añadir WMS al mapa.
	*
	* Parameters:
	* url - {String}
	* title - {String}
	* version - {String}
	* isWMSC - {Boolean}
	* params - {Object} Parámetros adicionales del WMS
	* addFirst - {Boolean} Si debe añadirse como la primera capa (debajo
	*                      del resto)
	*/
	function addWMS(url, title, version, isWMSC, params, addFirst) {
		// Establecer valor de los parámetros
		version = version ? version : "1.3.0";
		var serviceType;
		if (!isWMSC) {
			serviceType = "WMS";
		} else {
			serviceType = "WMS-C";
		}
		var result = OpenLayers.IAAA_Utils.setVersion(version, serviceType);
		var urlAux = url;
		if (urlAux.indexOf('?') != -1) {
			urlAux = urlAux.substring(0, urlAux.indexOf('?'));
		}
		// Configurar petición y realizarla
		var urlPeticion = urlAux + "?REQUEST=" + result[1] + "&SERVICE=" + serviceType + "&" + result[0] + "=" + version;
		var serverProperties = {
			url: urlAux,
			name: title,
			version: version,
			tile: isWMSC,
			isWMSC: isWMSC,
			params: params,
			addFirst: addFirst
		};
		IDEZar_API.FacadeUtils.doGetRequest(urlPeticion, IDEZar_API.FacadeUtils.askForWMSLayerList, serverProperties);
	};
	
	/**
	* Function: addExclusiveWMS
	* Añadir WMS al mapa de forma exclusiva, es decir, será el único WMS
	* visible sobre el mapa.
	* 
	* No es conveniente usarlo en visores con pestañas.
	*
	* Parameters:
	* url - {String}
	* title - {String}
	* version - {String}
	* isWMSC - {Boolean}
	* params - {Object} Parámetros adicionales del WMS 
	*/
	function addExclusiveWMS(url, title, version, isWMSC, params) {	
		// Borrar WMSs sobre el mapa
		for (var i = (this.myMap.map.layers.length - 1); i>=0; i--) {
			var layer = this.myMap.map.layers[i];
			if ((layer.CLASS_NAME == "OpenLayers.Layer.IAAA_Server") ||
				(layer.CLASS_NAME == "OpenLayers.Layer.Google")) {
				this.myMap.map.removeLayer(layer);
			}
		}
		// Cargar nuevo WMS
		this.addWMS(url, title, version, isWMSC, params, true);
	};
	
	/**
	* Function: addPredefinedWMS
	* Añadir WMS al mapa de entre los predefinidos. Opcionalemente, puede
	* añadirse de forma exclusiva, es decir, será el único WMS visible sobre
	* el mapa.
	* 
	* No es conveniente usarlo en visores con pestañas.
	*
	* Parameters:
	* name - {String}
	* exclusive - {Boolean}
	*/
	function addPredefinedWMS(name, exclusive) {	
		// Borrar WMSs sobre el mapa
		if (exclusive) {
			for (var i = (this.myMap.map.layers.length - 1); i>=0; i--) {
				var layer = this.myMap.map.layers[i];
				if ((layer.CLASS_NAME == "OpenLayers.Layer.IAAA_Server") ||
					(layer.CLASS_NAME == "OpenLayers.Layer.Google")) {
					this.myMap.map.removeLayer(layer);
				}
			}
		}
		
		// Cargar nuevo WMS
		var wms;
		switch (name) {
			case "IDEEBase":
				wms = new IDEZar_API.WMS.IDEEBase();
				break;
			case "Cartociudad":
				wms = new IDEZar_API.WMS.Cartociudad();
				break;
			case "PNOA":
				wms = new IDEZar_API.WMS.PNOA();
				break;
			case "Catastro":
				wms = new IDEZar_API.WMS("Catastro",
					"http://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx",
					{layers: ["Catastro"]});
				break;
			case "IDEZar":
				wms = new IDEZar_API.WMS("IDEZar",
					"http://idezar.zaragoza.es/IDEZar_Base_Tiled/WMSTileCache",
					{layers: ["base"],
					transparent: false,
					format: "image/png",
					srsList:  ["EPSG:23030"],
					isWMSC: true,
					maxExtent: new  IDEZar_API.Bounds(651500, 4590500, 694100, 4645000, "EPSG:23030"),
					resolutions: 
						["53.125201382285255","26.562600691142627","14.062553307075499",
						 "6.718775468936064","3.7500142152201517","1.7187565153092277",
						 "0.9375035538050343","0.5000018953626857","0.26375099980381617",
						 "0.131875499901908"]
					});
				break;
			default:
				break;
		}
		this.myMap.addWMS(wms);
		
		// Situar debajo del resto de capas
		if (exclusive) {
			var n = this.myMap.map.layers.length - 1;
			var layers = this.myMap.map.layers;
			var addedLayer = layers[n];
			for (var i = n; i > 0; i--) {
				layers[i] = layers[i-1];
			}
			layers[0] = addedLayer;
			this.myMap.map.resetLayersZIndex();
		}
	};
	
	/**
	* Function: drawPoint
	* Dibujar un punto sobre el mapa (cuyas coordenadas están en el SRS
	* indicado) y, si no se indica lo contrario, centrar en él. Opcionalmente,
	* se situa el mapa en la escala indicada.
	*
	* Parameters:
	* x - {String}
	* y - {String}
	* srs - {String}
	* scale -{Float}
	* dontCenter - {Boolean} No centrar sobre el punto pintado
	*/
	function drawPoint(x, y, srs, scale, dontCenter) {	
		var lonlat = new OpenLayers.LonLat(parseFloat(x), parseFloat(y));
		var newSrs = srs + "";
		var oldSrs = this.myMap.map.getProjection();
		// Transformar al SRS del mapa, si es necesario
		if (oldSrs != newSrs) {
			var punto = coordTransform(newSrs, oldSrs, lonlat.lon, lonlat.lat);
			lonlat.lon = punto[0];
			lonlat.lat = punto[1];
		}
		// Configurar Feature y capa asociada
		if (!this.pointLayer) {
			this.pointLayer = new OpenLayers.Layer.Vector("drawPointFromFacadeLayer",
					{style: MeasureTools.geometryStyle,
					displayOutsideMaxExtent: true,
					alwaysInRange: true,
					resolutions: this.myMap.map.baseLayer.resolutions,
					maxExtent: this.myMap.map.baseLayer.maxExtent});
			this.myMap.map.addLayer(this.pointLayer);
		}
		var pointGeometry = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);
		var pointFeature = new OpenLayers.Feature.Vector(pointGeometry);
		// Dibujar punto (y centrar mapa)
		this.pointLayer.destroyFeatures();
		this.pointLayer.addFeatures(pointFeature);
		if (!dontCenter) {
			this.myMap.map.setCenter(lonlat);
			// Actualizar escala
			if (scale) {
				this.myMap.map.zoomToScale(parseFloat(scale), true);
			}
		}
	};
	
	/**
	* Function: setMapExtent
	* Centrar mapa en una zona determinada (cuyas coordenadas están en el SRS
	* indicado), que puede ser un área o un punto. También puede indicarse la
	* escala en la que si situará el mapa después de centrar.
	*
	* Parameters:
	* xMin - {String}
	* yMix - {String}
	* xMax - {String}
	* yMax - {String}
	* srs - {String}
	* scale - {Float}
	*/
	function setMapExtent(xMin, yMin, xMax, yMax, srs, scale) {	
		var lonlat;
		var bbox;
		var reqSrs = srs + "";
		var mapSrs = this.myMap.map.getProjection();
		// Establecer zona sobre la que centrar el mapa
		if (xMax && yMax) {
			bbox = new OpenLayers.IAAA_Bounds(parseFloat(xMin), parseFloat(yMin), parseFloat(xMax), parseFloat(yMax));
			bbox.setSrs(reqSrs);
			bbox.transformSrs(mapSrs);
		} else {
			lonlat = new OpenLayers.LonLat(parseFloat(xMin), parseFloat(yMin));
			if (mapSrs != reqSrs) {
				var punto = coordTransform(reqSrs, mapSrs, lonlat.lon, lonlat.lat);
				lonlat.lon = punto[0];
				lonlat.lat = punto[1];
			}
		}
		// Centrar el mapa
		if (lonlat) {
			this.myMap.map.setCenter(lonlat);
		} else if (bbox) {
			this.myMap.map.zoomToExtent(bbox);
		}
		// Actualizar escala
		if (scale) {
			this.myMap.map.zoomToScale(parseFloat(scale), true);
		}
	};
	
	/**
	* Function: loadGeoRSS
	* Carga un fichero GeoRSS y muestra su contenido sobre el mapa.
	*
	* Parameters:
	* url - {String}
	* srs - {String} SRS de los datos contenidos en el GeoRSS.
	*/
	function loadGeoRSS(url, srs) {	
		if (!srs) {
			srs = this.myMap.map.getProjection();
		}
		var georss = new IDEZar_API.File.GeoRSS(url, srs);
		this.myMap.loadGeoRSS(georss);
	};
	
	/**
	* Function: loadExclusiveGeoRSS
	* Carga un fichero GeoRSS y muestra su contenido sobre el mapa. Se añadirá
	* de manera excluyente, es decir, será el único GeoRSS sobre el mapa.
	*
	* Parameters:
	* url - {String}
	* srs - {String} SRS de los datos contenidos en el GeoRSS.
	*/
	function loadExclusiveGeoRSS(url, srs) {	
		// Borrar GeoRSSs sobre el mapa
		for (var i = (this.myMap.map.layers.length - 1); i>=0; i--) {
			var layer = this.myMap.map.layers[i];
			if ((layer.CLASS_NAME == "OpenLayers.Layer.GeoRSS") ||
				(layer.CLASS_NAME == "OpenLayers.Layer.IAAA_GeoRSS")) {
				layer.clearMarkers();
				layer.clearFeatures();
				this.myMap.map.removeLayer(layer);
			}
		}
		// Cargar nuevo GeoRSS
		this.loadGeoRSS(url, srs);
	};
	
	/**
	* Function: loadGeoJSON
	* Carga un objeto GeoJSON y muestra su contenido sobre el mapa.
	*
	* Parameters:
	* object - {Object}
	* srs - {String} SRS de los datos contenidos en el GeoJSON.
	* scale - {Integer} Si se indica una escala, se centra el mapa sobre el
	*   objecto cargado, con dicha escala
	*/
	function loadGeoJSON(object, srs, scale) {	
		if (!srs) {
			srs = this.myMap.map.getProjection();
		}
		var geojson = new IDEZar_API.File.GeoJSON(object, srs);
		this.myMap.loadGeoJSON(geojson, scale);
	};
	
	/**
	* Function: loadExclusiveGeoJSON
	* Carga un fichero GeoJSON y muestra su contenido sobre el mapa. Se añadirá
	* de manera excluyente, es decir, será el único GeoJSON sobre el mapa.
	*
	* Parameters:
	* object - {Object}
	* srs - {String} SRS de los datos contenidos en el GeoJSON.
	* scale - {Integer} Si se indica una escala, se centra el mapa sobre el
	*   objecto cargado, con dicha escala
	*/
	function loadExclusiveGeoJSON(object, srs, scale) {	
		// Borrar GeoJSONs sobre el mapa
		for (var i = (this.myMap.map.layers.length - 1); i>=0; i--) {
			var layer = this.myMap.map.layers[i];
			if (((layer.CLASS_NAME == "OpenLayers.Layer.Vector") ||
				(layer.CLASS_NAME == "OpenLayers.Layer.IAAA_VectorGenericPopups")) &&
				(layer.GeoJSONdata)) {
				this.myMap.map.removeLayer(layer);
			}
		}
		// Cargar nuevo GeoJSON
		this.loadGeoJSON(object, srs, scale);
	};
	
	/**
	* Function: getDrawnPoint
	* Devuelve el punto pintado sobre el mapa (con la herramienta
	* correspondiente).
	*
	* Returns:
	* {String, String, String}
	*/
	function getDrawnPoint() {
		var point = this.myMap.toolbar.drawPoint.control.currentPoint;
		if (point) {
			var x;
			var y;
			if (point.geometry) {
				x = point.geometry.x;
				y = point.geometry.y;
			} else {
				x = point.lonlat.lon;
				y = point.lonlat.lat;
			}
			// Transformar al SRS del mapa si es necesario
			var mapSrs = this.myMap.map.getProjection();
			if (point.srs != mapSrs) {
				var punto = coordTransform(point.srs, mapSrs, x, y);
				x = punto[0];
				y = punto[1];
			}
			return {x: x, y: y, srs: mapSrs};
		}
	};
	
	/**
	* Function: getExtent
	* Devuelve el área visualizada en el mapa.
	*
	* Returns:
	* {String, String, String, String, String}
	*/
	function getExtent() {
		var extent = this.myMap.map.getExtent();
		var mapSrs = this.myMap.map.getProjection();
		if (extent) {
			return {xMin: extent.left, yMin: extent.bottom,
				xMax: extent.right, yMax: extent.top, srs: mapSrs};
		}
	};
};

/**
 * Class: IDEZar_API.FacadeUtils
 * Funciones útiles para el Facade.
 */
IDEZar_API.FacadeUtils = {};
	
/**
* Property: map
* {IDEZar_API.Map} Mapa de IDEZar_API.
*/
IDEZar_API.FacadeUtils.myMap = null;
	
/**
* Property: currentRequest
* {XMLHttpRequest} Petición AJAX en curso.
*/
IDEZar_API.FacadeUtils.currentRequest = null;
	
/**
* Property: currentRequestProperties
* {Object} Conjunto de propiedades relacionadas con la petición en curso.
*/
IDEZar_API.FacadeUtils.currentRequestProperties = null;

/**
* Property: loadingDIV
* {DOMElement} DIV con el mensaje de espera mientras se realizan peticiones.
*/
IDEZar_API.FacadeUtils.loadingDIV = null;

/**
* Property: AddWMSLayersDIV
* {DOMElement} DIV con el listado de capas de un WMS antes de ser añaidido.
*/
IDEZar_API.FacadeUtils.AddWMSLayersDIV = null;

/**
* Function: doGetRequest
* Realizar petición HTTP mediante GET. Necesita un Servlet intermedio
* instalado junto al cliente para realizar las peticiones.
*
* Parameters:
* url - {String}
* onLoad - {Function} Función a ejecutar al recibir la respuesta
* de la petición HTTP.
*/
IDEZar_API.FacadeUtils.doGetRequest = function(url, onLoad, requestProperties) {
	// Pasar URL por el Servlet intermedio
	var urlAux = OpenLayers.IAAA_Utils.replaceCad(url, '?', '&');
	var urlRelay = IDEZar_API.URL + "URLRelayServlet/URLRelayServlet";
	var urlPeticion = urlRelay + "?URL=" + urlAux + "&outputType=1";
	// Guardar parámetros de la petición, necesarios al capturar la respuesta
	IDEZar_API.FacadeUtils.currentRequestProperties = requestProperties;
	// Realizar petición
	IDEZar_API.FacadeUtils.showLoadingDataDIV();
	if (window.XMLHttpRequest) {
		IDEZar_API.FacadeUtils.currentRequest = new XMLHttpRequest();
		IDEZar_API.FacadeUtils.currentRequest.onreadystatechange = onLoad;
		IDEZar_API.FacadeUtils.currentRequest.open("GET", urlPeticion, true);
		IDEZar_API.FacadeUtils.currentRequest.send(null);
	} else if (window.ActiveXObject) {
		IDEZar_API.FacadeUtils.currentRequest = new ActiveXObject("Microsoft.XMLHTTP");
	    if (IDEZar_API.FacadeUtils.currentRequest) {
	    	IDEZar_API.FacadeUtils.currentRequest.onreadystatechange = onLoad;
	    	IDEZar_API.FacadeUtils.currentRequest.open("GET", urlPeticion, true);
	    	IDEZar_API.FacadeUtils.currentRequest.send();
	    }
	}
};
	
/**
* Function: askForWMSLayerList
* Una vez recibida la respuesta de WMS, seleccionar capas a añadir del WMS.
*/
IDEZar_API.FacadeUtils.askForWMSLayerList = function() {
	var req = IDEZar_API.FacadeUtils.currentRequest;
	var reqProperties = IDEZar_API.FacadeUtils.currentRequestProperties;
	if (req.readyState == 4) {
		IDEZar_API.FacadeUtils.hideLoadingDataDIV();
	  	// only if "OK"
	  	if (req.status == 200) {
	  		var newAddWMS;
	  		newAddWMS = OpenLayers.IAAA_Utils.parseCapabilitiesXML(newAddWMS, req.responseXML, reqProperties.url, reqProperties.name, reqProperties.version, reqProperties.tile, reqProperties.isWMSC);
	  		// Se comprueba si es WMS-C y si cumple las condiciones para condicionar el comportamiento del mapa
	  		for (var k in reqProperties.params) {
	  			newAddWMS.params[(k+"").toUpperCase()] = reqProperties.params[k];
	  		}
	  		// Se comprueba si es WMS-C y si cumple las condiciones para condicionar el comportamiento del mapa
	    	var WMSC = (newAddWMS.isWMSC && newAddWMS.maxExtent && newAddWMS.resolutions && newAddWMS.getSRSList()[newAddWMS.getSelectedSRS()]);
	  		if (WMSC && (newAddWMS.CLASS_NAME == "OpenLayers.Layer.IAAA_Server") &&
	  				IDEZar_API.FacadeUtils.myMap.map.ancientMaxExtent && map.ancientResolutions) {
	  			// Si es WMS-C, y ya hay alguno agregado al mapa, comprobamos si sus características son las mismas.
	  			// De no ser así el WMS-C no se agrega al mapa
	    		var sameResolutions = false;
	    		if (newAddWMS.resolutions.length == map.resolutions.length) {
	    			sameResolutions = true;
	    			for (var i in map.resolutions) {
	    				sameResolutions = sameResolutions && (newAddWMS.resolutions[i] == map.resolutions[i]);
	    			}
	    		}
	  			if ((newAddWMS.maxExtent.left != map.maxExtent.left) ||
	  					(newAddWMS.maxExtent.bottom != map.maxExtent.bottom) ||
	  					(newAddWMS.maxExtent.right != map.maxExtent.right) ||
	  					(newAddWMS.maxExtent.top != map.maxExtent.top) ||
	    				(!sameResolutions) ||
	    				(newAddWMS.getSRSList()[newAddWMS.getSelectedSRS()] != map.getProjection())) {
	  				alert(messages["incompatibleWMSC"]);
	  				return;
	    		}
	    	}
	  		// Poner las capas en orden contrario y preparalas para ser agregadas
			IDEZar_API.FacadeUtils.generateAddWMSLayersDIV(newAddWMS);
			// Agregar WMS
			IDEZar_API.FacadeUtils.newAddWMS = newAddWMS;
			IDEZar_API.FacadeUtils.addFirst = reqProperties.addFirst;
	  	}
	}
};

/**
* Function: addWMSToMap
* Añadir WMS al mapa, una vez seleccionadas sus capas.
* 
* newAddWMS - {OpenLayers.Layer.IAAA_Server}
*/
IDEZar_API.FacadeUtils.addWMSToMap = function(newAddWMS) {
	IDEZar_API.FacadeUtils.myMap.map.addLayer(newAddWMS);
	// Ordenar capas en función de si la recién añadida tiene que situarse debajo
	if (IDEZar_API.FacadeUtils.addFirst) {
		var n = IDEZar_API.FacadeUtils.myMap.map.layers.length - 1;
		var layers = IDEZar_API.FacadeUtils.myMap.map.layers;
		var addedLayer = layers[n];
		for (var i = n; i > 0; i--) {
			layers[i] = layers[i-1];
		}
		layers[0] = addedLayer;
		IDEZar_API.FacadeUtils.myMap.map.resetLayersZIndex();
	}
	newAddWMS.setVisibilityToAllLayers(true);
	IDEZar_API.FacadeUtils.newAddWMS = null;
	IDEZar_API.FacadeUtils.addFirst = null;
};

/**
* Function: generateLoadingDataDIV
* Crear DIV con el mensaje de espera mientras se realizan peticiones.
*
* Parameters:
* map - {OpenLayers.Map}
*/
IDEZar_API.FacadeUtils.generateLoadingDataDIV = function(map) {
	// Variables de estilo
	var message = messages["loadingData"];
	var greyColor = "#D4D0C8";
	var wmsClientFontFamily = LoadingMap.wmsClientFontFamily;
	var standardFontSize = LoadingMap.standardFontSize;
	var messageColor = LoadingMap.messageColor;
	var loadingImg = LoadingMap.loadingImg;
	
	// Crear DIV y ajustarlo al mapa
	loadingDIV = OpenLayers.Util.createDiv("loading_data_div", null, null, null,
                                                 "relative", null,
                                                 "hidden");
	map.div.appendChild(loadingDIV);
	loadingDIV.style['background-color'] = '#FFFFFF';
	loadingDIV.style.display = "none";
	loadingDIV.style.position = "absolute";
	
	// Establecer misma posición que el DIV de LoadingMap (si lo hay)
	var posX = 0;
	var posY = 0;
	for (var i in map.controls) {
		if (map.controls[i].CLASS_NAME == "OpenLayers.Control.IAAA_LoadingMap") {
			posX = parseInt((map.controls[i].loadingDiv.style.left ? map.controls[i].loadingDiv.style.left : 0));
			posY = parseInt((map.controls[i].loadingDiv.style.top ? map.controls[i].loadingDiv.style.top : 0));
			break;
		}
	}
	if ((posX > 0) && (posY > 0)) {
		loadingDIV.style.left = posX;
		loadingDIV.style.top = posY;
	} else {
		var obj = loadingDIV;
		while (obj.parentNode && obj.parentNode.offsetLeft && obj.parentNode.offsetTop) {
			posX += obj.parentNode.offsetLeft;
			posY += obj.parentNode.offsetTop;
			obj = obj.parentNode;
		}
		loadingDIV.style.left = posX + ((map.getSize().w / 2) - 60);
		loadingDIV.style.top = posY + ((map.getSize().h / 2) - 25);
	}
	loadingDIV.style.width = 141 + "px";
	loadingDIV.style.height = "auto";
	loadingDIV.style.border = '1px solid ' + greyColor;
	loadingDIV.style.zIndex = 2000;
	
	loadingDIV.innerHTML = '<table width="100%" height="100%" style="background-color:#FFFFFF;">' +
		'<tr valign="middle" align="center"><td>&nbsp;' +
			'<font style="font-family:' + wmsClientFontFamily + ';font-size:' + standardFontSize + ';color:' + messageColor + ';">' +
		message + '</font></td></tr><tr valign="middle" align="center"><td>' +
		'<img width=101 height=13 src="' + loadingImg + '"></td></tr><tr style="height: 4px;"></tr></table>';

	// Establecer referencia global
	IDEZar_API.FacadeUtils.loadingDIV = loadingDIV;
	// Controlar redimensión
	map.events.register("resizeend", this, function() {
		var posX = 0;
		var posY = 0;
		for (var i in IDEZar_API.FacadeUtils.myMap.map.controls) {
			if (IDEZar_API.FacadeUtils.myMap.map.controls[i].CLASS_NAME == "OpenLayers.Control.IAAA_LoadingMap") {
				posX = parseInt((IDEZar_API.FacadeUtils.myMap.map.controls[i].loadingDiv.style.left ? IDEZar_API.FacadeUtils.myMap.map.controls[i].loadingDiv.style.left : 0));
				posY = parseInt((IDEZar_API.FacadeUtils.myMap.map.controls[i].loadingDiv.style.top ? IDEZar_API.FacadeUtils.myMap.map.controls[i].loadingDiv.style.top : 0));
				break;
			}
		}
		if ((posX > 0) && (posY > 0)) {
			IDEZar_API.FacadeUtils.loadingDIV.style.left = posX;
			IDEZar_API.FacadeUtils.loadingDIV.style.top = posY;
		} else {
			var obj = IDEZar_API.FacadeUtils.loadingDIV;
			while (obj.parentNode && obj.parentNode.offsetLeft && obj.parentNode.offsetTop) {
				posX += obj.parentNode.offsetLeft;
				posY += obj.parentNode.offsetTop;
				obj = obj.parentNode;
			}
			IDEZar_API.FacadeUtils.loadingDIV.style.left = posX + ((IDEZar_API.FacadeUtils.myMap.map.getSize().w / 2) - 60);
			IDEZar_API.FacadeUtils.loadingDIV.style.top = posY + ((IDEZar_API.FacadeUtils.myMap.map.getSize().h / 2) - 25);
		}
		IDEZar_API.FacadeUtils.loadingDIV.style.width = 141 + "px";
		IDEZar_API.FacadeUtils.loadingDIV.style.height = "auto";
		IDEZar_API.FacadeUtils.loadingDIV.style.border = '1px solid ' + greyColor;
		IDEZar_API.FacadeUtils.loadingDIV.style.zIndex = 2000;
	});
};

/**
* Function: showLoadingDataDIV
* Mostar DIV con el mensaje de espera mientras se realizan peticiones.
*/
IDEZar_API.FacadeUtils.showLoadingDataDIV = function() {
	if (!IDEZar_API.FacadeUtils.loadingDIV) {
		IDEZar_API.FacadeUtils.generateLoadingDataDIV(IDEZar_API.FacadeUtils.myMap.map);
	}
	IDEZar_API.FacadeUtils.loadingDIV.style.display = "block";
};

/**
* Function: hideLoadingDataDIV
* Ocultar DIV con el mensaje de espera mientras se realizan peticiones.
*/
IDEZar_API.FacadeUtils.hideLoadingDataDIV = function() {
	if (IDEZar_API.FacadeUtils.loadingDIV) {
		IDEZar_API.FacadeUtils.loadingDIV.style.display = "none";
	}
};

/**
* Function: generateAddWMSLayersDIV
* Crear DIV con el árbol de capas del WMS a añadir. Permite seleccionar las
* capas de este a mostrar sobre el mapa.
*
* Parameters:
* newWMS - {OpenLayers.Layer.IAAA_Server}
* resize - {Boolean} Ventana ya generada previamente con distinto tamaño
*/
IDEZar_API.FacadeUtils.generateAddWMSLayersDIV = function(newWMS, resize) {
	// Borrar ocurrencias anteriores
	if (IDEZar_API.FacadeUtils.AddWMSLayersDIV) {
		var parentDIV = IDEZar_API.FacadeUtils.AddWMSLayersDIV.parentNode;
		parentDIV.removeChild(IDEZar_API.FacadeUtils.AddWMSLayersDIV);
	}
	
	// Funciones que actuan ante eventos sobre el DIV
	// Selección de capas
	checkAllSelected = function() {
		var allLayersSelected = true;
		for (var i in IDEZar_API.FacadeUtils.checkedList) {
			allLayersSelected = allLayersSelected && IDEZar_API.FacadeUtils.checkedList[i];
			for (var j in IDEZar_API.FacadeUtils.checkedChildList[i]) {
				allLayersSelected = allLayersSelected && IDEZar_API.FacadeUtils.checkedChildList[i][j];
			}
			if (!allLayersSelected) break;
		}
		allSelected = allLayersSelected;
		var img = document.getElementById("selectAllCheckbox");
		if (allSelected) {
			img.src = addWMS.checkboxClick;
		} else {
			img.src = addWMS.checkboxStable;
		}
	};
	toggleSelectParentLayer = function(img, ind, fromAll) {
		if (!IDEZar_API.FacadeUtils.checkedList[ind]) {
			IDEZar_API.FacadeUtils.checkedList[ind] = true;
			img.src = addWMS.checkboxClick;
			// Seleccionar todas las hijas
			for (var i in IDEZar_API.FacadeUtils.checkedChildList[ind]) {
				IDEZar_API.FacadeUtils.checkedChildList[ind][i] = true;
				document.getElementById("wmsLayerCheckboxImg_" + ind + "_" + i).src = addWMS.checkboxClick;
			}
		} else {
			IDEZar_API.FacadeUtils.checkedList[ind] = false;
			img.src = addWMS.checkboxStable;
			// Deseleccionar todas las hijas
			for (var i in IDEZar_API.FacadeUtils.checkedChildList[ind]) {
				IDEZar_API.FacadeUtils.checkedChildList[ind][i] = false;
				document.getElementById("wmsLayerCheckboxImg_" + ind + "_" + i).src = addWMS.checkboxStable;
			}
		}
		if (!fromAll) {
			checkAllSelected();
		}
	};
	
	toggleSelectChildLayer = function(img, parent_ind, ind) {
		if (!IDEZar_API.FacadeUtils.checkedChildList[parent_ind][ind]) {
			IDEZar_API.FacadeUtils.checkedChildList[parent_ind][ind] = true;
			img.src = addWMS.checkboxClick;
			// ¿Seleccionar padre?
			var selectParent = true;
			for (var i in IDEZar_API.FacadeUtils.checkedChildList[parent_ind]) {
				selectParent = selectParent && IDEZar_API.FacadeUtils.checkedChildList[parent_ind][i];
			}
			if (selectParent) {
				IDEZar_API.FacadeUtils.checkedList[parent_ind] = true;
				document.getElementById("wmsLayerCheckboxImg_" + parent_ind).src = addWMS.checkboxClick;
			}
		} else {
			IDEZar_API.FacadeUtils.checkedChildList[parent_ind][ind] = false;
			img.src = addWMS.checkboxStable;
			// Deseleccionar padre
			IDEZar_API.FacadeUtils.checkedList[parent_ind] = false;
			document.getElementById("wmsLayerCheckboxImg_" + parent_ind).src = addWMS.checkboxStable;
		}
		checkAllSelected();
	};
	
	// Controlar cambios en los Checkbox
	clickCheckbox = function() {
		var r = this.id.split("_");
		switch (r.length) {
			case 2: // Checbox asociado a una capa
				var ind = parseInt(r[1]);
				toggleSelectParentLayer(this, ind);
				break;
			case 3: // Checbox asociado a una capa hija
				var parent_ind = parseInt(r[1]);
				var ind = parseInt(r[2]);
				toggleSelectChildLayer(this, parent_ind, ind);
				break;
			default:
				break;
		}
	};
	
	outCheckbox = function() {
		var r = this.id.split("_");
		switch (r.length) {
			case 2: // Checbox asociado a una capa
				var ind = parseInt(r[1]);
				if (!IDEZar_API.FacadeUtils.checkedList[ind]) {
					this.src = addWMS.checkboxStable;
				}
				break;
			case 3: // Checbox asociado a una capa hija
				var parent_ind = parseInt(r[1]);
				var ind = parseInt(r[2]);
				if (!IDEZar_API.FacadeUtils.checkedChildList[parent_ind][ind]) {
					this.src = addWMS.checkboxStable;
				}
				break;
			default:
				break;
		}
	};
	
	overCheckbox = function() {
		var r = this.id.split("_");
		switch (r.length) {
			case 2: // Checbox asociado a una capa
				var ind = parseInt(r[1]);
				if (!IDEZar_API.FacadeUtils.checkedList[ind]) {
					this.src = addWMS.checkboxOver;
				}
				break;
			case 3: // Checbox asociado a una capa hija
				var parent_ind = parseInt(r[1]);
				var ind = parseInt(r[2]);
				if (!IDEZar_API.FacadeUtils.checkedChildList[parent_ind][ind]) {
					this.src = addWMS.checkboxOver;
				}
				break;
			default:
				break;
		}
	};
	
	// Ejecución
	ok = function() {
		// Quitar del wms las capas que no han sido seleccionadas por el usuario
    	// Revisar estilos seleccionados y capas hijas
		var layersNoSelected = new Array(newWMS.getLayerList().length);
    	for (var ind = 0; ind < newWMS.getLayerList().length; ind++) {
    		var layerChecked = newWMS.getLayerList()[ind];
			// Ver capas hijas: ver si estan seleccionadas y sus estilos
			var childLayersNoSelected = new Array(layerChecked.getChildLayerList().length);
			for (var childInd = 0; childInd < layerChecked.getChildLayerList().length; childInd++) {
				var childLayerChecked = layerChecked.getChildLayer(childInd);
				// Ver capa hija (seleccionada ella o algún descendiente)
				if (IDEZar_API.FacadeUtils.checkedChildList[ind][childInd]) {
					// Seleccionada
					var childLayerStyleSelected = 0; // por defecto
					if (eval("wmsLayerStylesSelect_" + ind + "_" + childInd))	{
						childLayerStyleSelected = eval("wmsLayerStylesSelect_" + ind + "_" + childInd + ".selectedIndex");
						if (childLayerStyleSelected < 0 || childLayerStyleSelected >= childLayerChecked.getStyleList().length) {
							childLayerStyleSelected = 0;
						}
					}
					childLayerChecked.setStyleSelected(childLayerStyleSelected);
					childLayersNoSelected[childInd] = false;
				} else {
					// No seleccionada
					childLayersNoSelected[childInd] = true;
				}
				
			}
			var newChildLayerList = new Array();
			var newChildCont = 0;
			for (var childInd = 0; childInd < layerChecked.getChildLayerList().length; childInd++) {
				if (!childLayersNoSelected[childInd]) {
					// Seleccionada previamente
					newChildLayerList[newChildCont] = layerChecked.getChildLayerList()[childInd];
					newChildLayerList[newChildCont].setParent(layerChecked);
					newChildCont++;
				}
			}
			if (layerChecked.ISPARENTLAYER)	{
				layerChecked.setChildLayerList(newChildLayerList);
			}

			// Ver capa (seleccionada ella o algún descendiente)
			if (IDEZar_API.FacadeUtils.checkedList[ind] || (newChildLayerList.length > 0)) {
				// Seleccionada
				var styleSelected = 0; // por defecto
				if (eval("wmsLayerStylesSelect_" + ind)) {
					styleSelected = eval("wmsLayerStylesSelect_" + ind + ".selectedIndex");
					if (styleSelected < 0 || styleSelected >= layerChecked.getStyleList().length) {
						styleSelected = 0;
					}
				}
				layerChecked.setStyleSelected(styleSelected);
				layersNoSelected[ind] = false;
			} else {
				layersNoSelected[ind] = true;
			}
    	}
    	
		var newLayerList = new Array();
     	var newCont = 0;
		for (var ind = newWMS.getLayerList().length-1; ind >= 0; ind--) {
			if (!layersNoSelected[ind]) {
				// Seleccionada previamente
				newLayerList[newCont] = newWMS.getLayerList()[ind];
				newLayerList[newCont].setParent(newWMS);
				newCont++;
			}
		}

		newWMS.setLayerList(newLayerList);
		IDEZar_API.FacadeUtils.addWMSToMap(newWMS);
		// Cerrar DIV y no dejar rastro
		cancel();
	};
	
	cancel = function() {
		IDEZar_API.FacadeUtils.checkedList = null;
		IDEZar_API.FacadeUtils.checkedChildList = null;
		var parentDIV = IDEZar_API.FacadeUtils.AddWMSLayersDIV.parentNode;
		parentDIV.removeChild(IDEZar_API.FacadeUtils.AddWMSLayersDIV);
		IDEZar_API.FacadeUtils.AddWMSLayersDIV = null;
	};
	
	// DIV principal
	var mainDiv = document.createElement('div');
	mainDiv.setAttribute("id","addWMSLayersDIV");
	IDEZar_API.FacadeUtils.AddWMSLayersDIV = mainDiv;
	var mapDiv = document.getElementById(IDEZar_API.FacadeUtils.myMap.map.div.id);
	var textSyle = "font-family: " + addWMS.wmsClientFontFamily + "; font-size: " + addWMS.standardFontSize + ";";
	var mapDivStyle = "position: " + mapDiv.style.position + "; top: " + mapDiv.style.top + "; left: " + mapDiv.style.left
		+ "; width: " + mapDiv.style.width + "; height: " + mapDiv.style.height + "; background-image:url(" + addWMS.backgroundImg  + "); background-repeat: repeat; "
		+ "; border: 1px solid " + addWMS.color + "; overflow-y: auto; overflow-x: hidden; z-index: 1000;";
	if (IDEZar_API.isNetscape()) {
		mainDiv.setAttribute("style", mapDivStyle);
	} else {
		mainDiv.style.setAttribute("cssText", mapDivStyle);
	}
	mainDiv.setAttribute("display", "block");
	var mapDivParent = mapDiv.parentNode;
	mapDivParent.insertBefore(mainDiv, mapDiv.nextSibling);
	
	// Tabla principal
	var mainTable = document.createElement('table');
	mainTable.setAttribute("id","addWMSLayersMainTable");
	if (IDEZar_API.isNetscape()) {
		mainTable.setAttribute("style", "position: relative; top: 30px; left: 30px;");
	} else {
		mainTable.style.setAttribute("cssText", "position: relative; top: 30px; left: 30px;");
	}
	var mainTableBody = document.createElement('tbody');
	var mainTableTR = document.createElement('tr');
	var mainTableTD = document.createElement('td');
	mainTableTR.appendChild(mainTableTD);
	mainTableBody.appendChild(mainTableTR);
	mainTable.appendChild(mainTableBody);
	mainDiv.appendChild(mainTable);
	
	// Listado de capas del WMS
	var wmsLayerListTable = document.createElement('table');
	wmsLayerListTable.setAttribute("id","addWMSLayersListTable");
	wmsLayerListTable.setAttribute("cellpadding","2");
	if (IDEZar_API.isNetscape()) {
		wmsLayerListTable.setAttribute("style", textSyle);
	} else {
		wmsLayerListTable.style.setAttribute("cssText", textSyle);
	}
	var wmsLayerListBody = document.createElement('tbody');
	
	// Seleccionar todas las capas
	var wmsLayerListSelectAllTR = document.createElement('tr');
	var wmsLayerListSelectAllTD = document.createElement('td');
	wmsLayerListSelectAllTD.setAttribute("colSpan","3");
	wmsLayerListSelectAllTD.setAttribute("align","center");
	var selectAllTable = document.createElement('table');
	if (IDEZar_API.isNetscape()) {
		selectAllTable.setAttribute("style", textSyle/* + " width: 100%;"*/);
	} else {
		selectAllTable.style.setAttribute("cssText", textSyle/* + " width: 100%;"*/);
	}
	var selectAllTableBody = document.createElement('tbody');
	var selectAllTableTR = document.createElement('tr');
	var selectAllTD1 = document.createElement('td');
	selectAllTD1.setAttribute("align", "right");
	allSelected = false;
	var selectAllCheckboxImg = document.createElement('img');
	selectAllCheckboxImg.setAttribute("id", "selectAllCheckbox");
	selectAllCheckboxImg.src = addWMS.checkboxStable;
	selectAllCheckboxImg.onmousedown = function() {
		if (!allSelected) {
			allSelected = true;
			this.src = addWMS.checkboxClick;
		} else {
			allSelected = false;
			this.src = addWMS.checkboxStable;
		}
		for (var i in IDEZar_API.FacadeUtils.checkedList) {
			var img = document.getElementById("wmsLayerCheckboxImg_" + i);
			IDEZar_API.FacadeUtils.checkedList[i] = !allSelected;
			toggleSelectParentLayer(img, i, true);
		}
	};
	selectAllCheckboxImg.onmouseover = function() {
		if (!allSelected) {
			this.src = addWMS.checkboxOver;
		}
	};
	selectAllCheckboxImg.onmouseout = function() {
		if (!allSelected) {
			this.src = addWMS.checkboxStable;
		}
	};
	selectAllTD1.appendChild(selectAllCheckboxImg);
	var selectAllGapTD = document.createElement('td');
	selectAllGapTD.setAttribute("width", "10px");
	var selectAllTD2 = document.createElement('td');
	selectAllTD2.setAttribute("align", "left");
	selectAllTD2.innerHTML = messages["selectAllLayers"];
	selectAllTableTR.appendChild(selectAllTD1);
	selectAllTableTR.appendChild(selectAllGapTD);
	selectAllTableTR.appendChild(selectAllTD2);
	selectAllTableBody.appendChild(selectAllTableTR);
	selectAllTable.appendChild(selectAllTableBody);
	wmsLayerListSelectAllTD.appendChild(selectAllTable);
	wmsLayerListSelectAllTR.appendChild(wmsLayerListSelectAllTD);
	wmsLayerListBody.appendChild(wmsLayerListSelectAllTR);
	
	// Fila de espacio
	var GapTR3 = document.createElement('tr');
	var GapTD3 = document.createElement('td');
	GapTD3.setAttribute("colSpan","3");
	GapTD3.innerHTML = "&nbsp;";
	GapTR3.appendChild(GapTD3);
	wmsLayerListBody.appendChild(GapTR3);
	
	// Titulo del listado
	var wmsLayerListTitleTR = document.createElement('tr');
	var wmsLayerListTitleTD = document.createElement('td');
	wmsLayerListTitleTD.setAttribute("colSpan","3");
	wmsLayerListTitleTD.innerHTML = messages["selectLayers"];
	wmsLayerListTitleTR.appendChild(wmsLayerListTitleTD);
	wmsLayerListBody.appendChild(wmsLayerListTitleTR);
	
	// Fila de espacio
	var GapTR = document.createElement('tr');
	var GapTD = document.createElement('td');
	GapTD.setAttribute("colSpan","3");
	GapTD.innerHTML = "&nbsp;";
	GapTR.appendChild(GapTD);
	wmsLayerListBody.appendChild(GapTR);
	
	// Listado de capas
	var fullLayerList = newWMS.getLayerList();
	if (!resize) IDEZar_API.FacadeUtils.checkedList = [];
	if (!resize) IDEZar_API.FacadeUtils.checkedChildList = [];
	for (var i in fullLayerList) {
		var layer = fullLayerList[i];
		var wmsLayerTR = document.createElement('tr');
		// Checkbox de la capa
		var wmsLayerCheckbox = document.createElement('td');
		wmsLayerCheckbox.setAttribute("id", "wmsLayerCheckbox_" + i);
		wmsLayerCheckbox.setAttribute("width", "30px");
		wmsLayerCheckbox.setAttribute("align", "center");
		if (!resize) IDEZar_API.FacadeUtils.checkedList[i] = false;
		var wmsLayerCheckboxImg = document.createElement('img');
		wmsLayerCheckboxImg.setAttribute("id", "wmsLayerCheckboxImg_" + i);
		if (IDEZar_API.FacadeUtils.checkedList[i]) {
			wmsLayerCheckboxImg.src = addWMS.checkboxClick;
		} else {
			wmsLayerCheckboxImg.src = addWMS.checkboxStable;
		}
		wmsLayerCheckboxImg.onmousedown = clickCheckbox;
		wmsLayerCheckboxImg.onmouseover = overCheckbox;
		wmsLayerCheckboxImg.onmouseout = outCheckbox;
		wmsLayerCheckbox.appendChild(wmsLayerCheckboxImg);
		// Titulo de la capa
		var wmsLayerTitle = document.createElement('td');
		wmsLayerTitle.setAttribute("width", "300px");
		wmsLayerTitle.innerHTML = layer.title;
		// Estilos de la capa
		var wmsLayerStyles = document.createElement('td');
		wmsLayerStyles.setAttribute("width", "150px");
		var wmsLayerStylesSelect = document.createElement('select');
		wmsLayerStylesSelect.setAttribute("id", "wmsLayerStylesSelect_" + i);
		wmsLayerStylesSelect.setAttribute("size", "1");
		if (IDEZar_API.isNetscape()) {
			wmsLayerStylesSelect.setAttribute("style", textSyle + " width: 100%;");
		} else {
			wmsLayerStylesSelect.style.setAttribute("cssText", textSyle + " width: 100%;");
		}
		var layerStyleList = layer.getStyleList();
		for (var j in layerStyleList) {
			var styleOption = document.createElement('option');
			var styleTitle;
			if (typeof(layerStyleList[j]) == "object") {
				 styleTitle = layerStyleList[j].getTitle();
			} else {
				styleTitle = layerStyleList[j];
			}
			styleOption.setAttribute("name", styleTitle);
			styleOption.setAttribute("value", styleTitle);
			styleOption.innerHTML = styleTitle;
			wmsLayerStylesSelect.appendChild(styleOption);
		}
		wmsLayerStyles.appendChild(wmsLayerStylesSelect);
		// Fila de la capa
		wmsLayerTR.appendChild(wmsLayerCheckbox);
		wmsLayerTR.appendChild(wmsLayerTitle);
		wmsLayerTR.appendChild(wmsLayerStyles);
		wmsLayerListBody.appendChild(wmsLayerTR);
		// Listado de capas hijas
		var fullChildLayerList = layer.getChildLayerList();
		if (!resize) IDEZar_API.FacadeUtils.checkedChildList[i] = [];
		if (fullChildLayerList.length > 0) {
			var wmsChildLayerListTR = document.createElement('tr');
			var wmsChildLayerListTD1 = document.createElement('td');
			wmsChildLayerListTD1.setAttribute("width", "30px");
			var wmsChildLayerListTD2 = document.createElement('td');
			wmsChildLayerListTD2.setAttribute("colSpan", "2");
			var wmsChildLayerListFieldset = document.createElement('fieldset');
			var wmsChildLayerListTable = document.createElement('table');
			wmsChildLayerListTable.setAttribute("id","addWMSChildLayersListTable_" + i);
			if (IDEZar_API.isNetscape()) {
				wmsChildLayerListTable.setAttribute("style", textSyle);
				wmsChildLayerListFieldset.setAttribute("style", "padding: 5px;");
			} else {
				wmsChildLayerListTable.style.setAttribute("cssText", textSyle);
				wmsChildLayerListFieldset.style.setAttribute("cssText", "padding: 5px;");
			}
			var wmsChildLayerListBody = document.createElement('tbody');
			for (var i2 in fullChildLayerList) {
				var childLayer = fullChildLayerList[i2];
				var wmsChildLayerTR = document.createElement('tr');
				// Checkbox de la capa hija
				var wmsChildLayerCheckbox = document.createElement('td');
				wmsChildLayerCheckbox.setAttribute("id", "wmsLayerCheckbox_" + i + "_" + i2);
				wmsChildLayerCheckbox.setAttribute("width", "30px");
				wmsChildLayerCheckbox.setAttribute("align", "center");
				if (!resize) IDEZar_API.FacadeUtils.checkedChildList[i][i2] = false;
				var wmsChildLayerCheckboxImg = document.createElement('img');
				wmsChildLayerCheckboxImg.setAttribute("id", "wmsLayerCheckboxImg_" + i + "_" + i2);
				if (IDEZar_API.FacadeUtils.checkedChildList[i][i2]) {
					wmsChildLayerCheckboxImg.src = addWMS.checkboxClick;
				} else {
					wmsChildLayerCheckboxImg.src = addWMS.checkboxStable;
				}
				wmsChildLayerCheckboxImg.onmousedown = clickCheckbox;
				wmsChildLayerCheckboxImg.onmouseover = overCheckbox;
				wmsChildLayerCheckboxImg.onmouseout = outCheckbox;
				wmsChildLayerCheckbox.appendChild(wmsChildLayerCheckboxImg);
				// Titulo de la capa hija
				var wmsChildLayerTitle = document.createElement('td');
				wmsChildLayerTitle.setAttribute("width", "300px");
				wmsChildLayerTitle.innerHTML = childLayer.title;
				// Estilos de la capa hija
				var wmsChildLayerStyles = document.createElement('td');
				wmsChildLayerStyles.setAttribute("width", "150px");
				var wmsChildLayerStylesSelect = document.createElement('select');
				wmsChildLayerStylesSelect.setAttribute("id", "wmsLayerStylesSelect_" + i + "_" + i2);
				wmsChildLayerStylesSelect.setAttribute("size", "1");
				if (IDEZar_API.isNetscape()) {
					wmsChildLayerStylesSelect.setAttribute("style", textSyle + " width: 100%;");
				} else {
					wmsChildLayerStylesSelect.style.setAttribute("cssText", textSyle + " width: 100%;");
				}
				var childLayerStyleList = childLayer.getStyleList();
				for (var j2 in childLayerStyleList) {
					var childStyleOption = document.createElement('option');
					var childStyleTitle;
					if (typeof(childLayerStyleList[j2]) == "object") {
						childStyleTitle = childLayerStyleList[j2].getTitle();
					} else {
						childStyleTitle = childLayerStyleList[j2];
					}
					childStyleOption.setAttribute("name", childStyleTitle);
					childStyleOption.setAttribute("value", childStyleTitle);
					childStyleOption.innerHTML = childStyleTitle;
					wmsChildLayerStylesSelect.appendChild(childStyleOption);
				}
				wmsChildLayerStyles.appendChild(wmsChildLayerStylesSelect);
				// Fila de la capa hija
				wmsChildLayerTR.appendChild(wmsChildLayerCheckbox);
				wmsChildLayerTR.appendChild(wmsChildLayerTitle);
				wmsChildLayerTR.appendChild(wmsChildLayerStyles);
				wmsChildLayerListBody.appendChild(wmsChildLayerTR);
			}
			wmsChildLayerListTable.appendChild(wmsChildLayerListBody);
			wmsChildLayerListFieldset.appendChild(wmsChildLayerListTable);
			wmsChildLayerListTD2.appendChild(wmsChildLayerListFieldset);
			wmsChildLayerListTR.appendChild(wmsChildLayerListTD1);
			wmsChildLayerListTR.appendChild(wmsChildLayerListTD2);
			wmsLayerListBody.appendChild(wmsChildLayerListTR);
		}
	}
	wmsLayerListTable.appendChild(wmsLayerListBody);
	mainTableTD.appendChild(wmsLayerListTable);
	
	// Fila de espacio
	var GapTR2 = document.createElement('tr');
	var GapTD2 = document.createElement('td');
	GapTD2.setAttribute("colSpan","3");
	GapTD2.innerHTML = "&nbsp;";
	GapTR2.appendChild(GapTD2);
	wmsLayerListBody.appendChild(GapTR2);
	
	// Botones
	var buttonsTR = document.createElement('tr');
	var buttonsTD = document.createElement('td');
	buttonsTD.setAttribute("colSpan","3");
	var buttonsTable = document.createElement('table');
	if (IDEZar_API.isNetscape()) {
		buttonsTable.setAttribute("style", textSyle + " width: 100%;");
	} else {
		buttonsTable.style.setAttribute("cssText", textSyle + " width: 100%;");
	}
	var buttonsTableBody = document.createElement('tbody');
	var buttonsTableTR = document.createElement('tr');
	var buttonsOKTD = document.createElement('td');
	//buttonsOKTD.setAttribute("align", "right");
	buttonsOKTD.setAttribute("align", "center");
	var okButton = document.createElement('button');
	var okButtonText = document.createTextNode(messages["ok"]);
	okButton.appendChild(okButtonText);
	okButton.onclick = ok;
	buttonsOKTD.appendChild(okButton);
	/*var buttonsGapTD = document.createElement('td');
	buttonsGapTD.setAttribute("width", "30px");
	var buttonsCancelTD = document.createElement('td');
	buttonsCancelTD.setAttribute("align", "left");
	var cancelButton = document.createElement('button');
	var cancelButtonText = document.createTextNode(messages["cancel"]);
	cancelButton.appendChild(cancelButtonText);
	cancelButton.onclick = cancel;
	buttonsCancelTD.appendChild(cancelButton);*/
	buttonsTableTR.appendChild(buttonsOKTD);
	/*buttonsTableTR.appendChild(buttonsGapTD);
	buttonsTableTR.appendChild(buttonsCancelTD);*/
	buttonsTableBody.appendChild(buttonsTableTR);
	buttonsTable.appendChild(buttonsTableBody);
	buttonsTD.appendChild(buttonsTable);
	buttonsTR.appendChild(buttonsTD);
	wmsLayerListBody.appendChild(buttonsTR);	
};
