import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../config/apiConfig";
import { ApiErrorResponse } from "../type/common";
import { GetInvoices_Request, GetInvoices_Response } from "../type/invoice";

function buildInvoicesQuery(params: GetInvoices_Request): string {
  const page = params.page ?? 1;
  const perPage = params.per_page ?? 25;
  const query = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });

  if (params.status) {
    query.set("status", params.status);
  }
  if (params.from) {
    query.set("from", params.from);
  }
  if (params.to) {
    query.set("to", params.to);
  }

  return query.toString();
}

export const GetInvoices_Service = createAsyncThunk(
  "invoices/get",
  async (params: GetInvoices_Request) => {
    try {
      const page = params.page ?? 1;
      const response = await apiClient.get<GetInvoices_Response>(
        `invoices?${buildInvoicesQuery(params)}`,
        {
          headers: {
            "X-Student-Id": params.student_id,
          },
        },
      );

      if (response.status === 200) {
        return { ...response.data, page };
      }

      const apiError: ApiErrorResponse = {
        error: "Error",
        message: "Failed to load invoices",
        status: response.status,
        timestamp: new Date().toISOString(),
      };
      throw apiError;
    } catch (error: any) {
      if (error.error && error.message && error.status && error.timestamp) {
        throw error as ApiErrorResponse;
      }

      const networkError: ApiErrorResponse = {
        error: "Network Error",
        message:
          error.message ||
          "Network error. Please check your connection and try again.",
        status: 0,
        timestamp: new Date().toISOString(),
      };
      throw networkError;
    }
  },
);
