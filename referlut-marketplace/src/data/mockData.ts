import { Offer, User } from "../types";

export const mockOffers: Offer[] = [
  {
    id: "1",
    brand: "Costa",
    type: "loyalty",
    title: "Costa Coffee Club",
    description:
      "Earn points every time you purchase at Costa. Get free drinks, treats and exclusive offers with the Costa Coffee Club card.",
    used: 3,
    total: 5,
    price: 0,
    logo: "https://images.pexels.com/photos/7376029/pexels-photo-7376029.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: new Date("2023-04-15"),
  },
  {
    id: "2",
    brand: "Costco",
    type: "loyalty",
    title: "Costco Membership",
    description:
      "Access exclusive warehouse deals, bulk discounts and member-only pricing. Join the Costco membership program today.",
    used: 1,
    total: 3,
    price: 60,
    logo: "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: new Date("2023-04-10"),
  },
  {
    id: "3",
    brand: "Pret A Manger",
    type: "loyalty",
    title: "Pret Coffee Subscription",
    description:
      "Unlimited barista-made drinks for a fixed monthly fee. 5 drinks per day including all coffees, teas, hot chocolates and more.",
    used: 0,
    total: 1,
    price: 25,
    featured: true,
    logo: "https://images.pexels.com/photos/1695052/pexels-photo-1695052.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: new Date("2023-04-05"),
  },
  {
    id: "4",
    brand: "Cineworld",
    type: "loyalty",
    title: "Unlimited Movie Pass",
    description:
      "Watch unlimited movies for one monthly fee. Early access screenings and 10% off snacks with your Unlimited card.",
    used: 3,
    total: 4,
    price: 16.99,
    logo: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: new Date("2023-04-01"),
  },
  {
    id: "5",
    brand: "Revolut",
    type: "referral",
    title: "Revolut Referral",
    description: "Sign up using this referral code and we both get £5.",
    used: 3,
    total: 10,
    price: 5,
    featured: true,
    logo: "https://images.pexels.com/photos/4386366/pexels-photo-4386366.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: new Date("2023-03-25"),
  },
  // Keep the remaining referral and charity entries unchanged
  {
    id: "6",
    brand: "Netflix",
    type: "referral",
    title: "Netflix Family Plan",
    description: "Join our Netflix family plan, 3 spots available out of 5.",
    used: 37,
    total: 50,
    price: 15,
    featured: true,
    logo: "https://images.pexels.com/photos/11347255/pexels-photo-11347255.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: new Date("2023-03-20"),
  },
  {
    id: "7",
    brand: "Spotify",
    type: "referral",
    title: "Spotify Family Plan",
    description: "Join our Spotify family plan and save on your subscription.",
    used: 4,
    total: 6,
    price: 3,
    logo: "https://images.pexels.com/photos/7952256/pexels-photo-7952256.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: new Date("2023-03-15"),
  },
  {
    id: "8",
    brand: "Deliveroo",
    type: "referral",
    title: "Deliveroo First Order",
    description: "Use this code for £10 off your first Deliveroo order.",
    used: 2,
    total: 5,
    price: 0,
    logo: "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: new Date("2023-03-10"),
  },
  {
    id: "9",
    brand: "Oxfam",
    type: "charity",
    title: "Oxfam Donation Match",
    description: "Join our donation pool and we'll match your contribution.",
    used: 5,
    total: 10,
    price: 0,
    logo: "https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: new Date("2023-03-05"),
  },
  {
    id: "10",
    brand: "RSPCA",
    type: "charity",
    title: "RSPCA Group Donation",
    description: "Pool together for a larger donation to help animals in need.",
    used: 3,
    total: 8,
    price: 0,
    logo: "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: new Date("2023-03-01"),
  },
];

export const currentUser: User = {
  id: "1",
  name: "John Doe",
  avatar:
    "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  unreadMessages: 3,
};

export const getOffersForType = (type: "referral" | "loyalty" | "charity") => {
  return mockOffers.filter((offer) => offer.type === type);
};

export const getFilteredOffers = (
  type: "referral" | "loyalty" | "charity",
  brandFilter: string | null,
) => {
  let filteredOffers = mockOffers.filter((offer) => offer.type === type);

  if (brandFilter) {
    filteredOffers = filteredOffers.filter((offer) =>
      offer.brand.toLowerCase().includes(brandFilter.toLowerCase()),
    );
  }

  return filteredOffers;
};

export const getAllBrands = () => {
  const brands = new Set<string>();
  mockOffers.forEach((offer) => brands.add(offer.brand));
  return Array.from(brands);
};
