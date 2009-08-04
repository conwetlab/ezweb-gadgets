from os import path
from django.conf.urls.defaults import patterns, include
from django.conf import settings

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    
    # IMAP
    (r'^mailproxy/imap', include('imap.urls')),
    
    # SMTP
    (r'^mailproxy/smtp', include('smtp.urls')),
)
