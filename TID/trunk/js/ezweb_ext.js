/**
 * @class Esta clase proporciona algunos m&eacute;todos &uacute;tiles para el desarrollador de 
 * gadgets de EzWeb.<br/><br/>
 */
var EzWebExt = new function(){
}

/**
 * Guarda la URL donde se encuentra alojada la librer&iacute;a Javascript.
 * @type String
 */
EzWebExt.URL = "http://europa.ls.fi.upm.es/svn/ezweb/releases/lib/js/ezwebext/v1.1b";

/** 
 * Realiza una petici&oacute;n GET a la URL indicada.
 *
 * @param {String} url	URL del servidor al que se desea realizar la
 * petici&oacute;n GET.<br/><br/>
 *
 * @param {Function} onSuccess Funci&oacute;n que ser&aacute; llamada cuando
 * se reciba la respuesta del servidor, siempre que no se produzca
 * ning&uacute;n error.<br/><br/>
 *
 * @param {Object} onError Este par&aacute;metro es opcional, si se
 * a&ntilde;ade, su valor podr&aacute; ser de tipo <code>String</code>, que
 * ser&aacute; el mensaje de error que se mostrar&aacute; si se produce
 * alg&uacute;n error durante la petici&oacute;n al servidor. En lugar del
 * mensaje de error, este par&aacute;metro podr&aacute; apuntar a una
 * funci&oacute;n que ser&aacute; llamada cuando se produzca alg&uacute;n
 * error durante la petici&oacute;n al servidor.
 */
EzWebExt.sendGet = function(url, onSuccess, onError){

    (new (function(url, onSuccess, onError){
    
        var _onSuccess = onSuccess;
        var _onError = function(){
            EzWebExt.alert((onError) ? onError : "Error", "Error", EzWebExt.ALERT_ERROR);
        }
        
        if ((onError != null) && (typeof onError != "string")) {
            _onError = onError;
        }
        
        this.send = function(){
            EzWebAPI.send_get(url, this, _onSuccess, _onError);
        }
        
    })(url, onSuccess, onError)).send();
}

/** 
 * Realiza una petici&oacute;n POST a la URL indicada.
 *
 * @param {String} url URL del servidor al que se desea realizar la
 * petici&oacute;n POST.<br/><br/>
 *
 * @param {String} params Par&aacute;metros de la petici&oacute;n.<br/><br/>
 *
 * @param {Function} onSuccess Funci&oacute;n que ser&aacute; llamada cuando
 * se reciba la respuesta del servidor, siempre que no se produzca
 * ning&uacute;n error.<br/><br/>
 *
 * @param {Object} onError Este par&aacute;metro es opcional, si se
 * a&ntilde;ade, su valor podr&aacute; ser de tipo <code>String</code>, que
 * ser&aacute; el mensaje de error que se mostrar&aacute; si se produce
 * alg&uacute;n error durante la petici&oacute;n al servidor. En lugar del
 * mensaje de error, este par&aacute;metro podr&aacute; apuntar a una
 * funci&oacute;n que ser&aacute; llamada cuando se produzca alg&uacute;n
 * error durante la petici&oacute;n al servidor.
 *
 */
EzWebExt.sendPost = function(url, params, onSuccess, onError){

    (new (function(url, params, onSuccess, onError){
    
        var _onSuccess = onSuccess;
        var _onError = function(){
            EzWebExt.alert((onError) ? onError : "Error", "Error", EzWebExt.ALERT_ERROR);
        }
        
        if ((onError != null) && (typeof onError != "string")) {
            _onError = onError;
        }
        
        this.send = function(){
            EzWebAPI.send_post(url, params, this, _onSuccess, _onError);
        }
        
    })(url, params, onSuccess, onError)).send();
}

