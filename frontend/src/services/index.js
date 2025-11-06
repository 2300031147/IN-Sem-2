import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

export const showService = {
  getAllShows: async () => {
    const response = await api.get('/shows');
    return response.data;
  },

  getShowById: async (id) => {
    const response = await api.get(`/shows/${id}`);
    return response.data;
  },

  getShowSeats: async (id) => {
    const response = await api.get(`/shows/${id}/seats`);
    return response.data;
  },

  createShow: async (showData) => {
    const response = await api.post('/shows', showData);
    return response.data;
  },

  updateShow: async (id, showData) => {
    const response = await api.put(`/shows/${id}`, showData);
    return response.data;
  },

  deleteShow: async (id) => {
    const response = await api.delete(`/shows/${id}`);
    return response.data;
  },
};

export const bookingService = {
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  getUserBookings: async () => {
    const response = await api.get('/bookings/user');
    return response.data;
  },

  getAllBookings: async () => {
    const response = await api.get('/bookings/all');
    return response.data;
  },

  cancelBooking: async (id) => {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data;
  },
};
