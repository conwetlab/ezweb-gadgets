# -*- coding: cp1252 -*-
import web
class view:       
    def GET(self):

        parameters = web.input()
        
        if (not parameters.has_key('name')):
		print "OK"
		return
        name = parameters.get('name')
        web.header("Content-Type","text/xml; charset=utf-8") 
        print "<message>Hello, " + name + "!</message>"
