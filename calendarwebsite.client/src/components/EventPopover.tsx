import { EventContentArg } from "@fullcalendar/core";
import { useTranslation } from 'react-i18next';

interface EventPopoverProps {
  eventInfo: EventContentArg;
  onClose: () => void;
}

export default function EventPopover({
  eventInfo,
  onClose,
}: EventPopoverProps) {
  const { type, status } = eventInfo.event.extendedProps;
  const { t } = useTranslation();

  return (
    <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg shadow-lg max-w-xs transition-colors duration-200">
      <button
        onClick={onClose}
        className="float-right text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
        aria-label={t("calendar.popover.close")}
      >
        ✕
      </button>
      <h4 className="text-base sm:text-lg font-semibold mb-2 text-neutral-900 dark:text-neutral-50">
        {eventInfo.event.title}
      </h4>
      {type === "check-in" && (
        <div className="flex items-center mb-2">
          <div
            className={`w-2.5 h-2.5 rounded-full mr-2 ${
              status === "late"
                ? "bg-red-600 dark:bg-red-500"
                : status === "early"
                ? "bg-green-600 dark:bg-green-500"
                : "bg-blue-600 dark:bg-blue-500"
            }`}
          ></div>
          <span
            className={`capitalize font-bold text-sm sm:text-base ${
              status === "late"
                ? "text-red-700 dark:text-red-400"
                : status === "early"
                ? "text-green-700 dark:text-green-400"
                : "text-blue-700 dark:text-blue-400"
            }`}
          >
            {status === "late" ? t("attendance.table.late") : t("attendance.table.early")}
          </span>
        </div>
      )}
      {type === "check-out" && (
        <div className="flex items-center mb-2">
          <div
            className={`w-2.5 h-2.5 rounded-full mr-2 ${
              status === "late"
                ? "bg-green-600 dark:bg-green-500"
                : status === "early"
                ? "bg-red-600 dark:bg-red-500"
                : "bg-blue-600 dark:bg-blue-500"
            }`}
          ></div>
          <span
            className={`capitalize font-bold text-sm sm:text-base ${
              status === "late"
                ? "text-green-700 dark:text-green-400"
                : status === "early"
                ? "text-red-700 dark:text-red-400"
                : "text-blue-700 dark:text-blue-400"
            }`}
          >
            {status === "late" ? t("attendance.table.late") : t("attendance.table.early")}
          </span>
        </div>
      )}
      {type === "leave" && (
        <div className="flex items-center mb-2">
          <div className="w-2.5 h-2.5 rounded-full mr-2 bg-amber-600 dark:bg-amber-500"></div>
          <span className="capitalize font-bold text-sm sm:text-base text-amber-700 dark:text-amber-400">
            {t("calendar.events.leave")}
          </span>
        </div>
      )}
      <p className="my-2 flex justify-between text-neutral-800 dark:text-neutral-100 text-sm sm:text-base">
        <strong className="text-neutral-900 dark:text-neutral-50">{t("calendar.popover.details")}:</strong>{" "}
        {new Date(eventInfo.event.start!).toLocaleDateString()}
      </p>
      {type !== "absent" && (
        <p className="my-2 flex justify-between text-neutral-800 dark:text-neutral-100 text-sm sm:text-base">
          <strong className="text-neutral-900 dark:text-neutral-50">{t("calendar.popover.time")}:</strong>{" "}
          {new Date(eventInfo.event.start!).toLocaleTimeString()}
        </p>
      )}
      <p className="my-2 flex justify-between text-neutral-800 dark:text-neutral-100 text-sm sm:text-base">
        <strong className="text-neutral-900 dark:text-neutral-50">{t("attendance.label.type")}:</strong>{" "}
        {type === "check-in" 
          ? t("attendance.table.checkIn") 
          : type === "check-out" 
            ? t("attendance.table.checkOut")
            : type === "leave"
              ? t("calendar.events.leave")
              : t("calendar.events.absent")}
      </p>
      {type === "leave" && eventInfo.event.extendedProps.leaveType && (
        <p className="my-2 flex justify-between text-neutral-800 dark:text-neutral-100 text-sm sm:text-base">
          <strong className="text-neutral-900 dark:text-neutral-50">{t("calendar.events.leave")}:</strong>{" "}
          {eventInfo.event.extendedProps.leaveType}
        </p>
      )}
      {type === "leave" && eventInfo.event.extendedProps.note && (
        <div className="mt-2 p-2 bg-neutral-100 dark:bg-neutral-700 rounded text-sm">
          <strong className="block mb-1 text-neutral-900 dark:text-neutral-50">{t("calendar.popover.note")}:</strong>
          <p className="text-neutral-800 dark:text-neutral-200">
            {eventInfo.event.extendedProps.note}
          </p>
        </div>
      )}
      {type === "check-in" && (
        <div
          className={`mt-2.5 p-2 rounded text-xs sm:text-sm ${
            status === "late"
              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              : status === "early"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          }`}
        >
          {status === "late"
            ? t("attendance.message.employeeCheckedInLate")
            : status === "early"
            ? t("attendance.message.employeeCheckedInEarly")
            : t("attendance.message.employeeCheckedInOnTime")}
        </div>
      )}
      {type === "check-out" && (
        <div
          className={`mt-2.5 p-2 rounded text-xs sm:text-sm ${
            status === "late"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : status === "early"
              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          }`}
        >
          {status === "late"
            ? t("attendance.message.employeeCheckedOutLate")
            : status === "early"
            ? t("attendance.message.employeeCheckedOutEarly")
            : t("attendance.message.employeeCheckedOutOnTime")}
        </div>
      )}
      {type === "absent" && (
        <div className="mt-2.5 p-2 rounded text-xs sm:text-sm bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          {t("calendar.events.absent")}
        </div>
      )}
    </div>
  );
}
