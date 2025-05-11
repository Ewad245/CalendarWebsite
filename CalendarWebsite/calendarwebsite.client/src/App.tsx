import { useEffect, useRef, useState } from "react";
import "./App.css";
import { FullAttendance, UserInfo } from "./interfaces/type";
import { EventInput } from "@fullcalendar/core";
import UserSearch from "./components/UserSearch";
import Calendar from "./components/Calendar";
import Header from "./components/Header";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AttendanceDataPage from "./pages/AttendanceDataPage";
import NotFoundPage from "./pages/NotFoundPage";
import SidebarLayout from "./components/SidebarLayout";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import getCurrentCalendarDate from "./components/Calendar";
import { PanelLeftIcon } from "lucide-react";
import FullCalendarRef from "@fullcalendar/react"; // Import FullCalendarRef

function CalendarPage() {
  const { t } = useTranslation();
  const [userList, setUserList] = useState<UserInfo[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [inputValue, setInputValue] = useState("");
  const calendarRef = useRef<FullCalendarRef>(null);

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

  async function fetchUserCheckInData(userId: string, month?: number, year?: number) {
    try {
      // Always use the new API that includes absence information
      if (!month || !year) {
        const now = new Date();
        month = now.getMonth() + 1;
        year = now.getFullYear();
      }

      const endpoint = `/api/DataOnly_APIaCheckIn/month-year/${userId}?month=${month}&year=${year}`;

      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();

        // Transform attendance data to calendar events and adjust for UTC+7
        const calendarEvents = data.flatMap((attendance: FullAttendance, index: number) => {
          // Handle absent records by creating an absence event
          if (attendance.isAbsent) {
            // Create a single all-day event for absent days
            const absentDate = new Date(attendance.year, attendance.month - 1, attendance.day);
            return [{
              id: `absent-${attendance.userId}-${index}`,
              title: `${attendance.fullName} (${t("attendance.table.absent")})`,
              start: absentDate,
              allDay: true,
              display: "block",
              extendedProps: {
                userId: attendance.userId,
                type: "absent",
                status: "absent",
                data: attendance,
              },
              backgroundColor: "#ef4444", // red for absent
            }];
          }

          // Only create events for records with check-in and check-out times
          if (!attendance.inAt || !attendance.outAt) {
            return [];
          }

          return [
            {
              id: `checkin-${attendance.userId}-${index}`,
              title: `${attendance.fullName} (${t("attendance.table.checkIn")})`,
              start: new Date(
                new Date(attendance.inAt).getTime()
              ),
              end: new Date(new Date(attendance.inAt).getTime()),
              allDay: false,
              display: "block",
              extendedProps: {
                userId: attendance.userId,
                type: "check-in",
                // We don't have lateIn/earlyIn in the DTO, so we'll use on-time for now
                // This would need to be updated if the DTO includes these properties
                status: "on-time",
                data: attendance,
              },
              backgroundColor: "#3b82f6", // blue for on-time
            },
            {
              id: `checkout-${attendance.userId}-${index}`,
              title: `${attendance.fullName} (${t("attendance.table.checkOut")})`,
              start: new Date(
                new Date(attendance.outAt).getTime()
              ),
              end: new Date(new Date(attendance.outAt).getTime()),
              allDay: false,
              display: "block",
              extendedProps: {
                userId: attendance.userId,
                type: "check-out",
                // We don't have earlyOut/lateOut in the DTO, so we'll use on-time for now
                // This would need to be updated if the DTO includes these properties
                status: "on-time",
                data: attendance,
              },
              backgroundColor: "#3b82f6", // blue for on-time
            },
          ];
        });

        setEvents(calendarEvents);
      } else {
        console.error("Failed to fetch user check-in data");
      }
    } catch (error) {
      console.error("Error fetching user check-in data:", error);
    }
  }
  // Function to get the current date from FullCalendar
  const getCurrentCalendarDate = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const currentDate = calendarApi.getDate(); // Get the current date
      return currentDate; // Returns a JavaScript Date object
    }
    return null;
  };

  useEffect(() => {
    fetchUserList();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      const now = getCurrentCalendarDate();
      if (!now) {
        console.error("Failed to get current date from FullCalendar");
        return;
      }
      fetchUserCheckInData(selectedUser.email, now.getMonth() + 1, now.getFullYear());
    } else {
      setEvents([]);
    }
  }, [selectedUser]);

  return (
    <div className="container mx-auto px-2 py-3 sm:py-4">
      <div className="mb-3 sm:mb-4">
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
            <Calendar
              events={events}
              calendarRef={calendarRef}
              onDateRangeChange={(month, year) => {
                if (selectedUser) {
                  fetchUserCheckInData(selectedUser.email, month + 2, year);
                }
              }}
            />
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
        <main className="flex-1 overflow-auto p-2 sm:p-3">
          <div className="flex items-center mb-2">
            <SidebarToggle />
          </div>
          <Routes>
            <Route path="/" element={<CalendarPage />} />
            <Route path="/attendance" element={<AttendanceDataPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

      </SidebarProvider>
    </Router>
  );
}

export default App;
