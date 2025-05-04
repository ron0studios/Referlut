export interface Offer {
  id: string;
  brand: string;
  type: "referral" | "loyalty" | "charity";
  title: string;
  description: string;
  instructions?: string;
  used: number;
  total: number;
  price: number;
  featured?: boolean;
  logo?: string;
  createdAt: Date;
  isTitleLoading?: boolean;
  isTotalLoading?: boolean;
  // Add these new fields
  status?: "active" | "expired" | "limited" | "unknown";
  statusDetails?: string;
  isStatusLoading?: boolean;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  unreadMessages: number;
}
