var languages = {"en":{
					"Aceptar": "Accept",
					"Cancelar": "Cancel",
					"Crear trayecto nuevo":"Create New Route",
					"Trayecto":"Route",
					"Seleccionar cámaras del trayecto":"Select Webcams",
					"Volver a edición de cámaras":"Back",
					"Volver a vista principal":"Back",
					"Añadir nueva cámara":"Add New Webcam",
					"Borrar trayecto":"Remove Route",
					"Editar cámaras del trayecto":"Edit Webcams",
					"Anterior":"Previous",
					"Siguiente":"Next",
					"Enviar eventos":"Send Events",
					"Reproducir":"Play",
					"Añadir Trayecto":"Add Route",
					"Modificar Trayecto":"Edit Route",
					"El nombre del trayecto ya existe":"The name of route always exists",
					"Eliminar imagen":"Remove Webcam"
				},
				"es":{
					
				},
				"pt":{
					
				}};

var _ = function(key) {
	if (languages[language.get()] && languages[language.get()][key]) {
		return languages[language.get()][key];
	}
	else {
		return key;
	}
};

