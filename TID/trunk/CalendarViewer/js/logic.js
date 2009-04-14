function $(element) {
    return document.getElementById(element);
}

var CalendarViewer = function() {
	this.initialized = false;

	/* Call to the parent constructor */
	EzWebGadget.call(this, {translatable: "true"});

	EzWebExt.appendStyle(this.getResourceURL('/css/style.css'));
}
CalendarViewer.prototype = new EzWebGadget(); /* Extend from EzWebGadget */

CalendarViewer.prototype.resourcesURL = "http://demo.ezweb.morfeo-project.org/repository/CalendarViewer";
CalendarViewer.prototype.MONTH_VIEW = 0;
CalendarViewer.prototype.WEEK_VIEW  = 1;
CalendarViewer.prototype.DAY_VIEW   = 2;


CalendarViewer.prototype.clearEventsByHour = function() {
	this.eventsByHour = new Array();
        for(var i=0; i<24; i++){
        	this.eventsByHour[i] = new Array();
        }
}

/* Overwrite methods and extend gadget funcionality */
CalendarViewer.prototype.init = function() {

	this.MAIL_URL = "http://demo.ezweb.morfeo-project.org:13000/mailproxy/";
	
	//this.urlPref = EzWebAPI.createRGadgetVariable ('urlPref', this.urlPrefCallback);
	//this.urlPref2 = EzWebAPI.createRGadgetVariable ('urlPref2', this.urlPrefCallback);
	//The property with iCal urls is urlPrefs
	this.urlPrefs = EzWebAPI.createRWGadgetVariable('urlPrefs');	
	//In iCalPosition we have the iCal with we are dealing in iCalList
	this.iCalPosition = 0;
	this.lastListOfMonths = [];
	this.gettedCalendarNames = 0;
	this.calendarNames = [];
	this.descriptionEvent = EzWebAPI.createRWGadgetVariable ('description');
	this.titleEvent = EzWebAPI.createRWGadgetVariable ('title');
	this.placeEvent = EzWebAPI.createRWGadgetVariable ('place');
	this.dateEvent = EzWebAPI.createRWGadgetVariable ('date');

        this.account = EzWebAPI.createRGadgetVariable("account", function(value){});
        this.host = EzWebAPI.createRGadgetVariable("host", function(value){});
        this.port = EzWebAPI.createRGadgetVariable("port", function(value){});
        this.connection = EzWebAPI.createRGadgetVariable("connection", function(value){});
        this.username = EzWebAPI.createRGadgetVariable("username", function(value){});
        this.password = EzWebAPI.createRGadgetVariable("password", function(value){});

	this.weekStartingDay = 1;
	this.events = new Array();

	/* Get today's date */
	var Calendar = new Date();
	this.todayYear = Calendar.getFullYear();
	this.todayMonth = Calendar.getMonth(); // 0-11
	this.todayDay = Calendar.getDate();

        this.newYear = this.todayYear;
        this.newMonth = this.todayMonth; // 0-11
        this.newDay = this.todayDay;

	this.viewMode = this.MONTH_VIEW;

	/* Creating variables for selected weeks*/
	this.selectionFirstWeek = new Array();
	this.selectionLastWeek = new Array();
	this.selectionWeekStart = new Array();
	this.selectionWeekEnd = new Array();
        this.selectedDay = null;
        this.selection = 0;
        this.previousSelection = 0;
        
        /*To use for schedule in day view*/
        this.leftOffset = 0;
        this.rightOffset = 0;
        
        /* Build user interface */
        this.alternatives = new StyledElements.StyledAlternatives({id: "tmp", defaultEffect: "None"});

        this.calendarView = this.alternatives.createAlternative();
        var menu = document.createElement("div");
        menu.id = 'menu';
        menu.innerHTML = '<button id="monthButton" disabled="disabled" onclick="javascript:CalendarViewer.changeView(0);">M</button>' +
                         '<button id="weekButton" onclick="javascript:CalendarViewer.changeView(1);">W</button>' +
                         '<button id="dayButton" onclick="javascript:CalendarViewer.changeView(2);">D</button>';

        /* Calendar View */
        this.calendarView.appendChild(menu);
        this.calendarContainer = new StyledElements.Container({id: "calendar_view"});
        this.calendarView.appendChild(this.calendarContainer);
        var createEventButton = document.createElement("button");
	createEventButton.appendChild(document.createTextNode("Crear Evento"));
	createEventButton.setAttribute('onclick', 'CalendarViewer.createEvent('+ this.newDay + ',' + (this.newMonth +1) + ','+ this.newYear +',9,0);');
        this.calendarView.appendChild(createEventButton);
	
	/*Adding the div for the management of Calendars*/
	var divICals = document.createElement('div');
	EzWebExt.addClassName(divICals, 'div-iCal');
	var divTitleIcals = document.createElement('div');
	divTitleIcals.setAttribute('id','div_iCal_title');
	divICals.appendChild(divTitleIcals);
	///var titleCalendars = this.getTranslatedLabel('titleCalendars');
	divTitleIcals.appendChild(document.createTextNode('Mis calendarios'));
	
	
	//Añado directamente dos calendarios:
	this.iCalList= [];
	try {
		var list = eval("(" + this.urlPrefs.get() + ")");
		if (list == "")
			list = [];
		this.iCalList = list;
	}
	catch(e) {}
	/*
	//"http://www.google.com/calendar/ical/ezweb.platform@gmail.com/public/basic.ics";
	this.iCalList.push(this.urlPref.get());
	//"http://www.google.com/calendar/ical/gputovur7ksc79r6mru6870vss%40group.calendar.google.com/public/basic.ics";
	this.iCalList.push(this.urlPref2.get());
	*/
	
	var groupCalendarNames = document.createElement('div');
	groupCalendarNames.setAttribute('id','groupCalendars');
	for (var i = 0; i < this.iCalList.length; i++) {
		if (this.iCalList[i] == 1)
			continue;
		var divCalendarRow = document.createElement('div');
		divCalendarRow.setAttribute('id','iCalendarRow_'+i);
		EzWebExt.addClassName(divCalendarRow, 'name_calendar');
		divCalendarRow.setAttribute('style','background:'+ getColor(i));
		var divCalName = document.createElement('div');
		EzWebExt.addClassName(divCalName, 'name_text');
		divCalName.setAttribute('id','iCal_'+i);
		divCalendarRow.appendChild(divCalName);
		var buttonCalendar = document.createElement("button");
		EzWebExt.addClassName(buttonCalendar, 'button_preferences');
		buttonCalendar.appendChild(document.createTextNode("X"));
		buttonCalendar.setAttribute('onclick', 'CalendarViewer.deleteIcal('+i+');');
		divCalendarRow.appendChild(buttonCalendar);
		groupCalendarNames.appendChild(divCalendarRow);
	}
	divICals.appendChild(groupCalendarNames);
	var addCalendar = document.createElement('div');
	addCalendar.setAttribute('id','div_iCal_add');
	///var textAddCalendar = this.getTranslatedLabel ('addCalendar');
	addCalendar.appendChild (document.createTextNode('Añadir calendario'));
	EzWebExt.addClassName(addCalendar, 'add-calendar');
	addCalendar.setAttribute('onclick', 'CalendarViewer.hideNewIcal()');
	divICals.appendChild(addCalendar);
	//The hidden field to add a new iCal using URL of ics file
	var formUrlDiv = document.createElement('div');
	var urlField = new StyledElements.StyledTextField({name: 'fieldUrl',
	                                                   initialValue: 'http://www.google.com/calendar/ical/ezweb.platform@gmail.com/public/basic.ics'});
	urlField.inputElement.id = 'fieldUrl';
	urlField.wrapperElement.style.width = '96%';
	///var textAdd = this.getTranslatedLabel ('addURL');
    	var buttonAddUrl = document.createElement('button');
    	buttonAddUrl.appendChild(document.createTextNode('Añadir URL'));
    	buttonAddUrl.setAttribute('id', 'buttonUrl');
	EzWebExt.addClassName(buttonAddUrl, 'button_url');
	//on click we insert the new iCal
	buttonAddUrl.addEventListener("click",
        	EzWebExt.bind( function() {
        	   this.addNewIcal(urlField.getValue())
		   }, this),
		   true);
    	urlField.insertInto(formUrlDiv);
    	formUrlDiv.appendChild(buttonAddUrl);
    	formUrlDiv.setAttribute('id', 'formUrl');
    	//formUrlDiv.setAttribute('style', 'display:none');    	
    	divICals.appendChild(formUrlDiv);

	this.calendarView.appendChild(divICals);
	
	/* Event list View */
        this.eventsContainer = this.alternatives.createAlternative({"containerOptions": {id: "events_view"}});
        this.menu =  document.createElement("div");
        this.menu.id = 'menu';
        
        this.eventsByHour = new Array();
        this.clearEventsByHour();
        
        var prevButton= document.createElement("button");
        prevButton.id = "prev_button";
        prevButton.appendChild(document.createTextNode("<<"));
        prevButton.addEventListener("click",
                       EzWebExt.bind( function() {
                          this.getPrevious()
                          }, this),
                          true);
        this.menu.appendChild(prevButton);

        var nextButton= document.createElement("button");
        nextButton.id = "next_button";
        nextButton.appendChild(document.createTextNode(">>"));
        nextButton.addEventListener("click",
                       EzWebExt.bind( function() {
                          this.getNext()
                          }, this),
                          true);
        this.menu.appendChild(nextButton);
        
        var button = document.createElement("button");
        button.id = "return_button";
        button.appendChild(document.createTextNode("Volver"));
        button.addEventListener("click",
                       EzWebExt.bind(function() {
                           this.alternatives.showAlternative(0);
                           this.previousSelection = 0;
                       }, this),
                       true);
        this.menu.appendChild(button);
        
        this.eventsContainer.appendChild(this.menu);

	/* Event Details View */
        this.eventDetailsContainer = this.alternatives.createAlternative({"containerOptions": {id: "event_view"}});

	/* New event Form View */
	this.formEvent = this.alternatives.createAlternative({"containerOptions": {id: "form_view"}});

	this.alternatives.insertInto(document.body);

        /* Show event for today */
	this.changeToMonth = EzWebExt.bind(this.changeToMonth, this);
	this.changeToMonth(this.todayYear, this.todayMonth, this.todayDay);

	/*Put the titles in the div to manage the calendars*/
	//this.setTitlesDivIcals();

	this.initialized = true;
}

