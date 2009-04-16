# -*- coding: utf-8 -*-

from django.conf.urls.defaults import *

urlpatterns = patterns('',
                       # Get description article 
                       (r'^MediaWikiAdaptor/(?P<url>.+)/description/(?P<value>.+)/(?P<sroffset>.+)/(?P<srlimit>.+)/$', 'MediaWikiAdaptor.MediaWiki.views.DESCRIPTION'),

                       # Get articles
                       (r'^MediaWikiAdaptor/(?P<url>.+)/search/(?P<value>.+)/(?P<sroffset>.+)/(?P<srlimit>.+)/$', 'MediaWikiAdaptor.MediaWiki.views.SEARCH'),

                       # Get content article
                       (r'^MediaWikiAdaptor/(?P<url>.+)/content/(?P<value>.+)/$', 'MediaWikiAdaptor.MediaWiki.views.CONTENTARTICLE'),
)
