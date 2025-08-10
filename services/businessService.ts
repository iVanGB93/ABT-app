import { ApiService } from './api';

// Tipos para Business
export interface Business {
  id: number;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessStats {
  total_revenue: number;
  total_expenses: number;
  total_profit: number;
  total_jobs: number;
  pending_jobs: number;
  completed_jobs: number;
  total_clients: number;
  active_clients: number;
}

export interface BusinessCreateData {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface BusinessUpdateData extends Partial<BusinessCreateData> {
  id: number;
}

class BusinessService extends ApiService {
  constructor() {
    super('/business');
  }

  /**
   * Get all businesses
   */
  async getBusinesses(): Promise<Business[]> {
    return this.get<Business[]>('/');
  }

  /**
   * Get business by ID
   */
  async getBusiness(id: number): Promise<Business> {
    return this.get<Business>(`/${id}/`);
  }

  /**
   * Create new business
   */
  async createBusiness(data: BusinessCreateData): Promise<Business> {
    return this.post<Business>('/', data);
  }

  /**
   * Update business
   */
  async updateBusiness(id: number, data: Partial<BusinessCreateData>): Promise<Business> {
    return this.patch<Business>(`/${id}/`, data);
  }

  /**
   * Delete business
   */
  async deleteBusiness(id: number): Promise<void> {
    return this.delete<void>(`/${id}/`);
  }

  /**
   * Get business statistics
   */
  async getBusinessStats(id: number): Promise<BusinessStats> {
    return this.get<BusinessStats>(`/${id}/stats/`);
  }

  /**
   * Get monthly statistics
   */
  async getMonthlyStats(id: number, year: number, month: number): Promise<BusinessStats> {
    return this.get<BusinessStats>(`/${id}/stats/monthly/`, { year, month });
  }

  /**
   * Upload business logo
   */
  async uploadLogo(id: number, logoFile: FormData): Promise<Business> {
    return this.post<Business>(`/${id}/upload-logo/`, logoFile);
  }
}

export const businessService = new BusinessService();
