Map gadget
==========

Generic Map Gadget (0.4) for the EzWeb Platform.

Authors
-------

This gadget was developed by CTIC Foundation <http://www.fundacionctic.org/>.

    Main authors:
        - Carlos Tejo <carlos.tejo@fundacionctic.org>
        - Sergio Fernández <sergio.fernandez@fundacionctic.org>

    Contributors:
        - Ignacio Barrientos <ignacio.barrientos@fundacionctic.org>
        - Javier Pozueco <javier.pozueco@fundacionctic.org>

Instalation
-----------

Use the guidelines of EzWeb for the installation of new gadgets, taking the
URI of the latest version of this gadget:

    http://idi.fundacionctic.org/ezweb/gadgets/map/map-0.4.xml


Getting the source code
-----------------------

The source code of this gadget is hosted in the MORFEO's forge:

    https://svn.forge.morfeo-project.org/ezweb-gadgets/CTIC/trunk/map


Requirements
------------

Using the version 2 of google maps API, it is necessary to indicate an API Key 
that depends where is hosted your installation of EzWeb. 

You can get your API Key at: http://code.google.com/apis/maps/signup.html


Features
--------

    1. Print a point:

        Using wgs84CoordSlot (Longitude, Latitude and precision (optional), 
        comma separated) or geojsonSlot (example later), a point is printed 
        in the map.

        Example of one point:

            {"type": "Feature", 
            "geometry": { "type": "Point", "coordinates": ["-0.87862533", "41.656563", 0]}, 
            "properties": {
              "name": "Basílica de Nuestra Señora del Pilar", 
              "description": "PILAR, PL. NTRA. SRA.", 
              "address": "Plaza del Pilar", 
              "icon": "http://maps.google.com/mapfiles/ms/micons/camera.png",
              "uri": "http://www.zaragoza.es/turruta/resource/Monumento/100" }
            }


    2. Print a list of points:

        Using geojsonSlot, a list of points is printed in the map.

        Example of a list of points:

            {"type": "FeatureCollection", 
            "features": [
            {"type": "Feature", 
            "geometry": { "type": "Point", "coordinates": ["-0.87862533", "41.656563", 0]}, 
            "properties": {
              "name": "Basílica de Nuestra Señora del Pilar", 
              "description": "PILAR, PL. NTRA. SRA.", 
              "address": "Plaza del Pilar", 
              "icon": "http://maps.google.com/mapfiles/ms/micons/lodging.png",
              "uri": "http://www.zaragoza.es/turruta/resource/Monumento/100" }
            },
            {"type": "Feature", 
            "geometry": { "type": "Point", "coordinates": ["-0.8758136", "41.65508", 0]}, 
            "properties": {
              "name": "Catedral de San Salvador o la Seo", 
              "description": "La primera catedral cristiana de Zaragoza", 
              "address": "Plaza del Pilar", 
              "icon": "http://maps.google.com/mapfiles/ms/micons/camera.png",
              "uri": "http://www.zaragoza.es/turruta/resource/Monumento/0" }
            }]}


    3. Center the map:

        Using centerPref Preference (WGS84 Coordinates. Longitude, Latitude 
        [comma separated]), the map is centered in that point. If editionPref 
        is set to "true", the map is centered in the center of the Bounding box 
        received (the default value is the whole world).

    4. Mark a point in the map:

        Using editionPref preference ("true" or "false"), the map allows to 
        mark a point in the map. It depends of the bounding Box slot to enclose 
        the possible marked points (default bounding box is the whole world).

        The information about the point could be sent using wgs84CoordEvent or 
        geojsonEvent.

    5. Bounds of choosing point:

        Using boundingBoxSlot (longitude, min latitude, max longitude, max 
        latitude [comma separated]), it is possible to select an box where only
        there is allow to mark a point.


    6. Send URI of a point:

        If a point has an URI, pressing the link on the infobox shown, the event
        uriEvent will be launch with the URI of the selected point.

