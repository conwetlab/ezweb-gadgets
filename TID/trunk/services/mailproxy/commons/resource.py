# -*- coding: utf-8 -*-
import sys
import traceback

from commons.utils import *

from django.http import Http404, HttpResponse, HttpResponseNotAllowed, HttpResponseServerError, QueryDict
from django.utils import datastructures

class HttpMethodNotAllowed(Exception):
    """
    Signals that request.method was not part of
    the list of permitted methods.
    """    

class Resource:
    def __init__(self, authentication=None, permitted_methods=None, mimetype=None):
        
        if not permitted_methods:
            permitted_methods = ["GET"]
        
        self.permitted_methods = [m.upper() for m in permitted_methods]
        
        self.mimetype = mimetype
    
    def __call__(self, request, *args, **kwargs):      
        try:
            return self.dispatch(request, self, *args, **kwargs)
        except HttpMethodNotAllowed:
            response = HttpResponseNotAllowed(self.permitted_methods)
            response.mimetype = self.mimetype
            return response
        except:
            exc_info = sys.exc_info()
            msg_array = traceback.format_exception(exc_info[0], exc_info[1], exc_info[2])
            msg = ""
            for line in msg_array:
              msg += line

            msg = "[" + unicode(exc_info[0]) + "] " + unicode(exc_info[1])
            return HttpResponseServerError(json_encode(get_error_object(msg)), mimetype='application/json; charset=UTF-8')
    
    def adaptRequest(self, request):
        request._post, request._files = QueryDict(request.raw_post_data, encoding=request._encoding), datastructures.MultiValueDict()
        
        return request
    
    def dispatch(self, request, target, *args, **kwargs):
        request_method = request.method.upper()

        if request_method not in self.permitted_methods:
            raise HttpMethodNotAllowed

        if request_method == 'GET':
            return target.read(request, *args, **kwargs)
        elif request_method == 'POST':
            #PUT and DELETE request are wrapped in a POST request
            #Asking about request type it's needed here!
            if request.POST.has_key('_method'):
                _method = request.POST['_method'].upper()
                if _method == 'DELETE':
                    request = self.adaptRequest(request)
                    return target.delete(request, *args, **kwargs)
                elif _method == 'PUT':
                    request = self.adaptRequest(request)
                    return target.update(request, *args, **kwargs)
            
            #It's a real POST request!
            return target.create(request, *args, **kwargs)
        elif request_method == 'PUT':
            request = self.adaptRequest(request)
            return target.update(request, *args, **kwargs)
        elif request_method == 'DELETE':
            request = self.adaptRequest(request)
            return target.delete(request, *args, **kwargs)
        else:
            raise Http404
    