CalendarViewer.prototype.languageCallback = function(newLang) {
	EzWebGadget.prototype.languageCallback.call(this, newLang);

	if (newLang == "en")
		this.weekStartingDay = 0;
	else
		this.weekStartingDay = 1;

        if (this.initialized === true)
		this.changeToMonth(this.newYear, this.newMonth, this.newDay);
}

CalendarViewer.prototype.setTitlesDivIcals = function(){
	/*the title of the div*/
	var divTitle = $('div_iCal_title');
	var titleCalendars = this.getTranslatedLabel('titleCalendars');
	divTitle.appendChild(document.createTextNode(titleCalendars));
	/*The option of adding the calendar*/
	var addCalendar = $('div_iCal_add');
	var textAddCalendar = this.getTranslatedLabel ('addCalendar');
	addCalendar.appendChild (document.createTextNode(textAddCalendar));
	/*The content of button*/
	var buttonAdd = $('buttonUrl');
	var textAdd = this.getTranslatedLabel ('addURL');
	buttonAdd.appendChild(document.createTextNode(textAdd));	
}

CalendarViewer.prototype.getNext = function() {
	var date = new Date(this.newYear, this.newMonth, this.newDay);

	if (this.viewMode == this.MONTH_VIEW){
	    if (this.newMonth == 11) {
		this.changeToMonth((this.newYear + 1) ,0, 1);
	    } else {
		this.changeToMonth(this.newYear, (this.newMonth +1),1);
	    }
	    date.setMonth(date.getMonth() + 1);
	} else if (this.viewMode == this.WEEK_VIEW){
	    if (this.newMonth == 11) {
		this.changeToMonth((this.newYear + 1) ,0, 1);
	    } else {
		this.changeToMonth(this.newYear, (this.newMonth +1),1);
	    }
	    date.setDate(date.getDate() + 7);
	} else {
            date.setDate(date.getDate() + 1);
	}
 	
        this.newYear = date.getFullYear();
        this.newMonth = date.getMonth();
        this.newDay = date.getDate();
        if (this.viewMode == this.MONTH_VIEW){
	        this.showMonthEvents(this.newYear, this.newMonth, this.newDay);
	} else if (this.viewMode == this.WEEK_VIEW){
	        this.showWeekEvents(this.newYear, this.newMonth, this.newDay);
	} else {
        	this.showDayEvents(this.newYear, this.newMonth, this.newDay);
	}
        

}

CalendarViewer.prototype.getPrevious = function() {
	var date = new Date(this.newYear, this.newMonth, this.newDay);
  
  	if (this.viewMode == this.MONTH_VIEW){
  	    if (this.newMonth == 0) {
		this.changeToMonth((this.newYear - 1) ,11, 1);
	    } else {
		this.changeToMonth(this.newYear, (this.newMonth -1),1);
	    }
	    date.setMonth(date.getMonth() - 1);
	} else if (this.viewMode == this.WEEK_VIEW){
  	    if (this.newMonth == 0) {
		this.changeToMonth((this.newYear - 1) ,11, 1);
	    } else {
		this.changeToMonth(this.newYear, (this.newMonth -1),1);
	    }
	    date.setDate(date.getDate() - 7);
	} else {
            date.setDate(date.getDate() - 1);
	}
        
        this.newYear = date.getFullYear();
        this.newMonth = date.getMonth();
        this.newDay = date.getDate();
        if (this.viewMode == this.MONTH_VIEW){
	        this.showMonthEvents(this.newYear, this.newMonth, this.newDay);
	} else if (this.viewMode == this.WEEK_VIEW){
	        this.showWeekEvents(this.newYear, this.newMonth, this.newDay);
	} else {
        	this.showDayEvents(this.newYear, this.newMonth, this.newDay);
	}
}

CalendarViewer.prototype.hideNewIcal = function(){
	var formUrl = $('formUrl');
	var state = formUrl.getAttribute('style');
	if (state == 'display: none;')
		formUrl.setAttribute('style','display:block');
	else {
		formUrl.setAttribute('style','display:none');
		var field = $('fieldUrl');
		field.value = '';
	}
}


CalendarViewer.prototype.deleteIcal = function (i) {
	//this.iCalList.splice(i,1);
	this.iCalList[i] = 1;
	var parentDiv = $('groupCalendars');
	var div = $('iCalendarRow_'+i);
	parentDiv.removeChild(div);

        /* Show event selected */
	this.events = new Array();
	this.iCalPosition = 0;
	this.lastListOfMonths = [];
	this.calendarNames = [];
	this.gettedCalendarNames = 0;
	
	/*Clean Names Calendar*/
	for (var j = 0; j<this.iCalList.length; j++){
		if (this.iCalList[j] == 1)
			continue;
		var divCalName = $('iCal_'+j);
		divCalName.textContent = '';
	}
	
	this.urlPrefs.set(this.toJSON(this.iCalList));
	this.changeToMonth(this.newYear, this.newMonth, this.newDay);
}

CalendarViewer.prototype.addNewIcal = function (url) {
	this.iCalList.push(url);
	var group = $('groupCalendars');
	var i = this.iCalList.length -1;
	var divCalendarRow = document.createElement('div');
	divCalendarRow.setAttribute('id','iCalendarRow_'+i);
	EzWebExt.addClassName(divCalendarRow, 'name_calendar');
	divCalendarRow.setAttribute('style','background:'+ getColor(i));
	var divCalName = document.createElement('div');
	EzWebExt.addClassName(divCalName, 'name_text');
	divCalName.setAttribute('id','iCal_'+i);
	divCalendarRow.appendChild(divCalName);
	var buttonCalendar = document.createElement("button");
	EzWebExt.addClassName(buttonCalendar, 'button_preferences');
	buttonCalendar.appendChild(document.createTextNode("X"));
	buttonCalendar.setAttribute('onclick', 'CalendarViewer.deleteIcal('+i+');');
	divCalendarRow.appendChild(buttonCalendar);
	
	//Adding the iCal url to the properties
	this.urlPrefs.set(this.toJSON(this.iCalList));
	
	group.appendChild(divCalendarRow);	
	this.hideNewIcal();
        /* Show event selected */
	this.events = new Array();
	this.iCalPosition = 0;
	this.lastListOfMonths = [];
	this.calendarNames = [];
	this.gettedCalendarNames = 0;
	
	/*Clean Names Calendar*/
	for (var j = 0; j<this.iCalList.length - 1; j++){
		if (this.iCalList[j] == 1)
			continue;
		var divCalName = $('iCal_'+j);
		divCalName.textContent = '';
	}
	this.changeToMonth(this.newYear, this.newMonth, this.newDay);	
}


CalendarViewer.prototype.showDetails = function(day, pos) {
	this.eventDetailsContainer.clear();
	
	var listDetails = document.createElement("div");
	var button = document.createElement('button');
	button.setAttribute('id', 'return_button');
        button.appendChild(document.createTextNode(this.getTranslatedLabel('return_button')));
        button.addEventListener("click",
                       EzWebExt.bind(function() {
                           this.alternatives.showAlternative(1);
                       }, this),
                       true);
	listDetails.appendChild (button);

	//Header with title
	var divTitle = document.createElement('div');
	EzWebExt.addClassName(divTitle, 'div-title-details');
	var titleDetails = this.getTranslatedLabel("titleDetails");
	var pTitle = document.getElementById('title_'+ day + '_' + pos);
	divTitle.appendChild(document.createTextNode(titleDetails +pTitle.getAttribute('content')));
	EzWebExt.addClassName(divTitle, 'div-detail');
	listDetails.appendChild(divTitle);
	//Description event
	var description = document.createElement('div');
	var descDetails = this.getTranslatedLabel("descriptionDetails");
	var pDescription = document.getElementById('description_'+ day + '_' + pos);	
	description.appendChild(document.createTextNode(descDetails +pDescription.getAttribute('content')));
	EzWebExt.addClassName(description, 'div-detail');
	listDetails.appendChild(description);
	//Place event
	var place = document.createElement('div');
	var placeDetails = this.getTranslatedLabel("placeDetails");
	var pPlace = document.getElementById('place_'+ day + '_' + pos);	
	place.appendChild(document.createTextNode(placeDetails +pPlace.getAttribute('content')));
	EzWebExt.addClassName(place, 'div-detail');
	listDetails.appendChild(place);
	//Date event
	var date = document.createElement('div');
	var dateDetails = this.getTranslatedLabel("dateDetails");
	date.appendChild(document.createTextNode(dateDetails + day + '-' + (this.newMonth+1) + '-' + this.newYear));
	EzWebExt.addClassName(date, 'div-detail');
	listDetails.appendChild(date);
	//Initial Time event
	var initialTime = document.createElement('div');
	var initialDetails = this.getTranslatedLabel("initialDetails");
	var pInitialTime = document.getElementById('initial_'+ day + '_' + pos);
	initialTime.appendChild(document.createTextNode(initialDetails + pInitialTime.getAttribute('content')));
	EzWebExt.addClassName(initialTime, 'div-detail');	
	listDetails.appendChild(initialTime);
	//End Time event
	var endTime = document.createElement('div');
	var endDetails = this.getTranslatedLabel("endDetails");
	var pEndTime = document.getElementById('end_'+ day + '_' + pos);	
	endTime.appendChild(document.createTextNode(endDetails + pEndTime.getAttribute('content')));
	EzWebExt.addClassName(endTime, 'div-detail');	
	listDetails.appendChild(endTime);	

        //document.getElementById('event_view').appendChild(listDetails);
        this.eventDetailsContainer.appendChild(listDetails);
	this.alternatives.showAlternative(2);
}

