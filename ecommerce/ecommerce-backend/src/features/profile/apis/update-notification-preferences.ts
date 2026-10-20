import { Router, Response } from 'express';
import { eq } from 'drizzle-orm';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth } from '../../../middlewares';
import { ResponseFormatter, HttpException } from '../../../utils';
import { db } from '../../../database';
import { users } from '../../user/shared/user.schema';
import { supabase } from '../../../utils/supabase/client';

const handler = async (req: RequestWithUser, res: Response) => {
  if (!req.userId) {
    throw new HttpException(401, 'Authentication required');
  }

  const [user] = await db
    .select({ auth_id: users.auth_id })
    .from(users)
    .where(eq(users.id, req.userId))
    .limit(1);

  if (!user || !user.auth_id) {
    throw new HttpException(404, 'User not found');
  }

  const body = req.body;
  const preferences = {
    push_notifications: !!body.push_notifications,
    email_notifications: !!body.email_notifications,
    sms_notifications: !!body.sms_notifications,
    security_alerts: !!body.security_alerts,
    order_updates: !!body.order_updates,
    product_updates: !!body.product_updates,
    inventory_alerts: !!body.inventory_alerts,
    marketing_emails: !!body.marketing_emails,
  };

  const { error } = await supabase.auth.admin.updateUserById(user.auth_id, {
    user_metadata: {
      notifications: preferences,
    },
  });

  if (error) {
    throw new HttpException(500, 'Failed to update notification settings');
  }

  ResponseFormatter.success(res, preferences, 'Notification preferences updated');
};

const router = Router();
router.put('/notifications', requireAuth, handler);

export default router;
