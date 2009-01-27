var lastRowSelected = null;

var ListTable = Class.create();
ListTable.prototype = {
	initialize: function(tableId, path) {
		table = $(tableId);
		Element.addClassName(table, 'listTable');
		var odd = true;
		$A(table.getElementsByTagName('TR')).each(function(row){
			if(row.id !== ''){
				listRow = new ListRow(row, path, odd);
				odd = !odd;
			}
		});
	}
};

var ListRow = Class.create();
ListRow.prototype = {
	initialize: function(row, path, odd)
	{
		this.row = row;
		this.path = path;
		if(odd)
		{
			this.addBehavior('ltOdd', 'ltOddOver');
		}
		else
		{
			this.addBehavior('ltEven', 'ltEvenOver');
		}
	},
	addBehavior: function(clazz, classOver)
	{
		Element.addClassName(this.row, clazz);
		this.classOver = classOver;
		this.row.onmouseover = this.handleOnMouseOver.bindAsEventListener(this);
		this.row.onmouseout = this.handleOnMouseOut.bindAsEventListener(this);
		this.row.onclick = this.handleOnClick.bindAsEventListener(this);
	},
	removeBehavior: function(clazz)
	{
		Element.removeClassName(this.row, clazz);
	},
	handleOnClick: function(event)
	{
		if (lastRowSelected != null) 
		{
			Element.removeClassName(lastRowSelected, 'ltSelected');
		}

		Element.addClassName(this.row, 'ltSelected');
		lastRowSelected = this.row;

		// EzWeb: enviar evento
		enviar_evento(this.row.cells.item(0).textContent);
	},
	handleOnMouseOver: function(event)
	{
		Element.addClassName(this.row, this.classOver);
	},
	handleOnMouseOut: function(event)
	{
		Element.removeClassName(this.row, this.classOver);
	}
};
