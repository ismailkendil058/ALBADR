export interface ProductWeight {
  id: string;
  weight: string;
  price: number;
}

export interface Product {
  id: string;
  nameAr: string;
  nameFr: string;
  descriptionAr: string;
  descriptionFr: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isNew?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isPromo?: boolean;
  stock: number;
  unit: string;
  // New fields for weight management
  hasWeightOptions?: boolean;
  weights?: ProductWeight[];
}

export interface Category {
  id: string;
  nameAr: string;
  nameFr: string;
  image: string;
  productCount: number;
  isSpecial?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedWeight?: ProductWeight;
}

export interface WishlistItem {
  product: Product;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}
