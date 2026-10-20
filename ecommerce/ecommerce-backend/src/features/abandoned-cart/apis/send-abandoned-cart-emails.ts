/**
 * POST /api/admin/abandoned-carts/send-email
 * Admin: Send recovery emails for abandoned carts
 */

import { Router, Response } from 'express';
import { HttpException, ResponseFormatter, logger } from '../../../utils';
import { config } from '../../../utils/config/validate-env';
import {
  getAbandonedCartsByIds,
  findNotificationTemplate,
  markCartRecoveryEmailSent,
} from '../shared/queries';
import { deliveryService } from '../../notifications/services/delivery.service';
import { RequestWithUser } from '../../../interfaces';
import { requireAuth, requirePermission } from '../../../middlewares';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { sendAbandonedCartEmailsSchema } from '../shared/validation';

const handler = async (req: RequestWithUser, res: Response) => {
  const { cart_ids, template_id } = req.body;

  // Get carts with user info using centralized query
  const abandonedCarts = await getAbandonedCartsByIds(cart_ids);

  if (abandonedCarts.length === 0) {
    throw new HttpException(404, 'No abandoned carts found');
  }

  // Get template (use default if not specified)
  const template = await findNotificationTemplate(template_id, 'abandoned-cart');

  if (!template) {
    throw new HttpException(404, 'Email template not found or inactive');
  }

  let sentCount = 0;
  let failedCount = 0;
  const results: Array<{ cart_id: string; status: 'success' | 'failed'; error?: string }> = [];

  // Send emails
  for (const cart of abandonedCarts) {
    try {
      // Skip if no email
      if (!cart.customer_email || !cart.user_id) {
        failedCount++;
        results.push({
          cart_id: cart.cart_id,
          status: 'failed',
          error: 'No customer email or user ID',
        });
        continue;
      }

      // Prepare template variables
      const variables = {
        customer_name: cart.customer_name || 'Valued Customer',
        cart_value: parseFloat(cart.grand_total || '0').toFixed(2),
        abandoned_date: cart.abandoned_at
          ? new Date(cart.abandoned_at).toLocaleDateString()
          : 'recently',
        cart_url: `${config.FRONTEND_URL}/cart`,
      };

      // Replace variables in template
      let subject = template.subject || 'Action Required: Your Cart';
      let html = template.body_html || '';
      let text = template.body_text || '';

      for (const [key, value] of Object.entries(variables)) {
        // Simple string replacement for now
        const placeholder = `{{${key}}}`;
        // Use split/join or replaceAll if environment supports it, else global regex
        // Using global regex for safety
        const regex = new RegExp(placeholder, 'g');
        subject = subject.replace(regex, value);
        html = html.replace(regex, value);
        text = text.replace(regex, value);
      }

      // Send email via delivery service
      // Note: deliveryService.sendEmail might vary, adapting to likely interface
      // or if deliveryService expects `deliverNotification` as seen in old code
      // The old code used `deliverNotification`. Let's stick effectively to that or adaptable.

      // Re-evaluating based on previous file read:
      // "await deliveryService.deliverNotification(tempNotificationId, cart.user_id, ['email'], ...)"
      // I should respect that or use a simpler sendEmail if available.
      // The "old" file used `deliverNotification`. I will use `deliverNotification` to be safe and consistent.

      const tempNotificationId = `temp-abandoned-cart-${cart.cart_id}-${Date.now()}`;
      await deliveryService.deliverNotification(tempNotificationId, cart.user_id, ['email'], {
        title: subject,
        message: text,
        emailSubject: subject,
        emailHtml: html,
        emailText: text,
      });

      // Update cart status (recovery email sent)
      await markCartRecoveryEmailSent(cart.cart_id);

      sentCount++;
      results.push({
        cart_id: cart.cart_id,
        status: 'success',
      });

      logger.info('Abandoned cart recovery email sent', {
        cartId: cart.cart_id,
        userId: cart.user_id,
        recipient: cart.customer_email,
      });
    } catch (error) {
      failedCount++;
      logger.error('Failed to send abandoned cart email', {
        cartId: cart.cart_id,
        error: error instanceof Error ? error.message : String(error),
      });
      results.push({
        cart_id: cart.cart_id,
        status: 'failed',
        error: 'Email sending failed',
      });
    }
  }

  return ResponseFormatter.success(
    res,
    {
      total: abandonedCarts.length,
      sent: sentCount,
      failed: failedCount,
      results,
    },
    `Successfully sent ${sentCount} emails`,
  );
};

const router = Router();
router.post(
  '/admin/abandoned-carts/send-email',
  requireAuth,
  requirePermission('orders:write'),
  validationMiddleware(sendAbandonedCartEmailsSchema, 'body'),
  handler,
);

export default router;
