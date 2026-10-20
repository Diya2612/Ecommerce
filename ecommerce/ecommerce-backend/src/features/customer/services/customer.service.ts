import { db } from '../../../database';
import { CreateCustomerDto, UpdateCustomerDto } from '../shared/validation';
import { userService, CreateUserParams } from '../../user/services/user.service';
import { UpdateUserDto } from '../../user/shared/validation';
import { logger, HttpException } from '../../../utils';
import { IUser, sanitizeUser, sanitizeUsers } from '../../user/shared/interface';
import { users } from '../../user/shared/user.schema';
import { eq } from 'drizzle-orm';
import {
  insertCustomerProfile,
  upsertCustomerProfile,
  findUserById,
  findCustomerWithProfile,
  findActiveUserAddresses,
  queryCustomersList,
} from '../shared/queries';

export class CustomerService {
  /** Orchestrates User and Profile creation within a single transaction. */
  async createCustomer(data: CreateCustomerDto): Promise<IUser> {
    // Check for duplicate email before starting transaction
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email.toLowerCase()))
      .limit(1);

    if (existingUser) {
      throw new HttpException(409, 'A customer with this email already exists');
    }

    const newUser = await db.transaction(async (tx) => {
      const userParams: CreateUserParams = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        middle_name: data.middle_name,
        display_name: data.display_name,
        phone_number: data.phone_number,
        tags: data.tags,
        date_of_birth: data.date_of_birth,
        gender: data.gender ? (data.gender.toLowerCase() as CreateUserParams['gender']) : undefined,
        preferred_language: data.preferred_language,
        languages: data.languages,
        profile_image_url: data.profile_image_url,
        secondary_email: data.secondary_email,
        secondary_phone_number: data.secondary_phone_number,
      };

      const user = await userService.createUser(userParams, tx);
      await insertCustomerProfile(tx, user.id, data.segments || ['new'], data.notes);

      return user;
    });


    return newUser;
  }

  /**
   * Updates core user and profile data, performing audit logging for all changed fields.
   * Merges metadata and syncs tags post-update.
   */
  async updateCustomer(
    id: string,
    data: UpdateCustomerDto,
    requesterId: string,
    auditContext: { ipAddress?: string; userAgent?: string } = {},
  ): Promise<IUser> {
    logger.info(`[CustomerService] Updating customer ${id}`);


    await db.transaction(async (tx: any) => {
      const userUpdates: Record<string, unknown> = {};
      const fields = [
        'first_name',
        'middle_name',
        'last_name',
        'email',
        'email_type',
        'phone_number',
        'phone_type',
        'tags',
        'display_name',
        'date_of_birth',
        'gender',
        'profile_image_url',
        'preferred_language',
        'languages',
        'secondary_email',
        'secondary_email_type',
        'secondary_phone_number',
        'secondary_phone_type',
        'email_verified',
        'secondary_email_verified',
      ];

      fields.forEach((field) => {
        if (data[field as keyof UpdateCustomerDto] !== undefined) {
          let val = data[field as keyof UpdateCustomerDto];
          if (val === '') val = null;
          if (field === 'gender' && typeof val === 'string') {
            val = val.toLowerCase();
          }
          userUpdates[field] = val;
        }
      });

      if (data.secondary_email && data.secondary_email_verified === undefined) {
        const { findVerifiedEmailOtp } = await import('../shared/queries');
        const verifiedOtp = await findVerifiedEmailOtp(tx, data.secondary_email);
        if (verifiedOtp?.verified_at) userUpdates.secondary_email_verified = true;
      }

      const currentUser = await findUserById(tx, id);

      if (currentUser) {

        if (data.metadata !== undefined) {
          userUpdates.metadata = { ...((currentUser.metadata as object) || {}), ...data.metadata };
        }
      }

      if (Object.keys(userUpdates).length > 0) {
        await userService.updateCoreUser(id, userUpdates as UpdateUserDto, requesterId, tx);
      }

      const profileUpdates: Record<string, unknown> = {};
      [
        'notes',
        'account_status',
        'marketing_opt_in',
        'sms_opt_in',
        'email_opt_in',
        'whatsapp_opt_in',
        'risk_profile',
      ].forEach((f) => {
        if (data[f as keyof UpdateCustomerDto] !== undefined)
          profileUpdates[f] = data[f as keyof UpdateCustomerDto];
      });

      if (Object.keys(profileUpdates).length > 0) {
        await upsertCustomerProfile(tx, id, profileUpdates);
      }
    });




    return await userService.updateCoreUser(id, {}, requesterId);
  }

  /** Performs a soft delete and decrements tag usage. */
  async deleteCustomer(id: string, adminId: string): Promise<void> {
    await db.transaction(async (tx: any) => {
      await userService.softDeleteUser(id, adminId, tx);
    });
  }

  /** Retrieves a fully populated customer record (User + Profile + Addresses). */
  async getCustomerById(id: string) {
    const result = await findCustomerWithProfile(db, id);
    if (!result) throw new HttpException(404, 'Customer not found');

    const { user, customerProfile } = result;
    const addresses = await findActiveUserAddresses(db, id);

    return {
      ...sanitizeUser(user),
      details: customerProfile || null,
      addresses,
      profileType: customerProfile ? 'individual' : 'none',
    };
  }

  /** Lists customers with search/filter results and associated metadata. */
  async getCustomers(page = 1, limit = 20, filters: any = {}) {
    const { total, allUsers, addressesMap, orderCountsMap } = await queryCustomersList(
      page,
      limit,
      filters,
    );

    const formattedUsers = allUsers.map(({ user, customerProfile, totalOrders }) => ({
      ...sanitizeUsers([user])[0],
      details: customerProfile || null,
      profileType: customerProfile ? 'individual' : 'none',
      addresses: addressesMap[user.id] || [],
      total_orders: Number(totalOrders || orderCountsMap[user.id] || 0),
      gender: user.gender,
    }));

    return { users: formattedUsers, total, page, limit };
  }

  /**
   * Get comprehensive activity timeline for a customer
   */
  async getCustomerActivity(userId: string, limit: number, offset: number, category: string) {
    const { queryCustomerActivity } = await import('../shared/queries');

    const { activitiesResult, countResult } = await queryCustomerActivity(
      userId,
      limit,
      offset,
      category,
    );

    const activities = (activitiesResult.rows as any[]).map((row) => ({
      id: row.id,
      type: row.activity_type,
      title: row.title,
      description: row.description,
      amount: row.amount,
      timestamp: row.formatted_time,
      category: row.category,
      raw_timestamp: row.activity_timestamp,
    }));

    const total = parseInt((countResult.rows[0] as any)?.total || '0', 10);

    return { activities, total };
  }

  /**
   * Get customer statistics (Total, Active, Inactive)
   */
  async getCustomerMetrics() {
    const { queryCustomerMetrics } = await import('../shared/queries');

    const { total, active } = await queryCustomerMetrics();
    const inactive = total - active;

    return { total, active, inactive };
  }

  /**
   * Bulk delete customers
   */
  async bulkDeleteCustomers(ids: string[], requesterId: string) {
    const { softDeleteUsersByIds } = await import('../shared/queries');
    const { customerCacheService } = await import('./customer-cache.service');

    const result = await softDeleteUsersByIds(ids, requesterId);

    // Invalidate cache for deleted users
    await Promise.all(result.map((u) => customerCacheService.invalidateCustomer(u.id)));

    return result;
  }
}

export const customerService = new CustomerService();
