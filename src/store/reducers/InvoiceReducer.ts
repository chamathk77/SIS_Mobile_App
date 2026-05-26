import { createSlice } from "@reduxjs/toolkit";
import { GetInvoices_Service } from "../../services/InvoiceService";
import { logout } from "./AuthReducer";
import { devLog } from "../../utils/devLog";

interface InvoiceState {
  loading: boolean;
  error: string | null;
  success: boolean;
  data: any;
}

const initialState: InvoiceState = {
  loading: false,
  error: null,
  success: false,
  data: null,
};

export const InvoiceSlice = createSlice({
  name: "Invoice",
  initialState,
  reducers: {
    resetInvoices: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);

    builder.addCase(GetInvoices_Service.pending, (state, action) => {
      state.loading = true;
      state.error = null;
      if ((action.meta.arg.page ?? 1) === 1) {
        state.data = null;
      }
    });
    builder.addCase(GetInvoices_Service.fulfilled, (state, action) => {
      devLog("Get Invoices Fulfilled:", action.payload);
      state.loading = false;
      state.success = true;
      state.error = null;

      const page = action.payload.page ?? 1;
      if (page === 1 || !state.data?.data?.invoices) {
        state.data = action.payload;
      } else {
        const prev = state.data.data.invoices ?? [];
        const next = action.payload.data?.invoices ?? [];
        state.data = {
          ...action.payload,
          data: {
            ...action.payload.data,
            invoices: [...prev, ...next],
          },
        };
      }
    });
    builder.addCase(GetInvoices_Service.rejected, (state, action) => {
      devLog("Get Invoices Rejected:", action.error);
      state.loading = false;
      state.error = action.error.message || "An error occurred";
      state.success = false;
    });
  },
});

export const { resetInvoices } = InvoiceSlice.actions;

export default InvoiceSlice.reducer;
