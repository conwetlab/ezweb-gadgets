// s = Simbolo - Symbol
// n = Nombre - Name
// l1	=  Ultima Transacción - Last Trade (Price Only)
// d1	= Fecha Última Transacción - Last Trade Date
// t1 = Hora Última Cotización - Last Trade Time
// c1 = Cambio - Change
// o = Apertura
// h = Trasacción Más Alta del Día - Day’s High
// g = Trasacción Más Baja del Día - Day’s Low
// v = Volumén - Volume
var languages = {es:{"s" : "Símbolo:",
                     "n" : "Nombre",
                     "l1": "Última Transacción",
                     "d1": "Fecha Última Transacción",
                     "t1": "Hora Última Cotización",
                     "c1": "Cambio",
                     "c" : "Cambio y Porcentaje de Cambio",
                     "o" : "Apertura",
                     "h" : "Transacción Más Alta del Día",
                     "g" : "Transacción Más Baja del Día",
                     "v" : "Volumén",
                     "help": "Ayuda",
                     "hidden": "Ocultar",
                     "preferences":"Preferencias",
                     "errorQuery": "Error al recuperar la información de la empresa. El símbolo de la empresa es incorrecto.",
                     "errorHelp": "Error al recuperar los símbolos de cada empresa.",                                          
                     "save":"Guardar",
                     "symbols": "Símbolos"},
                en: {"s" : "Symbol:",
                     "n" : "Name",
                     "l1": "Last Trade",
                     "d1": "Last Trade Date",
                     "t1": "Last Trade Time",
                     "c1": "Change",
                     "c" : "Change & Percent Change",                     
                     "o" : "Open",
                     "h" : "Day's High",
                     "g" : "Day's Low",
                     "v" : "Volume",
                     "help": "Help",
                     "hidden": "Hidden",
                     "preferences":"Preferences",
                     "errorQuery": "Error when it was requesting company information. Company symbol could be incorrect.",
                     "errorHelp": "Error when it was requesting company symbols.",                                          
                     "save":"Save",
                     "symbols": "Symbols"},            
                pt: {"s" : "Symbol:",
                     "n" : "Name",
                     "l1": "Last Trade",
                     "d1": "Last Trade Date",
                     "t1": "Last Trade Time",
                     "c1": "Change",
                     "c" : "Change & Percent Change",                     
                     "o" : "Open",
                     "h" : "Day's High",
                     "g" : "Day's Low",
                     "v" : "Volume",
                     "help": "Help",
                     "hidden": "Hidden",
                     "preferences":"Preferences",
                     "errorQuery": "Error when it was requesting company information. Company symbol could be incorrect.",                     
                     "errorHelp": "Error when it was requesting company symbols.",                                          
                     "save":"Save",
                     "symbols": "Symbols"}            
               }

var language = EzWebAPI.createRGadgetVariable('language', EzWebExt.bind(function(){}, this));

var _ = function(key) {
    var lang = language.get();
    if (languages[lang] && languages[lang][key]) {
        return languages[lang][key];
    }
    else {
        return key;
    }
};               
