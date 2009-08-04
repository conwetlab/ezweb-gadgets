#!/usr/bin/python
import sys
import email.header
import imaplib
import quopri
import commons.error
from protocols.imap_utils.encoding import *
from protocols.imap_utils.parser import *

class IMAP4Client:

    def __init__(self, host, port, connection, username, password):
        
        self.username = username
        self.password = password
        self.port = port
        self.connection = connection
        self.host = host
        
        self.imap = None

    	self.response = []
    	self.size = 0
    	
    	self.error = 0

    def login(self):
    	try:
    	    if (self.connection == "SSL"):
                self.imap = imaplib.IMAP4_SSL(self.host, self.port)
            else:
                self.imap = imaplib.IMAP4(self.host, self.port)
    	except:
    	    self.error = commons.error.SERVER
    	    return False
    	try:
    	    self.imap.login(self.username, self.password)
    	except:
    	    self.error = commons.error.LOGIN
    	    return False
    	return True

    def logout(self):
    	try:
            self.imap.close()
        except:
    	    pass
    	try:
            self.imap.logout()
    	except:
    	    pass

    def getFolderList(self):
        folders = self.imap.list()
        self.response = []

        if (folders[0] == "OK"):
            for i in range(len(folders[1])):
                self.response.append(parseMailbox(folders[1][i]))
            return True
        else:
            self.error = commons.error.IMAP_MAILBOX_LIST
            return False
    
    def getFolderInfo(self, foldername):
        folder_info = self.imap.status(foldername, "(MESSAGES RECENT UNSEEN)")
        self.response = []
        if (folder_info[0] == "OK"):
            folder_info = ((folder_info[1][0].split('(')[1]).split(')')[0]).split(" ")
            self.response = {"name": foldername, "messages": folder_info[1], "recent": folder_info[3], "unseen": folder_info[5]}
            return True
        else:
            self.error = commons.error.IMAP_MAILBOX_INFO
            return False
    
    def getSearchMailList(self, foldername, criterion, keyword_, begin, end):
        keyword = ""
        if (keyword_ != None):
            keyword = quopri.encodestring(keyword_)
	
        self.response = []
        
        select_response = self.imap.select(imapUTF7Encode(foldername.decode("utf8")), True)
        if (select_response[0] != "OK"):
            self.error = commons.error.IMAP_SELECT
            return False

        if (criterion == "ALL"):
            query = '(ALL)'
        elif (criterion == "RECENT"):
            query = '(UNSEEN)'
        elif (criterion == "SUBJECT"):
            query = '(SUBJECT ' + keyword + ')'
        elif (criterion == "FROM"):
            query = '(FROM ' + keyword + ')'
        elif (criterion == "SUBJECT_OR_FROM"):
            query = '(OR SUBJECT ' + keyword + ' FROM ' + keyword + ')'
        elif (criterion == "TO_OR_CC"):
            query = '(OR TO ' + keyword + ' CC ' + keyword + ')'
        else:
            query = '(BODY ' + keyword + ')'

        search_response = self.imap.search(None, query)

        if (search_response[0] != "OK"):
            self.error = commons.error.IMAP_SEARCH
            return False

        if (search_response[1][0] == ""):
    	    # No hay mensajes
            return True
            
        message_list = search_response[1][0].split(" ")
        self.size = len(message_list)
        message_list.reverse()
        
        fetch_response = self.imap.fetch(",".join([str(i) for i in message_list[(begin-1):end]]), "(UID RFC822.SIZE FLAGS BODY[HEADER.FIELDS (DATE FROM TO CC BCC SUBJECT CONTENT-TYPE)])")
	
        if (fetch_response[0] != "OK"):
            self.error = commons.error.IMAP_FETCH
            return False
	
        fetch_response[1].reverse()
	
        for i in range(len(fetch_response[1])):
            if fetch_response[1][i].__class__ == ().__class__:
                msg = parseMailHeader(fetch_response[1][i])
                self.response.append(msg)
        return True

    def getMail(self, foldername, uid):

        self.response = []
        select_response = self.imap.select(imapUTF7Encode(foldername.decode("utf8")), False)
        if (select_response[0] != "OK"):
            self.error = commons.error.IMAP_SELECT
            return False

        search_response = self.imap.search(None, "(UID " + uid + ")")
        
        if (search_response[0] != "OK"):
            self.error = commons.error.IMAP_SEARCH
            return False
        elif (search_response[1][0] == ""):
    	    self.error = commons.error.IMAP_MESSAGE
            return False
        
        message_id = search_response[1][0]
        
        fetch_response = self.imap.fetch(message_id, "(UID RFC822.SIZE RFC822)")

        if (fetch_response[0] != "OK"):
            self.error = commons.error.IMAP_FETCH
            return False
	
        msg = parseMail(fetch_response[1][0])
        self.response.append(msg)
        return True
            
    def getFile(self, foldername, uid, filename):
        
        self.response = []
        select_response = self.imap.select(imapUTF7Encode(foldername.decode("utf8")), False)
        if (select_response[0] != "OK"):
            self.error = commons.error.IMAP_SELECT
            return False

        search_response = self.imap.search(None, "(UID " + uid + ")")
        
        if (search_response[0] != "OK"):
            self.error = commons.error.IMAP_SEARCH
            return False
        elif (search_response[1][0] == ""):
    	    self.error = commons.error.IMAP_MESSAGE
            return False
        
        message_id = search_response[1][0]
        
        fetch_response = self.imap.fetch(message_id, "(RFC822)")

        if (fetch_response[0] != "OK"):
            self.error = commons.error.IMAP_FETCH
            return False
	
        msg = parseFile(fetch_response[1][0], filename)
        if msg.has_key("filename"):
            self.response.append(msg)
            return True
        else:
            self.error = commons.error.IMAP_FILE
            return False
            
            
    def getImage(self, foldername, uid, imageid):
        
        self.response = []
        select_response = self.imap.select(imapUTF7Encode(foldername.decode("utf8")), False)
        if (select_response[0] != "OK"):
            self.error = commons.error.IMAP_SELECT
            return False

        search_response = self.imap.search(None, "(UID " + uid + ")")
        
        if (search_response[0] != "OK"):
            self.error = commons.error.IMAP_SEARCH
            return False
        elif (search_response[1][0] == ""):
    	    self.error = commons.error.IMAP_MESSAGE
            return False
        
        message_id = search_response[1][0]
        
        fetch_response = self.imap.fetch(message_id, "(RFC822)")

        if (fetch_response[0] != "OK"):
            self.error = commons.error.IMAP_FETCH
            return False
	
        msg = parseImage(fetch_response[1][0], imageid)
        if msg.has_key("data"):
            self.response.append(msg)
            return True
        else:
            self.error = commons.error.IMAP_FILE
            return False
                
