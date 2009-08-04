from django.http import HttpResponse
from django.core import serializers
from django.utils import simplejson
from commons.resource import Resource
from commons.utils import *
from protocols.smtp import sendMail
import commons.error
from protocols.smtp_utils.utils import createFiles

class SendMail(Resource):
    def create(self, request):
        if request.POST.has_key('config') and request.POST.has_key('destination'):
            config = simplejson.loads(request.POST['config'])
            destination = simplejson.loads(request.POST['destination'])
            attachments = createFiles(request.FILES)
            if (config.__class__ == {}.__class__) and (destination.__class__ == {}.__class__) and config.has_key("name") and config.has_key("account") and config.has_key("host") and config.has_key("port") and config.has_key("connection") and config.has_key("username") and config.has_key("password") and destination.has_key("subject") and (destination.has_key("message") or destination.has_key("message_html")) and (destination.has_key("to") or destination.has_key("cc") or destination.has_key("bcc")):
            
                to_mails = []
                if destination.has_key("to"):
                    if destination["to"].__class__ != [].__class__:
                        return HttpResponse(commons.error.getErrorInfo(commons.error.SMTP_TO), mimetype='text/plain; charset=UTF-8', status=commons.error.getHTTPError(commons.error.SMTP_TO))
                    for to in destination["to"]:
                        to_mails.append(to.encode("utf8"))

                cc_mails = []
                if destination.has_key("cc"):
                    if destination["cc"].__class__ != [].__class__:
                        return HttpResponse(commons.error.getErrorInfo(commons.error.SMTP_CC), mimetype='text/plain; charset=UTF-8', status=commons.error.getHTTPError(commons.error.SMTP_CC))
                    for cc in destination["cc"]:
                        cc_mails.append(cc.encode("utf8"))

                bcc_mails = []
                if destination.has_key("bcc"):
                    if destination["bcc"].__class__ != [].__class__:
                        return HttpResponse(commons.error.getErrorInfo(commons.error.SMTP_BCC), mimetype='text/plain; charset=UTF-8', status=commons.error.getHTTPError(commons.error.SMTP_BCC))
                    for bcc in destination["bcc"]:
                        bcc_mails.append(bcc.encode("utf8"))
                
                message = None
                message_html = None
                if destination.has_key("message"):
                    message = destination["message"].encode("utf8")
                if destination.has_key("message_html"):
                    message_html = destination["message_html"].encode("utf8")

                sended = sendMail(config["name"].encode("utf8") + " <" + config["account"].encode("utf8") + ">", config["host"].encode("utf8"), int(config["port"]), config["connection"].encode("utf8").upper(), config["username"].encode("utf8"), config["password"].encode("utf8"), destination["subject"].encode("utf8"), message, message_html, to_mails, cc_mails, bcc_mails, attachments)
                http_error = 200
                if (sended.__class__ == {}.__class__) and sended.has_key("error"):
                    http_error = commons.error.getHTTPError(sended["error"])
                return HttpResponse(json_encode(sended), mimetype='text/plain; charset=UTF-8', status=http_error)
        return HttpResponse(commons.error.getErrorInfo(commons.error.CONFIG), mimetype='text/plain; charset=UTF-8', status=commons.error.getHTTPError(commons.error.CONFIG)) 

