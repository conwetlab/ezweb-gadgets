// EzWeb context variables
var width = EzWebAPI.createRGadgetVariable("width", repaint);
var height = EzWebAPI.createRGadgetVariable("height", repaint);
var lockStatus = EzWebAPI.createRGadgetVariable("lockStatus", setLock);
var user = EzWebAPI.createRGadgetVariable("lockStatus", setUser);
var theme = EzWebAPI.createRGadgetVariable("theme", setTheme);
var preferences = EzWebAPI.createRWGadgetVariable("preferences");
var timer = EzWebAPI.createRGadgetVariable("time", setTimer);

// EzWeb Events
var url = EzWebAPI.createRWGadgetVariable("url");
var map = EzWebAPI.createRWGadgetVariable("map");
var address = EzWebAPI.createRWGadgetVariable("address");
var webcam = EzWebAPI.createRWGadgetVariable("webcam");
var webcams = EzWebAPI.createRWGadgetVariable("webcams");

// Handlers functions
function repaint(){
  SnowReports.repaint();
  return;
}

function setLock(){
  return;
}

function setTheme(){
  SnowReports.setTheme();
}

function setUser(){
  return;
}

function setTimer(){
  this.initTimer();
  return;
}

/*******************************************************************************
* SNOW FORECAST CLASS
*******************************************************************************/
var SnowReports = function() {
	/* Call to the parent constructor */
	EzWebGadget.call(this, {translatable: false});
}

SnowReports.prototype = new EzWebGadget();


/*******************************************************************************
* REPAINT FUNCTION
*******************************************************************************/
SnowReports.prototype.repaint = function(){
  this.content.style.width = (document.body.offsetWidth > 220)?"auto":"215px";
  this.content.style.height = (document.body.offsetHeight > 155)?"auto":"126px";  
}

/*******************************************************************************
* INITIAL FUNCTION
*******************************************************************************/
SnowReports.prototype.init = function(){
  // SnowReport Info
  this.id = "";
  this.link = "";
  this.status = "";
  this.base = "";
  this.snowfall = "";
  this.surface_condition = "";
  this.metric = "";
  this.region = "";
  this.rss = "";
  this.resorts = {};
  this.countries = {};
  this.iterator = 0;
  // url feed
  this.feed_base_url = "http://www.nieveesquiar.com/";
  
  // Interface Wrappers
  this.header = document.createElement("div");
  this.content = document.createElement("div");
  this.info = document.createElement("div");
  this.map = document.createElement("div");
  this.header.className = "header-gadget";
  this.content.className = "content-gadget";
  document.body.appendChild(this.header);
  document.body.appendChild(this.content);
  this.setTheme();
  this.initData();
  this.setHeader();
  
  if(preferences.get() != ""){
    this.hiddenHeader();
    this.restorePreferences();
  }
    
  this.initTimer();
  this.getSnowReport();
  this.sendEvents();  
}

SnowReports.prototype.getSnowReport = function(){
  var url = "http://www.nieveesquiar.com/"+ this.select_resort.value + "/snow.rss";
  this.sendGet(url, this.parserInfo, this.onError, this.onException);
}

SnowReports.prototype.parserInfo = function(response){
  var rss = response.responseXML;
  var item = rss.getElementsByTagName("item");
  if (item.length > 0){
    item = item[0];
    this.id = (item.getElementsByTagName("ots:resort_id").length > 0)?item.getElementsByTagName("ots:resort_id")[0].firstChild.nodeValue:"";
    this.title = this.select_resort.options[this.select_resort.selectedIndex].text;
    this.link = (item.getElementsByTagName("guid").length > 0)?item.getElementsByTagName("guid")[0].firstChild.nodeValue:"";
    this.status = (item.getElementsByTagName("ots:open_staus").length > 0)?item.getElementsByTagName("ots:open_staus")[0].firstChild.nodeValue:"";
    this.base = (item.getElementsByTagName("ots:base_depth").length > 0)?item.getElementsByTagName("ots:base_depth")[0].firstChild.nodeValue:"";
    this.snowfall = (item.getElementsByTagName("ots:snowfall_48hr").length > 0)?item.getElementsByTagName("ots:snowfall_48hr")[0].firstChild.nodeValue:"";
    this.surface = (item.getElementsByTagName("ots:surface_condition").length > 0)?item.getElementsByTagName("ots:surface_condition")[0].firstChild.nodeValue:"";
    this.metric = (item.getElementsByTagName("ots:base_depth_metric").length > 0)?item.getElementsByTagName("ots:base_depth_metric")[0].firstChild.nodeValue:"";
    this.region = (item.getElementsByTagName("ots:region_name").length > 0)?item.getElementsByTagName("ots:region_name")[0].firstChild.nodeValue:"";
    this.rss = (item.getElementsByTagName("ots:resort_rss_link").length > 0)?item.getElementsByTagName("ots:resort_rss_link")[0].firstChild.nodeValue:"";
    this.setInfo();
  }
}


