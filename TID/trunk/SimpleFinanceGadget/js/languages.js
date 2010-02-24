// a2	 Volumen Medio Diario - Average Daily Volume	 
// b	 Demanda - Bid	 
// c1 = Cambio - Change	 
// d	 DPS - Dividend/Share	 
// e	 EPS - Earnings/Share	 
// g = Transacción Más Baja del Día - Day’s Low
// h = Transacción Más Alta del Día - Day’s High
// j = Transacción Más Baja en 52 Semanas - 52-week Low	 
// k = Transacción Más Alta en 52 Semanas - 52-week High	 
// l1	= Ultima Transacción - Last Trade (Price Only)
// m3	=  Variación de las cotizaciones en 50 días	 
// m4	 Variación de las cotizaciones en 200 días
// n = Nombre - Name
// o = Apertura - Open
// p2	= Cambio en porcentaje - Change in Percent
// r = P/E Ratio - P/E Ratio
// s = Simbolo - Symbol
// s1 = Shares Owned - Acciones en Posesión
// t1 = Hora Última Cotización - Last Trade Time
// v = Volumén - Volume
// y	 Div/Dividend Yield

var languages = {es:{"a2": "Volumén Medio Diario",
                     "b" : "Demanda",
                     "c1": "Cambio",
                     "d" : "DPS",
                     "e" : "EPS",
                     "g" : "Transacción Más Baja del Día",
                     "h" : "Transacción Más Alta del Día",
                     "j" : "Transacción Más Baja en 52 Semanas",
                     "k" : "Transacción Más Alta en 52 Semanas",                     
                     "l1": "Última Transacción",                                          
                     "m3": "Variación de las Cotizaciones en 50 Días",                                                               
                     "m4": "Variación de las Cotizaciones en 200 Días",                                                                                    
                     "n" : "Nombre",
                     "o" : "Apertura",
                     "p2": "Cambio en Porcentaje",
                     "r" : "P/E Ratio",
                     "s" : "Símbolo",
                     "s1": "Acciones en Posesión",
                     "t1": "Hora Última Cotización",
                     "v" : "Volumén",
                     "y" : "Div",
                     "help": "Ayuda",
                     "hidden": "Ocultar",
                     "preferences":"Preferencias",
                     "errorQuery": "Error al recuperar la información de la empresa. El símbolo de la empresa es incorrecto.",
                     "errorHelp": "Error al recuperar los símbolos de cada empresa.",                                          
                     "save":"Guardar",
                     "symbols": "Símbolos"},
                en: {"a2": "Average Daily Volume",
                     "b" : "Bid",
                     "d" : "Dividend/Share",
                     "c1": "Change",
                     "e" : "Earnings/Share",
                     "g" : "Day’s Low",
                     "h" : "Day’s High",
                     "j" : "52-week Low",
                     "k" : "52-week High",                     
                     "l1": "Last Trade",                                          
                     "m3": "50-Day Moving Average",                                                               
                     "m4": "200-Day Moving Average",                                                                                    
                     "n" : "Name",
                     "o" : "Open",
                     "p2": "Change in Percent",
                     "r" : "P/E Ratio",
                     "s" : "Symbol",
                     "s1": "Shares Owned",
                     "t1": "Last Trade Time",
                     "v" : "Volume",
                     "y" : "Dividen Yield",
                     "help": "Help",
                     "hidden": "Hidden",
                     "preferences":"Preferences",
                     "errorQuery": "Error when it was requesting company information. Company symbol could be incorrect.",
                     "errorHelp": "Error when it was requesting company symbols.",                                          
                     "save":"Save",
                     "symbols": "Symbols"},            
                pt: {"a2": "Average Daily Volume",
                     "b" : "Bid",
                     "c1": "Change",
                     "d" : "Dividend/Share",
                     "e" : "Earnings/Share",
                     "g" : "Day’s Low",
                     "h" : "Day’s High",
                     "j" : "52-week Low",
                     "k" : "52-week High",                     
                     "l1": "Last Trade",                                          
                     "m3": "50-Day Moving Average",                                                               
                     "m4": "200-Day Moving Average",                                                                                    
                     "n" : "Name",
                     "o" : "Open",
                     "p2": "Change in Percent",
                     "r" : "P/E Ratio",
                     "s" : "Symbol",
                     "s1": "Shares Owned",
                     "t1": "Last Trade Time",
                     "v" : "Volume",
                     "y" : "Dividen Yield",
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
