from django.http import HttpResponse
from django.core import serializers
from django.utils import simplejson
from commons.resource import Resource
from commons.utils import *
from protocols.imap import getFolderList, getFolderInfo, getMailList, getSearchMailList, getRecentMailList, getMail, getFile, getImage
import commons.error

class FolderCollection(Resource):
    def create(self, request):
        if request.POST.has_key('config'):
            config = simplejson.loads(request.POST['config'])
            if (config.__class__ == {}.__class__) and config.has_key("account") and config.has_key("host") and config.has_key("port") and config.has_key("connection") and config.has_key("username") and config.has_key("password"):
                folderList = getFolderList(config["account"].encode("utf8"), config["host"].encode("utf8"), int(config["port"]), config["connection"].encode("utf8").upper(), config["username"].encode("utf8"), config["password"].encode("utf8"))
                http_error = 200
                if (folderList.__class__ == {}.__class__) and folderList.has_key("error"):
                    http_error = commons.error.getHTTPError(folderList["error"])
                return HttpResponse(json_encode(folderList), mimetype='application/json; charset=UTF-8', status=http_error)
        return HttpResponse(commons.error.getErrorInfo(commons.error.CONFIG), mimetype='application/json; charset=UTF-8', status=commons.error.getHTTPError(commons.error.CONFIG))

class FolderInfo(Resource):
    def create(self, request):
        if request.POST.has_key('config') and request.POST.has_key('mailbox'):
            config = simplejson.loads(request.POST['config'])
            folder = request.POST['mailbox']
            if (config.__class__ == {}.__class__) and config.has_key("account") and config.has_key("host") and config.has_key("port") and config.has_key("connection") and config.has_key("username") and config.has_key("password"):
                folderList = getFolderInfo(config["account"].encode("utf8"), config["host"].encode("utf8"), int(config["port"]), config["connection"].encode("utf8").upper(), config["username"].encode("utf8"), config["password"].encode("utf8"), folder.encode("utf8"))
                http_error = 200
                if (folderList.__class__ == {}.__class__) and folderList.has_key("error"):
                    http_error = commons.error.getHTTPError(folderList["error"])
                return HttpResponse(json_encode(folderList), mimetype='application/json; charset=UTF-8', status=http_error)
        return HttpResponse(commons.error.getErrorInfo(commons.error.CONFIG), mimetype='application/json; charset=UTF-8', status=commons.error.getHTTPError(commons.error.CONFIG)) 

class MailCollection(Resource):
    def create(self, request, begin, end):
        if request.POST.has_key('config') and request.POST.has_key('mailbox'):
            config = simplejson.loads(request.POST['config'])
            folder = request.POST['mailbox']
            if (config.__class__ == {}.__class__) and config.has_key("account") and config.has_key("host") and config.has_key("port") and config.has_key("connection") and config.has_key("username") and config.has_key("password"):
                mailList = getMailList(config["account"].encode("utf8"), config["host"].encode("utf8"), int(config["port"]), config["connection"].encode("utf8").upper(), config["username"].encode("utf8"), config["password"].encode("utf8"), folder.encode("utf8"), int(begin), int(end))
                http_error = 200
                if (mailList.__class__ == {}.__class__) and mailList.has_key("error"):
                    http_error = commons.error.getHTTPError(mailList["error"])
                return HttpResponse(json_encode(mailList), mimetype='application/json; charset=UTF-8', status=http_error)
        return HttpResponse(commons.error.getErrorInfo(commons.error.CONFIG), mimetype='application/json; charset=UTF-8', status=commons.error.getHTTPError(commons.error.CONFIG))
            
class SearchMailCollection(Resource):
    def create(self, request, criterion, keyword, begin, end):
        if request.POST.has_key('config') and request.POST.has_key('mailbox'):
            config = simplejson.loads(request.POST['config'])
            folder = request.POST['mailbox']
            if (config.__class__ == {}.__class__) and config.has_key("account") and config.has_key("host") and config.has_key("port") and config.has_key("connection") and config.has_key("username") and config.has_key("password"):
                mailList = getSearchMailList(config["account"].encode("utf8"), config["host"].encode("utf8"), int(config["port"]), config["connection"].encode("utf8").upper(), config["username"].encode("utf8"), config["password"].encode("utf8"), folder.encode("utf8"), criterion.encode("utf8"), keyword.encode("utf8"), int(begin), int(end))
                http_error = 200
                if (mailList.__class__ == {}.__class__) and mailList.has_key("error"):
                    http_error = commons.error.getHTTPError(mailList["error"])
                return HttpResponse(json_encode(mailList), mimetype='application/json; charset=UTF-8', status=http_error)
        return HttpResponse(commons.error.getErrorInfo(commons.error.CONFIG), mimetype='application/json; charset=UTF-8', status=commons.error.getHTTPError(commons.error.CONFIG))

