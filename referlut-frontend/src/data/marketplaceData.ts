// Import OpenAI at the top of your file
import { OpenAI } from "openai";
import { Offer, User } from "../types/marketplace/marketplace";

// Add these exports to track pagination state
export let currentPage = 0;
export let totalPages = 1;
export let totalRecords = 0;
export let isLoadingPage = false;

const getRandomDate = (): Date => {
  const now = new Date();
  const pastYear = new Date(
    now.getFullYear() - 1,
    now.getMonth(),
    now.getDate(),
  );
  const timestamp =
    pastYear.getTime() + Math.random() * (now.getTime() - pastYear.getTime());
  return new Date(timestamp);
};

export const mockOffers: Offer[] = [
  // LOYALTY PROGRAMS (30)
  {
    id: "l1",
    brand: "Starbucks",
    type: "loyalty",
    title: "Starbucks Rewards",
    description:
      "Earn 3 Stars for every £1 you spend and get free drinks, food upgrades and exclusive offers. Personalized offers and birthday rewards included.",
    used: 12,
    total: 20,
    price: 0,
    logo: "https://images.pexels.com/photos/2253643/pexels-photo-2253643.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "l2",
    brand: "Tesco",
    type: "loyalty",
    title: "Clubcard",
    description:
      "Collect 1 point for every £1 spent in-store and online. Get vouchers worth 2x their value with Clubcard Rewards partners.",
    used: 45,
    total: 100,
    price: 0,
    logo: "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "l3",
    brand: "Boots",
    type: "loyalty",
    title: "Advantage Card",
    description:
      "Earn 4 points for every £1 you spend, with each point worth 1p to spend in store. Extra rewards for parents and over 60s.",
    used: 32,
    total: 50,
    price: 0,
    logo: "https://images.pexels.com/photos/7319088/pexels-photo-7319088.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "l4",
    brand: "Costa Coffee",
    type: "loyalty",
    title: "Costa Club",
    description:
      "Collect beans with every purchase. Free drink after 8 beverage purchases and a free drink on your birthday.",
    used: 8,
    total: 15,
    price: 0,
    logo: "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "l5",
    brand: "Nando's",
    type: "loyalty",
    title: "Nando's Card",
    description:
      "Collect chillies with every visit. 3 chillies get you a 1/4 chicken, 6 chillies get you a 1/2 chicken, and 10 chillies earn you a whole chicken.",
    used: 21,
    total: 30,
    price: 0,
    logo: "https://images.pexels.com/photos/2673353/pexels-photo-2673353.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "l6",
    brand: "Pret A Manger",
    type: "loyalty",
    title: "Pret Coffee Subscription",
    description:
      "Up to 5 barista-made drinks per day for a fixed monthly fee. Choose from any organic coffees, teas, hot chocolates, and more.",
    used: 60,
    total: 100,
    price: 25,
    featured: true,
    logo: "https://images.pexels.com/photos/1695052/pexels-photo-1695052.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "l7",
    brand: "Sainsbury's",
    type: "loyalty",
    title: "Nectar Card",
    description:
      "Collect and spend Nectar points with hundreds of brands including Sainsbury's, Argos, and eBay. 1 point for every £1 spent.",
    used: 37,
    total: 60,
    price: 0,
    logo: "https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "l8",
    brand: "ASOS",
    type: "loyalty",
    title: "ASOS A-List",
    description:
      "Earn 5 points for every £1 spent. Redeem points for discounts on future purchases and get access to exclusive offers.",
    used: 15,
    total: 40,
    price: 0,
    logo: "https://images.pexels.com/photos/934063/pexels-photo-934063.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "l9",
    brand: "Waterstones",
    type: "loyalty",
    title: "Waterstones Plus",
    description:
      "Earn 1 stamp for every £10 spent. 10 stamps convert to a £10 reward. Plus free hot drink in our cafés with every purchase.",
    used: 5,
    total: 15,
    price: 0,
    logo: "https://images.pexels.com/photos/5834/nature-grass-leaf-green.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "l10",
    brand: "Caffe Nero",
    type: "loyalty",
    title: "Caffe Nero App",
    description:
      "Collect 1 stamp per drink purchase. Get your 10th drink free. Digital stamp collection via the app.",
    used: 28,
    total: 40,
    price: 0,
    logo: "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "l11",
    brand: "H&M",
    type: "loyalty",
    title: "H&M Membership",
    description:
      "Earn points on every purchase, exclusive offers, and free online returns. Special birthday offers and member events.",
    used: 42,
    total: 80,
    price: 0,
    logo: "https://images.pexels.com/photos/3965545/pexels-photo-3965545.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "l12",
    brand: "Cineworld",
    type: "loyalty",
    title: "Unlimited Card",
    description:
      "Watch unlimited movies for one monthly fee. 10% off cinema snacks and drinks. Access to exclusive screenings and offers.",
    used: 10,
    total: 20,
    price: 16.99,
    logo: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "l13",
    brand: "Odeon",
    type: "loyalty",
    title: "Odeon Limitless",
    description:
      "Unlimited films, any day, any time from £12.99 per month. 10% off food and drink plus exclusive member treats.",
    used: 8,
    total: 15,
    price: 12.99,
    logo: "https://images.pexels.com/photos/109669/pexels-photo-109669.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "l14",
    brand: "Superdrug",
    type: "loyalty",
    title: "Health & Beautycard",
    description:
      "Earn 1 point for every £1 spent. Points worth 1p each to redeem against future purchases. Exclusive member pricing.",
    used: 19,
    total: 30,
    price: 0,
    logo: "https://images.pexels.com/photos/208052/pexels-photo-208052.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "l15",
    brand: "Costco",
    type: "loyalty",
    title: "Costco Membership",
    description:
      "Access to Costco warehouses worldwide. Exclusive member pricing on thousands of items from groceries to electronics.",
    used: 60,
    total: 100,
    price: 33.6,
    logo: "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "l16",
    brand: "British Airways",
    type: "loyalty",
    title: "Executive Club",
    description:
      "Collect Avios when you fly with British Airways and partner airlines. Redeem for flights, upgrades, hotels, and more.",
    used: 25,
    total: 50,
    price: 0,
    logo: "https://images.pexels.com/photos/723240/pexels-photo-723240.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "l17",
    brand: "Hilton",
    type: "loyalty",
    title: "Hilton Honors",
    description:
      "Earn points for hotel stays, dining, and experiences. Redeem for free nights, room upgrades, and exclusive experiences.",
    used: 15,
    total: 30,
    price: 0,
    logo: "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "l18",
    brand: "Marriott",
    type: "loyalty",
    title: "Marriott Bonvoy",
    description:
      "Earn points at 30+ hotel brands worldwide. Member rates, mobile check-in, and free Wi-Fi. Redeem for free nights and experiences.",
    used: 22,
    total: 40,
    price: 0,
    logo: "https://images.pexels.com/photos/261169/pexels-photo-261169.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "l19",
    brand: "Greggs",
    type: "loyalty",
    title: "Greggs Rewards",
    description:
      "Collect stamps on purchases. Free hot drink after 7 stamps. Exclusive rewards and treats sent to your phone.",
    used: 40,
    total: 80,
    price: 0,
    logo: "https://images.pexels.com/photos/1070946/pexels-photo-1070946.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "l20",
    brand: "Morrisons",
    type: "loyalty",
    title: "More Card",
    description:
      "Collect 5 points for every £1 spent. Convert points to More fivers to spend in-store or online. Personalized offers via the app.",
    used: 37,
    total: 60,
    price: 0,
    logo: "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "l21",
    brand: "Pizza Express",
    type: "loyalty",
    title: "Pizza Express Club",
    description:
      "Earn 1 stamp for every visit. Free dough balls after 5 stamps. Exclusive offers and a free birthday treat.",
    used: 9,
    total: 20,
    price: 0,
    logo: "https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "l22",
    brand: "Shell",
    type: "loyalty",
    title: "Shell Go+",
    description:
      "Earn 10% off hot drinks and deli2go food. Save 3p per litre on fuel every 10 visits. Personalized offers via the app.",
    used: 28,
    total: 50,
    price: 0,
    logo: "https://images.pexels.com/photos/5699232/pexels-photo-5699232.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "l23",
    brand: "BP",
    type: "loyalty",
    title: "BPme Rewards",
    description:
      "Earn 1 point for every £1 spent on fuel or in-store. 200 points = £1 to spend. Double points on premium fuels.",
    used: 18,
    total: 30,
    price: 0,
    logo: "https://images.pexels.com/photos/5582867/pexels-photo-5582867.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "l24",
    brand: "Subway",
    type: "loyalty",
    title: "Subway Rewards",
    description:
      "Earn 10 points for every £1 spent. 500 points can be redeemed for a free 6-inch Sub. Special offers via the app.",
    used: 15,
    total: 25,
    price: 0,
    logo: "https://images.pexels.com/photos/1630588/pexels-photo-1630588.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "l25",
    brand: "The Body Shop",
    type: "loyalty",
    title: "Love Your Body Club",
    description:
      "Earn 10 points for every £1 spent. £5 reward for every 500 points. Birthday treat and exclusive member offers.",
    used: 12,
    total: 20,
    price: 0,
    logo: "https://images.pexels.com/photos/3321416/pexels-photo-3321416.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "l26",
    brand: "Virgin Atlantic",
    type: "loyalty",
    title: "Flying Club",
    description:
      "Earn miles when you fly with Virgin Atlantic and partner airlines. Redeem for flights, upgrades, and experiences.",
    used: 8,
    total: 15,
    price: 0,
    featured: true,
    logo: "https://images.pexels.com/photos/358220/pexels-photo-358220.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "l27",
    brand: "Holland & Barrett",
    type: "loyalty",
    title: "Rewards for Life",
    description:
      "Earn 4 points for every £1 spent. Points worth 0.4p each. Special member promotions and offers.",
    used: 22,
    total: 40,
    price: 0,
    logo: "https://images.pexels.com/photos/2987856/pexels-photo-2987856.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "l28",
    brand: "Vue Cinema",
    type: "loyalty",
    title: "Vue Insider",
    description:
      "Get access to exclusive preview screenings, competitions, and special offers. Regular discounts on tickets.",
    used: 13,
    total: 25,
    price: 0,
    logo: "https://images.pexels.com/photos/7991514/pexels-photo-7991514.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "l29",
    brand: "Toby Carvery",
    type: "loyalty",
    title: "Toby Carvery App",
    description:
      "Collect stamps with every visit. Free dessert after 5 stamps. Free roast on your birthday and exclusive app offers.",
    used: 10,
    total: 20,
    price: 0,
    logo: "https://images.pexels.com/photos/361184/asparagus-steak-veal-steak-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "l30",
    brand: "Pure Gym",
    type: "loyalty",
    title: "PureGym Plus",
    description:
      "Access to all 300+ gyms nationwide. Book classes 14 days in advance. Bring a friend 4 times a month.",
    used: 25,
    total: 50,
    price: 24.99,
    logo: "https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },

  // HIGH VALUE OFFERS (Featured due to ≥£50)
  {
    id: "r8291",
    brand: "Nationwide",
    type: "referral",
    title: "£100 Nationwide Current Account Switch Bonus",
    description:
      "Refer a friend to Nationwide and you'll both receive £100 when they switch their current account using the Current Account Switch Service and set up 2 direct debits within 28 days.",
    used: 0,
    total: 5,
    price: 100,
    featured: true, // £100 value
    logo: "https://images.pexels.com/photos/50987/money-card-business-credit-card-50987.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "r7632",
    brand: "HSBC",
    type: "referral",
    title: "£150 HSBC Advance Account Switch Offer",
    description:
      "Switch to an HSBC Advance Account using my referral link and receive £150 cash bonus. Must use the Current Account Switch Service, set up 2+ direct debits, and deposit £1,500+ within 60 days.",
    used: 0,
    total: 3,
    price: 150,
    featured: true, // £150 value
    logo: "https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "r9145",
    brand: "Hargreaves Lansdown",
    type: "referral",
    title: "Earn up to £100 with Hargreaves Lansdown Referral",
    description:
      "Refer your friend to open a Stocks & Shares ISA, SIPP, or Fund & Share Account. Once they deposit at least £5,000, we'll both receive up to £100 in rewards depending on their deposit amount.",
    used: 0,
    total: 10,
    price: 100,
    featured: true, // £100 value
    logo: "https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "r5427",
    brand: "Virgin Media",
    type: "referral",
    title: "£50 for You and Your Friend with Virgin Media",
    description:
      "Refer a friend to Virgin Media broadband and you'll both receive a £50 bill credit once their installation is complete. Valid for new customers signing up for any Virgin Media broadband package.",
    used: 0,
    total: 5,
    price: 50,
    featured: true, // £50 value
    logo: "https://images.pexels.com/photos/35550/ipad-tablet-technology-touch.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },

  // HIGH PARTICIPATION OFFERS (Featured due to >20 participants)
  {
    id: "r2389",
    brand: "Monzo",
    type: "referral",
    title: "Get £5 with Monzo Referral Link",
    description:
      "Sign up for Monzo using my link, make a purchase with your new card, and we'll both receive £5. Monzo offers free UK bank accounts with instant notifications, budgeting tools, and fee-free spending abroad.",
    used: 0,
    total: 25,
    price: 5,
    featured: true, // 25 participants > 20
    logo: "https://images.pexels.com/photos/6347726/pexels-photo-6347726.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "r4156",
    brand: "Deliveroo",
    type: "referral",
    title: "£10 Off Your First Deliveroo Order",
    description:
      "Sign up to Deliveroo using my referral code and get £10 off your first order over £15. I'll also receive £10 in Deliveroo credit. Deliveroo offers food delivery from thousands of restaurants across the UK.",
    used: 0,
    total: 30,
    price: 10,
    featured: true, // 30 participants > 20
    logo: "https://images.pexels.com/photos/1059863/pexels-photo-1059863.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "r7823",
    brand: "Octopus Energy",
    type: "referral",
    title: "£50 Credit for You and a Friend with Octopus Energy",
    description:
      "Switch to Octopus Energy using my referral link and we'll both receive £50 credit on our energy accounts. Octopus offers 100% renewable electricity and award-winning customer service.",
    used: 0,
    total: 40,
    price: 50,
    featured: true, // Both £50 value and 40 participants > 20
    logo: "https://images.pexels.com/photos/9875441/pexels-photo-9875441.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },

  // REGULAR OFFERS (Non-featured)
  {
    id: "r3245",
    brand: "Starling Bank",
    type: "referral",
    title: "£20 for Referring a Friend to Starling Bank",
    description:
      "Refer a friend to Starling Bank and you'll both receive £20 when they open an account and make a card payment. Starling offers award-winning current accounts with no monthly fees.",
    used: 0,
    total: 10,
    price: 20,
    featured: false, // £20 < £50 and 10 participants < 20
    logo: "https://images.pexels.com/photos/6347719/pexels-photo-6347719.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "r6210",
    brand: "Chase UK",
    type: "referral",
    title: "£20 Chase Bank Referral Bonus",
    description:
      "Open a Chase UK account with my referral code, deposit £20+ and use your card within 30 days. We'll both receive £20 cash rewards directly to our accounts.",
    used: 0,
    total: 20,
    price: 20,
    featured: false, // £20 < £50 and 20 participants = 20 (not > 20)
    logo: "https://images.pexels.com/photos/4386372/pexels-photo-4386372.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "r1876",
    brand: "Freetrade",
    type: "referral",
    title: "Free Share Worth up to £200 with Freetrade",
    description:
      "Sign up to Freetrade using my link and fund your account with £50. We'll both get a free share worth between £3 and £200. Freetrade offers commission-free investing in stocks and ETFs.",
    used: 0,
    total: 5,
    price: 10, // Average expected value
    featured: false, // £10 < £50 and 5 participants < 20
    logo: "https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "r5327",
    brand: "Trading 212",
    type: "referral",
    title: "Free Share Worth Up to £100 with Trading 212",
    description:
      "Join Trading 212 using my referral link and deposit £1. We'll both receive a free share worth up to £100. Trading 212 offers commission-free trading of stocks, ETFs, and fractional shares.",
    used: 0,
    total: 15,
    price: 8, // Average expected value
    featured: false, // £8 < £50 and 15 participants < 20
    logo: "https://images.pexels.com/photos/6770610/pexels-photo-6770610.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "r9123",
    brand: "Coinbase",
    type: "referral",
    title: "Earn £10 in Bitcoin with Coinbase",
    description:
      "Sign up for Coinbase using my referral link and buy or sell £100 or more in crypto. We'll both earn £10 in Bitcoin. Coinbase is one of the world's largest cryptocurrency exchanges.",
    used: 0,
    total: 10,
    price: 10,
    featured: false, // £10 < £50 and 10 participants < 20
    logo: "https://images.pexels.com/photos/8370752/pexels-photo-8370752.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "r4267",
    brand: "Uber Eats",
    type: "referral",
    title: "£15 Off Your First Uber Eats Order",
    description:
      "Use my code for £15 off your first Uber Eats order of £15+. I'll get £5 in Uber cash when you place your order. Uber Eats delivers food from thousands of restaurants to your door.",
    used: 0,
    total: 10,
    price: 15,
    featured: false, // £15 < £50 and 10 participants < 20
    logo: "https://images.pexels.com/photos/6270289/pexels-photo-6270289.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "r7523",
    brand: "Airbnb",
    type: "referral",
    title: "£25 Off Your First Airbnb Stay",
    description:
      "Sign up to Airbnb with my link and get £25 off your first stay of £75 or more. I'll receive £15 credit for referring you. Find unique places to stay with local hosts around the world.",
    used: 0,
    total: 5,
    price: 25,
    featured: false, // £25 < £50 and 5 participants < 20
    logo: "https://images.pexels.com/photos/2467285/pexels-photo-2467285.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "r3419",
    brand: "InvestEngine",
    type: "referral",
    title: "Free £25 Investment Bonus with InvestEngine",
    description:
      "Open an InvestEngine account with my referral link, deposit £100, and get a £25 welcome bonus. Leave your money invested for 12 months to qualify. We both receive the bonus.",
    used: 0,
    total: 5,
    price: 25,
    featured: false, // £25 < £50 and 5 participants < 20
    logo: "https://images.pexels.com/photos/6801751/pexels-photo-6801751.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "r8765",
    brand: "Luno",
    type: "referral",
    title: "Free £10 in Bitcoin with Luno",
    description:
      "Sign up to Luno with my referral code, verify your account and buy £100 of Bitcoin to receive £10 of free Bitcoin. Luno makes it safe and easy to buy, store and learn about cryptocurrencies.",
    used: 0,
    total: 10,
    price: 10,
    featured: false, // £10 < £50 and 10 participants < 20
    logo: "https://images.pexels.com/photos/8369836/pexels-photo-8369836.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
  {
    id: "r2156",
    brand: "Curve",
    type: "referral",
    title: "£10 Curve Card Referral Bonus",
    description:
      "Sign up to Curve using my link, make your first transaction within 14 days, and we both get £10 credit. Curve lets you combine all your cards into one smart card.",
    used: 0,
    total: 15,
    price: 10,
    featured: false, // £10 < £50 and 15 participants < 20
    logo: "https://images.pexels.com/photos/6224383/pexels-photo-6224383.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    createdAt: getRandomDate(),
  },
];

const pageCache = new Map<number, Offer[]>();
// Export a loading state to track when data is fully loaded
export let isDataLoading = true;

// Initial data loading
export const dataLoadingPromise = (async () => {
  try {
    isDataLoading = true;
    const result = await loadPage(0); // Load first page
    return result;
  } catch (error) {
    console.error("Error loading initial data:", error);
    return mockOffers;
  } finally {
    isDataLoading = false;
  }
})();

// Function to load a specific page
export async function loadPage(
  page: number,
  brandFilter?: string | null,
): Promise<Offer[]> {
  try {
    // Check if we already have this page cached
    if (pageCache.has(page)) {
      currentPage = page;
      let offers = pageCache.get(page)!;

      // Apply brand filter if specified
      if (brandFilter) {
        offers = offers.filter((offer) =>
          offer.brand.toLowerCase().includes(brandFilter.toLowerCase()),
        );
      }

      return offers;
    }

    isLoadingPage = true;

    // Fetch the requested page
    const { offers, pagination } = await fetchAndTransformReferralOffers(page);

    // Update pagination state
    currentPage = pagination.currentPage;
    totalPages = pagination.totalPages;
    totalRecords = pagination.totalRecords;

    // Cache this page
    pageCache.set(page, offers);

    console.log(
      `Loaded page ${page + 1} of ${totalPages} (${offers.length} offers)`,
    );

    // Apply brand filter if specified
    if (brandFilter) {
      return offers.filter((offer) =>
        offer.brand.toLowerCase().includes(brandFilter.toLowerCase()),
      );
    }

    return offers;
  } catch (error) {
    console.error(`Error loading page ${page}:`, error);
    return [];
  } finally {
    isLoadingPage = false;
  }
}

async function fetchAndTransformReferralOffers(page = 0): Promise<{
  offers: Offer[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    hasMore: boolean;
  };
}> {
  const pageSize = 25; // Number of records per page
  const startIndex = page * pageSize;

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true, // Note: Only use this in development
  });

  // Create a FormData object for the request
  const formData = new URLSearchParams();

  // Essential parameters with pagination
  formData.append("draw", "1");
  formData.append("start", startIndex.toString());
  formData.append("length", pageSize.toString()); // Set to page size instead of -1
  formData.append("order[0][column]", "12");
  formData.append("order[0][dir]", "desc");
  formData.append("wdtNonce", "a91733fc0d");

  // Only include the columns we need
  const columnsToFetch = [
    { index: 0, name: "Image" }, // Logo/photo URL
    { index: 1, name: "Name" }, // Brand name
    { index: 10, name: "Sign Up Reward" }, // Price/reward
    { index: 13, name: "Instructions" }, // Instructions
    { index: 17, name: "Description" }, // Description
  ];

  // Add column parameters
  columnsToFetch.forEach((column) => {
    formData.append(`columns[${column.index}][data]`, column.index.toString());
    formData.append(`columns[${column.index}][name]`, column.name);
    formData.append(`columns[${column.index}][searchable]`, "true");
    formData.append(
      `columns[${column.index}][orderable]`,
      column.index === 10 ? "true" : "false",
    );
    formData.append(`columns[${column.index}][search][value]`, "");
    formData.append(`columns[${column.index}][search][regex]`, "false");
  });

  try {
    // Use the CORS proxy with the proper headers
    const response = await fetch(
      "https://cors-anywhere.herokuapp.com/https://scrimpr.co.uk/wp-admin/admin-ajax.php?action=get_wdtable&table_id=71",
      {
        credentials: "omit",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0",
          Accept: "application/json, text/javascript, */*; q=0.01",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest",
          Origin: "https://scrimpr.co.uk",
        },
        method: "POST",
        body: formData.toString(),
        mode: "cors",
      },
    );

    const result = await response.json();

    // Process the response data
    const processedData: Offer[] = [];

    for (const row of result.data) {
      const brand = row[1];
      const description =
        row[17] || `Refer a friend to ${brand} and earn rewards.`;
      const instructions = row[13] || ""; // Already extracting instructions
      const signUpReward = row[10] || "£0";
      const imageUrl = extractImageUrl(row[0]);

      // Extract numeric price from signup reward
      let price = 0;
      const rewardMatch = signUpReward.match(/£(\d+)/);
      if (rewardMatch && rewardMatch[1]) {
        price = parseFloat(rewardMatch[1]);
      }

      // Generate a random ID
      const id = `r${Math.floor(Math.random() * 10000)}`;

      // Initial estimated total (for loading state)
      const estimatedTotal = 10; // Default value while loading

      // Generate a random number of used spots between 0 and estimatedTotal
      const usedCount = Math.floor(Math.random() * estimatedTotal);

      // Create offer object with instructions
      const offer: Offer = {
        id,
        brand,
        type: "referral",
        title: `${brand} Referral`, // Initial placeholder title
        description,
        instructions, // Add instructions to the offer object
        used: usedCount,
        total: estimatedTotal,
        price,
        featured: price >= 50 || estimatedTotal > 20,
        logo: imageUrl,
        createdAt: getRandomDate(),
        isTitleLoading: true,
        isTotalLoading: true,
      };

      // Add the offer to our processed data immediately (with loading states)
      processedData.push(offer);

      // Start background process to update the title
      (async () => {
        try {
          // Generate title with OpenAI
          const title = await generateTitleWithOpenAI(
            openai,
            brand,
            signUpReward,
            description,
          );

          // Update the offer object (which is a reference to the one in processedData)
          offer.title = title;
          offer.isTitleLoading = false;
        } catch (error) {
          console.error(`Error generating title for ${brand}:`, error);
          // Set a fallback title
          offer.title = `${brand} ${signUpReward} Referral`;
          offer.isTitleLoading = false;
        }
      })();

      // Start background process to update the total
      (async () => {
        try {
          // Generate total with OpenAI
          const total = await generateTotalWithOpenAI(
            openai,
            instructions,
            description,
          );

          // Update the offer object
          offer.total = total;
          // Update featured status based on accurate total
          offer.featured = price >= 50 || total > 20;
          offer.isTotalLoading = false;

          // Adjust usedCount to be within the new total range
          if (offer.used >= total) {
            offer.used = Math.max(0, total - 1);
          }
        } catch (error) {
          console.error(`Error generating total for ${brand}:`, error);
          // Keep the estimated total if there's an error
          offer.isTotalLoading = false;
        }
      })();
    }

    // Calculate pagination information
    const totalRecords = result.recordsTotal || 0;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const hasMore = startIndex + processedData.length < totalRecords;

    // Return the processed data with loading states for progressive rendering
    return {
      offers: processedData,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords,
        hasMore,
      },
    };
  } catch (error) {
    console.error("Error fetching referral data:", error);

    // Return empty data with pagination info
    return {
      offers: [],
      pagination: {
        currentPage: page,
        totalPages: 0,
        totalRecords: 0,
        hasMore: false,
      },
    };
  }
}

