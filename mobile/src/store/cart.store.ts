import { create } from 'zustand';

interface CartItem {
  medicineId:  string;
  name:        string;
  genericName: string;
  price:       number;
  mrp:         number;
  quantity:    number;
  unit:        string;
}

interface CartState {
  items:        CartItem[];
  totalAmount:  number;
  totalSavings: number;

  addItem:      (item: Omit<CartItem, 'quantity'>) => void;
  removeItem:   (medicineId: string) => void;
  updateQty:    (medicineId: string, quantity: number) => void;
  clearCart:    () => void;
}

const calcTotals = (items: CartItem[]) => ({
  totalAmount:  items.reduce((s, i) => s + i.price * i.quantity, 0),
  totalSavings: items.reduce((s, i) => s + (i.mrp - i.price) * i.quantity, 0),
});

export const useCartStore = create<CartState>((set, get) => ({
  items:        [],
  totalAmount:  0,
  totalSavings: 0,

  addItem: (item) => {
    const existing = get().items.find(i => i.medicineId === item.medicineId);
    let items: CartItem[];

    if (existing) {
      items = get().items.map(i =>
        i.medicineId === item.medicineId ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      items = [...get().items, { ...item, quantity: 1 }];
    }

    set({ items, ...calcTotals(items) });
  },

  removeItem: (medicineId) => {
    const items = get().items.filter(i => i.medicineId !== medicineId);
    set({ items, ...calcTotals(items) });
  },

  updateQty: (medicineId, quantity) => {
    const items = quantity <= 0
      ? get().items.filter(i => i.medicineId !== medicineId)
      : get().items.map(i => i.medicineId === medicineId ? { ...i, quantity } : i);
    set({ items, ...calcTotals(items) });
  },

  clearCart: () => set({ items: [], totalAmount: 0, totalSavings: 0 }),
}));
