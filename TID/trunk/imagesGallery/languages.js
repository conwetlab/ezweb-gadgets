var languages = {es:{"next":"Siguiente",
                  "back":"Atrás",
                  "noimages":"No hay imágenes para mostrar"
              },
              en:{"next":"Next",
                  "back":"Back",
                  "noimages":"There aren't images in the gallery",
              },
              en:{"next":"Next",
                  "back":"Back",
                  "noimages":"There aren't images in the gallery",
              }};

              
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
