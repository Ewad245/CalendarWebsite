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
  fullName: string;
  staffId: string;
  email: string;
  workDate: Date;
  attendanceStatus: string;
  typeOfLeave?: string | null;
  note?: string | null;
  inAt?: Date | null;
  outAt?: Date | null;
  method?: number | null;
  check?: number | null;
  earlyIn?: number | null;
  lateIn?: number | null;
  earlyOut?: number | null;
  lateOut?: number | null;
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
