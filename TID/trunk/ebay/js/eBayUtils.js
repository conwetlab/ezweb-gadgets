/**
 * @class utils functions for ebay samples
 */
function eBayUtils(){}

/**
 * convert date to date string
 * @param {Date} date 
 * @return {String} String of "Month, day, year"
 */
eBayUtils.toDateString = function (date) {
	var thisDate = date ;
	if (thisDate === null) {
		return "";
	}
	var months = [ "January", "February", "March", "April", "May", "June", "July", "August", 
		"September", "October", "November", "December"];
	return months[thisDate.getMonth()] + "," + thisDate.getDate() + " " + thisDate.getFullYear(); 
};
	
/**
 * parse query string to map
 * @param {String} pQuery query string 
 * @return {Object} name value map
 */
eBayUtils.parseQuery =	function(pQuery) {
	var rv = {};
	if (!pQuery) {
		return rv;
	}
	var str = pQuery.split(/[;&]/);
	for (var i=0;i < str.length;i++) 
	{
  	var kv = str[i].split('=');
  	if (!kv || kv.length != 2) {
		continue;
	}
  	var k = unescape(kv[0]);
  	var v = unescape(kv[1]);
  	v = v.replace(/\+/g, ' ');
  	rv[k] = v;
	}
	return rv;
};

/**
 * truncate a string if its length is larger than the specified length 
 * @param {String} str input string 
 * @param {int} len length 
 * @return {String} truncated string
 */
eBayUtils.truncate = function(str, len) {
	if(typeof(str) == "undefined") return "";
	if(str == null) return "";
	if(len <= 0) return str;
	if (str.length > len) {
		return str.substring(0, len - 3) + "...";
	}
	return str.substring(0, len);
}

/**
 * use blank to split a string,
 * if the length of any word in this string is larger than the specified length,
 * then break the word into halves
 * @param {String} str1 input string 
 * @param {int} intLen length 
 * @return {String} string after breaking word
 */
eBayUtils.toBreakWord = function(str1, intLen) {
	if(typeof(str1) == "undefined") return "";
	if (str1 == null) return "";
	if(intLen <= 0) return str1;
	var ss = str1.split(" ");
	var temp = "";
	for(var i in ss) {
		if (typeof(ss[i]) == 'function' ) {
			continue;
		}
		if (ss[i].length > intLen) {
			var middle = parseInt(intLen / 2);
			temp += eBayUtils.breakWord(ss[i], middle) + " ";
		} else {
			temp += ss[i] + " ";
		}
	}
	return temp;
}

/**
 * break the word according to the specified length
 * @param {String} str1 input string 
 * @param {int} intLen length 
 * @return {String} string after breaking word
 */
eBayUtils.breakWord = function(str2, intLen) {
    if(typeof(str2) == "undefined") return "";
	if(str2 == null) return "";
	if(intLen <= 0) return str2;
	var strContent = str2;
	var strTemp = "";
	while(strContent.length>intLen) {
		var subStr = strContent.substr(0, intLen)
		strTemp +=(subStr +" ");
		strContent=strContent.substr(intLen, strContent.length);
	}
	strTemp += strContent;
	return strTemp;
}

/**
 * create a html element with specified attributes
 * @param {String} e, element name
 * @param {Object} obj, attributes for the html element
 */
eBayUtils.createElement = function(e, obj)
{
	var a = document.createElement(e);
	for(prop in obj)
	{
		a[prop] = obj[prop];
	}
	return a;
}
/**
 * append child elements to a specified html element,
 * the first parameter is the html element to which child elements will be appended.
 * all other parameters are child elements
 */
eBayUtils.appendChild = function()
{
	if(this.appendChild.arguments.length > 1)
	{
		var a = this.appendChild.arguments[0];
		for(i=1; i<this.appendChild.arguments.length; i++)
		{
			if(arguments[i])
			{
				a.appendChild(this.appendChild.arguments[i]);
			}
		}
		return a;
	}
	else
	{
		return null;
	}
}

/**
 * get html element by id
 * @param {String} i
 */
eBayUtils.getElement = function(i) { return document.getElementById(i); }

/**
 * remove all child of a html node
 * @param {Object} node
 */
eBayUtils.removeChild = function(node)
{
	if(node == null)
	{
		return;
	}
	
	while(node.hasChildNodes())
	{
		node.removeChild(node.firstChild);
	}
}
