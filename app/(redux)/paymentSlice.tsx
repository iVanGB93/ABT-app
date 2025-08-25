import { PayloadAction, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  PaymentMethodType, 
  BusinessPaymentMethod, 
  PaymentMethodCreateData,
  PaymentMethodUpdateData
} from '@/services/paymentService';

export interface PaymentState {
  // Payment Method Types (catalog)
  paymentMethodTypes: PaymentMethodType[];
  paymentTypesLoading: boolean;
  paymentTypesError: string | null;

  // Business Payment Methods
  businessPaymentMethods: BusinessPaymentMethod[];
  paymentMethodsLoading: boolean;
  paymentMethodsError: string | null;

  // UI State
  selectedPaymentMethod: BusinessPaymentMethod | null;
  paymentMessage: string | null;
}

const initialState: PaymentState = {
  // Payment Method Types
  paymentMethodTypes: [],
  paymentTypesLoading: false,
  paymentTypesError: null,

  // Business Payment Methods
  businessPaymentMethods: [],
  paymentMethodsLoading: false,
  paymentMethodsError: null,

  // UI State
  selectedPaymentMethod: null,
  paymentMessage: null,
};

// Async Thunks
export const loadPaymentMethodTypes = createAsyncThunk(
  'payment/loadPaymentMethodTypes',
  async (_, { rejectWithValue }) => {
    try {
      const { paymentService } = await import('@/services/paymentService');
      return await paymentService.getPaymentMethodTypes();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load payment method types');
    }
  }
);