function extractImageUrl(htmlImgTag: string): string {
  // Default image if parsing fails
  const defaultImage =
    "https://images.pexels.com/photos/4968630/pexels-photo-4968630.jpeg";

  // Check if we have a string to parse
  if (!htmlImgTag || typeof htmlImgTag !== "string") {
    return defaultImage;
  }

  // Extract the src attribute using regex
  const srcMatch = htmlImgTag.match(/src=["'](.*?)["']/i);
  if (srcMatch && srcMatch[1]) {
    return srcMatch[1];
  }

  // If tag doesn't contain src or can't be parsed, return default
  return defaultImage;
}

// Function to generate titles using OpenAI
async function generateTitleWithOpenAI(openai, brand, reward, description) {
  try {
    const prompt = `Create a short, catchy referral offer title for ${brand} based on this information:

Reward: ${reward}
Description: ${description}

The title should be concise (under 60 characters), enticing, and mention the reward if applicable.
Don't use quotes in your response. Just return the title text.

Example format: "Get £50 with Revolut Referral" or "Free Stock Worth up to £200"`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a marketing specialist who creates engaging, concise referral program titles.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 60,
      temperature: 0.7,
    });

    let title = response.choices[0].message.content.trim();

    // Remove quotes if present
    if (title.startsWith('"') && title.endsWith('"')) {
      title = title.slice(1, -1);
    }

    return title;
  } catch (error) {
    console.error("Error generating title with OpenAI:", error);

    // Fallback title generation
    if (reward && reward.includes("£")) {
      return `Get ${reward} with ${brand} Referral`;
    } else {
      return `${brand} Referral Program`;
    }
  }
}

