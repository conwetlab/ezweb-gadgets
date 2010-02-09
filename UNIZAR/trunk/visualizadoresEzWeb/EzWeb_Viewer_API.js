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

(function() {

	/**
	 * Namespace: IDEZar_API
	 * El objeto IDEZar_API proporciona un espacio de nombres para todos los
	 * elementos de la API.
	 */
	IDEZar_API = {};

	IDEZar_API.URL = "http://cinca.cps.unizar.es:81/";
	IDEZar_API.DIR = "repository/visualizadorMapas/";
	
	IDEZar_API.lang = "ES";
	IDEZar_API.defaultStyle = "blue";
	
	if (typeof(getLang)!="undefined") {
		var viewerLang = getLang();
		if (viewerLang) {
			IDEZar_API.lang = viewerLang;
		}
	}
	
	if (typeof(getStyle)!="undefined") {
		var viewerStyle = getStyle();
		if (viewerStyle) {
			IDEZar_API.defaultStyle = viewerStyle;
		}
	}
	
	var ideezar_api_files = new Array(
		"properties/messagesProperties_" + IDEZar_API.lang + ".js", // Mensajes
		"styles/" + IDEZar_API.defaultStyle + ".js", // Estilo
		"lib/OpenLayers_unidos_ofuscados.js", // Libreria de OpenLayers (Ofuscada)
		"lib/IDEZar_API_lib.js", // Libreria de IDEZar_API
		"lib/IDEZar_API_Facade.js" // Facade de IDEZar_API
	); // etc.

	var ideezar_api_agent = navigator.userAgent;
	var ideezar_api_docWrite = (ideezar_api_agent.match("MSIE") || ideezar_api_agent.match("Safari"));
	if(ideezar_api_docWrite) {
		var ideezar_api_allScriptTags = new Array(ideezar_api_files.length);
	}
	var ideezar_api_host = IDEZar_API.URL + IDEZar_API.DIR;
	for (var i = 0; i < ideezar_api_files.length; i++) {
		if (ideezar_api_docWrite) {
			ideezar_api_allScriptTags[i] = "<script src='" + ideezar_api_host + ideezar_api_files[i] +
							   "'></script>";
		} else {
			var ideezar_api_s = document.createElement("script");
			ideezar_api_s.src = ideezar_api_host + ideezar_api_files[i];
			var ideezar_api_h = document.getElementsByTagName("head").length ? 
					   document.getElementsByTagName("head")[0] : 
					   document.body;
			ideezar_api_h.appendChild(ideezar_api_s);
		}
	}
	if (ideezar_api_docWrite) {
		document.write(ideezar_api_allScriptTags.join(""));
	}

})();