from django.http import HttpResponse
from django.template.loader import render_to_string

def HttpException (file, info):
	rendered = render_to_string (file, info)
	return HttpResponse (rendered, status=info['code'],mimetype='text/xml')

class Error (Exception):
	def __init__(self, value, code):
		self.value = value
		self.code = code
	def __str__ (self):
		return repr(code + ': ' + self.value)
