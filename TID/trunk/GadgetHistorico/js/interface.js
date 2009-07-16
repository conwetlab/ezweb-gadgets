function createTable(a){

	tableSearch = false;
	
	var content = document.createElement('div');
	content.id  = "content";

	var table = document.createElement("table");
        table.id = "table";
	content.appendChild(table);

	var thead = document.createElement('thead');
	thead.id = "thead";
	table.appendChild(thead);

	var tbody = document.createElement('tbody');
        tbody.id = "tbody";
        table.appendChild(tbody);

	//HEADER
	var tr = document.createElement('tr');
	
	var th = document.createElement('th');
	th.innerHTML = "Fecha";
	tr.appendChild(th);

	th = document.createElement('th');
	th.innerHTML = "Hora";
	tr.appendChild(th);
	
	th = document.createElement('th');
	th.className = "text";
	th.innerHTML = "Texto";

	var input = document.createElement('input');
	input.setAttribute ('id', 'textSearch');
	input.setAttribute ('type', 'text');
	//input.setAttribute ('autocomplete', 'on');
	input.setAttribute ('size', 8);
	input.addEventListener('keypress', function(e) {
		if (e.keyCode == 13){
			if(input.value != ""){
				arrayResult = searchTextArray(arrayElems, input.value);
				createTableSearch(arrayResult);
			}
	
		}
	}, false);

	th.appendChild(input);

	if (arrayResult.length > 0 ){
		var button = document.createElement('button');
		button.id = "resultSearch";
		button.addEventListener("click", function(){
			createTableSearch(arrayResult);
		}, false);
		button.innerHTML = "Res. Busqueda";
		th.appendChild(button);
	}

	tr.appendChild(th);

	th = document.createElement('th');
	

	var img = document.createElement('img');
        img.src = srcImg + "clear.png";
        img.style.cursor = "pointer";
        img.title  = "Borrar todo";
        img.addEventListener("click", function(){
		delAll(arrayElems);
	}, false);
        th.appendChild(img);

	tr.appendChild(th);

	thead.appendChild(tr);
	//
	
	for (var i=0; i< a.length; i++){
		
		var tr = document.createElement('tr');
		if (i%2){ //odd

               	       	tr.style.backgroundColor = "#ffffff";
               	}
       	        else {
      	        	        tr.style.backgroundColor = "#EAEAEA";
               	}
	
		
		//Date
		var td = document.createElement('td');
		td.innerHTML = getDate(a[i]);
		tr.appendChild(td);
		table.appendChild(tr);

		//Time
		td = document.createElement('td');
		td.innerHTML = getTime(a[i]);
		tr.appendChild(td);
		table.appendChild(tr);

		//Text
		td = document.createElement('td');
		td.className = "text";
		td.innerHTML = a[i].text;
		tr.appendChild(td);
		table.appendChild(tr);

		//Delete Image
		td = document.createElement('td');
		var img = document.createElement('img');
		img.src = srcImg + "delete.png";
		img.style.cursor = "pointer";
		img.title  = "Borrar";
		var context = {index:i};
		img.addEventListener("click", EzWebExt.bind(function(){
			delElement(this.index, arrayElems);
			createTable(arrayElems); 
		},context), false);
		td.appendChild(img);
		tr.appendChild(td);
		tbody.appendChild(tr);
	
	}
	document.body.removeChild(document.getElementById('content'));
	
	document.body.appendChild(content);	
}

function createTableSearch(a){

	tableSearch = true;	

	var content = document.createElement('div');
	content.id  = "content";

	var table = document.createElement("table");
        table.id = "table";
	content.appendChild(table);

	var thead = document.createElement('thead');
        thead.id = "thead";
        table.appendChild(thead);

        var tbody = document.createElement('tbody');
        tbody.id = "tbody";
        table.appendChild(tbody);


	//HEADER
	var tr = document.createElement('tr');
	
	var th = document.createElement('th');
	th.innerHTML = "Fecha";
	tr.appendChild(th);

	 th = document.createElement('th');
	th.innerHTML = "Hora";
	tr.appendChild(th);
	
	th = document.createElement('th');
	th.className = "text";
	th.innerHTML = "Texto";

	var input = document.createElement('input');
	input.setAttribute ('id', 'textSearch');
	input.setAttribute ('type', 'text');
	//input.setAttribute ('autocomplete', 'on');
	input.setAttribute ('size', 8);
	input.addEventListener('keypress', function(e) {
		if (e.keyCode == 13){
		
			if(input.value !=""){
				arrayResult = searchTextArray(arrayElems,input.value)
				createTableSearch(arrayResult);
			}
		}
	}, false);

	th.appendChild(input);

        var button = document.createElement('button');
        button.id = "completeList";
        button.addEventListener("click", function(){createTable(arrayElems)}, false);
        button.innerHTML = "Lista Completa";
        th.appendChild(button);

        tr.appendChild(th);

	tr.appendChild(th);

	th = document.createElement('th');

	var img = document.createElement('img');
        img.src = srcImg + "clear.png";
        img.style.cursor = "pointer";
        img.title  = "Borrar todo";	

        img.addEventListener("click", function(){delSelected(a);}, false);	
	
        th.appendChild(img);

	tr.appendChild(th);

	thead.appendChild(tr);
	//
	if (a.length == 0){
		var tr = document.createElement('tr');
		var td = document.createElement('td');
		td.innerHTML = "<strong>Sin resultados.</strong>";
		tr.appendChild(td);
		tbody.appendChild(tr);
	}
	
	for (var i=0; i< a.length; i++){
		
		var tr = document.createElement('tr');
		if (i%2){ //odd

               	       	tr.style.backgroundColor = "#ffffff";
               	}
       	        else {
      	        	        tr.style.backgroundColor = "#EAEAEA";
               	}
	
		
		//Date
		var td = document.createElement('td');
		td.innerHTML = getDate(a[i]);
		tr.appendChild(td);
		table.appendChild(tr);

		//Time
		td = document.createElement('td');
		td.innerHTML = getTime(a[i]);
		tr.appendChild(td);
		table.appendChild(tr);

		//Text
		td = document.createElement('td');
		td.className = "text";
		td.innerHTML = a[i].text;
		tr.appendChild(td);
		table.appendChild(tr);

		//Delete Image
		td = document.createElement('td');
		var img = document.createElement('img');
		img.src = srcImg + "delete.png";
		img.style.cursor = "pointer";
		img.title  = "Borrar";
		var context = {index:a[i].pos, index2: i};
		img.addEventListener("click", EzWebExt.bind(function(){ 
			delElement(this.index2, a);
			delElement(this.index, arrayElems);		
			createTableSearch(a);
		},context), false);
		td.appendChild(img);
		tr.appendChild(td);
		tbody.appendChild(tr);
	
	}
	document.body.removeChild(document.getElementById('content'));
	
	document.body.appendChild(content);	
}

function createGadget(a){
	var content = document.createElement('div');
	content.id = "content";
	document.body.appendChild(content);

	createTable(a);
}

