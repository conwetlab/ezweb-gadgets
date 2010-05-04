/*
 *
 * Copyright 2009 (C) Fundación CTIC <http://www.fundacionctic.org/>
 *
 * This file is part of the generic visualizadorMapas Gadget for the EzWeb Platform
 *
 * visualizadorMapas Gadget is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * visualizadorMapas Gadget is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with visualizadorMapas Gadget. If not, see <http://www.gnu.org/licenses/>.
 *
 */

// DEFINICION DE PARAMETROS
// EVENTS
// Area visualizada sobre el mapa
var visibleArea = EzWebAPI.createRWGadgetVariable("visibleArea");
function getExtent() {
	var extent = Facade.getExtent();
	var extentString = extent.xMin + "," + extent.yMin + "," + extent.xMax + "," + extent.yMax + "," + extent.srs;
	visibleArea.set(extentString);
}

// Punto dibujado sobre el mapa
var drawnPoint = EzWebAPI.createRWGadgetVariable("drawnPoint");
function getDrawnPoint() {
	var point = Facade.getDrawnPoint();
	var pointString = point.x + "," + point.y + "," + point.srs;
	drawnPoint.set(pointString);
}
function getDrawnPointExternal(point) {
	var pointString = point.x + "," + point.y + "," + point.srs;
	drawnPoint.set(pointString);
}

// SLOTS
// Establecer Extent a visualizar
function setMapExtent(extent) {
	var par = extent.split(",");
	var xMin, yMin, xMax, yMax, srs, scale;
	switch (par.length) {
		case 3:
			xMin = par[0];
			yMin = par[1];
			srs = par[2];
			Facade.setMapExtent(xMin, yMin, null, null, srs);
			break;
		case 4:
			xMin = par[0];
			yMin = par[1];
			srs = par[2];
			scale = par[3];
			Facade.setMapExtent(xMin, yMin, null, null, srs, scale);
			break;
		case 5:
			xMin = par[0];
			yMin = par[1];
			xMax = par[2];
			yMax = par[3];
			srs = par[4];
			Facade.setMapExtent(xMin, yMin, xMax, yMax, srs);
			break;
		case 6:
			xMin = par[0];
			yMin = par[1];
			xMax = par[2];
			yMax = par[3];
			srs = par[4];
			scale = par[5];
			Facade.setMapExtent(xMin, yMin, xMax, yMax, srs, scale);
			break;
		default:
			break;
	}
}
var area = EzWebAPI.createRGadgetVariable("area", setMapExtent);

//Dibujar punto
drawnPoints = [];
function drawPoint(point) {
	var par = point.split(",");
	var x, y, srs, scale;
	var punto;
	switch (par.length) {
		case 2:
			x = par[0];
			y = par[1];
			srs = Facade.myMap.map.getProjection();
			Facade.drawPoint(x, y, srs);
			punto = {x: x, y: y, srs: srs};
			drawnPoints.push(punto);
			getDrawnPointExternal(punto);
			break;
		case 3:
			x = par[0];
			y = par[1];
			srs = par[2];
			Facade.drawPoint(x, y, srs);
			punto = {x: x, y: y, srs: srs};
			drawnPoints.push(punto);
			getDrawnPointExternal(punto);
			break;
		case 4:
			x = par[0];
			y = par[1];
			srs = par[2];
			scale = par[3];
			Facade.drawPoint(x, y, srs, scale);
			punto = {x: x, y: y, srs: srs};
			drawnPoints.push(punto);
			getDrawnPointExternal(punto);
			break;
		default:
			break;
	}
}
var point = EzWebAPI.createRGadgetVariable("point", drawPoint);

// Añadir WMS
predefinedWMSBase = true;
function addNewWMS(wms) {
	var par = wms.split(",");
	var url, title, version, isWMSC;
	switch (par.length) {
		case 1:
			url = par[0];
			title = "WMS";
			Facade.addExclusiveWMS(url, title);
			predefinedWMSBase = false;
			break;
		case 2:
			url = par[0];
			title = "WMS";
			version = par[1];
			Facade.addExclusiveWMS(url, title, version);
			predefinedWMSBase = false;
			break;
		case 3:
			url = par[0];
			title = "WMS";
			version = par[1];
			isWMSC = toBoolean(par[2]);
			Facade.addExclusiveWMS(url, title, version, isWMSC);
			predefinedWMSBase = false;
			break;
		default:
			break;
	}
}
var wmsURL = EzWebAPI.createRGadgetVariable("wmsURL", addNewWMS);

