import time
import email
import imaplib
from protocols.imap_utils.encoding import *

def selectMailbox(imap, mailbox):
    response = imap.select(imapUTF7Encode(mailbox.decode("utf8")), True)
    if (response[0] != "OK"):
        False
        
    imap.expunge()
    return True

def createMail(imap, mailbox, new_message, flags):
    now = time.time()
    if not new_message.has_key("date"):
        new_message["date"] = imaplib.Time2Internaldate(now)

    response = imap.append(mailbox, imaplib.ParseFlags(flags), now, new_message.as_string(True))
    if (response[0] != "OK"):
        return -1
    else:
        uid = response[1][0].split("]")[0].split(" ")
        return int(uid[len(uid)-1])
        
def copyMail(imap, new_mailbox, uid):
    imap.copy(uid, new_mailbox)
