# -*- coding: utf-8 -*-
from django.core.cache import cache
from utils import queryGET
from django.shortcuts import render_to_response
from django.http import HttpResponse
from xmlParser import *
from intExcept import HttpException
import urllib

def DESCRIPTION(request, url, value, sroffset, srlimit):
# it will show the description for the article given
	if request.method == 'GET':
		# format will set the format desired
		format = 'xml'
		# params will set the parameters in the http request
		params = {'action':'opensearch',
			'search':value.encode('utf8'),
			'format':format}
		# Get the result of the request
		response = queryGET(url, params, {})
		result = response.read()
		response.close()
		
		params = {'action' : 'query',
			  'prop' : 'links',
			  'pllimit' : 500,
			  'sroffset': sroffset,
			  'srlimit' : srlimit,
			  'titles': value.encode('utf8'),
			  'format': format}

		response = queryGET(url, params, {})
		result2 = response.read()
		response.close()
		try:
			# Parsing the xml returned
			result = parserDescription (result, result2, value)
		except:
			return HttpException("error.xml", {'code':404,
							   'description':'Mediawiki not found'})
		return render_to_response ('description.xml', result, mimetype='text/xml')
	else:
		return HttpException("error.xml", {'code':405,
                			           'description':'Method not allowed: The method allowed is GET'})


def SEARCH(request, url, value, sroffset, srlimit):
    
	if request.method == 'GET':
		params = {'action' : 'query',
			  'list' : 'search',
			  'format' : 'xml',
			  'sroffset': sroffset,
			  'srlimit': srlimit,
			  'srsearch' : value.encode('utf8')}
        
		# Get result of the request
		print url, value, sroffset, srlimit
		response = queryGET(url, params, {})
		print 'despues'
		# Parsing the results
		result = response.read()
		response.close()

		try:
			result = parserSearch(result)
		except:
			return HttpException("error.xml", {'code':404,
							   'description':'Mediawiki not found'})

		# Returning xml
		return render_to_response("search.xml", {'pages':result}, mimetype="text/xml")
	
	else:
		return HttpException("error.xml", {'code':405,
						   'description':'Method not allowed: The method allowed is GET'})
        


def CONTENTARTICLE(request, url, value):

	if request.method == 'GET':
		cache._cache.clear() # Limpia la cache	
		url = 'http://'+url+'.wikipedia.org/wiki/' + value
		userAgent = "Mozilla/5.0 (X11; U; Linux i686; es-ES; rv:1.9.0.5) Gecko/2008121621 Ubuntu/8.04 (hardy) Firefox/3.0.3;"

		# Get result of the request
		headers = {"User-Agent" : userAgent}
		response = queryGET(url, headers)

		# Parsing the results
		result = response.read()
		response.close()
		print result
		try:
			result = parserContentArticle(result)
		except:
			return HttpException("error.xml", {'code':404,
							   'description':'Wikipedia not found'})
		return render_to_response("contentArticle.xml", {'content':result}, mimetype = "text/xml")
	else:
		return HttpException("error.xml", {'code':405,
						   'description':'Method not allowed: The method allowed is GET'})
