import { InvoiceFilterStatus } from "../../../type/invoice";

export type FinanceTab = "invoice" | "receipt";

export type AppliedInvoiceFilters = {
  status?: InvoiceFilterStatus;
  from?: string;
  to?: string;
};

export type PickerTarget = "start" | "end" | null;