// Function to generate totals using OpenAI
async function generateTotalWithOpenAI(openai, instructions, description) {
  try {
    const prompt = `Based on the following referral program instructions and description, determine the maximum number of people that can be referred or a reasonable limit around 3-6 if not specified:

Instructions: ${instructions}
Description: ${description}

Look for phrases like "can refer X friends" (meaning X+1 needed), "limited to X" (meaning X needed), "up to X referrals" (meaning X needed), "refer A friend" (meaning 2 needed), etc. etc.
If no specific limit is mentioned, analyze the program and suggest a reasonable limit between 3-6.
Only respond with a number (no text).`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a data analyst who extracts specific numerical values from text.",
        },
        { role: "user", content: prompt },
      ],
      max_completion_tokens: 10,
      temperature: 0.3,
    });

    const totalText = response.choices[0].message.content.trim();
    const totalNumber = parseInt(totalText, 10);

    // If OpenAI didn't return a valid number, use fallback logic
    if (isNaN(totalNumber)) {
      return generateFallbackTotal(instructions, description);
    }

    return totalNumber;
  } catch (error) {
    console.error("Error generating total with OpenAI:", error);
    return generateFallbackTotal(instructions, description);
  }
}

// Fallback function for generating totals without OpenAI
function generateFallbackTotal(instructions, description) {
  const instructionsMatch = instructions.match(
    /can refer (\d+)|limited to (\d+)|up to (\d+) friends/i,
  );
  const descriptionMatch = description.match(
    /refer (\d+)|limited to (\d+)|up to (\d+) friends/i,
  );

  if (instructionsMatch) {
    return parseInt(
      instructionsMatch[1] || instructionsMatch[2] || instructionsMatch[3],
      5,
    );
  } else if (descriptionMatch) {
    return parseInt(
      descriptionMatch[1] || descriptionMatch[2] || descriptionMatch[3],
      5,
    );
  } else {
    // Random reasonable number if no specific limit found
    return Math.floor(Math.random() * 3) + 3; // Between 3-6
  }
}

// Usage example:
async function populateMockOffers() {
  try {
    // Fetch and transform referral data using OpenAI
    const newReferralOffers = await fetchAndTransformReferralOffers();

    // Log the number of offers fetched
    console.log(`Generated ${newReferralOffers.length} new referral offers`);

    // Combine with existing offers (if any)
    // export const mockOffers = [...existingOffers, ...newReferralOffers];

    return newReferralOffers;
  } catch (error) {
    console.error("Error populating mock offers:", error);
    return [];
  }
}

// Call the function to populate offers
// populateMockOffers();

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
