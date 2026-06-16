export type UserRole = 'admin' | 'supervisor' | 'viewer' | 'user';
export type UserStatus = 'active' | 'locked' | 'inactive';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  image: string;
  role: UserRole;
  status: UserStatus;
  secretsCount: number;
  mfaEnabled: boolean;
  preferredLocale: 'en' | 'ar';
  notificationsEnabled: boolean;
  joinedAt: string | null;
  lastActive: string | null;
}

export type TabId = 'overview' | 'users' | 'admins';
export type ConfirmActionType = 'delete' | 'lock' | 'unlock' | 'makeAdmin' | 'removeAdmin' | 'save';

export interface ConfirmState {
  type: ConfirmActionType;
  user: AdminUser;
  editDraft?: AdminUser; // only for 'save'
}
