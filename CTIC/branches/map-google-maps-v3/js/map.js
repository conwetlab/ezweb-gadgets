/*
 *
 * Copyright 2009 (C) Fundación CTIC <http://www.fundacionctic.org/>
 *
 * This file is part of the generic Map Gadget for the EzWeb Platform
 *
 * Map Gadget is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Map Gadget is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Map Gadget. If not, see <http://www.gnu.org/licenses/>.
 *
 */

var map = null;
var mgr = null;
var geocoder = null;
var editMarker = null;
var mapClickHandler = null;
var cityLimits = new GLatLngBounds(new GLatLng(-90, -180), new GLatLng(90,180)); // default: the world
var oldLatLng = null;
var zoom = 15;

var wgs84Coord = new EzWebAPI.createRGadgetVariable("wgs84CoordSlot",_wgs84CoordHandler);
var geojson = new EzWebAPI.createRGadgetVariable("geojsonSlot",_geojsonHandler);
var boundingBox = new EzWebAPI.createRGadgetVariable("boundingBoxSlot",_boundingBoxHandler);

var geojsonEvent = new EzWebAPI.createRWGadgetVariable("geojsonEvent");
var wgs84Coord = new EzWebAPI.createRWGadgetVariable("wgs84CoordEvent");
var uriEvent = new EzWebAPI.createRWGadgetVariable("uriEvent");

var _editionPref = EzWebAPI.createRGadgetVariable("editionPref", _editionPrefHandler);
var _centerPref = EzWebAPI.createRGadgetVariable("centerPref", _centerPrefHandler);

function init() {

    if (GBrowserIsCompatible()) {
        map = new GMap2(document.getElementById("map"));
        var center = new GLatLng(0,0);
        map.setCenter(center, zoom);
        map.setUIToDefault();
        map.addControl(new GLargeMapControl());
        map.addControl(new GMapTypeControl());
        map.addControl(new GScaleControl());
        geocoder = new GClientGeocoder();
        mgr = new MarkerManager(map);

        _editionPrefHandler(_editionPref.get());

        _centerPrefHandler(_centerPref.get()); // center the map
    }
}


function centerMap(lat, lng){
    var center = new GLatLng(lat, lng);
    map.setCenter(center, zoom);
}


function _centerPrefHandler(value){

    _centerPref.set(value);

    if (_centerPref.get()) {
        var wgs84coord = _centerPref.get().split(",");
        if(wgs84coord.length>=2) {
	        var lat = wgs84coord[0]*1;
	        var lng = wgs84coord[1]*1;
            centerMap(lat, lng);
        }
    } else {
        var center = cityLimits.getCenter();
        centerMap(center.lat(), center.lng());
    }
}


function _boundingBoxHandler(value){
    var bbox = value.split(",");

    if (bbox.length != 4) {
        return false;
    }

    //It is a string (comma separated), composed by: min longitude, min latitude, max longitude, max latitude"
    var minLon = bbox[0];
    var minLat = bbox[1];
    var maxLon = bbox[2];
    var maxLat = bbox[3];

    // initialite city bounds
    cityLimits = new GLatLngBounds(new GLatLng(minLat, minLon), new GLatLng(maxLat, maxLon));

    // center the map using the city bounds
    var center = cityLimits.getCenter();
    centerMap(center.lat(), center.lng());
}


function _editionPrefHandler(value){

    _editionPref.set(value);

    if (_editionPref.get().toLowerCase() == "true") { //FIXME Boolean value in preferences instead of text ?
	    mapClickHandler = GEvent.addListener(map, "click", mapClick);
	    return true;
    }

    if (_editionPref.get().toLowerCase() !== "true" && mapClickHandler !== null) { //FIXME Boolean value in preferences instead of text ?
	    if (mapClickHandler !== null) {GEvent.removeListener(mapClickHandler);}
	    if (editMarker !== null) {map.removeOverlay(editMarker); editMarker = null;}
	    return false;
    }

}

function containsLatLng(latlng) {

   if (cityLimits.containsLatLng(latlng)){ 
       return true;
   } else {
       return false;
   }
}


