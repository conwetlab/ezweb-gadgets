String.prototype.replaceLatinChar = function(){
	return output = this.replace(/á|é|í|ó|ú|ñ|ä|ë|ï|ö|ü/ig,function (str,offset,s) {
        var str =str=="á"?"a":str=="é"?"e":str=="í"?"i":str=="ó"?"o":str=="ú"?"u":str=="ñ"?"n":str;
		str =str=="Á"?"A":str=="É"?"E":str=="Í"?"I":str=="Ó"?"O":str=="Ú"?"U":str=="Ñ"?"N":str;
		str =str=="Á"?"A":str=="É"?"E":str=="Í"?"I":str=="Ó"?"O":str=="Ú"?"U":str=="Ñ"?"N":str;
		str =str=="ä"?"a":str=="ë"?"e":str=="ï"?"i":str=="ö"?"o":str=="ü"?"u":str;
		str =str=="Ä"?"A":str=="Ë"?"E":str=="Ï"?"I":str=="Ö"?"O":str=="Ü"?"U":str;
        return (str);
        })
}

Ext.ux.grid.filter.LatinFilter = Ext.extend(Ext.ux.grid.filter.StringFilter, {
			
	serialize: function(){
		var args = {type: 'latin', value: this.getValue()};
		this.fireEvent('serialize', args, this);
		return args;
	},
	
	validateRecord: function(record){
		var val = record.get(this.dataIndex);
		
		if(typeof val != "string")
			return this.getValue().length == 0;
		
		var filterValue = this.getValue().toLowerCase().replaceLatinChar();
		var recordValue = val.toLowerCase().replaceLatinChar();
		return recordValue.indexOf(filterValue) > -1;
	}
});