CalendarViewer.prototype.sendMail = function(subject, message, to, onSuccess) {

	var config = {
		account: this.account.get(),
		host: this.host.get(),
		port: this.port.get(),
		connection: this.connection.get(),
		username: this.username.get(),
		password: this.password.get()
	};
	
	var destination = {
		subject: subject,
		message: message,
		to: to
	}

/*        var div = document.createElement("div");
        div.className = "loading";
        this.*/

	this.sendPost(
		this.MAIL_URL + "smtp/sender",
		"config=" + encodeURIComponent(CalendarViewer.toJSON(config)) + "&destination=" + encodeURIComponent(CalendarViewer.toJSON(destination)),
		onSuccess
	);
}

CalendarViewer.prototype.toJSON = function(object) {
	return JSON.stringify(object, function (key, value) {
	    return value;
	});
}

CalendarViewer.prototype.sendEventMail = function( nameEvent, placeEvent, descEvent,
							inDateEvent, endDateEvent, inHourEvent,
							endHourEvent, mails) {
	
	var subject = 'New event '+nameEvent;

        if (descEvent[descEvent.length - 1] != ".")
          descEvent = descEvent.substr(0, descEvent.length - 1);

//	var messageMail = this.getTranslatedLabel();
	var messageMail = 'You have been invited to an event %(eventName)s in' +
	    ' %(eventPlace)s whose description is: %(eventDesc)s. This event ' +
	    'starts at %(startDate)s and finish on %(endDate)s. Start hour: %(inHourEvent)s.' +
	    'Finish hour: %(endHourEvent)s.';
	messageMail = EzWebExt.interpolate(messageMail,
	                                   {eventName: nameEvent,
	                                    eventPlace: placeEvent,
	                                    eventDesc: descEvent,
	                                    startDate: inDateEvent,
	                                    endDate: endDateEvent}
	                                    );

        function onSuccess() {
/*                
                this.drawEvents();
                this.events*/
                this.alternatives.showAlternative(0);
        }

	//Trusting in the mail inserted
	this.sendMail(subject, messageMail, mails, EzWebExt.bind(onSuccess, this));

}

CalendarViewer.prototype.createEvent = function(day,month,year,initialHour, halfHour) {
	this.formEvent.clear();

	var divForm = document.createElement('div');
	//Botones
	var button = document.createElement('button');
	button.setAttribute('id', 'create_button');
        button.appendChild(document.createTextNode(this.getTranslatedLabel('create_button')));
        button.addEventListener("click",
                       EzWebExt.bind(function() {
                           this.addEventToCalendar(input1.getValue(), input2.getValue(),
                           			input3.getValue(), input4.getValue(),
                           			input5.getValue(),input7.getValue(),
                           			input8.getValue());
                           var mails = input6.getValue().split(/\s*,\s*/);
                           this.sendEventMail(input1.getValue(), input2.getValue(),
                           			input3.getValue(), input4.getValue(),
                           			input5.getValue(),input7.getValue(),
                           			input8.getValue(), mails);
                       }, this),
                       true);
	divForm.appendChild (button);
        var button2 = document.createElement('button');
	button2.setAttribute('id', 'return_button');
        button2.appendChild(document.createTextNode(this.getTranslatedLabel('return_button')));
        button2.addEventListener("click",
                       EzWebExt.bind(function() {
                           if (this.previousSelection==0)
                           	this.alternatives.showAlternative(0);
                           else
                           	this.alternatives.showAlternative(1);
                       }, this),
                       true);
	divForm.appendChild (button2);
	//Title
	var header = document.createElement('div');
	EzWebExt.addClassName(header, 'header_events_title');
	var eventForm = this.getTranslatedLabel('eventForm');
	header.appendChild(document.createTextNode(eventForm));
	header.setAttribute('id', 'header-form');
	divForm.appendChild(header);
	//Create the table of the form
	var table = document.createElement('table');
	table.setAttribute('id', 'table-form');
	//Field of name
	var tr1 = document.createElement('tr');
	var titleCell = document.createElement('td');
	var summaryEvent = this.getTranslatedLabel('summaryEvent')
	titleCell.appendChild(document.createTextNode(summaryEvent));
	EzWebExt.addClassName(titleCell, 'title-arguments');
	tr1.appendChild(titleCell);
	var td12 = document.createElement('td');
	var input1 = new StyledElements.StyledTextField();
	input1.insertInto(td12);
	tr1.appendChild(td12);
	table.appendChild(tr1);
	//Field of Location
	var tr2 = document.createElement('tr');
	var placeCell = document.createElement('td');
	var place = this.getTranslatedLabel("placeDetails");
	placeCell.appendChild(document.createTextNode(place));
	EzWebExt.addClassName(placeCell, 'title-arguments');
	tr2.appendChild(placeCell);
	var td22 = document.createElement('td');
	var input2 = new StyledElements.StyledTextField();
	input2.insertInto(td22);
	tr2.appendChild(td22);
	table.appendChild(tr2);
	//Field of description
	var tr3 = document.createElement('tr');
	var descCell = document.createElement('td');
	var descDetails = this.getTranslatedLabel("descriptionDetails");	
	descCell.appendChild(document.createTextNode(descDetails));
	EzWebExt.addClassName(descCell, 'title-arguments');
	tr3.appendChild(descCell);
	var td32 = document.createElement('td');
	var input3 = new StyledElements.StyledTextField();
	input3.insertInto(td32);
	tr3.appendChild(td32);
	table.appendChild(tr3);
	//Field of initial date
	var tr4 = document.createElement('tr');
	var initialCell = document.createElement('td');
	var initialDate = this.getTranslatedLabel('initialDate')
	initialCell.appendChild(document.createTextNode(initialDate));
	EzWebExt.addClassName(initialCell, 'title-arguments');
	tr4.appendChild(initialCell);
	var td42 = document.createElement('td');
	//var temp_date1 = selectedDate.getDate() + '/' + (selectedDate.getMonth()+1) + '/' + selectedDate.getFullYear();
	selectedDate = day + '/' + month +'/' + year;
	var input4 = new StyledElements.StyledTextField({initialValue: selectedDate});
	input4.insertInto(td42);
	tr4.appendChild(td42);
	table.appendChild(tr4);
	//Field of initial hour
	var tr7 = document.createElement('tr');
	var initHourCell = document.createElement('td');
	var initialDetails = this.getTranslatedLabel('initialDetails');
	initHourCell.appendChild(document.createTextNode(initialDetails));
	EzWebExt.addClassName(initHourCell, 'title-arguments');
	tr7.appendChild(initHourCell);
	var inHour = parseInt((initialHour),10);
	if ((inHour) < 10)
		inHour = '0'+initialHour;
	if (halfHour == 0)
		halfHour = '00';
	var td72 = document.createElement('td');
	var input7 = new StyledElements.StyledTextField({initialValue: inHour+':'+halfHour});
	input7.insertInto(td72);
	tr7.appendChild(td72);
	table.appendChild(tr7);
	//Field of end date
	var tr5 = document.createElement('tr');
	var endCell = document.createElement('td');
	var endDate = this.getTranslatedLabel('endDate');
	endCell.appendChild(document.createTextNode(endDate));
	EzWebExt.addClassName(endCell, 'title-arguments');
	tr5.appendChild(endCell);
	var td52 = document.createElement('td');
	var input5 = new StyledElements.StyledTextField({initialValue: selectedDate});
	input5.insertInto(td52);
	tr5.appendChild(td52);
	table.appendChild(tr5);
	//Field of end hour
	var tr8 = document.createElement('tr');
	var endHourCell = document.createElement('td');
	var endDetails = this.getTranslatedLabel('endDetails');	
	endHourCell.appendChild(document.createTextNode(endDetails));
	EzWebExt.addClassName(endHourCell, 'title-arguments');
	tr8.appendChild(endHourCell);
	initialHour = parseInt((initialHour),10) +1;
	if (initialHour < 10)
		initialHour = '0'+initialHour;
	var td82 = document.createElement('td');
	var input8 = new StyledElements.StyledTextField({initialValue: initialHour+':'+halfHour});
	input8.insertInto(td82);
	tr8.appendChild(td82);
	table.appendChild(tr8);
	//Field of mails
	var tr6 = document.createElement('tr');
	var mailCell = document.createElement('td');
	var staff = this.getTranslatedLabel('staff');
	mailCell.appendChild(document.createTextNode(staff));
	EzWebExt.addClassName(mailCell, 'title-arguments');
	tr6.appendChild(mailCell);
	var td62 = document.createElement('td');
	var input6 = new StyledElements.StyledTextField();
	input6.insertInto(td62);
	tr6.appendChild(td62);
	table.appendChild(tr6);
	divForm.appendChild(table);

	this.formEvent.appendChild(divForm);        
	
	this.alternatives.showAlternative(3);
}

