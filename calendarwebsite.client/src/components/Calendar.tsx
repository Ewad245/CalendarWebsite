import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { EventInput, EventContentArg } from "@fullcalendar/core";
import { Popover } from "react-tiny-popover";
import { useState } from "react";
import EventPopover from "./EventPopover";

interface CalendarProps {
  events: EventInput[];
}

export default function Calendar({ events }: CalendarProps) {
  const [popoverEvent, setPopoverEvent] = useState<EventContentArg | null>(
    null
  );

  return (
    <div className="calendar-container w-full">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth",
        }}
        height="auto"
        dayMaxEvents={window.innerWidth < 768 ? 2 : 4}
        slotMinTime="06:00:00"
        slotMaxTime="20:00:00"
        eventTimeFormat={{
          hour: "numeric",
          minute: "2-digit",
          meridiem: "short",
        }}
        viewClassNames="responsive-calendar-view"
        eventContent={(eventInfo) => {
          const { type, status } = eventInfo.event.extendedProps;

          return (
            <Popover
              isOpen={popoverEvent?.event.id === eventInfo.event.id}
              positions={["top", "bottom", "left", "right"]}
              padding={10}
              onClickOutside={() => setPopoverEvent(null)}
              content={
                <EventPopover
                  eventInfo={eventInfo}
                  onClose={() => setPopoverEvent(null)}
                />
              }
              containerClassName="popover-container"
            >
              <div
                className={`fc-event-main-content fc-event-${status} cursor-pointer`}
                data-type={type}
                onClick={() =>
                  setPopoverEvent(
                    popoverEvent?.event.id === eventInfo.event.id
                      ? null
                      : eventInfo
                  )
                }
              >
                <div>{eventInfo.event.title}</div>
                <small>
                  {new Date(eventInfo.event.start!).toLocaleTimeString()}
                </small>
              </div>
            </Popover>
          );
        }}
      />
    </div>
  );
}
