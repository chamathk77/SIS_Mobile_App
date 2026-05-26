import { createSlice } from "@reduxjs/toolkit";
import { GetReceipts_Service } from "../../services/ReceiptService";
import { logout } from "./AuthReducer";
import { devLog } from "../../utils/devLog";
import { GetReceipts_Response } from "../../type/receipt";

type ReceiptPayload = GetReceipts_Response & { page?: number };

interface ReceiptState {
  loading: boolean;
  error: string | null;
  success: boolean;
  data: ReceiptPayload | null;
}

const initialState: ReceiptState = {
  loading: false,
  error: null,
  success: false,
  data: null,
};

export const ReceiptSlice = createSlice({
  name: "Receipt",
  initialState,
  reducers: {
    resetReceipts: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);

    builder.addCase(GetReceipts_Service.pending, (state, action) => {
      state.loading = true;
      state.error = null;
      if ((action.meta.arg.page ?? 1) === 1) {
        state.data = null;
      }
    });
    builder.addCase(GetReceipts_Service.fulfilled, (state, action) => {
      devLog("Get Receipts Fulfilled:", action.payload);
      state.loading = false;
      state.success = true;
      state.error = null;

      const page = action.payload.page ?? 1;
      if (page === 1 || !state.data?.data?.receipts) {
        state.data = action.payload;
      } else {
        const prev = state.data.data.receipts ?? [];
        const next = action.payload.data?.receipts ?? [];
        state.data = {
          ...action.payload,
          data: {
            ...action.payload.data,
            receipts: [...prev, ...next],
          },
        };
      }
    });
    builder.addCase(GetReceipts_Service.rejected, (state, action) => {
      devLog("Get Receipts Rejected:", action.error);
      state.loading = false;
      state.error = action.error.message || "An error occurred";
      state.success = false;
    });
  },
});

export const { resetReceipts } = ReceiptSlice.actions;

export default ReceiptSlice.reducer;
