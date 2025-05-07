import { useState, useEffect, useMemo } from "react";
import { UserInfo } from "../interfaces/type";
import { format } from "date-fns";
import CustomThemeProvider from "./MaterialUITheme";
import { useTranslation } from "react-i18next";

// Material UI imports
import {
  TextField,
  Paper,
  Typography,
  Autocomplete,
  Box,
  Button,
  Stack,
  IconButton,
  useMediaQuery,
  useTheme as useMuiTheme,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

// Material UI Date Picker
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { MultilingualLocalizationProvider } from "./MultilingualLocalizationProvider";

// Material UI DataGrid
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExportContainer,
  GridToolbarDensitySelector,
  GridPaginationModel,
} from "@mui/x-data-grid";
import { useTheme } from "@/contexts/ThemeContext";
import { enUS, viVN } from "@mui/x-data-grid/locales";
import FilterSidebar from "./FilterSidebar";

interface DetailAttendance {
  id: number;
  userId: string;
  method: number;
  check: number;
  earlyIn: number;
  lateIn: number;
  earlyOut: number;
  lateOut: number;
  inAt: Date;
  outAt: Date;
  wt: number;
  at: Date;
  fullName: string;
  data: string;
}

interface PaginatedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

interface MaterialDataTableProps {
  userList: UserInfo[];
}

interface Department {
  id: number;
  title: string;
}

interface Position {
  id: number;
  title: string;
}

