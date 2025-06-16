import { useState, useEffect, useMemo } from "react";
import { CustomWorkingTime, WorkWeek, UserInfo } from "../interfaces/type";
import Header from "../components/Header";
import { useTranslation } from 'react-i18next';
import LoadingSpinner from "@/components/loading-spinner";
import CustomThemeProvider from "@/components/MaterialUITheme";
import { useTheme } from "@/contexts/ThemeContext";

// Material UI imports
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Autocomplete,
  Snackbar,
  Alert,
  AlertColor,
  Tooltip,
  TablePagination
} from "@mui/material";

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from "@mui/icons-material";

export default function CustomWorkingTimePage() {
  const { t } = useTranslation();
  const [customWorkingTimes, setCustomWorkingTimes] = useState<CustomWorkingTime[]>([]);
  const [workWeeks, setWorkWeeks] = useState<WorkWeek[]>([]);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [currentItem, setCurrentItem] = useState<CustomWorkingTime | null>(null);
  const [selectedWorkWeek, setSelectedWorkWeek] = useState<WorkWeek | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [morningStart, setMorningStart] = useState<string>('');
  const [morningEnd, setMorningEnd] = useState<string>('');
  const [afternoonStart, setAfternoonStart] = useState<string>('');
  const [afternoonEnd, setAfternoonEnd] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: AlertColor }>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch custom working times
      const cwResponse = await fetch("/api/CustomWorkingTime");
      if (cwResponse.ok) {
        const data = await cwResponse.json();
        setCustomWorkingTimes(data);
      } else {
        showSnackbar('Failed to fetch custom working times', 'error');
      }

      // Fetch work weeks
      const wwResponse = await fetch("/api/WorkWeek");
      if (wwResponse.ok) {
        const data = await wwResponse.json();
        setWorkWeeks(data);
      } else {
        showSnackbar('Failed to fetch work weeks', 'error');
      }

      // Fetch users
      const usersResponse = await fetch("/api/DataOnly_APIaCheckIn");
      if (usersResponse.ok) {
        const data = await usersResponse.json();
        setUsers(data);
      } else {
        showSnackbar('Failed to fetch users', 'error');
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showSnackbar('Error fetching data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setCurrentItem(null);
    setSelectedWorkWeek(null);
    setSelectedUser(null);
    setMorningStart('');
    setMorningEnd('');
    setAfternoonStart('');
    setAfternoonEnd('');
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (item: CustomWorkingTime) => {
    setDialogMode('edit');
    setCurrentItem(item);
    
    // Find the corresponding work week and user
    const workWeek = workWeeks.find(ww => ww.id === item.workweekId) || null;
    const user = users.find(u => u.id === item.personalProfileId) || null;
    
    setSelectedWorkWeek(workWeek);
    setSelectedUser(user);
    
    // Convert number values to string for input fields
    setMorningStart(item.morningStart !== null ? item.morningStart.toString() : '');
    setMorningEnd(item.morningEnd !== null ? item.morningEnd.toString() : '');
    setAfternoonStart(item.afternoonStart !== null ? item.afternoonStart.toString() : '');
    setAfternoonEnd(item.afternoonEnd !== null ? item.afternoonEnd.toString() : '');
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const validateForm = (): boolean => {
    if (!selectedWorkWeek || !selectedUser) {
      showSnackbar('Please select a work week and user', 'error');
      return false;
    }

    // Validate time values if provided
    const validateTimeValue = (value: string): boolean => {
      if (!value) return true; // Empty is valid
      const num = parseFloat(value);
      return !isNaN(num) && num >= 0 && num <= 24;
    };

    if (!validateTimeValue(morningStart) || !validateTimeValue(morningEnd) || 
        !validateTimeValue(afternoonStart) || !validateTimeValue(afternoonEnd)) {
      showSnackbar('Time values must be between 0 and 24', 'error');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        id: dialogMode === 'edit' && currentItem ? currentItem.id : 0,
        workweekId: selectedWorkWeek!.id,
        workWeekTitle: selectedWorkWeek!.title,
        personalProfileId: selectedUser!.id,
        personalProfileName: selectedUser!.fullName,
        morningStart: morningStart ? parseFloat(morningStart) : null,
        morningEnd: morningEnd ? parseFloat(morningEnd) : null,
        afternoonStart: afternoonStart ? parseFloat(afternoonStart) : null,
        afternoonEnd: afternoonEnd ? parseFloat(afternoonEnd) : null,
        isDeleted: false
      };

      let response;
      if (dialogMode === 'create') {
        response = await fetch('/api/CustomWorkingTime', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`/api/CustomWorkingTime/${payload.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        showSnackbar(
          dialogMode === 'create' 
            ? 'Custom working time created successfully' 
            : 'Custom working time updated successfully', 
          'success'
        );
        handleCloseDialog();
        fetchData(); // Refresh data
      } else {
        const errorData = await response.json();
        showSnackbar(`Error: ${errorData.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error("Error saving data:", error);
      showSnackbar('Error saving data', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this custom working time?')) {
      return;
    }

    try {
      const response = await fetch(`/api/CustomWorkingTime/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showSnackbar('Custom working time deleted successfully', 'success');
        fetchData(); // Refresh data
      } else {
        showSnackbar('Error deleting custom working time', 'error');
      }
    } catch (error) {
      console.error("Error deleting data:", error);
      showSnackbar('Error deleting data', 'error');
    }
  };

  const showSnackbar = (message: string, severity: AlertColor) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Format time value for display
  const formatTime = (value: number | null): string => {
    if (value === null) return '-';
    
    const hours = Math.floor(value);
    const minutes = Math.round((value - hours) * 60);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  const { isDarkMode } = useTheme();
  const theme = useMemo(() => (isDarkMode ? 'dark' : 'light'), [isDarkMode]);

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <Header />
      </div>
      <CustomThemeProvider mode={theme}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('customWorkingTime.title', 'Custom Working Times')}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          {t('customWorkingTime.addNew', 'Add New')}
        </Button>
      </Box>

      {loading ? (
        <LoadingSpinner size="large" fullScreen={true} text={t('common.loading')} />
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="custom working times table">
              <TableHead>
                <TableRow>
                  <TableCell>{t('customWorkingTime.table.id', 'ID')}</TableCell>
                  <TableCell>{t('customWorkingTime.table.workWeek', 'Work Week')}</TableCell>
                  <TableCell>{t('customWorkingTime.table.user', 'User')}</TableCell>
                  <TableCell>{t('customWorkingTime.table.morningStart', 'Morning Start')}</TableCell>
                  <TableCell>{t('customWorkingTime.table.morningEnd', 'Morning End')}</TableCell>
                  <TableCell>{t('customWorkingTime.table.afternoonStart', 'Afternoon Start')}</TableCell>
                  <TableCell>{t('customWorkingTime.table.afternoonEnd', 'Afternoon End')}</TableCell>
                  <TableCell align="center">{t('customWorkingTime.table.actions', 'Actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customWorkingTimes
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.workWeekTitle}</TableCell>
                      <TableCell>{item.personalProfileName}</TableCell>
                      <TableCell>{formatTime(item.morningStart)}</TableCell>
                      <TableCell>{formatTime(item.morningEnd)}</TableCell>
                      <TableCell>{formatTime(item.afternoonStart)}</TableCell>
                      <TableCell>{formatTime(item.afternoonEnd)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title={t('customWorkingTime.edit', 'Edit')}>
                          <IconButton onClick={() => handleOpenEditDialog(item)} size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('customWorkingTime.delete', 'Delete')}>
                          <IconButton onClick={() => handleDelete(item.id)} size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                {customWorkingTimes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      {t('customWorkingTime.noData', 'No custom working times found')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={customWorkingTimes.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' 
            ? t('customWorkingTime.createTitle', 'Create Custom Working Time') 
            : t('customWorkingTime.editTitle', 'Edit Custom Working Time')}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Autocomplete
              options={workWeeks}
              getOptionLabel={(option) => option.title}
              value={selectedWorkWeek}
              onChange={(_event, newValue) => setSelectedWorkWeek(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('customWorkingTime.form.workWeek', 'Work Week')}
                  required
                />
              )}
            />

            <Autocomplete
              options={users}
              getOptionLabel={(option) => `${option.fullName} (${option.email})`}
              value={selectedUser}
              onChange={(_event, newValue) => setSelectedUser(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('customWorkingTime.form.user', 'User')}
                  required
                />
              )}
            />

            <Typography variant="subtitle1" gutterBottom>
              {t('customWorkingTime.form.morningHours', 'Morning Hours')}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label={t('customWorkingTime.form.start', 'Start')}
                type="number"
                inputProps={{ step: 0.25, min: 0, max: 24 }}
                value={morningStart}
                onChange={(e) => setMorningStart(e.target.value)}
                fullWidth
                helperText={t('customWorkingTime.form.timeFormat', 'Enter time in 24-hour format (e.g., 9.5 for 9:30)')}
              />
              
              <TextField
                label={t('customWorkingTime.form.end', 'End')}
                type="number"
                inputProps={{ step: 0.25, min: 0, max: 24 }}
                value={morningEnd}
                onChange={(e) => setMorningEnd(e.target.value)}
                fullWidth
              />
            </Box>

            <Typography variant="subtitle1" gutterBottom>
              {t('customWorkingTime.form.afternoonHours', 'Afternoon Hours')}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label={t('customWorkingTime.form.start', 'Start')}
                type="number"
                inputProps={{ step: 0.25, min: 0, max: 24 }}
                value={afternoonStart}
                onChange={(e) => setAfternoonStart(e.target.value)}
                fullWidth
              />
              
              <TextField
                label={t('customWorkingTime.form.end', 'End')}
                type="number"
                inputProps={{ step: 0.25, min: 0, max: 24 }}
                value={afternoonEnd}
                onChange={(e) => setAfternoonEnd(e.target.value)}
                fullWidth
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {t('common.save', 'Save')}
          </Button>
        </DialogActions>
      </Dialog>
      </CustomThemeProvider>


      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}