SnowReports.prototype.initData = function(){
  this.regions = ["Andorra", "España"];
  this.countries["Andorra"] = [{"key":"andorra/canillo","value":"Canillo"},  
                            {"key":"andorra/encamp","value":"Encamp"},
                            {"key":"andorra/pal-arnisal","value":"Pal-Arinsal"},
                            {"key":"andorra/pas-de-la-casa-grau-roig", "value":"Grau Roig"},
                            {"key":"andorra/pas-de-la-casa-grau-roig", "value":"Pas de la Casa"},
                            {"key":"andorra/ordino-arcalis","value":"Ordino-Arcalis"},
                            {"key":"andorra/soldeu-el-tarter","value":"Soldeu-El Tarter"}];


  this.countries["España"] = [{"key":"espana/alto-campoo","value":"Alto-Campoo"},
                            {"key":"espana/astun","value":"Astun"},  
                            {"key":"espana/baqueira-beret","value":"Baqueira-Beret"},
                            {"key":"espana/boi-taull-resort","value":"Boi-Taull"},
                            {"key":"espana/candanchu","value":"Candanchu"},
                            {"key":"espana/cerler","value":"Cerler"}, 
                            {"key":"espana/espot-esqui","value":"Espot-Esqui"},
                            {"key":"espana/formigal","value":"Formigal"}, 
                            {"key":"espana/la-molina","value":"La Molina"}, 
                            {"key":"espana/la-pinilla","value":"La Pinilla"}, 
                            {"key":"espana/leitariegos","value":"Leitariegos"}, 
                            {"key":"espana/manzaneda","value":"Manzaneda"},                             
                            {"key":"espana/masella","value":"Masella"},                             
                            {"key":"espana/panticosa","value":"Panticosa"},                             
                            {"key":"espana/port-aine","value":"Port-Aine"},                             
                            {"key":"espana/puerto-de-navacerrada","value":"Puerto de Navacerrada"},                             
                            {"key":"espana/san-isidro","value":"San Isidro"},                             
                            {"key":"espana/sierra-nevada","value":"Sierra Nevada"},                            
                            {"key":"espana/valdelinares","value":"Valdelinares"},                            
                            {"key":"espana/valdesqui","value":"Valdesqui"},                             
                            {"key":"espana/valdezcaray","value":"Valdezcaray"},                             
                            {"key":"espana/vall-de-nuria","value":"Vall de Nuria"}];
  
  this.resorts["Alto-Campoo"]={};                          
  this.resorts["Alto-Campoo"]["address"]="Estación Invernal Alto Campoo, 39210, Spain";
  this.resorts["Alto-Campoo"]["map"] = "http://www.meteored.com/esqui/imagenes/mapas/Alto%20Campoo.jpg";
  this.resorts["Alto-Campoo"]["url"] = "";
  this.resorts["Alto-Campoo"]["webcams"] = ["http://www.altocampoo.com/imagenes/webcam_tresmares/tresmares000M.jpg",
                                            "http://www.altocampoo.com/imagenes/webcam_chivo/chivo000M.jpg",
                                            "http://www.altocampoo.com/imagenes/webcam_calgosa/calgosa000M.jpg",
                                            "http://www.altocampoo.com/imagenes/webcam_branavieja/branavieja000M.jpg"];

  this.resorts["Astun"]={};
  this.resorts["Astun"]["address"]= "Astun Jaca Huesca";
  this.resorts["Astun"]["map"] = "http://www.meteored.com/esqui/imagenes/mapas/Alto%20Campoo.jpg";
  this.resorts["Astun"]["url"]= "http://www.astun.com/";
  this.resorts["Astun"]["webcams"] = ["http://www.astun.com/fotoscamaras/1003021217010101G.jpg",
                                      "http://www.astun.com/fotoscamaras/1003021217010104G.jpg",
                                      "http://www.todonieve.com/photowebcam.asp?fotografia=astun/astun.jpg",
                                      "http://www.astun.com/fotoscamaras/1003021217010102G.jpg",
                                      "http://www.astun.com/fotoscamaras/1003021217010105G.jpg",
                                      "http://www.astun.com/fotoscamaras/1003021217010103G.jpg",
                                      "http://www.astun.com/fotoscamaras/1003021217010106G.jpg"];
                                      
  this.resorts["Baqueira-Beret"]={};
  this.resorts["Baqueira-Beret"]["address"]= "Ctra de la Bonaigua s/n, 08034 Salardú, Spain";
  this.resorts["Baqueira-Beret"]["map"] = "http://www.meteored.com/esqui/imagenes/mapas/Baqueira%20Beret.jpg";
  this.resorts["Baqueira-Beret"]["url"]= "http://www.baqueira.es/";
  this.resorts["Baqueira-Beret"]["webcams"] = ["http://www.baqueira.es/images/webcams/bqpos5.jpg",
                                      "http://www.baqueira.es/images/webcams/bqpos6.jpg",
                                      "http://www.baqueira.es/images/webcams/bqpos4.jpg",
                                      "http://www.baqueira.es/images/webcams/ctpos1.jpg",
                                      "http://www.baqueira.es/images/webcams/bbpos6.jpg",
                                      "http://www.baqueira.es/images/webcams/bbpos1.jpg",
                                      "http://www.baqueira.es/images/webcams/bepos3.jpg",
                                      "http://www.baqueira.es/images/webcams/bepos5.jpg",
                                      "http://www.baqueira.es/images/webcams/ctpos8.jpg",
                                      "http://www.baqueira.es/images/webcams/orpos1.jpg",
                                      "http://www.baqueira.es/images/webcams/orpos2.jpg",
                                      "http://www.baqueira.es/images/webcams/peupos1.jpg",
                                      "http://www.baqueira.es/images/webcams/arpos7.jpg"];

  this.resorts["Boi-Taull"]={};                                      
  this.resorts["Boi-Taull"]["address"]= "Calle de Sant Quirze, 25528 la Vall de Boí, Spain";
  this.resorts["Boi-Taull"]["map"] = "http://www.meteored.com/esqui/imagenes/mapas/Boi%20Taull.jpg";
  this.resorts["Boi-Taull"]["url"]= "http://www.boitaullresort.es/";
  this.resorts["Boi-Taull"]["webcams"] = ["http://217.125.98.218/axis-cgi/jpg/image.cgi?resolution=704x576",
                                          "http://213.96.24.148/-wvhttp-01-/GetOneShot?image_size=768x576"];

  this.resorts["Candanchu"]={};                                      
  this.resorts["Candanchu"]["address"]= "Candanchú, 22889 Aísa Huesca, Spain";
  this.resorts["Candanchu"]["map"] = "http://www.meteored.com/esqui/imagenes/mapas/Candanchu.jpg";
  this.resorts["Candanchu"]["url"]= "http://www.candanchu.com/es/index.asp";
  this.resorts["Candanchu"]["webcams"] = ["http://www.todonieve.com/photowebcam.asp?fotografia=CandanchuNew/CandanchuNew.jpg",
                                          "http://www.todonieve.com/photowebcam.asp?fotografia=candanchu_rinconada/candanchu_rinco.jpg",
                                          "http://www.todonieve.com/photowebcam.asp?fotografia=candanchu_tobazo/candanchu_tobazo.jpg",
                                          "http://www.todonieve.com/photowebcam.asp?fotografia=candanchu/candanchu.jpg"];
                                          
  this.resorts["Cerler"]={};
  this.resorts["Cerler"]["address"]= "Calle del Molino, 22440 Benasque, Spain";
  this.resorts["Cerler"]["map"] = "http://www.cerler.com/Docs/Fotos/200911060902399375.jpg";
  this.resorts["Cerler"]["url"]= "http://www.cerler.com/";
  this.resorts["Cerler"]["webcams"] = ["http://imagenes.cerler.com/fotoscamaras/1003021236020101G.jpg",
                                       "http://imagenes.cerler.com/fotoscamaras/1003021236020102G.jpg",
                                       "http://imagenes.cerler.com/fotoscamaras/1003021236020103G.jpg",
                                       "http://imagenes.cerler.com/fotoscamaras/1003021236020104G.jpg",
                                       "http://imagenes.cerler.com/fotoscamaras/1003021236020105G.jpg",
                                       "http://imagenes.cerler.com/fotoscamaras/1003021236020107G.jpg",
                                       "http://imagenes.cerler.com/fotoscamaras/1003021236020108G.jpg",
                                       "http://imagenes.cerler.com/fotoscamaras/1003021236020201G.jpg",
                                       "http://imagenes.cerler.com/fotoscamaras/1003021237020202G.jpg",
                                       "http://imagenes.cerler.com/fotoscamaras/1003021237020203G.jpg",
                                       "http://imagenes.cerler.com/fotoscamaras/1003021237020204G.jpg",
                                       "http://imagenes.cerler.com/fotoscamaras/1003021237020206G.jpg",
                                       "http://imagenes.cerler.com/fotoscamaras/1003021237020207G.jpg",
                                       "http://imagenes.cerler.com/fotoscamaras/1003021237020208G.jpg",
                                       "http://imagenes.cerler.com/fotoscamaras/1003021237020209G.jpg",
                                       "http://imagenes.cerler.com/fotoscamaras/1003021237020301G.jpg",
                                       "http://imagenes.cerler.com/fotoscamaras/1003021238020302G.jpg",
                                       "http://imagenes.cerler.com/fotoscamaras/1003021238020303G.jpg",
                                       "http://imagenes.cerler.com/fotoscamaras/1003021238020304G.jpg",
                                       "http://imagenes.cerler.com/fotoscamaras/1003021238020305G.jpg",
                                       "http://imagenes.cerler.com/fotoscamaras/1003021238020306G.jpg",
                                       "http://imagenes.cerler.com/fotoscamaras/1003021238020307G.jpg",
                                       "http://imagenes.cerler.com/fotoscamaras/1003021238020308G.jpg",
                                       "http://imagenes.cerler.com/fotoscamaras/1003021238020309G.jpg"];                                          

  this.resorts["Espot-Esqui"]={};
  this.resorts["Espot-Esqui"]["address"]= "Carretera Berradé, S/N, 25597 Espot, Spain";
  this.resorts["Espot-Esqui"]["map"] = "http://www.meteored.com/esqui/imagenes/mapas/Super%20Espot.jpg";
  this.resorts["Espot-Esqui"]["url"]= "http://www.granpallars.com/";
  this.resorts["Espot-Esqui"]["webcams"] = ["http://www.granpallars.com/webcams/webcam_espot.jpg"];                                          

  this.resorts["Formigal"]={};
  this.resorts["Formigal"]["address"]= "El Formigal, 22640 Sallent de Gállego, Huesca, Spain";
  this.resorts["Formigal"]["map"] = "http://www.formigal.com/imagenes/plano_pistas.jpg";
  this.resorts["Formigal"]["url"]= "http://www.formigal.com/";
  this.resorts["Formigal"]["webcams"] = ["http://imagenes.formigal.com/fotoscamaras/1003021302010101G.jpg",
                                       "http://imagenes.formigal.com/fotoscamaras/1003021302010102G.jpg",
                                       "http://imagenes.formigal.com/fotoscamaras/1003021302010103G.jpg",
                                       "http://imagenes.formigal.com/fotoscamaras/1003021302010104G.jpg",
                                       "http://imagenes.formigal.com/fotoscamaras/1003021302010202G.jpg",
                                       "http://imagenes.formigal.com/fotoscamaras/1003021302010203G.jpg",
                                       "http://imagenes.formigal.com/fotoscamaras/1003021302010205G.jpg",
                                       "http://imagenes.formigal.com/fotoscamaras/1003021302010206G.jpg",
                                       "http://imagenes.formigal.com/fotoscamaras/1003021302010206G.jpg",
                                       "http://imagenes.formigal.com/fotoscamaras/1003021302010301G.jpg",
                                       "http://imagenes.formigal.com/fotoscamaras/1003021302010302G.jpg",
                                       "http://imagenes.formigal.com/fotoscamaras/1003021302010303G.jpg",
                                       "http://imagenes.formigal.com/fotoscamaras/1003021302010306G.jpg",
                                       "http://imagenes.formigal.com/fotoscamaras/1003021302010401G.jpg",
                                       "http://imagenes.formigal.com/fotoscamaras/1003021302010403G.jpg",
                                       "http://imagenes.formigal.com/fotoscamaras/1003021302010405G.jpg",
                                       "http://imagenes.formigal.com/fotoscamaras/1003021302010408G.jpg",
                                       "http://imagenes.formigal.com/fotoscamaras/1003021302010501G.jpg",
                                       "http://imagenes.formigal.com/fotoscamaras/1003021302010502G.jpg",
                                       "http://imagenes.formigal.com/fotoscamaras/1003021302010503G.jpg",
                                       "http://imagenes.formigal.com/fotoscamaras/1003021302010504G.jpg"];

  this.resorts["La-Molina"]={};
  this.resorts["La-Molina"]["address"]= "Edifici Telecabina s/n, La Molina 17537 ALP, Spain";
  this.resorts["La-Molina"]["map"] = "http://www.lamolina.cat/es/estacion/plano-de-pistas/Fotos/planol_pistes.jpg";
  this.resorts["La-Molina"]["url"]= "http://www.lamolina.cat/";
  this.resorts["La-Molina"]["webcams"] = ["http://www.lamolina.cat/es/webcams/Ftp/webcam_estadi.jpg",
                                       "http://www.lamolina.cat/es/webcams/Ftp/webcam_alabaus.jpg",
                                       "http://www.lamolina.cat/es/webcams/Ftp/webcam_rocblanc.jpg",
                                       "http://www.lamolina.cat/es/webcams/Ftp/fontcanaleta/snap_c1.jpg",
                                       "http://www.lamolina.cat/es/webcams/Ftp/pistallarga/snap_c1.jpg"];                                                                                 

  this.resorts["La-Pinilla"]={};
  this.resorts["La-Pinilla"]["address"]= "La Pinilla Cerezo de Arriba, Segovia, Spain";
  this.resorts["La-Pinilla"]["map"] = "http://www.lapinilla.es/site/wp-content/themes/la-pinilla-09/images/mapa-de-pistas-la-pinilla.jpg";
  this.resorts["La-Pinilla"]["url"]= "http://www.lapinilla.es/site/";
  this.resorts["La-Pinilla"]["webcams"] = ["http://www.lapinilla.es/webcam/010109G.jpg",
                                       "http://www.lapinilla.es/webcam/010108G.jpg",
                                       "http://www.lapinilla.es/webcam/010107G.jpg",
                                       "http://www.lapinilla.es/webcam/010106G.jpg",
                                       "http://www.lapinilla.es/webcam/010105G.jpg",
                                       "http://www.lapinilla.es/webcam/010104G.jpg",
                                       "http://www.lapinilla.es/webcam/010103G.jpg",
                                       "http://www.lapinilla.es/webcam/010102G.jpg",
                                       "http://www.lapinilla.es/webcam/010101G.jpg",
                                       "http://www.lapinilla.es/site/foto_dia/foto_dia.jpg"];
  this.resorts["Leitaregos"]={};                                       
  this.resorts["Leitaregos"]["address"]= "Leitariegos, 33800 Cangas del Narcea, Asturias, Principado de Asturias, Spain";
  this.resorts["Leitaregos"]["map"] = "http://www.leitariegos.net/plano/plano.jpg";
  this.resorts["Leitaregos"]["url"]= "http://www.leitariegos.net/";
  this.resorts["Leitaregos"]["webcams"] = ["http://www.leitariegos.net/webcam/cam1.jpg",
                                       "http://www.leitariegos.net/webcam/cam2.jpg",
                                       "http://www.leitariegos.net/webcam/cam3.jpg"];  
                                       
  this.resorts["Manzaneda"]={};                                       
  this.resorts["Manzaneda"]["address"]= "Cabeza de manzaneda, Orense, Galicia, España";
  this.resorts["Manzaneda"]["map"] = "http://www.manzaneda.com/temas/manzaneda/estacion/gfx/plano_pistas.jpg";
  this.resorts["Manzaneda"]["url"]= "http://www.manzaneda.com/";
  this.resorts["Manzaneda"]["webcams"] = ["http://85.91.64.20/crtvg-manzaneda.jpg"];
  
  this.resorts["Panticosa"]={};
  this.resorts["Panticosa"]["address"]= "Estación de Esquí de Panticosa, 22650 Panticosa, Spain‎";
  this.resorts["Panticosa"]["map"] = "http://www.meteored.com/esqui/imagenes/mapas/Panticosa.jpg";
  this.resorts["Panticosa"]["url"]= "http://www.aramonpanticosa.com/";
  this.resorts["Panticosa"]["webcams"] = ["http://imagenes.cerler.com/fotoscamaras/1003021453030101G.jpg",
                                       "http://imagenes.cerler.com/fotoscamaras/1003021453030102G.jpg",
                                       "http://imagenes.cerler.com/fotoscamaras/1003021453030103G.jpg",
                                       "http://imagenes.cerler.com/fotoscamaras/1003021453030104G.jpg",
                                       "http://imagenes.cerler.com/fotoscamaras/1003021453030105G.jpg",
                                       "http://imagenes.cerler.com/fotoscamaras/1003021453030106G.jpg",
                                       "http://imagenes.cerler.com/fotoscamaras/1003021453030108G.jpg",
                                       "http://imagenes.cerler.com/fotoscamaras/1003021453030110G.jpg",
                                       "http://imagenes.cerler.com/fotoscamaras/1003021453030111G.jpg"];
  this.resorts["Port-Aine"]={};
  this.resorts["Port-Aine"]["address"]= "Espot, Lérida, Spain";
  this.resorts["Port-Aine"]["map"] = "http://esquiar.org/wp-content/uploads/2009/10/mapa-port-aine.JPG";
  this.resorts["Port-Aine"]["url"]= "http://www.port-aine.com/";
  this.resorts["Port-Aine"]["webcams"] = ["http://www.granpallars.com/webcams/webcam_portaine.jpg"];
  
  this.resorts["Puerto-de-Navacerrada"]={};
  this.resorts["Puerto-de-Navacerrada"]["address"]= "Estacion De Telesilla, S/N, 28470 Cercedilla‎, Spain";
  this.resorts["Puerto-de-Navacerrada"]["map"] = "http://www.puertonavacerrada.com/Imagenes/Plano_Pistas.jpg";
  this.resorts["Puerto-de-Navacerrada"]["url"]= "http://www.puertonavacerrada.com/";
  this.resorts["Puerto-de-Navacerrada"]["webcams"] = [];

  this.resorts["San-Isidro"]={};
  this.resorts["San-Isidro"]["address"]= "Carretera del Puerto San Isidro, S/N, 24855 Puebla De Lillo";
  this.resorts["San-Isidro"]["map"] = "http://www.san-isidro.net/images/secciones/plano_pistas/plano2010_grande.jpg";
  this.resorts["San-Isidro"]["url"]= "http://www.san-isidro.net/";
  this.resorts["San-Isidro"]["webcams"] = ["http://www.san-isidro.net/modules/Webcam/imagen/webcam.jpg",
                                       "http://www.san-isidro.net/modules/Webcam/imagen/fotodia.jpg",
                                       "http://www.dipuleon.es/img/sanisidro/webcam/CebolledoI.jpg",
                                       "http://www.dipuleon.es/img/sanisidro/webcam/CebolledoII.jpg",
                                       "http://www.dipuleon.es/img/sanisidro/webcam/Requejines.jpg",
                                       "http://www.dipuleon.es/img/sanisidro/webcam/Riopinos.jpg"];
                                       
  this.resorts["Sierra-Nevada"]={};
  this.resorts["Sierra-Nevada"]["address"]= "Plaza de Andalucía, 18196 Sierra Nevada, Monachil, Spain";
  this.resorts["Sierra-Nevada"]["map"] = "http://esquiar.org/wp-includes/images/mapas/mapa-pistas-sierra-nevada.jpg";
  this.resorts["Sierra-Nevada"]["url"]= "http://www.sierranevada.es/";
  this.resorts["Sierra-Nevada"]["webcams"] = ["http://www.sierranevadaski.com/_extras/fotos_camaras/mobotix/current.jpg",
                                       "http://www.sierranevadaski.com/_extras/fotos_camaras/mobotix3/mirloblanco.jpg",
                                       "http://www.sierranevadaski.com/_extras/fotos_camaras/camaramsn/MeliaSyN.jpg",
                                       "http://www.sierranevada.es/_extras/fotos_camaras/monachil/snap.jpg",
                                       "http://www.sierranevadaski.com/_extras/fotos_camaras/stadium/current.jpg"];                                       

  this.resorts["Valdelinares"]={};
  this.resorts["Valdelinares"]["address"]= "Valdelinares, Teruel, Spain";
  this.resorts["Valdelinares"]["map"] = "http://www.valdelinares.com/Docs/Fotos/200911041324471718.jpg";
  this.resorts["Valdelinares"]["url"]= "http://www.valdelinares.com/";
  this.resorts["Valdelinares"]["webcams"] = ["http://valdelinares.nievedeteruel.com/fotoscamaras/1003021525050101G.jpg",
                                       "http://valdelinares.nievedeteruel.com/fotoscamaras/1003021525050102G.jpg",
                                       "http://valdelinares.nievedeteruel.com/fotoscamaras/1003021525050103G.jpg",
                                       "http://valdelinares.nievedeteruel.com/fotoscamaras/1003021525050105G.jpg",
                                       "http://valdelinares.nievedeteruel.com/fotoscamaras/1003021525050107G.jpg",
                                       "http://valdelinares.nievedeteruel.com/fotoscamaras/1003021525050108G.jpg"];                                       

  this.resorts["Valdesqui"]={};
  this.resorts["Valdesqui"]["address"]= "Carretera Cotos-rascafria, KM.2, 28470 Cercedilla, Spain";
  this.resorts["Valdesqui"]["map"] = "http://www.meteored.com/esqui/imagenes/mapas/Valdesqui.jpg";
  this.resorts["Valdesqui"]["url"]= "http://valdesqui.es/";
  this.resorts["Valdesqui"]["webcams"] = ["http://www.valdesqui.es/~cam/cota1800.jpg",
                                       "http://www.valdesqui.es/~cam/bola.jpg",
                                       "http://www.valdesqui.es/~cam/valdemartin.jpg",
                                       "http://www.valdesqui.es/~cam/parking.jpg"]; 
  
  this.resorts["Vall-de-Nuria"]={};
  this.resorts["Vall-de-Nuria"]["address"]= "Valdelinares, Teruel, Spain";
  this.resorts["Vall-de-Nuria"]["map"] = "http://www.nevasport.com/classic/mapas/mapa_25.jpg";
  this.resorts["Vall-de-Nuria"]["url"]= "http://www.valldenuria.com/";
  this.resorts["Vall-de-Nuria"]["webcams"] = ["http://www.valldenuria.cat/meteonuria/webcambarques/nuriapistes.jpg",
                                       "http://www.valldenuria.com/meteonuria/webcambarques/nuriabarques.jpg",
                                       "http://www.valldenuria.com/meteonuria/webcambarques/nurialudic.jpg"];

  this.resorts["Canillo"]={};
  this.resorts["Canillo"]["address"]= "Canillo, Andorra";
  this.resorts["Canillo"]["map"] = "http://www.nevasport.com/classic/mapas/mapa_4601.JPG";
  this.resorts["Canillo"]["url"]= "http://www.grandvalira.com/";
  this.resorts["Canillo"]["webcams"] = ["http://apps.grandvalira.com/webcams/webcamsoldeu.jpg"];
  
  this.resorts["Encamp"]={};  
  this.resorts["Encamp"]["address"]= "Encamp, Andorra";
  this.resorts["Encamp"]["map"] = "http://www.nevasport.com/classic/mapas/mapa_4601.JPG";
  this.resorts["Encamp"]["url"]= "http://www.grandvalira.com/";
  this.resorts["Encamp"]["webcams"] = ["http://apps.grandvalira.com/webcams/solanelles/snap.jpg",
                                       "http://apps.grandvalira.com/webcams/solanelles2/snap.jpg"];                                       

  this.resorts["Pas-de-la-Casa"]={};
  this.resorts["Pas-de-la-Casa"]["address"]= "Pas de la Casa, Canillo, Andorra";
  this.resorts["Pas-de-la-Casa"]["map"] = "http://www.nevasport.com/classic/mapas/mapa_4601.JPG";
  this.resorts["Pas-de-la-Casa"]["url"]= "http://www.grandvalira.com/";
  this.resorts["Pas-de-la-Casa"]["webcams"] = ["http://apps.grandvalira.com/webcams/collblanc/snap.jpg",
                                       "http://apps.grandvalira.com/webcams/pas-casa_hd.jpg",
                                       "http://www.sta.ad/portal/Ski?camera=6",
                                       "http://apps.grandvalira.com/webcams/picblanc/snap.jpg"];

  this.resorts["Grau-Roig"]={};
  this.resorts["Grau-Roig"]["address"]= "Grau Roig, Canillo, Andorra";
  this.resorts["Grau-Roig"]["map"] = "http://www.nevasport.com/classic/mapas/mapa_4601.JPG";
  this.resorts["Grau-Roig"]["url"]= "http://www.grandvalira.com/";
  this.resorts["Grau-Roig"]["webcams"] = ["http://apps.grandvalira.com/webcams/collblanc/snap.jpg",
                                       "http://apps.grandvalira.com/webcams/pic_baix.jpg",
                                       "http://apps.grandvalira.com/webcams/pessons.jpg",
                                       "http://apps.grandvalira.com/webcams/snap.jpg",
                                       "http://apps.grandvalira.com/webcams/picblanc/snap.jpg"];                                                                              
                                       
  this.resorts["Soldeu-El-Tarter"]={};
  this.resorts["Soldeu-El-Tarter"]["address"]= "Soldeu, Canillo, Andorra";
  this.resorts["Soldeu-El-Tarter"]["map"] = "http://www.nevasport.com/classic/mapas/mapa_4601.JPG";
  this.resorts["Soldeu-El-Tarter"]["url"]= "http://www.grandvalira.com/";
  this.resorts["Soldeu-El-Tarter"]["webcams"] = ["http://apps.grandvalira.com/webcams/webcamriba.jpg",
                                       "http://apps.grandvalira.com/webcams/webcamsnow.jpg",
                                       "http://apps.grandvalira.com/webcams/peusoldeu.jpg",
                                       "http://apps.grandvalira.com/webcams/espiolets.jpg"];
                                       
  this.resorts["Pal-Arinsal"]={};
  this.resorts["Pal-Arinsal"]["address"]= "Arinsal, La Massana, Andorra";
  this.resorts["Pal-Arinsal"]["map"] = "http://www.nevasport.com/classic/mapas/mapa_4740.jpg";
  this.resorts["Pal-Arinsal"]["url"]= "http://www.vallnord.com/";
  this.resorts["Pal-Arinsal"]["webcams"] = ["http://www.vallnord.com/webcam/PalCollBotella.jpg",
                                       "http://es.vallnord.com/webcam/WEBCAM_pal.JPG",
                                       "http://es.vallnord.com/webcam/webcam_arinsal.JPG"];  
                                                                                                                     
  this.resorts["Ordino-Arcalis"]={};
  this.resorts["Ordino-Arcalis"]["address"]= "Ordino Arcalís, AD300 Ordino,  Andorra‎";
  this.resorts["Ordino-Arcalis"]["map"] = "http://www.nevasport.com/classic/mapas/mapa_4740.jpg";
  this.resorts["Ordino-Arcalis"]["url"]= "http://www.vallnord.com/";
  this.resorts["Ordino-Arcalis"]["webcams"] = ["http://194.158.91.79:8082/axis-cgi/jpg/image.cgi?resolution=704x576&camera=1",
                                               "http://194.158.91.79:8082/axis-cgi/jpg/image.cgi?resolution=704x576&camera=4",
                                               "http://www.vallnord.com/webcam/WebCam_Arcalis_Planell.jpg"]; 

}

