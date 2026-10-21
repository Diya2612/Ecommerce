const { Pool } = require('pg');

require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:' + encodeURIComponent('A#Wg)VW,d7H44fA') + '@db.olrbnzxjieogvqauhfwe.supabase.co:5432/postgres'
});

async function grantPermissions() {
  try {
    // 1. Get wildcard permission id
    const permRes = await pool.query("SELECT id FROM permissions WHERE name = '*' LIMIT 1");
    const starPermId = permRes.rows[0].id;
    console.log('Star permission id:', starPermId);

    // 2. Get admin and superadmin roles
    const rolesRes = await pool.query("SELECT id, name FROM roles WHERE name IN ('admin', 'superadmin')");
    const adminRole = rolesRes.rows.find(r => r.name === 'admin');
    const superadminRole = rolesRes.rows.find(r => r.name === 'superadmin');
    console.log('Admin role id:', adminRole.id);
    console.log('Superadmin role id:', superadminRole.id);

    // 3. Make sure admin role also has '*' permission
    await pool.query(
      'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [adminRole.id, starPermId]
    );
    console.log('Granted * permission to admin role');

    // 4. Assign both admin and superadmin roles to admin@gmail.com, admin@example.com, superadmin@gmail.com
    const usersRes = await pool.query("SELECT id, email FROM users WHERE email IN ('admin@gmail.com', 'admin@example.com', 'superadmin@gmail.com')");
    for (const user of usersRes.rows) {
      await pool.query(
        'INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES ($1, $2, $1) ON CONFLICT DO NOTHING',
        [user.id, superadminRole.id]
      );
      await pool.query(
        'INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES ($1, $2, $1) ON CONFLICT DO NOTHING',
        [user.id, adminRole.id]
      );
      console.log('Assigned admin + superadmin roles to:', user.email);
    }

    // 5. Verify user_roles
    const checkRes = await pool.query("SELECT u.email, r.name as role FROM user_roles ur JOIN users u ON ur.user_id = u.id JOIN roles r ON ur.role_id = r.id WHERE u.email IN ('admin@gmail.com', 'admin@example.com', 'superadmin@gmail.com')");
    console.log('Current roles for admin users:', checkRes.rows);

  } catch (err) {
    console.error('Error granting permissions:', err);
  } finally {
    await pool.end();
  }
}

grantPermissions();
