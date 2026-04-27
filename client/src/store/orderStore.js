import { create } from 'zustand';

const useOrderStore = create((set) => ({
  orders: [],
  setOrders: (orders) => set({ orders }),
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  updateOrder: (orderId, updates) => set((state) => ({
    orders: state.orders.map((o) => o._id === orderId ? { ...o, ...updates } : o),
  })),
}));

export default useOrderStore;
