/*
 *
 * Copyright 2009 (C) Fundación CTIC <http://www.fundacionctic.org/>
 *
 * This file is part of the generic visualizadorIDEZar Gadget for the EzWeb Platform
 *
 * visualizadorIDEZar Gadget is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * visualizadorIDEZar Gadget is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with visualizadorIDEZar Gadget. If not, see <http://www.gnu.org/licenses/>.
 *
 */

// Redefinicion de metodos propios de la API para adaptar el visor al entorno de EzWeb
// (comunicación HTTP proporcionada por la libreria de EzWeb, generar eventos, etc)

// Peticiones GET por parte del Facade de la API
IDEZar_API.FacadeUtils.doGetRequest = function(url, onLoad, requestProperties) {
	// Guardar parámetros de la petición, necesarios al capturar la respuesta
	IDEZar_API.FacadeUtils.currentRequestProperties = requestProperties;
	// Mostrar "Cargando..."
	IDEZar_API.FacadeUtils.showLoadingDataDIV();
	// Realizar petición
	EzWebAPI.send_get(url, this, onLoad, onLoad);
};
// Recibir respuesta de la peticion GetCapabilities
IDEZar_API.FacadeUtils.askForWMSLayerList = function(response) {
	var reqProperties = IDEZar_API.FacadeUtils.currentRequestProperties;
	IDEZar_API.FacadeUtils.hideLoadingDataDIV();
	var newAddWMS;
	newAddWMS = OpenLayers.IAAA_Utils.parseCapabilitiesXML(newAddWMS, response.responseXML, reqProperties.url, reqProperties.name, reqProperties.version, reqProperties.tile, reqProperties.isWMSC);
	// Añadir parámetros propios del WMS
	for (var k in reqProperties.params) {
		newAddWMS.params[(k+"").toUpperCase()] = reqProperties.params[k];
	}
	// Se comprueba si es WMS-C y si cumple las condiciones para condicionar el comportamiento del mapa
	var WMSC = (newAddWMS.isWMSC && newAddWMS.maxExtent && newAddWMS.resolutions && newAddWMS.getSRSList()[newAddWMS.getSelectedSRS()]);
	if (WMSC && (newAddWMS.CLASS_NAME == "OpenLayers.Layer.IAAA_Server") &&
			IDEZar_API.FacadeUtils.myMap.map.ancientMaxExtent && map.ancientResolutions) {
		// Si es WMS-C, y ya hay alguno agregado al mapa, comprobamos si sus caracterásticas son las mismas.
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
	// Generar DIV para introducir las capas del WMS a añadir al mapa
	IDEZar_API.FacadeUtils.generateAddWMSLayersDIV(newAddWMS);
	// Guardar WMS por si hay que regenerar el DIV (redimensión)
	IDEZar_API.FacadeUtils.newAddWMS = newAddWMS;
	IDEZar_API.FacadeUtils.addFirst = reqProperties.addFirst;
};
// Redefinir métodos asociados a un Mapa para su uso en un Gadget de EzWeb
function changeMapForEzWeb(map) {
	// Peticiones de ficheros GeoRSS
	map.loadGeoRSS = function(geoRss) {
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
		geoRssLayer.parseDataGeneric = function(ajaxRequest) {
			try {
				this.parseData(ajaxRequest);
			} catch (e) {
				this.events.triggerEvent('loadend');
				alert(messages["errorLoadingGeoRSS"]);
				loadedGeoRSS = null;
			}
		};
		geoRssLayer.redraw = function() {
			this.loaded = false;
			this.events.triggerEvent("loadstart");
			var url = this.location;
			var first = true;
			if (url.indexOf('?') > 0) first = false;
			for (var i in this.params) {
				if (first) {
					url += "?" + i + "=" + this.params[i];
					first = false;
				} else {
					url += "&" + i + "=" + this.params[i];
				}
			}
			EzWebAPI.send_get(url, this, this.parseDataGeneric, this.parseDataGeneric);
			this.loaded = true;
		};
		// Al añadirse la capa al mapa se realiza la transformación de SRS si es necesario
		this.map.addLayer(geoRssLayer);
	};
	// Propagar evento de punto dibujado
	map.toolbar.drawPoint.control.handler.mouseup = function(evt) {
		if (this.drawing) {
			var newFeature = this.point.clone();
			this.control.handler.permanentLayer.addFeatures(newFeature);
			// Guardarse la feature si sólo se permite pintar una
	        if (!this.multipoint) {
				this.control.currentPoint = newFeature;
				this.control.currentPoint.srs = this.map.getProjection();
				// Propagar evento
				getDrawnPoint();
			}
            this.finalize();
            return false;
        } else {
            return true;
        }
	};
	// Propagar evento de area visualizada
	map.map.events.register("newExtent", map.map, getExtent);
	// Guardar primer punto extraído del GeJSON (y mostrar Popup con info asociada)
	map.loadGeoJSON = function(geoJson, scale) {
		// Capa que contiene la información GeoJSON (se incluye un parámetro para
		// indicar que los datos vectoriales provienen de un GeoJSON)
		var popupStyle = {
			bubble: true,
			ignorePadding: true,
			ignoreMapSizeRestrictions: true,
			anchorSize: new OpenLayers.Size(6,6),
			anchorOffset: new OpenLayers.Pixel(0,0),
			opacity: 1.0,
			border: "1px solid black",
			backgroundColor: "#FFFFFF",
			font: "11pt arial"
		};
		var geoJsonLayer = new OpenLayers.Layer.IAAA_VectorGenericPopups("GeoJSON_layer",
			{style: geoJson.style,
			popupStyle: popupStyle,
			displayOutsideMaxExtent: true,
			alwaysInRange: true,
			resolutions: this.map.baseLayer.resolutions,
			maxExtent: this.map.baseLayer.maxExtent,
			GeoJSONdata: true});
		this.map.addLayer(geoJsonLayer);
		// Cambiar modo de generar Popup
		geoJsonLayer.generatePopupContent = function (feature) {
	    	var mainDivStyle = "padding: 5px; overflow: hidden;";
	    	var shortId = feature.id.replace("OpenLayers.Feature.","");
	    	var featureName = feature.attributes.name || "no info";
	    	var content = "<div style='" + mainDivStyle  + "'>";
	    	if (feature.attributes.uri) content += "<a class='link' style='color:red; text-decoration:none;' href='" + feature.attributes.uri +"' target='_blank'>";
	    	content += '<b>' + featureName + '</b>';
	    	if (feature.attributes.uri) content += '</a>';
	    	var attributesList = "";
	    	if (feature.attributes.description) attributesList += "<li><b>Descripción</b> " + feature.attributes.description + "</li>";
	    	if (feature.attributes.address) attributesList += "<li><b>Dirección</b> " + feature.attributes.address + "</li>";
	    	if (attributesList) {
	    		content += "<ul>" + attributesList + "</ul>";
	    	}
	    	content += "</div>";
	    	return content;
	    };
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
	    
	    var firstPoint = true;
		// Transformar las geometrías al SRS del mapa
		for (var i in featuresGeoJSON) {
			var newGeometry = new OpenLayers.IAAA_SRSGeometry(featuresGeoJSON[i].geometry, geoJson.srs);
			// Transformar
			newGeometry.transformSrs(this.map.getProjection());
			featuresGeoJSON[i].geometry = newGeometry.geometry.clone();
			// Propagar primer punto extraído del GeoJSON
			if (firstPoint && (featuresGeoJSON[i].geometry.CLASS_NAME == "OpenLayers.Geometry.Point")) {
				firstPoint = false;
				var point = {
					x: featuresGeoJSON[i].geometry.x,
					y: featuresGeoJSON[i].geometry.y,
					srs: this.map.getProjection()
				};
				getDrawnPointExternal(point);
			} else if (firstPoint && (featuresGeoJSON[i].geometry.CLASS_NAME == "OpenLayers.Geometry.Collection")) {
				for (var j in featuresGeoJSON[i].geometry.components) {
					if (featuresGeoJSON[i].geometry.components[j].CLASS_NAME == "OpenLayers.Geometry.Point") {
						firstPoint = false;
						var point = {
							x: featuresGeoJSON[i].geometry.components[j].x,
							y: featuresGeoJSON[i].geometry.components[j].y,
							srs: this.map.getProjection()
						};
						getDrawnPointExternal(point);
						break;
					}
				}
			}
		}
		// Añadir contenido del objeto GeoJSON
		geoJsonLayer.addFeatures(featuresGeoJSON);
		
		// Centrar mapa en la escala indicada
		if (scale) {
			var extent = geoJsonLayer.getDataExtent();
			var centerLonLat = extent.getCenterLonLat();
			this.map.zoomToScale(parseFloat(scale), true);
			this.map.setCenter(centerLonLat);
		}
	};
};