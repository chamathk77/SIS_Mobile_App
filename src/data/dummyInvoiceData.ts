import { Invoice, InvoiceMeta, InvoiceSummary } from "../type/invoice";
import { Receipt } from "../type/receipt";

export const USE_DUMMY_INVOICE_DATA = false;

export const DUMMY_INVOICE_SUMMARY: InvoiceSummary = {
  outstanding_total: 18000,
  overdue_total: 10000,
  paid_total_ytd: 220000,
};

export const DUMMY_INVOICES: Invoice[] = [
  {
    id: 1,
    invoice_number: "ZSE-INV-00001",
    title: "Monthly Tuition - March 2026",
    billing_period: null,
    total: 3500,
    amount_paid: 3500,
    balance_due: 0,
    status: "paid",
    due_date: "2026-03-31",
    issued_at: "2026-03-01T09:00:00+00:00",
    paid_at: "2026-03-15T10:30:00+00:00",
    currency: "LKR",
  },
  {
    id: 2,
    invoice_number: "RYC-INV-2026-0042",
    title: "Term 1 Fees",
    billing_period: "2026-T1",
    total: 30000,
    amount_paid: 20000,
    balance_due: 10000,
    status: "partially_paid",
    due_date: "2026-02-10",
    issued_at: "2026-01-10",
    currency: "LKR",
    items: [
      {
        description: "Tuition fee (Term 1)",
        quantity: 1,
        unit_price: 22000,
        amount: 22000,
      },
      { description: "Lab fee", quantity: 1, unit_price: 4500, amount: 4500 },
      { description: "Insurance", quantity: 1, unit_price: 3500, amount: 3500 },
    ],
  },
  {
    id: 3,
    invoice_number: "ZSE-INV-00003",
    title: "April Tuition",
    billing_period: "2026-04",
    total: 3500,
    amount_paid: 0,
    balance_due: 3500,
    status: "sent",
    due_date: "2026-04-30",
    issued_at: "2026-04-01T09:00:00+00:00",
    currency: "LKR",
  },
  {
    id: 4,
    invoice_number: "ZSE-INV-00004",
    title: "February Tuition",
    billing_period: "2026-02",
    total: 3500,
    amount_paid: 0,
    balance_due: 3500,
    status: "overdue",
    due_date: "2026-02-28",
    issued_at: "2026-02-01T09:00:00+00:00",
    currency: "LKR",
  },
  {
    id: 5,
    invoice_number: "ZSE-INV-00005",
    title: "Sports Activity Fee",
    billing_period: "2026-T1",
    total: 2500,
    amount_paid: 0,
    balance_due: 2500,
    status: "cancelled",
    due_date: "2026-01-31",
    issued_at: "2026-01-05",
    currency: "LKR",
  },
  {
    id: 6,
    invoice_number: "ZSE-INV-00006",
    title: "Deposit Refund",
    billing_period: null,
    total: 5000,
    amount_paid: 5000,
    balance_due: 0,
    status: "refunded",
    due_date: "2026-01-15",
    issued_at: "2026-01-01",
    paid_at: "2026-01-20",
    currency: "LKR",
  },
];

export const DUMMY_RECEIPTS: Receipt[] = [
  {
    id: 101,
    amount: 3500,
    payment_method: "bank",
    payment_date: "2026-03-15",
    reference_number: "ZSE-RCP-00001",
    status: "completed",
    currency: "LKR",
    invoice: {
      id: 1,
      invoice_number: "ZSE-INV-00001",
      title: "Monthly Tuition - March 2026",
      total: 3500,
    },
  },
  {
    id: 102,
    amount: 20000,
    payment_method: "card",
    payment_date: "2026-01-25",
    reference_number: "RYC-RCP-2026-0018",
    status: "completed",
    currency: "LKR",
    invoice: {
      id: 2,
      invoice_number: "RYC-INV-2026-0042",
      title: "Term 1 Fees (partial)",
      total: 35000,
    },
  },
  {
    id: 103,
    amount: 5000,
    payment_method: "bank",
    payment_date: "2026-01-20",
    reference_number: "ZSE-RCP-00006",
    status: "completed",
    currency: "LKR",
    invoice: {
      id: 6,
      invoice_number: "ZSE-INV-00006",
      title: "Deposit Refund",
      total: 5000,
    },
  },
];

const PER_PAGE = 25;

function invoiceDateKey(isoDate: string): string {
  return isoDate.includes("T") ? isoDate.split("T")[0] : isoDate.split(" ")[0];
}

export function filterDummyInvoices(
  invoices: Invoice[],
  filters: {
    status?: string;
    from?: string;
    to?: string;
  },
): Invoice[] {
  return invoices.filter((invoice) => {
    if (filters.status && invoice.status !== filters.status) {
      return false;
    }

    const issued = invoiceDateKey(invoice.issued_at);
    if (filters.from && issued < filters.from) {
      return false;
    }
    if (filters.to && issued > filters.to) {
      return false;
    }

    return true;
  });
}

export function getDummyInvoiceMeta(
  filteredCount: number,
  currentPage: number,
): InvoiceMeta {
  return {
    summary: DUMMY_INVOICE_SUMMARY,
    current_page: currentPage,
    per_page: PER_PAGE,
    total: filteredCount,
    last_page: Math.max(1, Math.ceil(filteredCount / PER_PAGE)),
  };
}

export function paginateDummyInvoices(
  invoices: Invoice[],
  page: number,
): Invoice[] {
  return invoices.slice(0, page * PER_PAGE);
}
