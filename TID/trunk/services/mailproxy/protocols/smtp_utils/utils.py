import tempfile
import shutil
import os
import httplib, urllib, urlparse
import mimetypes

def createFiles(files):
    fileList = {}
    fileList["path"] = tempfile.mkdtemp() #(dir="/tmp")
    fileList["files"] = []
    for f in files:
        requestfile = files[f]
        try:
            newfile = file(os.path.join(fileList["path"], requestfile.name), "w")
            shutil.copyfileobj(requestfile, newfile)
            fileList["files"].append(newfile.name)
            requestfile.close()
            newfile.close()
        except Exception, e:
            requestfile.close()
    return fileList

def removeFiles(path):
    for root, dirs, files in os.walk(path, topdown=False):
       for name in files:
           os.remove(os.path.join(root, name))
       for name in dirs:
           os.rmdir(os.path.join(root, name))
       os.rmdir(path)

def merge(dict1, dict2):
    for key in dict2.keys():
        dict1[key] = dict2[key]
    return dict1

def encode_multipart_data(filename, content):
    body = content
    content_type = getContentType(filename)
    header = {'Content-Type':content_type+"; charset=utf-8",
              'content-length':str(len(body)),
              'Content-Transfer-Encoding':"base64"}
    return body, header

def queryGET(url, body=None, headers={}):
    # Request Info
    request = urlparse.urlparse(url)
    conn = httplib.HTTPConnection(request.netloc)
    if (request.query != ""):
        params = "?%s" % request.query
        conn.request("GET", request.path + params, body, headers)
    else:
        conn.request("GET", request.path, body, headers)
    response = conn.getresponse()
    return response
    

def queryPUT(url, body=None,  headers={}, files=[]):
    request = urlparse.urlparse(url)
    conn = httplib.HTTPConnection(request.netloc)

    if files:
        for filename, content in files:
            body, header = encode_multipart_data(filename, content)
            headers = merge(headers,header)
            conn.request("PUT", request.path + filename, body, headers)
            response = conn.getresponse()
            if (response.status >= 300):
                raise Exception("Error: %s, Problem when it was uploading: %s" % (response.status, filename))
    else:
        conn.request("PUT", request.path, body, headers)
        response = conn.getresponse()
        if response.status != 200:
            return False
        return response

def downloadFile(url, path):
    response = queryGET(url)
    if response.status != 200:
        return False
    f = open(path, "w")
    f.write(response.read())
    f.close()
    return True
    
def uploadFiles(url, files):
    try:
        print files
        response = queryPUT(url, None, {}, files)
        return response
    except:
        return False
        
def getContentType(filename):
    return mimetypes.guess_type(filename)[0] or 'application/octet-stream'
