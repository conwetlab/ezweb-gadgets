# -*- coding: cp1252 -*-
# API del MensajeriaWeb.
#
# Características:
# * Implementación de clase para enviar un mensaje por web.

import httplib, urllib

class SMSSenderAPI:

    def sendSMS(self, login, pwd, dest, msg) :
        """Realiza las transacciones HTTP contra el servidor de opensms
            Entrada:  login=cadena con el numero de telefono,
                      pwd=cadena con el password de acceso a la web
                      dest=cadena con el destinatario del mensaje
                      msg=cadena con el texto del mensaje"""

        # Iniciamos envío con HTTPS
        params1 = urllib.urlencode ({'TM_ACTION': 'AUTHENTICATE', 'TM_LOGIN': login})
        params2 = urllib.urlencode ({'TM_PASSWORD': pwd})
        params3 = urllib.urlencode ({'to': dest, 'message': msg})
        params = params1 + "&" + params2 + "&" + params3
        headers = {"Content-type":"application/x-www-form-urlencoded","Accept": "image/gif, image/x-xbitmap, image/jpeg, image/pjpeg, application/x-shockwave-flash, application/vnd.ms-excel, application/vnd.ms-powerpoint, application/msword, */*", "User-Agent" : "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.0.3705; .NET CLR 1.1.4322; Media Center PC 4.0; .NET CLR 2.0.50727)", "Connection" :  "Keep-Alive"}
        conn=httplib.HTTPSConnection("opensms.movistar.es")
        conn.request ("POST", "/aplicacionpost/loginEnvio.jsp",params, headers)
        resp=conn.getresponse()
        respuesta=resp.read()

        # dejamos todo como estaba.
        conn.close()
        return respuesta
