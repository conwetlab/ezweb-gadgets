/* 
* This code is licensed under terms shown on this link:
* http://forge.morfeo-project.org/wiki/index.php/Gadgets_2009_License
*/

Util = new Object ();

/* DOM utils */
Util.ListExt = new Object();

Util.ListExt.addItem = function (list_, id_, text_, value_, selected_) {
	var option = new Option(text_, value_);
	option.id = id_;
	if (selected_){
		option.selected = true;	
	}
	try {
        list_.add(option);
	} catch (e) {
        list_.appendChild(option);
	}
}

Util.ListExt.renameItems = function (list_) {
	for (var i = 0; i < list_.options.length ; i++) {
		var opt = list_.options[i];
		opt.text = FlickrGadgetFactory.getInstance().getTranslator().getLabel(opt.value);
	}
}

/* URL Definition */
Util.Url = function(url) {
	var a =  document.createElement('a');
	a.href = url;
	this.source = url;
	this.protocol = a.protocol.replace(':','');
	this.host = a.hostname;
	this.port = a.port;
	this.query = a.search;
	this.params = (function(){
		var ret = $H(),
		seg = a.search.replace(/^\?/,'').split('&'),
		len = seg.length, i = 0, s;
		for (;i<len;i++) {
			if (!seg[i]) { continue; }
			s = seg[i].split('=');
			ret[s[0]] = decodeURI(s[1]);	
		}
		return ret;
	})();
	this.file = (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1];
	this.hash = a.hash.replace('#','');
	this.path = a.pathname.replace(/^([^\/])/,'/$1');
	this.relative = (a.href.match(/tp:\/\/[^\/]+(.+)/) || [,''])[1];
	this.segments = a.pathname.replace(/^\//,'').split('/');
}

/* Email */
Util.isValidEmail = function (email_) {
	var filter = /^(\w+(?:\.\w+)*)@((?:\w+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i
	return filter.test(email_);
}