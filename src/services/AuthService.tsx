import { createAsyncThunk } from "@reduxjs/toolkit";
import { AnyActionArg } from "react";
import { apiClient } from "../config/apiConfig";
import { ensureInternetConnection } from "../utils/checkInternetConnection";
import { ApiErrorResponse } from "../type/common";
import { ForgotPassword_EnterEmail_Response, ForgotPassword_EnterEmail_Request, LoginRequest, LoginResponse, ForgotPassword_EnterPin_Request, ForgotPassword_EnterPin_Response, ForgotPassword_CreateNewPassword_Request, ForgotPassword_CreateNewPassword_Response } from "../type/auth";

export const login_Service = createAsyncThunk(
  "auth/login",
  async (loginData: LoginRequest, { rejectWithValue }) => {
    try {
      await ensureInternetConnection();

      const response = await apiClient.post<LoginResponse>(
        "/auth/login",
        loginData,
      );

      if (response.status === 200) {
        console.log("Login response:", response.data);

        return response.data;
      }

      const apiError: ApiErrorResponse = {
        error: "Error",
        message: "Login failed",
        status: response.status,
        timestamp: new Date().toISOString(),
      };
      throw apiError;
    } catch (error: any) {
      console.log("Login error:---", error);
      // If error already has the API format (from interceptor), re-throw as-is
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

export const ForgotPassword_EnterEmail_Service = createAsyncThunk(
  "auth/forgot-password/enter-email",
  async (forgotPasswordData: ForgotPassword_EnterEmail_Request, { rejectWithValue }) => {
    try {
      await ensureInternetConnection();

      const response = await apiClient.post<ForgotPassword_EnterEmail_Response>(
        "/auth/forgot-password",
        forgotPasswordData,
      );

      if (response.status === 200) {
        console.log("Forgot Password Enter Email response:", response);

        return response.data;
      }

      const apiError: ApiErrorResponse = {
        error: "Error",
        message: "Error in Forgot Password",
        status: response.status,
        timestamp: new Date().toISOString(),
      };
      throw apiError;
    } catch (error: any) {
      console.log(" Forgot Password Enter Email error:---" , error);
      // If error already has the API format (from interceptor), re-throw as-is
      if (error.error && error.message && error.status && error.timestamp) {
        throw error as ApiErrorResponse;
      }

      // Handle network and other errors - format to match API error structure
      const networkError: ApiErrorResponse = {
        error: "Network Error",
        message:
          error.message ||
          "Network error. Please check your connection and try again.",
        status: 0,
        timestamp: new Date().toISOString(),
      };
      console.log("networkError:---" , networkError);
      throw networkError;
    }
  },
);


export const ForgotPassword_EnterPin_Service = createAsyncThunk(
  "auth/forgot-password/enter-pin",
  async (forgotPasswordData: ForgotPassword_EnterPin_Request, { rejectWithValue }) => {
    try {
      await ensureInternetConnection();
 
      const response = await apiClient.post<ForgotPassword_EnterPin_Response>(
        "/auth/forgot-password/verify",
        forgotPasswordData,
      );

      if (response.status === 200) {
        console.log("Forgot Password Enter Pin response:", response);

        return response.data;
      }

      const apiError: ApiErrorResponse = {
        error: "Error",
        message: "Error in Forgot Password Enter Pin",
        status: response.status,
        timestamp: new Date().toISOString(),
      };
      throw apiError;
    } catch (error: any) {
      console.log(" Forgot Password Enter Pin error:---" , error);
      // If error already has the API format (from interceptor), re-throw as-is
      if (error.error && error.message && error.status && error.timestamp) {
        throw error as ApiErrorResponse;
      }

      // Handle network and other errors - format to match API error structure
      const networkError: ApiErrorResponse = {
        error: "Network Error",
        message:
          error.message ||
          "Network error. Please check your connection and try again.",
        status: 0,
        timestamp: new Date().toISOString(),
      };
      console.log("networkError:---" , networkError);
      throw networkError;
    }
  },
);


export const ForgotPassword_CreateNewPassword_Service = createAsyncThunk(
  "auth/forgot-password/create-new-password",
  async (forgotPasswordData: ForgotPassword_CreateNewPassword_Request, { rejectWithValue }) => {
    try {
      await ensureInternetConnection();
 
      const response = await apiClient.post<ForgotPassword_CreateNewPassword_Response>(
        "/auth/forgot-password/reset",
        forgotPasswordData,
      );

      if (response.status === 200) {
        console.log("Forgot Password Create New Password response:", response);

        return response.data;
      }

      const apiError: ApiErrorResponse = {
        error: "Error",
        message: "Error in Forgot Password Create New Password",
        status: response.status,
        timestamp: new Date().toISOString(),
      };
      throw apiError;
    } catch (error: any) {
      console.log(" Forgot Password Create New Password error:---" , error);
      // If error already has the API format (from interceptor), re-throw as-is
      if (error.error && error.message && error.status && error.timestamp) {
        throw error as ApiErrorResponse;
      }

      // Handle network and other errors - format to match API error structure
      const networkError: ApiErrorResponse = {
        error: "Network Error",
        message:
          error.message ||
          "Network error. Please check your connection and try again.",
        status: 0,
        timestamp: new Date().toISOString(),
      };
      console.log("networkError:---" , networkError);
      throw networkError;
    }
  },
);

