/**
 * KIVYU API Client
 * Handles all API calls to the backend
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

class APIClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken() {
    return this.token || localStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token exists
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle 401 - token expired
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/frontend/pages/auth/login.html';
        }
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async logout() {
    this.setToken(null);
    return this.request('/auth/logout', { method: 'POST' });
  }

  async getCurrentUser() {
    return this.request('/auth/me', { method: 'GET' });
  }

  // Service endpoints
  async getServices(page = 1, limit = 12, filters = {}) {
    const params = new URLSearchParams({
      page,
      limit,
      ...filters,
    });
    return this.request(`/services?${params.toString()}`, { method: 'GET' });
  }

  async getServiceById(serviceId) {
    return this.request(`/services/${serviceId}`, { method: 'GET' });
  }

  async searchServices(query) {
    return this.request(`/services/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
    });
  }

  async getServicesByCategory(category) {
    return this.request(`/services/category/${category}`, { method: 'GET' });
  }

  async createService(serviceData) {
    return this.request('/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  }

  async updateService(serviceId, serviceData) {
    return this.request(`/services/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify(serviceData),
    });
  }

  async deleteService(serviceId) {
    return this.request(`/services/${serviceId}`, { method: 'DELETE' });
  }

  // Order endpoints
  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrderById(orderId) {
    return this.request(`/orders/${orderId}`, { method: 'GET' });
  }

  async getUserOrders(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/orders?${params.toString()}`, { method: 'GET' });
  }

  async updateOrderStatus(orderId, status) {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async uploadDeliverables(orderId, deliverables) {
    return this.request(`/orders/${orderId}/deliverables`, {
      method: 'POST',
      body: JSON.stringify({ deliverables }),
    });
  }

  async acceptOrder(orderId) {
    return this.request(`/orders/${orderId}/accept`, { method: 'POST' });
  }

  async cancelOrder(orderId) {
    return this.request(`/orders/${orderId}/cancel`, { method: 'POST' });
  }

  // Payment endpoints
  async createCheckout(orderId) {
    return this.request('/payments/create-checkout', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  }

  async getPaymentHistory(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/payments/history?${params.toString()}`, {
      method: 'GET',
    });
  }

  async getWalletBalance() {
    return this.request('/payments/balance', { method: 'GET' });
  }

  async requestWithdrawal(amount) {
    return this.request('/payments/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  // Review endpoints
  async createReview(reviewData) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async getServiceReviews(serviceId, page = 1, limit = 10) {
    const params = new URLSearchParams({ page, limit });
    return this.request(`/reviews/service/${serviceId}?${params.toString()}`, {
      method: 'GET',
    });
  }

  async getSellerReviews(sellerId, page = 1, limit = 10) {
    const params = new URLSearchParams({ page, limit });
    return this.request(`/reviews/seller/${sellerId}?${params.toString()}`, {
      method: 'GET',
    });
  }

  async updateReview(reviewId, reviewData) {
    return this.request(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  }

  async deleteReview(reviewId) {
    return this.request(`/reviews/${reviewId}`, { method: 'DELETE' });
  }

  async markReviewHelpful(reviewId) {
    return this.request(`/reviews/${reviewId}/helpful`, { method: 'POST' });
  }

  async respondToReview(reviewId, response) {
    return this.request(`/reviews/${reviewId}/response`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    });
  }

  // User endpoints
  async getProfile() {
    return this.request('/users/profile', { method: 'GET' });
  }

  async updateProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getUserPublicProfile(userId) {
    return this.request(`/users/${userId}`, { method: 'GET' });
  }

  async getUserServices(userId) {
    return this.request(`/users/${userId}/services`, { method: 'GET' });
  }

  async getUserReviews(userId) {
    return this.request(`/users/${userId}/reviews`, { method: 'GET' });
  }

  async getDashboardStats() {
    return this.request('/users/dashboard/stats', { method: 'GET' });
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/users/password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Message endpoints
  async sendMessage(messageData) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async getConversation(orderId, page = 1, limit = 20) {
    const params = new URLSearchParams({ page, limit });
    return this.request(`/messages/conversation/${orderId}?${params.toString()}`, {
      method: 'GET',
    });
  }

  async getConversations() {
    return this.request('/messages/conversations', { method: 'GET' });
  }

  async getUnreadMessageCount() {
    return this.request('/messages/unread/count', { method: 'GET' });
  }

  async markMessageAsRead(messageId) {
    return this.request(`/messages/${messageId}/read`, { method: 'PATCH' });
  }

  async deleteMessage(messageId) {
    return this.request(`/messages/${messageId}`, { method: 'DELETE' });
  }

  // Admin endpoints
  async getAdminDashboard() {
    return this.request('/admin/dashboard', { method: 'GET' });
  }

  async getAdminStats() {
    return this.request('/admin/stats/summary', { method: 'GET' });
  }

  async getAllUsers(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/admin/users?${params.toString()}`, { method: 'GET' });
  }

  async getUserDetails(userId) {
    return this.request(`/admin/users/${userId}`, { method: 'GET' });
  }

  async updateUserStatus(userId, action) {
    return this.request(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ action }),
    });
  }

  async getAllOrders(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/admin/orders?${params.toString()}`, { method: 'GET' });
  }

  async getAllPayments(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/admin/payments?${params.toString()}`, { method: 'GET' });
  }

  async getRevenueAnalytics(period = 'monthly') {
    return this.request(`/admin/analytics/revenue?period=${period}`, {
      method: 'GET',
    });
  }

  async getPendingWithdrawals(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/admin/withdrawals/pending?${params.toString()}`, {
      method: 'GET',
    });
  }

  async processWithdrawal(withdrawalId, action) {
    return this.request(`/admin/withdrawals/${withdrawalId}/process`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  }
}

// Export as a singleton
const apiClient = new APIClient();
export default apiClient;
