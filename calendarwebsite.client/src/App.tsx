import { useEffect, useState } from "react";
import "./App.css";
import { User, UserInfo } from "./interfaces/type";
import { EventInput } from "@fullcalendar/core";
import UserSearch from "./components/UserSearch";
import Calendar from "./components/Calendar";
import Header from "./components/Header";

function App() {
  const [userList, setUserList] = useState<UserInfo[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [inputValue, setInputValue] = useState("");

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

  const contents =
    userList.length === 0 ? (
      <p className="italic text-gray-600 dark:text-neutral-50 text-center">
        <em>Loading... Please refresh once the ASP.NET backend has started.</em>
      </p>
    ) : (
      <div className="calendar-container w-full">
        <UserSearch
          userList={userList}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          inputValue={inputValue}
          setInputValue={setInputValue}
          setEvents={setEvents}
        />
        <Calendar events={events} />
      </div>
    );

  return (
    <div className="app-container min-h-screen w-full px-4 sm:px-6 lg:px-8 py-8">
      <Header />
      {contents}
    </div>
  );
}

export default App;
