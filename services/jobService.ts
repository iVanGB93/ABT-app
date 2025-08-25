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

export interface JobSpent {
  id: number;
  job: number;
  name?: string;
  description: string;
  price: number;
  date: string;
  image?: string;
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
   * Create or update job with FormData (unified method)
   */
  async createUpdateJob(formData: FormData, userName: string): Promise<Job> {
    const action = formData.get('action') as string;
    if (action === 'update') {
      return this.postFormData<Job>(`/update/${userName}/`, formData);
    } else if (action === 'close' || action === 'delete') {
      return this.postFormData<Job>(`/update/${formData.get('job_id')}/`, formData);
    } else {
      return this.postFormData<Job>(`/create/${userName}/`, formData);
    }
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
    return this.get<JobSpent[]>(`/spents/list/${jobId}/`);
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
   * Create or update job spent with FormData (unified method)
   */
  async createUpdateJobSpent(formData: FormData): Promise<JobSpent> {
    const action = formData.get('action') as string;
    if (action === 'update') {
      return this.postFormData<JobSpent>('/spents/update/', formData);
    } else {
      return this.postFormData<JobSpent>('/spents/create/new/', formData);
    }
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
  async deleteJobSpent(formData: FormData): Promise<void> {
    const id = formData.get('id') as string;
    return this.postFormData<void>(`/spents/delete/${id}/`, formData);
  }

  /**
   * Generate invoice for job
   */
  async generateInvoice(jobId: number): Promise<{ invoice_url: string }> {
    return this.post<{ invoice_url: string }>(`/${jobId}/generate-invoice/`);
  }

  /**
   * Create or update invoice for job
   */
  async createUpdateInvoice(jobId: number, action: string, data: { price: number; paid: number; charges: any }): Promise<any> {
    if (action === 'update') {
      return this.put<any>(`/invoice/update/${jobId}/`, data);
    } else {
      return this.post<any>(`/invoice/create/${jobId}/`, data);
    }
  }

  /**
   * Get invoice for job
   */
  async getInvoice(jobId: number): Promise<{ invoice: any; charges: any }> {
    return this.get<{ invoice: any; charges: any }>(`/invoice/${jobId}/`);
  }
}

export const jobService = new JobService();
