
var languages = {es:{},
                 en: {"Estación": "Resort",
                      "País":"Country",
                      "Nieve":"Conditions",
                      "Base":"Base",
                      "Estado":"Status",
                      "Nevadas 48h":"Snowfall 48h",                      
                      "Región":"Region",
                      "Detalles":"Details",
                      "Ocultar":"Hidden",
                      "Preferencias":"Preferences"
                 },            
                 pt: {"Estación": "Resort",
                      "País":"Country",
                      "Nieve":"Conditions",
                      "Base":"Base",
                      "Estado":"Status",
                      "Nevadas 48h":"Snowfall 48h",                      
                      "Región":"Region",
                      "Detalles":"Details",
                      "Ocultar":"Hidden",
                      "Preferencias":"Preferences"
                 }
               };

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
