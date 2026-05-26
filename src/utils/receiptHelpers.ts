import {
  Receipt,
  ReceiptMeta,
  ReceiptPaymentMethod,
} from "../type/receipt";
import { formatInvoiceAmount } from "./invoiceHelpers";

export function getReceiptLastPage(meta: ReceiptMeta | undefined): number {
  if (!meta) {
    return 1;
  }
  if (meta.last_page != null && meta.last_page > 0) {
    return meta.last_page;
  }
  return Math.max(1, Math.ceil(meta.total / meta.per_page));
}

const RECEIPT_METHOD_LABELS: Record<ReceiptPaymentMethod, string> = {
  bank: "Bank",
  mercantile: "Mercantile",
  public_: "Public",
  religious: "Religious",
  online: "Online",
};

export function formatPaymentMethod(method: string): string {
  if (!method?.trim()) {
    return "—";
  }
  const key = method as ReceiptPaymentMethod;
  if (key in RECEIPT_METHOD_LABELS) {
    return RECEIPT_METHOD_LABELS[key];
  }
  return method
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function formatReceiptStatus(status: string): string {
  if (!status?.trim()) {
    return "—";
  }
  return status
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function getReceiptTitle(receipt: Receipt): string {
  if (receipt.reference_number?.trim()) {
    return receipt.reference_number.trim();
  }
  return `Receipt #${receipt.id}`;
}

export function getReceiptSubtitle(receipt: Receipt): string | null {
  const invoiceTitle = receipt.invoice?.title?.trim();
  if (invoiceTitle) {
    return invoiceTitle;
  }
  if (receipt.notes?.trim()) {
    return receipt.notes.trim();
  }
  return null;
}

export function getReceiptInvoiceNumber(receipt: Receipt): string {
  return receipt.invoice?.invoice_number ?? "—";
}

export function getReceiptPaymentDate(receipt: Receipt): string {
  return receipt.payment_date ?? "";
}

export function getReceiptCurrency(receipt: Receipt): string {
  return receipt.currency ?? "LKR";
}

export function formatByMethodSummary(
  byMethod: Record<string, number> | undefined,
  currency = "LKR",
): string | null {
  if (!byMethod) {
    return null;
  }

  const entries = Object.entries(byMethod);
  if (entries.length === 0) {
    return null;
  }

  return entries
    .map(([method, amount]) =>
      `${formatPaymentMethod(method)} ${formatInvoiceAmount(amount, currency)}`,
    )
    .join(" · ");
}
