
export enum Page {
  HOME = 'home',
  MENU = 'menu',
  RESERVATIONS = 'reservations',
  CONTACT = 'contact',
  ADMIN = 'admin',
  INVENTORY = 'inventory'
}

export type DesignVariant = 'aegean' | 'byzantine' | 'rustic';

export interface Category {
  id: string;
  label: string;
  isHidden?: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  category: string;
  image?: string;
  isVegetarian?: boolean;
  weight?: string;
  calories?: string;
  isHidden?: boolean;
  isHighlighted?: boolean;
  order?: number;
  salesQuantity?: number;
  salesValue?: number;
}

export interface ReservationData {
  id?: string;
  created_at?: string;
  date: string;
  time: string;
  guests: number;
  name: string;
  phone: string;
  notes?: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface PromoItem {
  id: string;
  name: string;
  description: string;
  image: string;
  tag: string;
  isHidden?: boolean;
}

export interface SiteContent {
  general: {
    address: string;
    phone: string;
    email: string;
    hours: string;
    instagram: string;
    facebook: string;
    footerTagline: string;
    publicUrl?: string;
  };
  home: {
    heroTitle: string;
    heroSubtitle: string;
    storyTitle: string;
    storyText: string;
  };
  menuPage: {
    title: string;
    description: string;
  };
  reservationsPage: {
    title: string;
    subtitle: string;
    infoTitle: string;
    infoText: string;
    helpText: string;
  };
  contactPage: {
    title: string;
    infoTitle: string;
  };
  popup: {
    isActive: boolean;
    title: string;
    message: string;
    image?: string;
  };
  categories: Category[];
  promoItems?: PromoItem[];
}

export interface SiteImages {
  hero: string;
  story: string;
  menuHeader: string;
  logo: string;
  tablematImage?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  pricePerKg: number;
  stockKg: number;
  unit: 'kg' | 'g' | 'l' | 'ml' | 'buc';
}

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number; // in the unit specified by the ingredient
}

export interface Recipe {
  id: string;
  menuItemId: string;
  ingredients: RecipeIngredient[];
}
