import { Invoice, InvoiceMeta, InvoiceStatus } from "../type/invoice";

export function formatInvoiceDate(isoDate: string): string {
  if (!isoDate?.trim()) {
    return "—";
  }

  const datePart = isoDate.includes("T")
    ? isoDate.split("T")[0]
    : isoDate.split(" ")[0];
  const parts = datePart.split("-");
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

export function getInvoicePaid(invoice: Invoice): number {
  return invoice.amount_paid ?? invoice.paid ?? 0;
}

export function getInvoiceBalance(invoice: Invoice): number {
  return invoice.balance_due ?? invoice.balance ?? 0;
}

export function getInvoiceCurrency(invoice: Invoice): string {
  return invoice.currency ?? "LKR";
}

export function getInvoiceSubtitle(invoice: Invoice): string | null {
  if (invoice.title?.trim()) {
    return invoice.title.trim();
  }
  if (invoice.billing_period?.trim()) {
    return invoice.billing_period.trim();
  }
  return null;
}

export function formatInvoiceStatus(status: InvoiceStatus): string {
  if (!status) {
    return "Unknown";
  }

  return String(status)
    .trim()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export type InvoiceStatusColors = {
  background: string;
  text: string;
};

export function getInvoiceStatusColors(
  status: InvoiceStatus,
  theme: {
    successContainer: string;
    onSuccessContainer: string;
    errorContainer: string;
    onErrorContainer: string;
    tertiaryContainer: string;
    onTertiaryContainer: string;
    primaryContainer: string;
    onPrimaryContainer: string;
    secondaryContainer: string;
    onSecondaryContainer: string;
    surfaceVariant: string;
    onSurfaceVariant: string;
  },
): InvoiceStatusColors {
  const key = String(status).toLowerCase();

  switch (key) {
    case "paid":
      return {
        background: theme.successContainer,
        text: theme.onSuccessContainer,
      };
    case "partially_paid":
      return {
        background: theme.tertiaryContainer,
        text: theme.onTertiaryContainer,
      };
    case "overdue":
      return {
        background: theme.errorContainer,
        text: theme.onErrorContainer,
      };
    case "unpaid":
    case "pending":
      return {
        background: theme.primaryContainer,
        text: theme.onPrimaryContainer,
      };
    case "sent":
      return {
        background: theme.primaryContainer,
        text: theme.onPrimaryContainer,
      };
    case "cancelled":
      return {
        background: theme.surfaceVariant,
        text: theme.onSurfaceVariant,
      };
    case "refunded":
      return {
        background: theme.secondaryContainer,
        text: theme.onSecondaryContainer,
      };
    default:
      return {
        background: theme.secondaryContainer,
        text: theme.onSecondaryContainer,
      };
  }
}

export function formatInvoiceAmount(
  amount: number,
  currency = "LKR",
): string {
  const formatted = Number(amount).toLocaleString("en-LK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${currency} ${formatted}`;
}

export function getInvoiceLastPage(meta: InvoiceMeta | undefined): number {
  if (!meta) {
    return 1;
  }
  if (meta.last_page != null && meta.last_page > 0) {
    return meta.last_page;
  }
  return Math.max(1, Math.ceil(meta.total / meta.per_page));
}
