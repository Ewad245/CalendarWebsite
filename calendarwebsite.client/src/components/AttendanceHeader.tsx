import ThemeToggle from "./ThemeToggle";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";

export default function AttendanceHeader() {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1
            id="tableLabel"
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-neutral-700 dark:text-neutral-50 text-center sm:text-left"
          >
            {t("attendance.title")}
          </h1>
          <p className="mb-6 text-neutral-700 dark:text-neutral-50 text-center sm:text-left text-sm sm:text-base">
          {t("attendance.subtitle")}
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