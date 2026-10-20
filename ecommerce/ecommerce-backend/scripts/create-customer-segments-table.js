const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:Harshal%401231@db.dignrkmjoogibuarnxvs.supabase.co:5432/postgres'
});

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customer_segments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        segment_name VARCHAR(255),
        code VARCHAR(50),
        description TEXT,
        segment_type VARCHAR(50) NOT NULL DEFAULT 'dynamic',
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        priority INTEGER DEFAULT 1,
        match_type VARCHAR(20) DEFAULT 'all',
        auto_refresh BOOLEAN DEFAULT true,
        rules JSONB DEFAULT '[]',
        criteria JSONB DEFAULT '{}',
        tags TEXT[] DEFAULT '{}',
        customer_ids UUID[] DEFAULT '{}',
        selected_user_ids JSONB DEFAULT '[]',
        filtered_users_count INTEGER DEFAULT 0,
        customer_count INTEGER DEFAULT 0,
        notes TEXT,
        created_by VARCHAR(255) DEFAULT 'System Admin',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_deleted BOOLEAN DEFAULT FALSE
      );
    `);
    console.log('Created customer_segments table successfully');

    // Check existing
    const existing = await pool.query('SELECT count(*) FROM customer_segments');
    if (parseInt(existing.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO customer_segments (name, segment_name, code, description, segment_type, status, priority, filtered_users_count, tags, rules)
        VALUES 
        ('VIP Carrom Enthusiasts', 'VIP Carrom Enthusiasts', 'VIP-CARROM', 'High-volume buyers who frequently purchase championship carrom boards', 'dynamic', 'active', 1, 12, ARRAY['vip', 'boards'], '[{"field": "total_spent", "operator": "gte", "value": "5000"}]'::jsonb),
        ('New Customers', 'New Customers', 'NEW-2026', 'Customers who registered in the last 30 days', 'dynamic', 'active', 2, 20, ARRAY['new', 'onboarding'], '[{"field": "created_at", "operator": "last_30_days", "value": ""}]'::jsonb),
        ('Tournament & Club Organizers', 'Tournament & Club Organizers', 'CLUB-ORG', 'Institutional and bulk buyers purchasing accessories and coins in bulk', 'static', 'active', 3, 5, ARRAY['bulk', 'b2b'], '[]'::jsonb);
      `);
      console.log('Seeded 3 customer segments');
    } else {
      console.log('Segments already exist:', existing.rows[0].count);
    }
  } catch (err) {
    console.error('Error creating customer_segments table:', err);
  } finally {
    await pool.end();
  }
}

run();
