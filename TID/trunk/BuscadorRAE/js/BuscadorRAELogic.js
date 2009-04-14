


/****************************************************************************************/
/****************************************************************************************/
/*******************   GET AND DISPLAY A SEARCH INTO RAE DICTIONARY *********************/
/****************************************************************************************/
/****************************************************************************************/
function getSearch(word, bus)
{
    value = word;
    keywordEvent.set(value);
    var value2 = encodeURIComponent(word.toLowerCase());
    if (value2 == '')
	return;
    addLoadingImage();
    var urlRequest = "http://buscon.rae.es/draeI/SrvltGUIBusUsual?" + "TIPO_BUS=" + 
	encodeURIComponent(bus) + "&LEMA=" + value2;
    EzWebAPI.send_get(urlRequest, this, onSuccessSearch, onError);
}


function onSuccessSearch(response)
{
    var html = response.responseText;
    var parent = document.createElement("div");
    var start = html.indexOf("<div>");
    var end = html.indexOf("</div>");

    // GET CONTENT DIVs
    while(start >= 0)
	{
	    var div = document.createElement("div");
	    div.innerHTML = html.substring(start+5, end);
	    parent.appendChild(div);
	    html = html.split(html.substring(start+5, end+6))[1];
	    start = html.indexOf("<div>");
	    end = html.indexOf("</div>");
	}
        
    // GET P AND UL 
    if (parent.innerHTML == "")
	{
	    var div = document.createElement("div");
	    var start = html.indexOf("<p");
	    var end = html.indexOf("</p>");

	    if (start >= 0)
		{
		    div.innerHTML = html.substring(start, end+4);
		    var span = div.getElementsByTagName("span");
		    if (span.length != 0)  
			span[0].removeAttribute("style");

		    var p = div.getElementsByTagName("p");
		    if (p.length != 0)
			p[0].removeAttribute("style");
		}
		
	    var start = html.indexOf("<ul");
	    var end = html.indexOf("</ul>");
	    
	    if (start >= 0)
		div.innerHTML = div.innerHTML+html.substring(start, end+5);
	    
	    if (div.innerHTML != "")
		parent.appendChild(div);   
	}
    else
	definition.set(parent.innerHTML);

    displaySearch(parent);
}


function onError()
{
    removeLoadingImage();
}


function parseContent(tab)
{
    var links = tab.wrapperElement.getElementsByTagName("a");
    
    for(var i=0; i < links.length; i++)
	{
	    if ((links[i].href != "") && (links[i].href.search("IDLEMA") >= 0))
		{
		    EzWebExt.removeFromParent(links[i]);
		    i-=1;
		}
	    else if ((links[i].href != "") && (links[i].href.search("LEMA") >= 0))
		{
		    var parameters = links[i].href.split("?")[1];
		    parameters = parameters.split("&");
		    
		    for (var j=0; j < parameters.length; j++)
			{
			    if (parameters[j].search("LEMA") >= 0)
				var word = parameters[j].split("=")[1];
			}
		    links[i].removeAttribute("href");
		    links[i].setAttribute("onclick", "getSearch('"+decodeURIComponent(word)+"',"+0+");");
		    links[i].setAttribute("class", "link");
		}
	    else if ((links[i].href != "") && (links[i].href.search("IDVERBO") >= 0))
		{
		    EzWebExt.removeFromParent(links[i]);
		    i-=1;
		}
	}
   
}