CalendarViewer.prototype.changeView = function(newView) {
	//View Month was selected
	if (this.viewMode == this.MONTH_VIEW){
		document.getElementById('monthButton').removeAttribute('disabled');
		if (newView == this.WEEK_VIEW){
			document.getElementById('weekButton').setAttribute('disabled', 'disabled');
			if (this.selection){
				this.cleanSelection();
				this.selectWeek(this.newYear, this.newMonth, this.newDay);
			}
		}
		else {
			document.getElementById('dayButton').setAttribute('disabled', 'disabled');
			if (this.selection){
				this.cleanSelection();
				this.selectDay(this.newYear, this.newMonth, this.newDay);
			}
		}
	}
	//View Week was selected
	else if (this.viewMode == this.WEEK_VIEW){
		document.getElementById('weekButton').removeAttribute('disabled');
		if (newView == this.MONTH_VIEW) {
			document.getElementById('monthButton').setAttribute('disabled', 'disabled');
			if (this.selection){
				this.cleanSelection();
				this.selectMonth(this.newYear, this.newMonth, this.newDay);
			}
		}
		else {
			document.getElementById('dayButton').setAttribute('disabled', 'disabled');
			if (this.selection){
				this.cleanSelection();
				this.selectDay(this.newYear, this.newMonth, this.newDay);
			}
		}
	}
	//View Day was selected
	else {
		document.getElementById('dayButton').removeAttribute('disabled');
		if (newView == this.MONTH_VIEW) {
			document.getElementById('monthButton').setAttribute('disabled', 'disabled');
			if (this.selection){
				this.cleanSelection();
				this.selectMonth(this.newYear, this.newMonth, this.newDay);
			}
		}
		else {
			document.getElementById('weekButton').setAttribute('disabled', 'disabled');
			if (this.selection){
				this.cleanSelection();
				this.selectWeek(this.newYear, this.newMonth, this.newDay);
			}
		}
	}
	
	this.viewMode = newView;
	//this.showEvents(this.newYear, this.newMonth, this.newDay);
}

/**
 * @param month 0-11
 */
CalendarViewer.prototype.changeToMonth = function(year, month, day) {
	this.selection = 0;
	this.newDay = day;
	this.newMonth = month;
	this.newYear = year;

        this.drawMonth(year, month);

	// prepare the data to
        var context = {yearToShow: year,
                       monthToShow: month,
                       listOfMonths: [],
                       calendarViewer: this};

        // Initial Month
	if (month == 0) {
	    month = 11;
	    year--;
	} else {
	    month--;
	}

	for (var i = 0; i < 3; i++) {
		if (this.events[year] === undefined)
			this.events[year] = new Array();

		if (this.events[year][month] === undefined) {
			context.listOfMonths.push([year, month]);
		}

		// Increment current Month taking into account the current year
		if (month == 11) {
			year++;
			month = 0;
		} else {
			month++;
		}
	}
	//if the url was removed
	while (this.iCalList[this.iCalPosition] == 1){
		if (this.iCalPosition == 0)
			this.lastListOfMonths = context.listOfMonths;
		this.iCalPosition++;
	}
	//when we have parsed every calendar
	if (this.iCalList[this.iCalPosition] == null){
		context.calendarViewer.iCalPosition = 0;
		context.calendarViewer.gettedCalendarNames = 1;
		if (this.events[context.yearToShow][context.monthToShow] != undefined)
			this.drawEvents(this.events[context.yearToShow][context.monthToShow]);
		return;
	}
		
        //For the next iterations of iCalList (excluding the first)
        if (this.iCalPosition != 0) {
        	context.loadingElement = document.createElement("div");
       		context.loadingElement.className = "loading";
        	this.calendarView.appendChild(context.loadingElement);
       	
               	context.listOfMonths = this.lastListOfMonths;
		this.sendGet(this.iCalList[this.iCalPosition],
	             EzWebExt.bind(this._parseDataCalendar, context),
	             "Error loading calendar data from \"%(url)s\".");
	}
	//For the first iCal in iCalList
	else if (context.listOfMonths.length != 0) {
        	context.loadingElement = document.createElement("div");
        	context.loadingElement.className = "loading";
        	this.calendarView.appendChild(context.loadingElement);        	
		this.lastListOfMonths = context.listOfMonths;
       		this.sendGet(this.iCalList[this.iCalPosition],
	             EzWebExt.bind(this._parseDataCalendar, context),
	             "Error loading calendar data from \"%(url)s\".");
	} else {
		this.drawEvents(this.events[context.yearToShow][context.monthToShow]);
	}
}

Array.prototype.has = function(property) {
	for (var i = 0; i < this.length; i++){
		if (this[i] == property)
			return 1;	
	}
	return 0;
}

CalendarViewer.prototype._parseDataCalendar = function(transport) {
	//Adding a function to sort all the events of days
	function sortByDate (a, b) {
        	var x = a.ev.getStartDate();
        	var y = b.ev.getStartDate();
        	return ((x < y) ? -1 : ((x > y) ? 1 : 0));
   	}


	var context = this;
	var calendarData = transport.responseText;
	var myCalReader = new iCalReader(); // Construction of the reader object	

	myCalReader.prepareData(calendarData); // Prepare and set the data for the parser.
	myCalReader.parse(); // Parse the data.
	myCalReader.sort(); // Sort the data.

	//Getting the calendar name to put in its field
	if (context.calendarViewer.gettedCalendarNames == 0){
		var divCalendar = $('iCal_'+ context.calendarViewer.iCalPosition);
		var nameCalendar;
		var propertiesCalendar = myCalReader.getCalendar().getPropertyNames();
		if (propertiesCalendar.has("X-WR-CALNAME")) {
			nameCalendar = myCalReader.getCalendar().getProperty("X-WR-CALNAME");
			context.calendarViewer.calendarNames[context.calendarViewer.iCalPosition] = nameCalendar;
		}
		else if (propertiesCalendar.has ("X-WR-CALDESC")) {
			nameCalendar = myCalReader.getCalendar().getProperty("X-WR-CALDESC");
			context.calendarViewer.calendarNames[context.calendarViewer.iCalPosition] = nameCalendar;
		}
		else {
			nameCalendar = 'Calendar '+ (context.calendarViewer.iCalPosition +1);
			context.calendarViewer.calendarNames[context.calendarViewer.iCalPosition] = nameCalendar;
		}
		divCalendar.appendChild(document.createTextNode(nameCalendar));
	}
	for (var index = 0; index < context.listOfMonths.length; index++) {
		var year = context.listOfMonths[index][0];
		var month = context.listOfMonths[index][1];

		if (context.calendarViewer.events[year][month] == null){
			var eventsByDay = new Array();
			for (var d = 1; d <= getDaysInMonth (month, year); d++)
				eventsByDay[d] = new Array();
		}
		else	//To concat the events of actual calendar to the previous events
			var eventsByDay = context.calendarViewer.events[year][month];
		
		var events = myCalReader.getCalendar().getEvents(); // Get all events in an array.
		for(var i=0; i<myCalReader.getCalendar().getNrOfEvents(); i++) { // Loop through all events.
			var event = myCalReader.getCalendar().getEventAtIndex(i); // A single event.
			//For events with a duration all the day avoiding to include them in the next day
			/*if ((context.calendarViewer.isAllDay(eventoCal.ev.getStartDate(),eventoCal.ev.getEndDate())==1) && 
				(eventoCal.ev.getEndDate().getDate()==d))
				continue;				
			*/
			var eventoCal = {ev: event, cal:context.calendarViewer.iCalPosition}
			var startDate = setTimezone(eventoCal.ev.getStartDate());
			var endDate = setTimezone(eventoCal.ev.getEndDate());
		
			var eventYear = startDate.getFullYear();
			if (startDate.getMonth() == month && eventYear == year) {
				var eventFirstDay = startDate.getDate();
				var eventLastDay = endDate.getDate();
				for (var j = eventFirstDay; j <= eventLastDay; j++) {
					if (j == eventLastDay) {
						if (!((endDate.getHours() == 0) && (endDate.getMinutes() == 0))){
							eventsByDay[j].push(eventoCal);
							//To sort events of different calendars
							eventsByDay[j].sort(sortByDate);
						}
					}
					else {
						eventsByDay[j].push(eventoCal);
						//To sort events of different calendars
						eventsByDay[j].sort(sortByDate);
					}
				}
			}

		} // End for each event
		context.calendarViewer.events[year][month] = eventsByDay;
	}

	context.calendarViewer.drawEvents(context.calendarViewer.events[context.yearToShow][context.monthToShow]);
	context.loadingElement.parentNode.removeChild(context.loadingElement);
	context.calendarViewer.iCalPosition = context.calendarViewer.iCalPosition +1;
	//For take the events of the second and next calendars (urlPrefn)
	if (context.calendarViewer.iCalList[context.calendarViewer.iCalPosition] != null){
		context.calendarViewer.changeToMonth(context.calendarViewer.newYear, context.calendarViewer.newMonth, context.calendarViewer.newDay);
	} else {//to establish the iCalPosition at the beginning of iCalList
		context.calendarViewer.iCalPosition = 0;
		context.calendarViewer.gettedCalendarNames = 1;
	}
}

