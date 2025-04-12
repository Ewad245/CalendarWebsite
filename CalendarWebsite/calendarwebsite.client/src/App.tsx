import { useEffect, useState } from "react";
import "./App.css";
import { User, UserInfo } from "./interfaces/type";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { EventInput, EventContentArg } from "@fullcalendar/core";
import { useCombobox } from "downshift";
import { Popover } from "react-tiny-popover";

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
        normalizedName.includes(normalizedInput)
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
      const response = await fetch(
        "http://localhost:5194/api/DataOnly_APIaCheckIn"
      );
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
      const response = await fetch(
        `http://localhost:5194/api/DataOnly_APIaCheckIn/${userId}`
      );
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
      fetchUserCheckInData(selectedUser.userId);
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
      <p>
        <em>Loading... Please refresh once the ASP.NET backend has started.</em>
      </p>
    ) : (
      <div className="calendar-container">
        <div className="calendar-search-container">
          <div>
            <div className="flex gap-2 flex-wrap">
              <input
                {...getInputProps()}
                placeholder="Search for a user"
                className="calendar-search-input"
              />
              {inputValue && (
                <button
                  onClick={handleClearSelection}
                  className="calendar-search-button"
                >
                  Clear
                </button>
              )}
            </div>
            <ul
              {...getMenuProps()}
              className={`calendar-search-list ${
                isOpen && filteredItems.length > 0
                  ? "border border-gray-300 shadow-md"
                  : ""
              }`}
            >
              {isOpen &&
                filteredItems.map((item, index) => (
                  <li
                    key={item.userId}
                    {...getItemProps({ item, index })}
                    className={`calendar-search-item ${
                      highlightedIndex === index ? "bg-gray-100" : "bg-white"
                    }`}
                  >
                    {item.fullName}
                  </li>
                ))}
              {isOpen && filteredItems.length === 0 && inputValue && (
                <li className="calendar-search-item-empty">
                  No matching users found
                </li>
              )}
            </ul>
          </div>
        </div>
        {selectedUser && (
          <div className="calendar-selected-user">
            <p>
              Selected User: <strong>{selectedUser.fullName}</strong>
            </p>
          </div>
        )}
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
              <div className="event-popover-content">
                <button
                  onClick={() => setPopoverEvent(null)}
                  className="event-popover-close-btn"
                >
                  ✕
                </button>
                <h4>{eventInfo.event.title}</h4>
                <div className="flex items-center mb-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full mr-2 ${
                      status === "late"
                        ? "bg-red-600"
                        : status === "early"
                        ? "bg-green-600"
                        : "bg-blue-500"
                    }`}
                  ></div>
                  <span
                    className={`capitalize font-semibold ${
                      status === "late"
                        ? "text-red-600"
                        : status === "early"
                        ? "text-green-600"
                        : "text-blue-500"
                    }`}
                  >
                    {status}
                  </span>
                </div>
                <div className="event-popover-detail">
                  <strong>Date:</strong>{" "}
                  {new Date(eventInfo.event.start!).toLocaleDateString()}
                </div>
                <div className="event-popover-detail">
                  <strong>Time:</strong>{" "}
                  {new Date(eventInfo.event.start!).toLocaleTimeString()}
                </div>
                <div className="event-popover-detail">
                  <strong>Type:</strong>{" "}
                  {type === "check-in" ? "Check In" : "Check Out"}
                </div>
                {type === "check-in" && (
                  <div
                    className={`event-popover-status ${
                      status === "late"
                        ? "event-popover-status-late"
                        : status === "early"
                        ? "event-popover-status-early"
                        : "event-popover-status-ontime"
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
                    className={`event-popover-status ${
                      status === "late"
                        ? "event-popover-status-late"
                        : status === "early"
                        ? "event-popover-status-early"
                        : "event-popover-status-ontime"
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
                  className={`fc-event-main-content fc-event-${status}`}
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
    <div className="app-container">
      <h1 id="tableLabel">Staff Check-in Calendar</h1>
      <p>Monthly view of staff check-in/out times</p>
      {contents}
    </div>
  );
}

export default App;