export const loadBusinessPaymentMethods = createAsyncThunk(
  'payment/loadBusinessPaymentMethods',
  async (businessId: number, { rejectWithValue }) => {
    try {
      const { paymentService } = await import('@/services/paymentService');
      return await paymentService.getBusinessPaymentMethods(businessId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load payment methods');
    }
  }
);

export const createBusinessPaymentMethod = createAsyncThunk(
  'payment/createBusinessPaymentMethod',
  async (
    { businessId, data }: { businessId: number; data: PaymentMethodCreateData }, 
    { rejectWithValue }
  ) => {
    try {
      const { paymentService } = await import('@/services/paymentService');
      return await paymentService.createBusinessPaymentMethod(businessId, data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create payment method');
    }
  }
);

export const updateBusinessPaymentMethodThunk = createAsyncThunk(
  'payment/updateBusinessPaymentMethod',
  async (
    { businessId, paymentMethodId, data }: { 
      businessId: number; 
      paymentMethodId: number; 
      data: PaymentMethodUpdateData 
    }, 
    { rejectWithValue }
  ) => {
    try {
      const { paymentService } = await import('@/services/paymentService');
      return await paymentService.updateBusinessPaymentMethod(businessId, paymentMethodId, data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update payment method');
    }
  }
);

export const deleteBusinessPaymentMethod = createAsyncThunk(
  'payment/deleteBusinessPaymentMethod',
  async (
    { businessId, paymentMethodId }: { businessId: number; paymentMethodId: number }, 
    { rejectWithValue }
  ) => {
    try {
      const { paymentService } = await import('@/services/paymentService');
      await paymentService.deleteBusinessPaymentMethod(businessId, paymentMethodId);
      return paymentMethodId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete payment method');
    }
  }
);

export const setDefaultPaymentMethodThunk = createAsyncThunk(
  'payment/setDefaultPaymentMethodThunk',
  async (
    { businessId, paymentMethodId }: { businessId: number; paymentMethodId: number }, 
    { rejectWithValue }
  ) => {
    try {
      const { paymentService } = await import('@/services/paymentService');
      return await paymentService.setDefaultPaymentMethod(businessId, paymentMethodId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to set default payment method');
    }
  }
);

export const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    // Payment Method Types Actions
    setPaymentTypesLoading: (state, action: PayloadAction<boolean>) => {
      state.paymentTypesLoading = action.payload;
      if (action.payload) {
        state.paymentTypesError = null;
      }
    },
    setPaymentMethodTypes: (state, action: PayloadAction<PaymentMethodType[]>) => {
      state.paymentMethodTypes = action.payload;
      state.paymentTypesLoading = false;
      state.paymentTypesError = null;
    },
    setPaymentTypesError: (state, action: PayloadAction<string>) => {
      state.paymentTypesError = action.payload;
      state.paymentTypesLoading = false;
    },

    // Business Payment Methods Actions
    setPaymentMethodsLoading: (state, action: PayloadAction<boolean>) => {
      state.paymentMethodsLoading = action.payload;
      if (action.payload) {
        state.paymentMethodsError = null;
      }
    },
    setBusinessPaymentMethods: (state, action: PayloadAction<BusinessPaymentMethod[]>) => {
      state.businessPaymentMethods = action.payload;
      state.paymentMethodsLoading = false;
      state.paymentMethodsError = null;
    },
    setPaymentMethodsError: (state, action: PayloadAction<string>) => {
      state.paymentMethodsError = action.payload;
      state.paymentMethodsLoading = false;
    },

    // CRUD Operations
    addBusinessPaymentMethod: (state, action: PayloadAction<BusinessPaymentMethod>) => {
      state.businessPaymentMethods.push(action.payload);
    },
    updateBusinessPaymentMethod: (state, action: PayloadAction<BusinessPaymentMethod>) => {
      const index = state.businessPaymentMethods.findIndex(
        method => method.id === action.payload.id
      );
      if (index !== -1) {
        state.businessPaymentMethods[index] = action.payload;
      }
    },
    removeBusinessPaymentMethod: (state, action: PayloadAction<number>) => {
      state.businessPaymentMethods = state.businessPaymentMethods.filter(
        method => method.id !== action.payload
      );
    },

    // Set default payment method
    setDefaultPaymentMethod: (state, action: PayloadAction<number>) => {
      state.businessPaymentMethods = state.businessPaymentMethods.map(method => ({
        ...method,
        is_default: method.id === action.payload,
      }));
    },

    // Toggle payment method enabled/disabled
    togglePaymentMethodEnabled: (state, action: PayloadAction<number>) => {
      const method = state.businessPaymentMethods.find(m => m.id === action.payload);
      if (method) {
        method.is_enabled = !method.is_enabled;
        // If disabling the default method, unset it as default
        if (!method.is_enabled && method.is_default) {
          method.is_default = false;
        }
      }
    },

    // UI State Actions
    setSelectedPaymentMethod: (state, action: PayloadAction<BusinessPaymentMethod | null>) => {
      state.selectedPaymentMethod = action.payload;
    },
    setPaymentMessage: (state, action: PayloadAction<string | null>) => {
      state.paymentMessage = action.payload;
    },

    // Clear all errors and messages
    clearPaymentErrors: (state) => {
      state.paymentTypesError = null;
      state.paymentMethodsError = null;
      state.paymentMessage = null;
    },

    // Reset state (useful when switching businesses)
    resetPaymentState: () => initialState,
  },
  extraReducers: (builder) => {
    // Load Payment Method Types
    builder
      .addCase(loadPaymentMethodTypes.pending, (state) => {
        state.paymentTypesLoading = true;
        state.paymentTypesError = null;
      })
      .addCase(loadPaymentMethodTypes.fulfilled, (state, action) => {
        state.paymentTypesLoading = false;
        state.paymentMethodTypes = action.payload;
      })
      .addCase(loadPaymentMethodTypes.rejected, (state, action) => {
        state.paymentTypesLoading = false;
        state.paymentTypesError = action.payload as string;
      });

    // Load Business Payment Methods
    builder
      .addCase(loadBusinessPaymentMethods.pending, (state) => {
        state.paymentMethodsLoading = true;
        state.paymentMethodsError = null;
      })
      .addCase(loadBusinessPaymentMethods.fulfilled, (state, action) => {
        state.paymentMethodsLoading = false;
        state.businessPaymentMethods = action.payload;
      })
      .addCase(loadBusinessPaymentMethods.rejected, (state, action) => {
        state.paymentMethodsLoading = false;
        state.paymentMethodsError = action.payload as string;
      });

    // Create Business Payment Method
    builder
      .addCase(createBusinessPaymentMethod.pending, (state) => {
        state.paymentMethodsLoading = true;
        state.paymentMethodsError = null;
      })
      .addCase(createBusinessPaymentMethod.fulfilled, (state, action) => {
        state.paymentMethodsLoading = false;
        state.businessPaymentMethods.push(action.payload);
        state.paymentMessage = 'Payment method created successfully';
      })
      .addCase(createBusinessPaymentMethod.rejected, (state, action) => {
        state.paymentMethodsLoading = false;
        state.paymentMethodsError = action.payload as string;
      });

    // Update Business Payment Method
    builder
      .addCase(updateBusinessPaymentMethodThunk.pending, (state) => {
        state.paymentMethodsLoading = true;
        state.paymentMethodsError = null;
      })
      .addCase(updateBusinessPaymentMethodThunk.fulfilled, (state, action) => {
        state.paymentMethodsLoading = false;
        const index = state.businessPaymentMethods.findIndex(
          method => method.id === action.payload.id
        );
        if (index !== -1) {
          state.businessPaymentMethods[index] = action.payload;
        }
        state.paymentMessage = 'Payment method updated successfully';
      })
      .addCase(updateBusinessPaymentMethodThunk.rejected, (state, action) => {
        state.paymentMethodsLoading = false;
        state.paymentMethodsError = action.payload as string;
      });

    // Delete Business Payment Method
    builder
      .addCase(deleteBusinessPaymentMethod.pending, (state) => {
        state.paymentMethodsLoading = true;
        state.paymentMethodsError = null;
      })
      .addCase(deleteBusinessPaymentMethod.fulfilled, (state, action) => {
        state.paymentMethodsLoading = false;
        state.businessPaymentMethods = state.businessPaymentMethods.filter(
          method => method.id !== action.payload
        );
        state.paymentMessage = 'Payment method deleted successfully';
      })
      .addCase(deleteBusinessPaymentMethod.rejected, (state, action) => {
        state.paymentMethodsLoading = false;
        state.paymentMethodsError = action.payload as string;
      });

    // Set Default Payment Method
    builder
      .addCase(setDefaultPaymentMethodThunk.pending, (state) => {
        state.paymentMethodsLoading = true;
        state.paymentMethodsError = null;
      })
      .addCase(setDefaultPaymentMethodThunk.fulfilled, (state, action) => {
        state.paymentMethodsLoading = false;
        // Update all methods to unset default, then set the new one
        state.businessPaymentMethods = state.businessPaymentMethods.map(method => ({
          ...method,
          is_default: method.id === action.payload.id,
        }));
        state.paymentMessage = 'Default payment method updated successfully';
      })
      .addCase(setDefaultPaymentMethodThunk.rejected, (state, action) => {
        state.paymentMethodsLoading = false;
        state.paymentMethodsError = action.payload as string;
      });
  },
});

// Export actions
export const {
  setPaymentTypesLoading,
  setPaymentMethodTypes,
  setPaymentTypesError,
  setPaymentMethodsLoading,
  setBusinessPaymentMethods,
  setPaymentMethodsError,
  addBusinessPaymentMethod,
  updateBusinessPaymentMethod,
  removeBusinessPaymentMethod,
  setDefaultPaymentMethod,
  togglePaymentMethodEnabled,
  setSelectedPaymentMethod,
  setPaymentMessage,
  clearPaymentErrors,
  resetPaymentState,
} = paymentSlice.actions;

// Selectors (helpers for components)
export const selectPaymentMethodTypes = (state: { payment: PaymentState }) => 
  state.payment.paymentMethodTypes;

export const selectActivePaymentMethodTypes = (state: { payment: PaymentState }) =>
  state.payment.paymentMethodTypes.filter(type => type.is_active);

export const selectBusinessPaymentMethods = (state: { payment: PaymentState }) =>
  state.payment.businessPaymentMethods;

export const selectEnabledPaymentMethods = (state: { payment: PaymentState }) =>
  state.payment.businessPaymentMethods.filter(method => method.is_enabled);

export const selectDefaultPaymentMethod = (state: { payment: PaymentState }) =>
  state.payment.businessPaymentMethods.find(method => method.is_default) || null;

export const selectPaymentMethodByType = (state: { payment: PaymentState }, typeCode: string) =>
  state.payment.businessPaymentMethods.find(
    method => method.payment_type.code === typeCode
  ) || null;

export const selectIsPaymentMethodConfigured = (state: { payment: PaymentState }, typeCode: string) =>
  state.payment.businessPaymentMethods.some(
    method => method.payment_type.code === typeCode && method.is_enabled
  );

// Export reducer
export const paymentReducer = paymentSlice.reducer;
export default paymentSlice.reducer;
