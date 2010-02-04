/******************** INIT **************************/

/* Instanciate the Gadget class */
ClienteCorreo = new ClienteCorreo();

/* Instanciate the AccountsManagerBasic class */
var AccountsManager = new AccountsManagerBasic();

/* Instanciate the Utils class */
Utils = new Utils();

/* Init Tiny MCE */
tinyMCE_config["content_css"] = ClienteCorreo.getResourceURL("css/tinymce_content.css");
tinyMCE.init(tinyMCE_config);
