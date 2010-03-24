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
var geocoder = null;
var editMarker = null;
var mapClickHandler = null;
var cityLimits = new google.maps.LatLngBounds(new google.maps.LatLng(-90, -180), new google.maps.LatLng(90,180)); // default: the world
var oldLatLng = null;
var zoom = 15;
var infowindow = null;

var wgs84Coord = new EzWebAPI.createRGadgetVariable("wgs84CoordSlot",_wgs84CoordHandler);
var geojson = new EzWebAPI.createRGadgetVariable("geojsonSlot",_geojsonHandler);
var boundingBox = new EzWebAPI.createRGadgetVariable("boundingBoxSlot",_boundingBoxHandler);

var geojsonEvent = new EzWebAPI.createRWGadgetVariable("geojsonEvent");
var wgs84Coord = new EzWebAPI.createRWGadgetVariable("wgs84CoordEvent");
var uriEvent = new EzWebAPI.createRWGadgetVariable("uriEvent");

var _editionPref = EzWebAPI.createRGadgetVariable("editionPref", _editionPrefHandler);
var _centerPref = EzWebAPI.createRGadgetVariable("centerPref", _centerPrefHandler);

function init() {

    var options = {
      zoom: zoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_RIGHT
      },
      navigationControl: true,
      navigationControlOptions: {
        style: google.maps.NavigationControlStyle.ZOOM_PAN,
        position: google.maps.ControlPosition.LEFT
      },
      scaleControl: true,
      scaleControlOptions: {
        position: google.maps.ControlPosition.BOTTOM_LEFT
      }
    }

    map = new google.maps.Map(document.getElementById("map"), options);

    infowindow = new google.maps.InfoWindow();

    geocoder = new google.maps.Geocoder();

    _editionPrefHandler(_editionPref.get());

    _centerPrefHandler(_centerPref.get()); // center the map
}


function centerMap(lat, lng){

    var center = new google.maps.LatLng(lat, lng);
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
    cityLimits = new google.maps.LatLngBounds(new google.maps.LatLng(minLat, minLon), new google.maps.LatLng(maxLat, maxLon));

    // center the map using the city bounds
    var center = cityLimits.getCenter();
    centerMap(center.lat(), center.lng());
}


function _editionPrefHandler(value){

    _editionPref.set(value);

    if (_editionPref.get().toLowerCase() == "true") { //FIXME Boolean value in preferences instead of text ?
	    mapClickHandler = google.maps.event.addListener(map, "click", mapClick);
	    return true;
    }

    if (_editionPref.get().toLowerCase() !== "true" && mapClickHandler !== null) { //FIXME Boolean value in preferences instead of text ?
	    if (mapClickHandler !== null) {google.maps.event.removeListener(mapClickHandler);}
	    if (editMarker !== null) {editMarker.setMap(null); editMarker = null;}
	    return false;
    }

}


function mapClick(event) {

    //if (overlay) { return false; } // if click is over another element different of the map (i.e. a marker, an infobox...), don't do anything.

    if (editMarker !== null) {editMarker.setMap(null); editMarker = null; infowindow.close();}

    editMarker = new google.maps.Marker({position: event.latLng, draggable: true, clickable: false});

    google.maps.event.addListener(editMarker, "dragstart", function() {
        infowindow.close();
    });

    google.maps.event.addListener(editMarker, "dragend", function() {
        getAddress(editMarker.getPosition());
    });

    getAddress(event.latLng);
}


function getAddress(latlng) {

  if (latlng !== null) {
      if(cityLimits.contains(latlng)){ // If the point is inside the bounds
          oldLatLng = latlng;
          editMarker.setPosition(latlng);
          editMarker.setMap(map);
          geocoder.geocode({latLng: latlng}, showAddress);
      } else {
          alert("Este punto está fuera de la ciudad de Zaragoza.\nSeleccione una posición válida.");
          if(oldLatLng !== null){
            editMarker.setPosition(oldLatLng);
            editMarker.setMap(map);
          } else {
            // center the map
            var center = cityLimits.getCenter();
            centerMap(center.lat(), center.lng());
          }
      }
  }
}


