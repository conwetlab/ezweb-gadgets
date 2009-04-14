/*----------------------------------------------------------------------------
 * LibEgg *
 *----------------------------------------------------------------------------/

/**
 *
 */
StyledElements.BorderLayout = function(options) {
    StyledElements.StyledElement.call(this, []);

    options = EzWebExt.merge({
        'class': '',
    }, options);

    this.wrapperElement = new StyledElements.Container({
                              'class': EzWebExt.appendWord(options['class'], "border_layout")
                          });

    this.north = new StyledElements.Container({'class': 'north'});
    this.west = new StyledElements.Container({'class': 'west'});
    this.center = new StyledElements.Container({'class': 'center'});
    this.east = new StyledElements.Container({'class': 'east'});
    this.south = new StyledElements.Container({'class': 'south'});

    this.wrapperElement.appendChild(this.north);
    this.wrapperElement.appendChild(this.west);
    this.wrapperElement.appendChild(this.center);
    this.wrapperElement.appendChild(this.east);
    this.wrapperElement.appendChild(this.south);
}
StyledElements.BorderLayout.prototype = new StyledElements.StyledElement();

StyledElements.BorderLayout.prototype.repaint = function(temporal) {
    var usableArea = {
        'width' : this.wrapperElement.offsetWidth,
        'height': this.wrapperElement.offsetHeight
    };

    var h1 = this.north.offsetHeight;
    var h2 = usableArea.height - this.south.offsetHeight;
    var centerHeight = h2 - h1;

    var v1 = this.west.offsetWidth;
    var v2 = usableArea.width - this.east.offsetWidth;
    var centerWidth = v2 - v1;

    this.west.wrapperElement.style.top = h1;
    this.west.wrapperElement.style.height = centerHeight;
    this.center.wrapperElement.style.top = h1;
    this.center.wrapperElement.style.height = centerHeight;
    this.center.wrapperElement.style.width = centerWidth;
    this.center.wrapperElement.style.left = v1;
    this.east.wrapperElement.style.top = h1;
    this.east.wrapperElement.style.height = centerHeight;
    this.east.wrapperElement.style.left = v2;

    this.south.wrapperElement.style.top = h2;

    this.north.repaint(temporal);
    this.west.repaint(temporal);
    this.center.repaint(temporal);
    this.east.repaint(temporal);
    this.south.repaint(temporal);
}

StyledElements.BorderLayout.prototype.getNorthContainer = function() {
    return this.north;
}

StyledElements.BorderLayout.prototype.getWestContainer = function() {
    return this.west;
}

StyledElements.BorderLayout.prototype.getCenterContainer = function() {
    return this.center;
}

StyledElements.BorderLayout.prototype.getEastContainer = function() {
    return this.east;
}

StyledElements.BorderLayout.prototype.getSouthContainer = function() {
    return this.south;
}

/**
 *
 */
StyledElements.StyledButton = function(options) {
    StyledElements.StyledElement.call(this, ['click']);

    var defaultOptions = {
        'text': null,
        'class': '',
        'iconHeight': 24,
        'iconWidth': 24,
        'icon': null,
    };
    options = EzWebExt.merge(defaultOptions, options);

    this.wrapperElement = document.createElement("div");
    this.wrapperElement.className = EzWebExt.appendWord(options['class'], "styled_button");

    var button = document.createElement("div");

    this.icon = document.createElement("div");
    this.icon.className = "icon";
    button.appendChild(this.icon);

    this.wrapperElement.appendChild(button);

    if (options.text !== null)
        button.appendChild(document.createTextNode(options.text));

    /* Event handlers */
    button.addEventListener('click',
                            EzWebExt.bind(function () {
                                this.events['click'].dispatch(this);
                            }, this),
                            true);
}
StyledElements.StyledButton.prototype = new StyledElements.StyledElement();


/**
 *
 */
StyledElements.ColorSelector = function(options) {
    options = EzWebExt.merge({
        "class": "",
        "iconHeight": 24,
        "iconHeight": 24,
        "icon": null,
    }, options);
    StyledElements.StyledElement.call(this, []);

    this.wrapperElement = document.createElement("div");
    this.wrapperElement.className = EzWebExt.appendWord(options.class, 'styled_password_field');

    if (options['id'] != undefined)
        this.wrapperElement.setAttribute("id", options['id']);


}

/*---------------------------------------------------------------------------*
 *                               Styled Gadget                               *
 *---------------------------------------------------------------------------*/

var StyledGadget = function() {
    /* Call to the parent constructor */
    EzWebGadget.call(this, {translatable: "true"});
}
StyledGadget.prototype = new EzWebGadget(); /* Extend from EzWebGadget */

StyledGadget.prototype.resourcesURL = "http://jupiter.ls.fi.upm.es/svn/ezweb-gadgets/eskel/1.0_beta1/examples/StyledGadget";

