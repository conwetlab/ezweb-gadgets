# -*- coding: cp1252 -*-
import web
import APICopiagenda
from utils import json
class view:       
    def GET(self):

        parameters = web.input()
        
        if (not parameters.has_key('login')):
            return web.badrequest()
        login = parameters.get('login')
        
        if (not parameters.has_key('password')):
            return web.badrequest()
        password = parameters.get('password')
        
        try:
            agenda = APICopiagenda.RecuperaContactos(login, password)
            
            print json.JsonWriter().write(agenda)
            
        except Exception, e:
            web.ctx.status = "500 Internal Server Error"
            web.ctx.headers = [('Content-Type', 'text/html')]
            web.ctx.output = "Message not sent: %s." % e
        
