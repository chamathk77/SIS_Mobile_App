export type InvoiceFilterStatus =
  | "sent"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled"
  | "refunded";

export const INVOICE_FILTER_STATUSES: InvoiceFilterStatus[] = [
  "sent",
  "partially_paid",
  "paid",
  "overdue",
  "cancelled",
  "refunded",
];

export type InvoiceStatus =
  | InvoiceFilterStatus
  | "unpaid"
  | string;

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  title?: string;
  billing_period: string | null;
  issued_at: string;
  due_date: string;
  paid_at?: string | null;
  status: InvoiceStatus;
  total: number;
  amount_paid: number;
  balance_due: number;
  paid?: number;
  balance?: number;
  currency?: string;
  items?: InvoiceItem[];
}

export interface InvoiceSummary {
  outstanding_total: number;
  overdue_total: number;
  paid_total_ytd: number;
}

export interface InvoiceMeta {
  summary?: InvoiceSummary;
  current_page: number;
  per_page: number;
  total: number;
  last_page?: number;
}

export interface InvoicesData {
  student_id: number;
  invoices: Invoice[];
  meta: InvoiceMeta;
}

export interface GetInvoices_Response {
  success: boolean;
  message: string;
  data: InvoicesData;
}

export interface GetInvoices_Request {
  student_id: string;
  page?: number;
  per_page?: number;
  status?: InvoiceFilterStatus;
  from?: string;
  to?: string;
}

export interface Receipt {
  id: number;
  receipt_number: string;
  invoice_number: string;
  title?: string;
  amount: number;
  currency?: string;
  payment_method: string;
  paid_at: string;
}
