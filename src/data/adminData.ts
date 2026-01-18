// All 58 Algerian Wilayas
export const algerianWilayas = [
  "أدرار", "الشلف", "الأغواط", "أم البواقي", "باتنة", "بجاية", "بسكرة", "بشار",
  "البليدة", "البويرة", "تمنراست", "تبسة", "تلمسان", "تيارت", "تيزي وزو", "الجزائر",
  "الجلفة", "جيجل", "سطيف", "سعيدة", "سكيكدة", "سيدي بلعباس", "عنابة", "قالمة",
  "قسنطينة", "المدية", "مستغانم", "المسيلة", "معسكر", "ورقلة", "وهران", "البيض",
  "إليزي", "برج بوعريريج", "بومرداس", "الطارف", "تندوف", "تيسمسيلت", "الوادي", "خنشلة",
  "سوق أهراس", "تيبازة", "ميلة", "عين الدفلى", "النعامة", "عين تموشنت", "غرداية", "غليزان",
  "المنيعة", "المغير", "أولاد جلال", "برج باجي مختار", "بني عباس", "تيميمون", "توقرت", "جانت",
  "عين صالح", "عين قزام"
];

export interface TariffEntry {
  wilaya: string;
  homePrice: number;
  bureauPrice: number;
}

export interface StoreTariffs {
  laghouat: TariffEntry[];
  aflou: TariffEntry[];
}

export interface OrderProduct {
  id: string;
  name: string;
  quantity: number;
  price: number;
  weight?: string;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  wilaya: string;
  deliveryType: 'home' | 'bureau' | 'pickup';
  deliveryPrice: number;
  totalPrice: number;
  status: 'new' | 'confirmed' | 'delivered' | 'canceled';
  sendFromStore: 'laghouat' | 'aflou';
  orderDate: string;
  products: OrderProduct[];
  address?: string;
}

export interface ProductWeight {
  id: string;
  weight: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  images: string[];
  status: 'active' | 'rupture' | 'low';
  stock: number;
  // New fields
  hasWeightOptions: boolean;
  weights: ProductWeight[];
  isFeatured: boolean;
  isBestSeller: boolean;
}

export interface Category {
  id: string;
  name: string;
  productCount: number;
}

// Generate initial tariffs with random prices
const generateInitialTariffs = (): TariffEntry[] => {
  return algerianWilayas.map(wilaya => ({
    wilaya,
    homePrice: Math.floor(Math.random() * 800) + 400,
    bureauPrice: Math.floor(Math.random() * 600) + 300,
  }));
};

export const initialTariffs: StoreTariffs = {
  laghouat: generateInitialTariffs(),
  aflou: generateInitialTariffs(),
};

