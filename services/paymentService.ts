import { ApiService } from './api';

// Tipos para Payment Methods
export interface PaymentMethodType {
  id: number;
  code: string;
  name: string;
  icon: string;
  requires_email: boolean;
  requires_phone: boolean;
  requires_username: boolean;
  supports_deep_links: boolean;
  deep_link_pattern?: string;
  is_active: boolean;
}

export interface BusinessPaymentMethod {
  id: number;
  business_id: number;
  payment_type: PaymentMethodType;
  account_email?: string;
  account_phone?: string;
  account_username?: string;
  account_number?: string;
  is_enabled: boolean;
  is_default: boolean;
  display_name?: string;
  notes?: string;
  payment_link?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethodCreateData {
  payment_type_id: number;
  account_email?: string;
  account_phone?: string;
  account_username?: string;
  account_number?: string;
  is_enabled?: boolean;
  is_default?: boolean;
  display_name?: string;
  notes?: string;
}

export interface PaymentMethodUpdateData extends Partial<PaymentMethodCreateData> {
  // Todos los campos son opcionales para updates
}

export class PaymentService {
  private api: ApiService;

  constructor() {
    this.api = new ApiService('');
  }

  /**
   * Obtener todos los tipos de métodos de pago disponibles
   */
  async getPaymentMethodTypes(): Promise<PaymentMethodType[]> {
    try {
      const response = await this.api.get<PaymentMethodType[]>('/business/payment-methods/types/');
      return response;
    } catch (error) {
      console.error('Error fetching payment method types:', error);
      throw new Error('Failed to load payment method types');
    }
  }

  /**
   * Obtener métodos de pago configurados para un negocio
   */
  async getBusinessPaymentMethods(businessId: number): Promise<BusinessPaymentMethod[]> {
    try {
      const response = await this.api.get<BusinessPaymentMethod[]>(`/business/${businessId}/payment-methods/`);
      return response;
    } catch (error) {
      console.error('Error fetching business payment methods:', error);
      throw new Error('Failed to load business payment methods');
    }
  }

  /**
   * Crear un nuevo método de pago para un negocio
   */
  async createBusinessPaymentMethod(
    businessId: number,
    data: PaymentMethodCreateData
  ): Promise<BusinessPaymentMethod> {
    try {
      const response = await this.api.post<BusinessPaymentMethod>(`/business/${businessId}/payment-methods/`, data);
      return response;
    } catch (error) {
      console.error('Error creating business payment method:', error);
      throw new Error('Failed to create payment method');
    }
  }

  /**
   * Actualizar un método de pago existente
   */
  async updateBusinessPaymentMethod(
    businessId: number,
    paymentMethodId: number,
    data: PaymentMethodUpdateData
  ): Promise<BusinessPaymentMethod> {
    try {
      const response = await this.api.put<BusinessPaymentMethod>(
        `/business/${businessId}/payment-methods/${paymentMethodId}/`,
        data
      );
      return response;
    } catch (error) {
      console.error('Error updating business payment method:', error);
      throw new Error('Failed to update payment method');
    }
  }

  /**
   * Eliminar un método de pago
   */
  async deleteBusinessPaymentMethod(businessId: number, paymentMethodId: number): Promise<void> {
    try {
      await this.api.delete(`/business/${businessId}/payment-methods/${paymentMethodId}/`);
    } catch (error) {
      console.error('Error deleting business payment method:', error);
      throw new Error('Failed to delete payment method');
    }
  }

  /**
   * Establecer un método como predeterminado
   */
  async setDefaultPaymentMethod(
    businessId: number,
    paymentMethodId: number
  ): Promise<BusinessPaymentMethod> {
    try {
      const response = await this.api.patch<BusinessPaymentMethod>(
        `/business/${businessId}/payment-methods/${paymentMethodId}/set-default/`
      );
      return response;
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw new Error('Failed to set default payment method');
    }
  }

  /**
   * Generar link de pago con cantidad específica
   */
  async generatePaymentLink(
    businessId: number,
    paymentMethodId: number,
    amount?: number,
    description?: string
  ): Promise<{ link: string }> {
    try {
      const params = new URLSearchParams();
      if (amount) params.append('amount', amount.toString());
      if (description) params.append('description', description);

      const queryString = params.toString();
      const endpoint = `/business/${businessId}/payment-methods/${paymentMethodId}/generate-link/${
        queryString ? '?' + queryString : ''
      }`;

      const response = await this.api.get<{ link: string }>(endpoint);
      return response;
    } catch (error) {
      console.error('Error generating payment link:', error);
      throw new Error('Failed to generate payment link');
    }
  }

  /**
   * Validar configuración de método de pago
   */
  validatePaymentMethod(
    paymentType: PaymentMethodType,
    data: PaymentMethodCreateData
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar campos requeridos
    if (paymentType.requires_email && !data.account_email) {
      errors.push('Email is required for this payment method');
    }

    if (paymentType.requires_phone && !data.account_phone) {
      errors.push('Phone number is required for this payment method');
    }

    if (paymentType.requires_username && !data.account_username) {
      errors.push('Username is required for this payment method');
    }

    // Validar formato de email
    if (data.account_email && !/\S+@\S+\.\S+/.test(data.account_email)) {
      errors.push('Invalid email format');
    }

    // Validar formato de username para métodos específicos
    if (data.account_username && paymentType.code === 'cashapp') {
      if (!data.account_username.startsWith('$')) {
        errors.push('CashApp username must start with $');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generar placeholder text para campos según el tipo
   */
  getFieldPlaceholder(paymentType: PaymentMethodType, fieldType: string): string {
    const placeholders: { [key: string]: { [field: string]: string } } = {
      paypal: {
        email: 'your-paypal@example.com',
        username: 'YourPayPalUsername',
      },
      cashapp: {
        username: '$YourCashTag',
      },
      zelle: {
        email: 'zelle@example.com',
        phone: '+1234567890',
      },
      venmo: {
        username: '@YourVenmoUsername',
      },
      apple_pay: {
        email: 'apple-pay@example.com',
      },
      google_pay: {
        email: 'google-pay@example.com',
      },
    };

    return placeholders[paymentType.code]?.[fieldType] || '';
  }
}

// Singleton instance
export const paymentService = new PaymentService();
export default paymentService;
