import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { itemService, type Item, type ItemCreateData } from '@/services';
import { setItems, itemFail, setItemLoading, setUsedItems } from '@/app/(redux)/itemSlice';
import { useAppDispatch } from '@/app/(redux)/store';

interface UseItemsState {
  items: Item[];
  refresh: () => Promise<void>;
}

interface UseItemState {
  item: Item | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface UseItemActionsState {
  createUpdateItem: (formData: FormData) => Promise<Item | null>;
  deleteItem: (id: number) => Promise<boolean>;
}

interface UseItemDetailsState {
  usedItems: any[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  deleteItem: (id: number) => Promise<boolean>;
}

/**
 * Hook para obtener lista de items
 */
export const useItems = (searchQuery?: string): UseItemsState => {
  const dispatch = useAppDispatch();
  const { business } = useSelector((state: any) => state.settings);
  const { items } = useSelector((state: any) => state.item);
  
  const fetchItems = useCallback(async (showLoading = true) => {
    if (!business?.name) {
      dispatch(itemFail('No business selected'));
      return;
    }
    try {
      dispatch(setItemLoading(true));
      const data = await itemService.getItems(business.name);
      dispatch(setItems(data));
    } catch (err: any) {
      dispatch(itemFail(err.message || 'Error loading items'));
    }
  }, [business?.name, dispatch]);

  const refresh = useCallback(async () => {
    dispatch(setItemLoading(true));
    await fetchItems(false);
  }, [fetchItems, dispatch]);

  useEffect(() => {
    if (business?.name) {
      fetchItems();
    }
  }, [business?.name, fetchItems]);

  const filteredItems = useMemo(() => {
    if (!searchQuery || !items) return items || [];
    
    return items.filter((item: Item) =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  return {
    items: filteredItems,
    refresh,
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
 * Hook para acciones de items (crear, actualizar, eliminar)
 */
export const useItemActions = (): UseItemActionsState => {
  const dispatch = useAppDispatch();
  const { business } = useSelector((state: any) => state.settings);
  const { items } = useSelector((state: any) => state.item);

  const createUpdateItem = async (formData: FormData): Promise<Item | null> => {
    if (!business?.name) {
      dispatch(itemFail('No business selected'));
      return null;
    }

    try {
      dispatch(setItemLoading(true));
      const result = await itemService.createUpdateItem(formData, business.name);
      const action = formData.get('action') as string;
      const id = formData.get('id');
      
      // Actualizar Redux store de manera inteligente
      if (action === 'update' && id) {
        // Update: reemplazar item existente
        const updatedItems = items.map((item: Item) =>
          item.id === parseInt(id as string) ? result : item
        );
        dispatch(setItems(updatedItems));
      } else {
        // Create: agregar nuevo item
        dispatch(setItems([...items, result]));
      }
      
      return result;
    } catch (err: any) {
      const action = formData.get('action') as string;
      dispatch(itemFail(err.message || `Error ${action === 'update' ? 'updating' : 'creating'} item`));
      return null;
    }
  };

  const deleteItem = async (id: number): Promise<boolean> => {
    try {
      dispatch(setItemLoading(true));
      await itemService.deleteItem(id);
      // Actualizar Redux store
      const updatedItems = items.filter((item: Item) => item.id !== id);
      dispatch(setItems(updatedItems));
      return true;
    } catch (err: any) {
      dispatch(itemFail(err.message || 'Error deleting item'));
      return false;
    }
  };

  return {
    createUpdateItem,
    deleteItem,
  };
};

/**
 * Hook para item details - obtener used items y delete
 */
export const useItemDetails = (itemId: number | null): UseItemDetailsState => {
  const dispatch = useAppDispatch();
  const { business } = useSelector((state: any) => state.settings);
  const { usedItems } = useSelector((state: any) => state.item);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsedItems = useCallback(async () => {
    if (!itemId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await itemService.getUsedItems(itemId);
      // Filtrar items únicos como en el código original
      const uniqueItems = data.filter(
        (item: { id: any }, index: any, self: any[]) =>
          index === self.findIndex((t) => t.id === item.id),
      );
      dispatch(setUsedItems(uniqueItems));
    } catch (err: any) {
      setError(err.message || 'Error loading used items');
      dispatch(setUsedItems([]));
    } finally {
      setLoading(false);
    }
  }, [itemId, dispatch]);

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

  useEffect(() => {
    fetchUsedItems();
  }, [fetchUsedItems]);

  return {
    usedItems: usedItems || [],
    loading,
    error,
    refresh: fetchUsedItems,
    deleteItem,
  };
};

