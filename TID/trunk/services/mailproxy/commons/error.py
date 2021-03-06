#!/usr/bin/python
import sys

IMAP_MAILBOX_LIST = 0
IMAP_MAILBOX_INFO = 1
IMAP_SELECT = 2
IMAP_SEARCH = 3
IMAP_FETCH = 4
IMAP_MESSAGE = 5
IMAP_FILE = 6

SMTP_SEND = 20
SMTP_SEND_FILE = 21

SERVER = 100
SMTP_TLS = 101

LOGIN = 200

CONFIG = 300
SMTP_TO = 301
SMTP_CC = 302
SMTP_BCC = 303

class Error:

    def __init__(self):
        self.errors = {}
        self.errors[`CONFIG`] = {"error":CONFIG, "message":"Existen errores en los parametros de configuracion"}
        self.errors[`SERVER`] = {"error":SERVER, "message":"Servidor no valido o fuera de servicio"}
        self.errors[`LOGIN`] = {"error":LOGIN, "message":"Usuario o password incorrectos"}
        self.errors[`IMAP_MAILBOX_LIST`] = {"error":IMAP_MAILBOX_LIST, "message":"No se puede obtener la lista de mailboxes"}
        self.errors[`IMAP_MAILBOX_INFO`] = {"error":IMAP_MAILBOX_INFO, "message":"No se puede obtener la informacion del mailbox seleccionado"}
        self.errors[`IMAP_SELECT`] = {"error":IMAP_SELECT, "message":"No se puede seleccionar el mailbox indicado"}
        self.errors[`IMAP_SEARCH`] = {"error":IMAP_SEARCH, "message":"Ocurrio un problema al realizar la busqueda en el servidor IMAP"}
        self.errors[`IMAP_FETCH`] = {"error":IMAP_FETCH, "message":"Ocurrio un problema al realizar la solicitud al servidor IMAP"}
        self.errors[`IMAP_MESSAGE`] = {"error":IMAP_MESSAGE, "message":"El mensaje solicitado no existe"}
        self.errors[`IMAP_FILE`] = {"error":IMAP_FILE, "message":"El fichero solicitado no existe"}
        self.errors[`SMTP_TLS`] = {"error":SMTP_TLS, "message":"Se ha producido un error al intentar acceder por TLS"}
        self.errors[`SMTP_TO`] = {"error":SMTP_TO, "message":"El parametro TO de la request debe se un array de direcciones"}
        self.errors[`SMTP_CC`] = {"error":SMTP_CC, "message":"El parametro CC de la request debe se un array de direcciones"}
        self.errors[`SMTP_BCC`] = {"error":SMTP_BCC, "message":"El parametro BCC de la request debe se un array de direcciones"}
        self.errors[`SMTP_SEND`] = {"error":SMTP_SEND, "message":"Ocurrio un error al enviar el mail"}
        self.errors[`SMTP_SEND_FILE`] = {"error":SMTP_SEND, "message":"Ocurrio un error al enviar el mail, no es posible acceder a uno de los archivos adjuntos"}

    def getErrorInfo(self, error_code):
        if self.errors.has_key(`error_code`):
            return self.errors[`error_code`]
        return None

def getHTTPError(error_code):
    if error_code >= 300:
        return 400
    elif error_code >= 200:
        return 401
    elif error_code >= 100:
        return 503
    else:
        return 404

error = Error()

def getErrorInfo(error_code):
    return error.getErrorInfo(error_code) 
