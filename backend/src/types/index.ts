export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
}

export enum ProductCategory {
  WINDOW = 'WINDOW',
  DOOR = 'DOOR',
  BRICK = 'BRICK',
  POOL = 'POOL',
}

export enum UnitOfSale {
  PIECE = 'PIECE',
  SET = 'SET',
  PER_1000 = 'PER_1000',
  PER_SQ_FT = 'PER_SQ_FT',
}

export enum AvailabilityStatus {
  IN_STOCK = 'IN_STOCK',
  MADE_TO_ORDER = 'MADE_TO_ORDER',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PRODUCTION = 'IN_PRODUCTION',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
}

export enum QuoteStatus {
  PENDING = 'PENDING',
  QUOTED = 'QUOTED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export interface AuthUser {
  id: string;
  phone: string;
  role: UserRole;
  name?: string | null;
  avatarUrl?: string | null;
}
