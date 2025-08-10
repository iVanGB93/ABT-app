import { ApiService } from './api';

// Tipos para Clients
export interface Client {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  notes?: string;
  total_jobs: number;
  total_revenue: number;
  created_at: string;
  updated_at: string;
}

export interface ClientCreateData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  notes?: string;
}

export interface ClientUpdateData extends Partial<ClientCreateData> {}

class ClientService extends ApiService {
  constructor() {
    super('/clients');
  }

  /**
   * Get all clients
   */
  async getClients(search?: string): Promise<Client[]> {
    const params = search ? { search } : undefined;
    return this.get<Client[]>('/', params);
  }

  /**
   * Get client by ID
   */
  async getClient(id: number): Promise<Client> {
    return this.get<Client>(`/${id}/`);
  }

  /**
   * Create new client
   */
  async createClient(data: ClientCreateData): Promise<Client> {
    return this.post<Client>('/', data);
  }

  /**
   * Update client
   */
  async updateClient(id: number, data: ClientUpdateData): Promise<Client> {
    return this.patch<Client>(`/${id}/`, data);
  }

  /**
   * Delete client
   */
  async deleteClient(id: number): Promise<void> {
    return this.delete<void>(`/${id}/`);
  }

  /**
   * Get client's jobs
   */
  async getClientJobs(id: number): Promise<any[]> {
    return this.get<any[]>(`/${id}/jobs/`);
  }
}

export const clientService = new ClientService();
