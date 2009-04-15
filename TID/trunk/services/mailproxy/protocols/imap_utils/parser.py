import re
import email
from protocols.imap_utils.encoding import *

def wrap(text, width):
    return reduce(lambda line, word, width=width: '%s%s%s' %
        (line,
         ' \n'[(len(line)-line.rfind('\n')-1
             + len(word.split('\n',1)[0]
                 ) >= width)],
         word),
         text.split(' ')
        )

def parseMailbox(mailbox):
    
    mailbox_regexp = re.compile('\s*\((.*)\)\s+"(.+)"\s+("(.+)"|(.+))\s*')

    result = {}
    result["flags"] = []
    result["name"] = ""
    result["separator"] = "."
    
    match = mailbox_regexp.match(mailbox)
    
    if match != None:
        if (match.group(1) != None):
            result["flags"] = match.group(1).split(" ")
        if (match.group(2) != None):
            result["separator"] = match.group(2)
        if (match.group(4) != None):
            result["name"] = imapUTF7Decode(match.group(4))
        elif (match.group(5) != None):
            result["name"] = imapUTF7Decode(match.group(5))
                 
    return result

def parseMailList(mails):
    
    email_regexp = '\S+[\.\S+]*@\S+[\.\S+]+'
    full_email_regexp = re.compile('\s*(("(.*)"\s*|(.*)\s*|)<(' + email_regexp + ')>|(' + email_regexp + '))\s*')

    result = []
     
    for m in mails.split(","):
        match = full_email_regexp.match(m)
        
        mail = {}
        mail["mail"] = ""
        mail["name"] = ""
    
        if match != None:
            if (match.group(5) != None):
                mail["mail"] = mime_decode(match.group(5))
                if (match.group(3) != None):
                    mail["name"] = mime_decode(match.group(3))
                elif (match.group(4) != None):
                    mail["name"] = mime_decode(match.group(4))	
    	    elif (match.group(6) != None):
                mail["mail"] = mime_decode(match.group(6))
                mail["name"] = mime_decode(match.group(6))
                 
            result.append(mail)
    return result

def parseMailHeader(header):
    
    regexp1 = re.compile(".*UID\s+(\d+)\s+RFC822\.SIZE\s+(\d+)\s+FLAGS\s+\(([^)]*)\).*")
    match = regexp1.match(header[0])
    
    result = {}
    result["uid"] = int(match.group(1))
    result["size"] = int(match.group(2))
    result["flags"] = match.group(3).split(" ")
  
    msg = email.message_from_string(header[1])
    if msg.has_key("subject"):
        result["subject"] = mime_decode(msg["subject"])
    if msg.has_key("date"):
        result["date"] = mime_decode(msg["date"])
    if msg.has_key("from"):
        mails = parseMailList(msg["from"])
        if (len(mails) > 0):
            result["from"] = mails[0]
    if msg.has_key("to"):
        result["to"] = parseMailList(msg["to"])
    if msg.has_key("cc"):
        result["cc"] = parseMailList(msg["cc"])
         
    return result

def parseMail(message):

    regexp1 = re.compile(".*UID\s+(\d+)\s+RFC822\.SIZE\s+(\d+)\s+.*") #FLAGS\s+\(([^)]*)\).*")
    match = regexp1.match(message[0])

    result = {}
    result["uid"] = int(match.group(1))
    result["size"] = int(match.group(2))
    #result["flags"] = match.group(3).split(" ")

    msg = email.message_from_string(message[1])
    
    isPlain = False
    result["text_plain"] = ""
    result["text_html"] = ""

    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/plain":
                result["text_plain"] += wrap(get_part_content(part), 80)
            elif part.get_content_type() == "text/html":
                result["text_html"] += get_part_content(part)
    else:
        if msg.get_content_type() == "text/plain":
            result["text_plain"] += wrap(get_part_content(msg), 80)
        elif msg.get_content_type() == "text/html":
            result["text_html"] += get_part_content(msg)
    
    if msg.has_key("subject"):
        result["subject"] = mime_decode(msg["subject"])
    if msg.has_key("date"):
        result["date"] = mime_decode(msg["date"])
    if msg.has_key("from"):
        mails = parseMailList(msg["from"])
        if (len(mails) > 0):
            result["from"] = mails[0]
    if msg.has_key("to"):
        result["to"] = parseMailList(msg["to"])
    if msg.has_key("cc"):
        result["cc"] = parseMailList(msg["cc"])
    
    return result
