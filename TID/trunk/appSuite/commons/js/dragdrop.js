// JavaScript Document

function getData () {
	if (parent.eventDragDrop != null && parent.eventDragDrop != undefined && parent.eventDragDrop)
return parent.clipboard;	
}

function setData (dataClipboard) {
 parent.clipboard = dataClipboard;	
// parent.document.getElementById("data").innerHTML = dataClipboard; 
parent.eventDragDrop = true;
// parent.document.getElementById("datB").innerHTML = true; 
}

function popData () {
	temp ="";
	if (parent.eventDragDrop != null && parent.eventDragDrop != undefined && parent.eventDragDrop) {
temp = parent.clipboard;	
parent.clipboard = "";
// parent.document.getElementById("data").innerHTML = ""; 
parent.eventDragDrop = false;
 //parent.document.getElementById("datB").innerHTML = false; 
	}
return temp;
}
 
 buffer ="";
 


function addBuffer(code){
	if (buffer != "")
	buffer = buffer + ",";
	
buffer = buffer + code;


}

function getBuffer(){
				return buffer;	
	
}

function deleteBuffer() {
	
	buffer="";
	
}

function setBuffer(code){
buffer = code;	
}


 