// Mock orders with more variety for date filtering
export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'محمد أحمد',
    phone: '0555123456',
    wilaya: 'الجزائر',
    deliveryType: 'home',
    deliveryPrice: 850,
    totalPrice: 4350,
    status: 'new',
    sendFromStore: 'laghouat',
    orderDate: '2026-01-15',
    products: [
      { id: '1', name: 'كمون مطحون', quantity: 2, price: 500, weight: '100g' },
      { id: '2', name: 'فلفل أحمر', quantity: 3, price: 1000 },
    ],
    address: 'شارع ديدوش مراد، الجزائر العاصمة'
  },
  {
    id: 'ORD-002',
    customerName: 'فاطمة الزهراء',
    phone: '0661987654',
    wilaya: 'وهران',
    deliveryType: 'bureau',
    deliveryPrice: 650,
    totalPrice: 2650,
    status: 'confirmed',
    sendFromStore: 'aflou',
    orderDate: '2026-01-14',
    products: [
      { id: '3', name: 'زعتر بري', quantity: 1, price: 800, weight: '50g' },
      { id: '4', name: 'قرفة عيدان', quantity: 2, price: 600 },
    ],
    address: 'مكتب البريد المركزي، وهران'
  },
  {
    id: 'ORD-003',
    customerName: 'عبد الرحمان بن سعيد',
    phone: '0770456789',
    wilaya: 'قسنطينة',
    deliveryType: 'home',
    deliveryPrice: 900,
    totalPrice: 5400,
    status: 'delivered',
    sendFromStore: 'laghouat',
    orderDate: '2026-01-12',
    products: [
      { id: '5', name: 'راس الحانوت', quantity: 4, price: 1125, weight: '100g' },
    ],
    address: 'حي زيغود يوسف، قسنطينة'
  },
  {
    id: 'ORD-004',
    customerName: 'سمية بلقاسم',
    phone: '0550789123',
    wilaya: 'الأغواط',
    deliveryType: 'pickup',
    deliveryPrice: 0,
    totalPrice: 1800,
    status: 'confirmed',
    sendFromStore: 'laghouat',
    orderDate: '2026-01-13',
    products: [
      { id: '6', name: 'نعناع مجفف', quantity: 3, price: 600 },
    ]
  },
  {
    id: 'ORD-005',
    customerName: 'يوسف حمادي',
    phone: '0660321654',
    wilaya: 'باتنة',
    deliveryType: 'bureau',
    deliveryPrice: 550,
    totalPrice: 3050,
    status: 'canceled',
    sendFromStore: 'aflou',
    orderDate: '2026-01-10',
    products: [
      { id: '7', name: 'كركم مطحون', quantity: 2, price: 750 },
      { id: '8', name: 'زنجبيل مطحون', quantity: 1, price: 500 },
    ],
    address: 'مكتب البريد، باتنة'
  },
  {
    id: 'ORD-006',
    customerName: 'آمال جبار',
    phone: '0775159357',
    wilaya: 'سطيف',
    deliveryType: 'home',
    deliveryPrice: 750,
    totalPrice: 4250,
    status: 'new',
    sendFromStore: 'laghouat',
    orderDate: '2026-01-16',
    products: [
      { id: '1', name: 'كمون مطحون', quantity: 5, price: 500 },
      { id: '9', name: 'فلفل أسود', quantity: 2, price: 600 },
    ],
    address: 'حي المقاومة، سطيف'
  },
  {
    id: 'ORD-007',
    customerName: 'خالد بوزيد',
    phone: '0550111222',
    wilaya: 'البليدة',
    deliveryType: 'home',
    deliveryPrice: 600,
    totalPrice: 3600,
    status: 'delivered',
    sendFromStore: 'laghouat',
    orderDate: '2026-01-08',
    products: [
      { id: '1', name: 'كمون مطحون', quantity: 3, price: 500, weight: '100g' },
      { id: '3', name: 'زعتر بري', quantity: 2, price: 800, weight: '50g' },
    ],
    address: 'حي بن بولعيد، البليدة'
  },
  {
    id: 'ORD-008',
    customerName: 'نادية مراد',
    phone: '0660333444',
    wilaya: 'تيزي وزو',
    deliveryType: 'bureau',
    deliveryPrice: 700,
    totalPrice: 2900,
    status: 'confirmed',
    sendFromStore: 'aflou',
    orderDate: '2026-01-11',
    products: [
      { id: '5', name: 'راس الحانوت', quantity: 2, price: 1100, weight: '100g' },
    ],
    address: 'مكتب البريد المركزي، تيزي وزو'
  },
];

