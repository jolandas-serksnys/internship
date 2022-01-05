class Event {
    constructor(title, date, startTime, endTime, type, description = '') {
        this.title = title;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.type = type;
        this.description = description;
    }
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const days = ['Mo', 'Tu',' We', 'Th', 'Fr', 'Sa', 'Su'];
const eventTypes = ['Call', 'Meeting', 'Out of office'];

let storage = window.sessionStorage;
let events;
let activeMonthDate;
let deletePopup;

function getEvents() {
    events = storage.getItem('events');

    if(events) {
        events = JSON.parse(events);
    } else {
        events = [
            new Event('Meet with manager', new Date('2022-01-03').toJSON(), '12:10', '14:17', 'Meeting', 'A very importan meeting with the shift manager'),
            new Event('Call Susie', new Date('2022-01-03').toJSON(), '14:30', '14:45', 'Call', 'Discuss the new project with Susie'),
            new Event('Call James', new Date('2022-01-04').toJSON(), '10:10', '10:30', 'Call'),
            new Event('Carl is out of the office', new Date('2022-01-22').toJSON(), '01:00', '18:00', 'Out of office'),
            new Event('A very important meeting with a very long title', new Date('2022-01-25').toJSON(), '14:00', '16:00', 'Meeting')
        ];

        storage.setItem('events', JSON.stringify(events));
    }
}

function addEvent(event) {
    events.push(event);
    storage.setItem('events', JSON.stringify(events));

    const eventDate = new Date(event.date);
    if(eventDate.getMonth() == activeMonthDate.getMonth()) {
        const monthEvents = getMonthEvents(events, activeMonthDate.getFullYear(), activeMonthDate.getMonth());
        const dayEvents = getDayEvents(monthEvents, eventDate.getDate());

        recreateDayCell(eventDate.getDate(), dayEvents);
    }
}

function deleteEvent(eventToDelete) {
    events = events.filter(event => event != eventToDelete);
    storage.setItem('events', JSON.stringify(events));

    const eventDate = new Date(eventToDelete.date);
    if(eventDate.getMonth() == activeMonthDate.getMonth()) {
        const monthEvents = getMonthEvents(events, activeMonthDate.getFullYear(), activeMonthDate.getMonth());
        const dayEvents = getDayEvents(monthEvents, eventDate.getDate());

        recreateDayCell(eventDate.getDate(), dayEvents);
    }
}

function getMonthEvents(eventsArr, year, month) {
    return eventsArr.filter(event => {
        let date = new Date(event.date);
        return date.getFullYear() == year && date.getMonth() == month;
    });
}

function getDayEvents(eventsArr, day) {
    return eventsArr.filter(event => {
        let date = new Date(event.date);
        return date.getDate() == day;
    });
}

function getActiveMonthDate() {
    activeMonthDate = storage.getItem('activeMonth');
    if(activeMonthDate) {
        activeMonthDate = new Date(JSON.parse(activeMonthDate));
    } else {
        activeMonthDate = new Date();
        storage.setItem('activeMonth', JSON.stringify(activeMonthDate));
    }
}

function updateActiveMonthDate() {
    storage.setItem('activeMonth', JSON.stringify(activeMonthDate));
}

function adjustMonthDisplay() {
    let monthText = document.querySelector('#month-text');
    monthText.innerHTML = activeMonthDate.getFullYear() + ' ' + months[activeMonthDate.getMonth()];
}

function populateMonthsViewHeader() {
    let monthsViewHeader = document.querySelector('.calendar .month-view .header');
    days.forEach(day => {
        let cell = document.createElement('div');
        cell.innerHTML = day;
        monthsViewHeader.appendChild(cell);
    });
}

function populateMonthViewDaysGrid() {
    const monthEvents = getMonthEvents(events, activeMonthDate.getFullYear(), activeMonthDate.getMonth());
    const monthStartsAt = new Date(activeMonthDate.getFullYear(), activeMonthDate.getMonth(), 1);
    const monthEndsAt = new Date(activeMonthDate.getFullYear(), activeMonthDate.getMonth() + 1, 0);

    let monthsViewDaysGrid = document.querySelector('.calendar .month-view .days-grid');
    monthsViewDaysGrid.innerHTML = "";
    
    if(monthStartsAt.getDay() - 1 >= 1) {
        let fillerCell = document.createElement('div');
        fillerCell.classList.add('filler-' + (monthStartsAt.getDay() - 1));
        monthsViewDaysGrid.appendChild(fillerCell);
    }

    for (let day = 1; day <= monthEndsAt.getDate(); day++) {
        const dayEvents = getDayEvents(monthEvents, day);
        monthsViewDaysGrid.appendChild(createDayCell(day, dayEvents));
    }
}

function createDayCell(day, dayEvents) {
    let cell = document.createElement(dayEvents.length > 0 ? 'div' : 'button');
    cell.classList.add('day');
    cell.setAttribute('id', 'day-' + day);

    let dayNum = document.createElement(dayEvents.length < 0 ? 'div' : 'button');
    dayNum.classList.add('day-num');
    dayNum.innerHTML = `<span>${day}</span><span class='add-text'>Add event</span>`;
    cell.appendChild(dayNum);

    if(dayEvents.length == 0) {
        cell.onclick = function() {
            showAddEventForm(day);
        }
    } else {
        dayNum.onclick = function() {
            showAddEventForm(day);
        }
    
        dayEvents.forEach(event => {
            cell.appendChild(createEventElement(event));
        });
    }

    return cell;
}

function recreateDayCell(day, dayEvents) {
    let monthsViewDaysGrid = document.querySelector('.calendar .month-view .days-grid');

    let cellToReplace = document.querySelector('#day-' + day);
    let newCell = createDayCell(day, dayEvents);

    monthsViewDaysGrid.replaceChild(newCell, cellToReplace);
}

function createEventElement(event) {
    let eventButton = document.createElement('button');
    eventButton.classList.add('event', 'event-' + event.type.replaceAll(' ', '-').toLowerCase());
    eventButton.innerHTML = event.title;
    eventButton.onclick = function() {
        showDetailedView(event);
    };

    return eventButton;
}

function showDetailedView(event) {
    toggleFormVisibility('new-event-form', false);
    toggleFormVisibility('detailed-event-form', true);

    const eventDate = new Date(event.date);

    let eventForm = document.querySelector('#detailed-event-form');
    eventForm.querySelector('#title').value = event.title;
    let month = eventDate.getMonth() + 1;
    month = month < 10 ? '0' + month : month; 
    let day = eventDate.getDate();
    day = day < 10 ? '0' + day : day;
    eventForm.querySelector('#date').value = eventDate.getFullYear() + '-' + month + '-' + day;
    eventForm.querySelector('#start-time').value = event.startTime;
    eventForm.querySelector('#end-time').value = event.endTime;
    eventForm.querySelector('#type').value = event.type;
    eventForm.querySelector('#description').value = event.description;

    eventForm.querySelector('#delete-event').onclick = function(e) {
        showDeleteConfirmation(event);
    };

    eventForm.querySelector('#close').onclick = function() {
        toggleFormVisibility('detailed-event-form', false);
    };
}

function showAddEventForm(day = null) {
    toggleFormVisibility('new-event-form', true);
    toggleFormVisibility('detailed-event-form', false);

    let eventForm = document.querySelector('#new-event-form');
    eventForm.querySelector('#close').onclick = function() {
        toggleFormVisibility('new-event-form', false);
    };
    
    console.log(activeMonthDate.getMonth())
    if(day) {
        let month = activeMonthDate.getMonth() + 1;
        month = month < 10 ? '0' + month : month; 
        day = day < 10 ? '0' + day : day;
        eventForm.querySelector('#date').value = activeMonthDate.getFullYear() + '-' + month + '-' + day;
    }
}

function toggleFormVisibility(formId, visible) {
    deletePopup.classList.add('hidden');

    let eventForm = document.querySelector('#'+ formId);
    eventForm.reset();

    if(visible) {
        eventForm.classList.remove('hidden');
    } else {
        eventForm.classList.add('hidden');
    }
}

function showDeleteConfirmation(event) {
    deletePopup.classList.remove('hidden');
    deletePopup.querySelector("#event-title").innerHTML = event.title;

    deletePopup.querySelector('#cancel').onclick = function() {
        deletePopup.classList.add('hidden');
    }

    deletePopup.querySelector('#confirm').onclick = function() {
        deletePopup.classList.add('hidden');
        deleteEvent(event);
        toggleFormVisibility('detailed-event-form', false);
    }
}

function onNewEventFormSubmit(e) {
    e.preventDefault();

    const data = new FormData(e.target);
    const value = Object.fromEntries(data);

    if(!eventTypes.includes(value['type']) || value['title'].trim() === '') {
        return;
    }

    addEvent(new Event(value['title'], new Date(value['date']).toJSON(), value['start-time'], value['end-time'], value['type'], value['description']));
    toggleFormVisibility('new-event-form', false);
}   

window.onload = function() {
    getEvents();
    getActiveMonthDate();
    adjustMonthDisplay();
    populateMonthsViewHeader();
    populateMonthViewDaysGrid();

    deletePopup = document.querySelector('#delete-popup');
    let newEventForm = document.querySelector('#new-event-form');
    let newEventFormStartTime = newEventForm.querySelector('#start-time');
    let newEventFormEndTime = newEventForm.querySelector('#end-time');

    document.querySelector('#previous-month').onclick = function() {
        activeMonthDate.setMonth(activeMonthDate.getMonth() - 1);
        updateActiveMonthDate();
        adjustMonthDisplay();
        populateMonthViewDaysGrid();
    };

    document.querySelector('#next-month').onclick = function() {
        activeMonthDate.setMonth(activeMonthDate.getMonth() + 1);
        updateActiveMonthDate();
        adjustMonthDisplay();
        populateMonthViewDaysGrid();
    };

    newEventForm.onsubmit = function(e) {
        onNewEventFormSubmit(e);
    }

    // Check if start time is less than end time
    newEventFormStartTime.oninput = function(e) {
        let inputValue = e.target.value.split(':');
        let compareValue = newEventFormEndTime.value;
        if(compareValue) {
            inputValue = new Date(activeMonthDate.getFullYear(), 0, 1, inputValue[0], inputValue[1]);
            compareValue = compareValue.split(':');
            compareValue = new Date(activeMonthDate.getFullYear(), 0, 1, compareValue[0], compareValue[1])

            if(inputValue > compareValue) {
                newEventFormEndTime.value = null;
            }
        }
    }

    // Check if end time is more than start time
    newEventFormEndTime.oninput = function(e) {
        let inputValue = e.target.value.split(':');
        let compareValue = newEventFormStartTime.value;
        if(compareValue) {
            inputValue = new Date(activeMonthDate.getFullYear(), 0, 1, inputValue[0], inputValue[1]);
            compareValue = compareValue.split(':');
            compareValue = new Date(activeMonthDate.getFullYear(), 0, 1, compareValue[0], compareValue[1])

            if(inputValue < compareValue) {
                newEventFormStartTime.value = null;
            }
        }
    }
}