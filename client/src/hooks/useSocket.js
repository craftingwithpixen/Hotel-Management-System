import { useEffect, useRef, useCallback } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';
import useAuthStore from '../store/authStore';

/**
 * useSocket — manages Socket.io connection lifecycle and room joining.
 *
 * Usage:
 *   const { on, emit, joinRoom } = useSocket();
 *   joinRoom('kitchen');
 *   on('new:order', handler);
 */
export default function useSocket() {
  const { user, accessToken, isAuthenticated } = useAuthStore();
  const listenersRef = useRef([]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const socket = connectSocket();

    // Auto-join role-appropriate rooms
    if (user?.role) {
      switch (user.role) {
        case 'chef':
          socket.emit('join:kitchen', { token: accessToken });
          break;
        case 'admin':
        case 'manager':
          socket.emit('join:admin', { token: accessToken });
          break;
        case 'receptionist':
          socket.emit('join:receptionist', { token: accessToken });
          break;
        case 'waiter':
          socket.emit('join:waiter', { token: accessToken });
          break;
        default:
          break;
      }
    }

    return () => {
      // Clean up listeners added during this hook instance
      const socket = getSocket();
      listenersRef.current.forEach(({ event, handler }) => {
        socket?.off(event, handler);
      });
      listenersRef.current = [];
    };
  }, [isAuthenticated, accessToken, user?.role]);

  /** Subscribe to a socket event. Auto-cleaned up on unmount. */
  const on = useCallback((event, handler) => {
    const socket = getSocket();
    if (!socket) return;
    socket.on(event, handler);
    listenersRef.current.push({ event, handler });
    return () => socket.off(event, handler);
  }, []);

  /** Emit a socket event */
  const emit = useCallback((event, data) => {
    const socket = getSocket();
    socket?.emit(event, data);
  }, []);

  /** Manually join a named room */
  const joinRoom = useCallback((room, data = {}) => {
    const socket = getSocket();
    socket?.emit(`join:${room}`, data);
  }, []);

  return { on, emit, joinRoom };
}
