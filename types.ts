
export enum Priority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export enum Gender {
  FEMALE = 'Nữ',
  MALE = 'Nam'
}

export enum StageStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  DONE = 'done'
}

export enum OrderStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  STOPPED = 'stopped',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export enum UserRole {
  ADMIN = 'admin',
  TECHNICAL = 'tech',
  PRODUCTION = 'prod',
  VIEWER = 'viewer'
}

export interface UserPermissions {
  dashboard: boolean;
  orders: boolean;
  models: boolean;
  customers: boolean;
  returns: boolean;
  shipping: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  password?: string;
  createdAt: string;
  permissions: UserPermissions;
}

export interface SizeBreakdown {
  size34?: number;
  size35?: number;
  size36?: number;
  size37?: number;
  size38?: number;
  size39?: number;
  size40?: number;
  size41?: number;
  size42?: number;
  size43?: number;
  size44?: number;
  size45?: number;
}

export interface OrderDetailRow {
  id: string;
  color: string;
  lining: string;
  sizes: SizeBreakdown;
  total: number;
}

export interface ShippingDetailRow extends OrderDetailRow {
  unitPrice: number;
  amount: number;
}

export interface ShippingEditLog {
  id: string;
  date: string;
  reason: string;
  user: string;
}

export interface ShippingNote {
  id: string;
  orderId: string;
  orderCode: string;
  customerId: string;
  customerName: string;
  itemCode: string;
  shippingDate: string;
  productImage: string;
  details: ShippingDetailRow[];
  totalQuantity: number;
  totalAmount: number;
  depositAmount: number;
  balanceAmount: number;
  depositDate?: string;
  note: string;
  createdAt: string;
  updatedAt?: string;
  editHistory?: ShippingEditLog[];
}

export interface Payment {
  id: string;
  customerId: string;
  amount: number;
  date: string;
  method: 'transfer' | 'cash';
  note: string;
  createdBy: string;
}

export interface ProductionStage {
  id: string;
  name: string;
  status: StageStatus;
  startDate?: string;
  endDate?: string;
  note?: string;
}

export interface BOM {
  knifeCode: string;
  formCode: string;
  soleCode: string;
  frameCode: string;
  heel: string;
  accessory: string;
  talong: string;
  technicalNote: string;
}

export interface StatusHistory {
  status: OrderStatus;
  date: string;
  reason: string;
}

export interface Customer {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  phone: string;
  address: string;
  debtDays: number; // Số ngày được nợ (VD: 30 ngày)
  debtLimit: number; // Hạn mức nợ tối đa (VD: 500.000.000đ)
  createdAt: string;
}

export interface EditLog {
  date: string;
  reason: string;
  type: 'BOM_CHANGE' | 'ISSUE_FIX';
  customerName?: string;
  issueDescription?: string;
  solution?: string;
  evidenceImage?: string;
}

export interface ProductModel {
  id: string;
  itemCode: string;
  productImage: string;
  bom: BOM;
  gender: Gender;
  createdAt: string;
  updatedAt?: string;
  editHistory?: EditLog[];
  isArchived?: boolean;
  technicalDocument?: string;
}

export interface ProductionOrder {
  id: string;
  orderCode: string;
  itemCode: string;
  modelId?: string;
  customerId: string;
  customerName: string;
  gender: Gender;
  totalQuantity: number;
  orderDate: string;
  deliveryDate: string;
  productImage: string;
  generalNote: string;
  bom: BOM;
  details: OrderDetailRow[];
  stages: ProductionStage[];
  priority: Priority;
  priorityReason: string;
  status: OrderStatus;
  statusNote: string;
  statusHistory: StatusHistory[];
  sortOrder: number;
  createdAt: string;
  parentOrderId?: string;
}

export interface ReturnLog {
  id: string;
  originalOrderId: string;
  color: string;
  size: number;
  quantity: number;
  reason: string;
  date: string;
}
