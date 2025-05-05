import { useTranslation } from 'react-i18next';
import { UserInfo } from "../interfaces/type";

// Material UI imports
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Autocomplete,
  Button,
  Stack,
  IconButton,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

// Material UI Date Picker
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

interface Department {
  id: number;
  title: string;
}

interface Position {
  id: number;
  title: string;
}

interface FilterSidebarProps {
  open: boolean;
  onClose: () => void;
  userList: UserInfo[];
  departments: Department[];
  positions: Position[];
  selectedUser: UserInfo | null;
  selectedDepartment: Department | null;
  selectedPosition: Position | null;
  fromDate: Date | null;
  toDate: Date | null;
  searchInput: string;
  setSearchInput: (value: string) => void;
  handleUserSelect: (user: UserInfo | null) => void;
  handleDepartmentSelect: (department: Department | null) => void;
  handlePositionSelect: (position: Position | null) => void;
  setFromDate: (date: Date | null) => void;
  setToDate: (date: Date | null) => void;
  handleResetFilters: () => void;
  handleExportExcel?: () => void; // Optional export function
}

export default function FilterSidebar({
  open,
  onClose,
  userList,
  departments,
  positions,
  selectedUser,
  selectedDepartment,
  selectedPosition,
  fromDate,
  toDate,
  setSearchInput,
  handleUserSelect,
  handleDepartmentSelect,
  handlePositionSelect,
  setFromDate,
  setToDate,
  handleResetFilters,
  handleExportExcel
}: FilterSidebarProps) {
  const { t } = useTranslation();

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "85%", sm: "350px" }, padding: 2 },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6">{t('attendance.filters.title')}</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Stack spacing={3}>
        {/* Department Filter */}
        <Autocomplete
          options={departments}
          getOptionLabel={(option) => option.title || ''}
          value={selectedDepartment}
          onChange={(_, newValue) => handleDepartmentSelect(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('attendance.filters.department')}
              variant="outlined"
              fullWidth
            />
          )}
        />

        {/* Position Filter */}
        <Autocomplete
          options={positions}
          getOptionLabel={(option) => option.title || ''}
          value={selectedPosition}
          onChange={(_, newValue) => handlePositionSelect(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('attendance.filters.position')}
              variant="outlined"
              fullWidth
            />
          )}
        />

        {/* User Filter */}
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
              label={t('attendance.filters.selectUser')}
              variant="outlined"
              fullWidth
              onChange={(e) => setSearchInput(e.target.value)}
            />
          )}
        />

        {/* Date Range Filter */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label={t('attendance.filters.fromDate')}
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

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label={t('attendance.filters.toDate')}
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

        <Button
          variant="outlined"
          onClick={() => {
            handleResetFilters();
            onClose();
          }}
          fullWidth
        >
          {t('common.resetFilters')}
        </Button>

        {/* Export Button */}
        {handleExportExcel && (
          <>
            <Divider sx={{ my: 2 }} />
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                if (handleExportExcel) handleExportExcel();
              }}
              disabled={!selectedUser && !selectedDepartment && !selectedPosition && !fromDate && !toDate}
              startIcon={<FileDownloadIcon />}
              fullWidth
            >
              {t('attendance.export.excel')}
            </Button>
          </>
        )}
        
        <Button
          variant="outlined"
          onClick={onClose}
          fullWidth
          sx={{ mt: 2 }}
        >
          {t('common.apply')}
        </Button>
      </Stack>
    </Drawer>
  );
}