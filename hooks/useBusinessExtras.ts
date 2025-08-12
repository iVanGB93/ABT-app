import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { businessService } from '@/services';
import { RootState } from '@/app/(redux)/store';
import { setExtraExpenses, setExtraIncome, businessSetMessage, businessSetError } from '@/app/(redux)/businessSlice';
import { setBusiness } from '@/app/(redux)/settingSlice';
import { authLogout } from '@/app/(redux)/authSlice';

interface UseBusinessExtrasState {
  extraExpenses: any[];
  extraIncome: any[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook para obtener los extras del business (gastos e ingresos)
 */
export const useBusinessExtras = (): UseBusinessExtrasState => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { business } = useSelector((state: RootState) => state.settings);
  const { extraExpenses, extraIncome } = useSelector((state: RootState) => state.business);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const businessName = business?.name;

  const fetchExtras = useCallback(async () => {
    if (!businessName) {
      setLoading(false);
      setError('No business selected');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      dispatch(businessSetError(null));
      
      const response = await businessService.getBusinessExtras(businessName);
      
      // The response should already be the data from the API service
      if (response) {
        dispatch(setExtraExpenses(response.extra_expenses || []));
        dispatch(setExtraIncome(response.extra_income || []));
      } else {
        dispatch(businessSetMessage('No data received'));
      }
    } catch (err: any) {
      console.error('Error fetching extras:', err);
      
      if (typeof err.response === 'undefined') {
        const errorMessage = 'Error fetching extras, undefined';
        setError(errorMessage);
        dispatch(businessSetError(errorMessage));
      } else {
        if (err.response.status === 401) {
          dispatch(setBusiness([]));
          dispatch(authLogout());
          router.replace('/');
        } else {
          const errorMessage = 'Error fetching extras';
          setError(errorMessage);
          dispatch(businessSetError(errorMessage));
        }
      }
    } finally {
      setLoading(false);
    }
  }, [businessName, dispatch, router]);

  useEffect(() => {
    fetchExtras();
  }, [fetchExtras]);

  return {
    extraExpenses: extraExpenses || [],
    extraIncome: extraIncome || [],
    loading,
    error,
    refresh: fetchExtras,
  };
};