function mapClick(overlay, latlng, overlaylatlng) {

    if(overlay){ return false; } // if click is over another element different of the map (i.e. a marker, an infobox...), don't do anything.

    if (editMarker !== null) {map.removeOverlay(editMarker); editMarker = null;}

    editMarker = new GMarker(latlng, {draggable: true, bouncy: true, clickable: false});

    GEvent.addListener(editMarker, "dragstart", function() {
        map.closeInfoWindow();
    });

    GEvent.addListener(editMarker, "dragend", getAddress);

    getAddress(latlng);

}


function getAddress(latlng) {

  if (latlng !== null) {
      if(containsLatLng(latlng)){ // If the point is inside the bounds
          oldLatLng = latlng;
          editMarker.setLatLng(latlng);
          map.addOverlay(editMarker);
          geocoder.getLocations(latlng, showAddress);
      } else {
          alert("Este punto está fuera de la ciudad de Zaragoza.\nSeleccione una posición válida.");
          if(oldLatLng !== null){
            editMarker.setLatLng(oldLatLng);
            map.addOverlay(editMarker);
          } else {
            // center the map
            var center = cityLimits.getCenter();
            centerMap(center.lat(), center.lng());
          }
      }
  }
}


function showAddress(response) {
    var address = "";

    if (response && response.Status.code == 200) {
        place = response.Placemark[0];
        editMarker.bindInfoWindowHtml(place.address);
        editMarker.openInfoWindowHtml(place.address);

        // Save the address
        address = place.address;

        //Remove the country of the address due to index purpouses
        address = address.substring(0, address.lastIndexOf(','));
    } else {
        alert("Error: Status Code:" + response.Status.code+" in getLocations service.");
    }

    // Wiring propagation
    var lat = editMarker.getLatLng().lat();
    var lon = editMarker.getLatLng().lng();
    var alt = 0;

    //  wgs84      
    var poi = lat + "," + lon + "," + alt;
    wgs84Coord.set(poi);

    // GeoJSON
    //
    // http://www.geojson.org/geojson-spec.html
    // Using KML information in properties

    // One point
    //{ "type": "Feature", 
    //  "geometry": {"type": "Point", 
    //               "coordinates": ["-0.87862533", "41.656563", 0]
    //              }, 
    //  "properties": {"address": "Calle Melancolia 34"}
    //}

    var poiJSON = { "type" : "Feature",
        	        "geometry" : {"type" : "Point", "coordinates" : [lon, lat, alt]},
                    "properties" : {"address" : address}
    };

    geojsonEvent.set(Object.toJSON(poiJSON));
}


