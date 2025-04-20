import { useState, useEffect } from "react";
import { UserInfo } from "../interfaces/type";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "./ui/table";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface DataTableProps {
  userList: UserInfo[];
}

export default function DataTable({ userList }: DataTableProps) {
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [attendanceData, setAttendanceData] = useState<DetailAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
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

  const handleUserSelect = (user: UserInfo) => {
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
    <div className="w-full space-y-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Attendance Data</CardTitle>
          <CardDescription>
            View and filter attendance records by user and date range
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full">
          <div className="flex flex-col md:flex-row gap-4 mb-6 w-full">
            {/* User Filter */}
            <div className="w-full md:w-1/3">
              <label className="text-sm font-medium mb-1 block">
                Select User
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full mb-2"
                />
                {filteredUserList.length > 0 && searchInput && (
                  <Card className="absolute z-10 w-full max-h-60 overflow-auto">
                    <CardContent className="p-2">
                      {filteredUserList.map((user) => (
                        <div
                          key={user.id}
                          className={`p-2 cursor-pointer hover:bg-accent rounded-md ${
                            selectedUser?.id === user.id ? "bg-accent" : ""
                          }`}
                          onClick={() => {
                            handleUserSelect(user);
                            setSearchInput(user.fullName);
                          }}
                        >
                          {user.fullName} ({user.email})
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="w-full md:w-1/3">
              <label className="text-sm font-medium mb-1 block">
                From Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={(date) => {
                      setFromDate(date);
                      if (toDate && date && date > toDate) {
                        setToDate(date);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="w-full md:w-1/3">
              <label className="text-sm font-medium mb-1 block">To Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={(date) => {
                      setToDate(date);
                      if (fromDate && date && date < fromDate) {
                        setFromDate(date);
                      }
                    }}
                    initialFocus
                    disabled={(date) => (fromDate ? date < fromDate : false)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Data Table */}
          <div className="rounded-md border w-full overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead className="min-w-[150px]">User</TableHead>
                  <TableHead className="min-w-[200px]">Check In</TableHead>
                  <TableHead className="min-w-[200px]">Check Out</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[120px]">Work Time</TableHead>
                  <TableHead className="min-w-[150px]">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : attendanceData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
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
          </div>

          {/* Pagination */}
          {selectedUser && attendanceData.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setPageNumber(1); // Reset to first page when changing page size
                  }}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="10 per page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 per page</SelectItem>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="20">20 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">
                  Page {pageNumber} of {totalPages}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pageNumber - 1)}
                  disabled={pageNumber <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pageNumber + 1)}
                  disabled={pageNumber >= totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
