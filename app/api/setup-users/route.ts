import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// This API route sets up the three initial user accounts
// WARNING: This should only be run once and then disabled for security
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const password = 'F12XMAGICFIT';

    const usersToCreate = [
      {
        email: 'f12x.studio@gmail.com',
        password,
        role: 'editor',
        first_name: 'F12X',
        company_name: 'F12X Studio',
      },
      {
        email: 'sheik.farooq@pushowl.com',
        password,
        role: 'client',
        first_name: 'Sheik',
        company_name: 'PushOwl',
      },
      {
        email: 'ajayracharla20001@gmail.com',
        password,
        role: 'editor',
        first_name: 'Ajay',
        company_name: 'F12X Studio',
      },
    ];

    const results = [];

    for (const user of usersToCreate) {
      try {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
        });

        if (authError) {
          results.push({
            email: user.email,
            status: 'error',
            message: authError.message,
          });
          continue;
        }

        // Create profile in the database
        if (authData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: user.email,
              role: user.role,
              first_name: user.first_name,
              company_name: user.company_name,
            });

          if (profileError) {
            results.push({
              email: user.email,
              status: 'error',
              message: `Profile creation failed: ${profileError.message}`,
            });
          } else {
            results.push({
              email: user.email,
              status: 'success',
              message: 'User created successfully',
            });
          }
        }
      } catch (error: any) {
        results.push({
          email: user.email,
          status: 'error',
          message: error?.message || 'Unknown error',
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'User setup process completed',
        results,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Setup failed',
      },
      { status: 500 }
    );
  }
}