class Mail(Resource):
    def create(self, request, uid):
        if request.POST.has_key('config') and request.POST.has_key('mailbox'):
            config = simplejson.loads(request.POST['config'])
            folder = request.POST['mailbox']
            if (config.__class__ == {}.__class__) and config.has_key("account") and config.has_key("host") and config.has_key("port") and config.has_key("connection") and config.has_key("username") and config.has_key("password"):
                mail = getMail(config["account"].encode("utf8"), config["host"].encode("utf8"), int(config["port"]), config["connection"].encode("utf8").upper(), config["username"].encode("utf8"), config["password"].encode("utf8"), folder.encode("utf8"), uid.encode("utf8"))
                http_error = 200
                if (mail.__class__ == {}.__class__) and mail.has_key("error"):
                    http_error = commons.error.getHTTPError(mail["error"])
                return HttpResponse(json_encode(mail), mimetype='application/json; charset=UTF-8', status=http_error)
        return HttpResponse(commons.error.getErrorInfo(commons.error.CONFIG), mimetype='application/json; charset=UTF-8', status=commons.error.getHTTPError(commons.error.CONFIG))
        
        
class File(Resource):
    def create(self, request, uid):
        if request.POST.has_key('config') and request.POST.has_key('mailbox') and request.POST.has_key('filename'):
            config = simplejson.loads(request.POST['config'])
            folder = request.POST['mailbox']
            filename = request.POST['filename']
            if (config.__class__ == {}.__class__) and config.has_key("account") and config.has_key("host") and config.has_key("port") and config.has_key("connection") and config.has_key("username") and config.has_key("password"):
                mail = getFile(config["account"].encode("utf8"), config["host"].encode("utf8"), int(config["port"]), config["connection"].encode("utf8").upper(), config["username"].encode("utf8"), config["password"].encode("utf8"), folder.encode("utf8"), uid.encode("utf8"), filename.encode("utf8"))
                http_error = 200
                if (mail.__class__ == {}.__class__) and mail.has_key("error"):
                    http_error = commons.error.getHTTPError(mail["error"])
                    return HttpResponse(json_encode(mail), mimetype='application/json; charset=UTF-8', status=http_error)
                else:
                    myfile = mail["file"][0]
                    response = HttpResponse(myfile["data"], mimetype = myfile["content_type"], status=http_error)
                    response["Content-Disposition"] = "attachment; filename=\"" + myfile["filename"] + "\""
                    response["Content-Description"] = "File Transfer"
                    response["Content-Length"] = myfile["size"]
                    return response
        return HttpResponse(commons.error.getErrorInfo(commons.error.CONFIG), mimetype='application/json; charset=UTF-8', status=commons.error.getHTTPError(commons.error.CONFIG))
        
class Image(Resource):
    def create(self, request, uid):
        if request.POST.has_key('config') and request.POST.has_key('mailbox') and request.POST.has_key('imageid'):
            config = simplejson.loads(request.POST['config'])
            folder = request.POST['mailbox']
            imageid = request.POST['imageid']
            if (config.__class__ == {}.__class__) and config.has_key("account") and config.has_key("host") and config.has_key("port") and config.has_key("connection") and config.has_key("username") and config.has_key("password"):
                mail = getImage(config["account"].encode("utf8"), config["host"].encode("utf8"), int(config["port"]), config["connection"].encode("utf8").upper(), config["username"].encode("utf8"), config["password"].encode("utf8"), folder.encode("utf8"), uid.encode("utf8"), imageid.encode("utf8"))
                http_error = 200
                if (mail.__class__ == {}.__class__) and mail.has_key("error"):
                    http_error = commons.error.getHTTPError(mail["error"])
                    return HttpResponse(json_encode(mail), mimetype='application/json; charset=UTF-8', status=http_error)
                else:
                    myfile = mail["file"][0]
                    response = HttpResponse("data:" + myfile["content_type"] + ";base64," + myfile["data"], mimetype="application/octet-stream", status=http_error)
                    return response
        return HttpResponse(commons.error.getErrorInfo(commons.error.CONFIG), mimetype='application/json; charset=UTF-8', status=commons.error.getHTTPError(commons.error.CONFIG))

class RecentMailCollection(Resource):
    def create(self, request, begin, end):
        if request.POST.has_key('config'):
            config = simplejson.loads(request.POST['config'])
            if (config.__class__ == {}.__class__) and config.has_key("account") and config.has_key("host") and config.has_key("port") and config.has_key("connection") and config.has_key("username") and config.has_key("password"):
                mailList = getRecentMailList(config["account"].encode("utf8"), config["host"].encode("utf8"), int(config["port"]), config["connection"].encode("utf8").upper(), config["username"].encode("utf8"), config["password"].encode("utf8"), int(begin), int(end))
                http_error = 200
                if (mailList.__class__ == {}.__class__) and mailList.has_key("error"):
                    http_error = commons.error.getHTTPError(mailList["error"])
                return HttpResponse(json_encode(mailList), mimetype='application/json; charset=UTF-8', status=http_error)
        return HttpResponse(commons.error.getErrorInfo(commons.error.CONFIG), mimetype='application/json; charset=UTF-8', status=commons.error.getHTTPError(commons.error.CONFIG))

