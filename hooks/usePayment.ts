import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/app/(redux)/store';
import {
  // Async actions
  loadPaymentMethodTypes,
  loadBusinessPaymentMethods,
  createBusinessPaymentMethod,
  updateBusinessPaymentMethodThunk,
  deleteBusinessPaymentMethod,
  setDefaultPaymentMethodThunk,
  // Sync actions
  setSelectedPaymentMethod,
  setPaymentMessage,
  clearPaymentErrors,
  resetPaymentState,
  setDefaultPaymentMethod,
  togglePaymentMethodEnabled,
  // Selectors
  selectPaymentMethodTypes,
  selectActivePaymentMethodTypes,
  selectBusinessPaymentMethods,
  selectEnabledPaymentMethods,
  selectDefaultPaymentMethod,
  selectPaymentMethodByType,
  selectIsPaymentMethodConfigured,
} from '@/app/(redux)/paymentSlice';
import { PaymentMethodCreateData, PaymentMethodUpdateData, BusinessPaymentMethod } from '@/services/paymentService';

export const usePayment = () => {
  const dispatch = useDispatch<AppDispatch>();
  const paymentState = useSelector((state: RootState) => state.payment);

  // Async actions
  const loadTypes = () => dispatch(loadPaymentMethodTypes());
  
  const loadMethods = (businessId: number) => 
    dispatch(loadBusinessPaymentMethods(businessId));
  
  const createMethod = (businessId: number, data: PaymentMethodCreateData) =>
    dispatch(createBusinessPaymentMethod({ businessId, data }));
  
  const updateMethod = (businessId: number, paymentMethodId: number, data: PaymentMethodUpdateData) =>
    dispatch(updateBusinessPaymentMethodThunk({ businessId, paymentMethodId, data }));
  
  const deleteMethod = (businessId: number, paymentMethodId: number) =>
    dispatch(deleteBusinessPaymentMethod({ businessId, paymentMethodId }));

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
    loadTypes,
    loadMethods,
    createMethod,
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
    isLoading: paymentState.paymentTypesLoading || paymentState.paymentMethodsLoading,
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
