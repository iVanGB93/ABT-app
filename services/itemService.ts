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
    super('/items');
  }

  /**
   * Get all items
   */
  async getItems(params?: { category?: string; is_service?: boolean }): Promise<Item[]> {
    return this.get<Item[]>('/', params);
  }

  /**
   * Get item by ID
   */
  async getItem(id: number): Promise<Item> {
    return this.get<Item>(`/${id}/`);
  }

  /**
   * Create new item
   */
  async createItem(data: ItemCreateData): Promise<Item> {
    return this.post<Item>('/', data);
  }

  /**
   * Update item
   */
  async updateItem(id: number, data: ItemUpdateData): Promise<Item> {
    return this.patch<Item>(`/${id}/`, data);
  }

  /**
   * Delete item
   */
  async deleteItem(id: number): Promise<void> {
    return this.delete<void>(`/${id}/`);
  }

  /**
   * Search items
   */
  async searchItems(query: string): Promise<Item[]> {
    return this.get<Item[]>('/', { search: query });
  }
}

export const itemService = new ItemService();
