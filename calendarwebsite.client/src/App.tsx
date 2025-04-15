import { useEffect, useState } from "react";
import "./App.css";
import { User, UserInfo } from "./interfaces/type";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { EventInput, EventContentArg } from "@fullcalendar/core";
import { useCombobox } from "downshift";
import { Popover } from "react-tiny-popover";
import ThemeToggle from "./components/ThemeToggle";

// Helper function to normalize Vietnamese characters for case-insensitive comparison
const normalizeString = (str: string) => {
  if (!str) return "";

  // First convert to lowercase
  str = str.toLowerCase();

  // Replace Vietnamese characters with their base forms for more flexible matching
  const charMap: Record<string, string> = {
    à: "a",
    á: "a",
    ả: "a",
    ã: "a",
    ạ: "a",
    ă: "a",
    ằ: "a",
    ắ: "a",
    ẳ: "a",
    ẵ: "a",
    ặ: "a",
    â: "a",
    ầ: "a",
    ấ: "a",
    ẩ: "a",
    ẫ: "a",
    ậ: "a",
    đ: "d",
    è: "e",
    é: "e",
    ẻ: "e",
    ẽ: "e",
    ẹ: "e",
    ê: "e",
    ề: "e",
    ế: "e",
    ể: "e",
    ễ: "e",
    ệ: "e",
    ì: "i",
    í: "i",
    ỉ: "i",
    ĩ: "i",
    ị: "i",
    ò: "o",
    ó: "o",
    ỏ: "o",
    õ: "o",
    ọ: "o",
    ô: "o",
    ồ: "o",
    ố: "o",
    ổ: "o",
    ỗ: "o",
    ộ: "o",
    ơ: "o",
    ờ: "o",
    ớ: "o",
    ở: "o",
    ỡ: "o",
    ợ: "o",
    ù: "u",
    ú: "u",
    ủ: "u",
    ũ: "u",
    ụ: "u",
    ư: "u",
    ừ: "u",
    ứ: "u",
    ử: "u",
    ữ: "u",
    ự: "u",
    ỳ: "y",
    ý: "y",
    ỷ: "y",
    ỹ: "y",
    ỵ: "y",
  };

  // Return both original and normalized text for comparison
  return [...str].map((char) => charMap[char] || char).join("");
};