SnowReports.prototype.setHeader = function(){

  var table = document.createElement("table");
  var tbody = document.createElement("tbody");
  table.appendChild(tbody);
  this.header.appendChild(table);
  
  var tr = tbody.insertRow(-1);
  var td = tr.insertCell(-1);
  td.className = "label";
  td.appendChild(document.createTextNode(_("País")));

  td = tr.insertCell(-1);  
  this.select_region = document.createElement("select");
  td.appendChild(this.select_region);

  td = tr.insertCell(-1);
  td.className = "icon";
  var img = document.createElement("img");
  img.src = "images/close_details.png";
  img.setAttribute("title", _("Ocultar"));
  img.onclick = function(){SnowReports.hiddenHeader();SnowReports.savePreferences();}
  td.appendChild(img);

  tr = tbody.insertRow(-1);
  td = tr.insertCell(-1);
  td.className = "label";  
  td.appendChild(document.createTextNode(_("Estación")));

  td = tr.insertCell(-1);  
  td.setAttribute("colspan", 2);
  this.select_resort = document.createElement("select");
  td.appendChild(this.select_resort);
  
  for(var i=0;i< this.regions.length;i++){
    var option = document.createElement("option");
    option.value = this.regions[i];
    option.appendChild(document.createTextNode(this.regions[i]));
    this.select_region.appendChild(option);
  }


  // Events selects
  this.select_region.onchange = function(){SnowReports.setResortSelect();};
  this.select_resort.onchange = function(){SnowReports.getSnowReport();SnowReports.sendEvents();};  
  this.setResortSelect();
}

