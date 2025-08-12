import { ApiService } from './api';

// Tipos para Jobs - Actualizados para coincidir con el modelo Django
export interface Job {
  id: number;
  business: number;
  provider?: number | null;
  client: number;
  client_name?: string; // Campo calculado del frontend
  client_name_lastName?: string; // Campo calculado con nombre completo
  status: 'pending' | 'confirmed' | 'in_progress' | 'on_hold' | 'review' | 'completed' | 'cancelled' | 'invoiced' | 'paid';
  description: string;
  address: string;
  price: number;
  image?: string;
  created_at: string;
  updated_at: string;
  scheduled_at?: string | null;
  completed_at?: string | null;
  closed: boolean;
}

export interface JobCreateData {
  business?: number; // Se puede inferir del contexto
  provider?: number;
  client: number;
  description: string;
  address: string;
  price: number;
  scheduled_at?: string;
}

export interface JobUpdateData extends Partial<JobCreateData> {
  id: number;
  status?: 'pending' | 'confirmed' | 'in_progress' | 'on_hold' | 'review' | 'completed' | 'cancelled' | 'invoiced' | 'paid';
  completed_at?: string | null;
  closed?: boolean;
}

export interface JobSpent {
  id: number;
  job: number;
  description: string;
  amount: number;
  date: string;
  created_at: string;
}

export interface JobSpentCreateData {
  job: number;
  description: string;
  amount: number;
  date?: string;
}

class JobService extends ApiService {
  constructor() {
    super('/jobs');
  }

  /**
   * Get all jobs
   */
  async getJobs(businessName: string, params?: { status?: string; client?: number }): Promise<Job[]> {
    return this.get<Job[]>(`/list/${businessName}/`, params);
  }

  /**
   * Get job by ID
   */
  async getJob(id: number): Promise<Job> {
    return this.get<Job>(`/${id}/`);
  }

  /**
   * Create new job
   */
  async createJob(data: JobCreateData): Promise<Job> {
    return this.post<Job>('/', data);
  }

  /**
   * Create new job with FormData (for image uploads)
   */
  async createJobWithFormData(formData: FormData, userName: string): Promise<Job> {
    return this.postFormData<Job>(`/create/${userName}/`, formData);
  }

  /**
   * Update job
   */
  async updateJob(id: number, data: JobUpdateData): Promise<Job> {
    return this.patch<Job>(`/${id}/`, data);
  }

  /**
   * Update job with FormData (for image uploads)
   */
  async updateJobWithFormData(formData: FormData, userName: string): Promise<Job> {
    return this.postFormData<Job>(`/update/${userName}/`, formData);
  }

  /**
   * Delete job
   */
  async deleteJob(id: number): Promise<void> {
    return this.delete<void>(`/${id}/`);
  }

  /**
   * Get job expenses/spents
   */
  async getJobSpents(jobId: number): Promise<JobSpent[]> {
    return this.get<JobSpent[]>(`/${jobId}/spents/`);
  }

  /**
   * Create job spent
   */
  async createJobSpent(data: JobSpentCreateData): Promise<JobSpent> {
    return this.post<JobSpent>('/spents/', data);
  }

  /**
   * Create job spent with FormData (for image uploads)
   */
  async createJobSpentWithFormData(formData: FormData): Promise<JobSpent> {
    return this.postFormData<JobSpent>('/spents/create/new/', formData);
  }

  /**
   * Update job spent
   */
  async updateJobSpent(id: number, data: Partial<JobSpentCreateData>): Promise<JobSpent> {
    return this.patch<JobSpent>(`/spents/${id}/`, data);
  }

  /**
   * Delete job spent
   */
  async deleteJobSpent(id: number): Promise<void> {
    return this.delete<void>(`/spents/${id}/`);
  }

  /**
   * Generate invoice for job
   */
  async generateInvoice(jobId: number): Promise<{ invoice_url: string }> {
    return this.post<{ invoice_url: string }>(`/${jobId}/generate-invoice/`);
  }

  /**
   * Create invoice for job
   */
  async createInvoice(jobId: number, data: { price: number; paid: number; charges: any }): Promise<any> {
    return this.post<any>(`/invoice/create/${jobId}/`, data);
  }

  /**
   * Get invoice for job
   */
  async getInvoice(jobId: number): Promise<{ invoice: any; charges: any }> {
    return this.get<{ invoice: any; charges: any }>(`/invoice/${jobId}/`);
  }

  /**
   * Update invoice for job
   */
  async updateInvoice(jobId: number, data: { price: number; paid: number; charges: any }): Promise<any> {
    return this.put<any>(`/invoice/update/${jobId}/`, data);
  }
}

export const jobService = new JobService();