/** 
 * Realiza una petici&oacute;n PUT a la URL indicada.
 *
 * @param {String} url URL del servidor al que se desea realizar la
 * petici&oacute;n PUT.<br/><br/>
 *
 * @param {String} params Par&aacute;metros de la petici&oacute;n.<br/><br/>
 *
 * @param {Function} onSuccess Funci&oacute;n que ser&aacute; llamada cuando
 * se reciba la respuesta del servidor, siempre que no se produzca
 * ning&uacute;n error.<br/><br/>
 *
 * @param {Object} onError Este par&aacute;metro es opcional, si se
 * a&ntilde;ade, su valor podr&aacute; ser de tipo <code>String</code>, que
 * ser&aacute; el mensaje de error que se mostrar&aacute; si se produce
 * alg&uacute;n error durante la petici&oacute;n al servidor. En lugar del
 * mensaje de error, este par&aacute;metro podr&aacute; apuntar a una
 * funci&oacute;n que ser&aacute; llamada cuando se produzca alg&uacute;n
 * error durante la petici&oacute;n al servidor.
 *
 */
EzWebExt.sendPut = function(url, params, onSuccess, onError){

    (new (function(url, params, onSuccess, onError){
    
        var _onSuccess = onSuccess;
        var _onError = function(){
            EzWebExt.alert((onError) ? onError : "Error", "Error", EzWebExt.ALERT_ERROR);
        }
        
        if ((onError != null) && (typeof onError != "string")) {
            _onError = onError;
        }
        
        this.send = function(){
            EzWebAPI.send_put(url, params, this, _onSuccess, _onError);
        }
        
    })(url, params, onSuccess, onError)).send();
}

/** 
 * Realiza una petici&oacute;n DELETE a la URL indicada.
 *
 * @param {String} url	URL del servidor al que se desea realizar la
 * petici&oacute;n DELETE.<br/><br/>
 *
 * @param {Function} onSuccess Funci&oacute;n que ser&aacute; llamada cuando
 * se reciba la respuesta del servidor, siempre que no se produzca
 * ning&uacute;n error.<br/><br/>
 *
 * @param {Object} onError Este par&aacute;metro es opcional, si se
 * a&ntilde;ade, su valor podr&aacute; ser de tipo <code>String</code>, que
 * ser&aacute; el mensaje de error que se mostrar&aacute; si se produce
 * alg&uacute;n error durante la petici&oacute;n al servidor. En lugar del
 * mensaje de error, este par&aacute;metro podr&aacute; apuntar a una
 * funci&oacute;n que ser&aacute; llamada cuando se produzca alg&uacute;n
 * error durante la petici&oacute;n al servidor.
 */
EzWebExt.sendDelete = function(url, onSuccess, onError){

    (new (function(url, onSuccess, onError){
    
        var _onSuccess = onSuccess;
        var _onError = function(){
            EzWebExt.alert((onError) ? onError : "Error", "Error", EzWebExt.ALERT_ERROR);
        }
        
        if ((onError != null) && (typeof onError != "string")) {
            _onError = onError;
        }
        
        this.send = function(){
            EzWebAPI.send_delete(url, this, _onSuccess, _onError);
        }
        
    })(url, onSuccess, onError)).send();
}

/** 
 * Permite obtener la anchura en pixels del gadget.
 * @return {Number} Anchura del gadget
 */
EzWebExt.getWidth = function(){
    return document.defaultView.innerWidth;
}

/** 
 * Permite obtener la altura en pixels del gadget.
 * @return {Number} Altura del gadget
 */
EzWebExt.getHeight = function(){
    return document.defaultView.innerHeight;
}

/** 
 * Permite obtener el usuario de la plataforma, proporcionando de forma
 * transparente al desarrollador de gadgets la declaraci&oacute;n de la
 * variable de lectura y su manejador.
 *
 * @param {String} context_label Debe pasarse como par&aacute;metro el valor
 * del atributo <code>name</code> de la variable de contexto de nombre de
 * usuario que se ha declarado en el template del
 * gadget.<br/><br/>Ejemplo:<br/><code>&lt;Context name="<span
 * style="color:red;">user_name</span>" type="text" concept="user_name"
 * /&gt;</code><br/><br/>Este par&aacute;metro es opcional, si no se recibe
 * ning&uacute;n valor tomar&aacute; como valor por defecto
 * <code>user_name</code>.
 *
 * @return {String} Usuario de la plataforma
 */
