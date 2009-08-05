import os
import re
import email
from protocols.imap_utils.encoding import *
from struct import pack

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
    if msg.has_key("content-type"):
        result["attachment"] = (msg.get_content_type() == "multipart/mixed");
         
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
    result["files"] = []
    result["contentids"] = []

    if msg.is_multipart():
    
        parsePart(msg, result)
        counter = 1
        for part in msg.walk():
            if not part.is_multipart():
            
                contentid = part.get('Content-id')
                if (contentid != None) and (len(contentid) > 2):
                    result["contentids"].append(contentid[1:len(contentid)-1])  # TODO Mejorar con expresion regular

                if part.get('Content-Disposition') != None:
                    # this part is an attachment
                    filename = part.get_filename()
                    if not filename:
                        filename = 'part-%03d' % (counter)
                        counter += 1
                    filecontent = part.get_payload(decode=True)
                    size = 0
                    try:
                        size = (len(filecontent) * len(pack("c", filecontent[0])))
                    except:
                        pass
                    result["files"].append({"filename": filename, "size": size})
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

def parsePart(part, resp):
    if part.is_multipart():
        subparts = part.get_payload()
        if part.get_content_subtype() == "alternative":
            candidate = None
            for subpart in subparts:
                candidate = subpart
                if subpart.get_content_type() != "text/plain":
                    break
            if candidate != None:
                parsePart(candidate, resp)
        else:
            for subpart in subparts:
                parsePart(subpart, resp)
                  
    elif (part.get('Content-Disposition') == None) or ((part.get('Content-Disposition') == 'inline') and not part.get_filename()):
        if part.get_content_type() == "text/plain":
            resp["text_html"] += "<pre>" + wrap(get_part_content(part), 80) + "</pre>"
        elif part.get_content_type() == "text/html":
            resp["text_html"] += get_part_content(part)
    
    
def parseFile(message, fileid):

    result = {}
    msg = email.message_from_string(message[1])
    if msg.is_multipart():
        counter = 1
        # we use walk to create a generator so we can iterate on the parts and forget about the recursive headach
        for part in msg.walk():
            if not part.is_multipart():
                if part.get('Content-Disposition') != None:
                    filename = part.get_filename()
                    if not filename:
                        filename = 'part-%03d' % (counter)
                        counter += 1
                    
                    if filename == fileid:
                        result["filename"] = filename
                        result["data"] = part.get_payload(decode=True)
                        result["content_type"] = part.get_content_type()
                        size = 0
                        try:
                            size = (len(result["data"]) * len(pack("c", result["data"][0])))
                        except:
                            pass
                        result["size"] = size
                        break
                    
    return result
    
def parseImage(message, imageid):

    result = {}
    msg = email.message_from_string(message[1])
    if msg.is_multipart():
        counter = 1
        # we use walk to create a generator so we can iterate on the parts and forget about the recursive headach
        for part in msg.walk():
            if not part.is_multipart():
            
                contentid = part.get('Content-id')
                if (contentid != None) and (len(contentid) > 2):
                    contentid = contentid[1:len(contentid)-1]
                    
                    if (contentid == imageid):
                        result["data"] = part.get_payload()
                        result["content_type"] = part.get_content_type()
                        break
                    
    return result
