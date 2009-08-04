from django.conf.urls.defaults import patterns
from smtp.views import *

urlpatterns = patterns('smtp.views',

    # Send mail
    (r'^/sender[/]?$', 
        SendMail(permitted_methods=('POST',))),
)