SnowReports.prototype.setResortSelect = function(){
  this.select_resort.innerHTML = "";
  var value = this.select_region.value;
  for(var i=0;i< this.countries[value].length;i++){
    var option = document.createElement("option");
    option.value = this.countries[value][i].key;
    option.appendChild(document.createTextNode(this.countries[value][i].value));
    this.select_resort.appendChild(option);
  }
}

SnowReports.prototype.update = function(){
  if(this.rss != "")
    SnowReports.sendGet(this.rss, this.parserInfo, this.onError, this.onException);
}
  
SnowReports.prototype.onError = function(response){
  alert("ERROR");
  return;
}
  
SnowReports.prototype.onException = function(response){
  alert("ERROR");
  return;
} 

SnowReports.prototype.setInfo = function(){
  this.content.innerHTML = "";
  var table = document.createElement("table");
  var tbody = document.createElement("tbody");
  table.appendChild(tbody);
  this.content.appendChild(table);
  
  // TITLE
  var tr = tbody.insertRow(-1);  
  var td = tr.insertCell(-1);
  var a = document.createElement("a");
  a.href = this.link;
  a.appendChild(document.createTextNode(this.title));
  a.setAttribute("title", _("Detalles"));
  a.setAttribute("target", "_blank");
  td.appendChild(a);
  
  td = tr.insertCell(-1);
  td.className = "icon";
  var img = document.createElement("img");
  img.src = "images/open_details.png";
  img.setAttribute("title", _("Preferencias"));
  img.onclick = function(){SnowReports.hiddenHeader();}
  td.appendChild(img);
  
  // STATUS
  tr = tbody.insertRow(-1);
  td = tr.insertCell(-1);
  td.className = "remarked";
  td.appendChild(document.createTextNode(_("Estado")));
  td = tr.insertCell(-1);
  td.appendChild(document.createTextNode(this.status));
  
  // REGION
  tr = tbody.insertRow(-1);
  td = tr.insertCell(-1);
  td.className = "remarked";  
  td.appendChild(document.createTextNode(_("Región")));
  td = tr.insertCell(-1);
  td.appendChild(document.createTextNode(this.region));    
  
  // STATUS
  tr = tbody.insertRow(-1);
  td = tr.insertCell(-1);
  td.className = "remarked";  
  td.appendChild(document.createTextNode(_("Nieve")));
  td = tr.insertCell(-1);
  td.appendChild(document.createTextNode(this.surface));  

  // BASE
  tr = tbody.insertRow(-1);
  td = tr.insertCell(-1);
  td.className = "remarked";  
  td.appendChild(document.createTextNode(_("Base")));
  td = tr.insertCell(-1);
  td.appendChild(document.createTextNode(this.base + " " + this.metric));
  
  // SNOWFALL 48/H
  tr = tbody.insertRow(-1);
  td = tr.insertCell(-1);
  td.className = "remarked";  
  td.appendChild(document.createTextNode(_("Nevadas 48h")));
  td = tr.insertCell(-1);
  td.appendChild(document.createTextNode(this.snowfall + " " + this.metric));
  return;
}

