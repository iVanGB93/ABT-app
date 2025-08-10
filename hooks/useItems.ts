import { useState, useEffect, useCallback } from 'react';
import { itemService, type Item, type ItemCreateData, type ItemUpdateData } from '@/services';

interface UseItemsState {
  items: Item[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface UseItemState {
  item: Item | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface UseItemActionsState {
  loading: boolean;
  error: string | null;
  createItem: (data: ItemCreateData) => Promise<Item | null>;
  updateItem: (id: number, data: ItemUpdateData) => Promise<Item | null>;
  deleteItem: (id: number) => Promise<boolean>;
  searchItems: (query: string) => Promise<Item[]>;
}

interface UseItemFiltersState {
  items: Item[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  filterByCategory: (category: string) => void;
  filterByType: (isService: boolean) => void;
  clearFilters: () => void;
  searchItems: (query: string) => Promise<void>;
}

/**
 * Hook para obtener lista de items
 */
export const useItems = (filters?: { category?: string; is_service?: boolean }): UseItemsState => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await itemService.getItems(filters);
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Error loading items');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    loading,
    error,
    refresh: fetchItems,
  };
};

/**
 * Hook para obtener un item específico
 */
export const useItem = (id: number | null): UseItemState => {
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItem = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await itemService.getItem(id);
      setItem(data);
    } catch (err: any) {
      setError(err.message || 'Error loading item');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  return {
    item,
    loading,
    error,
    refresh: fetchItem,
  };
};

/**
 * Hook para acciones de items (crear, actualizar, eliminar, buscar)
 */
export const useItemActions = (): UseItemActionsState => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createItem = async (data: ItemCreateData): Promise<Item | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await itemService.createItem(data);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error creating item');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id: number, data: ItemUpdateData): Promise<Item | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await itemService.updateItem(id, data);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error updating item');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await itemService.deleteItem(id);
      return true;
    } catch (err: any) {
      setError(err.message || 'Error deleting item');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const searchItems = async (query: string): Promise<Item[]> => {
    try {
      setLoading(true);
      setError(null);
      const result = await itemService.searchItems(query);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error searching items');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    searchItems,
  };
};

/**
 * Hook avanzado para items con filtros y búsqueda
 */
export const useItemsWithFilters = (): UseItemFiltersState => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ category?: string; is_service?: boolean }>({});
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data: Item[];
      if (searchQuery.trim()) {
        data = await itemService.searchItems(searchQuery);
      } else {
        data = await itemService.getItems(filters);
      }
      
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Error loading items');
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filterByCategory = (category: string) => {
    setFilters(prev => ({ ...prev, category }));
    setSearchQuery(''); // Clear search when filtering
  };

  const filterByType = (isService: boolean) => {
    setFilters(prev => ({ ...prev, is_service: isService }));
    setSearchQuery(''); // Clear search when filtering
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const searchItems = async (query: string) => {
    setSearchQuery(query);
    setFilters({}); // Clear filters when searching
  };

  return {
    items,
    loading,
    error,
    refresh: fetchItems,
    filterByCategory,
    filterByType,
    clearFilters,
    searchItems,
  };
};

/**
 * Hook para obtener items por categoría
 */
export const useItemsByCategory = (category: string) => {
  return useItems({ category });
};

/**
 * Hook para obtener solo servicios
 */
export const useServices = () => {
  return useItems({ is_service: true });
};

/**
 * Hook para obtener solo productos
 */
export const useProducts = () => {
  return useItems({ is_service: false });
};

/**
 * Hook con debounce para búsqueda de items
 */
export const useItemSearch = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Perform search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const results = await itemService.searchItems(debouncedQuery);
        setSearchResults(results);
      } catch (err: any) {
        setError(err.message || 'Error searching items');
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSearchResults([]);
  };

  return {
    searchQuery,
    searchResults,
    loading,
    error,
    handleSearch,
    clearSearch,
    hasResults: searchResults.length > 0,
    isSearching: debouncedQuery.trim().length > 0,
  };
};