function showAddress(results, status) {
    var address = "";

    if (status == google.maps.GeocoderStatus.OK) {
        place = results[0];
        // Save the address
        address = place.formatted_address;

        //Remove the country of the address due to index purpouses
        address = address.substring(0, address.lastIndexOf(','));

        // Replace our Info Window's content and position
        infowindow.setContent(address);
        infowindow.open(map, editMarker);

    } else {
        alert("Error: Status Code:" + status+" in geocoding service.");
    }

    // Wiring propagation
    var lat = editMarker.getPosition().lat();
    var lon = editMarker.getPosition().lng();
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

var pending = 0;


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

    map.clearMarkers();
    var markersBounds = new google.maps.LatLngBounds();

    if (editMarker !== null) {editMarker.setMap(null); editMarker = null;}

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
    pending = pois.length;
    for (i=0;i<pois.length;i++) {
	    var poi = pois[i];

	    if ( poi.geometry.coordinates[0] === null || poi.geometry.coordinates[1] === null ){
            if (poi.properties.address) {
                if (geocoder) {
                  geocoder.geocode( { 'address': poi.properties.address}, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        poi.geometry.coordinates[0] = results[0].geometry.location.lng();
                        poi.geometry.coordinates[1] = results[0].geometry.location.lat();

                        markersBounds.extend(new google.maps.LatLng(poi.geometry.coordinates[1], poi.geometry.coordinates[0]));
                        _wgs84PreHandler(poi);
                        pending--;

                        return true;
                    } else {
//                        alert("Geocode was not successful for the following reason: " + status);
                        pending--;
                        return false;
                    }
                  });
                }
            } else {
                pending--;
                continue;
            }
        } else {

            markersBounds.extend(new google.maps.LatLng(poi.geometry.coordinates[1], poi.geometry.coordinates[0]));
            _wgs84PreHandler(poi);
            pending--;
        }
    }

    startWatching(pois, markersBounds);

}

// code use in order to simulate synchronous callbacks

function startWatching(pois, markersBounds){

    if (!haveEverythingNeeded()){
        setTimeout(startWatching,100);
        return;
    }

    allPointsChecked(pois, markersBounds);
}

function haveEverythingNeeded(){
    return pending == 0;
}

function allPointsChecked(pois, markersBounds){
    if (pois.length == 1) {
        map.setCenter(markersBounds.getCenter(), zoom);
    }

    if (pois.length > 1) {
        map.fitBounds(markersBounds);
    }

    //wiring propagation
    sendEvents();
}

function _wgs84PreHandler(poi){

    var values = poi.geometry.coordinates;

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
    return true;
}

function _wgs84CoordHandler(wgs84coord) {

    var values = wgs84coord.split(",");
    return _wgs84Handler(values, null, null, null);
}


function _wgs84Handler(wgs84coord, label, icon, uri) {

    if (!wgs84coord) {
	    return false;
    }

    if (!label) {
	    label = "";
    }

    if (wgs84coord.length>=2) {
	    var lon = wgs84coord[0]*1; //longitude, latitude (geojson)
	    var lat = wgs84coord[1]*1;
	    return createPointGeo(lat, lon, label, true, icon, uri);
    } else {
        throw "not valid WGS84 coordinates";
    }
}


function createPointGeo(lat, lon, info, center, icon, uri){

    if (lat && lon) {
        var point = new google.maps.LatLng(lat, lon);
        return createMarker(point, info, center, icon, uri);
    }
    return null;
}


function createMarker(point, info, center, icon, uri) {

    var marker = null;

    var title = point.lat() + ", " + point.lng();

    if (info){
       title = info;
    }

    if (uri && info){
        title = "Ir a: <a href=\"#\" onclick=\"uriEvent.set('"+uri+"');\">"+info+"</a>";
    }

    if (icon) {
        marker = new google.maps.Marker({position: point, icon: icon, title: title});
    } else {
        marker = new google.maps.Marker({position: point, title:title});       
    }

    google.maps.event.addListener(marker, "click", function(){    
        infowindow.setContent(marker.title);
        infowindow.open(map, marker);
    });

    if (center){
        map.setCenter(point, zoom);
    }

    map.addMarker(marker);
    return marker;
}


function sendEvents(){

    return geojsonEvent.set(geojson.get());
}

