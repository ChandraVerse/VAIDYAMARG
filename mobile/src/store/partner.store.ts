import { create } from 'zustand';

export type PartnerEarning = {
  id: string;
  orderId: string;
  orderAmount: number;
  commission: number;
  netEarning: number;
  settledAt: string | null;
  createdAt: string;
};

export type PharmacyProfile = {
  id: string;
  name: string;
  status: string;
  ownerName: string;
  phone: string;
  city: string;
  address: string;
  commissionRate: number;
  deliveryRadius: number;
  operatingHours: string;
  isActive: boolean;
};

type PartnerState = {
  profile: PharmacyProfile | null;
  earnings: PartnerEarning[];
  setProfile: (p: PharmacyProfile) => void;
  setEarnings: (e: PartnerEarning[]) => void;
  toggleActive: () => void;
};

export const usePartnerStore = create<PartnerState>((set) => ({
  profile:  null,
  earnings: [],
  setProfile:  (profile)  => set({ profile }),
  setEarnings: (earnings) => set({ earnings }),
  toggleActive: () =>
    set((s) =>
      s.profile ? { profile: { ...s.profile, isActive: !s.profile.isActive } } : {}
    ),
}));
