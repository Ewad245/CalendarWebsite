export type User = {
  id: number;
  userWorkflowId: number;
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
};

export type FullAttendance = {
  attendanceDate: Date;
  personalProfileId: number;
  staffName: string | null;
  typeOfLeave: string | null;
  note: string | null;
  weekday: string;
  customInTime: Date | null;
  customOutTime: Date | null;
  checkInTime: Date | null;
  checkOutTime: Date | null; 
  attendanceStatus: string;
  checkInStatus: string | null;
  checkOutStatus: string | null;
}

export type UserInfo = {
  id: number;
  email: string;
  fullName: string;
  departmentId: number;
  positionId: number;
};

export type Department = {
  id: number;
  title: string;
};

export type Position = {
  id: number;
  title: string;
};

export interface CustomWorkingTime {
  id: number;
  workweekId: number;
  workWeekTitle: string;
  personalProfileId: number;
  personalProfileName: string;
  morningStart: number | null;
  morningEnd: number | null;
  afternoonStart: number | null;
  afternoonEnd: number | null;
  isDeleted: boolean;
}

export interface WorkWeek {
  id: number;
  title: string;
  isFullTime: boolean;
  isDeleted: boolean;
}
