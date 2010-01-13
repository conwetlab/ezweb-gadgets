function repaint() {
    try {
        var table = document.getElementById("table");
        table.style.height = document.body.offsetHeight + "px";
        var height = table.offsetHeight - document.getElementById("thead").offsetHeight - 2;
        document.getElementById("tbody").style.height = ((height > 0)?height:0) + "px";
        var rows = EzWebExt.getElementsByClassName(table, "tr");
        for (var i=0; i<rows.length; i++) {
            var cells = EzWebExt.getElementsByClassName(rows[i], "td");
            if (cells.length > 0) {
                var offsetWidth = 0;
                for (var j=0; j<cells.length-1; j++) {
                     offsetWidth += cells[j].offsetWidth;
                }
                var width = rows[i].offsetWidth - offsetWidth;
                cells[cells.length-1].style.width = ((width > 0)?width:0) + "px";
            }
        }
    } catch(e){}
}

function createTable(a, tableSearch_){

	tableSearch = tableSearch_;
	
	var lastTable = document.getElementById('table');
	
	var table = document.createElement("div");
    table.id = "table";
	
	var thead = document.createElement('div');
	thead.id = "thead";
	table.appendChild(thead);

	var tbody = document.createElement('div');
    tbody.id = "tbody";
    table.appendChild(tbody);

	//HEADER
	var tr = document.createElement('div');
	tr.className = "tr";
	
	var th = document.createElement('div');
	th.className = "th date";
	th.innerHTML = "Fecha";
	tr.appendChild(th);

	th = document.createElement('div');
	th.className = "th time";
	th.innerHTML = "Hora";
	tr.appendChild(th);
	
	th = document.createElement('div');
	th.className = "th text";
	
	var span = document.createElement('span');
	span.innerHTML = "Texto";
	th.appendChild(span);

	var input = document.createElement('input');
	input.setAttribute ('id', 'textSearch');
	input.setAttribute ('type', 'text');
	input.setAttribute ('size', 8);
	if (tableSearch_ && (lastTable != null)) {
	    input.value = lastTable.getElementsByTagName("input")[0].value;
	}
	EzWebExt.addEventListener(input, 'keypress', function(e) {
		if (e.keyCode == 13){
			if(input.value != ""){
				arrayResult = searchTextArray(arrayElems, input.value);
				createTable(arrayResult, true);
			}
			else {
			    createTable(arrayElems, false);
			}
	
		}
	}, false);

	th.appendChild(input);
    
    var img;

	if (tableSearch_) {
	    img = document.createElement('img');
        img.src = "images/go-home.png";
        img.className = "refresh";
        img.title  = "Mostrar lista completa";
        EzWebExt.addEventListener(img, "click", function() {
            createTable(arrayElems, false);
	    }, false);
        
        th.appendChild(img);
    }

	img = document.createElement('img');
    img.src = "images/clear.png";
    img.title  = "Borrar todo";
    EzWebExt.addEventListener(img, "click", function() {
        if (confirm("Seguro que deseas borrar")) {
            if (tableSearch_) {
                delSelected(a);
            }
            else {
	            delAll(arrayElems);
	        }
		}
	}, false);
	
    th.appendChild(img);
	
	tr.appendChild(th);
	
	thead.appendChild(tr);

    if ((tableSearch_) && (a.length == 0)) {
		var div = document.createElement('div');
		div.className = "error";
		div.innerHTML = "Sin resultados.";
		tbody.appendChild(div);
	}
	
	for (var i=0; i< a.length; i++){
		
		var tr = document.createElement('div');
		tr.className = "tr";
		if ((i%2) == 1) { //odd
           	tr.className = "tr odd";
        }
		
		//Date
		var td = document.createElement('div');
		td.className = "td date";
		td.innerHTML = getDate(a[i]);
		
		//Delete Image
		var img = document.createElement('img');
		img.src = "images/delete.png";
		img.title  = "Borrar";
		if (!tableSearch_) {
		    var context = {index:i};
		    EzWebExt.addEventListener(img, "click", EzWebExt.bind(function(){
			    delElement(this.index, arrayElems);
			    createTable(arrayElems, false); 
		    },context), false);
		}
		else {
		    var context = {index:a[i].pos, index2: i};
		    EzWebExt.addEventListener(img, "click", EzWebExt.bind(function(){ 
			    delElement(this.index2, a);
			    delElement(this.index, arrayElems);		
			    createTable(a, true);
		    },context), false);
		}
		td.appendChild(img);
		
		tr.appendChild(td);

		//Time
		td = document.createElement('div');
		td.className = "td time";
		td.innerHTML = getTime(a[i]);
		tr.appendChild(td);

		//Text
		td = document.createElement('div');
		td.className = "td text";
		td.innerHTML = a[i].text;
		tr.appendChild(td);
		tbody.appendChild(tr);
	}
	
	if (lastTable != null) {
	    document.body.removeChild(lastTable);
	}
	document.body.appendChild(table);
	if (tableSearch_ && (lastTable != null)) {
	    input.focus();
	}
	
	repaint();
}

function createGadget(a){
	var content = document.createElement('div');
	content.id = "content";
	document.body.appendChild(content);

	createTable(a, false);
}

