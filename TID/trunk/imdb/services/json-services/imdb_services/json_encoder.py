######################################################################
## MOVIES
######################################################################

def encode_movies(movies):
    res = []
    for movie in movies:
        encoded_movie = encode_movie(movie)
        
        res.append(encoded_movie)
    
    return res

def encode_movie(movie):
    encoded_movie = {}
    
    encoded_movie['id']=movie.movieID
    encoded_movie['title']=movie.data['title']
    
    if movie.data.has_key('image'):
        encoded_movie['image']=movie.data['image']
    
    if movie.data.has_key('kind'):
        encoded_movie['kind']=movie.data['kind']
    
    if movie.data.has_key('year'):
        encoded_movie['year']=movie.data['year']
        
    return encoded_movie

def encode_detailed_movie(movie):
    encoded_movie = {}
    
    encoded_movie['id']=movie.movieID
    encoded_movie['title']=movie.data['title']
    
    if movie.data.has_key('year'):
        encoded_movie['year']=movie.data['year']
    
    if movie.data.has_key('kind'):
        encoded_movie['kind']=movie.data['kind']
    
    if movie.data.has_key('cast'):
        encoded_movie['casting']=encode_people(movie.data['cast'])
    
    if movie.data.has_key('director'):
        encoded_movie['directors']=encode_people(movie.data['director'])
    
    if movie.data.has_key('writer'):
        encoded_movie['writers']=encode_people(movie.data['writer'])
    
    if movie.data.has_key('rating'):
        encoded_movie['rating']=movie.data['rating']
        
    if movie.data.has_key('genres'):
        encoded_movie['genres'] = movie.data['genres']
        
    if movie.data.has_key('countries'):
        encoded_movie['countries'] = movie.data['countries']
        
    if movie.data.has_key('languages'):
        encoded_movie['languages'] = movie.data['languages']
        
    if movie.data.has_key('plot outline'):
        encoded_movie['plot'] = movie.data['plot outline']
        
    if movie.data.has_key('image_url'):
        encoded_movie['image'] = movie.data['image_url']
        
    if movie.data.has_key('film_location'):
        encoded_movie['film_location'] = movie.data['film_location']
        
    if movie.data.has_key('runtimes'):
        encoded_movie['runtimes'] = movie.data['runtimes']
    
    return encoded_movie

######################################################################
## PEOPLE
######################################################################
def encode_person(person):
    encoded_person = {}
    
    encoded_person['id']=person.personID
    encoded_person['name']=person.data['name']
    if hasattr(person, 'image'):
        encoded_person['image']=person.image
    if hasattr(person, 'role'):    
        encoded_person['role']=person.role

    return encoded_person

def encode_people(people):
    res = []
    for person in people:
        encoded_person = encode_person(person)
        
        res.append(encoded_person)
    
    return res

def encode_detailed_person(person):
    encoded_person = {}
    
    encoded_person['id']=person.personID
    encoded_person['name']=person.data['name']
    
    if person.data.has_key('birth date'):
        encoded_person['birth date']=person.data['birth date']
    
    if person.data.has_key('birth name'):
        encoded_person['birth name']=person.data['birth name']
        
    if person.data.has_key('birth notes'):
        encoded_person['birth notes']=person.data['birth notes']
    
    if person.data.has_key('headshot'):
        encoded_person['headshot']=person.data['headshot']
        
    if person.data.has_key('image_url'):
        encoded_person['image'] = person.data['image_url']
    
    if person.data.has_key('actor'):
        encoded_person['actor']=encode_movies(person.data['actor'])
    
    if person.data.has_key('actress'):
        encoded_person['actor']=encode_movies(person.data['actress'])
    
    if person.data.has_key('producer'): 
        encoded_person['producer']=encode_movies(person.data['producer'])
        
    if person.data.has_key('writer'): 
        encoded_person['writer']=encode_movies(person.data['writer'])
    
    if person.data.has_key('director'):
        encoded_person['director']=encode_movies(person.data['director'])

    return encoded_person

