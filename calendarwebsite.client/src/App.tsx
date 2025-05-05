import { useEffect, useState } from "react";
import "./App.css";
import { User, UserInfo } from "./interfaces/type";
import { EventInput } from "@fullcalendar/core";
import UserSearch from "./components/UserSearch";
import Calendar from "./components/Calendar";
import Header from "./components/Header";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AttendanceDataPage from "./pages/AttendanceDataPage";
import SidebarLayout from "./components/SidebarLayout";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PanelLeftIcon } from "lucide-react";

function CalendarPage() {
  const { t } = useTranslation();
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
        console.error(t("attendance.message.fetchError"));
      }
    } catch (error) {
      console.error(`${t("attendance.message.fetchErrorDetails")}`, error);
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
            title: `${user.fullName} (${t("attendance.table.checkIn")})`,
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
            title: `${user.fullName} (${t("attendance.table.checkOut")})`,
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
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <Header />
      </div>
      {userList.length === 0 ? (
        <p className="italic text-gray-600 dark:text-neutral-50 text-center">
          <em>
            Loading... Please refresh once the ASP.NET backend has started.
          </em>
        </p>
      ) : (
        <div className="flex flex-col gap-6 mb-4">
          <div className="w-full max-w-md mx-auto">
            <UserSearch
              userList={userList}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              inputValue={inputValue}
              setInputValue={setInputValue}
              setEvents={setEvents}
            />
          </div>
          <div className="w-full max-w-5xl mx-auto">
            <Calendar events={events} />
          </div>
        </div>
      )}
    </div>
  );
}
// Helper component to show the toggle button in the main content area
function SidebarToggle() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
    >
      <PanelLeftIcon className="h-5 w-5" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

function App() {
  return (
    <Router>
      <SidebarProvider>
        <SidebarLayout />
        <main className="flex-1 overflow-auto p-4">
          <div className="flex items-center mb-4">
            <SidebarToggle />
          </div>
          <Routes>
            <Route path="/" element={<CalendarPage />} />
            <Route path="/attendance" element={<AttendanceDataPage />} />
          </Routes>
        </main>
      </SidebarProvider>
    </Router>
  );
}

export default App;
