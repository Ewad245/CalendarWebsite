import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Chip,
} from "@mui/material";
import { useTranslation } from 'react-i18next';
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";

// Generate dummy data
const generateDummyData = () => {
  const departments = [
    "HR",
    "Engineering",
    "Marketing",
    "Finance",
    "Operations",
  ];
  const statuses = ["On Time", "Late", "Very Late", "Absent"];

  return Array.from({ length: 100 }, (_, index) => {
    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() - Math.floor(Math.random() * 30));

    // Random check-in time between 7:00 AM and 10:00 AM
    const hours = 7 + Math.floor(Math.random() * 3);
    const minutes = Math.floor(Math.random() * 60);
    checkInDate.setHours(hours, minutes);

    const status = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      id: index + 1,
      name: `Employee ${index + 1}`,
      department: departments[Math.floor(Math.random() * departments.length)],
      checkInTime: checkInDate,
      status: status,
    };
  });
};

const StaffCheckInTable = () => {
  const { t } = useTranslation();
  const [rows, setRows] = useState<any[]>([]);
  const [filteredRows, setFilteredRows] = useState<any[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    // Initialize with dummy data
    const dummyData = generateDummyData();
    setRows(dummyData);
    setFilteredRows(dummyData);
  }, []);

  useEffect(() => {
    // Apply filters whenever filter values change
    let result = [...rows];

    if (departmentFilter) {
      result = result.filter((row) => row.department === departmentFilter);
    }

    if (statusFilter) {
      result = result.filter((row) => row.status === statusFilter);
    }

    if (startDate) {
      result = result.filter((row) => new Date(row.checkInTime) >= startDate);
    }

    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      result = result.filter((row) => new Date(row.checkInTime) <= endOfDay);
    }

    setFilteredRows(result);
  }, [rows, departmentFilter, statusFilter, startDate, endDate]);

  const handleResetFilters = () => {
    setDepartmentFilter("");
    setStatusFilter("");
    setStartDate(null);
    setEndDate(null);
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: t('attendance.table.id'), width: 70 },
    { field: "name", headerName: t('attendance.table.employeeName'), width: 200 },
    { field: "department", headerName: t('attendance.table.department'), width: 150 },
    {
      field: "checkInTime",
      headerName: t('attendance.table.checkInTime'),
      width: 200,
      valueFormatter: (params: { value: any }) => {
        if (!params || params.value === null || params.value === undefined)
          return "";
        const date = new Date(params.value);
        return date.toLocaleString();
      },
    },
    {
      field: "status",
      headerName: t('attendance.table.status'),
      width: 150,
      renderCell: (params) => {
        const status = params.value as string;
        let color = "default";

        switch (status) {
          case "On Time":
            color = "success";
            break;
          case "Late":
            color = "warning";
            break;
          case "Very Late":
            color = "error";
            break;
          case "Absent":
            color = "default";
            break;
          default:
            color = "default";
        }

        return <Chip label={t(`attendance.table.${status === "On Time" ? "onTime" : status === "Late" ? "late" : status === "Very Late" ? "veryLate" : "absent"}`)} color={color as any} size="small" />;
      },
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h4" gutterBottom component="div">
        {t('attendance.staffCheckIn')}
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mb: 2 }}
        >
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="department-filter-label">{t('attendance.filters.department')}</InputLabel>
            <Select
              labelId="department-filter-label"
              value={departmentFilter}
              label="Department"
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              <MenuItem value="HR">HR</MenuItem>
              <MenuItem value="Engineering">Engineering</MenuItem>
              <MenuItem value="Marketing">Marketing</MenuItem>
              <MenuItem value="Finance">Finance</MenuItem>
              <MenuItem value="Operations">Operations</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="status-filter-label">{t('attendance.filters.status')}</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              <MenuItem value="On Time">On Time</MenuItem>
              <MenuItem value="Late">Late</MenuItem>
              <MenuItem value="Very Late">Very Late</MenuItem>
              <MenuItem value="Absent">Absent</MenuItem>
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label={t('attendance.filters.startDate')}
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
            />
          </LocalizationProvider>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label={t('attendance.filters.toDate')}
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              minDate={startDate || undefined}
            />
          </LocalizationProvider>

          <Button
            variant="outlined"
            onClick={handleResetFilters}
            sx={{ height: 56 }}
          >
            {t('common.resetFilters')}
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25]}
          checkboxSelection
          disableRowSelectionOnClick
          autoHeight
          showToolbar
          slotProps={{
            toolbar: {
              showQuickFilter: true,
            },
          }}
          sx={{ minHeight: 400 }}
        />
      </Paper>
    </Box>
  );
};

export default StaffCheckInTable;
