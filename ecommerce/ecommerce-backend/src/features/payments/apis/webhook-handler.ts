import { Router, Request, Response } from 'express';
import { IRazorpayWebhookEvent } from '../shared/interface';
import { PaymentService } from '../services/payment.service';

/**
 * Processes asynchronous Razorpay events. This is the single source of truth
 * for payment finality, idempotency, and reconciliation.
 */
const handler = async (req: Request, res: Response) => {
  const rawBody = (req as Request & { rawBody?: string }).rawBody;
  const signature = req.headers['x-razorpay-signature'] as string;

  if (!signature || !rawBody) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }

  let event: IRazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ status: 'error', message: 'Invalid JSON' });
  }

  try {
    const result = await PaymentService.processWebhook(rawBody, signature, event);

    // Convert thrown errors in our service methods into proper webhook responses where necessary.
    // However, if processWebhook throws an error, it gets caught here.
    return res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'Invalid signature') {
      return res.status(401).json({ status: 'error', message: 'Invalid signature' });
    }
    return res.status(200).json({ status: 'error', message: error.message });
  }
};

const router = Router();
router.post('/', handler);
export default router;
