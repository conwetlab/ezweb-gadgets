function sanitize( text ){
	var equivalences = {"á":"a","é":"e","í":"i","ó":"o","ú":"u",
				'Á':'A','É':'E','Í':'I','Ó':'O','Ú':'U',
				'â':'a','ê':'e','î':'i','ô':'o','û':'u',
				'Â':'A','Ê':'E','Î':'I','Ô':'O','Û':'U',
				'à':'a','è':'e','ì':'i','ò':'o','ù':'u',
				'À':'A','È':'E','Ì':'I','Ò':'O','Ù':'U',
				'ä':'a','ë':'e','ï':'i','ö':'o','ü':'u',
				'Ä':'A','Ë':'E','Ï':'I','Ö':'O','Ü':'U',
				'ã':'a','õ':'o','Ã':'A','Õ':'O','€':'E',
				'©':'c','°':'o','®':'R','£':'L','$':'S',
				'\t':'   ', 'º':'o','ª':'a','“':'"','”':'"',
				'…':'...','¿':'','¡':'','ç':'c','Ç':'C'}

	var plaintext = "";
	for (var i = 0; i < text.length; i++) {
		var ch = text.charAt(i);
		if (equivalences[ch]!=null) {
			plaintext += equivalences[ch];
		}else{
			plaintext += ch;
		}
	} // for

	return plaintext;
}

Ext.ux.grid.filter.StringFilter = Ext.extend(Ext.ux.grid.filter.Filter, {
	updateBuffer: 500,
	icon: 'ux-gridfilter-text-icon',
	
	init: function(){
		var value = this.value = new Ext.ux.menu.EditableItem({iconCls: this.icon});
		value.on('keyup', this.onKeyUp, this);
		this.menu.add(value);
		
		this.updateTask = new Ext.util.DelayedTask(this.fireUpdate, this);
	},
	
	onKeyUp: function(event){
		if(event.getKey() == event.ENTER){
			this.menu.hide(true);
			return;
		}
			
		this.updateTask.delay(this.updateBuffer);
	},
	
	isActivatable: function(){
		return this.value.getValue().length > 0;
	},
	
	fireUpdate: function(){		
		if(this.active)
			this.fireEvent("update", this);
			
		this.setActive(this.isActivatable());
	},
	
	setValue: function(value){
		this.value.setValue(value);
		this.fireEvent("update", this);
	},
	
	getValue: function(){
		return this.value.getValue();
	},
	
	serialize: function(){
		var args = {type: 'string', value: this.getValue()};
		this.fireEvent('serialize', args, this);
		return args;
	},
	
	validateRecord: function(record){
		var val = record.get(this.dataIndex);
		
		if(typeof val != "string")
			return this.getValue().length == 0;
		
		var filterValue = sanitize(this.getValue().toLowerCase());
		var recordValue = sanitize(val.toLowerCase());
		return recordValue.indexOf(filterValue) > -1;

	}
});