/**
 * This function draw a month
 * @param month 0-11
 */
CalendarViewer.prototype.drawMonth = function(year, month) {
	var i, rows = 0;

        this.calendarContainer.clear();

	/* Drawing the calendar */
	var table = document.createElement ("table");
	table.setAttribute("cellSpacing", "0");
	table.setAttribute("cellPadding", "0");
	table.className = "calendar";

	/* Insert title row */
	row = getHeaderMonth (month, year);
	table.appendChild(row);

	/* Insert day names row */
	row = this.getWeekHeaders(this.weekStartingDay);
	table.appendChild(row);

	/* Comienzo a introducir los dias del mes en el calendario */
	row = document.createElement ("tr");

	/* Fill initial gaps */
	var startday = getStartDate (year, month);

	var days;
	if (startday < this.weekStartingDay)
		days = startday + (7 - this.weekStartingDay);
	else
		days = startday - this.weekStartingDay;

        /*Fill the day opf previous month;Modified for adding the days of previous month*/
        
        var actualDate = new Date(year, month);
        actualDate.setDate(actualDate.getDate() - days);
        
        for (i = 0; i < days; i++) {
		var td = document.createElement ("td");
		EzWebExt.addClassName(td, 'previousDay');
		td.setAttribute('id', 'previousday_'+ actualDate.getDate());
		var a = document.createElement ("a");
		if (month == 0) {
			a.setAttribute ('onclick', 'CalendarViewer.changeToMonth(' + (year - 1) + ', 11,'+ actualDate.getDate()+');'+
					'CalendarViewer.goToDay('+ (year - 1) + ', 11,'+ actualDate.getDate()+', 0);');
		} else {
			a.setAttribute ('onclick', 'CalendarViewer.changeToMonth(' + year + ',' + (month -1)+',' + actualDate.getDate()+ ');'+
					'CalendarViewer.goToDay('+ (year) + ','+(month-1)+','+ actualDate.getDate()+', 0);');
		}
		a.appendChild(document.createTextNode (actualDate.getDate()));
		td.appendChild (a);
		row.appendChild(td);
		actualDate.setDate(actualDate.getDate() + 1);
	}

	var dayofweek = startday;

	/* Fill with the days of the current month */
	for (var i = 1; i <= getDaysInMonth(month, year); i ++) {
		var td = document.createElement ("td");
		var a = document.createElement ("a");
		a.setAttribute ('onclick', 'CalendarViewer.goToDay(' + this.newYear + ',' + this.newMonth + ',' +i+', 1);');
		a.appendChild(document.createTextNode (i));
		td.appendChild (a);
		td.setAttribute ('id', "day_" + i);

		if ((i == this.todayDay) && (month == this.todayMonth) && (year == this.todayYear))
			EzWebExt.addClassName(td, 'today');

		if ((dayofweek == 6) || ( dayofweek == 0))
			EzWebExt.addClassName(td, 'weekend');

		row.appendChild (td);

		if (dayofweek == 6)
			dayofweek = 0;
		else
			dayofweek++;

		if (dayofweek == this.weekStartingDay) {
			table.appendChild(row);
			row = document.createElement ("tr");
			rows++;
		}
	}
	if (dayofweek != this.weekStartingDay) {
		table.appendChild(row);
		rows++;
	}
	//To complete the row of the last week
	//dayofweek has the day of the week for the last day drawn
	var i = 1;
	if (((this.weekStartingDay == 1)&&(dayofweek != 1))||((this.weekStartingDay == 0)&&(dayofweek!=0))){
		if (this.weekStartingDay == 1){
			if (dayofweek == 0)
				dayofweek = 7;
			var n = 7 - dayofweek;
		} else
			var n = 6 - dayofweek;

		for (n; n >= 0; n--){
			var td = document.createElement ("td");
			var a = document.createElement ("a");
			if (month == 11) {
				a.setAttribute ('onclick', 'CalendarViewer.changeToMonth(' + (year + 1) + ', 0,'+ i +');'+
						'CalendarViewer.goToDay('+ (year + 1) + ', 0,'+ i+', 0);');
			} else {
				a.setAttribute ('onclick', 'CalendarViewer.changeToMonth(' + year + ', ' + (month + 1)+ ',' + i +');'+
						'CalendarViewer.goToDay('+ year + ', '+ (month + 1)+ ',' + i +', 0);');
			}
			a.appendChild(document.createTextNode (i));
			EzWebExt.addClassName(td, 'nextDay');
			td.setAttribute('id', 'nextday_'+ i);
			td.appendChild (a);
			row.appendChild (td);
			i++;
		}
	}
		
	//To draw the last row if it's empty
	for (; rows < 6; rows++) {
		row = document.createElement ("tr");
		var n;
		for (n = 0; n < 7; n++) {
			var td = document.createElement ("td");
			var a = document.createElement ("a");
			if (month == 11) {
				a.setAttribute ('onclick', 'CalendarViewer.changeToMonth(' + (year + 1) + ', 0,'+ i + ');' +
						'CalendarViewer.goToDay('+ (year + 1) + ', 0,'+ i +', 0);');
			} else {
				a.setAttribute ('onclick', 'CalendarViewer.changeToMonth(' + year + ', ' + (month + 1)+ ',' + i + ');'+
						'CalendarViewer.goToDay('+ year + ', '+ (month + 1) + ',' + i +', 0);');
			}
			a.appendChild(document.createTextNode (i));
			EzWebExt.addClassName(td, 'nextDay');
			td.setAttribute('id', 'nextday_'+ i);
			td.appendChild (a);
			row.appendChild (td);
			i++;
		}
		table.appendChild(row);
	}

	/* Insert the table into the calendar container */
	this.calendarContainer.appendChild(table);
}

CalendarViewer.prototype.drawEvents = function (eventsByDay) {
	for (var i = 1; i < eventsByDay.length; i ++) {
		if (eventsByDay[i].length > 0){
			var daySelected = $('day_' + i);
			EzWebExt.addClassName(daySelected, 'hasevent');
			if (eventsByDay[i].length != 1)
				var msg = this.getTranslatedLabel("events");
			else
				var msg = this.getTranslatedLabel("event");
			daySelected.setAttribute ('title',eventsByDay[i].length + msg);			
		}
	}
}

CalendarViewer.prototype.cleanSelection = function () {
	this.selection = 0;
	//Cleaning selectionFirstWeek
	for (var i = 0; i < this.selectionFirstWeek.length; i++)
		EzWebExt.removeClassName(this.selectionFirstWeek[i], "selectionFirstWeek");
	this.selectionFirstWeek = [];
	
	//Cleaning selectionLastWeek
	for (var i = 0; i < this.selectionLastWeek.length; i++)
		EzWebExt.removeClassName(this.selectionLastWeek[i], "selectionLastWeek");
	this.selectionLastWeek = [];
	
	//Cleaning selectionWeekStart
	for (var i = 0; i < this.selectionWeekStart.length; i++)
		EzWebExt.removeClassName(this.selectionWeekStart[i], "selectionWeekStart");
	this.selectionWeekStart = [];
	
	//Cleaning selectionWeekEnd
	for (var i = 0; i < this.selectionWeekEnd.length; i++)
		EzWebExt.removeClassName(this.selectionWeekEnd[i], "selectionWeekEnd");
	this.selectionWeekEnd = [];

	// Remove previous day selection
	if (this.selectedDay) {
		EzWebExt.removeClassName(this.selectedDay, 'selected');
	        this.selectedDay = null;
	}
}

CalendarViewer.prototype.selectMonth = function (year, month, initialDay) {
	this.selection = 1;
        var startDate = new Date(year, month, 1);
        var endDate = new Date(month == 11 ? year + 1 : year,
                               month == 11 ? 0 : month + 1,
                               1);
        endDate.setDate(endDate.getDate() - 1);

        var currentDay = startDate;
        do {
        	var day = currentDay.getDate();
		var tdElement = $("day_" + day);

        	if (currentDay.getDay() == this.weekStartingDay) {
		 	EzWebExt.addClassName(tdElement, "selectionWeekStart");
			this.selectionWeekStart.push(tdElement);
		}

		EzWebExt.addClassName(tdElement, "selectionFirstWeek");
		this.selectionFirstWeek.push(tdElement);

                currentDay.setDate(currentDay.getDate() + 1);
                if (currentDay.getDay() == this.weekStartingDay) {
		 	EzWebExt.addClassName(tdElement, "selectionWeekEnd");
			this.selectionWeekEnd.push(tdElement);
		}
        } while (currentDay.getDay() != this.weekStartingDay);
        
        /*Added for draw selectionFirstWeek for the second Week on the top of month*/
        var n = this.selectionFirstWeek.length +1;
        for (n; n <= 7; n ++){
        	var tdElement = $("day_" + n);
        	EzWebExt.addClassName(tdElement, "selectionFirstWeek");
        	this.selectionFirstWeek.push(tdElement);
        }

        while (currentDay <= endDate) {
        	var day = currentDay.getDate();
		var tdElement = $("day_" + day);

        	if (currentDay.getDay() == this.weekStartingDay) {
		 	EzWebExt.addClassName(tdElement, "selectionWeekStart");
			this.selectionWeekStart.push(tdElement);
		}

		currentDay.setDate(currentDay.getDate() + 1);
        	if (currentDay.getDay() == this.weekStartingDay) {
		 	EzWebExt.addClassName(tdElement, "selectionWeekEnd");
			this.selectionWeekEnd.push(tdElement);
		}
        }
	
        for (var currentDay = new Date(endDate); true; currentDay.setDate(currentDay.getDate() - 1)) {
        	var day = currentDay.getDate();
		var tdElement = $("day_" + day);

		EzWebExt.addClassName(tdElement, "selectionLastWeek");
		this.selectionLastWeek.push(tdElement);

        	if (currentDay.getDay() == this.weekStartingDay)
        		break;
        }
        //Added to complete the LastWeek for the previous of the last week
        var m = 7 - this.selectionLastWeek.length;
        var lastday = currentDay.getDate() - 1;
        for (m; m > 0; m --){
        	var tdElement = $("day_" + lastday);
        	EzWebExt.addClassName(tdElement, "selectionLastWeek");
        	this.selectionLastWeek.push(tdElement);
        	lastday = lastday -1;
        }        

	// Put the selectionWeekStart on the first day of the month if needed
	var tdElement = $("day_" + startDate.getDate());
	if (!EzWebExt.hasClassName(tdElement, "selectionWeekStart")) {
		EzWebExt.addClassName(tdElement, "selectionWeekStart");
		this.selectionWeekStart.push(tdElement);
	}
	
	// Add selectionWeekEnd class on the last day of the month if needed	
	var tdElement = $("day_" + endDate.getDate());
	if (!EzWebExt.hasClassName(tdElement, "selectionWeekEnd")) {
		EzWebExt.addClassName(tdElement, "selectionWeekEnd");
		this.selectionWeekEnd.push(tdElement);
	}
}

