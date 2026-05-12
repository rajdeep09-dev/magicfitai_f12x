import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const users = [
  {
    email: 'f12x.studio@gmail.com',
    password: 'F12XMAGICFIT',
    role: 'editor',
    first_name: 'F12X',
    company_name: 'F12X Studio',
  },
  {
    email: 'sheik.farooq@pushowl.com',
    password: 'F12XMAGICFIT',
    role: 'client',
    first_name: 'Sheik',
    company_name: 'PushOwl',
  },
  {
    email: 'ajayracharla20001@gmail.com',
    password: 'F12XMAGICFIT',
    role: 'editor',
    first_name: 'Ajay',
    company_name: 'F12X Studio',
  },
];

async function setupDatabase() {
  try {
    console.log('Starting database setup...');

    // Read and execute migration SQL
    const migrationPath = path.join(__dirname, '../supabase/migrations/001_create_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    console.log('Executing migration...');
    const { error: migrationError } = await supabase.rpc('exec', {
      sql_string: migrationSQL,
    }).catch(() => ({ error: 'Migration execution skipped - manual setup required' }));

    if (migrationError) {
      console.warn('Migration note:', migrationError);
    } else {
      console.log('Migration completed successfully');
    }

    // Create users
    console.log('Creating user accounts...');
    for (const user of users) {
      try {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
        });

        if (authError) {
          console.log(`User ${user.email} might already exist: ${authError.message}`);
          
          // Try to get existing user
          const { data: existingUsers } = await supabase.auth.admin.listUsers();
          const existingUser = existingUsers?.users?.find(u => u.email === user.email);
          
          if (existingUser) {
            // Create profile for existing user
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert(
                {
                  id: existingUser.id,
                  email: user.email,
                  first_name: user.first_name,
                  company_name: user.company_name,
                  role: user.role,
                  is_active: true,
                },
                { onConflict: 'id' }
              );

            if (profileError) {
              console.error(`Error creating profile for ${user.email}:`, profileError);
            } else {
              console.log(`Profile created for ${user.email} with role: ${user.role}`);
            }
          }
        } else if (authData?.user) {
          // Create profile for new user
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: user.email,
              first_name: user.first_name,
              company_name: user.company_name,
              role: user.role,
              is_active: true,
            });

          if (profileError) {
            console.error(`Error creating profile for ${user.email}:`, profileError);
          } else {
            console.log(`User created: ${user.email} with role: ${user.role}`);
          }
        }
      } catch (error) {
        console.error(`Error setting up user ${user.email}:`, error);
      }
    }

    console.log('Database setup completed!');
    console.log('Please run this script to initialize tables and users.');
    console.log('To execute: npx ts-node scripts/setup-database.ts');
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
