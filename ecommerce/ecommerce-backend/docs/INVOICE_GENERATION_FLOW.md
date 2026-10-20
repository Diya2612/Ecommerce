# Invoice Generation Flow

## Overview

The invoice generation system automatically creates and stores PDF invoices for completed orders. The system supports both **automatic** (queue-based) and **lazy** (on-demand) generation strategies.

---

## Architecture

### Components

1. **Backend Service** (`invoice.service.ts`)
   - Generates invoice PDFs using PDFKit
   - Uploads PDFs to Supabase Storage
   - Manages invoice versions and status

2. **Queue System** (BullMQ + Redis)
   - Processes invoice generation events asynchronously
   - Sends email notifications with invoice attachments
   - Handles retries on failure

3. **Frontend** (React + Next.js)
   - Displays invoice download button on order detail page
   - Triggers lazy generation for paid orders without invoices
   - Uses React Query for caching

4. **Storage** (Supabase Storage)
   - Stores invoice PDFs in the `uploads` bucket
   - Organizes files: `invoices/{ORDER_NUMBER}/{YEAR}/{MONTH}/{TIMESTAMP}_{INVOICE_NUMBER}.pdf`
   - Provides public URLs for downloading

---

## Invoice Generation Triggers

### 1. Automatic Generation (Preferred)

**When**: Immediately after payment is captured

**Flow**:
```
Payment Webhook (Razorpay)
  ↓
Payment Service captures payment
  ↓
Publish GENERATE_INVOICE event to queue
  ↓
Invoice Worker processes event
  ↓
Generate PDF + Upload to Storage
  ↓
Send email with invoice attachment
```

**Requirements**:
- `QUEUE_WORKERS_ENABLED=true` in `.env`
- Redis must be connected
- Backend server must be running

**Code Location**: 
- Webhook handler: `src/features/payments/services/payment.service.ts`
  - `handlePaymentCaptured()` - Line ~516
  - `handleOrderPaid()` - Line ~598
- Event publisher: `src/features/queue/services/event-publisher.service.ts`
- Worker: `src/features/queue/services/workers/invoice.worker.ts`

---

### 2. Lazy Generation (Fallback)

**When**: User visits order detail page and no invoice exists

**Flow**:
```
User visits /profile/orders/{id}
  ↓
Frontend calls GET /api/invoices/orders/{id}/invoices/latest
  ↓
Backend checks if invoice exists
  ↓
If missing + order is paid → Generate invoice
  ↓
Return invoice data with PDF URL
  ↓
Frontend displays download button
```

**Requirements**:
- Order must have `payment_status = 'paid'`
- Backend server must be running
- Supabase Storage configured

**Code Location**:
- Frontend: `src/components/features/profile/OrderDetailPage.tsx` (Line ~221)
- API hook: `src/hooks/use-invoices.ts`
- Backend endpoint: `src/features/invoice/apis/get-order-invoice.ts`

---

## Configuration

### Environment Variables

```bash
# Supabase Storage (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your_secret_key
SUPABASE_BUCKET_NAME=uploads  # Default: uploads

# Queue Workers (Optional but recommended)
QUEUE_WORKERS_ENABLED=true

# Redis (Required for queue-based generation)
REDIS_MODE=cloud
REDIS_CLOUD_HOST=your-redis-host
REDIS_CLOUD_PORT=14212
REDIS_CLOUD_PASSWORD=your-redis-password

# Email (For invoice notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Supabase Storage Setup

1. Create a bucket named `uploads` (or configure `SUPABASE_BUCKET_NAME`)
2. Set bucket to **public** to allow direct PDF downloads
3. Verify permissions allow file uploads

**Dashboard URL**: `https://supabase.com/dashboard/project/{PROJECT_ID}/storage/buckets`

---

## Usage

### For Users (Frontend)

1. **Complete an order** with payment (Razorpay or COD)
2. **Navigate to** `/profile/orders`
3. **Click on the order** to view details
4. **Download invoice** button will appear once generated
5. Click **"Download Invoice"** to save PDF

### For Developers (Backend)

#### Check Invoice Status

```bash
# Check which paid orders are missing invoices
npx tsx scripts/diagnostics/check-missing-invoices.ts
```

#### Manually Generate Invoice

```bash
# Generate invoice for a specific order
npx tsx scripts/diagnostics/test-invoice-endpoint.ts <ORDER_ID>
```

#### Verify Storage Configuration

```bash
# Test Supabase Storage connection
npx tsx scripts/diagnostics/verify-storage-bucket.ts
```