function _geojsonHandler(geojson){

    // GeoJSON
    // http://www.geojson.org/geojson-spec.html
    // Using KML information in properties


    //  Example of one point
    //
    //    {"type": "Feature", 
    //    "geometry": { "type": "Point", "coordinates": ["-0.87862533", "41.656563", 0]}, 
    //    "properties": {
    //                      "name": "Basílica de Nuestra Señora del Pilar", 
    //                      "description": "PILAR, PL. NTRA. SRA.", 
    //                      "address": "Plaza del Pilar", 
    //                      "icon": "http://maps.google.com/mapfiles/ms/micons/camera.png",
    //                      "uri": "http://www.zaragoza.es/turruta/resource/Monumento/100" }
    //    }

    //  Example of a list of points
    //
    //    {"type": "FeatureCollection", 
    //    "features": [
    //    {"type": "Feature", 
    //    "geometry": { "type": "Point", "coordinates": ["-0.87862533", "41.656563", 0]}, 
    //    "properties": {
    //                      "name": "Basílica de Nuestra Señora del Pilar", 
    //                      "description": "PILAR, PL. NTRA. SRA.", 
    //                      "address": "Plaza del Pilar", 
    //                      "icon": "http://maps.google.com/mapfiles/ms/micons/lodging.png",
    //                      "uri": "http://www.zaragoza.es/turruta/resource/Monumento/100" }
    //    },
    //    {"type": "Feature", 
    //    "geometry": { "type": "Point", "coordinates": ["-0.8758136", "41.65508", 0]}, 
    //    "properties": {
    //                      "name": "Catedral de San Salvador o la Seo", 
    //                      "description": "La primera catedral cristiana de Zaragoza, construida bajo la advocación de San Salvador.", 
    //                      "address": "Plaza del Pilar", 
    //                      "icon": "http://maps.google.com/mapfiles/ms/micons/camera.png",
    //                      "uri": "http://www.zaragoza.es/turruta/resource/Monumento/0" }
    //    }]}

    mgr.clearMarkers();
    var markersBounds = new GLatLngBounds();

    if (editMarker !== null) {map.removeOverlay(editMarker); editMarker = null;}

    var pois = (geojson.evalJSON(true));

    if (pois.type === "Feature"){ // a poi
	    pois = [pois];
    }
    else if (pois.type === "FeatureCollection"){ // a list of pois
	    pois = pois.features;
    }
    else {
        throw "not valid GeoJSON";
    }

    var i=0;
    for (i=0;i<pois.length;i++) {
	    var poi = pois[i];
	    if (poi.geometry.coordinates[0] === null || poi.geometry.coordinates[1] === null) {
		    continue;
        }
	    var values = poi.geometry.coordinates;
                markersBounds.extend(new GLatLng(poi.geometry.coordinates[1], poi.geometry.coordinates[0])); 	

	    var info ="";
	    if (poi.properties.name) {
		    info += poi.properties.name;
	    }

	    var icon ="";
	    if (poi.properties.icon) {
		    icon += poi.properties.icon;
	    }

	    var uri ="";
	    if (poi.properties.uri) {
		    uri = poi.properties.uri;
	    }

	    _wgs84Handler(values, info, icon, uri);
    }

    if (pois.length > 0) {
        map.setCenter(markersBounds.getCenter(), map.getBoundsZoomLevel(markersBounds));
    }

    //wiring propagation
    sendEvents();
}


function _wgs84CoordHandler(wgs84coord) {
    mgr.clearMarkers();
    var values = wgs84coord.split(",");
    _wgs84Handler(values, null, null, null);
}


function _wgs84Handler(wgs84coord, label, icon, uri) {

    if (!wgs84coord) {
	    return false;
    }

    if (!label) {
	    label = "";
    }

    if(wgs84coord.length>=2) {
	    var lon = wgs84coord[0]*1; //longitude, latitude (geojson)
	    var lat = wgs84coord[1]*1; 
	    //FIXME Check precision variable
	    createPointGeo(lat, lon, label, true, icon, uri);
    }
}


function createPointGeo(lat, lon, info, center, icon, uri){
    if (lat && lon) {
        var point = new GLatLng(lat, lon);
        return createMarker(point, info, center, icon, uri);
    }
    return null;
}


function createMarker(point, info, center, icon, uri) {
    var markerOptions = { icon: G_DEFAULT_ICON };
    var GoogleIcon = new GIcon(G_DEFAULT_ICON);

    if (icon) {
        GoogleIcon.image = icon;
        GoogleIcon.iconSize=new GSize(32,32);
        GoogleIcon.shadowSize=new GSize(56,32);
        GoogleIcon.iconAnchor=new GPoint(16,32);
        GoogleIcon.infoWindowAnchor=new GPoint(16,0); 
        markerOptions = { icon: GoogleIcon };
    }

    var marker = new GMarker(point, markerOptions);
    var str;
    if (uri){
        str = "Select: <a href=\"#\" onclick=\"uriEvent.set('"+uri+"');\">"+info+"</a>";
    } else {
        if (info) {
            str = info;
        } else {
            str = point.lat() + ", " + point.lng();
        }
    }
    GEvent.addListener(marker, "click", function() {marker.openInfoWindowHtml(str);});

    if (center){
        map.setCenter(point, zoom);
    }

    mgr.addMarker(marker, 0);
    return marker;
}


function sendEvents(){
    geojsonEvent.set(geojson.get());
}

