import axiosInstance from '@/axios';
import { AxiosResponse } from 'axios';

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status?: number;
  field?: string;
}

export class ApiService {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  /**
   * GET request
   */
  async get<T>(path: string = '', params?: object): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axiosInstance.get(
        `${this.endpoint}${path}`,
        { params }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * POST request
   */
  async post<T>(path: string = '', data?: object): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axiosInstance.post(
        `${this.endpoint}${path}`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * POST request with FormData (for file uploads)
   */
  async postFormData<T>(path: string = '', formData: FormData): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axiosInstance.post(
        `${this.endpoint}${path}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * PUT request
   */
  async put<T>(path: string = '', data?: object): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axiosInstance.put(
        `${this.endpoint}${path}`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * PATCH request
   */
  async patch<T>(path: string = '', data?: object): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axiosInstance.patch(
        `${this.endpoint}${path}`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * DELETE request
   */
  async delete<T>(path: string = ''): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axiosInstance.delete(
        `${this.endpoint}${path}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle and format errors consistently
   */
  private handleError(error: any): ApiError {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;
      
      if (data?.message) {
        return { message: data.message, status };
      }
      
      if (data?.detail) {
        return { message: data.detail, status };
      }
      
      if (data?.error) {
        return { message: data.error, status };
      }

      // Handle validation errors
      if (data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        if (firstKey && Array.isArray(data[firstKey])) {
          return { 
            message: data[firstKey][0], 
            status, 
            field: firstKey 
          };
        }
      }

      return { 
        message: `Server Error: ${status}`, 
        status 
      };
    }
    
    if (error.request) {
      // Network error
      return { 
        message: 'Network error. Please check your connection.', 
        status: 0 
      };
    }
    
    // Other errors
    return { 
      message: error.message || 'An unexpected error occurred', 
      status: -1 
    };
  }
}
