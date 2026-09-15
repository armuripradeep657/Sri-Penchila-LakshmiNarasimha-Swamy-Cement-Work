export type ProductCategory = 'WINDOW' | 'DOOR' | 'BRICK' | 'POOL';

export type UnitOfSale = 'PIECE' | 'SET' | 'PER_1000' | 'PER_SQ_FT';

export type AvailabilityStatus = 'IN_STOCK' | 'MADE_TO_ORDER' | 'OUT_OF_STOCK';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PRODUCTION'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';

export type QuoteStatus = 'PENDING' | 'QUOTED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: string;
  phone: string;
  name?: string | null;
  email?: string | null;
  gender?: string | null;
  firmName?: string | null;
  role: UserRole;
  addresses?: Address[];
}

export interface Address {
  id: string;
  userId?: string;
  label?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
  isDefault?: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string | null;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku?: string | null;
  width?: number | null;
  height?: number | null;
  depth?: number | null;
  dimensionUnit: string;
  attributes?: string | Record<string, any> | null;
  price?: number | null; // in paisa (null = Quote only)
  comparePrice?: number | null;
  stock: number;
  availability: AvailabilityStatus;
  isActive: boolean;
  sortOrder: number;
  product?: Product;
  images?: ProductImage[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: ProductCategory;
  subType?: string | null;
  unitOfSale: UnitOfSale;
  minOrderQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
  images: ProductImage[];
}

export interface CartItem {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  variant: ProductVariant & {
    product: Product;
  };
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  quoteRequiredCount: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variantSnapshot?: string | any;
  variant?: ProductVariant & { product: Product };
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  deliveryFee: number;
  workerPlacementFee?: number;
  grandTotal: number;
  deliveryAddressId?: string | null;
  deliveryZoneId?: string | null;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  deliveryAddress?: Address | null;
  deliveryZone?: DeliveryZone | null;
  user?: { id: string; name?: string | null; phone: string };
}

export interface QuoteRequest {
  id: string;
  userId: string;
  status: QuoteStatus;
  productId: string;
  variantId?: string | null;
  customWidth?: number | null;
  customHeight?: number | null;
  customDepth?: number | null;
  quantity: number;
  deliveryLocation: string;
  deliveryPincode?: string | null;
  phone: string;
  notes?: string | null;
  quotedPrice?: number | null; // in paisa
  adminNotes?: string | null;
  validUntil?: string | null;
  createdAt: string;
  updatedAt: string;
  product: Product;
  variant?: ProductVariant | null;
  user?: { name?: string | null; phone: string };
}

export interface DeliveryZone {
  id: string;
  name: string;
  pincodes: string[];
  fee: number; // paisa
  isActive: boolean;
}