CalendarViewer.prototype.selectWeek = function (year, month, day) {
	this.selection = 1;
	var startDate = new Date(year, month, day);
	var startDay = startDate.getDay();
	if (startDay != this.weekStartingDay) {
	        if (startDay < this.weekStartingDay)
	        	var inc = (this.weekStartingDay - startDay) -7;
	        else
			var inc = -(startDay - this.weekStartingDay);

		startDate.setDate(startDate.getDate() + inc);
	}

	//Put the selectionWeekStart at the beginning of week
	if (this.newMonth == startDate.getMonth()){
		var tdElement = $("day_" + startDate.getDate());
		EzWebExt.addClassName(tdElement, "selectionWeekStart");
		this.selectionWeekStart.push(tdElement);
	} else {
		var tdElement = $("previousday_" + startDate.getDate());
		EzWebExt.addClassName(tdElement, "selectionWeekStart");
		this.selectionWeekStart.push(tdElement);
	}
	
	var endDate = new Date(startDate);
	endDate.setDate(endDate.getDate() + 6);

        for (var currentDay = startDate; currentDay <= endDate; currentDay.setDate(currentDay.getDate() + 1)) {
        	var day = currentDay.getDate();
        	if (this.newMonth == currentDay.getMonth())
			var tdElement = $("day_" + day);
		else if(this.newYear < currentDay.getFullYear()){
			var tdElement = $("nextday_" + day);
		} else if((this.newMonth > currentDay.getMonth())||(this.newYear > currentDay.getFullYear())){
			var tdElement = $("previousday_" + day);
		} else
			var tdElement = $("nextday_" + day);
		EzWebExt.addClassName(tdElement, "selectionFirstWeek");
		this.selectionFirstWeek.push(tdElement);
		EzWebExt.addClassName(tdElement, "selectionLastWeek");
		this.selectionLastWeek.push(tdElement);      	
        }

	//Put the selectionWeekEnd at the end of Week
	if (this.newMonth == endDate.getMonth())
		var tdElement = $("day_" + endDate.getDate());
	else
		var tdElement = $("nextday_" + endDate.getDate());
	EzWebExt.addClassName(tdElement, "selectionWeekEnd");
	this.selectionWeekEnd.push(tdElement);
}

CalendarViewer.prototype.selectDay = function (year, month, day) {
	this.selection = 1;
        // Select given day	
	this.newYear = year;
	this.newMonth = month;
	this.newDay = day;
	this.selectedDay = $("day_" + this.newDay);
	EzWebExt.addClassName(this.selectedDay, 'selected');
}
/**
 * @param month 0-11
 */
CalendarViewer.prototype.goToDay = function (year, month, day, show) {
	this.cleanSelection();
	this.newYear = year;
	this.newMonth = month;
	this.newDay = day;

	switch (this.viewMode) {
	case this.MONTH_VIEW:
	    this.selectMonth(year, month, day);
	    break;
	case this.WEEK_VIEW:
	    this.selectWeek(year, month, day);
	    break;
	case this.DAY_VIEW:
	    this.selectDay(year, month, day);
	    break;
	}	

        // Show events: show==1
        if (show) {
        	this.showEvents(year, month, day);
        	this.alternatives.showAlternative(1);
        }
}

/**
 * @param month 0-11
 *
 */
CalendarViewer.prototype.showEvents = function (year, month, day) {
	switch (this.viewMode) {
	case this.MONTH_VIEW:
	    this.showMonthEvents(year, month, day);
	    break;
	case this.WEEK_VIEW:
	    this.showWeekEvents(year, month, day);
	    break;
	case this.DAY_VIEW:
	    this.showDayEvents(year, month, day);
	    break;
	}
}


/**
 * @param month 0-11
 */
CalendarViewer.prototype.showDayEvents = function (year, month, initialDay) {
	initialDay = initialDay ? initialDay : 1;
	var startDate = new Date(year, month, initialDay);
	var endDate = new Date(startDate);
	endDate.setDate(endDate.getDate() + 1);
	//var msg = this.getTranslatedLabel("titleEventsDay");
	//var monthLabel = this.getTranslatedLabel(formatMonth(month));
	//msg = EzWebExt.interpolate(msg, {year: year, month: monthLabel, day: initialDay});
	var msg = '';
	this.showEventsByRange(startDate, endDate, msg);
}

CalendarViewer.prototype.showWeekEvents = function (year, month, initialDay) {
	initialDay = initialDay ? initialDay : 1;
	
	var startDate = new Date(year, month, initialDay);
	if (startDate.getDay() != 1) { //Para espaÃ±ol!!
		var dayOfWeek = startDate.getDay();
		if (!dayOfWeek)
			dayOfWeek = 7;
		
		startDate.setDate(startDate.getDate() - (dayOfWeek - 1));
	}
	//For english
	if (this.weekStartingDay == 0){
		startDate.setDate(startDate.getDate() - 1);
	}
	var endDate = new Date(startDate.getTime())
	endDate.setDate(endDate.getDate() + 7 );
	
	var msg = this.getTranslatedLabel("titleEventsWeek");
	if (this.weekStartingDay == 0)
		msg = EzWebExt.interpolate(msg, {week: endDate.getWeekNumber()});
	else
		msg = EzWebExt.interpolate(msg, {week: startDate.getWeekNumber()});
	
	this.showEventsByRange(startDate, endDate, msg);
}

/**
 * @param month 0-11
 */
CalendarViewer.prototype.showMonthEvents = function (year, month, initialDay) {
        initialDay = initialDay ? initialDay : 1;

        //var startDate = new Date(year, month, initialDay);
	//To start always from 1
	var startDate = new Date(year, month, 1);
        var endDate = new Date(month == 11 ? year + 1 : year,
                               month == 11 ? 0 : month + 1,
                               1);
	var msg = this.getTranslatedLabel("titleEventsMonth");
	var monthLabel = this.getTranslatedLabel(formatMonth(month));
	msg = EzWebExt.interpolate(msg, {year: year, month: monthLabel});
        this.showEventsByRange(startDate, endDate, msg);
}

CalendarViewer.prototype.clearEvents = function () {
	this.eventsContainer.clear();
	this.eventsContainer.appendChild(this.menu);
}


CalendarViewer.prototype.createDivHours = function() {
	var divSchedule = document.createElement('div');
	var divHourSchedule;
	var divHalfHourSchedule;
	//First of all create a field to include the events which have a duration all the day
	divHourSchedule = document.createElement ('div');
	divHourSchedule.setAttribute('id', 'hourSchedule_25');
	EzWebExt.addClassName(divHourSchedule, 'hour_schedule_create');
	divSchedule.appendChild (divHourSchedule);
	
	
	//For create the fields which contain all the hours of a day
	for (var i = 0; i < 24; i++){
		if (i < 10)
			var n = '0'+i;
		else
			var n = i;
		
		divHourSchedule = document.createElement ('div');
		divHourSchedule.setAttribute('id', 'hourSchedule_'+n);
		divHourSchedule.appendChild (document.createTextNode (n+':00'));
		
		divHalfHourSchedule = document.createElement ('div');
		divHalfHourSchedule.setAttribute('id', 'halfSchedule_'+n);
		
		var today = new Date (this.todayYear, this.todayMonth, this.todayDay);
		var date = new Date (this.newYear, this.newMonth, this.newDay);
		this.previousSelection = 1;
		//We create events for this day
		divHourSchedule.setAttribute ('onclick', "CalendarViewer.createEvent("+ date.getDate() +","+ (date.getMonth()+1) + 
					","+ date.getFullYear()+ "," +i+",0);");
		EzWebExt.addClassName(divHourSchedule, 'hour_schedule_create');
		
		divHalfHourSchedule.setAttribute ('onclick', "CalendarViewer.createEvent("+ date.getDate() +","+ (date.getMonth()+1) + 
					","+ date.getFullYear()+ "," +i+",30);");
		
		EzWebExt.addClassName(divHalfHourSchedule, 'half_schedule_create');
		
		divSchedule.appendChild (divHourSchedule);
		divSchedule.appendChild (divHalfHourSchedule);
	}
	//var width = divHourSchedule.parentNode.offsetWidth;
	
	return divSchedule;
}

