import ThemeToggle from "./ThemeToggle";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

export default function AttendanceHeader() {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1
            id="tableLabel"
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-neutral-700 dark:text-neutral-50 text-center sm:text-left"
          >
            Staff Attendance Data
          </h1>
          <p className="mb-6 text-neutral-700 dark:text-neutral-50 text-center sm:text-left text-sm sm:text-base">
            View and filter staff attendance records
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline">Calendar View</Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </>
  );
}