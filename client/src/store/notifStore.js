import { create } from 'zustand';

const useNotifStore = create((set) => ({
  notifications: [],
  addNotification: (notif) => set((state) => ({
    notifications: [{ id: Date.now(), ...notif }, ...state.notifications].slice(0, 50),
  })),
  clearNotifications: () => set({ notifications: [] }),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id),
  })),
}));

export default useNotifStore;
