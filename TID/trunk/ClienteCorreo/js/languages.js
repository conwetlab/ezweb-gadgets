var languages = {
    en: {
        "inbox": "Inbox",
        "trash": "Trash",
        "junk": "Spam",
        "spam": "Spam",
        "sent": "Sent",
        "drafts": "Drafts",
        "borradores": "Drafts",
        "todos": "All",
        "enviados": "Sent",
        "papelera": "Trash"
    },
    es: {
        "Subject": "Asunto",
        "Sender": "Remitente",
        "Subject or Sender": "Asunto o Remitente",
        "For or Cc": "Para o Cc",
        "Body": "Cuerpo del mensaje",
        "Synchronize": "Sincronizar",
        "Mailbox": "Bandeja de correo",
        "Send email": "Enviar email",
        "Send email to ": "Enviar email a ",
        "Settings": "Configurar",
        "Search options": "Opciones de búsqueda",
        "To": "Para",
        "From": "De",
        "Cc": "Cc",
        "Bcc": "Cco",
        "Date": "Fecha",
        "Size": "Tamaño",
        "SEND EMAIL": "ENVIAR EMAIL",
        "Cancel": "Cancelar",
        "Send": "Enviar",
        "Warning": "Advertencia",
        "Attachments": "Adjuntos",
        "Attach files": "Adjuntar archivos",
        "SETTINGS": "CONFIGURACIÓN",
        "Save": "Guardar",
        "Error": "Error",
        "Must fill in all form fields": "Deben rellenarse todos los campos del formulario",
        "All email recipients must be valid": "Todos los correos de los destinatarios deben ser válidos",
        "Non secure": "No seguro",
        "Account settings": "Configuración de la cuenta",
        "Outgoing server": "Servidor de salida",
        "Account": "Cuenta",
        "Host": "Servidor",
        "Port": "Puerto",
        "Protocol": "Protocolo",
        "Connection": "Conexión",
        "Username": "Usuario",
        "Password": "Contraseña",
        "First": "Primero",
        "Back": "Atrás",
        "Next": "Siguiente",
        "Last": "Último",
        "There are some attachment files": "Tiene ficheros adjuntos",
        "Exception": "Excepción",
        "Line": "Línea",
        "Message": "Mensaje",
        "Reply all": "Responder a todos",
        "Reply": "Responder",
        "Forward": "Reenviar",
        "wrote": "ecribió",
        "Show details": "Mostrar detalles", 
        "Hide details": "Ocultar detalles",
        "Already added a file with the name": "Ya se ha añadido un fichero con el nombre",
        "The max size for attachment files is": "El tamañano máximo para los ficheros adjuntos es",
        "Delete": "Borrar",
        "Send events": "Enviar eventos",
        "Name": "Nombre",
        "inbox": "Bandeja de entrada",
        "trash": "Papelera",
        "junk": "Correo basura",
        "spam": "Correo basura",
        "sent": "Enviados",
        "drafts": "Borradores",
        "borradores": "Borradores",
        "todos": "Todos",
        "enviados": "Enviados",
        "papelera": "Papelera"
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
