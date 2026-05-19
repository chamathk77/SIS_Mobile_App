export type AttendanceStatus = "present" | "absent" | "late" | string;

export interface AttendanceRecord {
  id: number;
  date: string;
  status: AttendanceStatus;
  remarks: string | null;
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  total: number;
}

export interface AttendanceMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface AttendanceData {
  student_id: number;
  summary: AttendanceSummary;
  records: AttendanceRecord[];
  meta: AttendanceMeta;
}

export interface GetAttendance_Response {
  success: boolean;
  message: string;
  data: AttendanceData;
}

export interface GetAttendance_Request {
  student_id: string;
  page?: number;
}
