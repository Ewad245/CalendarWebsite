import { useState, useEffect } from "react";
import { UserInfo } from "../interfaces/type";
import { format } from "date-fns";

// Material UI imports
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Popover,
  IconButton,
  CircularProgress,
  Autocomplete,
} from "@mui/material";

// Material UI Date Picker
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// Material UI Icons
import {
  CalendarMonth as CalendarIcon,
  ChevronLeft,
  ChevronRight,
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
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [filteredUserList, setFilteredUserList] = useState<UserInfo[]>([]);

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
  }, [selectedUser, pageNumber, pageSize, fromDate, toDate]);

  const fetchAttendanceData = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      let url = `/api/DataOnly_APIaCheckIn/pagination/${selectedUser.email}?pageNumber=${pageNumber}&pageSize=${pageSize}`;

      if (fromDate) {
        url += `&fromDate=${format(fromDate, "yyyy-MM-dd")}`;
      }

      if (toDate) {
        url += `&toDate=${format(toDate, "yyyy-MM-dd")}`;
      }

      const response = await fetch(url);

      if (response.ok) {
        const data: PaginatedResult<DetailAttendance> = await response.json();
        setAttendanceData(data.items);
        setTotalPages(data.totalPages);
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
    setPageNumber(1); // Reset to first page when changing user
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPageNumber(newPage);
    }
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

  const formatDateTime = (dateString: string | Date) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
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

          {/* Data Table */}
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell width={100}>ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Check In</TableCell>
                  <TableCell>Check Out</TableCell>
                  <TableCell width={100}>Status</TableCell>
                  <TableCell width={120}>Work Time</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : attendanceData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      {selectedUser
                        ? "No attendance data found"
                        : "Select a user to view attendance data"}
                    </TableCell>
                  </TableRow>
                ) : (
                  attendanceData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.id}</TableCell>
                      <TableCell>{record.fullName}</TableCell>
                      <TableCell>
                        {formatDateTime(record.inAt)}
                        {record.lateIn
                          ? " (Late)"
                          : record.earlyIn
                          ? " (Early)"
                          : ""}
                      </TableCell>
                      <TableCell>
                        {formatDateTime(record.outAt)}
                        {record.earlyOut
                          ? " (Early)"
                          : record.lateOut
                          ? " (Late)"
                          : ""}
                      </TableCell>
                      <TableCell>
                        {record.check === 1 ? "Present" : "Absent"}
                      </TableCell>
                      <TableCell>{record.wt} minutes</TableCell>
                      <TableCell>{formatDateTime(record.at)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {selectedUser && attendanceData.length > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{ minWidth: 100 }}
                >
                  <InputLabel id="page-size-label">Per Page</InputLabel>
                  <Select
                    labelId="page-size-label"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPageNumber(1); // Reset to first page when changing page size
                    }}
                    label="Per Page"
                  >
                    <MenuItem value={5}>5 per page</MenuItem>
                    <MenuItem value={10}>10 per page</MenuItem>
                    <MenuItem value={20}>20 per page</MenuItem>
                    <MenuItem value={50}>50 per page</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="body2" color="text.secondary">
                  Page {pageNumber} of {totalPages}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handlePageChange(pageNumber - 1)}
                  disabled={pageNumber <= 1}
                  startIcon={<ChevronLeft />}
                >
                  Previous
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handlePageChange(pageNumber + 1)}
                  disabled={pageNumber >= totalPages}
                  endIcon={<ChevronRight />}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
