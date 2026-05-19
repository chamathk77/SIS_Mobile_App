import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../config/apiConfig";
import { ApiErrorResponse } from "../type/common";
import {
  GetAttendance_Request,
  GetAttendance_Response,
} from "../type/attendance";

export const GetAttendance_Service = createAsyncThunk(
  "attendance/get",
  async (params: GetAttendance_Request) => {
    try {
      const page = params.page ?? 1;
      const response = await apiClient.get<GetAttendance_Response>(
        `attendance?from=2026-04-01&to=2026-04-30&page=${page}&per_page=10`,
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
        message: "Failed to load attendance",
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
