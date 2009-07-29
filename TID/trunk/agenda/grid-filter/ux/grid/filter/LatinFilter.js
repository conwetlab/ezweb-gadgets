String.prototype.replaceLatinChar = function(){
	return output = this.replace(/�|�|�|�|�|�|�|�|�|�|�/ig,function (str,offset,s) {
        var str =str=="�"?"a":str=="�"?"e":str=="�"?"i":str=="�"?"o":str=="�"?"u":str=="�"?"n":str;
		str =str=="�"?"A":str=="�"?"E":str=="�"?"I":str=="�"?"O":str=="�"?"U":str=="�"?"N":str;
		str =str=="�"?"A":str=="�"?"E":str=="�"?"I":str=="�"?"O":str=="�"?"U":str=="�"?"N":str;
		str =str=="�"?"a":str=="�"?"e":str=="�"?"i":str=="�"?"o":str=="�"?"u":str;
		str =str=="�"?"A":str=="�"?"E":str=="�"?"I":str=="�"?"O":str=="�"?"U":str;
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