#!/usr/bin/python
import sys
import smtplib
import commons.error
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

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
    	    
    def sendMail(self, subject, message, message_html, from_mail, to_mails, cc_mails, bcc_mails):
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = from_mail
        
        if (len(to_mails) > 0):
            msg['To'] = ", ".join(to_mails)
        if (len(cc_mails) > 0):
            msg['Cc'] = ", ".join(cc_mails)
        if (len(bcc_mails) > 0):
            msg['Bcc'] = ", ".join(bcc_mails)
	
        if (message != None):
            part1 = MIMEText(message, 'plain')
            msg.attach(part1)
        
        if (message_html != None):
            part2 = MIMEText(message_html, 'html')
            msg.attach(part2)
        
        try:
            self.smtp.sendmail(from_mail, to_mails + cc_mails + bcc_mails, msg.as_string())
        except:
    	    self.error = commons.error.SMTP_SEND
            return False
        return True


def sendMail(account, host, port, connection, username, password, subject, message, message_html, to_mails, cc_mails, bcc_mails):
    ok = True
    smtp = SMTPClient(host, port, connection, username, password)
    ok = smtp.login()
    if ok:
        ok = smtp.sendMail(subject, message, message_html, account, to_mails, cc_mails, bcc_mails)
    smtp.logout()
    
    if ok:
        return {"sended": ok, "account": account}
    else:
        error = commons.error.getErrorInfo(smtp.error)
        return {"error":error["error"], "message":error["message"], "account": account}
    
