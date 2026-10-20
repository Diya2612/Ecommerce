/**
 * Admin Feature
 * Handles admin/staff user management and profile metadata.
 */

import { Router } from 'express';
import Route from '../../interfaces/route.interface';

class AdminRoute implements Route {
  public path = '/admins';
  public router = Router();

  public async init() {
    // Dynamic imports to prevent circular dependencies with middlewares
    const { default: getAllAdminsRouter } = await import('./apis/get-all-admins');
    const { default: createAdminRouter } = await import('./apis/create-admin');
    const { default: getAdminByIdRouter } = await import('./apis/get-admin-by-id');
    const { default: updateAdminRouter } = await import('./apis/update-admin');
    const { default: deleteAdminRouter } = await import('./apis/delete-admin');

    // Static routes BEFORE dynamic :id routes
    this.router.use(this.path, getAllAdminsRouter); // GET /admins
    this.router.use(this.path, createAdminRouter); // POST /admins

    // Dynamic ID routes LAST
    this.router.use(this.path, getAdminByIdRouter); // GET /admins/:id
    this.router.use(this.path, updateAdminRouter); // PATCH /admins/:id
    this.router.use(this.path, deleteAdminRouter); // DELETE /admins/:id
  }
}

// Main route export
export default AdminRoute;

export * from './shared/admin-profiles.schema';
export * from './shared/queries';
export * from './shared/validation';
