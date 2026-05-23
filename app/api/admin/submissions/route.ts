import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

/**
 * GET /api/admin/submissions
 *
 * Query params:
 *   form_type   = 'all' | 'trader' | 'broker' | 'ib_affiliate'
 *   status      = 'all' | 'new' | 'read' | 'replied' | 'archived'
 *   sort        = 'newest' | 'oldest'
 *
 * Auth: middleware `/admin/*` udah handle, jadi endpoint ini aman.
 */
export async function GET(req: Request) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { searchParams } = new URL(req.url);

  const formType = searchParams.get('form_type') || 'all';
  const status = searchParams.get('status') || 'all';
  const sort = searchParams.get('sort') || 'newest';

  let query = supabase.from('inquiries').select('*');

  if (formType !== 'all') {
    query = query.eq('form_type', formType);
  }
  if (status !== 'all') {
    query = query.eq('status', status);
  }

  query = query.order('created_at', { ascending: sort === 'oldest' });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Hitung counts per status (untuk badge di filter)
  const { data: allData } = await supabase
    .from('inquiries')
    .select('status, form_type');

  const counts = {
    total: allData?.length || 0,
    new: allData?.filter((r) => r.status === 'new').length || 0,
    read: allData?.filter((r) => r.status === 'read').length || 0,
    replied: allData?.filter((r) => r.status === 'replied').length || 0,
    archived: allData?.filter((r) => r.status === 'archived').length || 0,
    by_form_type: {
      trader: allData?.filter((r) => r.form_type === 'trader').length || 0,
      broker: allData?.filter((r) => r.form_type === 'broker').length || 0,
      ib_affiliate: allData?.filter((r) => r.form_type === 'ib_affiliate').length || 0,
    },
  };

  return NextResponse.json({ inquiries: data, counts });
}
