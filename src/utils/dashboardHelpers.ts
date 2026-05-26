import { formatInvoiceAmount } from "./invoiceHelpers";
import { formatCalendarDate } from "./calendarHelpers";
import { formatAttendanceStatus } from "./attendanceHelpers";

export function formatDashboardAmount(amount: number, currency = "LKR"): string {
  return formatInvoiceAmount(amount, currency);
}

export { formatCalendarDate, formatAttendanceStatus };

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 17) {
    return "Good afternoon";
  }
  return "Good evening";
}
