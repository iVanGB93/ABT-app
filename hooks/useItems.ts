import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { itemService, type Item, type ItemCreateData, type ItemUpdateData } from '@/services';
import { setItems, itemFail, setItemMessage, setItemLoading, setUsedItems } from '@/app/(redux)/itemSlice';

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
  createItemWithImage: (formData: FormData) => Promise<Item | null>;
  updateItem: (data: ItemUpdateData) => Promise<Item | null>;
  updateItemWithImage: (formData: FormData) => Promise<Item | null>;
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
  const dispatch = useDispatch();
  const { business } = useSelector((state: any) => state.settings);
  const { items, itemError, itemLoading } = useSelector((state: any) => state.item);
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchItems = useCallback(async (showLoading = true) => {
    console.log('fetchItems called, business:', business?.name);
    
    if (!business?.name) {
      console.log('No business selected');
      dispatch(itemFail('No business selected'));
      return;
    }

    try {
      if (showLoading) {
        console.log('Setting itemLoading to true');
        dispatch(setItemLoading(true));
      }
      dispatch(setItemMessage(null)); // Clear previous errors
      
      console.log('Calling itemService.getItems...');
      const data = await itemService.getItems(business.name);
      console.log('Items data received:', data);
      
      dispatch(setItems(data));
      console.log('Setting itemLoading to false');
      dispatch(setItemLoading(false)); // ✨ Agregar esto para parar el loading
      setHasLoaded(true); // Marcar como cargado
    } catch (err: any) {
      console.log('Error in fetchItems:', err);
      dispatch(itemFail(err.message || 'Error loading items'));
    }
  }, [business?.name, dispatch]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchItems(false);
    setIsRefreshing(false);
  }, [fetchItems]);

  useEffect(() => {
    console.log('useEffect triggered - business:', business?.name, 'hasLoaded:', hasLoaded);
    // Solo hacer fetch la primera vez o si cambió el business
    if (business?.name && !hasLoaded) {
      fetchItems();
    }
  }, [business?.name, hasLoaded]); // Remover fetchItems de las dependencias

  // Filter items by search query if provided
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
    loading: itemLoading || isRefreshing,
    error: itemError,
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
  const dispatch = useDispatch();
  const { business } = useSelector((state: any) => state.settings);
  const { items } = useSelector((state: any) => state.item);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createItem = async (data: ItemCreateData): Promise<Item | null> => {
    if (!business?.name) {
      setError('No business selected');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await itemService.createItem(data, business.name);
      // Actualizar Redux store también
      dispatch(setItems([...items, result]));
      return result;
    } catch (err: any) {
      setError(err.message || 'Error creating item');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createItemWithImage = async (formData: FormData): Promise<Item | null> => {
    if (!business?.name) {
      setError('No business selected');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await itemService.createItemWithImage(formData, business.name);
      // Actualizar Redux store también
      dispatch(setItems([...items, result]));
      return result;
    } catch (err: any) {
      setError(err.message || 'Error creating item');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (data: ItemUpdateData): Promise<Item | null> => {
    if (!business?.name) {
      setError('No business selected');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await itemService.updateItem(data, business.name);
      // Actualizar Redux store
      const updatedItems = items.map((item: Item) => 
        item.id === result.id ? result : item
      );
      dispatch(setItems(updatedItems));
      return result;
    } catch (err: any) {
      setError(err.message || 'Error updating item');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateItemWithImage = async (formData: FormData): Promise<Item | null> => {
    if (!business?.name) {
      setError('No business selected');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await itemService.updateItemWithImage(formData, business.name);
      // Actualizar Redux store
      const updatedItems = items.map((item: Item) => 
        item.id === result.id ? result : item
      );
      dispatch(setItems(updatedItems));
      return result;
    } catch (err: any) {
      setError(err.message || 'Error updating item');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: number): Promise<boolean> => {
    if (!business?.name) {
      setError('No business selected');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      await itemService.deleteItem(id, business.name);
      // Actualizar Redux store
      const updatedItems = items.filter((item: Item) => item.id !== id);
      dispatch(setItems(updatedItems));
      return true;
    } catch (err: any) {
      setError(err.message || 'Error deleting item');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createItem,
    createItemWithImage,
    updateItem,
    updateItemWithImage,
    deleteItem,
  };
};

/**
 * Hook para item details - obtener used items y delete
 */
export const useItemDetails = (itemId: number | null): UseItemDetailsState => {
  const dispatch = useDispatch();
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
    if (!business?.name) {
      setError('No business selected');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      await itemService.deleteItem(id, business.name);
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

