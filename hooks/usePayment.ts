import React, { useState, useCallback } from 'react';
import paymentService, { PaymentMethodCreateData, PaymentMethodUpdateData, BusinessPaymentMethod, PaymentMethodType } from '@/services/paymentService';

export const usePaymentMethods = (businessId: number) => {
  const [paymentMethods, setPaymentMethods] = useState<BusinessPaymentMethod[]>([]);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      const data = await paymentService.getBusinessPaymentMethods(businessId);
      setPaymentMethods(data);
      return true;
    } catch (error) {
      return false;
    }
  }, []);

  const refresh = useCallback(async () => {
      await fetchPaymentMethods();
    }, [fetchPaymentMethods]);

  return {
    paymentMethods,
    refreshPaymentMethods: refresh,
  };
}

export const usePaymentMethodActions = () => {
  const [ paymentMethodTypes, setPaymentMethodTypes ] = useState<PaymentMethodType[]>([]);
  const [ isLoading, setIsLoading ] = useState(false);

  const loadTypes = useCallback(async () => {
    try {
      const data = await paymentService.getPaymentMethodTypes();
      setPaymentMethodTypes(data);
    } catch (error) {
      console.error('Error loading payment method types:', error);
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadTypes();
  }, [loadTypes]);

  const createMethod = (businessId: number, data: PaymentMethodCreateData) => {
    setIsLoading(true);
    try {
      const result = paymentService.createBusinessPaymentMethod(businessId, data);
      return result
    } catch (error) {
      console.error('Error creating payment method:', error);
      return error;
    } finally {
      setIsLoading(false);
    }
  }

  const updateMethod = (businessId: number, data: PaymentMethodCreateData) => {
    setIsLoading(true);
    try {
      const result = paymentService.createBusinessPaymentMethod(businessId, data);
      return result
    } catch (error) {
      console.error('Error creating payment method:', error);
      return error;
    } finally {
      setIsLoading(false);
    }
  }

  const deleteMethod = async (businessId: number, paymentMethodId: number) => {
    try {
      await paymentService.deleteBusinessPaymentMethod(businessId, paymentMethodId);
      return true
    } catch (error) {
      console.error('Error deleting payment method:', error);
      return false
    }
  };

  const setDefault = (paymentMethodId: number) => {
    /* dispatch(setDefaultPaymentMethod(paymentMethodId)); */
    return
  }

  const toggleEnabled = (paymentMethodId: number) => {
    /* dispatch(togglePaymentMethodEnabled(paymentMethodId)); */
    return
  }

  return {
    paymentMethodTypes,
    refreshPaymentMethodTypes: refresh,
    isLoading,
    createMethod,
    updateMethod,
    deleteMethod,
    setDefault,
    toggleEnabled,
  };
}
/* 
export const usePayment = () => {
  const dispatch = useDispatch<AppDispatch>();
  const paymentState = useSelector((state: RootState) => state.payment);
  
  const updateMethod = (businessId: number, paymentMethodId: number, data: PaymentMethodUpdateData) =>
    dispatch(updateBusinessPaymentMethodThunk({ businessId, paymentMethodId, data }));

  const deleteMethod = async (businessId: number, paymentMethodId: number) => {
    try {
      await paymentService.deleteBusinessPaymentMethod(businessId, paymentMethodId);
      return true
    } catch (error) {
      console.error('Error deleting payment method:', error);
      return false
    }
  };

  const setDefaultMethod = (businessId: number, paymentMethodId: number) =>
    dispatch(setDefaultPaymentMethodThunk({ businessId, paymentMethodId }));

  // Sync actions
  const selectMethod = (method: BusinessPaymentMethod | null) =>
    dispatch(setSelectedPaymentMethod(method));
  
  const setMessage = (message: string | null) =>
    dispatch(setPaymentMessage(message));
  
  const clearErrors = () => dispatch(clearPaymentErrors());
  
  const resetState = () => dispatch(resetPaymentState());
  
  const setDefault = (paymentMethodId: number) =>
    dispatch(setDefaultPaymentMethod(paymentMethodId));
  
  const toggleEnabled = (paymentMethodId: number) =>
    dispatch(togglePaymentMethodEnabled(paymentMethodId));

  return {
    // State
    ...paymentState,
    
    // Actions
    updateMethod,
    deleteMethod,
    setDefaultMethod,
    selectMethod,
    setMessage,
    clearErrors,
    resetState,
    setDefault,
    toggleEnabled,
    
    // Computed values
    hasErrors: !!(paymentState.paymentTypesError || paymentState.paymentMethodsError),
    errorMessage: paymentState.paymentTypesError || paymentState.paymentMethodsError,
  };
};

export const usePaymentSelectors = () => {
  const paymentMethodTypes = useSelector(selectPaymentMethodTypes);
  const activePaymentMethodTypes = useSelector(selectActivePaymentMethodTypes);
  const businessPaymentMethods = useSelector(selectBusinessPaymentMethods);
  const enabledPaymentMethods = useSelector(selectEnabledPaymentMethods);
  const defaultPaymentMethod = useSelector(selectDefaultPaymentMethod);
  
  const getPaymentMethodByType = (typeCode: string) =>
    useSelector((state: RootState) => selectPaymentMethodByType(state, typeCode));
  
  const isPaymentMethodConfigured = (typeCode: string) =>
    useSelector((state: RootState) => selectIsPaymentMethodConfigured(state, typeCode));

  return {
    paymentMethodTypes,
    activePaymentMethodTypes,
    businessPaymentMethods,
    enabledPaymentMethods,
    defaultPaymentMethod,
    getPaymentMethodByType,
    isPaymentMethodConfigured,
  };
};
 */