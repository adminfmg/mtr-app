import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

const VALID_STATUS = ['new', 'read', 'replied', 'archived'];

/**
 * GET /api/admin/submissions/[uuid] — detail
 */
export async function GET(req: Request, { params }: { params: Promise<{ uuid: string }> }) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { uuid } = await params;

  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .eq('uuid', uuid)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ inquiry: data });
}

/**
 * PATCH /api/admin/submissions/[uuid] — update status
 * Body: { status: 'new' | 'read' | 'replied' | 'archived' }
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ uuid: string }> }) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { uuid } = await params;
  const body = await req.json();

  if (!body.status || !VALID_STATUS.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('inquiries')
    .update({ status: body.status })
    .eq('uuid', uuid)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ inquiry: data });
}

/**
 * DELETE /api/admin/submissions/[uuid] — hard delete
 * Cuma boleh hard delete kalau status = 'archived' (safety).
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ uuid: string }> }) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { uuid } = await params;

  // Safety check: cuma archived yang boleh hard delete
  const { data: current, error: fetchErr } = await supabase
    .from('inquiries')
    .select('status')
    .eq('uuid', uuid)
    .single();

  if (fetchErr) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
  }

  if (current.status !== 'archived') {
    return NextResponse.json(
      { error: 'Hanya submission yang udah di-archive yang boleh di-delete permanent. Archive dulu sebelum delete.' },
      { status: 400 }
    );
  }

  const { error } = await supabase.from('inquiries').delete().eq('uuid', uuid);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
