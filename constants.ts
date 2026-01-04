
import { StageStatus, Priority, OrderStatus, Gender, ProductionOrder, Customer, User, UserRole, UserPermissions } from './types';

const ADMIN_PERMISSIONS: UserPermissions = {
  dashboard: true,
  orders: true,
  models: true,
  customers: true,
  returns: true,
  shipping: true,
  canEdit: true,
  canDelete: true
};

export const DEFAULT_USERS: User[] = [
  {
    id: 'u-1',
    username: 'admin',
    password: '123',
    fullName: 'Giám Đốc Bình Vương',
    role: UserRole.ADMIN,
    createdAt: new Date().toISOString(),
    permissions: ADMIN_PERMISSIONS
  },
  {
    id: 'u-2',
    username: 'kythuat',
    password: '123',
    fullName: 'Văn Phòng Kỹ Thuật',
    role: UserRole.TECHNICAL,
    createdAt: new Date().toISOString(),
    permissions: {
      dashboard: true,
      orders: true,
      models: true,
      customers: false,
      returns: true,
      shipping: true,
      canEdit: true,
      canDelete: false
    }
  },
  {
    id: 'u-3',
    username: 'xuong',
    password: '123',
    fullName: 'Tổ Trưởng Sản Xuất',
    role: UserRole.PRODUCTION,
    createdAt: new Date().toISOString(),
    permissions: {
      dashboard: true,
      orders: true,
      models: true,
      customers: false,
      returns: true,
      shipping: true,
      canEdit: false,
      canDelete: false
    }
  }
];

export const PRODUCTION_STAGES = [
  'Chặt',
  'Mặt giày',
  'Sườn',
  'Đế',
  'Gót',
  'Gò',
  'Đóng gói'
];

export const INITIAL_STAGES = PRODUCTION_STAGES.map(name => ({
  id: name.toLowerCase().replace(/ /g, '-').replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a").replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e").replace(/ì|í|ị|ỉ|ĩ/g, "i").replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o").replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u").replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y").replace(/đ/g, "d"),
  name,
  status: StageStatus.PENDING,
}));

export const SAMPLE_CUSTOMER: Customer = {
  id: 'cust-1',
  name: 'LA CAMIE',
  code: 'LC',
  contactPerson: 'Anh Nam',
  phone: '0901234567',
  address: 'TP. Hồ Chí Minh',
  debtDays: 30,
  debtLimit: 500000000,
  createdAt: new Date().toISOString()
};

export const SAMPLE_ORDER: ProductionOrder = {
  id: '1',
  orderCode: 'PO191225',
  itemCode: 'B0137',
  customerId: 'cust-1',
  customerName: 'LA CAMIE',
  gender: Gender.FEMALE,
  totalQuantity: 252,
  orderDate: '2025-12-30',
  deliveryDate: '2026-01-29',
  productImage: 'https://picsum.photos/seed/shoes1/400/400',
  generalNote: 'KABE HẬU+MŨI 0.2',
  bom: {
    knifeCode: 'B0137',
    formCode: 'BV.049',
    soleCode: 'TH... CHẶT DAO BV.049',
    frameCode: 'BV-049',
    heel: 'TTP-190 SƠN',
    accessory: 'VH816',
    talong: 'MÚT SUỐT MAY VIỀN',
    technicalNote: 'Sườn suốt không bọc'
  },
  details: [
    {
      id: 'd1',
      color: 'Nâu XC 0913-3',
      lining: 'Lót nâu 6 ĐThắng-Talon nâu 13 Phú Hòa',
      sizes: { size34: 0, size35: 28, size36: 42, size37: 56, size38: 56, size39: 42, size40: 28 },
      total: 252
    }
  ],
  stages: INITIAL_STAGES,
  priority: Priority.MEDIUM,
  priorityReason: '',
  status: OrderStatus.ACTIVE,
  statusNote: '',
  statusHistory: [],
  sortOrder: 0,
  createdAt: new Date().toISOString()
};
