import web, sys, os
import imdb
import simplejson

from json_encoder import *

class searchMovieService:
    def GET(self):
        try:
            web.header("Content-Type","application/json; charset=utf-8") 
            
            parameters = web.input()
            if (not parameters.has_key('text')):
                return web.badrequest()  
                 
            text = parameters.get('text')
            
            conn = imdb.IMDb(accessSystem='mobile')
            movies = conn.search_movie(text)
        except:
            return web.badrequest()
        
        print simplejson.dumps(encode_movies(movies))

class getMovieService:
    def GET(self, movieId):
        try:
            web.header("Content-Type","application/json; charset=utf-8") 
            
            conn = imdb.IMDb(accessSystem='mobile')
            movie = conn.get_movie(movieId)
        except:
            return web.badrequest()
        
        print simplejson.dumps(encode_detailed_movie(movie))

class searchPersonService:
    def GET(self):
        parameters = web.input()
        
        try:
            web.header("Content-Type","application/json; charset=utf-8") 
            
            parameters = web.input()
            if (not parameters.has_key('text')):
                return web.badrequest()  
                 
            text = parameters.get('text')
            
            conn = imdb.IMDb(accessSystem='mobile')
            people = conn.search_person(text)
        except:
            return web.badrequest()
        
        print simplejson.dumps(encode_people(people))


class getPersonService:
    def GET(self, personId):
        parameters = web.input()
        
        try:
            web.header("Content-Type","application/json; charset=utf-8") 
            
            conn = imdb.IMDb(accessSystem='mobile')
            person = conn.get_person(personId)
        except:
            return web.badrequest()
        
        print simplejson.dumps(encode_detailed_person(person))

