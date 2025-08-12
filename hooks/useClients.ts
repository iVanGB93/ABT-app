import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clientService, type Client, type ClientCreateData } from '@/services';
import { setClients, clientFail, clientSetMessage, setClientLoading } from '@/app/(redux)/clientSlice';

interface UseClientsState {
  clients: Client[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface UseClientState {
  client: Client | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface UseClientJobsState {
  jobs: any[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface UseClientActionsState {
  error: string | null;
  createUpdateClient: (data: ClientCreateData & { id?: number }) => Promise<Client | null>;
  createUpdateClientWithImage: (formData: FormData) => Promise<Client | null>;
  deleteClient: (id: number) => Promise<boolean>;
}

/**
 * Hook para obtener lista de clients
 */
export const useClients = (searchQuery?: string): UseClientsState => {
  const dispatch = useDispatch();
  const { business } = useSelector((state: any) => state.settings);
  const { clients, clientError, clientLoading } = useSelector((state: any) => state.client);
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchClients = useCallback(async (showLoading = true) => {
    if (!business?.name) {
      dispatch(clientFail('No business selected'));
      return;
    }

    try {
      if (showLoading) {
        dispatch(setClientLoading(true));
      }
      dispatch(clientSetMessage(null)); // Clear previous errors
      
      const data = await clientService.getClients(business.name);
      dispatch(setClients(data));
    } catch (err: any) {
      dispatch(clientFail(err.message || 'Error loading clients'));
    } finally {
      if (showLoading) {
        dispatch(setClientLoading(false));
      }
    }
  }, [business?.name, dispatch]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchClients(false);
    setIsRefreshing(false);
  }, [fetchClients]);

  useEffect(() => {
    // Solo hacer fetch si no hay datos o si cambió el business
    if (business?.name && (!clients || clients.length === 0)) {
      fetchClients();
    }
  }, [business?.name, fetchClients]);

  // Filter clients by search query if provided
  const filteredClients = useMemo(() => {
    if (!searchQuery || !clients) return clients || [];
    
    return clients.filter((client: Client) =>
      client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clients, searchQuery]);

  return {
    clients: filteredClients,
    loading: clientLoading || isRefreshing,
    error: clientError,
    refresh,
  };
};

/**
 * Hook para obtener un client específico
 */
export const useClient = (id: number | null): UseClientState => {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClient = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await clientService.getClient(id);
      setClient(data);
    } catch (err: any) {
      setError(err.message || 'Error loading client');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  return {
    client,
    loading,
    error,
    refresh: fetchClient,
  };
};

/**
 * Hook para obtener jobs de un client
 */
export const useClientJobs = (clientId: number | null): UseClientJobsState => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientJobs = useCallback(async () => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await clientService.getClientJobs(clientId);
      setJobs(data);
    } catch (err: any) {
      setError(err.message || 'Error loading client jobs');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchClientJobs();
  }, [fetchClientJobs]);

  return {
    jobs,
    loading,
    error,
    refresh: fetchClientJobs,
  };
};

/**
 * Hook para acciones de clients (crear, actualizar, eliminar)
 */
export const useClientActions = (): UseClientActionsState => {
  const dispatch = useDispatch();
  const { userName } = useSelector((state: any) => state.auth);
  const { clients } = useSelector((state: any) => state.client);
  const [error, setError] = useState<string | null>(null);

  const createUpdateClient = async (data: ClientCreateData & { id?: number }): Promise<Client | null> => {
    if (!userName) {
      setError('User not authenticated');
      return null;
    }

    try {
      dispatch(setClientLoading(true));
      setError(null);
      
      const result = await clientService.createUpdateClient(data, userName);
      
      // Actualizar Redux store de manera inteligente
      if (data.id) {
        // Update: reemplazar cliente existente
        const updatedClients = clients.map((client: Client) => 
          client.id === data.id ? result : client
        );
        dispatch(setClients(updatedClients));
      } else {
        // Create: agregar nuevo cliente
        dispatch(setClients([...clients, result]));
      }
      
      return result;
    } catch (err: any) {
      setError(err.message || `Error ${data.id ? 'updating' : 'creating'} client`);
      return null;
    } finally {
      dispatch(setClientLoading(false));
    }
  };

  const createUpdateClientWithImage = async (formData: FormData): Promise<Client | null> => {
    if (!userName) {
      setError('User not authenticated');
      return null;
    }

    try {
      dispatch(setClientLoading(true));
      setError(null);
      
      const result = await clientService.createUpdateClientWithImage(formData, userName);
      const action = formData.get('action') as string;
      const id = formData.get('id');
      
      // Actualizar Redux store de manera inteligente
      if (action === 'update' && id) {
        // Update: reemplazar cliente existente
        const updatedClients = clients.map((client: Client) => 
          client.id === parseInt(id as string) ? result : client
        );
        dispatch(setClients(updatedClients));
      } else {
        // Create: agregar nuevo cliente
        dispatch(setClients([...clients, result]));
      }
      
      return result;
    } catch (err: any) {
      const action = formData.get('action') as string;
      setError(err.message || `Error ${action === 'update' ? 'updating' : 'creating'} client`);
      return null;
    } finally {
      dispatch(setClientLoading(false));
    }
  };

  const deleteClient = async (id: number): Promise<boolean> => {
    try {
      dispatch(setClientLoading(true));
      setError(null);
      
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
      setError(err.message || 'Error deleting client');
      return false;
    } finally {
      dispatch(setClientLoading(false));
    }
  };

  return {
    error,
    createUpdateClient,
    createUpdateClientWithImage,
    deleteClient,
  };
};

/**
 * Hook combinado para obtener clients con filtros y búsqueda avanzada
 */
export const useClientsWithSearch = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  
  const { clients, loading, error, refresh } = useClients(debouncedQuery);

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
    loading,
    error,
    refresh,
    searchQuery,
    handleSearch,
    clearSearch,
  };
};
