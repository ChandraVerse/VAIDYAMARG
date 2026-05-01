import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth.store';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

let socket: Socket | null = null;

function getSocket(token: string): Socket {
  if (!socket || !socket.connected) {
    socket = io(API_URL, {
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
  }
  return socket;
}

export function useSocket(
  event: string,
  handler: (payload: any) => void,
) {
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) return;

    const sock = getSocket(token);
    sock.on(event, handler);

    return () => {
      sock.off(event, handler);
    };
  }, [event, handler, token]);
}

/** Call once at app root to join the user's personal room */
export function joinOrderRoom(orderId: string) {
  if (socket?.connected) {
    socket.emit('join_order', { orderId });
  }
}
