import { useCallback } from 'react';
import useAuthStore from '../store/authStore';

/**
 * useAuth — thin wrapper around authStore with derived helpers.
 * Usage: const { user, isAdmin, isStaff, isCustomer, can } = useAuth();
 */
export default function useAuth() {
  const { user, isAuthenticated, isLoading, login, staffLogin, register, verifyOTP, logout, checkAuth } = useAuthStore();

  const isAdmin        = user?.role === 'admin';
  const isManager      = user?.role === 'manager';
  const isReceptionist = user?.role === 'receptionist';
  const isWaiter       = user?.role === 'waiter';
  const isChef         = user?.role === 'chef';
  const isCustomer     = user?.role === 'customer';
  const isStaff        = ['admin', 'manager', 'receptionist', 'waiter', 'chef'].includes(user?.role);

  /**
   * can(roles) — returns true if the current user has one of the given roles.
   * Example: can(['admin', 'manager']) → true for admin or manager
   */
  const can = useCallback(
    (roles = []) => roles.includes(user?.role),
    [user?.role]
  );

  /** Redirect path for the current role after login */
  const homeRoute = (() => {
    switch (user?.role) {
      case 'admin':        return '/admin';
      case 'manager':      return '/staff/manager';
      case 'receptionist': return '/staff/receptionist';
      case 'waiter':       return '/staff/waiter';
      case 'chef':         return '/staff/chef';
      case 'customer':     return '/customer';
      default:             return '/';
    }
  })();

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    isManager,
    isReceptionist,
    isWaiter,
    isChef,
    isCustomer,
    isStaff,
    can,
    homeRoute,
    login,
    staffLogin,
    register,
    verifyOTP,
    logout,
    checkAuth,
  };
}
