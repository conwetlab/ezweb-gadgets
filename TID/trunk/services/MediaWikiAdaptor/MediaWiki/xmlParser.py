# -*- coding: utf-8 -*-

import re
from xml.dom.minidom import parse, parseString
from BeautifulSoup import BeautifulSoup


def parserDescription (xmldata, links, name):
	result = {}
	# parsing xml into xml dom
	data = parseString (xmldata)
	# getting all the items tagged as item
	items = data.getElementsByTagName ('Item')
	if items == []:
		# there is no items
		return result
	# for every item, it will check if it is which i am looking for
	for item in items:
		title = item.getElementsByTagName ('Text')[0].firstChild.nodeValue
		# it is the article that i'm looking for
		if title.replace(' ', '_') == name.replace(' ', '_') :
			description = item.getElementsByTagName ('Description')[0].firstChild.nodeValue.encode ("utf-8")
			url = item.getElementsByTagName('Url')[0].firstChild.nodeValue.encode("utf8")
			result = {'title':title, 'description':description, 'url':url}
			break
	# It will parse the links
	data = parseString (links)
	items = data.getElementsByTagName ('pl')
	result ['links'] = []
	if items != []:
		for item in items:
			if len(item.getAttribute('title')) > 0:
				result['links'].append(item.getAttribute('title').replace(' ', '_'))
	return result

def parserSearch (xmldata):
	# Return the pages found in the search
	result = []
	data = parseString(xmldata)

	if data.getElementsByTagName('search') == []:
		return {}
	
	# Get pages
	pages = data.getElementsByTagName('p')
	
	# Get tittle
	for item in pages:
		result.append(item.getAttribute('title').replace(' ', '_'))
	return result



def parserContentArticle(htmldata):
	document = BeautifulSoup(htmldata)
	content = document.findAll(attrs={'id':re.compile("^bodyContent$")})
	return content[0]
