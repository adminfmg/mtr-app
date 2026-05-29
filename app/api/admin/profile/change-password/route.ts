import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient as createAnonClient } from '@supabase/supabase-js';

// POST /api/admin/profile/change-password
// Body: { current_password: string, new_password: string }
//
// Flow:
//   1. Get current session user (via cookie)
//   2. Verify current_password dengan re-sign-in pakai anon client terpisah
//      (biar ga overwrite session cookie yang aktif)
//   3. Kalau valid, update password via auth.updateUser (pakai session yang ada)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { current_password, new_password } = body as {
    current_password?: string;
    new_password?: string;
  };

  if (!current_password || !new_password) {
    return NextResponse.json(
      { error: 'Current and new password are required' },
      { status: 400 }
    );
  }

  if (new_password.length < 8) {
    return NextResponse.json(
      { error: 'New password must be at least 8 characters' },
      { status: 400 }
    );
  }

  if (new_password === current_password) {
    return NextResponse.json(
      { error: 'New password must be different from current password' },
      { status: 400 }
    );
  }

  // 1. Ambil session user dari cookie (pattern same as middleware/auth.ts)
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignore
          }
        },
      },
    }
  );

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // 2. Verify current password — pakai anon client terpisah biar ga
  //    overwrite session cookie utama. Kalau current password salah,
  //    signInWithPassword bakal return error.
  const verifyClient = createAnonClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  const { error: verifyErr } = await verifyClient.auth.signInWithPassword({
    email: user.email,
    password: current_password,
  });

  if (verifyErr) {
    return NextResponse.json(
      { error: 'Current password is incorrect' },
      { status: 400 }
    );
  }

  // 3. Update password pakai session yang aktif (cookie-based)
  const { error: updateErr } = await supabase.auth.updateUser({
    password: new_password,
  });

  if (updateErr) {
    console.error('[profile/change-password] update error:', updateErr);
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
