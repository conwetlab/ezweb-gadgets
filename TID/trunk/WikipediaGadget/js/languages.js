var languages = {
    "en": {
    },
    "es": {
        "Description": "Descripción",
        "Related Links": "Enlaces Relaccionados",
        "No page text matches": "No se han encontrado resultados",
        "Search Results": "Resultados Encontrados",
        "Go": "Ir",
        "Main Page": "Portada",
        "Search": "Buscar"
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
