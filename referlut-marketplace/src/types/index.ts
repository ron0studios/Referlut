export interface Offer {
  id: string;
  brand: string;
  type: "referral" | "loyalty" | "charity";
  title: string;
  description: string;
  instructions?: string; // Add instructions field
  used: number;
  total: number;
  price: number;
  featured?: boolean;
  logo?: string;
  createdAt: Date;
  // Loading state flags
  isTitleLoading?: boolean;
  isTotalLoading?: boolean;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  unreadMessages: number;
}
