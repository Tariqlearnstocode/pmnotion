import React from 'react';
import { Field, Entry } from '../../types';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // needed for dayClick

interface CalendarViewProps {
  fields: Field[];
  entries: Entry[];
  // Add props for event click handlers, date selection, etc. later
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // Or Date object, depending on parsing
  // extendedProps can hold the original entry or other data
  extendedProps: { 
    entry: Entry;
  };
}

const CalendarView: React.FC<CalendarViewProps> = ({ fields, entries }) => {

  // Find the first 'date' type field to use for the calendar event date
  const dateField = fields.find(f => f.type === 'date');
  // Find the primary text field for the event title (e.g., 'Title')
  const titleField = fields.find(f => f.type === 'text'); // Or use a specific name like 'Title'

  // Transform entries into FullCalendar events
  const events: CalendarEvent[] = dateField ? entries.map(entry => {
    const dateValue = entry.entry_values.find(ev => ev.field_id === dateField.id)?.value;
    const titleValue = titleField ? entry.entry_values.find(ev => ev.field_id === titleField.id)?.value : 'Untitled Event';
    
    // Basic validation/parsing for dateValue
    let eventDate: string | null = null;
    if (dateValue) {
        try {
            // Attempt to create a valid date string (YYYY-MM-DD)
            const parsedDate = new Date(dateValue);
            if (!isNaN(parsedDate.getTime())) {
                eventDate = parsedDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
            }
        } catch (e) {
            console.warn(`Invalid date value for entry ${entry.id}:`, dateValue);
        }
    }

    return {
      id: entry.id,
      title: titleValue || 'Untitled Event',
      date: eventDate || '', // FullCalendar needs a date string
      extendedProps: { entry }
    };
  }).filter(event => event.date) : []; // Filter out events without a valid date

  if (!dateField) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 text-center text-gray-500">
        This collection needs a field with type 'date' to be displayed on the calendar.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
       {/* Add basic FullCalendar styling later if needed */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={events}
        editable={false} // Set to true later for drag/drop resizing
        selectable={true} // Allow date selection
        selectMirror={true}
        dayMaxEvents={true} // Show a "+more" link when too many events
        // Add eventClick handler later
        // eventClick={(clickInfo) => {
        //   alert('Event clicked: ' + clickInfo.event.title);
        //   console.log(clickInfo.event.extendedProps.entry); 
        // }}
      />
    </div>
  );
};

export default CalendarView; 