import { ApiService } from './api';

// Tipos para Clients - Actualizados para coincidir con el modelo Django
export interface Client {
  id: number;
  business: number; // FK al Business (requerido)
  provider: number; // FK al User (requerido)
  name: string; // Requerido, max 80 chars
  last_name: string; // Requerido con default 'no last name saved', max 80 chars
  email: string; // Requerido con default 'no@email.saved', max 80 chars
  phone: string; // Requerido con default 'no phone saved', max 15 chars
  address: string; // Requerido con default 'no address saved', max 150 chars
  image: string; // ImageField con default 'userDefault.jpg'
  created_at: string; // auto_now_add=True
  updated_at: string; // auto_now=True
}

export interface ClientCreateData {
  business?: number; // Se puede inferir del contexto
  provider?: number; // Se puede inferir del usuario actual
  name: string; // Requerido
  last_name?: string; // Opcional, se aplicará default del backend si no se envía
  email?: string; // Opcional, se aplicará default del backend si no se envía
  phone?: string; // Opcional, se aplicará default del backend si no se envía
  address?: string; // Opcional, se aplicará default del backend si no se envía
}

class ClientService extends ApiService {
  constructor() {
    super('clients');
  }

  /**
   * Get all clients for a business
   */
  async getClients(businessName: string): Promise<Client[]> {
    return this.get<Client[]>(`/${businessName}/`);
  }

  /**
   * Get client by ID
   */
  async getClient(id: number): Promise<Client> {
    return this.get<Client>(`/${id}/`);
  }

  /**
   * Create or update client (unified method)
   */
  async createUpdateClient(data: ClientCreateData & { id?: number }, userName: string): Promise<Client> {
    if (data.id) {
      // Update existing client
      return this.post<Client>(`/update/${userName}/`, data);
    } else {
      // Create new client
      return this.post<Client>(`/create/${userName}/`, data);
    }
  }

  /**
   * Create or update client with FormData (unified method for image upload)
   */
  async createUpdateClientWithImage(formData: FormData, userName: string): Promise<Client> {
    const action = formData.get('action') as string;
    if (action === 'update') {
      return this.postFormData<Client>(`/update/${userName}/`, formData);
    } else {
      return this.postFormData<Client>(`/create/${userName}/`, formData);
    }
  }

  /**
   * Delete client
   */
  async deleteClient(formData: FormData): Promise<void> {
    // Extract id from formData to use in URL, assuming it's there
    const id = formData.get('id');
    return this.postFormData<void>(`/delete/${id}/`, formData);
  }

  /**
   * Get client's jobs - not implemented in original API
   */
  async getClientJobs(id: number): Promise<any[]> {
    // This endpoint doesn't exist in your current API
    // Would need to filter jobs by client_id
    return [];
  }
}

export const clientService = new ClientService();
