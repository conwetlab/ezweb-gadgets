import web

urls = (
    '/movie/?$', 'services.searchMovieService',
    '/movie/(\w+)/?$', 'services.getMovieService',
    
    '/person', 'services.searchPersonService',
    '/person/(\w+)', 'services.getPersonService',
)

web.webapi.internalerror = web.debugerror
if __name__ == "__main__":
    web.run(urls, globals(), web.reloader)
    

    
