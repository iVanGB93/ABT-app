import { ApiService } from './api';

// Tipos para Items/Products
export interface Item {
  id: number;
  name: string;
  description?: string;
  price: number;
  unit: string;
  category?: string;
  stock_quantity?: number;
  is_service: boolean;
  amount?: number; // Para compatibilidad con ItemCard
  date?: string; // Para compatibilidad con ItemCard  
  image?: string; // Para compatibilidad con ItemCard
  created_at: string;
  updated_at: string;
}

export interface ItemCreateData {
  name: string;
  description?: string;
  price: number;
  unit: string;
  category?: string;
  stock_quantity?: number;
  is_service?: boolean;
}

export interface ItemUpdateData extends Partial<ItemCreateData> {}

class ItemService extends ApiService {
  constructor() {
    super('items');
  }
  /**
   * Get all items for a business
   */
  async getItems(businessName: string, params?: { category?: string; is_service?: boolean }): Promise<Item[]> {
    return this.get<Item[]>(`/list/${businessName}/`, params);
  }
  /**
   * Get item by ID
   */
  async getItem(id: number): Promise<Item> {
    return this.get<Item>(`/${id}/`);
  }
  /**
   * Create or update item with FormData (unified method)
   */
  async createUpdateItem(formData: FormData, businessName: string): Promise<Item> {
    const action = formData.get('action') as string;
    if (action === 'update') {
      return this.postFormData<Item>(`/update/${businessName}/`, formData);
    } else {
      return this.postFormData<Item>(`/create/${businessName}/`, formData);
    }
  }
  /**
   * Delete item
   */
  async deleteItem(id: number): Promise<void> {
    return this.delete<void>(`/delete/${id}/`);
  }
  /**
   * Get jobs where this item is used
   */
  async getUsedItems(itemId: number): Promise<any[]> {
    return this.get<any[]>(`/used/${itemId}/`);
  }
  /**
   * Search items for a business
   */
  async searchItems(businessName: string, query: string): Promise<Item[]> {
    return this.get<Item[]>(`/list/${businessName}/`, { search: query });
  }
}

export const itemService = new ItemService();
