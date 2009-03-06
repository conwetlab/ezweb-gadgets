# -*- coding: cp1252 -*-
from mms import MMSSenderAPI
import web
import sys

class view:       
    def POST(self):

        try:
            parameters = web.input(objectFile={})
            if (not parameters.has_key('login')):
                return web.badrequest()
            login = parameters.get('login')
            
            if (not parameters.has_key('password')):
                return web.badrequest()
            password = parameters.get('password')
            
            if (not parameters.has_key('to')):
                return web.badrequest()
            to = parameters.get('to')
            
            if (not parameters.has_key('objectURL')):
                return web.badrequest()
            
            if (not parameters.has_key('objectFile')):
                return web.badrequest()
            
            if (len(parameters.get('objectFile').filename) > 0):
                objectFile = parameters.get('objectFile')
                objectURL = None
            elif (len(parameters.get('objectURL')) > 0):
                objectURL = parameters.get('objectURL')
                objectFile = None
            else:
                return web.badrequest()
                    
            
            if (not parameters.has_key('subject')):
                return web.badrequest()
            subject = parameters.get('subject')
            
            if (not parameters.has_key('message')):
                return web.badrequest()
            message = parameters.get('message')
            mmsender=MMSSenderAPI.MMSSender()
            if objectURL:
                response = mmsender.SendMMSWithURL(login, password, objectURL, subject, to, message)
            else:
                response = mmsender.SendMMSWithFile(login, password, objectFile.value, objectFile.filename, subject, to, message)

            if response.find('Tu mensaje ha sido enviado')>=0:
                print "<html><body><img src='http://demo.ezweb.morfeo-project.org/omf/static/tick.gif'/><script>window.parent.clearFields()</script></body></html>"
                return
            print "<html><body><img src='http://demo.ezweb.morfeo-project.org/omf/static/cross.gif'/></body></html>"
        except Exception, e:
            web.ctx.status = "500 Internal Server Error"
            web.ctx.headers = [('Content-Type', 'text/html')]
            web.ctx.output = "<html><body><img src='http://demo.ezweb.morfeo-project.org/omf/static/cross.gif'/></body></html>"
            
                
        
        
