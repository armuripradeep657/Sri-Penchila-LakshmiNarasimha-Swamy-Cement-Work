const API_BASE = '/api';

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('pcp_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...((options.headers as Record<string, string>) || {}),
    };

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || `API Error: ${res.statusText}`);
      }

      return data;
    } catch (err: any) {
      console.warn(`[API Call Failed: ${endpoint}]`, err.message);
      throw err;
    }
  }

  // ─── Auth ──────────────────────────────────────────────────────────────────
  async register(data: { phone: string; password: string; name: string; email?: string; firmName?: string }) {
    return this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async loginWithPassword(phone: string, password: string) {
    return this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  async updateProfile(profileData: { name?: string; email?: string; firmName?: string; phone?: string }) {
    return this.request<any>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async addAddress(addressData: any) {
    return this.request<any>('/auth/address', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  // ─── Products ──────────────────────────────────────────────────────────────
  async getProducts(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    return this.request<any>(`/products?${query.toString()}`);
  }

  async getProduct(slug: string) {
    return this.request<any>(`/products/${slug}`);
  }

  async getCategories() {
    return this.request<any>('/products/categories/summary');
  }

  // ─── Cart ──────────────────────────────────────────────────────────────────
  async getCart() {
    return this.request<any>('/cart');
  }

  async addToCart(variantId: string, quantity: number = 1) {
    return this.request<any>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ variantId, quantity }),
    });
  }

  async updateCartItem(itemId: string, quantity: number) {
    return this.request<any>(`/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeCartItem(itemId: string) {
    return this.request<any>(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  async clearCart() {
    return this.request<any>('/cart/clear', {
      method: 'DELETE',
    });
  }

  // ─── Orders ────────────────────────────────────────────────────────────────
  async getDeliveryZones() {
    return this.request<any>('/orders/zones');
  }

  async placeOrder(orderData: any) {
    return this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders() {
    return this.request<any>('/orders');
  }

  async getOrder(id: string) {
    return this.request<any>(`/orders/${id}`);
  }

  async createPayment(orderId: string) {
    return this.request<any>(`/orders/${orderId}/payment`, {
      method: 'POST',
    });
  }

  async verifyPayment(orderId: string, paymentData: any) {
    return this.request<any>(`/orders/${orderId}/payment/verify`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // ─── Quotes ────────────────────────────────────────────────────────────────
  async submitQuote(quoteData: any) {
    return this.request<any>('/quotes', {
      method: 'POST',
      body: JSON.stringify(quoteData),
    });
  }

  async getQuotes() {
    return this.request<any>('/quotes');
  }

  async getQuote(id: string) {
    return this.request<any>(`/quotes/${id}`);
  }

  async acceptQuote(id: string) {
    return this.request<any>(`/quotes/${id}/accept`, {
      method: 'POST',
    });
  }

  // ─── Admin ─────────────────────────────────────────────────────────────────
  async getAdminDashboard() {
    return this.request<any>('/admin/dashboard');
  }

  async getAdminProducts() {
    return this.request<any>('/admin/products');
  }

  async createProduct(productData: any) {
    return this.request<any>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: any) {
    return this.request<any>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async toggleProductActive(id: string) {
    return this.request<any>(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  }

  async addVariant(productId: string, variantData: any) {
    return this.request<any>(`/admin/products/${productId}/variants`, {
      method: 'POST',
      body: JSON.stringify(variantData),
    });
  }

  async updateVariant(productId: string, variantId: string, variantData: any) {
    return this.request<any>(`/admin/products/${productId}/variants/${variantId}`, {
      method: 'PUT',
      body: JSON.stringify(variantData),
    });
  }

  async deleteVariant(productId: string, variantId: string) {
    return this.request<any>(`/admin/products/${productId}/variants/${variantId}`, {
      method: 'DELETE',
    });
  }

  async quickUpdateVariant(productId: string, variantId: string, data: { price?: number | null; stock?: number; width?: number | null; height?: number | null; depth?: number | null; dimensionUnit?: string }) {
    return this.request<any>(`/admin/products/${productId}/variants/${variantId}/quick`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getAdminOrders(status?: string, search?: string) {
    const query = new URLSearchParams();
    if (status) query.append('status', status);
    if (search) query.append('search', search);
    return this.request<any>(`/admin/orders?${query.toString()}`);
  }

  async updateOrderStatus(orderId: string, status: string, notes?: string) {
    return this.request<any>(`/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  }

  async getAdminQuotes(status?: string) {
    const query = new URLSearchParams();
    if (status) query.append('status', status);
    return this.request<any>(`/admin/quotes?${query.toString()}`);
  }

  async respondQuote(quoteId: string, quotedPrice: number, adminNotes?: string) {
    return this.request<any>(`/admin/quotes/${quoteId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ quotedPrice, adminNotes }),
    });
  }

  async getDeliveryZones() {
    return this.request<any>('/admin/delivery-zones');
  }

  async getStoreSettings() {
    return this.request<any>('/admin/settings');
  }
}

export const api = new ApiClient();
