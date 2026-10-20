/**
 * Address Feature
 * Central exports and routing for address management.
 */

import { Router } from 'express';
import Route from '../../interfaces/route.interface';

class AddressRoute implements Route {
  public path = '/addresses';
  public router = Router();

  public async init() {
    // Dynamic imports to prevent circular dependencies with middlewares
    const { default: getUserAddressesRouter } = await import('./apis/get-addresses');
    const { default: createUserAddressRouter } = await import('./apis/create-address');
    const { default: updateUserAddressRouter } = await import('./apis/update-address');
    const { default: deleteUserAddressRouter } = await import('./apis/delete-address');
    const { default: setDefaultAddressRouter } = await import('./apis/set-default-address');

    // Routes are nested under /users/:userId/addresses in the main router
    this.router.use(this.path, getUserAddressesRouter);
    this.router.use(this.path, createUserAddressRouter);
    this.router.use(this.path, setDefaultAddressRouter);
    this.router.use(this.path, updateUserAddressRouter);
    this.router.use(this.path, deleteUserAddressRouter);
  }
}

// Routes
export default AddressRoute;

// Shared resources
export * from './shared/addresses.schema';
