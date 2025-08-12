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
    super('business');
  }

  /**
   * Get all businesses for a user
   */
  async getBusinesses(userName: string): Promise<Business[]> {
    return this.get<Business[]>(`/${userName}/`);
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
  async createBusiness(data: BusinessCreateData, userName: string): Promise<Business> {
    return this.post<Business>(`/create/${userName}/`, data);
  }

  /**
   * Update business
   */
  async updateBusiness(data: Partial<BusinessCreateData>, userName: string): Promise<Business> {
    return this.post<Business>(`/update/${userName}/`, data);
  }

  /**
   * Delete business
   */
  async deleteBusiness(id: number): Promise<void> {
    return this.post<void>(`/delete/${id}/`);
  }

  /**
   * Get business extras (expenses and income)
   */
  async getBusinessExtras(businessName: string): Promise<any> {
    return this.get<any>(`/extras/${businessName}/`);
  }

  /**
   * Create business extra (expense or income)
   */
  async createBusinessExtra(businessName: string, data: any): Promise<any> {
    return this.post<any>(`/extras/${businessName}/`, data);
  }

  /**
   * Get business statistics - simplified version
   */
  async getBusinessStats(businessName: string): Promise<BusinessStats> {
    // This would need to be implemented based on your backend
    // For now, we'll calculate from extras
    const extras = await this.getBusinessExtras(businessName);
    
    // Calculate basic stats from extras data
    const expenses = extras?.expenses || [];
    const income = extras?.income || [];
    
    const total_expenses = expenses.reduce((sum: number, expense: any) => sum + (Number(expense.amount) || 0), 0);
    const total_revenue = income.reduce((sum: number, inc: any) => sum + (Number(inc.amount) || 0), 0);
    
    return {
      total_revenue,
      total_expenses,
      total_profit: total_revenue - total_expenses,
      total_jobs: 0, // Would need to be calculated from jobs
      pending_jobs: 0,
      completed_jobs: 0,
      total_clients: 0, // Would need to be calculated from clients
      active_clients: 0,
    };
  }

  /**
   * Get monthly statistics
   */
  async getMonthlyStats(businessName: string, year: number, month: number): Promise<BusinessStats> {
    // Similar to getBusinessStats but filtered by month
    return this.getBusinessStats(businessName);
  }
}

export const businessService = new BusinessService();
