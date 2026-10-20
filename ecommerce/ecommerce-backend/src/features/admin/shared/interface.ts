/**
 * Admin Profile Interfaces
 * TypeScript interfaces for admin-related types.
 */

import { IUser } from '../../user/shared/interface';

// Domain Interfaces

import { AdminProfile } from './admin-profiles.schema';

export type IAdminProfile = AdminProfile;

export interface IAdminUser extends IUser {
  profile?: IAdminProfile;
}

// Input Interfaces

// keys to omit from user for creation/update
type UserSystemKeys =
  | 'id'
  | 'auth_id'
  | 'display_id'
  | 'created_at'
  | 'updated_at'
  | 'created_by'
  | 'updated_by'
  | 'deleted_at'
  | 'deleted_by'
  | 'is_deleted'
  | 'email_verified'
  | 'email_verified_at'
  | 'phone_verified'
  | 'phone_verified_at'
  | 'secondary_email_verified'
  | 'secondary_email_verified_at'
  | 'metadata'
  | 'password';

// keys to omit from adminprofile for creation/update
type ProfileSystemKeys = 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_deleted';

export interface ICreateAdmin
  extends Omit<IUser, UserSystemKeys | 'tags'>, Omit<IAdminProfile, ProfileSystemKeys> {
  // explicit overrides
  tags?: string[] | null;
}

export interface IUpdateAdmin extends Partial<ICreateAdmin> {
  email_verified?: boolean;
  secondary_email_verified?: boolean;
}

export interface IAdminFilters {
  search?: string;
  role?: string;
  is_active?: 'true' | 'false' | 'all';
  page?: number;
  limit?: number;
  sort_by?: 'created_at' | 'name' | 'department';
  sort_order?: 'asc' | 'desc';
}

// API Responses

export interface IAdminResponse extends Omit<
  IAdminUser,
  Exclude<UserSystemKeys, 'id'> | 'profile' | 'tags'
> {
  tags: string[];
  profile: Omit<IAdminProfile, ProfileSystemKeys> | null;
}

/**
 * Maps an internal admin object to a sanitized public response.
 */
export const mapToAdminResponse = (admin: IAdminUser): IAdminResponse => {
  const {
    id,
    auth_id: _auth_id,
    password: _password,
    metadata: _metadata,
    is_deleted: _is_deleted,
    deleted_at: _deleted_at,
    deleted_by: _deleted_by,
    created_at: _created_at,
    created_by: _created_by,
    updated_at: _updated_at,
    updated_by: _updated_by,
    profile,
    tags,
    ...rest
  } = admin;

  let sanitizedProfile = null;
  if (profile) {
    const {
      id: _pId,
      user_id: _user_id,
      created_at: _pCreated,
      updated_at: _pUpdated,
      is_deleted: _pDeleted,
      ...pRest
    } = profile;
    sanitizedProfile = pRest;
  }

  return {
    ...rest,
    id,
    tags: tags || [],
    profile: sanitizedProfile,
  };
};
