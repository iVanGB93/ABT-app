import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clientService, type Client, type ClientCreateData } from '@/services';
import { setClients, clientFail, setClient, setClientLoading } from '@/app/(redux)/clientSlice';

interface UseClientsState {
  clients: Client[];
  refresh: () => Promise<void>;
}
interface UseClientState {
  refresh: () => Promise<void>;
}
interface UseClientActionsState {
  createUpdateClient: (formData: FormData) => Promise<Client | null>;
  deleteClient: (id: number) => Promise<boolean>;
}
/**
 * Hook para obtener lista de clients
 */
export const useClients = (searchQuery?: string): UseClientsState => {
  const dispatch = useDispatch();
  const { business } = useSelector((state: any) => state.settings);
  const { clients } = useSelector((state: any) => state.client);
  

  const fetchClients = useCallback(async () => {
    if (!business?.name) {
      dispatch(clientFail('No business selected'));
      return;
    }

    try {
      dispatch(setClientLoading(true));

      const data = await clientService.getClients(business.name);
      dispatch(setClients(data));
    } catch (err: any) {
      dispatch(clientFail(err.message || 'Error loading clients'));
    } 
  }, [business?.name, dispatch]);

  const refresh = useCallback(async () => {
    dispatch(setClientLoading(true));
    await fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    // Solo hacer fetch si no hay datos o si cambió el business
    if (business?.name && (!clients || clients.length === 0)) {
      fetchClients();
    }
  }, [business?.name, fetchClients]);

  // Filter clients by search query if provided
  const filteredClients = useMemo(() => {
    if (!searchQuery || !clients) {
      // Sort all clients alphabetically by name (create copy first)
      return [...(clients || [])].sort((a: Client, b: Client) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
    }
    
    // Filter and sort clients by search query (create copy first)
    return clients
      .filter((client: Client) =>
        client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a: Client, b: Client) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }, [clients, searchQuery]);

  return {
    clients: filteredClients,
    refresh,
  };
};

/**
 * Hook para obtener un client específico
 */
export const useClient = (id: number | null): UseClientState => {
  const dispatch = useDispatch();

  const fetchClient = useCallback(async () => {
    if (!id) {
      return;
    }
    try {
      dispatch(setClientLoading(true));
      const data = await clientService.getClient(id);
      dispatch(setClient(data));
    } catch (err: any) {
      dispatch(clientFail(err.message || 'Error loading client'));
    }
  }, [id]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  return {
    refresh: fetchClient,
  };
};

/**
 * Hook para acciones de clients (crear, actualizar, eliminar)
 */
export const useClientActions = (): UseClientActionsState => {
  const dispatch = useDispatch();
  const { userName } = useSelector((state: any) => state.auth);
  const { clients } = useSelector((state: any) => state.client);

  const createUpdateClient = async (formData: FormData): Promise<Client | null> => {
    if (!userName) {
      dispatch(clientFail('User not authenticated'));
      return null;
    }

    try {
      dispatch(setClientLoading(true));
      
      const result = await clientService.createUpdateClient(formData, userName);
      const action = formData.get('action') as string;
      const id = formData.get('id');
      
      // Actualizar Redux store de manera inteligente
      if (action === 'update' && id) {
        // Update: reemplazar cliente existente
        const updatedClients = clients.map((client: Client) => 
          client.id === parseInt(id as string) ? result : client
        );
        // Sort the updated list alphabetically
        const sortedClients = updatedClients.sort((a: Client, b: Client) => {
          const nameA = (a.name || '').toLowerCase();
          const nameB = (b.name || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
        dispatch(setClients(sortedClients));
      } else {
        // Create: agregar nuevo cliente y ordenar
        const newClientsList = [...clients, result];
        const sortedClients = newClientsList.sort((a: Client, b: Client) => {
          const nameA = (a.name || '').toLowerCase();
          const nameB = (b.name || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
        dispatch(setClients(sortedClients));
      }
      
      return result;
    } catch (err: any) {
      const action = formData.get('action') as string;
      dispatch(clientFail(err.message || `Error ${action === 'update' ? 'updating' : 'creating'} client`));
      return null;
    }
  };

  const deleteClient = async (id: number): Promise<boolean> => {
    try {
      dispatch(setClientLoading(true));
      
      // Create FormData with action: 'delete'
      const formData = new FormData();
      formData.append('action', 'delete');
      formData.append('id', id.toString());
      
      await clientService.deleteClient(formData);
      // Actualizar Redux store
      const updatedClients = clients.filter((client: Client) => client.id !== id);
      dispatch(setClients(updatedClients));
      return true;
    } catch (err: any) {
      dispatch(clientFail(err.message || 'Error deleting client'));
      return false;
    }
  };

  return {
    createUpdateClient,
    deleteClient,
  };
};

/**
 * Hook combinado para obtener clients con filtros y búsqueda avanzada
 */
export const useClientsWithSearch = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  
  const { clients, refresh } = useClients(debouncedQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
  };

  return {
    clients,
    refresh,
    searchQuery,
    handleSearch,
    clearSearch,
  };
};
