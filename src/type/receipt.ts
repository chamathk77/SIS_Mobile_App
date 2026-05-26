export type ReceiptPaymentMethod =
  | "bank"
  | "mercantile"
  | "public_"
  | "religious"
  | "online";

export const RECEIPT_PAYMENT_METHODS: ReceiptPaymentMethod[] = [
  "bank",
  "mercantile",
  "public_",
  "religious",
  "online",
];

export interface ReceiptInvoice {
  id: number;
  invoice_number: string;
  title?: string;
  total?: number;
}

export interface Receipt {
  id: number;
  amount: number;
  payment_method: string;
  payment_date: string;
  reference_number?: string | null;
  status: string;
  notes?: string | null;
  currency?: string;
  invoice: ReceiptInvoice;
}

export interface ReceiptSummary {
  total_paid_in_range: number;
  by_method?: Record<string, number>;
}

export interface ReceiptMeta {
  summary?: ReceiptSummary;
  current_page: number;
  per_page: number;
  total: number;
  last_page?: number;
}

export interface ReceiptsData {
  student_id: number;
  receipts: Receipt[];
  meta: ReceiptMeta;
}

export interface GetReceipts_Response {
  success: boolean;
  message: string;
  data: ReceiptsData;
}

export interface GetReceipts_Request {
  student_id: string;
  page?: number;
  per_page?: number;
  from?: string;
  to?: string;
  /** API query `method` — repeatable; we send one value from the filter UI */
  method?: ReceiptPaymentMethod | ReceiptPaymentMethod[];
}
