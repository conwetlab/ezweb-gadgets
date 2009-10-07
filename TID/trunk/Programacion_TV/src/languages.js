var languages = {
    en: {
    },
    es: {
        "Channels": "Cadenas",
        "What's on TV now?": "¿Qué hay ahora?"
    }
};

var _ = function(key) {
    var language = ProgramacionTV.language;
    if (languages[language] && languages[language][key]) {
        return languages[language][key];
    }
    else {
        return key;
    }
};