EzWebExt.getUser = function(context_label){
    return (new (function(context_label){
        var _user = EzWebAPI.createRGadgetVariable(context_label, function(value){
        });
        
        this.getName = function(){
            return _user.get();
        }
    })((context_label) ? context_label : "user_name")).getName();
}

EzWebExt.addClassName = function(element, className){  
	EzWebExt.removeClassName(element, className);
	element.className += (" " + className);
}

EzWebExt.removeClassName = function(element, className){
	element.className = element.className.replace(RegExp("(^\\s*|\\s+)" + className + "(\\s+|\\s*$)", "g"), " ").replace(RegExp("^\\s+|\\s+$", "g"), "");
}

EzWebExt.createLockVariable = function(lockVariable) {
	EzWebAPI.createRGadgetVariable((lockVariable)?lockVariable:"lockStatus", 
	                       function(newLockStatus) {
								if (newLockStatus == true) {
									EzWebExt.addClassName(document.body, "locked");
								} else {
									EzWebExt.removeClassName(document.body, "locked");
								}
							});
}


/**
 * Sustituye los caracteres XML reservados, por las entidades predefinidas
 * que los representan.
 *
 * @param {String} string Texto del que se desean sustituir los caracteres
 * reservados.
 *
 * @return {String} Texto sin caracteres reservados.
 */
EzWebExt.escapeXML = function(string) {
    return string.replace(RegExp("&", "g"), "&amp;").replace(RegExp("<", "g"), "&lt;").replace(RegExp(">", "g"), "&gt;").replace(RegExp("'", "g"), "&apos;").replace(RegExp('"', "g"), "&quot;");
}

/**
 * Esta funci&oacute;n codifica un string a otro cuyos caracteres son 
 * v&aacute;lidos para una URL. 
 * 
 * @param {String} string String que se desea codificar.
 * 
 * @return {String} Devuelve un string con caracteres v&aacute;lidos para 
 * una URL.
 */
EzWebExt.encodeURL = function(string) {
	// private method for UTF-8 encoding
	var _utf8_encode = function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}

		return utftext;
	}
	
	return escape(_utf8_encode(string));
}

/**
 * Deshace la codificaci&oacute;n realizada por el m&eacute;todo <code>encodeURL</code>.
 * 
 * @param {String} string String que se desea decodificar.
 * 
 * @return {String} Devuelve un string decodificado.
 */
EzWebExt.decodeURL = function(string) {
	// private method for UTF-8 decoding
	var _utf8_decode = function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;

		while ( i < utftext.length ) {

			c = utftext.charCodeAt(i);

			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}

		return string;
	}
	
	return _utf8_decode(unescape(string));
}

/** 
 * Muestra un di&aacute;logo de alerta con un mensaje para el usuario del
 * gadget.
 *
 * @param {String} message Mensaje que se mostrar&aacute; al
 * usuario.<br/><br/>
 *
 * @param {String} title T&iacute;tulo que se mostrar&aacute; en el
 * di&aacute;logo.<br/><br/>
 *
 * @param {Number} type Tipo de ventana de di&aacute;logo que se
 * mostrar&aacute;. Su valor se indicar&aacute; a mediante tres constantes
 * definidas en esta misma clase:<br/><br/>
 * <code>ALERT_ERROR&nbsp;&nbsp;</code> - Mostrar&aacute; un dialogo de
 * error.<br/> <code>ALERT_INFO&nbsp;&nbsp;&nbsp;</code> - Mostrar&aacute; un
 * dialogo informativo.<br/> <code>ALERT_WARNING</code> - Mostrar&aacute; un
 * dialogo de advertencia.<br/><br/> Ejemplo de uso:<br/><br/>
 * <code>EzWebExt.alert("Contenido del mensaje","T&iacute;tulo del
 * mensaje",EzWebExt.ALERT_ERROR);</code><br/><br/> Este c&oacute;digo
 * mostrar&aacute; dentro del gadget el siguiente di&aacute;logo:<br/><br/>
 * <center><img src="images/alert.png"/></center>
 */
