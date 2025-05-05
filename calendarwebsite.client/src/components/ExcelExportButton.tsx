import { useState } from "react";
import { Button } from "./ui/button";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { UserInfo } from "@/interfaces/type";
import { useTranslation } from "react-i18next";

interface ExcelExportButtonProps {
  userData: UserInfo;
  className?: string;
}

export default function ExcelExportButton({
  userData,
  className,
}: ExcelExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const handleExportExcel = async () => {
    if (!userData.id) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5194/api/GenerateExcelReport/generate-checkinout-report/${userData.id}`,
        {
          method: "GET",
          headers: {
            Accept:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `checkinout_report_${userData.fullName}.xlsx`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*)\2|[^;\n]*/
        );
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]*/g, "");
        }
      }

      // Convert response to blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting Excel report:", error);
      alert("Failed to export Excel report. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleExportExcel}
      disabled={isLoading || !userData.id}
      variant="outline"
      size="sm"
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin" />
          {t("common.exporting")}
        </>
      ) : (
        <>
          <FileSpreadsheet />
          {t("attendance.export.excel")}
        </>
      )}
    </Button>
  );
}