function App() {
  const [userList, setUserList] = useState<UserInfo[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [popoverEvent, setPopoverEvent] = useState<EventContentArg | null>(
    null
  );

  // Enhanced filtering function to handle Vietnamese characters
  const getFilteredItems = (inputValue: string) => {
    if (!inputValue) return userList;

    const normalizedInput = normalizeString(inputValue);

    return userList.filter((user) => {
      if (!user.fullName) return false;

      // Check both original text and normalized text
      const normalizedName = normalizeString(user.fullName);

      // Try both original match and normalized match
      return (
        user.fullName.toLowerCase().includes(inputValue.toLowerCase()) ||
        normalizedName.includes(normalizedInput) ||
        user.email.toLowerCase().includes(inputValue.toLowerCase())
      );
    });
  };

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getItemProps,
    highlightedIndex,
    reset,
  } = useCombobox({
    items: getFilteredItems(inputValue),
    inputValue,
    onInputValueChange: ({ inputValue }) => {
      setInputValue(inputValue || "");
    },
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        setSelectedUser(selectedItem);
        setInputValue(selectedItem.fullName || "");
      }
    },
    itemToString: (item) => (item ? item.fullName || "" : ""),
  });

  async function fetchUserList() {
    try {
      const response = await fetch("/api/DataOnly_APIaCheckIn");
      if (response.ok) {
        const data: UserInfo[] = await response.json();
        setUserList(data);
      } else {
        console.error("Failed to fetch user list");
      }
    } catch (error) {
      console.error("Error fetching user list:", error);
    }
  }

  async function fetchUserCheckInData(userId: string) {
    try {
      const response = await fetch(`/api/DataOnly_APIaCheckIn/${userId}`);
      if (response.ok) {
        const data: User[] = await response.json();

        // Transform check-in data to separate in/out calendar events and adjust for UTC+7
        const utcOffset = 7; // UTC+7 timezone offset
        const calendarEvents = data.flatMap((user: User, index) => [
          {
            id: `checkin-${user.userId}-${index}`,
            title: `${user.fullName} (Check In)`,
            start: new Date(
              new Date(user.inAt).getTime() + utcOffset * 3600000
            ),
            end: new Date(new Date(user.inAt).getTime() + utcOffset * 3600000),
            allDay: false,
            display: "block",
            extendedProps: {
              userId: user.userId,
              type: "check-in",
              status: user.lateIn ? "late" : user.earlyIn ? "early" : "on-time",
            },
          },
          {
            id: `checkout-${user.userId}-${index}`,
            title: `${user.fullName} (Check Out)`,
            start: new Date(
              new Date(user.outAt).getTime() + utcOffset * 3600000
            ),
            end: new Date(new Date(user.outAt).getTime() + utcOffset * 3600000),
            allDay: false,
            display: "block",
            extendedProps: {
              userId: user.userId,
              type: "check-out",
              status: user.lateOut
                ? "late"
                : user.earlyOut
                ? "early"
                : "on-time",
            },
          },
        ]);
        setEvents(calendarEvents);
      } else {
        console.error("Failed to fetch user check-in data");
      }
    } catch (error) {
      console.error("Error fetching user check-in data:", error);
    }
  }

  useEffect(() => {
    fetchUserList();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchUserCheckInData(selectedUser.email);
    }
  }, [selectedUser]);

  // Create a button to clear selection
  const handleClearSelection = () => {
    setSelectedUser(null);
    setInputValue("");
    setEvents([]);
    reset();
  };

  // Get filtered items based on the current input value
  const filteredItems = getFilteredItems(inputValue);

  const contents =
    userList.length === 0 ? (
      <p className="italic text-gray-600 dark:text-neutral-50 text-center">
        <em>Loading... Please refresh once the ASP.NET backend has started.</em>
      </p>
    ) : (
      <div className="calendar-container w-full">
        <div className="mb-5">
          <div className="w-full max-w-md mx-auto relative">
            <div>
              <div className="flex gap-2 items-center">
                <input
                  {...getInputProps()}
                  placeholder="Search for a user"
                  className="flex-1 p-2 sm:p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 transition-colors duration-200 text-sm sm:text-base"
                />
                {inputValue && (
                  <button
                    onClick={handleClearSelection}
                    className="shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-600 cursor-pointer transition-colors text-neutral-900 dark:text-neutral-50 text-sm sm:text-base"
                  >
                    Clear
                  </button>
                )}
              </div>
              <ul
                {...getMenuProps()}
                className={`list-none p-0 m-0 max-h-48 overflow-y-auto absolute bg-white dark:bg-neutral-700 w-full z-10 rounded-lg shadow-lg mt-1 ${
                  isOpen && filteredItems.length > 0
                    ? "border border-gray-300 dark:border-gray-600"
                    : ""
                }`}
              >
                {isOpen &&
                  filteredItems.map((item, index) => (
                    <li
                      key={item.email}
                      {...getItemProps({ item, index })}
                      className={`p-2 sm:p-3 cursor-pointer text-sm sm:text-base ${
                        highlightedIndex === index
                          ? "bg-gray-100 dark:bg-neutral-600"
                          : "bg-white dark:bg-neutral-700"
                      } ${
                        index < filteredItems.length - 1
                          ? "border-b border-gray-100 dark:border-gray-700"
                          : ""
                      } text-neutral-900 dark:text-neutral-50`}
                    >
                      {item.fullName} - {item.email}
                    </li>
                  ))}
                {isOpen && filteredItems.length === 0 && inputValue && (
                  <li className="p-2 sm:p-3 text-gray-500 dark:text-gray-300 text-sm sm:text-base">
                    No matching users found
                  </li>
                )}
              </ul>
            </div>
          </div>
          {selectedUser && (
            <div className="mt-3 text-center">
              <p className="text-sm sm:text-base">
                Selected User: <strong>{selectedUser.fullName}</strong>
              </p>
            </div>
          )}
        </div>
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

            // Create popover content
            const popoverContent = (
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg shadow-lg max-w-xs transition-colors duration-200">
                <button
                  onClick={() => setPopoverEvent(null)}
                  className="float-right text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
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
                      {status}
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
                      {status}
                    </span>
                  </div>
                )}
                <p className="my-2 flex justify-between text-neutral-800 dark:text-neutral-100 text-sm sm:text-base">
                  <strong className="text-neutral-900 dark:text-neutral-50">
                    Date:
                  </strong>{" "}
                  {new Date(eventInfo.event.start!).toLocaleDateString()}
                </p>
                <p className="my-2 flex justify-between text-neutral-800 dark:text-neutral-100 text-sm sm:text-base">
                  <strong className="text-neutral-900 dark:text-neutral-50">
                    Time:
                  </strong>{" "}
                  {new Date(eventInfo.event.start!).toLocaleTimeString()}
                </p>
                <p className="my-2 flex justify-between text-neutral-800 dark:text-neutral-100 text-sm sm:text-base">
                  <strong className="text-neutral-900 dark:text-neutral-50">
                    Type:
                  </strong>{" "}
                  {type === "check-in" ? "Check In" : "Check Out"}
                </p>
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
                      ? "Employee checked in late"
                      : status === "early"
                      ? "Employee checked in early"
                      : "Employee checked in on time"}
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
                      ? "Employee checked out late"
                      : status === "early"
                      ? "Employee checked out early"
                      : "Employee checked out on time"}
                  </div>
                )}
              </div>
            );

            return (
              <Popover
                isOpen={popoverEvent?.event.id === eventInfo.event.id}
                positions={["top", "bottom", "left", "right"]} // Preferred positions in order
                padding={10}
                onClickOutside={() => setPopoverEvent(null)}
                content={popoverContent}
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

  return (
    <div className="app-container min-h-screen w-full px-4 sm:px-6 lg:px-8 py-8">
      <ThemeToggle />
      <div className="max-w-7xl mx-auto">
        <h1
          id="tableLabel"
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-neutral-700 dark:text-neutral-50 text-center sm:text-left"
        >
          Staff Check-in Calendar
        </h1>
        <p className="mb-6 text-neutral-700 dark:text-neutral-50 text-center sm:text-left text-sm sm:text-base">
          Monthly view of staff check-in/out times
        </p>
        {contents}
      </div>
    </div>
  );
}

export default App;