EzWebExt.alert = function(message, title, type){

    var MAX_WIDTH = 400;
    var MIN_WIDTH = 200;
    var MAX_HEIGHT = 200;
    var MIN_HEIGHT = 100;
    
    var width = (EzWebExt.getWidth() * 80 / 100);
    var height = (EzWebExt.getHeight() * 80 / 100);
    
    width = (width > MAX_WIDTH) ? MAX_WIDTH : ((width < MIN_WIDTH) ? MIN_WIDTH : width);
    height = (height > MAX_HEIGHT) ? MAX_HEIGHT : ((height < MIN_HEIGHT) ? MIN_HEIGHT : height);
    
    var div = document.createElement("div");
    div.style.cssText = "position:absolute;" +
    "top:0px;" +
    "left:0px;" +
    "z-index:3000;" +
    "background-color:#ffffff;" +
    "filter:alpha(opacity=60);" +
    "-moz-opacity:.60;" +
    "opacity:.60;" +
    "width: 100%;" +
    "height: 100%;";
    
    var divMessage = document.createElement("div");
    divMessage.innerHTML = '<div style="diplay:block;width:100%;height:7px;">' +
    '<div style="diplay:block;float:left;width:7px;height:7px;background:url(\'' + EzWebExt.URL + '/images/corner-top-left.png\') no-repeat top left;"></div>' +
    '<div style="diplay:block;float:left;width:' +
    (width - 15) +
    'px;height:7px;background:url(\'' + EzWebExt.URL + '/images/fill-top.png\') repeat-x top left;"></div>' +
    '<div style="diplay:block;float:left;width:8px;height:7px;background:url(\'' + EzWebExt.URL + '/images/corner-top-right.png\') no-repeat top left;"></div>' +
    '</div>' +
    '<div style="diplay:block;width:100%;height:' +
    (height - 15) +
    'px;">' +
    '<div style="diplay:block;float:left;width:7px;height:100%;background:url(\'' + EzWebExt.URL + '/images/fill-left.png\') repeat-y top left;"></div>' +
    '<div style="diplay:block;float:left;width:' +
    (width - 15) +
    'px;height:100%;background-color:#e6f3ff;">' +
    '<div style="display:block;width:' +
    (width - 85) +
    'px;height:25px;margin-left:40px;overflow:hidden;color:' +
    ((type == EzWebExt.ALERT_WARNING) ? "#ef8d00" : ((type == EzWebExt.ALERT_ERROR) ? "red" : "#3d58ff")) +
    ';font-weight:bold;font-style:italic;font-family:Arial,Verdana;font-size:20px;text-align:left;">' +
    ((title) ? EzWebExt.escapeXML(title) : '&nbsp;') +
    '</div>' +
    '<div style="display:block;height:' +
    (height - 50) +
    'px;width:' +
    (width - 63) +
    'px;margin-left:42px;margin-top:5px;overflow:auto;font-size:13px;text-align:left;border-top:solid 1px ' +
    ((type == EzWebExt.ALERT_WARNING) ? "#ef8d00" : ((type == EzWebExt.ALERT_ERROR) ? "red" : "#3d58ff")) +
    ';border-left:solid 1px ' +
    ((type == EzWebExt.ALERT_WARNING) ? "#ef8d00" : ((type == EzWebExt.ALERT_ERROR) ? "red" : "#3d58ff")) +
    ';">' +
    '<table style="width:100%;height:100%;border:none;padding:5px;"><tr><td valign="middle">' +
    ((message) ? EzWebExt.escapeXML(message) : "&nbsp;") +
    '</td></tr></table>' +
    '</div>' +
    '</div>' +
    '<div style="diplay:block;float:left;width:8px;height:100%;background:url(\'' + EzWebExt.URL + '/images/fill-right.png\') repeat-y top left;"></div>' +
    '</div>' +
    '<div style="diplay:block;width:100%;height:8px;">' +
    '<div style="diplay:block;float:left;width:7px;height:8px;background:url(\'' + EzWebExt.URL + '/images/corner-bottom-left.png\') no-repeat top left;"></div>' +
    '<div style="diplay:block;float:left;width:' +
    (width - 15) +
    'px;height:8px;background:url(\'' + EzWebExt.URL + '/images/fill-bottom.png\') repeat-x top left;"></div>' +
    '<div style="diplay:block;float:left;width:8px;height:8px;background:url(\'' + EzWebExt.URL + '/images/corner-bottom-right.png\') no-repeat top left;"></div>' +
    '</div>';
    
    var left = (EzWebExt.getWidth() - width) / 2;
    var top = (EzWebExt.getHeight() - height) / 2;
    
    top = (top < 0) ? 0 : top;
    left = (left < 0) ? 0 : left;
    
    divMessage.style.cssText = "width:" + width + "px;" +
    "height:" +
    height +
    "px;" +
    "top:" +
    top +
    "px;" +
    "left:" +
    left +
    "px;" +
    "z-index:3001;" +
    "text-align:center;" +
    "color:#000000;" +
    "font-style:italic;" +
    "display:block;" +
    "position:fixed;";
    
    var button = document.createElement("img");
    button.src = EzWebExt.URL + "/images/dialog-cancel-disable.png";
    
    button.style.cssText = "cursor:pointer;" +
    "position:relative;" +
    "top:" +
    ((-1) * ((height) + 4)) +
    "px;" +
    "right:" +
    ((-1) * ((width / 2) - 37)) +
    "px;" +
    "z-index:3002;";
    
    button.onclick = function(){
        document.body.removeChild(div);
        document.body.removeChild(divMessage);
    };
    
    button.onmouseover = function(){
        button.src = EzWebExt.URL + "/images/dialog-cancel.png";
    };
    
    button.onmouseout = function(){
        button.src = EzWebExt.URL + "/images/dialog-cancel-disable.png";
    };
    
    var icon = document.createElement("img");
    icon.src = EzWebExt.URL + "/images/dialog-" + ((type == EzWebExt.ALERT_WARNING) ? 'warning' : ((type == EzWebExt.ALERT_ERROR) ? 'error' : 'information')) + ".png";
    
    icon.style.cssText = "position:relative;" +
    "top:" +
    ((-1) * ((height / 2) + 2)) +
    "px;" +
    "left:" +
    ((-1) * ((width / 2) - 36)) +
    "px;" +
    "z-index:3003;";
    divMessage.appendChild(icon);
    divMessage.appendChild(button);
    document.body.appendChild(divMessage);
    document.body.appendChild(div);
    return {background: div, popup: divMessage};
}

