import { useState, useEffect, useCallback } from 'react';
import { clientService, type Client, type ClientCreateData, type ClientUpdateData } from '@/services';

interface UseClientsState {
  clients: Client[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  searchClients: (query: string) => Promise<void>;
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
  loading: boolean;
  error: string | null;
  createClient: (data: ClientCreateData) => Promise<Client | null>;
  updateClient: (id: number, data: ClientUpdateData) => Promise<Client | null>;
  deleteClient: (id: number) => Promise<boolean>;
}

/**
 * Hook para obtener lista de clients
 */
export const useClients = (searchQuery?: string): UseClientsState => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientService.getClients(search);
      setClients(data);
    } catch (err: any) {
      setError(err.message || 'Error loading clients');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchClients = useCallback(async (query: string) => {
    await fetchClients(query);
  }, [fetchClients]);

  useEffect(() => {
    fetchClients(searchQuery);
  }, [fetchClients, searchQuery]);

  return {
    clients,
    loading,
    error,
    refresh: () => fetchClients(searchQuery),
    searchClients,
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createClient = async (data: ClientCreateData): Promise<Client | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await clientService.createClient(data);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error creating client');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateClient = async (id: number, data: ClientUpdateData): Promise<Client | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await clientService.updateClient(id, data);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error updating client');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await clientService.deleteClient(id);
      return true;
    } catch (err: any) {
      setError(err.message || 'Error deleting client');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createClient,
    updateClient,
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
