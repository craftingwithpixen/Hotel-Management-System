import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: [],
  addItem: (menuItem, quantity = 1, notes = '') => {
    const items = get().items;
    const existing = items.find((i) => i.menuItem._id === menuItem._id);
    if (existing) {
      set({ items: items.map((i) => i.menuItem._id === menuItem._id ? { ...i, quantity: i.quantity + quantity } : i) });
    } else {
      set({ items: [...items, { menuItem, quantity, notes }] });
    }
  },
  removeItem: (menuItemId) => set((state) => ({ items: state.items.filter((i) => i.menuItem._id !== menuItemId) })),
  updateQuantity: (menuItemId, quantity) => set((state) => ({
    items: quantity > 0
      ? state.items.map((i) => i.menuItem._id === menuItemId ? { ...i, quantity } : i)
      : state.items.filter((i) => i.menuItem._id !== menuItemId),
  })),
  clearCart: () => set({ items: [] }),
  getTotal: () => get().items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0),
}));

export default useCartStore;
