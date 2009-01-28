import web

urls = (
    '/openmovilforum/mms', 'mms.MMSSenderSrv.view',
    '/openmovilforum/agenda', 'agenda.AgendaSrv.view',
    '/greeting', 'greeting.GreetingSrv.view',
)

web.webapi.internalerror = web.debugerror
if __name__ == "__main__": web.run(urls, globals(), web.reloader)
