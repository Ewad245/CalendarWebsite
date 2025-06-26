import FullCalendar from "@fullcalendar/react"; // Import FullCalendarRef
import dayGridPlugin from "@fullcalendar/daygrid";
import { EventInput, EventContentArg } from "@fullcalendar/core";
import { Popover } from "react-tiny-popover";
import { useState, useMemo } from "react"; // Add useRef
import { useTranslation } from "react-i18next";
import EventPopover from "./EventPopover";
import enLocale from "@fullcalendar/core/locales/en-gb";
import viLocale from "@fullcalendar/core/locales/vi";
import { RefObject } from "@fullcalendar/core/preact.js";

interface CalendarProps {
  events: EventInput[];
  calendarRef: RefObject<FullCalendar>; // Add calendarRef prop
  onDateRangeChange?: (month: number, year: number) => void;
}

export default function Calendar({
  events,
  calendarRef,
  onDateRangeChange,
}: CalendarProps) {
  const { t } = useTranslation();
  const [popoverEvent, setPopoverEvent] = useState<EventContentArg | null>(
    null
  );
  const [currentViewInfo, setCurrentViewInfo] = useState<{
    month: number;
    year: number;
  } | null>(null);

  // Memoize the event content renderer for better performance
  const renderEventContent = useMemo(() => {
    return (eventInfo: EventContentArg) => {
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
          containerClassName="popover-container z-50"
          align="start"
        >
          <div
            className={`fc-event-main-content fc-event-${status} cursor-pointer ${
              type === "absent" ? "bg-red-500 text-white" : ""
            } ${type === "leave" ? "bg-amber-500 text-white" : ""}`}
            data-type={type}
            onClick={() =>
              setPopoverEvent(
                popoverEvent?.event.id === eventInfo.event.id ? null : eventInfo
              )
            }
          >
            <div>{eventInfo.event.title}</div>
            {!eventInfo.event.allDay && (
              <small>
                {new Date(eventInfo.event.start!).toLocaleTimeString()}
              </small>
            )}
            {type === "absent" && (
              <div className="text-xs font-semibold mt-1">
                {t("calendar.events.absent")}
              </div>
            )}
            {type === "leave" && (
              <div className="text-xs font-semibold mt-1">
                {eventInfo.event.extendedProps.leaveType ||
                  t("calendar.events.leave")}
                {eventInfo.event.extendedProps.note && (
                  <div className="text-xs italic truncate max-w-[150px]">
                    {eventInfo.event.extendedProps.note}
                  </div>
                )}
              </div>
            )}
          </div>
        </Popover>
      );
    };
  }, [popoverEvent, setPopoverEvent, t]);

  // Handle date range changes when calendar view changes
  const handleDatesSet = (_dateInfo: any) => {
      if (calendarRef.current) {
          const dateRef = calendarRef.current.getApi().getDate();
          const month = dateRef.getMonth();
          const year = dateRef.getFullYear();
    // Only trigger if the month or year has changed
    if (
      !currentViewInfo ||
      currentViewInfo.month !== month ||
      currentViewInfo.year !== year
    ) {
        setCurrentViewInfo({month, year});

        // Call the callback if provided
        if (onDateRangeChange) {
            onDateRangeChange(month + 1, year);
        }
    }
    }
  };

  // Memoize calendar options for better performance
  const calendarOptions = useMemo(
    () => ({
      locales: [enLocale, viLocale],
      locale: t("language.english") === "English" ? enLocale : viLocale,
      themeSystem: "bootstrap5",
      plugins: [dayGridPlugin],
      initialView: "dayGridMonth",
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth",
      },
      buttonText: {
        today: t("calendar.navigation.today"),
        month: t("calendar.views.month"),
        week: t("calendar.views.week"),
        day: t("calendar.views.day"),
      },
      height: "auto",
      dayMaxEvents: window.innerWidth < 768 ? 2 : 4,
      slotMinTime: "06:00:00",
      slotMaxTime: "20:00:00",
      eventTimeFormat: {
        hour: "numeric" as "numeric",
        minute: "2-digit" as "2-digit",
        meridiem: "short" as "short",
      },
      viewClassNames: "responsive-calendar-view",
      datesSet: handleDatesSet,
    }),
    [t, onDateRangeChange, currentViewInfo]
  );

  return (
    <div className="calendar-container w-full h-full shadow-lg rounded-lg p-4 bg-white dark:bg-neutral-800">
      <FullCalendar
        ref={calendarRef} // Attach the ref to FullCalendar
        {...calendarOptions}
        events={events}
        eventContent={renderEventContent}
      />
    </div>
  );
}
