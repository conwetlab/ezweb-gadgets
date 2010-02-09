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

// Estilo de las herramientas

var styleSheet = document.createElement("link"); 
styleSheet.rel = "stylesheet"; 
styleSheet.type = "text/css"; 
styleSheet.href = IDEZar_API.URL + IDEZar_API.DIR + "styles/red.css";
document.getElementsByTagName("head")[0].appendChild(styleSheet); 

OverviewMap = {};
OverviewMap.imageStable = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/toggleOverview_stable_22x22.png";
OverviewMap.imageOver = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/toggleOverview_over_22x22.png";
OverviewMap.imageSelected = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/toggleOverview_click_22x22.png";

FullExtent = {};
FullExtent.imageStable = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/fullExtent_stable_22x22.png";
FullExtent.imageOver = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/fullExtent_over_22x22.png";
FullExtent.imageSelected = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/fullExtent_click_22x22.png";

ZoomBox = {};
ZoomBox.imageStable = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/zoomInCentered_stable_22x22.png";
ZoomBox.imageOver = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/zoomInCentered_over_22x22.png";
ZoomBox.imageSelected = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/zoomInCentered_click_22x22.png";

ZoomOut = {};
ZoomOut.imageStable = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/zoomOutCentered_stable_22x22.png";
ZoomOut.imageOver = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/zoomOutCentered_over_22x22.png";
ZoomOut.imageSelected = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/zoomOutCentered_click_22x22.png";

DragPan = {};
DragPan.imageStable = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/pan_stable_22x22.png";
DragPan.imageOver = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/pan_over_22x22.png";
DragPan.imageSelected = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/pan_click_22x22.png";

MeasureTools = {};
MeasureTools.geometryStyle = {					    
	fillColor: "#a21c1c",
	fillOpacity: 0.3, 
	hoverFillColor: "white",
	hoverFillOpacity: 0.8,
	strokeColor: "#a21c1c",
	strokeOpacity: 1,
	strokeWidth: 1.5,
	strokeLinecap: "round",
	hoverStrokeColor: "red",
	hoverStrokeOpacity: 1,
	hoverStrokeWidth: 0.2,
	//strokeDashstyle: "dot",
	pointRadius: 5,
	hoverPointRadius: 1,
	hoverPointUnit: "%",
	pointerEvents: "visiblePainted",
	cursor: ""
};
MeasureTools.textStyle = {
	fontFamily: "Arial",
	fontSize: "8pt"
};

AreaMeasure = {};
AreaMeasure.imageStable = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/areaMeasure_stable_22x22.png";
AreaMeasure.imageOver = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/areaMeasure_over_22x22.png";
AreaMeasure.imageSelected = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/areaMeasure_click_22x22.png";

DistanceMeasure = {};
DistanceMeasure.imageStable = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/distanceMeasure_stable_22x22.png";
DistanceMeasure.imageOver = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/distanceMeasure_over_22x22.png";
DistanceMeasure.imageSelected = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/distanceMeasure_click_22x22.png";

LoadingMap = {};
LoadingMap.messageColor = "#a21c1c";
LoadingMap.wmsClientFontFamily = "Arial";
LoadingMap.standardFontSize = "12px";
LoadingMap.loadingImg = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/waiting.gif";

Tabs = {};
Tabs.fontFamily = "Arial";
Tabs.fontSize = "12px";
Tabs.imgLeftOff = IDEZar_API.URL + IDEZar_API.DIR + "img/Tabs/TabLeft_off.gif";
Tabs.imgCenterOff = IDEZar_API.URL + IDEZar_API.DIR + "img/Tabs/TabCenter_off.gif";
Tabs.imgRightOff = IDEZar_API.URL + IDEZar_API.DIR + "img/Tabs/TabRight_off.gif";
Tabs.imgLeftOn = IDEZar_API.URL + IDEZar_API.DIR + "img/Tabs/TabLeft_on.gif";
Tabs.imgCenterOn = IDEZar_API.URL + IDEZar_API.DIR + "img/Tabs/TabCenter_on.gif";
Tabs.imgRightOn = IDEZar_API.URL + IDEZar_API.DIR + "img/Tabs/TabRight_on.gif";
Tabs.imgHeight = "22px";

Nomenclator = {};
Nomenclator.imageStable = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/search_stable_22x22.png";
Nomenclator.imageOver = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/search_over_22x22.png";
Nomenclator.imageSelected = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/search_click_22x22.png";
Nomenclator.servletUrl = "http://idee.unizar.es/URLRelayServlet/URLRelayServlet";
Nomenclator.serviceUrl = "http://idee.unizar.es/IDEE-WFS-Nomenclator-NG/services";
Nomenclator.style = {};
Nomenclator.style.styleSheet = IDEZar_API.URL + IDEZar_API.DIR + "styles/nomenclator.css";
Nomenclator.style.color = "#8DB2E3";
Nomenclator.style.searchImgStable = IDEZar_API.URL + IDEZar_API.DIR + "img/Nomenclator/buscar_stable.png";
Nomenclator.style.searchImgOver = IDEZar_API.URL + IDEZar_API.DIR + "img/Nomenclator/buscar_over.png";
Nomenclator.style.searchImgClick = IDEZar_API.URL + IDEZar_API.DIR + "img/Nomenclator/buscar_click.png";
Nomenclator.style.cleanImgStable = IDEZar_API.URL + IDEZar_API.DIR + "img/Nomenclator/limpiar_stable.png";
Nomenclator.style.cleanImgOver = IDEZar_API.URL + IDEZar_API.DIR + "img/Nomenclator/limpiar_over.png";
Nomenclator.style.cleanImgClick = IDEZar_API.URL + IDEZar_API.DIR + "img/Nomenclator/limpiar_click.png";
Nomenclator.style.loadingImg = IDEZar_API.URL + IDEZar_API.DIR + "img/Nomenclator/loading.gif";
Nomenclator.style.errorImg = IDEZar_API.URL + IDEZar_API.DIR + "img/Nomenclator/error.png";

GML = {};
GML.geometryStyle = {					    
	fillColor: "#a21c1c",
	fillOpacity: 0.2, 
	strokeColor: "#a21c1c",
	strokeOpacity: 1,
	strokeWidth: 1,
	strokeLinecap: "round",
	pointRadius: 6
};

KMLSelector = {};
KMLSelector.imageStable = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/viewKML_stable_22x22.png";
KMLSelector.imageOver = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/viewKML_over_22x22.png";
KMLSelector.imageSelected = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/viewKML_click_22x22.png";

DrawPoint = {};
DrawPoint.imageStable = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/addPoint_stable_22x22.png";
DrawPoint.imageOver = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/addPoint_over_22x22.png";
DrawPoint.imageSelected = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/addPoint_click_22x22.png";

addWMS = {};
addWMS.color = "#a21c1c";
addWMS.backgroundImg = IDEZar_API.URL + IDEZar_API.DIR + "img/red_style/fondo.png";
addWMS.wmsClientFontFamily = "Arial";
addWMS.standardFontSize = "10px";
addWMS.checkboxStable = IDEZar_API.URL + IDEZar_API.DIR + "img/Others/checkBoxUnchecked_out.gif";
addWMS.checkboxOver = IDEZar_API.URL + IDEZar_API.DIR + "img/Others/checkBoxUnchecked_over.gif";
addWMS.checkboxClick = IDEZar_API.URL + IDEZar_API.DIR + "img/Others/checkBoxChecked_out.gif";