/**
 * Constante para que el di&aacute;logo que muestre el m&eacute;todo <code>alert</code> 
 * sea una alerta informativa.
 * @type Number
 */
EzWebExt.ALERT_INFO = 0;

/**
 * Constante para que el di&aacute;logo que muestre el m&eacute;todo <code>alert</code> 
 * sea una  alerta de advertencia.
 * @type Number
 */
EzWebExt.ALERT_WARNING = 1;

/**
 * Constante para que el di&aacute;logo que muestre el m&eacute;todo <code>alert</code> 
 * sea una  alerta de error.
 * @type Number
 */
EzWebExt.ALERT_ERROR = 2;

/** 
 * @param {Object} languages Puede recibir dos tipos de datos distintos 
 * seg&uacute;n las preferencias del desarrollador de
 * gadgets:<br/><br/><ul><li><b>URL: </b>Podr&aacute; pasarse como
 * par&aacute;metro la URL de un fichero XML que proporciona las traducciones
 * de todas las etiquetas a los diferentes idiomas soportados.<br/><br/>Este
 * fichero XML debe estar validado mediante la DTD, <a
 * href="http://antares.ls.fi.upm.es/ezwebext/v1.0/languages.dtd">languages.dtd</a>:<br/><br/><code>&lt;?xml
 * version="1.0" encoding="utf-8"?&gt;<br/>&lt;!ELEMENT languages
 * (language+)&gt;<br/>&lt;!ELEMENT language (label*)&gt;<br/>&lt;!ATTLIST
 * language<br/>&nbsp;&nbsp;&nbsp;&nbsp;name CDATA
 * #REQUIRED<br/>&gt;<br/>&lt;!ELEMENT label (#PCDATA)&gt;<br/>&lt;!ATTLIST
 * label<br/>&nbsp;&nbsp;&nbsp;&nbsp;id CDATA
 * #REQUIRED<br/>&gt;</code><br/><br/>Ejemplo de fichero XML
 * v&aacute;lido:<br/><br/><code>&lt;?xml version="1.0"
 * encoding="utf-8"?&gt;<br/>&lt;!DOCTYPE languages SYSTEM "languages.dtd"&gt;<br/>&lt;languages&gt;<br/>&nbsp;&nbsp;&nbsp;&nbsp;&lt;language
 * name="en"&gt;</br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;label
 * id="label1"&gt;Label test
 * 1&lt;/label&gt;<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;label
 * id="label2"&gt;Label test
 * 2&lt;/label&gt;<br/>&nbsp;&nbsp;&nbsp;&nbsp;&lt;/language&gt;</br>&nbsp;&nbsp;&nbsp;&nbsp;&lt;language
 * name="es"&gt;</br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;label
 * id="label1"&gt;Etiqueta de prueba
 * 1&lt;/label&gt;<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;label
 * id="label2"&gt;Etiqueta de prueba
 * 2&lt;/label&gt;<br/>&nbsp;&nbsp;&nbsp;&nbsp;&lt;/language&gt;</br>&lt;/languages&gt;</code><br/><br/>El
 * primer idioma definido en el fichero, ser&aacute; el que el gadget tome por
 * defecto si no soporta el idioma seleccionado en la
 * plataforma.<br/><br/>Ejemplo de uso:<br/><br/><code>translator =
 * new EzWebExt.Translator("&lt;ruta_completa&gt;/languages.xml","language","languagePref",init);</code><br/><br/><span
 * style="color:red;">Importante: </span>Se debe tener en cuenta que el
 * constructor realiza una llama as&iacute;ncrona para traerse el fichero de
 * idiomas.</li><br/><li><b>Array de Idiomas: </b>El constructor
 * tambi&eacute;n puede recibir en este par&aacute;metro un array con los
 * identificadores de los idiomas que soportar&aacute; el gadget. El primer
 * idioma del array (el que ocupa la posici&oacute;n 0 del mismo), ser&aacute;
 * el que el gadget tome por defecto si no est&aacute; soportado el idioma
 * seleccionado en la plataforma.<br/><br/>Ejemplo de
 * uso:<br/><br/><code>translator =
 * new EzWebExt.Translator(["en","es"],"language","languagePref");<br/>translator.addLabel("label1",["Label
 * test 1","Etiqueta de prueba 1"]);<br/>translator.addLabel("label2",["Label
 * test 2","Etiqueta de prueba 2"]);<br/>translator.translate();</code></li></ul><br/>
 *
 * @param {String} labelContext Debe pasarse como par&aacute;metro el valor
 * del atributo <code>name</code> de la variable de contexto de idiomas que se
 * ha declarado en el template del
 * gadget.<br/><br/>Ejemplo:<br/><br/><code>&lt;Context name="<span
 * style="color:red;">language</span>" type="text" concept="language"
 * /&gt;</code><br/><br/>
 *
 * @param {String} labelPref Este par&aacute;metro es opcional, se
 * utilizar&aacute; en el caso de que el propio gadget cuente con una
 * preferencia de usuario para cambiar el idioma. Si se utiliza, debe pasarse
 * como par&aacute;metro el valor del atributo <code>name</code> de la
 * preferencia de usuario que se ha declarado en el template del
 * gadget.<br/><br/>Ejemplo:<br/><br/><code>&lt;Preference name="<span
 * style="color:red;">languagePref</span>" type="list" label="Language"
 * description="Idioma del gadget"
 * default="default"&gt;<br/>&nbsp;&nbsp;&nbsp;&nbsp;&lt;Option
 * value="default" name="Default"/&gt;<br/>&nbsp;&nbsp;&nbsp;&nbsp;&lt;Option
 * value="en" name="English"/&gt;<br/>&nbsp;&nbsp;&nbsp;&nbsp;&lt;Option
 * value="es"
 * name="Espa&ntilde;ol"/&gt;<br/>&lt;/Preference&gt;</code><br/><br/>
 *
 * @param {Function} onLoad Este par&aacute;metro es opcional. Se recomienda su
 * uso en el caso de que el par&aacute;metro <code>languages</code> reciba la URL de
 * un fichero XML externo, ya que esta operaci&oacute;n realiza internamente una llamada as&iacute;ncrona. <br/><br/>
 * Ejemplo de uso: <br/><br/><code>translator = EzWebExt.Translator
 * ("&lt;ruta_completa&gt;/languages.xml","language","languagePref",init,null);</code>
 * <br/><br/>En este caso recomendamos que la llamada al constructor <code>Translator</code> 
 * se realice en el manejador onload del body del gadget y en el onload del traductor 
 * se llame al m&eacute;todo <code>init</code> del gadget.<br/><br/>
 * 
 * @param {Function} onTranslate Este par&aacute;metro es opcional. Permite definir
 * un manejador adicional para complementar la traducci&oacute;n realizada por el 
 * traductor (Translator). El manejador ser&aacute; llamado cada vez que se llama al m&eacute;todo 
 * translate del traductor.
 * 
 * @class Esta clase facilita al desarrollador de gadgets la tarea
 * de dar soporte multilenguaje a sus aplicaciones.<br/><br/>
 * 
 * @constructor
 */
