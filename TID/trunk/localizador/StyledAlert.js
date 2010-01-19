var ie6 = false;

var EzWebExt = new Object();

/**
 * Elimina el exceso de carácteres de espaciado (espacios, tabuladores, saltos
 * de linea, etc...)
 *
 * @param {String} text string inicial
 * @return {String} el string pasado en el argumento text, pero eliminando el
 * exceso de carácteres de espaciado.
 */
EzWebExt.stripWhiteSpaces = function(text) {
    //text = text.replace(RegExp("\\s+", "g"), " "); Remove internal spaces
    return text.replace(RegExp("^\\s+|\\s+$", "g"), "");
}

/**
 * Comprueba si una palabra está incluida en un string dado.
 *
 * @param {String} text Texto en el que se va a realizar la comprobación.
 * @param {String} word Palabra que se va a comprobar si está en el texto.
 * @return {Boolean}
 */
EzWebExt.hasWord = function(text, word) {
    return text.match(RegExp("(^\\s*|\\s+)" + word + "(\\s+|\\s*$)", "g")) != null;
}

EzWebExt.removeWord = function(text, word) {
    return EzWebExt.stripWhiteSpaces(text.replace(RegExp("(^\\s*|\\s+)" + word + "(\\s+|\\s*$)", "g"), " "));
}

EzWebExt.appendWord = function(text, word) {
    return EzWebExt.removeWord(text, word) + (" " + word);
}

EzWebExt.prependWord = function(text, word) {
    return word + " " + EzWebExt.removeWord(text, word);
}

EzWebExt.hasClassName = function(element, className) {
    return element.className.match(RegExp("(^\\s*|\\s+)" + className + "(\\s+|\\s*$)", "g")) != null;
}

EzWebExt.prependClassName = function(element, className) {
    element.className = EzWebExt.prependWord(element.className, className);
}

/**
 * Permite forzar el valor que tendrá la variable <code>this</code> cuando se
 * llame a la función indicada.
 *
 * @param {Object} func Función a la que se le forzará el valor de la variable
 * <code>this</code>
 * @param {Object} _this valor que tendrá la variable <code>this</code>.
 * @return a new function that forces the value of <code>this</code> and calls
 * the given function.
 */
EzWebExt.bind = function (func, _this) {
    return function() {func.apply(_this, arguments)}
}

/**
 * Permite obtener un objeto a partir de la mezcla de los atributos de dos
 * objetos. Para ello, se pasarán los dos objetos que se usarán de fuente, 
 * siendo el primero de los objetos sobreescrito con el resultado. En caso de
 * que exista un mismo atributo en los dos objetos, el valor final será el del
 * segundo objeto, perdiendose el valor del primer objeto.
 * 
 * @param {Object} obj1 objeto base.
 * @param {Object} obj2 objeto modificador. En caso de que este argumento sea
 * null, esta función no hará nada.
 *
 * @return obj1 modificado
 */
EzWebExt.merge = function (obj1, obj2) {
    if (obj2 != null) {

        /* TODO esto no "funciona" ("funciona", pero mete las funciones de prototype
         * como atributos en caso de estar mezclando Arrays, etc..) cuando se usa
         * prototype.
         */
        for (var key in obj2)
            obj1[key] = obj2[key];
    }

    return obj1;
}

if ('addEventListener' in document) {
    EzWebExt.addEventListener = function(element, eventName, callback, capture) {
        element.addEventListener(eventName, callback, capture);
    }

    EzWebExt.removeEventListener = function(element, eventName, callback, capture) {
        element.removeEventListener(eventName, callback, capture);
    }
} else {
    EzWebExt.addEventListener = function(element, eventName, callback, capture) {
        var currentTarget = element;
        var extraAdaptations = function() {};
        switch (eventName) {
            case 'mouseover':
                extraAdaptations = function(e) {
                    e.target = e.toElement;
                    e.relatedTarget = e.fromElement;
                }
                break;
            case 'mouseout':
                extraAdaptations = function(e) {
                    e.target = e.fromElement;
                    e.relatedTarget = e.toElement;
                }
                break;

            case 'change':
                if ((element.tagName.toLowerCase() == 'input') && (element.type.toLowerCase() == 'radio' || element.type.toLowerCase() == 'checkbox'))
                    eventName = 'click';
            default:
                extraAdaptations = function(e) {
                    e.target = e.srcElement;
                }
        }

        var wrapper = function() {
            var e = window.event;
            e.stopPropagation = function() {
                this.cancelBubble = true;
            }
            e.currentTarget = currentTarget;
            extraAdaptations(e);
            callback(e);
        }

        if (!capture) {
            wrapper.callback = callback;
            element.attachEvent('on' + eventName, wrapper);
        } else {
            if (element['on' + eventName]) {
                var tmp = wrapper;
                var prevWrapper = element['on' + eventName];
                wrapper = function() {
                    prevWrapper();
                    if (!window.event.cancelBubble)
                        tmp();
                }
                wrapper.prevWrapper = prevWrapper;
                prevWrapper.nextWrapper = wrapper;
            }

            element['on' + eventName] = wrapper;
        }
    }

    EzWebExt.removeEventListener = function(element, eventName, callback, capture) {
        if (!capture) {
            element.detachEvent('on' + eventName, callback);
        } else {
            var curWrapper = element['on' + eventName];

            if (curWrapper.callback == callback) {
                element['on' + eventName] = curWrapper.nextFunc;
            } else {
                var prevWrapper;

                if (!curWrapper.nextFunc)
                    element['on' + eventName] = null;

                while (curWrapper != null && curWrapper.callback != callback) {
                    prevWrapper = curWrapper;
                    curWrapper = curWrapper.nextWrapper;
                }

                if (curWrapper != null)
                    prevWrapper.nextFunc = curWrapper.nextFunc;
            }
        }
    }
}

