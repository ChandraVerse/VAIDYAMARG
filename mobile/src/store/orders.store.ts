import { create } from 'zustand';

type OrderItem = { medicineId: string; quantity: number; unitPrice: number; totalPrice: number };
type Order     = {
  id: string;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
};

interface OrdersState {
  orders:   Order[];
  // Add a newly placed order to the local list (optimistic)
  addOrder: (order: Order) => void;
  // Replace entire list (after refresh)
  setOrders: (orders: Order[]) => void;
  // Update status of a single order (from socket event)
  updateStatus: (orderId: string, status: string) => void;
  clearOrders: () => void;
}

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: [],

  addOrder: (order) =>
    set((s) => ({ orders: [order, ...s.orders] })),

  setOrders: (orders) => set({ orders }),

  updateStatus: (orderId, status) =>
    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === orderId ? { ...o, status } : o,
      ),
    })),

  clearOrders: () => set({ orders: [] }),
}));
