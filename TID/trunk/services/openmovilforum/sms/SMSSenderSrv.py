# -*- coding: cp1252 -*-
import APISMS
import web
import sys

class view:       
    def POST(self):

        try:
            parameters = web.input()

            if (not parameters.has_key('TM_LOGIN')):
                return web.badrequest()
            login = parameters.get('TM_LOGIN')
            
            if (not parameters.has_key('TM_PASSWORD')):
                return web.badrequest()
            password = parameters.get('TM_PASSWORD')
            
            if (not parameters.has_key('to')):
                return web.badrequest()
            to = parameters.get('to')
                   
            if (not parameters.has_key('message')):
                return web.badrequest()
            message = parameters.get('message')

            smsender=APISMS.SMSSenderAPI()
            response = smsender.sendSMS(login, password, to, message)

            if response.find('OK')>=0:
                print "<html><body><span style='font-weight: bold;font-size:11pt;color:#225784;'>SMS sent succesfully!</span></body></html>"
                return
            web.ctx.status = "500 Internal Server Error"
            web.ctx.headers = [('Content-Type', 'text/html')]
            web.ctx.output = response
            return
        except Exception, e:
            web.ctx.status = "500 Internal Server Error"
            web.ctx.headers = [('Content-Type', 'text/html')]
            web.ctx.output = "<html><body>Error: %s.</body></html>" % e
            
                
        
        
