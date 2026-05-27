import { NextResponse } from 'next/server';
import { createClient } from '@/lib/shared/supabase/server';
import { getAdminUser } from '@/lib/admin/auth';

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function POST(req: Request) {
  const session = await getAdminUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const supabase = createClient();
    
    let finalBrokerUuid = body.broker_uuid;

    // LOGIC AUTO-CREATE BROKER SILUMAN
    if (!finalBrokerUuid && body.new_broker_name) {
      const slug = generateSlug(body.new_broker_name);
      
      const { data: newBroker, error: brokerErr } = await supabase
        .from('brokers')
        .insert({
          name: body.new_broker_name,
          slug: slug,
          is_published: false, // JADI SILUMAN
          created_by: session.user.id
        })
        .select('uuid')
        .single();

      if (brokerErr) throw new Error(`Gagal create broker: ${brokerErr.message}`);
      finalBrokerUuid = newBroker.uuid;
    }

    delete body.new_broker_name; // Hapus sebelum di-insert ke ib_affiliates
    body.broker_uuid = finalBrokerUuid;

    const { data, error } = await supabase
      .from('ib_affiliates')
      .insert(body)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, ibAffiliate: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}