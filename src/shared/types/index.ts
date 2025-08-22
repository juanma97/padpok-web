// Tipos compartidos de la aplicación

export interface IBaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TApiResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export type TUserRole = 'admin' | 'user' | 'guest';

export interface IUser extends IBaseEntity {
  email: string;
  name: string;
  role: TUserRole;
  isActive: boolean;
}

// Tipos de utilidad
export type TOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type TRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;
