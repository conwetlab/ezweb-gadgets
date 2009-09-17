var languages = {
    en: {
    },
    es: {
        "Subject": "Asunto",
        "Sender": "Remitente",
        "Subject or Sender": "Asunto o Remitente",
        "For or Cc": "Para o Cc",
        "Body": "Cuerpo del mensaje",
        "Synchronize": "Sincronizar",
        "Send email": "Enviar email",
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
        "Name": "Nombre"
    }
};

var _ = function(key) {
    var language = ClienteCorreo.language;
    if (languages[language] && languages[language][key]) {
        return languages[language][key];
    }
    else {
        return key;
    }
};
