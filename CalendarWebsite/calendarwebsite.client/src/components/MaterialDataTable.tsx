import { useState, useEffect } from "react";
import { UserInfo } from "../interfaces/type";
import { format } from "date-fns";

// Material UI imports
import {
  Box,
  TextField,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  CircularProgress,
  Autocomplete,
} from "@mui/material";

// Material UI Date Picker
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// Material UI DataGrid
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbar,
  GridPaginationModel,
} from "@mui/x-data-grid";

// Material UI Icons
import {
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";

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

export default function MaterialDataTable({
  userList,
}: MaterialDataTableProps) {
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [attendanceData, setAttendanceData] = useState<DetailAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [totalRows, setTotalRows] = useState(0);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [filteredUserList, setFilteredUserList] = useState<UserInfo[]>([]);

  // Define columns for DataGrid
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 60,
      flex: 0.3,
      minWidth: 50
    },
    {
      field: 'fullName',
      headerName: 'User',
      width: 150,
      flex: 1,
      minWidth: 120
    },
    {
      field: 'inAt',
      headerName: 'Check In',
      width: 180,
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => {
        const record = params.row;
        return (
          <>
            {formatDateTime(record.inAt)}
            {record.lateIn
              ? " (Late)"
              : record.earlyIn
                ? " (Early)"
                : ""}
          </>
        );
      }
    },
    {
      field: 'outAt',
      headerName: 'Check Out',
      width: 180,
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => {
        const record = params.row;
        return (
          <>
            {formatDateTime(record.outAt)}
            {record.earlyOut
              ? " (Early)"
              : record.lateOut
                ? " (Late)"
                : ""}
          </>
        );
      }
    },
    {
      field: 'check',
      headerName: 'Status',
      width: 90,
      flex: 0.5,
      minWidth: 80,
      valueGetter: (value, row) => {
        return row.check === 1 ? "Present" : "Absent";
      }
    },
    {
      field: 'wt',
      headerName: 'Work Time',
      width: 110,
      flex: 0.7,
      minWidth: 100,
      valueGetter: (value, row) => {
        return `${row.wt} minutes`;
      }
    },
    {
      field: 'at',
      headerName: 'Date',
      width: 150,
      flex: 0.8,
      minWidth: 120,
      valueGetter: (value, row) => {
        return formatDateTime(row.at);
      }
    },
  ];

  // Filter users based on search input
  useEffect(() => {
    if (searchInput.trim() === "") {
      setFilteredUserList(userList);
    } else {
      const normalizedSearch = normalizeString(searchInput.toLowerCase());
      const filtered = userList.filter(
        (user) =>
          normalizeString(user.fullName.toLowerCase()).includes(
            normalizedSearch
          ) ||
          normalizeString(user.email.toLowerCase()).includes(normalizedSearch)
      );
      setFilteredUserList(filtered);
    }
  }, [searchInput, userList]);

  // Fetch attendance data when user or date range changes
  useEffect(() => {
    if (selectedUser) {
      fetchAttendanceData();
    } else {
      setAttendanceData([]);
    }
  }, [selectedUser, paginationModel.page, paginationModel.pageSize, fromDate, toDate]);

  const fetchAttendanceData = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      // DataGrid uses 0-based page index, but API expects 1-based page number
      const apiPageNumber = paginationModel.page + 1;
      let url = `/api/DataOnly_APIaCheckIn/pagination/${selectedUser.email}?pageNumber=${apiPageNumber}&pageSize=${paginationModel.pageSize}`;

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
        const adjustedItems = data.items.map(item => ({
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
      pageSize: paginationModel.pageSize
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

  return (
    <Box sx={{ width: "100%" }}>
      <Card elevation={2}>
        <CardHeader
          title="Attendance Data"
          subheader="View and filter attendance records by user and date range"
        />
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {/* User Filter */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Autocomplete
                options={userList}
                getOptionLabel={(option) =>
                  `${option.fullName} (${option.email})`
                }
                value={selectedUser}
                onChange={(_, newValue) => handleUserSelect(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select User"
                    variant="outlined"
                    fullWidth
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                )}
              />
            </Grid>

            {/* Date Range Filter */}
            <Grid size={{ xs: 12, md: 4 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="From Date"
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
              </LocalizationProvider>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="To Date"
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
              </LocalizationProvider>
            </Grid>
          </Grid>

          {/* DataGrid */}
          <Box sx={{ height: { xs: 500, md: 400 }, width: '100%', mb: 2, overflowX: 'auto' }}>
            {selectedUser ? (
              <DataGrid
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
                  toolbar: GridToolbar,
                }}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,
                  },
                }}
                sx={{
                  '& .MuiDataGrid-cell': {
                    whiteSpace: 'normal',
                    lineHeight: 'normal',
                    padding: { xs: '8px 4px', md: '16px 8px' },
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                  '& .MuiDataGrid-virtualScroller': {
                    overflowX: 'auto',
                  },
                  '& .MuiDataGrid-main': {
                    // Allow horizontal scrolling on mobile
                    overflow: 'auto',
                  },
                  '& .MuiDataGrid-root': {
                    // Ensure the grid adapts to container width
                    width: '100%',
                    minWidth: { xs: 650, sm: 'auto' },
                  }
                }}
              />
            ) : (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  borderRadius: 1,
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  Select a user to view attendance data
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