CalendarViewer.prototype.isAllDay = function(startDate,endDate){
	var st = setTimezone (startDate);
	var end = setTimezone (endDate);
	if ((end.getDate() -1) == st.getDate())
		return 1;
}


CalendarViewer.prototype.addEventsSchedule = function(divSchedule,eventsday){
	//For check each event and put it in its hours checking initial and end time
	this.clearEventsByHour();
	
	var listOverlap = new Array();
	
	for (var i = 0; i < eventsday.length; i++) {
		var evento = eventsday[i].ev;
		var color = eventsday[i].cal;
		var title = evento.getProperty("SUMMARY");
		var startDate = evento.getStartDate();
		var endDate = evento.getEndDate();
		var startEventHour = parseInt(formatHour(startDate).split(':')[0], 10);
		var startEventMinutes = parseInt(formatHour(startDate).split(':')[1], 10);
		var endEventHour = parseInt(formatHour(endDate).split(':')[0], 10);
		var endEventMinutes = parseInt(formatHour(endDate).split(':')[1], 10);
			
		//If the duration of event is all the day
		//if (evento.getProperty("TRANSP")=="TRANSPARENT"){ 
		if (this.isAllDay(startDate, endDate) == 1) {
			if (this.newDay == endDate.getDate())
				continue;
			startEventHour = 25;
			startEventMinutes = 0;
			endEventHour = 0;
			endEventMinutes = 0;
		}

		var nStartEventHour = startEventHour;
		if (nStartEventHour < 10)
			nStartEventHour = '0'+ startEventHour;
				
		//Looking for the div where starts the event
		if (startEventMinutes >= 30)
			var startHourDiv = $("halfSchedule_"+ nStartEventHour);
		else
			var startHourDiv = $("hourSchedule_"+ nStartEventHour);

		//Getting the duration of event in minutes
		var eventDuration = ((endEventHour * 60) + endEventMinutes)-((startEventHour * 60) + startEventMinutes);
				
		var offsetMinute = (startHourDiv.offsetHeight)/30;
		
		//Create the div for the event
		var drawnEvent = document.createElement ('div');
		drawnEvent.setAttribute ('id', 'event'+i);
		EzWebExt.addClassName(drawnEvent, 'drawn_event');
		drawnEvent.setAttribute ('style', 'background-color :'+ getColor (color));
		//drawnEvent.setAttribute ('style', 'background-color :'+ getColor (i));
		drawnEvent.setAttribute ('title', this.calendarNames[color]);

		//Put the minimum value of the height during half hour
		if (eventDuration <= 30){
			drawnEvent.style.top = startHourDiv.offsetTop + "px";
			drawnEvent.style.height = (startHourDiv.offsetHeight-7) + "px";
			drawnEvent.short = 1;
		} else {
			startEventMinutes = (startEventMinutes >= 30) ? (startEventMinutes - 30) : startEventMinutes;
			var startOffset = startHourDiv.offsetTop + (offsetMinute * startEventMinutes);
			var eventOffset = offsetMinute * eventDuration;
			drawnEvent.style.top = startOffset + "px";
			drawnEvent.style.height = (eventOffset-7) + "px";
		}
		
		//Set the width position of the drawn Event depending on the events in its hours
		var overlap = 0;
		//var listOverlap = new Array();
		for (var j = startEventHour; j <= endEventHour; j++){
			var n = this.eventsByHour[j].length;
			this.eventsByHour[j][n]= drawnEvent;
			if (n != 0)
				overlap = 1;
			if (j == endEventHour){
				if (overlap){
					this.leftOffset = this.leftOffset +10;
					drawnEvent.style.left = this.leftOffset + "px";
					drawnEvent.style.right = this.rightOffset + "px";
					listOverlap.push(drawnEvent);
				} else {
					this.leftOffset = 60;
					drawnEvent.style.left = this.leftOffset + "px";
					drawnEvent.style.right = this.rightOffset + "px";
				}
			}			
		}
		
		//Create the event details Div
		var currentDay = new Date(this.newYear, this.newMonth, this.newDay);
		var details = this.setDetails(evento, currentDay, i);
		//On click the title of events the details will be shown	
		var hourDiv = document.createElement ('div');
		if ((this.isAllDay(startDate, endDate) == 1)){
			hourDiv.appendChild (document.createTextNode (startDate.getDate()+"/"+(startDate.getMonth()+1)+"/"+startDate.getFullYear()));
			drawnEvent.style.left = this.leftOffset + "px";
			drawnEvent.style.right = this.rightOffset + "px";
			
		}
		else
			hourDiv.appendChild (document.createTextNode (formatHour(startDate)+" - "+formatHour(endDate)));

		EzWebExt.addClassName(hourDiv, 'hour_drawn_event');
		//In the case of a short time event
		if (drawnEvent.short) {
			hourDiv.appendChild (document.createTextNode (" : "+ title));
			drawnEvent.appendChild (hourDiv);
		} else {
			var titleDiv = document.createElement ('div');
			EzWebExt.addClassName(titleDiv, 'title_drawn_event');
			titleDiv.appendChild (document.createTextNode (title));
			drawnEvent.appendChild (hourDiv);
			drawnEvent.appendChild (titleDiv);
		}
		
		drawnEvent.setAttribute ('onclick', "CalendarViewer.showDetails("+ currentDay.getDate() + "," + i +");");
		//Adding the details, but it wont be visible
		drawnEvent.appendChild(details);
		var context = {evento: evento, gadget: this};
		drawnEvent.addEventListener ("click",
		     EzWebExt.bind(function () {
		         this.gadget.descriptionEvent.set(this.evento.getProperty("DESCRIPTION"));
		         this.gadget.titleEvent.set(this.evento.getProperty("SUMMARY"));
		         this.gadget.placeEvent.set(this.evento.getProperty("LOCATION"));
		         this.gadget.dateEvent.set(this.evento.getStartDate());
		     }, context),
		     true);
		 divSchedule.appendChild (drawnEvent);
	}
			//Set the width using the right side
	var size = listOverlap.length;
	for (var k = 0; k < size; k++){
		var dr = listOverlap.pop();
		dr.style.right = this.rightOffset + "px";
		this.rightOffset = this.rightOffset + 10;
	}
	this.rightOffset = 5;
}


CalendarViewer.prototype.setDetails = function (event, currentDay, i){
	var eventProperties = event.getPropertyNames();
	var title = '';
	var desc = '';
	var location = '';

	if (eventProperties.has("SUMMARY")) {
		title = event.getProperty("SUMMARY");
	}
	if (eventProperties.has("DESCRIPTION")) {
		desc = event.getProperty("DESCRIPTION");
	}
	if (eventProperties.has("LOCATION")) {
		location = event.getProperty("LOCATION");
	}
	var startDate = event.getStartDate();
	var eventEndDate = event.getEndDate();
	var hourEvent = formatHour(startDate);
	
	//Details contains the details for each event
	var details = document.createElement('div');
	//Title
	var pTitle = document.createElement('p');
	pTitle.setAttribute('id', "title_" + currentDay.getDate() + "_" + i);
	pTitle.setAttribute('content', title);
	details.appendChild(pTitle);
	//Description
	var pDescription = document.createElement('p');
	pDescription.setAttribute('id', "description_" + currentDay.getDate() + "_" + i);
	pDescription.setAttribute('content', desc);
	details.appendChild(pDescription);
	//Place
	var pPlace = document.createElement('p');
	pPlace.setAttribute('id', "place_" + currentDay.getDate() + "_" + i);
	pPlace.setAttribute('content', location);
	details.appendChild(pPlace);
	//Initial Time
	var pInitial = document.createElement('p');
	pInitial.setAttribute('id', "initial_" + currentDay.getDate() + "_" + i);
	if (event.getProperty("TRANSP") == "TRANSPARENT")
		pInitial.setAttribute('content', '00:00');
	else
		pInitial.setAttribute('content', formatHour(startDate));
	details.appendChild(pInitial);
	//End Time
	var pEnd = document.createElement('p');
	pEnd.setAttribute('id', "end_" + currentDay.getDate() + "_" + i);
	if (event.getProperty("TRANSP") == "TRANSPARENT")
		pEnd.setAttribute('content', '23:59');
	else
		pEnd.setAttribute('content', formatHour(eventEndDate));
	details.appendChild(pEnd);			
	//Put not visible the div of details
	details.setAttribute('style', 'display:none');
	return details;	
}

/**
 *
 * @param {Date} startDate
 * @param {Date} endDate
 */