EzWebExt.Translator = function(languages, labelContext, labelPref, onLoad, onTranslate){

    // PRIVATE AREA
    var _langPref = (labelPref) ? EzWebAPI.createRGadgetVariable(labelPref, _langPrefHandler) : null;
    var _langContext = (labelContext) ? EzWebAPI.createRGadgetVariable(labelContext, _langContextHandler) : null;
    var _babel = [];
    var _languages = [];
    var _keyList = []
    var PLATFORM_LANGUAGE = "default";
    var _defaultLanguage = null;
    var _actualLanguage = null;
    
    var _normalInit = function(){
        _languages = languages;
        _defaultLanguage = (_languages[0]) ? _languages[0] : null;
        _actualLanguage = _defaultLanguage;
        
        for (var i = 0; i < _languages.length; i++) {
            _babel[_languages[i]] = [];
        }
        
		if(_langPref)
                        _langPrefHandler(_langPref.get());
                else
                        _langPrefHandler(PLATFORM_LANGUAGE);
		if (onLoad) onLoad();
		_translate();
    }
    
    var _xmlInit = function(transport){
        var response = transport.responseXML;
        
        var xmlLanguages = response.getElementsByTagName("language");
        
        for (var i = 0; i < xmlLanguages.length; i++) {
            _languages[i] = xmlLanguages[i].attributes.name.value;
        }
        
        _defaultLanguage = (_languages[0]) ? _languages[0] : null;
        _actualLanguage = _defaultLanguage;
        
        for (var i = 0; i < _languages.length; i++) {
            _babel[_languages[i]] = [];
        }
        
        var xmlLabels = null;
        
        for (var i = 0; i < xmlLanguages.length; i++) {
            xmlLabels = xmlLanguages[i].getElementsByTagName("label");
            for (var j = 0; j < xmlLabels.length; j++) {
                _addKey(xmlLabels[j].attributes.id.value);
                _babel[_languages[i]][xmlLabels[j].attributes.id.value] = xmlLabels[j].firstChild.nodeValue;
            }
        }        
		if(_langPref) 
			_langPrefHandler(_langPref.get());
		else
			_langPrefHandler(PLATFORM_LANGUAGE);
		if (onLoad) onLoad();
		_translate();
    }
    
    var _translateLabel = function(key){
        if (document.getElementById(key)) {
            document.getElementById(key).innerHTML = (_babel[_actualLanguage][key]) ? _babel[_actualLanguage][key] : "";
        }
    }
    
    var _addKey = function(key){
        var repeated = false;
        for (var i = 0; i < _keyList.length; i++) {
            if (_keyList[i] == key) {
                repeated = true;
            }
        }
        if (!repeated) 
            _keyList.push(key);
    }
    
    var _translate = function(){
        for (var i = 0; i < _keyList.length; i++) {
            _translateLabel(_keyList[i]);
        }
		if (onTranslate) onTranslate();
    }

    if (typeof languages != "string") {
        _normalInit();
    }
    else {
        EzWebExt.sendGet(languages, _xmlInit, "Error al recuperar el fichero de idiomas");
    }
    
    // PUBLICS METHODS
    
    /**
     * Permite incorporar en tiempo de ejecuci&oacute;n una nueva etiqueta al
     * traductor para su posterior traducci&oacute;n.
     *
     * @param {String} id Adem&aacute;s de ser el identificador de la
     * etiqueta, se corresponde con el atributo <code>id</code> de un elemento
     * HTML del gadget. Sobre este elemento se realizar&aacute; la
     * traducci&oacute;n llegado el momento.<br/><br/>
     *
     * @param {Array} labels Se trata de un <code>Array</code> en el que cada
     * elemento se corresponde con la traducci&oacute;n a un idioma de la
     * etiqueta en cuesti&oacute;n, el orden debe ser id&eacute;ntico al orden
     * en que han sido declarados los idiomas que soporta el gadget en el
     * constructor de la clase <code>Traductor</code>.
     */
    this.addLabel = function(id, labels){
        _addKey(id);
        for (var i = 0; i < _languages.length; i++) {
            _babel[_languages[i]][id] = labels[i];
        }
    }
    
    /** 
     * Devuelve la traducci&oacute;n de la etiqueta indicada por
     * <code>id</code>, al idioma actual del gadget.
     *
     * @param {String} id Identificador de la etiqueta deseada.
     *
     * @return {String} Devuelve la etiqueta seleccionada en el idoma actual
     * del gadget.
     */
    this.getLabel = function(id){
        return _babel[_actualLanguage][id];
    }
    
    /**
     * Traduce todas las etiquetas al idioma actual del gadget.
     */
    this.translate = function(){
        _translate();
    }
    
    // HANDLERS
    
    /**
     * @private
     */
    function _langPrefHandler(value){
        //if you have not selected a language in the preferences of the gadget it will be shown with the language of the platform
        _actualLanguage = value;
        
        if (_actualLanguage == PLATFORM_LANGUAGE) {
            _actualLanguage = _langContext.get();
        }
        
        var isValid = false;
        for (var i = 0; i < _languages.length; i++) {
            if (_languages[i] == _actualLanguage) {
                isValid = true;
            }
        }
        
        if (!isValid) {
            _actualLanguage = _defaultLanguage;
        }
        
        _translate();
    }
    
    /**
     * @private
     */
    function _langContextHandler(value){
        _langPrefHandler(value);
    }
}