StyledGadget.prototype.init = function() {
    var hpaned = new StyledElements.StyledHPaned({handlerPosition: 30,
                                                  leftMinWidth: 100,
                                                  rightMinWidth: 100});
    hpaned.insertInto(document.body);

    var alternatives = new StyledElements.StyledAlternatives();

    /* Left Content */
    var onChange = function(component, newSelection, newElements, removedElements) {
        if (newSelection.length > 0)
            alternatives.showAlternative(newSelection[0]);
    }
    var list = new StyledElements.StyledList({full: true, multivalued: false});
    list.addEventListener('change', onChange);
    hpaned.getLeftPanel().appendChild(list);

    /* Right Content */
    hpaned.getRightPanel().appendChild(alternatives);


    function insertExample(name, code) {
        var panelNotebook = new StyledElements.StyledNotebook();
        var container = panelNotebook.createTab({name: "View", closeable: false});

        try {
            eval("var codeFunc = function() {\n" + code + "\n}");
            codeFunc();
        } catch (e) {
            container.clear();
            container.appendChild(document.createTextNode(e));
        }

        var alternative = alternatives.createAlternative();
        alternative.appendChild(panelNotebook);

        list.addEntries([[alternative.getId(), name]]);

        var preText = document.createElement("pre");
        var codeTab = panelNotebook.createTab({name: "Code", closeable: false});
        preText.appendChild(document.createTextNode(code));
        codeTab.appendChild(preText);
    }

    var code;

    /*
     * BorderLayout example
     *
    code = "\
    var blayout = new StyledElements.BorderLayout();\n\
    blayout.getNorthPanel().appendChild(document.createTextNode('Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque volutpat mattis eros. Nullam malesuada erat ut turpis. Suspendisse urna nibh, viverra non, semper suscipit, posuere a, pede.'));\n\
    container.appendChild(blayout);
    ";

    insertExample("BorderLayout", code);*/



    /*
     * Components example
     */
    code = "\
    var row = document.createElement('div');\n\
    var select = new StyledElements.StyledSelect({initialEntries: [['1', 'uno'], ['3', 'tres'], ['2', 'dos']], initialValue: '3'});\n\
    var button = new StyledElements.StyledButton({text: 'Reset'});\n\
    button.wrapperElement.style.cssFloat = 'right';\n\
    var resetSelectField = function(button) {\n\
        select.reset();\n\
    };\n\
    button.addEventListener('click', resetSelectField);\n\
    button.insertInto(row);\n\
    select.insertInto(row);\n\
    container.appendChild(row);\n\
\n\
    /* Text Field */\n\
    var row = document.createElement('div');\n\
    var textField = new StyledElements.StyledTextField({initialValue: 'texto'});\n\
    var button = new StyledElements.StyledButton({text: 'Reset'});\n\
    button.wrapperElement.style.cssFloat = 'right';\n\
    var resetTextField = function(button) {\n\
        textField.reset();\n\
    };\n\
    button.addEventListener('click', resetTextField);\n\
    button.insertInto(row);\n\
    textField.insertInto(row);\n\
    container.appendChild(row);\n\
\n\
    /* Password Field */\n\
    var row = document.createElement('div');\n\
    var passField = new StyledElements.StyledPasswordField({initialValue: 'pass'});\n\
    var button = new StyledElements.StyledButton({text: 'Reset'});\n\
    button.wrapperElement.style.cssFloat = 'right';\n\
    var resetPassField = function(button) {\n\
        passField.reset();\n\
    };\n\
    button.addEventListener('click', resetPassField);\n\
    button.insertInto(row);\n\
    passField.insertInto(row);\n\
    container.appendChild(row);\n\
\n\
    /* Numeric Field */\n\
    var row = document.createElement('div');\n\
    var numericField = new StyledElements.StyledNumericField({initialValue: 10});\n\
    container.appendChild(numericField);\n\
    var button = new StyledElements.StyledButton({text: 'Reset'});\n\
    button.wrapperElement.style.cssFloat = 'right';\n\
    var resetNumericField = function(button) {\n\
        numericField.reset();\n\
    };\n\
    button.addEventListener('click', resetNumericField);\n\
    button.insertInto(row);\n\
    numericField.insertInto(row);\n\
    container.appendChild(row);\n\
\n\
    /* Check boxes */\n\
    var group1 = new StyledElements.ButtonsGroup('input5');\n\
    var radiobutton;\n\
    var row = document.createElement('div');\n\
    var button = new StyledElements.StyledButton({text: 'Reset'});\n\
    button.wrapperElement.style.cssFloat = 'right';\n\
    button.addEventListener('click', EzWebExt.bind(group1.reset, group1));\n\
    button.insertInto(row);\n\
\n\
    radiobutton = new StyledElements.StyledCheckBox(group1, 'uno');\n\
    radiobutton.insertInto(row);\n\
    radiobutton = new StyledElements.StyledCheckBox(group1, 'dos', {initiallyChecked: true});\n\
    radiobutton.insertInto(row);\n\
    radiobutton = new StyledElements.StyledCheckBox(group1, 'tres');\n\
    radiobutton.insertInto(row);\n\
    radiobutton = new StyledElements.StyledCheckBox(group1, 'cuatro', {initiallyChecked: true});\n\
    radiobutton.insertInto(row);\n\
    container.appendChild(row);\n\
\n\
    /* Radio buttons */\n\
    var group2 = new StyledElements.ButtonsGroup('input6');\n\
\n\
    radiobutton = new StyledElements.StyledRadioButton(group2, 'uno');\n\
    container.appendChild(radiobutton);\n\
    radiobutton = new StyledElements.StyledRadioButton(group2, 'dos', true);\n\
    container.appendChild(radiobutton);\n\
    radiobutton = new StyledElements.StyledRadioButton(group2, 'tres');\n\
    container.appendChild(radiobutton);\n\
\n\
    var tmp = document.createElement('br');\n\
    container.appendChild(tmp);\n\
\n\
    var group1Viewer = document.createElement('span');\n\
\n\
    function showGroup1(group) {\n\
        var text = '';\n\
        var value = group.getValue();\n\
        if (value.length > 0)\n\
            text = value[0];\n\
\n\
        for (var i = 1; i < value.length; i++) {\n\
            text += ', ' + value[i];\n\
        }\n\
        group1Viewer.textContent = text;\n\
    }\n\
    showGroup1(group1);\n\
    group1.addEventListener('change', showGroup1);\n\
\n\
    container.appendChild(group1Viewer);\n\
    tmp = document.createElement('br');\n\
    container.appendChild(tmp);\n\
\n\
    var group2Viewer = document.createElement('span');\n\
\n\
    function showGroup2(group) {\n\
        var text = '';\n\
        var value = group.getValue();\n\
        if (value.length > 0)\n\
            text = value[0];\n\
\n\
        for (var i = 1; i < value.length; i++) {\n\
            text += ', ' + value[i];\n\
        }\n\
        group2Viewer.textContent = text;\n\
    }\n\
    showGroup2(group2);\n\
    group2.addEventListener('change', showGroup2);\n\
\n\
    container.appendChild(group2Viewer);\n";

    insertExample("Components", code);



    /*
     * Notebook example
     */
    code = "\
    var goToTab3Button = new StyledElements.StyledButton({'text': 'Go to Tab \"tres\"'});\n\
    container.appendChild(goToTab3Button);\n\
\n\
    var createTabButton = new StyledElements.StyledButton({'text': 'New Tab'});\n\
    container.appendChild(createTabButton);\n\
\n\
    var notebook = new StyledElements.StyledNotebook();\n\
    var tab1 = notebook.createTab({name: 'uno'});\n\
    tab1.appendChild(document.createTextNode('Contenido 1.\\n Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque volutpat mattis eros. Nullam malesuada erat ut turpis. Suspendisse urna nibh, viverra non, semper suscipit, posuere a, pede.'));\n\
    var tab2 = notebook.createTab({name: 'dos'});\n\
    tab2.appendChild(document.createTextNode('Contenido 2.\\n Donec nec justo eget felis facilisis fermentum. Aliquam porttitor mauris sit amet orci. Aenean dignissim pellentesque felis.'));\n\
    var tab3 = notebook.createTab({name: 'tres', closeable: false});\n\
    tab3.appendChild(document.createTextNode('Contenido 3.\\n Donec nec justo eget felis facilisis fermentum. Aliquam porttitor mauris sit amet orci. Aenean dignissim pellentesque felis.'));\n\
    var tab4 = notebook.createTab({name: 'una pestaña grande (cuatro)'});\n\
    tab4.appendChild(document.createTextNode('Contenido 4.\\n Donec nec justo eget felis facilisis fermentum. Aliquam porttitor mauris sit amet orci. Aenean dignissim pellentesque felis.'));\n\
    var tab5 = notebook.createTab({name: 'cinco'});\n\
    tab5.appendChild(document.createTextNode('Contenido 5.\\n Donec nec justo eget felis facilisis fermentum. Aliquam porttitor mauris sit amet orci. Aenean dignissim pellentesque felis.'));\n\
    container.appendChild(notebook);\n\
\n\
    goToTab3Button.addEventListener('click', function() {notebook.goToTab(tab3.getId())});\n\
    createTabButton.addEventListener('click', function() {notebook.createTab({name: 'Tab', initiallyVisible: true})});\n\
\n";

    insertExample("Notebook", code);



    /*
     * HPaned example
     */
    code = "\
    var hpaned = new StyledElements.StyledHPaned();\n\
    hpaned.getLeftPanel().appendChild(document.createTextNode('Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque volutpat mattis eros. Nullam malesuada erat ut turpis. Suspendisse urna nibh, viverra non, semper suscipit, posuere a, pede.'));\n\
    hpaned.getRightPanel().appendChild(document.createTextNode('Contenido 2.\\n Donec nec justo eget felis facilisis fermentum. Aliquam porttitor mauris sit amet orci. Aenean dignissim pellentesque felis.'));\n\
    container.appendChild(hpaned);\n\
    ";

    insertExample("HPaned", code);



    /*
     * Alternatives example
     */
    code = "\
    var goToAlt2Button = new StyledElements.StyledButton({'text': 'Go to Alternative 2'});\n\
    container.appendChild(goToAlt2Button);\n\
\n\
    var alternatives = new StyledElements.StyledAlternatives();\n\
    var alt1 = alternatives.createAlternative();\n\
    alt1.appendChild(document.createTextNode('Contenido 1.\\n Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque volutpat mattis eros. Nullam malesuada erat ut turpis. Suspendisse urna nibh, viverra non, semper suscipit, posuere a, pede.'));\n\
    var alt2 = alternatives.createAlternative();\n\
    alt2.appendChild(document.createTextNode('Contenido 2.\\n Donec nec justo eget felis facilisis fermentum. Aliquam porttitor mauris sit amet orci. Aenean dignissim pellentesque felis.'));\n\
    var alt3 = alternatives.createAlternative();\n\
    alt3.appendChild(document.createTextNode('Contenido 3.\\n Donec nec justo eget felis facilisis fermentum. Aliquam porttitor mauris sit amet orci. Aenean dignissim pellentesque felis.'));\n\
    container.appendChild(alternatives);\n\
\n\
    goToAlt2Button.addEventListener('click', function() {alternatives.showAlternative(alt2.getId())});\n\
\n";

    insertExample("Alternatives", code);



    /*
     * Alert example
     */
    code = "\
    function showInfoAlert() {\n\
        var alert = new StyledElements.StyledAlert('titulo', 'contenido');\n\
        container.appendChild(alert);\n\
    }\n\
    var button = new StyledElements.StyledButton({text: 'Show Info Alert'});\n\
    button.addEventListener('click', showInfoAlert)\n\
    container.appendChild(button);\n\
\n\
    function showWarningAlert() {\n\
        var alert = new StyledElements.StyledAlert('titulo', 'contenido', {'type': EzWebExt.ALERT_WARNING});\n\
        container.appendChild(alert);\n\
    }\n\
    var button = new StyledElements.StyledButton({text: 'Show Warning Alert'});\n\
    button.addEventListener('click', showWarningAlert)\n\
    container.appendChild(button);\n\
\n\
    function showErrorAlert() {\n\
        var alert = new StyledElements.StyledAlert('titulo', 'contenido', {'type': EzWebExt.ALERT_ERROR});\n\
        container.appendChild(alert);\n\
    }\n\
    var button = new StyledElements.StyledButton({text: 'Show Error Alert'});\n\
    button.addEventListener('click', showErrorAlert)\n\
    container.appendChild(button);\n\
\n";
    
    insertExample("Alert", code);


    /*
     * List example
     */
    code = "\n\
    var valueSpan = document.createElement('span');\n\
    valueSpan.style.cssFloat = 'right';\n\
    container.appendChild(valueSpan);\n\
\n\
    var list = new StyledElements.StyledList({multivalued: true});\n\
    list.addEntries([['0','Uno'],['1'],['2', 'Dos']]);\n\
    list.select(['1']);\n\
    container.appendChild(list);\n\
\n\
    function showSelection(list, value) {\n\
        var text = '';\n\
        if (value.length > 0)\n\
            text = value[0];\n\
\n\
        for (var i = 1; i < value.length; i++) {\n\
            text += ', ' + value[i];\n\
        }\n\
        valueSpan.textContent = text;\n\
    }\n\
    showSelection(null, list.getSelection());\n\
    list.addEventListener('change', showSelection);\n\
\n";
    
    insertExample("List", code);

    /*
     * Code testing area
     *
    var alternative = alternatives.createAlternative();
    var container = alternative;
    list.addEntries([[alternative.getId(), "Testing"]]);

    var list = new StyledElements.StyledList();
    list.addEntries([['0','Uno'],['1'],['2', 'Dos']]);
    list.select(['1']);
    container.appendChild(list);*/
     
    /*
     * Init
     */

    /* Select first example */
    list.select([0]);

    /* Remove loading gif */
    var loadingElement = document.getElementById("loading");
    loadingElement.parentNode.removeChild(loadingElement);
}

/* Instanciate the Gadget class */
StyledGadget = new StyledGadget();