// Mock products with weight options
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'كمون مطحون',
    price: 500,
    category: 'بهارات',
    description: 'كمون مطحون طازج من أجود الأنواع',
    images: ['/placeholder.svg'],
    status: 'active',
    stock: 50,
    hasWeightOptions: true,
    weights: [
      { id: 'w1', weight: '50g', price: 300 },
      { id: 'w2', weight: '100g', price: 500 },
      { id: 'w3', weight: '250g', price: 1100 },
    ],
    isFeatured: true,
    isBestSeller: true,
  },
  {
    id: '2',
    name: 'فلفل أحمر حار',
    price: 450,
    category: 'بهارات',
    description: 'فلفل أحمر حار مطحون',
    images: ['/placeholder.svg'],
    status: 'active',
    stock: 35,
    hasWeightOptions: true,
    weights: [
      { id: 'w1', weight: '50g', price: 250 },
      { id: 'w2', weight: '100g', price: 450 },
      { id: 'w3', weight: '250g', price: 1000 },
    ],
    isFeatured: false,
    isBestSeller: true,
  },
  {
    id: '3',
    name: 'زعتر بري',
    price: 800,
    category: 'أعشاب',
    description: 'زعتر بري طبيعي من جبال الأطلس',
    images: ['/placeholder.svg'],
    status: 'active',
    stock: 25,
    hasWeightOptions: true,
    weights: [
      { id: 'w1', weight: '50g', price: 450 },
      { id: 'w2', weight: '100g', price: 800 },
      { id: 'w3', weight: '250g', price: 1800 },
    ],
    isFeatured: true,
    isBestSeller: false,
  },
  {
    id: '4',
    name: 'قرفة عيدان',
    price: 600,
    category: 'بهارات',
    description: 'قرفة عيدان عالية الجودة',
    images: ['/placeholder.svg'],
    status: 'active',
    stock: 40,
    hasWeightOptions: false,
    weights: [],
    isFeatured: false,
    isBestSeller: false,
  },
  {
    id: '5',
    name: 'راس الحانوت',
    price: 1125,
    category: 'خلطات',
    description: 'خلطة راس الحانوت الأصلية',
    images: ['/placeholder.svg'],
    status: 'active',
    stock: 30,
    hasWeightOptions: true,
    weights: [
      { id: 'w1', weight: '50g', price: 600 },
      { id: 'w2', weight: '100g', price: 1125 },
      { id: 'w3', weight: '250g', price: 2500 },
    ],
    isFeatured: true,
    isBestSeller: true,
  },
  {
    id: '6',
    name: 'نعناع مجفف',
    price: 600,
    category: 'أعشاب',
    description: 'نعناع مجفف طبيعي',
    images: ['/placeholder.svg'],
    status: 'rupture',
    stock: 0,
    hasWeightOptions: false,
    weights: [],
    isFeatured: false,
    isBestSeller: false,
  },
  {
    id: '7',
    name: 'كركم مطحون',
    price: 750,
    category: 'بهارات',
    description: 'كركم مطحون عالي الجودة',
    images: ['/placeholder.svg'],
    status: 'low',
    stock: 5,
    hasWeightOptions: true,
    weights: [
      { id: 'w1', weight: '50g', price: 400 },
      { id: 'w2', weight: '100g', price: 750 },
      { id: 'w3', weight: '250g', price: 1700 },
    ],
    isFeatured: false,
    isBestSeller: false,
  },
];

// Mock categories
export const mockCategories: Category[] = [
  { id: '1', name: 'بهارات', productCount: 4 },
  { id: '2', name: 'أعشاب', productCount: 2 },
  { id: '3', name: 'خلطات', productCount: 1 },
  { id: '4', name: 'حبوب', productCount: 0 },
  { id: '5', name: 'علب هدايا', productCount: 0 },
];

// Helper function to calculate cheapest store
export const getCheapestStore = (
  wilaya: string,
  deliveryType: 'home' | 'bureau',
  tariffs: StoreTariffs
): { store: 'laghouat' | 'aflou'; price: number } => {
  const laghouatEntry = tariffs.laghouat.find(t => t.wilaya === wilaya);
  const aflouEntry = tariffs.aflou.find(t => t.wilaya === wilaya);

  if (!laghouatEntry || !aflouEntry) {
    return { store: 'laghouat', price: 0 };
  }

  const laghouatPrice = deliveryType === 'home' ? laghouatEntry.homePrice : laghouatEntry.bureauPrice;
  const aflouPrice = deliveryType === 'home' ? aflouEntry.homePrice : aflouEntry.bureauPrice;

  // If equal, default to Laghouat
  if (laghouatPrice <= aflouPrice) {
    return { store: 'laghouat', price: laghouatPrice };
  }
  return { store: 'aflou', price: aflouPrice };
};