def getFolderList(account, host, port, connection, username, password):
    ok = True
    imap = IMAP4Client(host, port, connection, username, password)
    ok = imap.login()
    if ok:
        ok = imap.getFolderList()
    imap.logout()
    if ok:
        return {"folderList": imap.response, "account": account}
    else:
        error = commons.error.getErrorInfo(imap.error)
        return {"error":error["error"], "message":error["message"], "account": account}

def getFolderInfo(account, host, port, connection, username, password, foldername):
    ok = True
    imap = IMAP4Client(host, port, connection, username, password)
    ok = imap.login()
    if ok:
        ok = imap.getFolderInfo(foldername)
    imap.logout()
    if ok:
        return {"folder": imap.response, "account": account, "mailbox": foldername}
    else:
        error = commons.error.getErrorInfo(imap.error)
        return {"error":error["error"], "message":error["message"], "account": account, "mailbox": foldername}

    
def getMailList(account, host, port, connection, username, password, foldername, begin, end):
    return getSearchMailList(account, host, port, connection, username, password, foldername, "ALL", None, begin, end)

def getRecentMailList(account, host, port, connection, username, password, begin, end):
    return getSearchMailList(account, host, port, connection, username, password, "INBOX", "RECENT", None, begin, end)

def getSearchMailList(account, host, port, connection, username, password, foldername, criterion, keyword, begin, end):
    ok = True
    imap = IMAP4Client(host, port, connection, username, password)
    ok = imap.login()
    if ok:
        ok = imap.getSearchMailList(foldername, criterion, keyword, begin, end)
    imap.logout()
    if ok:
        return {"size": imap.size, "mailList": imap.response, "account": account, "mailbox": foldername}
    else:
        error = commons.error.getErrorInfo(imap.error)
        return {"error":error["error"], "message":error["message"], "account": account, "mailbox": foldername}

def getMail(account, host, port, connection, username, password, foldername, uid):
    ok = True
    imap = IMAP4Client(host, port, connection, username, password)
    ok = imap.login()
    if ok:
        ok = imap.getMail(foldername, uid)
    imap.logout()
    
    if ok:
        return {"mail": imap.response, "account": account, "mailbox": foldername, "uid":uid}
    else:
        error = commons.error.getErrorInfo(imap.error)
        return {"error":error["error"], "message":error["message"], "account": account, "mailbox":foldername, "uid":uid}
        
def getFile(account, host, port, connection, username, password, foldername, uid, filename):
    ok = True
    imap = IMAP4Client(host, port, connection, username, password)
    ok = imap.login()
    if ok:
        ok = imap.getFile(foldername, uid, filename)
    imap.logout()
    
    if ok:
        return {"file": imap.response, "account": account, "mailbox": foldername, "uid":uid}
    else:
        error = commons.error.getErrorInfo(imap.error)
        return {"error":error["error"], "message":error["message"], "account": account, "mailbox":foldername, "uid":uid, "filename": filename}

def getImage(account, host, port, connection, username, password, foldername, uid, imageid):
    ok = True
    imap = IMAP4Client(host, port, connection, username, password)
    ok = imap.login()
    if ok:
        ok = imap.getImage(foldername, uid, imageid)
    imap.logout()
    
    if ok:
        return {"file": imap.response, "account": account, "mailbox": foldername, "uid":uid}
    else:
        error = commons.error.getErrorInfo(imap.error)
        return {"error":error["error"], "message":error["message"], "account": account, "mailbox":foldername, "uid":uid, "imageid": imageid}