/**
 * Elimina un nodo DOM de su elemento padre. Esta funcion no comprueba que el
 * nodo DOM tenga un padre, por lo que en caso de no ser así el código lanzaría
 * una excepción.
 */
EzWebExt.removeFromParent = function (domNode) {
    domNode.parentNode.removeChild(domNode);
}

function StyledAlert(title, content, options){
    var defaultOptions = {
        'minWidth': 200,
        'maxWidth': 400,
        'minHeight': 100,
        'maxHeight': 200,
        'type': EzWebExt.ALERT_INFO
    };
       
    // Cache gradient image
    var image = document.createElement("img");
    image.src = "images/degradado.png";
    document.body.appendChild(image);
    document.body.removeChild(image);
    
    this.options = EzWebExt.merge(defaultOptions, options);

    this.wrapperElement = document.createElement("div");
    this.wrapperElement.className = "styled_alert";

		this.backgroundDiv = document.createElement("div");
		this.backgroundDiv.className = "background";

    this.messageDiv = document.createElement("div");
    this.messageDiv.className = "message";

    this.wrapperElement.appendChild(this.backgroundDiv);
    this.wrapperElement.appendChild(this.messageDiv);

    this.header = document.createElement("div");
    this.header.className = "header";

    var table = document.createElement("table");
		var tbody = document.createElement("tbody");
		table.appendChild(tbody);
		table.setAttribute("width", "100%");
		this.header.appendChild(table);

		var tr = tbody.insertRow(-1);
		var td = tr.insertCell(-1);
		td.className = "title";

    var types = ["info", "warning", "error"];
    image = document.createElement("img");    
    if(!ie6){    
      image.src = "images/dialog-" + types[this.options['type']] + '.png';
    }
    else{
      image.src = "images/dialog-" + types[this.options['type']] + '-ie6.png';
    }
    td.appendChild(image);
    if (title)
      td.appendChild(document.createTextNode(title));

		var button = tr.insertCell(-1);
		button.className = "close_button";

    this.messageDiv.appendChild(this.header);

    this.content = document.createElement("div");
    this.content.className = "content";
    if (content)
        this.content.innerHTML = content;
    this.messageDiv.appendChild(this.content);


    EzWebExt.prependClassName(this.wrapperElement, types[this.options['type']]);

    /* Events code */
    EzWebExt.addEventListener(button, "click",
                            EzWebExt.bind(function () {
                                EzWebExt.removeFromParent(this.wrapperElement);
                                this.wrapperElement = null;
                            }, this),
                            true);
                            
    this.repaint = function(){
          if(this.wrapperElement){
            // Adjust messageDiv height and messageDiv width
            var width = (this.wrapperElement.offsetWidth * 80 / 100);
            var height = (this.wrapperElement.offsetHeight * 80 / 100);
            var positionHeight = (this.wrapperElement.offsetHeight * 10 / 100);
            var positionWidth = (this.wrapperElement.offsetWidth * 10 / 100);
      /*
            width = (width > this.options['max_width']) ? this.options['max_width']:
                        ((width < this.options['min_width']) ? this.options['min_width'] : width);
            height = (height > this.options['max_height']) ? this.options['max_height']:
                        ((height < this.options['min_height']) ? this.options['min_height'] : height);
      */      
            this.messageDiv.style.top = positionHeight + 'px';;   
            this.messageDiv.style.left = positionWidth + 'px';;
            this.messageDiv.style.right = positionWidth + 'px';;    
            this.messageDiv.style.bottom = positionHeight + 'px';;      
            this.messageDiv.style.width = width + 'px';
            this.messageDiv.style.height = height + 'px';
            
            // Adjust Content Height 
            var messageDivStyle = document.defaultView.getComputedStyle(this.messageDiv, null);
            var headerStyle = document.defaultView.getComputedStyle(this.header, null);
            var contentStyle = document.defaultView.getComputedStyle(this.content, null);

            height = height - this.header.offsetHeight -
            messageDivStyle.getPropertyCSSValue('border-top-width').getFloatValue(CSSPrimitiveValue.CSS_PX) - 
            messageDivStyle.getPropertyCSSValue('border-bottom-width').getFloatValue(CSSPrimitiveValue.CSS_PX) - 
            headerStyle.getPropertyCSSValue('margin-bottom').getFloatValue(CSSPrimitiveValue.CSS_PX) - 
            headerStyle.getPropertyCSSValue('margin-top').getFloatValue(CSSPrimitiveValue.CSS_PX) - contentStyle.getPropertyCSSValue('margin-bottom').getFloatValue(CSSPrimitiveValue.CSS_PX);
            this.content.style.height =  (height + 'px');

            // Addjust Content Width 
            width =  width - messageDivStyle.getPropertyCSSValue('border-left-width').getFloatValue(CSSPrimitiveValue.CSS_PX) - messageDivStyle.getPropertyCSSValue('border-right-width').getFloatValue(CSSPrimitiveValue.CSS_PX) - contentStyle.getPropertyCSSValue('margin-right').getFloatValue(CSSPrimitiveValue.CSS_PX) - contentStyle.getPropertyCSSValue('margin-left').getFloatValue(CSSPrimitiveValue.CSS_PX);
            this.content.style.width = (width + 'px');
          }      
    }
    
    this.remove = function(){
      if(this.wrapperElement){
        document.body.removeChild(this.wrapperElement);
      }
    }
        
    document.body.appendChild(this.wrapperElement);
    this.repaint();
}

