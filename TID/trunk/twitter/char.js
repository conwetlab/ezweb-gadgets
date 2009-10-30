/* 
* This code is licensed under terms shown on this link:
* http://forge.morfeo-project.org/wiki/index.php/Gadgets_2009_License
*/

// SPECIAL CHARACTERS
///////////////////////

var sc = {
	 34:	'&quot;', 	  
	 39:	'&apos;',     
	 60: 	'&lt;',
	 62:	'&gt;',
	161: 	'&iexcl;', 	
	162: 	'&cent;',
	163: 	'&pound;', 	
	164: 	'&curren;',	
	165: 	'&yen;',
	166: 	'&brvbar;', 	
	167: 	'&sect;',
	168: 	'&uml;',
	169: 	'&copy;',
	170: 	'&ordf;',
	171: 	'&laquo;',
	172: 	'&not;',
	173: 	'&shy;',
	174: 	'&reg;',
	175: 	'&macr;',
	176: 	'&deg;',
	177: 	'&plusmn;', 	
	178: 	'&sup2;',
	179: 	'&sup3;',
	180: 	'&acute;',
	181: 	'&micro;',
	182: 	'&para;',
	183: 	'&middot;',
	184: 	'&cedil;',
	185: 	'&sup1;',
	186: 	'&ordm;',
	187: 	'&raquo;', 	
	188: 	'&frac14;', 	
	189: 	'&frac12;', 	
	190: 	'&frac34;', 	
	191: 	'&iquest;', 	
	215: 	'&times;', 	
	247: 	'&divide;', 	
	192: 	'&Agrave;', 	
	193: 	'&Aacute;', 	
	194: 	'&Acirc;', 	
	195: 	'&Atilde;', 	
	196: 	'&Auml;',	
	197: 	'&Aring;', 	
	198: 	'&AElig;', 	
	199: 	'&Ccedil;', 	
	200: 	'&Egrave;', 	
	201: 	'&Eacute;', 	
	202: 	'&Ecirc;', 	
	203: 	'&Euml;',	
	204: 	'&Igrave;', 	
	205: 	'&Iacute;', 	
	206: 	'&Icirc;', 	
	207: 	'&Iuml;',	
	208: 	'&ETH;',
	209: 	'&Ntilde;', 	
	210: 	'&Ograve;', 	
	211: 	'&Oacute;', 	
	212: 	'&Ocirc;', 	
	213: 	'&Otilde;', 	
	214: 	'&Ouml;',	
	216: 	'&Oslash;', 	
	217: 	'&Ugrave;', 	
	218: 	'&Uacute;', 	
	219: 	'&Ucirc;', 	
	220: 	'&Uuml;',	
	221: 	'&Yacute;', 	
	222: 	'&THORN;', 	
	223: 	'&szlig;', 	
	224: 	'&agrave;', 	
	225: 	'&aacute;', 	
	226: 	'&acirc;', 	
	227: 	'&atilde;', 	
	228: 	'&auml;',	
	229: 	'&aring;', 	
	230: 	'&aelig;', 	
	231: 	'&ccedil;', 	
	232: 	'&egrave;', 	
	233: 	'&eacute;', 	
	234: 	'&ecirc;', 	
	235: 	'&euml;',
	236: 	'&igrave;', 	
	237: 	'&iacute;', 	
	238: 	'&icirc;', 	
	239: 	'&iuml;',	
	240: 	'&eth;',
	241: 	'&ntilde;', 	
	242: 	'&ograve;', 	
	243: 	'&oacute;', 	
	244: 	'&ocirc;', 	
	245: 	'&otilde;', 	
	246: 	'&ouml;',	
	248: 	'&oslash;',	
	249: 	'&ugrave;', 	
	250: 	'&uacute;', 	
	251: 	'&ucirc;', 	
	252: 	'&uuml;',	
	253: 	'&yacute;', 	
	254: 	'&thorn;', 	
	255: 	'&yuml;',
 8216:  '&lsquo;',
 8217: 	'&rsquo;',
 8220: 	'&ldquo;',
 8221: 	'&rdquo;',
 8764:  '&sim;'
};

// Replaces all special chars with theirs httml entities
function replace_special_chars (msg){
	for (var sc_item in sc){		
		msg = msg.replace (new RegExp(String.fromCharCode(sc_item), 'g'), sc[sc_item]);
	}
	return msg;
}

// Replaces all httml entities with theirs special chars  
function replace_html_entities (msg){
	for (var sc_item in sc){		
		msg = msg.replace (new RegExp(sc[sc_item], 'g'), String.fromCharCode(sc_item));
	}
	return msg;
}


// Replaces all links with <a> tag
function replace_links (msg){
	var n_urls = new EzWebAPI.platform.Array();
	
	// Search for www. in the message
	var iter = msg.match (/www./g);
	if (iter == null) iter = 0;
	for (var i = 0; i < iter.length ; i++){		
		
		var n_msg = msg.substring(msg.indexOf('www.'));
		var lchar = n_msg.indexOf(' ');
		if (lchar == -1){
			lchar = n_msg.length;
		}
		
		var n_url = n_msg.substring(0, lchar);
		if (msg.match('http://' + n_url) == null){
			n_urls.push(n_url);
		}
	}
	
	// Search for http:// in the message
	iter = msg.match (/http:\/\//g);
	if (iter == null) iter = 0;
	for (var i = 0; i < iter.length ; i++){		
		
		var n_msg = msg.substring(msg.indexOf('http://'));
		var lchar = n_msg.indexOf(' ');
		if (lchar == -1){
			lchar = n_msg.length;
		}
		
		var n_url = n_msg.substring(0, lchar);
		n_urls.push(n_url);
	}
	
	n_urls.uniq();
	
	// Replaces links
	for (var i = 0; i < n_urls.length ; i++){		
		var url_href = n_urls[i];
		if (n_urls[i].indexOf ('http://') != 0){
			url_href = 'http://' + n_urls[i];
		}
		msg = msg.replace (new RegExp (n_urls[i]), '<a target="_blank" rel="nofollow" href="' + url_href + '">' + n_urls[i] + '</a>');
	}
	
	return msg;
}