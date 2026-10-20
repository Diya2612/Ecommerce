import { Router } from 'express';
import { RazorpayService } from '../services/razorpay.service';
import { ResponseFormatter } from '../../../utils';
import { requireAuth } from '../../../middlewares';

/** Retrieves the Razorpay key ID for frontend checkout integration. */
const router = Router();
router.get('/key', requireAuth, (req, res) => {
  ResponseFormatter.success(
    res,
    { key_id: RazorpayService.getKeyId() },
    'Razorpay key ID retrieved successfully',
  );
});

export default router;
