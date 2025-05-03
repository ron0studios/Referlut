export interface Offer {
  id: string;
  brand: string;
  type: 'referral' | 'loyalty' | 'charity';
  title: string;
  description: string;
  used: number;
  total: number;
  price: number;
  featured?: boolean;
  logo?: string;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  unreadMessages: number;
}