/*******************************************************************************
* SEND EVENTS
*******************************************************************************/
SnowReports.prototype.initTimer = function(){

  if (this.timer)
    try{
      clearInterval(this.timer);}
    catch(e){
    }
  if (timer.get() > 0){
    this.iterator = 0;
    this.timer = setInterval("SnowReports.sendWebcams();",timer.get()*1000);
  }
}


/*******************************************************************************
* SEND EVENTS
*******************************************************************************/
SnowReports.prototype.sendEvents = function(){
  var value = this.select_resort.options[this.select_resort.selectedIndex].text;
  var info = this.resorts[value.replace(/ /g, "-")];
  url.set(info["url"]);
  map.set(info["map"]);
  address.set(info["address"]);
  webcams.set(info["webcams"].toJSON());
  this.sendWebcams();
}

/*******************************************************************************
* SEND WEBCAMS
*******************************************************************************/
SnowReports.prototype.sendWebcams = function(){
  var value =this.select_resort.options[this.select_resort.selectedIndex].text;
  var info = this.resorts[value.replace(/ /g, "-")];
  if(info["webcams"].length > 0)
    webcam.set(info["webcams"][(this.iterator++)%info.webcams.length]);
  return;  
}


/*******************************************************************************
* SAVE PREFERENCES
*******************************************************************************/
SnowReports.prototype.savePreferences = function(){
  var info = [this.select_region.value, this.select_resort.value];
  preferences.set(info.toJSON());
  return;
}


/*******************************************************************************
* RESTORE PREFERENCES
*******************************************************************************/
SnowReports.prototype.restorePreferences = function(){
  var elements = preferences.get().evalJSON();
  this.select_region.value = elements[0];
  this.setResortSelect();
  this.select_resort.value = elements[1];
  return;
}

/*******************************************************************************
* SET CLOSE HEADER
*******************************************************************************/
SnowReports.prototype.hiddenHeader = function(){
  this.header.style.display = (this.header.style.display != "none")?"none":"";
}

/*******************************************************************************
* SET COLOR GADGET
*******************************************************************************/
SnowReports.prototype.setTheme = function(){
  var link = document.getElementById("theme");
  link.setAttribute("href", "css/" + theme.get() + ".css");
  return;
}

/*******************************************************************************
* CREATE NEW OBJECT SNOW REPORTS CLASS
*******************************************************************************/
var SnowReports = new SnowReports();
