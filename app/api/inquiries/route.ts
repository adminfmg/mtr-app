import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Panggil Resend API Key
const resend = new Resend(process.env.RESEND_API_KEY);

// Panggil Supabase pakai service key biar bisa insert bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      form_type, 
      name, 
      email, 
      phone_number, 
      message, 
      topic, 
      website_url, 
      ib_affiliate_type 
    } = body;

    // 1. Insert Data ke Table Inquiries Supabase
    const { error: dbError } = await supabase
      .from('inquiries')
      .insert([
        {
          form_type, // Isinya nanti 'trader', 'broker', atau 'ib_affiliate'
          name,
          email,
          phone_number: phone_number || null,
          message,
          topic: topic || null,
          website_url: website_url || null,
          ib_affiliate_type: ib_affiliate_type || null,
          status: 'new'
        }
      ]);

    if (dbError) throw new Error(`Database Error: ${dbError.message}`);

    // 2. Kirim Email Notifikasi via Resend
    // 'onboarding@resend.dev' dipakai buat testing awal karena domain lo belum diverifikasi di Resend
    await resend.emails.send({
      from: 'MTR Notifications <onboarding@resend.dev>', 
      to: 'ja@finmediagroup.com',
      subject: `[MTR] New ${form_type.toUpperCase()} Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #00A86B;">New Inquiry Submitted</h2>
          <p><strong>Form Type:</strong> ${form_type}</p>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone_number || '-'}</p>
          <p><strong>Topic / Type:</strong> ${topic || ib_affiliate_type || '-'}</p>
          <p><strong>Website URL:</strong> ${website_url || '-'}</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <p><strong>Message:</strong></p>
          <p style="background: #f9f9f9; padding: 15px; border-radius: 5px;">${message}</p>
        </div>
      `
    });

    // Balikin response sukses ke Frontend
    return NextResponse.json({ success: true, message: 'Inquiry submitted successfully!' });

  } catch (error: any) {
    console.error('API /inquiries error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}