#### Test Complete Flow

```bash
# Run full diagnostic
npx tsx scripts/diagnostics/test-invoice-flow.ts
```

---

## Invoice Data Structure

### Invoice Record

```typescript
{
  id: string;                    // UUID
  order_id: string;              // Foreign key to orders table
  invoice_number: string;        // Format: INV-YYYY-MM-NNNNNN
  latest_version: number;        // Current version number
  status: "draft" | "generated" | "sent" | "cancelled";
  created_at: timestamp;
  updated_at: timestamp;
}
```

### Invoice Version

```typescript
{
  id: string;                    // UUID
  invoice_id: string;            // Foreign key to invoices table
  version_number: number;        // Incremental version
  customer_name: string;
  customer_email: string;
  customer_gstin?: string;       // GST number if applicable
  billing_address: string;
  shipping_address: string;
  place_of_supply: string;       // For tax calculation
  subtotal: decimal;
  discount: decimal;
  shipping: decimal;
  tax_amount: decimal;
  grand_total: decimal;
  cgst: decimal;                 // Central GST
  sgst: decimal;                 // State GST
  igst: decimal;                 // Integrated GST
  tax_type: "cgst_sgst" | "igst";
  pdf_url?: string;              // Public URL to PDF
  pdf_path?: string;             // Storage path
  pdf_generated_at?: timestamp;
  reason: "INITIAL" | "CORRECTION" | "REFUND";
  created_at: timestamp;
  updated_at: timestamp;
}
```

### Invoice Line Items

```typescript
{
  id: string;
  invoice_version_id: string;
  product_name: string;
  sku: string;
  hsn_code?: string;             // HSN/SAC code for GST
  quantity: number;
  unit_price: decimal;
  tax_rate: decimal;             // Percentage
  cgst_amount: decimal;
  sgst_amount: decimal;
  igst_amount: decimal;
  line_total: decimal;
  created_at: timestamp;
  updated_at: timestamp;
}
```

---

## Troubleshooting

### Issue: Invoices Not Generating Automatically

**Symptoms**:
- Order payment is confirmed
- User sees "paid" status
- No invoice appears on order detail page

**Diagnosis**:
```bash
# 1. Check if queue workers are running
npx tsx scripts/diagnostics/test-invoice-flow.ts

# 2. Check Redis connection
npx tsx scripts/diagnostics/test-redis-connection.ts

# 3. Check server logs for errors
tail -f logs/info/info.log | grep invoice
```

**Solutions**:
1. **Redis not connected**: 
   - Start Redis server or check cloud Redis credentials
   - Verify `REDIS_CLOUD_HOST`, `REDIS_CLOUD_PORT`, `REDIS_CLOUD_PASSWORD`

2. **Queue workers disabled**:
   - Set `QUEUE_WORKERS_ENABLED=true` in `.env`
   - Restart backend server

3. **Backend not running**:
   - Start backend: `npm run dev` or `npm start`
   - Check server logs for startup errors

4. **Temporary fix** (Lazy generation):
   - Ask user to visit order detail page: `/profile/orders/{id}`
   - Invoice will be generated on demand

---

### Issue: PDF Upload Fails

**Symptoms**:
- Invoice record created in database
- `pdf_url` is NULL
- Server logs show Storage error

**Diagnosis**:
```bash
# Test Supabase Storage connection
npx tsx scripts/diagnostics/verify-storage-bucket.ts
```

**Solutions**:
1. **Bucket doesn't exist**:
   - Create `uploads` bucket in Supabase Dashboard
   - Or change `SUPABASE_BUCKET_NAME` to existing bucket

2. **Invalid credentials**:
   - Verify `SUPABASE_URL` and `SUPABASE_SECRET_KEY`
   - Regenerate keys if expired

3. **Bucket not public**:
   - Set bucket to public in Supabase Dashboard
   - Or update bucket policies

4. **Storage quota exceeded**:
   - Check usage in Supabase Dashboard
   - Upgrade plan or clean up old files

---

### Issue: Frontend Shows No Invoice

**Symptoms**:
- Backend has invoice with PDF URL
- Frontend doesn't show download button
- No API errors in console

**Diagnosis**:
```bash
# Check if invoice exists in database
GET /api/invoices/orders/{ORDER_ID}/invoices/latest
```

**Solutions**:
1. **Order not paid**:
   - Check `payment_status` is 'paid'
   - Complete payment if still pending

2. **React Query cache stale**:
   - Refresh page
   - Clear browser cache

