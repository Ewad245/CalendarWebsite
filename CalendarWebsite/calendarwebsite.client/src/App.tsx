import { useEffect, useState } from "react";
import "./App.css";
import { User, UserInfo } from "./interfaces/type";
import { EventInput } from "@fullcalendar/core";
import UserSearch from "./components/UserSearch";
import Calendar from "./components/Calendar";
import Header from "./components/Header";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AttendanceDataPage from "./pages/AttendanceDataPage";

function CalendarPage() {
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
              data: user,
            },
            backgroundColor: user.lateIn
              ? "#ef4444" // red for late
              : user.earlyIn
              ? "#22c55e" // green for early
              : "#3b82f6", // blue for on-time
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
              status: user.earlyOut
                ? "early"
                : user.lateOut
                ? "late"
                : "on-time",
              data: user,
            },
            backgroundColor: user.earlyOut
              ? "#ef4444" // red for early
              : user.lateOut
              ? "#22c55e" // green for late
              : "#3b82f6", // blue for on-time
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
    } else {
      setEvents([]);
    }
  }, [selectedUser]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <Header />
        <Link to="/attendance">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            View Attendance Data
          </button>
        </Link>
      </div>
      {userList.length === 0 ? (
        <p className="italic text-gray-600 dark:text-neutral-50 text-center">
          <em>
            Loading... Please refresh once the ASP.NET backend has started.
          </em>
        </p>
      ) : (
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="w-full md:w-1/3">
            <UserSearch
              userList={userList}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              inputValue={inputValue}
              setInputValue={setInputValue}
              setEvents={setEvents}
            />
          </div>
          <div className="w-full md:w-2/3">
            <Calendar events={events} />
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CalendarPage />} />
        <Route path="/attendance" element={<AttendanceDataPage />} />
      </Routes>
    </Router>
  );
}

export default App;
