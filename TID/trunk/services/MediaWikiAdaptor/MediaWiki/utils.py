# -*- coding: utf-8 -*-

import urllib, urllib2, httplib
import urlparse

def queryGET(url, params=None, headers={}):
    proto, host, cgi = urlparse.urlparse(url)[:3]
    conn = httplib.HTTPConnection(host)

    if params:
        conn.request ('GET', cgi +'?%s' % urllib.urlencode(params), headers)
    else:
        conn.request('GET', cgi, headers)
    response = conn.getresponse()
    return response



def queryPOST(url, params=None, headers={}):
    proto, host, cgi = urlparse.urlparse(url)[:3]
    conn = httplib.HTTPConnection(host)

    if params:
        conn.request("POST", cgi, urllib.urlencode(params), headers)
    else:
        conn.request("POST", cgi, headers)

    response = conn.getresponse()
    return response


def queryPUT(url, params=None, headers={}):
    proto, host, cgi = urlparse.urlparse(url)[:3]
    conn = httplib.HTTPConnection(host)

    if params:
        conn.request("PUT", cgi, urllib.urlencode(params), headers)
    else:
        conn.request("PUT", cgi, headers)

    response = conn.getresponse()
    return response


def queryDELETE(url, params=None, headers={}):
    proto, host, cgi = urlparse.urlparse(url)[:3]
    conn = httplib.HTTPConnection(host)

    if params:
        conn.request("DELETE", cgi, urllib.urlencode(params), headers)
    else:
        conn.request("DELETE", cgi, headers)

    response = conn.getresponse()
    return response