export default function MaterialDataTable({
  userList,
}: MaterialDataTableProps) {
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [attendanceData, setAttendanceData] = useState<DetailAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [totalRows, setTotalRows] = useState(0);
  // Set default date range: current date and 7 days prior
  const [fromDate, setFromDate] = useState<Date | null>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  const [toDate, setToDate] = useState<Date | null>(() => new Date());
  const [searchInput, setSearchInput] = useState("");
  // @ts-ignore
  const [filteredUserList, setFilteredUserList] = useState<UserInfo[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Material UI theme for responsive design
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  const { t } = useTranslation();

  // Define columns for DataGrid
  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: t("attendance.table.id"),
      width: 60,
      flex: 0.3,
      minWidth: 50,
    },
    {
      field: "fullName",
      headerName: t("attendance.table.user"),
      width: 150,
      flex: 1,
      minWidth: 120,
    },
    {
      field: "inAt",
      headerName: t("attendance.table.checkIn"),
      width: 180,
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => {
        const record = params.row;
        return (
          <>
            {formatDateTime(record.inAt)}
            {record.lateIn
              ? ` (${t("attendance.table.late")})`
              : record.earlyIn
              ? ` (${t("attendance.table.early")})`
              : ""}
          </>
        );
      },
    },
    {
      field: "outAt",
      headerName: t("attendance.table.checkOut"),
      width: 180,
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => {
        const record = params.row;
        return (
          <>
            {formatDateTime(record.outAt)}
            {record.earlyOut
              ? ` (${t("attendance.table.early")})`
              : record.lateOut
              ? ` (${t("attendance.table.late")})`
              : ""}
          </>
        );
      },
    },
    {
      field: "check",
      headerName: t("attendance.table.status"),
      width: 90,
      flex: 0.5,
      minWidth: 80,
      valueGetter: (_value, row) => {
        return row.check === 1
          ? t("attendance.table.present")
          : t("attendance.table.absent");
      },
    },
    {
      field: "wt",
      headerName: t("attendance.table.workTime"),
      width: 110,
      flex: 0.7,
      minWidth: 100,
      valueGetter: (_value, row) => {
        return `${row.wt} ${t("attendance.table.minutes")}`;
      },
    },
    {
      field: "at",
      headerName: t("attendance.table.date"),
      width: 150,
      flex: 0.8,
      minWidth: 120,
      valueGetter: (_value, row) => {
        return formatDateTime(row.at);
      },
    },
  ];

  // Filter users based on search input
  useEffect(() => {
    if (searchInput.trim() !== "") {
      const normalizedSearch = normalizeString(searchInput.toLowerCase());
      const filtered = filteredUserList.filter(
        (user) =>
          normalizeString(user.fullName.toLowerCase()).includes(
            normalizedSearch
          ) ||
          normalizeString(user.email.toLowerCase()).includes(normalizedSearch)
      );
      setFilteredUserList(filtered);
    } else {
      fetchFilteredUsers();
    }
  }, [searchInput, filteredUserList]);

  // Fetch filtered users when department or position changes
  const fetchFilteredUsers = async () => {
    try {
      // Build the URL with department and position filters
      let url = "/api/DataOnly_APIaCheckIn";

      // Add query parameters if either filter is selected
      if (selectedDepartment || selectedPosition) {
        url += "?";

        if (selectedDepartment) {
          url += `departmentId=${selectedDepartment.id}`;
          if (selectedPosition) {
            url += "&";
          }
        }

        if (selectedPosition) {
          url += `positionId=${selectedPosition.id}`;
        }
      }

      const response = await fetch(url);
      if (response.ok) {
        const data: UserInfo[] = await response.json();
        // Update the userList with filtered data
        setFilteredUserList(data);
      } else {
        console.error("Error fetching filtered users");
      }
    } catch (error) {
      console.error("Error fetching filtered users:", error);
    }
  };

  // Fetch departments and positions on component mount
  useEffect(() => {
    fetchDepartments();
    fetchPositions();
    // Since we have default date values, we should fetch data on component mount
    fetchAttendanceData();
  }, []);

  // Fetch filtered users when department or position changes
  useEffect(() => {
    if (selectedDepartment || selectedPosition) {
      fetchFilteredUsers();
    } else {
      // Reset to original user list when no filters are applied
      setFilteredUserList(userList);
    }
  }, [selectedDepartment, selectedPosition, userList]);

  // Fetch attendance data when filters change
  useEffect(() => {
    // Only fetch data if at least one filter is applied
    if (
      selectedUser ||
      selectedDepartment ||
      selectedPosition ||
      fromDate ||
      toDate
    ) {
      fetchAttendanceData();
    } else {
      // Clear data if no filters are applied
      setAttendanceData([]);
      setTotalRows(0);
    }
  }, [
    selectedUser,
    selectedDepartment,
    selectedPosition,
    paginationModel.page,
    paginationModel.pageSize,
    fromDate,
    toDate,
  ]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/Department");
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setDepartments(data);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await fetch("/api/Position");
      if (response.ok) {
        const data = await response.json();
        setPositions(data);
      }
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
  };

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      // DataGrid uses 0-based page index, but API expects 1-based page number
      const apiPageNumber = paginationModel.page + 1;

      // Build the filter URL with all possible filters
      let url = `/api/DataOnly_APIaCheckIn/filter?pageNumber=${apiPageNumber}&pageSize=${paginationModel.pageSize}`;

      // Add department filter if selected
      if (selectedDepartment) {
        url += `&departmentId=${selectedDepartment.id}`;
      }

      // Add position filter if selected
      if (selectedPosition) {
        url += `&positionId=${selectedPosition.id}`;
      }

      // Add user filter if selected
      if (selectedUser) {
        url += `&userId=${selectedUser.email}`;
      }

      // Add date filters if provided
      if (fromDate) {
        url += `&fromDate=${format(fromDate, "yyyy-MM-dd")}`;
      }

      if (toDate) {
        url += `&toDate=${format(toDate, "yyyy-MM-dd")}`;
      }

      const response = await fetch(url);

      if (response.ok) {
        const data: PaginatedResult<DetailAttendance> = await response.json();

        // Adjust dates for UTC+7 timezone in the received data
        const adjustedItems = data.items.map((item) => ({
          ...item,
          // We don't modify the original dates here since formatDateTime will handle the adjustment
          // This ensures consistency with how dates are displayed
        }));

        setAttendanceData(adjustedItems);
        setTotalRows(data.totalCount);
      } else {
        console.error("Failed to fetch attendance data");
        setAttendanceData([]);
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: UserInfo | null) => {
    setSelectedUser(user);
    setPaginationModel({
      page: 0, // Reset to first page when changing user
      pageSize: paginationModel.pageSize,
    });
  };

  const handlePaginationModelChange = (newModel: GridPaginationModel) => {
    setPaginationModel(newModel);
  };

  const normalizeString = (str: string) => {
    if (!str) return "";

    str = str.toLowerCase();

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

    return [...str].map((char) => charMap[char] || char).join("");
  };

  // UTC+7 timezone offset constant
  const utcOffset = 7; // UTC+7 timezone offset

  const formatDateTime = (dateString: string | Date) => {
    if (!dateString) return "N/A";
    // Adjust for UTC+7 timezone
    const date = new Date(new Date(dateString).getTime() + utcOffset * 3600000);
    return format(date, "yyyy-MM-dd HH:mm:ss");
  };

  const handleResetFilters = () => {
    setSelectedUser(null);
    setSelectedDepartment(null);
    setSelectedPosition(null);
    // Reset to default date range instead of null
    const defaultFromDate = new Date();
    defaultFromDate.setDate(defaultFromDate.getDate() - 7);
    setFromDate(defaultFromDate);
    setToDate(new Date());
    setSearchInput("");
    setAttendanceData([]);
    // Reset filtered user list to original user list
    setFilteredUserList(userList);
  };

  const handleExportExcel = async () => {
    if (
      !selectedUser &&
      !selectedDepartment &&
      !selectedPosition &&
      !fromDate &&
      !toDate
    ) {
      // No filters applied, nothing to export
      return;
    }

    setExportLoading(true);
    try {
      // Build the filter URL with all possible filters
      let url = `/api/GenerateExcelReport/generate-filter-report?`;

      // Add department filter if selected
      if (selectedDepartment) {
        url += `departmentId=${selectedDepartment.id}&`;
      }

      // Add position filter if selected
      if (selectedPosition) {
        url += `positionId=${selectedPosition.id}&`;
      }

      // Add user filter if selected
      if (selectedUser) {
        url += `userId=${selectedUser.email}&`;
      }

      // Add date filters if provided
      if (fromDate) {
        url += `fromDate=${format(fromDate, "yyyy-MM-dd")}&`;
      }

      if (toDate) {
        url += `toDate=${format(toDate, "yyyy-MM-dd")}&`;
      }

      // Remove trailing '&' if exists
      url = url.endsWith("&") ? url.slice(0, -1) : url;

      console.log("Requesting Excel export from URL:", url);

      // Try the standard approach first
      try {
        // Use fetch with blob response type to download the file
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Cache-Control": "no-cache",
          },
          credentials: "same-origin",
        });

        if (!response.ok) {
          throw new Error(`Export failed with status: ${response.status}`);
        }

        // Get the filename from the Content-Disposition header if available
        const contentDisposition = response.headers.get("Content-Disposition");
        console.log("Content-Disposition header:", contentDisposition);
        let filename = "attendance_report.xlsx";

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(
            /filename[^;=\n]*=((['"]).*)\2|[^;\n]*/
          );
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]*/g, "");
          }
        }

        console.log("Using filename:", filename);

        // Convert response to blob
        const blob = await response.blob();
        console.log("Blob received:", blob.type, blob.size);

        // Create a download link and trigger download
        const url2 = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url2;
        a.download = filename;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();

        // Cleanup
        setTimeout(() => {
          window.URL.revokeObjectURL(url2);
          document.body.removeChild(a);
        }, 100);

        return; // Exit if successful
      } catch (innerError) {
        console.error("Standard download approach failed:", innerError);
        console.log("Trying alternative approach...");
      }

      // Alternative approach: Open in new window/tab
      // This can work better in some deployment environments
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error exporting Excel report:", error);
      alert(t("attendance.export.error"));
    } finally {
      setExportLoading(false);
    }
  };

  const handleDepartmentSelect = (department: Department | null) => {
    setSelectedDepartment(department);
    setPaginationModel({
      page: 0, // Reset to first page when changing department
      pageSize: paginationModel.pageSize,
    });

    // Reset selected user when department changes
    setSelectedUser(null);
  };

  const handlePositionSelect = (position: Position | null) => {
    setSelectedPosition(position);
    setPaginationModel({
      page: 0, // Reset to first page when changing position
      pageSize: paginationModel.pageSize,
    });

    // Reset selected user when position changes
    setSelectedUser(null);
  };

  //Theme for Material UI
  const { isDarkMode } = useTheme();
  const theme = useMemo(() => (isDarkMode ? "dark" : "light"), [isDarkMode]);

  return (
    <CustomThemeProvider mode={theme}>
      <Box sx={{ width: "100%" }}>
        <Typography variant="h4" gutterBottom component="div">
          {t("attendance.title")}
        </Typography>

        {/* Filter Sidebar for mobile */}
        <FilterSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          userList={userList}
          filteredUserList={filteredUserList}
          departments={departments}
          positions={positions}
          selectedUser={selectedUser}
          selectedDepartment={selectedDepartment}
          selectedPosition={selectedPosition}
          fromDate={fromDate}
          toDate={toDate}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          handleUserSelect={handleUserSelect}
          handleDepartmentSelect={handleDepartmentSelect}
          handlePositionSelect={handlePositionSelect}
          setFromDate={setFromDate}
          setToDate={setToDate}
          handleResetFilters={handleResetFilters}
          handleExportExcel={handleExportExcel}
        />

        {/* Filter Section - Desktop */}
        {isMobile ? (
          <Paper
            sx={{
              p: 2,
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle1">
              {t("attendance.filters.title")}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title={t("attendance.export.tooltip")}>
                <span>
                  <IconButton
                    color="primary"
                    onClick={handleExportExcel}
                    disabled={
                      exportLoading ||
                      (!selectedUser &&
                        !selectedDepartment &&
                        !selectedPosition &&
                        !fromDate &&
                        !toDate)
                    }
                    aria-label="export to excel"
                  >
                    {exportLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      <FileDownloadIcon />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
              <IconButton
                color="primary"
                onClick={() => setSidebarOpen(true)}
                aria-label="open filters"
              >
                <FilterListIcon />
              </IconButton>
            </Box>
          </Paper>
        ) : (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ mb: 2 }}
            >
              {/* Department Filter */}
              <Box sx={{ minWidth: 150, flex: 1 }}>
                <Autocomplete
                  options={departments}
                  getOptionLabel={(option) => option.title || ""}
                  value={selectedDepartment}
                  onChange={(_, newValue) => handleDepartmentSelect(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("attendance.filters.department")}
                      variant="outlined"
                      fullWidth
                    />
                  )}
                />
              </Box>

              {/* Position Filter */}
              <Box sx={{ minWidth: 150, flex: 1 }}>
                <Autocomplete
                  options={positions}
                  getOptionLabel={(option) => option.title || ""}
                  value={selectedPosition}
                  onChange={(_, newValue) => handlePositionSelect(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("attendance.filters.position")}
                      variant="outlined"
                      fullWidth
                    />
                  )}
                />
              </Box>

              {/* User Filter */}
              <Box sx={{ minWidth: 200, flex: 1 }}>
                <Autocomplete
                  options={filteredUserList}
                  getOptionLabel={(option) =>
                    `${option.fullName} (${option.email})`
                  }
                  value={selectedUser}
                  onChange={(_, newValue) => handleUserSelect(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("attendance.filters.selectUser")}
                      variant="outlined"
                      fullWidth
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  )}
                />
              </Box>

              {/* Date Range Filter */}
              <MultilingualLocalizationProvider>
                <DatePicker
                  label={t("attendance.filters.fromDate")}
                  value={fromDate}
                  onChange={(date) => {
                    setFromDate(date);
                    if (toDate && date && date > toDate) {
                      setToDate(date);
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: "outlined",
                    },
                  }}
                />
              </MultilingualLocalizationProvider>

              <MultilingualLocalizationProvider>
                <DatePicker
                  label={t("attendance.filters.toDate")}
                  value={toDate}
                  onChange={(date) => {
                    setToDate(date);
                    if (fromDate && date && date < fromDate) {
                      setFromDate(date);
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: "outlined",
                    },
                  }}
                  minDate={fromDate || undefined}
                />
              </MultilingualLocalizationProvider>

              <Button
                variant="outlined"
                onClick={handleResetFilters}
                sx={{ height: 56 }}
              >
                {t("common.resetFilters")}
              </Button>
            </Stack>
          </Paper>
        )}

        {/* DataGrid Section */}
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <Box
            sx={{
              height: "80vh",
              width: "100%",
              maxWidth: { xs: "20rem", sm: "45rem", md: "80rem", lg: "100rem" },
              overflowX: "visible",
            }}
          >
            {/* Show DataGrid when filters are applied, otherwise show a message */}
            {selectedUser ||
            selectedDepartment ||
            selectedPosition ||
            fromDate ||
            toDate ? (
              <DataGrid
                localeText={
                  t("language.english") === "English"
                    ? enUS.components.MuiDataGrid.defaultProps.localeText
                    : viVN.components.MuiDataGrid.defaultProps.localeText
                }
                rows={attendanceData}
                columns={columns}
                paginationModel={paginationModel}
                onPaginationModelChange={handlePaginationModelChange}
                pageSizeOptions={[5, 10, 20, 50]}
                pagination
                paginationMode="server"
                rowCount={totalRows}
                loading={loading}
                disableRowSelectionOnClick
                getRowId={(row) => row.id}
                slots={{
                  toolbar: () => {
                    return (
                      <GridToolbarContainer>
                        <GridToolbarColumnsButton />
                        <GridToolbarFilterButton />
                        <GridToolbarDensitySelector />
                        <GridToolbarExportContainer />
                        <Tooltip title={t("attendance.export.tooltip")}>
                          <span>
                            <Button
                              variant="text"
                              color="primary"
                              onClick={handleExportExcel}
                              disabled={
                                exportLoading ||
                                (!selectedUser &&
                                  !selectedDepartment &&
                                  !selectedPosition &&
                                  !fromDate &&
                                  !toDate)
                              }
                              startIcon={
                                exportLoading ? (
                                  <CircularProgress size={20} color="inherit" />
                                ) : (
                                  <FileDownloadIcon />
                                )
                              }
                              size="small"
                            >
                              {t("attendance.export.excel")}
                            </Button>
                          </span>
                        </Tooltip>
                      </GridToolbarContainer>
                    );
                  },
                }}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,
                    csvOptions: {
                      fileName: `attendance_${
                        selectedUser ? selectedUser.fullName : "all"
                      }${
                        selectedDepartment
                          ? "_dept_" + selectedDepartment.title
                          : ""
                      }${
                        selectedPosition ? "_pos_" + selectedPosition.title : ""
                      }`,
                      utf8WithBom: true,
                      delimiter: ";",
                    },
                    printOptions: {
                      hideFooter: false,
                      hideToolbar: false,
                      allColumns: true,
                    },
                  },
                }}
                showToolbar
                sx={{
                  "& .MuiDataGrid-cell": {
                    whiteSpace: "normal",
                    lineHeight: "normal",
                    padding: { xs: "8px 4px", md: "16px 8px" },
                  },
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                  },
                  "& .MuiDataGrid-virtualScroller": {
                    overflowX: "scroll",
                    maxWidth: "100%",
                  },
                  "& .MuiDataGrid-main": {
                    overflow: "auto",
                    maxWidth: "100%",
                  },
                  "& .MuiDataGrid-root": {
                    width: "100%",
                    overflow: "hidden",
                    maxWidth: "100%",
                  },
                }}
              />
            ) : (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(0, 0, 0, 0.12)",
                  borderRadius: 1,
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  {t("attendance.message.noFilters")}
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </CustomThemeProvider>
  );
}
