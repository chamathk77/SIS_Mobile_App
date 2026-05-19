import { AttendanceStatus } from "../type/attendance";

export function formatAttendanceDate(isoDate: string): string {
  if (!isoDate?.trim()) {
    return "—";
  }

  const parts = isoDate.split("-");
  if (parts.length !== 3) {
    return isoDate;
  }

  const [year, month, day] = parts.map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatAttendanceStatus(status: AttendanceStatus): string {
  if (!status) {
    return "Unknown";
  }
  const s = String(status).trim();
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export type AttendanceStatusColors = {
  background: string;
  text: string;
};

export function getAttendanceStatusColors(
  status: AttendanceStatus,
  theme: {
    successContainer: string;
    onSuccessContainer: string;
    errorContainer: string;
    onErrorContainer: string;
    tertiaryContainer: string;
    onTertiaryContainer: string;
    surfaceVariant: string;
    onSurfaceVariant: string;
  },
): AttendanceStatusColors {
  const key = String(status).toLowerCase();

  switch (key) {
    case "present":
      return {
        background: theme.successContainer,
        text: theme.onSuccessContainer,
      };
    case "absent":
      return {
        background: theme.errorContainer,
        text: theme.onErrorContainer,
      };
    case "late":
      return {
        background: theme.tertiaryContainer,
        text: theme.onTertiaryContainer,
      };
    default:
      return {
        background: theme.surfaceVariant,
        text: theme.onSurfaceVariant,
      };
  }
}