3. **API endpoint issue**:
   - Check browser console for errors
   - Verify order ID is correct
   - Test API endpoint directly with Postman

---

### Issue: Invoice Number Conflicts

**Symptoms**:
- Duplicate invoice numbers
- Database unique constraint error

**Solutions**:
1. Check invoice number generation logic in `invoice.service.ts`
2. Verify database sequence is correct
3. Use database transaction to prevent race conditions

---

## API Reference

### Get Latest Invoice for Order

```http
GET /api/invoices/orders/:orderId/invoices/latest
```

**Authentication**: Required (JWT)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "order_id": "uuid",
    "invoice_number": "INV-2026-03-000001",
    "latest_version": 1,
    "status": "generated",
    "created_at": "2026-03-11T12:00:00Z",
    "updated_at": "2026-03-11T12:00:00Z",
    "latest_version": {
      "id": "uuid",
      "invoice_number": "INV-2026-03-000001",
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "grand_total": "8999.00",
      "pdf_url": "https://kumhwujuaruvuwkkirml.supabase.co/storage/v1/object/public/uploads/invoices/...",
      "pdf_generated_at": "2026-03-11T12:00:00Z",
      "created_at": "2026-03-11T12:00:00Z"
    }
  },
  "message": "Invoice retrieved successfully"
}
```

---

### Download Invoice PDF

```http
GET /api/invoices/:versionId/download
```

**Authentication**: Required (JWT)

**Response**: Binary PDF file

---

### Generate Invoice (Admin Only)

```http
POST /api/admin/invoices/generate
```

**Authentication**: Required (Admin JWT)

**Body**:
```json
{
  "order_id": "uuid",
  "force_new_version": false  // Optional: create new version even if exists
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "invoice_number": "INV-2026-03-000001",
    "pdf_url": "https://..."
  },
  "message": "Invoice generated successfully"
}
```

---

## Best Practices

### For Production

1. **Enable Queue Workers**:
   - Set `QUEUE_WORKERS_ENABLED=true`
   - Use reliable Redis instance (Redis Cloud recommended)
   - Monitor queue health via admin dashboard

2. **Storage Configuration**:
   - Use dedicated Supabase bucket for invoices
   - Set up CDN for faster downloads
   - Implement file retention policy

3. **Error Handling**:
   - Monitor error logs for invoice generation failures
   - Set up alerts for critical errors
   - Implement retry logic for transient failures

4. **Performance**:
   - Generate invoices asynchronously (queue-based)
   - Cache invoice URLs in frontend
   - Use pagination for invoice lists

5. **Security**:
   - Never expose Supabase secret key in frontend
   - Validate user owns order before allowing download
   - Use signed URLs for private documents (optional)

### For Development

1. **Use Lazy Generation**:
   - Simplifies testing without queue workers
   - Faster iteration on invoice design

2. **Test with Local Orders**:
   - Create test orders with different tax scenarios
   - Verify PDF rendering across devices

3. **Diagnostic Scripts**:
   - Run regularly to catch issues early
   - Add custom scripts for specific scenarios

---

## Maintenance

### Bulk Generate Missing Invoices

If multiple orders are missing invoices (e.g., after downtime), generate them in bulk:

```bash
# Create a script to bulk generate
npx tsx scripts/diagnostics/bulk-generate-invoices.ts
```

**Script Template**:
```typescript
import { db } from '../src/database';
import { orders } from '../src/features/orders/shared/orders.schema';
import { invoiceService } from '../src/features/invoice';
import { eq } from 'drizzle-orm';

async function bulkGenerateInvoices() {
  const paidOrders = await db
    .select({ id: orders.id, order_number: orders.order_number })
    .from(orders)
    .where(eq(orders.payment_status, 'paid'));

  for (const order of paidOrders) {
    try {
      console.log(`Generating invoice for ${order.order_number}...`);
      await invoiceService.generateInvoice(order.id);
      console.log(`✅ ${order.order_number}`);
    } catch (error) {
      console.error(`❌ ${order.order_number}:`, error);
    }
  }
}

bulkGenerateInvoices();
```

---

## Related Documentation

- [Order Creation Flow](./order-creation-flow.md)
- [Payment Processing](./payment-processing.md)
- [Supabase Storage Setup](./supabase-storage.md)
- [Queue System Architecture](./queue-architecture.md)

---

## Support

For issues or questions:
1. Check server logs: `logs/info/info.log` and `logs/error/error.log`
2. Run diagnostic scripts in `scripts/diagnostics/`
3. Review this documentation
4. Contact development team with error details
