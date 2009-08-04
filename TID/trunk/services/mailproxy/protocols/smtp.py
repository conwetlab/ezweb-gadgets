#!/usr/bin/python
import sys
import os
#import os.path
import smtplib
import mimetypes
import commons.error
from email.mime.audio import MIMEAudio
from email.mime.base import MIMEBase
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from email import encoders
from protocols.smtp_utils.utils import removeFiles

class SMTPClient:

    def __init__(self, host, port, connection, username, password):
        
        self.username = username
        self.password = password
        self.port = port
        self.connection = connection
        self.host = host
        
        self.smtp = None

    	self.response = []
    	
    	self.error = 0

    def login(self):
    	try:
    	    if (self.connection == "SSL"):
                self.smtp = smtplib.SMTP_SSL(self.host, self.port)
            else:
                self.smtp = smtplib.SMTP(self.host, self.port)
    	except:
    	    self.error = commons.error.SERVER
    	    return False
    	try:
    	    if (self.connection == "TLS"):
    	        self.smtp.ehlo()
                self.smtp.starttls()
                self.smtp.ehlo()
    	except:
    	    self.error = commons.error.TLS
    	    return False
    	try:
    	    self.smtp.login(self.username, self.password)
    	except:
    	    self.error = commons.error.LOGIN
    	    return False
    	return True

    def logout(self):
    	try:
            self.smtp.quit()
        except:
    	    pass
    	    
    def sendMail(self, subject, message, message_html, from_mail, to_mails, cc_mails, bcc_mails, attachments):
        msg = MIMEMultipart('mixed')
        msg['Subject'] = subject
        msg['From'] = from_mail
        
        if (len(to_mails) > 0):
            msg['To'] = ", ".join(to_mails)
        if (len(cc_mails) > 0):
            msg['Cc'] = ", ".join(cc_mails)
        if (len(bcc_mails) > 0):
            msg['Bcc'] = ", ".join(bcc_mails)
	
        if message != None and message_html != None:
            msgtext = MIMEMultipart('alternative')
            msg.attach(msgtext)
        else:
            msgtext = msg

        if (message != None):
            part1 = MIMEText(message, 'plain')
            msgtext.attach(part1)
        
        if (message_html != None):
            part2 = MIMEText(message_html, 'html')
            msgtext.attach(part2)
        
        ############# Attach files #############
        for filename in attachments["files"]:
            if not os.path.isfile(filename):
                continue
            ctype, encoding = mimetypes.guess_type(filename)
            if ctype is None or encoding is not None:
                ctype = 'application/octet-stream'
            maintype, subtype = ctype.split('/', 1)
            mimefile = None
            if maintype == 'text':
                fp = open(filename)
                mimefile = MIMEText(fp.read(), _subtype=subtype)
                fp.close()
            elif maintype == 'image':
                fp = open(filename, 'rb')
                mimefile = MIMEImage(fp.read(), _subtype=subtype)
                fp.close()
            elif maintype == 'audio':
                fp = open(filename, 'rb')
                mimefile = MIMEAudio(fp.read(), _subtype=subtype)
                fp.close()
            elif maintype == 'application':
                fp = open(filename, 'rb')
                mimefile = MIMEApplication(fp.read(), _subtype=subtype)
                fp.close()
            else:
                fp = open(filename, 'rb')
                mimefile = MIMEBase(maintype, subtype)
                mimefile.set_payload(fp.read())
                fp.close()
                encoders.encode_base64(mimefile)

            mimefile.add_header('Content-Disposition', 'attachment', filename=os.path.basename(filename))
            msg.attach(mimefile)

        ############# Send mail #############
        try: 
            self.smtp.sendmail(from_mail, to_mails + cc_mails + bcc_mails, msg.as_string())
            removeFiles(attachments["path"])
        except:
    	    self.error = commons.error.SMTP_SEND
    	    removeFiles(attachments["path"])
            return False
        return True


def sendMail(account, host, port, connection, username, password, subject, message, message_html, to_mails, cc_mails, bcc_mails, attachments):
    ok = True
    smtp = SMTPClient(host, port, connection, username, password)
    ok = smtp.login()
    if ok:
        ok = smtp.sendMail(subject, message, message_html, account, to_mails, cc_mails, bcc_mails, attachments)
    smtp.logout()
    
    if ok:
        return {"sended": ok, "account": account}
    else:
        error = commons.error.getErrorInfo(smtp.error)
        return {"error":error["error"], "message":error["message"], "account": account}
    
