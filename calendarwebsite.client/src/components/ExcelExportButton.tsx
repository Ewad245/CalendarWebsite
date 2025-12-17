import { useState } from "react";
import { Button } from "./ui/button";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { UserInfo } from "@/interfaces/type";
import { useTranslation } from "react-i18next";

interface ExcelExportButtonProps {
  userData: UserInfo;
  selectedDate?: Date | null;
  className?: string;
}

export default function ExcelExportButton({
  userData,
  selectedDate,
  className,
}: ExcelExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const handleExportExcel = async () => {
    if (!userData.id) return;
    let correctedSelectedMonth = new Date().getMonth() +1;
    let correctedSelectedYear = new Date().getFullYear();
    if (selectedDate) {
       correctedSelectedMonth = selectedDate.getMonth() +1;
       correctedSelectedYear = selectedDate.getFullYear();
    }

    setIsLoading(true);
    console.log(`Starting Excel export for user ID: ${userData.id}`);
    
    try {
      // Standard approach with enhanced headers
      try {
        console.log('Attempting primary download method...');
        const firstUrl = `/api/GenerateExcelReport/generate-checkinout-report/${userData.id}?month=${correctedSelectedMonth}&year=${correctedSelectedYear}`;
        const response = await fetch(
          firstUrl,
          {
            method: "GET",
            headers: {
              Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
              // Include credentials to ensure authentication headers are sent
              credentials: "same-origin"
            },
          }
        );

        if (!response.ok) {
          console.warn(`Export API returned status: ${response.status}`);
          throw new Error(`Export failed: ${response.status}`);
        }

        // Get filename from Content-Disposition header or use default
        const contentDisposition = response.headers.get("Content-Disposition");
        console.log('Content-Disposition header:', contentDisposition);
        let filename = `checkinout_report_${userData.fullName}.xlsx`;
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(
            /filename[^;=\n]*=((['"]).*)\2|[^;\n]*/
          );
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]*/g, "");
          }
        }
        console.log(`Using filename: ${filename}`);

        // Convert response to blob and download
        const blob = await response.blob();
        console.log(`Blob received: ${blob.type}, size: ${blob.size} bytes`);
        
        if (blob.size === 0) {
          console.error('Received empty blob, trying alternative approach');
          throw new Error('Received empty blob');
        }
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        
        // Proper cleanup with timeout to ensure browser has time to start the download
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(link);
          console.log('Download link cleaned up');
        }, 100);
        
        return; // Exit if successful
      } catch (primaryError) {
        console.error('Primary download method failed:', primaryError);
        console.log('Trying alternative approach...');
      }
      
      // Fallback approach: direct window open
      // This can work better in some environments where the fetch API has issues
      console.log('Using fallback download method (window.open)');
      const fallbackUrl = `/api/GenerateExcelReport/generate-checkinout-report/${userData.id}?month=${correctedSelectedMonth}&year=${correctedSelectedYear}`;
      window.open(fallbackUrl, '_blank');
      
    } catch (error) {
      console.error("Error exporting Excel report:", error);
      alert(t("attendance.export.error") || "Failed to export Excel report. Please try again.");
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
