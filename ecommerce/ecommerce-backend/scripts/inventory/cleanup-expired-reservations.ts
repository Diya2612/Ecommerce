/**
 * Manual Cart Reservation Cleanup
 *
 * Forces cleanup of expired cart reservations immediately.
 * Useful when the cron job may have missed some or for manual intervention.
 *
 * Run: npm run ts-node scripts/inventory/cleanup-expired-reservations.ts
 */

import { cleanupExpiredCartReservations } from '../../src/features/inventory/services';
import { logger } from '../../src/utils';

async function runCleanup() {
  console.log('🧹 Starting manual cart reservation cleanup...\n');

  try {
    const count = await cleanupExpiredCartReservations();

    if (count > 0) {
      console.log(`✅ Successfully released ${count} expired cart reservations\n`);
      logger.info(`Manual cleanup: released ${count} expired reservations`);
    } else {
      console.log('✅ No expired reservations found - all clean!\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    logger.error('Manual cleanup failed:', error);
    process.exit(1);
  }
}

runCleanup();
