import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface UserSetup {
  email: string;
  password: string;
  first_name: string;
  company_name: string;
  role: 'admin' | 'editor' | 'client';
}

const usersToCreate: UserSetup[] = [
  {
    email: 'f12x.studio@gmail.com',
    password: 'F12XMAGICFIT',
    first_name: 'F12X',
    company_name: 'F12X Studio',
    role: 'editor',
  },
  {
    email: 'sheik.farooq@pushowl.com',
    password: 'F12XMAGICFIT',
    first_name: 'Sheik',
    company_name: 'PushOwl',
    role: 'client',
  },
  {
    email: 'ajayracharla20001@gmail.com',
    password: 'F12XMAGICFIT',
    first_name: 'Ajay',
    company_name: 'F12X Studio',
    role: 'editor',
  },
];

export async function POST(req: NextRequest) {
  try {
    const results = [];

    for (const user of usersToCreate) {
      try {
        // Create user in auth
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

        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: user.email,
            first_name: user.first_name,
            company_name: user.company_name,
            role: user.role,
          });

        if (profileError) {
          results.push({
            email: user.email,
            status: 'error',
            message: `Auth created but profile failed: ${profileError.message}`,
          });
        } else {
          results.push({
            email: user.email,
            status: 'success',
            role: user.role,
          });
        }
      } catch (error: any) {
        results.push({
          email: user.email,
          status: 'error',
          message: error.message,
        });
      }
    }

    return NextResponse.json({
      success: results.every((r) => r.status === 'success'),
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
