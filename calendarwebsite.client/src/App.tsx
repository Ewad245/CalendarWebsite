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
import CustomWorkingTimePage from "./pages/CustomWorkingTimePage";
import NotFoundPage from "./pages/NotFoundPage";
import SidebarLayout from "./components/SidebarLayout";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PanelLeftIcon } from "lucide-react";
import FullCalendarRef from "@fullcalendar/react"; // Import FullCalendarRef
import LoadingSpinner from "./components/loading-spinner";

function CalendarPage() {
  const { t } = useTranslation();
  const [userList, setUserList] = useState<UserInfo[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchingEvents, setFetchingEvents] = useState(false);
  const calendarRef = useRef<FullCalendarRef>(null);

  async function fetchUserList() {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserCheckInData(userId: string, month?: number, year?: number) {
    setFetchingEvents(true);
    try {
      // Use the new API that includes full attendance information
      if (!month || !year) {
        const now = new Date();
        month = now.getMonth() + 1;
        year = now.getFullYear();
      }

      const endpoint = `/api/DataOnly_APIaCheckIn/date-range/${userId}?month=${month}&year=${year}`;

      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();

        // Transform attendance data to calendar events
        const calendarEvents = data.flatMap((attendance: FullAttendance, index: number) => {
          // Handle different attendance statuses
          if (attendance.attendanceStatus === 'Absent') {
            // Create a single all-day event for absent days
            const absentDate = new Date(attendance.attendanceDate);
            return [{
              id: `absent-${userId}-${index}`,
              title: `${attendance.staffName} (${t("attendance.table.absent")})`,
              start: absentDate,
              allDay: true,
              display: "block",
              extendedProps: {
                userId: userId,
                type: "absent",
                status: "absent",
                data: attendance,
              },
              backgroundColor: "#ef4444", // red for absent
            }];
          } else if (attendance.attendanceStatus === 'On Leave') {
            // Create a single all-day event for leave days
            const leaveDate = new Date(attendance.attendanceDate);
            return [{
              id: `leave-${userId}-${index}`,
              title: `${attendance.staffName} (${t("attendance.table.TypeOfLeave") || 'On Leave'})${attendance.typeOfLeave ? `: ${attendance.typeOfLeave}` : ''}`,
              start: leaveDate,
              allDay: true,
              display: "block",
              extendedProps: {
                userId: userId,
                type: "leave",
                status: "leave",
                leaveType: attendance.typeOfLeave,
                note: attendance.note,
                data: attendance,
              },
              backgroundColor: "#f59e0b", // amber for leave
            }];
          } else if (attendance.attendanceStatus === 'Present') {
            // Only create events for records with check-in and check-out times
            if (!attendance.checkInTime || !attendance.checkOutTime) {
              return [];
            }

            // Determine check-in status based on checkInStatus
            let checkInStatus = "on-time";
            let checkInColor = "#3b82f6"; // blue for on-time
            
            if (attendance.checkInStatus === 'Late In') {
              checkInStatus = "late";
              checkInColor = "#ef4444"; // red for late
            } else if (attendance.checkInStatus === 'Early In') {
              checkInStatus = "early";
              checkInColor = "#10b981"; // green for early
            }
            
            // Determine check-out status based on checkOutStatus
            let checkOutStatus = "on-time";
            let checkOutColor = "#3b82f6"; // blue for on-time
            
            if (attendance.checkOutStatus === 'Early Out') {
              checkOutStatus = "early";
              checkOutColor = "#ef4444"; // red for early out
            } else if (attendance.checkOutStatus === 'Late Out') {
              checkOutStatus = "late";
              checkOutColor = "#10b981"; // green for late out (overtime)
            }

            return [
              {
                id: `checkin-${userId}-${index}`,
                title: `${attendance.staffName} (${t("attendance.table.checkIn")})`,
                start: new Date(attendance.checkInTime),
                end: new Date(attendance.checkInTime),
                allDay: false,
                display: "block",
                extendedProps: {
                  userId: userId,
                  type: "check-in",
                  status: checkInStatus,
                  data: attendance,
                },
                backgroundColor: checkInColor,
              },
              {
                id: `checkout-${userId}-${index}`,
                title: `${attendance.staffName} (${t("attendance.table.checkOut")})`,
                start: new Date(attendance.checkOutTime),
                end: new Date(attendance.checkOutTime),
                allDay: false,
                display: "block",
                extendedProps: {
                  userId: userId,
                  type: "check-out",
                  status: checkOutStatus,
                  data: attendance,
                },
                backgroundColor: checkOutColor,
              },
          ];
          } else {
            // Default case for any other attendance status
            return [];
          }
        });

        setEvents(calendarEvents);
      } else {
        console.error("Failed to fetch user check-in data");
      }
    } catch (error) {
      console.error("Error fetching user check-in data:", error);
    } finally {
      setFetchingEvents(false);
    }
  }
  // Function to get the current date from FullCalendar
  const getCurrentSelectCalendarDate = () => {
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
      const now = getCurrentSelectCalendarDate();
      if (!now) {
        console.error("Failed to get current date from FullCalendar");
        return;
      }
      fetchUserCheckInData(selectedUser.email, now.getMonth() +1, now.getFullYear());
    } else {
      setEvents([]);
    }
  }, [selectedUser]);

  return (
    <div className="container mx-auto px-2 py-3 sm:py-4">
      <div className="mb-3 sm:mb-4">
        <Header />
      </div>
      {loading ? (
        <LoadingSpinner size="large" fullScreen={true} />
      ) : (
        <div className="flex flex-col gap-6 mb-4">
          <div className="w-full max-w-md mx-auto">
            <UserSearch
              userList={userList}
              selectedUser={selectedUser}
              selectedDate={getCurrentSelectCalendarDate()}
              setSelectedUser={setSelectedUser}
              inputValue={inputValue}
              setInputValue={setInputValue}
              setEvents={setEvents}
            />
          </div>
          <div className="w-full max-w-5xl mx-auto relative">
            {fetchingEvents && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm z-10 rounded-lg">
                <LoadingSpinner size="medium" />
              </div>
            )}
            <Calendar
              events={events}
              calendarRef={calendarRef}
              onDateRangeChange={(month, year) => {
                if (selectedUser) {
                  // Month from FullCalendar is 0-indexed, but our API expects 1-indexed
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
            <Route path="/custom-working-time" element={<CustomWorkingTimePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

      </SidebarProvider>
    </Router>
  );
}

export default App;
