import dotenv from 'dotenv';
import path from 'path';

// Load env before anything else
const envPath = path.resolve(process.cwd(), '.env.dev');
dotenv.config({ path: envPath });
console.log('Loaded env from:', envPath);

import seedRBAC from './rbac-seed';
// Mock logger if needed or import real one
import { logger } from '../../src/utils';

seedRBAC()
  .then(() => {
    logger.info('RBAC Seed Done');
    process.exit(0);
  })
  .catch((e) => {
    logger.error(e);
    process.exit(1);
  });
