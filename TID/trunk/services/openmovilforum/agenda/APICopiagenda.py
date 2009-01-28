# -*- coding: cp1252 -*-
import httplib, urllib

def ParseaRespuesta (codigo) :
    """Parsea el fichero de texto con los contactos separados por \t
        Entrada: La cadena con el fichero
        Retorna: La lista de contactos o 0 en caso de error"""

    Contactos =[]
    delimitadorContacto = '"Title"'
    
    if codigo[:7]!= delimitadorContacto :
        return 0
    indice = codigo.find ('\n"')
    DescripCampos=(codigo[1:indice-2]).split('"\t"')
    codigo = codigo [indice+1:]
    
    indice = codigo.find ('\n"')
    while indice!=-1 :
        contacto = (codigo [1:indice-2]).split('"\t"')
        Contactos.append (contacto)
        codigo = codigo [indice+1:]
        indice = codigo.find ('\n"')
    else :
        indice = codigo.find ('\n')
        contacto = (codigo [1:indice-2]).split('"\t"')
        Contactos.append (contacto)

    return Contactos


def RecuperaContactos (login, pwd) :
    """Realiza las transacciones HTTPS contra el servidor de Copiagenda
        Entrada: login=cadena con el numero de telefono,
                  pwd=cadena con el password de acceso a la web
        Retorna: La lista de contactos o 0 en caso de error"""

    ##Valores a retornar
    ListaContactos = []
    
    ## Iniciamos login con HTTPS
    params = urllib.urlencode ({'TM_ACTION': 'LOGIN','TM_LOGIN':login, 'TM_PASSWORD':pwd})
    headers = {"Content-type":"application/x-www-form-urlencoded","Accept": "image/gif, image/x-xbitmap, image/jpeg, image/pjpeg, application/x-shockwave-flash, application/vnd.ms-excel, application/vnd.ms-powerpoint, application/msword, */*", "User-Agent" : "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.0.3705; .NET CLR 1.1.4322; Media Center PC 4.0; .NET CLR 2.0.50727)", "Connection" :  "Keep-Alive"}
    conn=httplib.HTTPSConnection("copiagenda.movistar.es")
    conn.request ("POST", "/cp/ps/Main/login/Agenda",params, headers)
    resp=conn.getresponse()
    #print resp.status
    #print resp.getheaders()

    ## Nos redirecionan y nos dan una cookie
    headresp=resp.getheaders()
    cookie=headresp[1][1]
    cookie = cookie.replace(" Path=/, "," ")
    cookie = cookie.replace("; Domain=.movistar.es; Path=/","+")
    cookie = cookie.rstrip('+')
    #print cookie
    headers2 = {"Accept": "image/gif, image/x-xbitmap, image/jpeg, image/pjpeg, application/x-shockwave-flash, application/vnd.ms-excel, application/vnd.ms-powerpoint, application/msword, */*", "User-Agent" : "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.0.3705; .NET CLR 1.1.4322; Media Center PC 4.0; .NET CLR 2.0.50727)", "Host" : "copiagenda.movistar.es", "Connection" :  "Keep-Alive","Cookie" : cookie}
    conn2=httplib.HTTPSConnection("copiagenda.movistar.es")
    conn2.request ("GET", "/cp/ps/Main/login/Verificacion?d=movistar.es",None, headers2)
    resp2=conn2.getresponse()
    #print resp2.status
    respuesta= resp2.read()
    inic=respuesta.find("name=\"password")
    inic=respuesta.find("value=",inic)
    finic=respuesta.find(">",inic)
    pwdCodificado= respuesta[inic+6:finic]
    #print pwdCodificado

    ## Nos piden que nos re-autentiquemos con los datos de usuario + la cookie y nos devuelven un token de sesion
    params3 = urllib.urlencode ({'password':pwdCodificado, 'u': login, 'd':'movistar.es'})
    headers3 = {"Content-type":"application/x-www-form-urlencoded", "Accept-Encoding" : "gzip, deflate", "Host" : "copiagenda.movistar.es" , "Referer" : "https://copiagenda.movistar.es/cp/ps/Main/login/Verificacion?d=movistar.es", "Accept": "image/gif, image/x-xbitmap, image/jpeg, image/pjpeg, application/x-shockwave-flash, application/vnd.ms-excel, application/vnd.ms-powerpoint, application/msword, */*", "User-Agent" : "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.0.3705; .NET CLR 1.1.4322; Media Center PC 4.0; .NET CLR 2.0.50727)", "Accept-Language" : "es", "Cache-Control" : "no-cache", "Connection" :  "Keep-Alive", "Cookie" : cookie}
    conn3=httplib.HTTPSConnection("copiagenda.movistar.es")
    conn3.request ("POST", "/cp/ps/Main/login/Authenticate",params3, headers3)
    resp3=conn3.getresponse()
    #print resp3.status
    token = resp3.read()
    initoken=token.find("&t=")
    fintoken=token.find("\"",initoken)
    token=token[initoken:fintoken]

    ## Pedimos un exportado de los datos en fichero txt separado por tabuladores
    params4 = urllib.urlencode ({'fileFormat':'TEXT', 'charset': '8859_1', 'delimiter': 'TAB'})
    headers4 = {"Content-type":"application/x-www-form-urlencoded", "Accept-Encoding" : "gzip, deflate", "Host" : "copiagenda.movistar.es" , "Referer" : "https://copiagenda.movistar.es/cp/ps/Main/login/Verificacion?d=movistar.es", "Accept": "image/gif, image/x-xbitmap, image/jpeg, image/pjpeg, application/x-shockwave-flash, application/vnd.ms-excel, application/vnd.ms-powerpoint, application/msword, */*", "User-Agent" : "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.0.3705; .NET CLR 1.1.4322; Media Center PC 4.0; .NET CLR 2.0.50727)", "Accept-Language" : "es", "Cache-Control" : "no-cache", "Connection" :  "Keep-Alive", "Cookie" : cookie}
    conn4=httplib.HTTPSConnection("copiagenda.movistar.es")
    path4 = "/cp/ps/PSPab/preferences/ExportContacts?d=movistar.es&c=yes&u="+login+token
    conn4.request ("POST", path4 ,params4, headers4)
    resp4=conn4.getresponse()
    codHTML=resp4.read()
    #print codHTML
    ListaContactos=ParseaRespuesta (codHTML)
        
    ## dejamos todo como estaba.
    conn4.close()
    conn3.close()
    conn2.close()
    conn.close()
    return ListaContactos

def BuscaPorNombre (nombre, agenda):
    """Ejemplo de como buscar un contacto en la Lista sabiendo su nombre o parte de el
        Entrada: nombre=cadena con el nombre o parte de el.
                 agenda=lista de contactos sobre la que buscar.
        Retorna: contacto buscado con todos sus campos"""

    ## Busqueda
    for n in agenda :
        if nombre in n[3] :
            return n
    return 0
