import { UserRole } from '../../../core/models/user.model';

export interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  documentNumber: string;
  role: UserRole;
  active: boolean;
  createdAt: string;   // ISO datetime string
  updatedAt: string;   // ISO datetime string
}

export interface UpdateUserStatusRequest {
  active: boolean;
}
