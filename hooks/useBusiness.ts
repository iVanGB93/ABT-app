import { useState, useEffect, useCallback } from 'react';
import { businessService, type Business, type BusinessStats, type BusinessCreateData } from '@/services';

interface UseBusinessesState {
  businesses: Business[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface UseBusinessState {
  business: Business | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface UseBusinessStatsState {
  stats: BusinessStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface UseBusinessActionsState {
  loading: boolean;
  error: string | null;
  createBusiness: (data: BusinessCreateData) => Promise<Business | null>;
  updateBusiness: (id: number, data: Partial<BusinessCreateData>) => Promise<Business | null>;
  deleteBusiness: (id: number) => Promise<boolean>;
}

/**
 * Hook para obtener lista de businesses
 */
export const useBusinesses = (): UseBusinessesState => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await businessService.getBusinesses();
      setBusinesses(data);
    } catch (err: any) {
      setError(err.message || 'Error loading businesses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  return {
    businesses,
    loading,
    error,
    refresh: fetchBusinesses,
  };
};

/**
 * Hook para obtener un business específico
 */
export const useBusiness = (id: number | null): UseBusinessState => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusiness = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await businessService.getBusiness(id);
      setBusiness(data);
    } catch (err: any) {
      setError(err.message || 'Error loading business');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBusiness();
  }, [fetchBusiness]);

  return {
    business,
    loading,
    error,
    refresh: fetchBusiness,
  };
};

/**
 * Hook para obtener estadísticas de business
 */
export const useBusinessStats = (id: number | null): UseBusinessStatsState => {
  const [stats, setStats] = useState<BusinessStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await businessService.getBusinessStats(id);
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Error loading business stats');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
};

/**
 * Hook para obtener estadísticas mensuales
 */
export const useBusinessMonthlyStats = (id: number | null, year: number, month: number): UseBusinessStatsState => {
  const [stats, setStats] = useState<BusinessStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMonthlyStats = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await businessService.getMonthlyStats(id, year, month);
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Error loading monthly stats');
    } finally {
      setLoading(false);
    }
  }, [id, year, month]);

  useEffect(() => {
    fetchMonthlyStats();
  }, [fetchMonthlyStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchMonthlyStats,
  };
};

/**
 * Hook para acciones de business (crear, actualizar, eliminar)
 */
export const useBusinessActions = (): UseBusinessActionsState => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBusiness = async (data: BusinessCreateData): Promise<Business | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await businessService.createBusiness(data);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error creating business');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateBusiness = async (id: number, data: Partial<BusinessCreateData>): Promise<Business | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await businessService.updateBusiness(id, data);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error updating business');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteBusiness = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await businessService.deleteBusiness(id);
      return true;
    } catch (err: any) {
      setError(err.message || 'Error deleting business');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createBusiness,
    updateBusiness,
    deleteBusiness,
  };
};