// Añadir GeoRSS
loadedGeoRSS = null;
function loadGeoRSS(georss) {
	var par = georss.split(",");
	var url, srs;
	switch (par.length) {
		case 1:
			url = par[0];
			Facade.loadExclusiveGeoRSS(url);
			break;
		case 2:
			url = par[0];
			srs = par[1];
			Facade.loadExclusiveGeoRSS(url, srs);
			break;
		default:
			break;
	}
	loadedGeoRSS = {url: url, srs: srs};
}
var geoRssURL = EzWebAPI.createRGadgetVariable("geoRssURL", loadGeoRSS);

// Añadir GeoJSON
loadedGeoJSON = null;
function loadGeoJSON(geojson) {
	obj = eval("(" + geojson + ")");
	Facade.loadExclusiveGeoJSON(obj, null);
	loadedGeoJSON = {geojson: geojson};
}
var geoJSON = EzWebAPI.createRGadgetVariable("geoJSON", loadGeoJSON);

// PREFERENCIAS
// WMS de base
function getWMSBase() {
	return wmsPref.get();
}
function changeWMSBase(wmsName) {
	Facade.addPredefinedWMS(wmsName, true);
	predefinedWMSBase = true;
}
var wmsPref = EzWebAPI.createRGadgetVariable("wmsPref", changeWMSBase);

// Idioma
function getLang() {
	return langPref.get();
}
function changeLang(langName) {
	saveState();
	reloadApplication();
}
var langPref = EzWebAPI.createRGadgetVariable("langPref", changeLang);

// Estilo de visualizacion
function getStyle() {
	return stylePref.get();
}
function changeStyle(styleName) {
	saveState();
	reloadApplication();
}
var stylePref = EzWebAPI.createRGadgetVariable("stylePref", changeStyle);

// ESTADO
var savedState = EzWebAPI.createRWGadgetVariable("savedState");
var viewerState = EzWebAPI.createRWGadgetVariable("mapExtentState");
function saveState() {
	// Area y SRS del mapa
	var mapExtent = Facade.myMap.map.getExtent();
	var mapSrs = Facade.myMap.map.getProjection();
	// WMS de base (si no es uno predefinido)
	var WMSBase;
	if (!predefinedWMSBase) {
		var baseLayer = Facade.myMap.map.layers[0];
		WMSBase = {
			name: baseLayer.name,
			url: baseLayer.url,
			layers: baseLayer.params['LAYERS'],
			styles: baseLayer.params['STYLES'],
			transparent: baseLayer.params['TRANSPARENT'],
			format: baseLayer.params['FORMAT'],
			bgColor: baseLayer.params['BGCOLOR'],
			version: baseLayer.params['VERSION'],
			SRSList: baseLayer.SRSList,
			resolutions: baseLayer.resolutions,
			maxExtent: baseLayer.maxExtent,
			serviceType: baseLayer.serviceType,
			tiled: !(baseLayer.singleTile),
			formatSelected: baseLayer.formatSelected,
			selectedSRS: baseLayer.selectedSRS
		};
	}
	// Punto dibujado con la herramienta asociada
	var myPoint = Facade.getDrawnPoint();
	if (myPoint) {
		myPoint.fromTool = true;
		drawnPoints.push(myPoint);
	}
	// Guardar estado
	var state = {
		extent: mapExtent,
		srs: mapSrs,
		WMSBase: WMSBase,
		drawnPoints: drawnPoints,
		loadedGeoRSS: loadedGeoRSS,
		loadedGeoJSON: loadedGeoJSON
	};
	var jsonState = to_json(state);
	viewerState.set(jsonState);
	savedState.set("true");
}
function getState() {
	var jsonState;
	var saved = savedState.get();
	if (saved == "true") {
		jsonState = eval("(" + viewerState.get() + ")");
	}
	savedState.set("false");
	return jsonState;
}

// FUNCIONES UTILES
// Convertir un objeto a JSON
function to_json(object) {
	return JSON.stringify(object, function (key, value) {
	    return value;
	});
}
function toBoolean(string) {
    switch (string.toLowerCase()) {
        case "true": case "yes": case "1": return true;
        case "false": case "no": case "0": case null: return false;
        default: return Boolean(string);
    }
}
function reloadApplication() {
	window.location.reload();
}
