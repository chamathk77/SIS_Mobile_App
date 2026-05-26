import { InvoiceFilterStatus } from "../../../type/invoice";

export type FinanceTab = "invoice" | "receipt";

export type AppliedInvoiceFilters = {
  status?: InvoiceFilterStatus;
  from?: string;
  to?: string;
};

import { ReceiptPaymentMethod } from "../../../type/receipt";

export type AppliedReceiptFilters = {
  from?: string;
  to?: string;
  method?: ReceiptPaymentMethod;
};

export type PickerTarget = "start" | "end" | null;
