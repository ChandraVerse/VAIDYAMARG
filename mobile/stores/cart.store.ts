import { create } from 'zustand';

export interface CartItem {
  medicineId:  string;
  name:        string;
  price:       number;
  quantity:    number;
  imageUrl:    string | null;
  requiresPrescription: boolean;
}

interface CartState {
  items: CartItem[];

  addItem:       (item: Omit<CartItem, 'quantity'>) => void;
  removeItem:    (medicineId: string) => void;
  updateQty:     (medicineId: string, qty: number) => void;
  clearCart:     () => void;
  totalAmount:   () => number;
  totalItems:    () => number;
  requiresPrescription: () => boolean;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.medicineId === item.medicineId);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.medicineId === item.medicineId
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          ),
        };
      }
      return { items: [...state.items, { ...item, quantity: 1 }] };
    }),

  removeItem: (medicineId) =>
    set((state) => ({
      items: state.items.filter((i) => i.medicineId !== medicineId),
    })),

  updateQty: (medicineId, qty) =>
    set((state) => {
      if (qty <= 0) {
        return { items: state.items.filter((i) => i.medicineId !== medicineId) };
      }
      return {
        items: state.items.map((i) =>
          i.medicineId === medicineId ? { ...i, quantity: qty } : i,
        ),
      };
    }),

  clearCart: () => set({ items: [] }),

  totalAmount: () =>
    get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

  totalItems: () =>
    get().items.reduce((sum, i) => sum + i.quantity, 0),

  requiresPrescription: () =>
    get().items.some((i) => i.requiresPrescription),
}));
