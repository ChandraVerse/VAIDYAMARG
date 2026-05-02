import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth.store';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

let socket: Socket | null = null;

/**
 * Returns (or creates) the singleton Socket.io connection.
 *
 * Connects to the /orders namespace — matching OrderGateway on the backend:
 *   @WebSocketGateway({ namespace: '/orders', cors: { origin: '*' } })
 *
 * On connect, emits join_user_room so the backend places this socket
 * in room `user_<userId>`, enabling targeted order-status pushes.
 */
function getSocket(token: string, userId: string): Socket {
  if (!socket || !socket.connected) {
    socket = io(`${API_URL}/orders`, {
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    // Join the user's personal room as soon as we connect (and on every reconnect)
    socket.on('connect', () => {
      socket!.emit('join_user_room', { userId });
    });
  }
  return socket;
}

/**
 * useSocket
 *
 * Subscribe to a Socket.io event for the lifetime of the component.
 * Safe to call multiple times — uses a single shared socket instance.
 *
 * @param event   - Event name to listen for (e.g. 'order_updated')
 * @param handler - Callback invoked with the event payload
 *
 * @example
 *   useSocket('order_updated', (payload: { orderId: string; status: string }) => {
 *     if (payload.orderId === orderId) refetch();
 *   });
 */
export function useSocket(
  event: string,
  handler: (payload: any) => void,
) {
  const token  = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    if (!token || !userId) return;

    const sock = getSocket(token, userId);
    sock.on(event, handler);

    return () => {
      sock.off(event, handler);
    };
  }, [event, handler, token, userId]);
}

/** Disconnect the shared socket (call on logout) */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
