import { createAsyncThunk } from "@reduxjs/toolkit";
import { AnyActionArg } from "react";
import { apiClient } from "../config/apiConfig";
import { ApiErrorResponse } from "../type/common";
import { LoginRequest, LoginResponse } from "../type/Auth";

export const login_Service= createAsyncThunk(
    'auth/login',
    async (loginData: LoginRequest, { rejectWithValue }) => {
      try {
        const response = await apiClient.post<LoginResponse>('/auth/login', loginData);

        if (response.status === 200) {
  
            console.log('Login response:', response);

            return response.data;
          }

        const apiError: ApiErrorResponse = {
            error: 'Error',
            message: 'Login failed',
            status: response.status,
            timestamp: new Date().toISOString(),
          };
          throw apiError;
      } catch (error: any) {

        console.log('Login error:', error);
        // If error already has the API format (from interceptor), re-throw as-is
        if (error.error && error.message && error.status && error.timestamp) {
          throw error as ApiErrorResponse;
        }
    
        // Handle network and other errors - format to match API error structure
        const networkError: ApiErrorResponse = {
          error: 'Network Error',
          message: error.message || 'Network error. Please check your connection and try again.',
          status: 0,
          timestamp: new Date().toISOString(),
        };
        throw networkError;
        
      }
    }
  );

