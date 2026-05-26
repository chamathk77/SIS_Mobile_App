import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../config/apiConfig";
import { ApiErrorResponse } from "../type/common";
import { GetReceipts_Request, GetReceipts_Response } from "../type/receipt";

function buildReceiptsQuery(params: GetReceipts_Request): string {
  const page = params.page ?? 1;
  const perPage = params.per_page ?? 25;
  const query = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });

  if (params.from) {
    query.set("from", params.from);
  }
  if (params.to) {
    query.set("to", params.to);
  }

  if (params.method) {
    const methods = Array.isArray(params.method) ? params.method : [params.method];
    methods.forEach((method) => {
      query.append("method", method);
    });
  }

  return query.toString();
}

export const GetReceipts_Service = createAsyncThunk(
  "receipts/get",
  async (params: GetReceipts_Request) => {
    try {
      const page = params.page ?? 1;
      const response = await apiClient.get<GetReceipts_Response>(
        `receipts?${buildReceiptsQuery(params)}`,
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
        message: "Failed to load receipts",
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