CalendarViewer.prototype.showEventsByRange = function (startDate, endDate, title) {
	this.clearEvents();
	
	function fil(element, index, array){
		return (element != 1);
	}
	
	if (this.iCalList.filter(fil).length == 0){
		this.alert('Debe introducir al menos un calendario');
		return;
	}
	
	var divEvents = document.createElement ('div');
	//Adding the option of creating an event
        if (this.viewMode != this.DAY_VIEW){
		var createButton = document.createElement("button");
		createButton.id = "create_event_button";
		createButton.appendChild(document.createTextNode(this.getTranslatedLabel('create_event_button')));
		this.previousSelection = 1;
		createButton.setAttribute('onclick', 'CalendarViewer.createEvent('+startDate.getDate() +',' + (startDate.getMonth()+1) + ',' + startDate.getFullYear() +',9,0);');
		divEvents.appendChild(createButton);
       }	
	
	//Adding the title
	var divTitle = document.createElement('div');
	divTitle.appendChild (document.createTextNode (title));
	EzWebExt.addClassName(divTitle, 'header_events_title');
	divEvents.appendChild(divTitle);	

	for (var currentDay = startDate; currentDay < endDate; currentDay.setDate(currentDay.getDate() + 1)) {
		var eventsday = this.events[currentDay.getFullYear()][currentDay.getMonth()][currentDay.getDate()];
		
		if ((eventsday.length === 0)&&(this.viewMode != this.DAY_VIEW))
			continue;

                // Draw day header
		var date = currentDay.getDate() + "-" + (currentDay.getMonth()+1) + "-" + currentDay.getFullYear();
		var dateDiv = document.createElement('div');
		dateDiv.appendChild (document.createTextNode(date));
		//Button to add an event in this date
		var today = new Date(this.todayYear, this.todayMonth, this.todayDay);
		EzWebExt.addClassName(dateDiv, 'mainDate_event');
		var buttonAddEvent = document.createElement('button');
		EzWebExt.addClassName(buttonAddEvent, 'button_event');
		buttonAddEvent.appendChild(document.createTextNode("+"));
		buttonAddEvent.setAttribute('onclick', 'CalendarViewer.createEvent('+ currentDay.getDate() + ',' + (currentDay.getMonth()+1) + ',' + currentDay.getFullYear() +',9,0);');
		dateDiv.appendChild(buttonAddEvent);
		divEvents.appendChild(dateDiv);

		var divDateEvent = document.createElement ('div');
		//If day mode is selected we create  a div with hours
		if (this.viewMode == this.DAY_VIEW) {
			var divSchedule = this.createDivHours();
			divEvents.appendChild(divSchedule);			
			this.eventsContainer.appendChild(divEvents);
			this.leftOffset = 60;
			this.rightOffset = 5;
			this.addEventsSchedule (divSchedule, eventsday);
			return;
		}

		for (var i = 0; i < eventsday.length; i++) {
			var evento = eventsday[i].ev;
			var color = eventsday[i].cal;
			
			var title = evento.getProperty("SUMMARY");
			var startDate = evento.getStartDate();
			var endEventDate = evento.getEndDate();

			var p = document.createElement ('div');
			var div1 = document.createElement ('div');
			var div2 = document.createElement ('div');

			var hourEvent = formatHour(startDate);
			var endHourEvent = formatHour(endEventDate);
			
			div1.appendChild (document.createTextNode (hourEvent+'-'+endHourEvent));
			EzWebExt.addClassName(div1, 'startDate_event');
			
			div2.appendChild (document.createTextNode (title));
			div2.setAttribute('style', 'background-color:'+getColor(color));
			div2.setAttribute('title',this.calendarNames[color]);
			EzWebExt.addClassName(div2, 'title_event');
			
			//Create the event details Div
			var details = this.setDetails(evento, currentDay, i);

			//On click the title of events the details will be shown
			div2.setAttribute ('onclick', "CalendarViewer.showDetails("+ currentDay.getDate() + "," + i +");");
			//Adding the details, but it wont be visible
			div2.appendChild(details);
			
			var context = {evento: evento, gadget: this};
			div2.addEventListener ("click",
				     EzWebExt.bind(function () {
				         this.gadget.descriptionEvent.set(this.evento.getProperty("DESCRIPTION"));
				         this.gadget.titleEvent.set(this.evento.getProperty("SUMMARY"));
				         this.gadget.placeEvent.set(this.evento.getProperty("LOCATION"));
				         this.gadget.dateEvent.set(this.evento.getStartDate());
				     }, context),
				     true);
			
			p.appendChild (div1);
			p.appendChild (div2);
			divDateEvent.appendChild (p);
		}
		divEvents.appendChild (divDateEvent);
	}	
	this.eventsContainer.appendChild(divEvents);
}

CalendarViewer.prototype.getWeekHeaders = function(startday) {
	var headerTitle;
	var row = document.createElement ("tr");

	var sunday = document.createElement ("td");
	EzWebExt.addClassName(sunday, 'header-week');
	headerTitle = this.getTranslatedLabel("sunday");
	sunday.appendChild (document.createTextNode (headerTitle));

	if (startday == 0)
		row.appendChild (sunday);

	var monday = document.createElement ("td");
	EzWebExt.addClassName(monday, 'header-week');
	headerTitle = this.getTranslatedLabel("monday");
	monday.appendChild (document.createTextNode (headerTitle));
	row.appendChild (monday);

	var tuesday = document.createElement ("td");
	EzWebExt.addClassName(tuesday, 'header-week');
	headerTitle = this.getTranslatedLabel("tuesday");
	tuesday.appendChild (document.createTextNode (headerTitle));
	row.appendChild (tuesday);

	var wednesday = document.createElement ("td");
	EzWebExt.addClassName(wednesday, 'header-week');
	headerTitle = this.getTranslatedLabel("wednesday");
	wednesday.appendChild (document.createTextNode (headerTitle));
	row.appendChild (wednesday);

	var thursday = document.createElement ("td");
	EzWebExt.addClassName(thursday, 'header-week');
	headerTitle = this.getTranslatedLabel("thursday");	
	thursday.appendChild (document.createTextNode (headerTitle));
	row.appendChild (thursday);

	var friday = document.createElement ("td");
	EzWebExt.addClassName(friday, 'header-week');
	headerTitle = this.getTranslatedLabel("friday");
	friday.appendChild (document.createTextNode (headerTitle));
	row.appendChild (friday);

	var saturday = document.createElement ("td");
	EzWebExt.addClassName(saturday, 'header-week');
	headerTitle = this.getTranslatedLabel("saturday");
	saturday.appendChild (document.createTextNode (headerTitle));
	row.appendChild (saturday);

	if (startday == 1)
		row.appendChild(sunday);

	return row;
}

CalendarViewer.prototype.toJSON = function(object) {
	return JSON.stringify(object, function (key, value) {
	    return value;
	});
}

/* Instanciate the Gadget class */
CalendarViewer = new CalendarViewer();



/******************************************************************************/



/* This function returns the days in a month */
function getDaysInMonth (month, year) {
	var daysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31]

	if ((month==1)&&(year%4==0)&&((year%100!=0)||(year%400==0)))
		return 29;
	else
		return daysInMonth[month];
}

/* this function returns the day of the week when the month starts */
function getStartDate (year, month) {
	var calendar = new Date(year, month, 1);
	return calendar.getDay();
}

function getHeaderMonth (month, year) {
	var row = document.createElement ("tr");
	EzWebExt.addClassName(row, 'header-month');
	var td1 = document.createElement ("td");
	var a1 = document.createElement ("a");
	a1.appendChild (document.createTextNode ('<<'));
	if (month == 0) {
		a1.setAttribute ('onclick', 'CalendarViewer.changeToMonth(' + (year - 1) + ', 11, 1);');
	} else {
		a1.setAttribute ('onclick', 'CalendarViewer.changeToMonth(' + year + ',' + (month -1) + ',1);');
	}
	td1.appendChild (a1);
	row.appendChild (td1);
	var monthrow = document.createElement ('td');
	monthrow.setAttribute ('colspan', 5);
	monthrow.appendChild(document.createTextNode((month + 1) + '/' + year ));
	row.appendChild (monthrow);
	td1 = '';
	a1 = '';
	td1 = document.createElement ("td");
	a1 = document.createElement ("a");
	a1.appendChild (document.createTextNode ('>>'));
	if (month == 11) {
		a1.setAttribute ('onclick', 'CalendarViewer.changeToMonth(' + (year + 1) + ', 0, 1);');
	} else {
		a1.setAttribute ('onclick', 'CalendarViewer.changeToMonth(' + year + ', ' + (month + 1) + ',1);');
	}
	td1.appendChild (a1);
	row.appendChild (td1);
	return row;
}


function setTimezone(date){
	//Depends on the timer zone
	var utc = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
	return utc;
}

function formatDate(longDate) {
	var date = new Date(longDate);
	//Depende de la zona horaria
	//Offset: -60 si es Madrid
	var utc = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
	return formatDateNumber(utc.getDate()) + "/" + formatDateNumber(utc.getMonth()+1) + "/" + utc.getFullYear() + " " + formatDateNumber(utc.getHours()) + ":" + formatDateNumber(utc.getMinutes());
}

function formatHour(longDate) {
	var date = new Date(longDate);
	var utc = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
	return formatDateNumber(formatDateNumber(utc.getHours()) + ":" + formatDateNumber(utc.getMinutes()));
}

function formatDateNumber (day) {
	return ((day < 10)? "0":"") + day;
}
function formatMonth(month) {
	var months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
	return months[month];
}

function getColor(n){
	if (n > 5)
		n = n % 6;
	//var colors = ["darkRed", "green", "darkBlue", "purple", "cadetBlue", "black"];
	var colors = ["#FFFF99", "#99CCFF", "#FFCCFF", "#CCFFCC", "#FFAAAA", "#9999FF"];
	return colors[n];
}

/** Returns the number of the week in year, as defined in ISO 8601. */
Date.prototype.getWeekNumber = function() {
        var d = new Date(this.getFullYear(), this.getMonth(), this.getDate(), 0, 0, 0);
        var DoW = d.getDay();
        d.setDate(d.getDate() - (DoW + 6) % 7 + 3); // Nearest Thu
        var ms = d.valueOf(); // GMT
        d.setMonth(0);
        d.setDate(4); // Thu in Week 1
        return Math.round((ms - d.valueOf()) / (7 * 864e5)) + 1;
}
