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

  async loginWithPassword(identifier: string, password: string) {
    return this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
  }

  async loginWithGoogle(data?: { email?: string; name?: string; phone?: string }) {
    return this.request<any>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  async forgotPassword(identifier: string) {
    return this.request<any>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    });
  }

  async resetPassword(identifier: string, code: string, newPassword: string) {
    return this.request<any>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ identifier, code, newPassword }),
    });
  }

  async changePassword(passwordData: { currentPassword: string; newPassword: string }) {
    return this.request<any>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
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
    const res = await this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });

    if (typeof window !== 'undefined') {
      try {
        const orderToSync = res?.order || {
          id: `ord_${Date.now()}`,
          orderNumber: orderData.orderNumber || `PCP-2026-${Math.floor(10000 + Math.random() * 90000)}`,
          status: 'CONFIRMED',
          paymentStatus: orderData.paymentMethod === 'COD' ? 'PENDING' : 'PAID',
          paymentMethod: orderData.paymentMethod || 'ONLINE',
          totalAmount: orderData.totalAmount || 0,
          deliveryFee: orderData.deliveryFee || 0,
          workerPlacementFee: orderData.workerPlacementFee || 0,
          grandTotal: orderData.grandTotal || orderData.totalAmount || 0,
          createdAt: new Date().toISOString(),
          deliveryAddress: orderData.deliveryAddress,
          items: orderData.items,
          notes: orderData.notes,
          user: {
            name: orderData.deliveryAddress?.fullName || 'Valued Builder',
            phone: orderData.deliveryAddress?.phone || '9912179771',
          },
        };

        // Cache in localStorage for real-time cross-tab sync
        const liveOrders = JSON.parse(localStorage.getItem('pcp_live_orders') || '[]');
        const exists = liveOrders.some((o: any) => o.orderNumber === orderToSync.orderNumber);
        if (!exists) {
          liveOrders.unshift(orderToSync);
          localStorage.setItem('pcp_live_orders', JSON.stringify(liveOrders.slice(0, 50)));
        }

        // Broadcast to Owner account & active sessions
        window.dispatchEvent(new CustomEvent('pcp_order_placed', { detail: orderToSync }));
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('pcp_orders_channel');
          bc.postMessage({ type: 'NEW_ORDER', order: orderToSync });
          bc.close();
        }
      } catch (e) {
        console.warn('Real-time order sync notice:', e);
      }
    }

    return res;
  }

  async getOrders() {
    const res = await this.request<any>('/orders');
    if (typeof window !== 'undefined' && res?.orders) {
      try {
        const liveOrders = JSON.parse(localStorage.getItem('pcp_live_orders') || '[]');
        const existingIds = new Set(res.orders.map((o: any) => o.id || o.orderNumber));
        const missing = liveOrders.filter((o: any) => !existingIds.has(o.id) && !existingIds.has(o.orderNumber));
        if (missing.length > 0) {
          res.orders = [...missing, ...res.orders];
        }
      } catch (e) {}
    }
    return res;
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

  async getAdminDashboard() {
    const res = await this.request<any>('/admin/dashboard');
    if (typeof window !== 'undefined' && res) {
      try {
        const liveOrders = JSON.parse(localStorage.getItem('pcp_live_orders') || '[]');
        if (liveOrders.length > 0) {
          const currentRecent = res.recentOrders || [];
          const existingIds = new Set(currentRecent.map((o: any) => o.id || o.orderNumber));
          const missing = liveOrders.filter((o: any) => !existingIds.has(o.id) && !existingIds.has(o.orderNumber));
          if (missing.length > 0) {
            res.recentOrders = [...missing, ...currentRecent].slice(0, 15);
            const addedRev = missing.reduce((sum: number, o: any) => sum + (o.grandTotal || o.totalAmount || 0), 0);
            res.stats = {
              ...res.stats,
              monthOrders: (res.stats?.monthOrders || 0) + missing.length,
              totalOrders: (res.stats?.totalOrders || 0) + missing.length,
              monthRevenuePaisa: (res.stats?.monthRevenuePaisa || 0) + addedRev,
              totalRevenuePaisa: (res.stats?.totalRevenuePaisa || 0) + addedRev,
            };
          }
        }
      } catch (e) {}
    }
    return res;
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
    const res = await this.request<any>(`/admin/orders?${query.toString()}`);

    if (typeof window !== 'undefined' && res?.orders) {
      try {
        const liveOrders = JSON.parse(localStorage.getItem('pcp_live_orders') || '[]');
        const existingIds = new Set(res.orders.map((o: any) => o.id || o.orderNumber));
        const missing = liveOrders.filter((o: any) => !existingIds.has(o.id) && !existingIds.has(o.orderNumber));
        if (missing.length > 0) {
          let merged = [...missing, ...res.orders];
          if (status) merged = merged.filter((o: any) => o.status === status);
          if (search) {
            const s = search.toLowerCase();
            merged = merged.filter((o: any) =>
              o.orderNumber?.toLowerCase().includes(s) ||
              o.user?.phone?.includes(s) ||
              o.user?.name?.toLowerCase().includes(s)
            );
          }
          res.orders = merged;
        }
      } catch (e) {}
    }
    return res;
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

  async rejectQuote(quoteId: string, rejectionReason?: string) {
    return this.request<any>(`/admin/quotes/${quoteId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionReason }),
    });
  }

  async getAdminDeliveryZones() {
    return this.request<any>('/admin/delivery-zones');
  }

  async createDeliveryZone(zoneData: any) {
    return this.request<any>('/admin/delivery-zones', {
      method: 'POST',
      body: JSON.stringify(zoneData),
    });
  }

  async getStoreSettings() {
    return this.request<any>('/admin/settings');
  }

  async updateStoreSettings(settings: Record<string, string>) {
    return this.request<any>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    });
  }
}

export const api = new ApiClient();
