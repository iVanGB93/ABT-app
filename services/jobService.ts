import { ApiService } from './api';

// Tipos para Jobs
export interface Job {
  id: number;
  title: string;
  description?: string;
  client: number;
  client_name?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  estimated_hours?: number;
  actual_hours?: number;
  hourly_rate?: number;
  fixed_price?: number;
  total_amount: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface JobCreateData {
  title: string;
  description?: string;
  client: number;
  estimated_hours?: number;
  hourly_rate?: number;
  fixed_price?: number;
  start_date?: string;
  end_date?: string;
}

export interface JobUpdateData extends Partial<JobCreateData> {
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  actual_hours?: number;
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
  async getJobs(params?: { status?: string; client?: number }): Promise<Job[]> {
    return this.get<Job[]>('/', params);
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
   * Update job
   */
  async updateJob(id: number, data: JobUpdateData): Promise<Job> {
    return this.patch<Job>(`/${id}/`, data);
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
}

export const jobService = new JobService();
