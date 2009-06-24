// Constants
var HOST_NAME_REGEXP = /pablix.hi.inet/;
var MULTIMAP_HOST_NAME_REGEXP = /www.multimap.com/;
var STREETMAP_HOST_NAME_REGEXP = /www.streetmap.co.uk/;
var SAMKNOWS_HOST_NAME = 'www.samknows.com';

// Makes a substitution of <a> links to 'http://www.samknows.com' page
function parseLinks()
{
	var ahrefs = document.getElementsByTagName("a");
	for(i=0;i<ahrefs.length;i++)
	{
		if (ahrefs[i].href.search(MULTIMAP_HOST_NAME_REGEXP) >= 0) {
			// Open Multimap links in a new page
			ahrefs[i].target ="_blank";
		} else if (ahrefs[i].href.search(STREETMAP_HOST_NAME_REGEXP) >= 0) {
			// Open Streetmap links in a new page
			ahrefs[i].target ="_blank";
		} else {
			// Rename and open samknows links in a new page 
			ahrefs[i].href = ahrefs[i].href.gsub(HOST_NAME_REGEXP,function(match){
				ahrefs[i].target ="_blank";
				return SAMKNOWS_HOST_NAME;
				});
		}
  	}
}

// Makes a substitution of <form> links to 'http://www.samknows.com' page
function parseForms()
{
	var formActions = document.getElementsByTagName("form");
	for(i=0;i<formActions.length;i++)
	{
		formActions[i].action = formActions[i].action.gsub(HOST_NAME_REGEXP,function(match){
			formActions[i].target ="_blank";
			return SAMKNOWS_HOST_NAME;
			});
  	}
}

// Makes a substitution of <img> links to 'http://www.samknows.com' page
function parseImgs()
{
	var imgsrcs = document.getElementsByTagName("img");
	for(i=0;i<imgsrcs.length;i++)
	{
		imgsrcs[i].src = imgsrcs[i].src.gsub(HOST_NAME_REGEXP, SAMKNOWS_HOST_NAME);
  	}
}

function makeRequest(exchange_code) {
	if (exchange_code != '') {
		EzWebAPI.send_get("http://www.samknows.com/broadband/exchange/" + exchange_code, this, callbackSucess, callbackError);
	}
}
