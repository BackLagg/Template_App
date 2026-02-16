export type { User, UserProfile } from '@entities/user';

import type { User } from '@entities/user';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface AdminState {
  isAdmin: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
}

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  onClick?: () => void;
  disabled?: boolean;
}
