from django.conf.urls.defaults import patterns
from imap.views import *

urlpatterns = patterns('imap.views',
        
    # Info from specific folder
    (r'^/mailbox[/]?$', 
        FolderInfo(permitted_methods=('POST',))),

    # All folders
    (r'^/mailbox/all[/]?$', 
        FolderCollection(permitted_methods=('POST',))),
    
    # Mails from specific folder
    (r'^/mailbox/messages/(?P<begin>[\d]+)/(?P<end>[\d]+)[/]?$', 
        MailCollection(permitted_methods=('POST',))),
        
    # Search mails in specific folder
    (r'^/mailbox/messages/search/(?P<criterion>[\w\.]+)/(?P<keyword>[\w\.]+)/(?P<begin>[\d]+)/(?P<end>[\d]+)[/]?$', 
        SearchMailCollection(permitted_methods=('POST',))),

    # Get mail
    (r'^/mailbox/messages/uid/(?P<uid>[\d]+)[/]?$', 
        Mail(permitted_methods=('POST',))),
    
    # Get file
    (r'^/mailbox/messages/uid/(?P<uid>[\d]+)/file[/]?$', 
        File(permitted_methods=('POST',))),
        
    # Get image
    (r'^/mailbox/messages/uid/(?P<uid>[\d]+)/image[/]?$', 
        Image(permitted_methods=('POST',))),

    # All recent mails
    (r'^/recent/(?P<begin>[\d]+)/(?P<end>[\d]+)[/]?$',
        RecentMailCollection(permitted_methods=('POST',))),

)
