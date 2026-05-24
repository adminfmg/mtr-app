import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/shared/supabase/server';
import { requireAdmin } from '@/lib/admin/auth';

// Pool nama mix ethnic (200+ first names + 150+ last names)
const FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth',
  'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen',
  'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Helen', 'Mark', 'Sandra',
  'Wei', 'Li', 'Zhang', 'Liu', 'Chen', 'Yang', 'Huang', 'Zhao', 'Wu', 'Zhou',
  'Hiroshi', 'Yuki', 'Takeshi', 'Akiko', 'Kenji', 'Sakura', 'Daisuke', 'Mei',
  'Min-jun', 'Seo-yeon', 'Ji-ho', 'Soo-bin', 'Hyun-woo', 'Ji-woo',
  'Aarav', 'Aditi', 'Arjun', 'Diya', 'Vihaan', 'Anaya', 'Reyansh', 'Saanvi', 'Krishna', 'Aanya',
  'Mohammed', 'Fatima', 'Ahmed', 'Aisha', 'Omar', 'Layla', 'Khalid', 'Noor', 'Yusuf', 'Zara',
  'Carlos', 'Maria', 'Juan', 'Sofia', 'Diego', 'Isabella', 'Luis', 'Camila', 'Miguel', 'Valentina',
  'Hans', 'Anna', 'Klaus', 'Greta', 'Stefan', 'Ingrid', 'Erik', 'Astrid',
  'Pierre', 'Claire', 'Antoine', 'Camille', 'Lucas', 'Manon', 'Hugo', 'Léa',
  'Alessandro', 'Giulia', 'Marco', 'Sofia', 'Luca', 'Martina', 'Matteo', 'Chiara',
  'Ivan', 'Anastasia', 'Dmitri', 'Olga', 'Sergei', 'Natasha', 'Mikhail', 'Elena',
  'Adebayo', 'Chioma', 'Kwame', 'Amara', 'Tunde', 'Zola', 'Kofi', 'Nia',
  'Budi', 'Siti', 'Agus', 'Dewi', 'Hadi', 'Nur', 'Andi', 'Sri',
  'Nguyen', 'Linh', 'Tran', 'Mai', 'Pham', 'Hoa', 'Le', 'Anh',
  'Somchai', 'Ploy', 'Anan', 'Nan', 'Niran', 'Mali',
  'Lukas', 'Emma', 'Noah', 'Mia', 'Liam', 'Olivia', 'Ethan', 'Ava', 'Oliver', 'Sophia',
  'Mason', 'Charlotte', 'Logan', 'Amelia', 'Jacob', 'Harper', 'Lucas', 'Evelyn', 'Aiden', 'Abigail',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Wang', 'Li', 'Zhang', 'Liu', 'Chen', 'Yang', 'Huang', 'Zhao', 'Wu', 'Zhou',
  'Tanaka', 'Suzuki', 'Yamamoto', 'Sato', 'Watanabe', 'Ito', 'Nakamura',
  'Kim', 'Park', 'Choi', 'Jung', 'Kang', 'Yoon', 'Jang',
  'Patel', 'Singh', 'Kumar', 'Sharma', 'Gupta', 'Mehta', 'Reddy', 'Shah',
  'Al-Hassan', 'Al-Said', 'Khan', 'Rahman', 'Hussain', 'Malik', 'Hassan', 'Ali',
  'Silva', 'Santos', 'Rodriguez', 'Fernandez', 'Gomez', 'Diaz', 'Reyes', 'Cruz',
  'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner',
  'Dubois', 'Martin', 'Bernard', 'Robert', 'Petit', 'Durand', 'Leroy',
  'Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo',
  'Ivanov', 'Petrov', 'Sokolov', 'Volkov', 'Popov', 'Kozlov', 'Lebedev',
  'Okonkwo', 'Adeyemi', 'Mensah', 'Nkrumah', 'Diallo', 'Mwangi',
  'Wijaya', 'Saputra', 'Pratama', 'Setiawan', 'Hartono', 'Kusuma',
  'Tran', 'Pham', 'Hoang', 'Vo', 'Phan', 'Truong', 'Bui',
  'Andersen', 'Nielsen', 'Hansen', 'Larsen', 'Olsen', 'Bergmann',
];

const EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'protonmail.com', 'icloud.com'];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateGuestData(): { name: string; email: string } {
  const firstName = randomItem(FIRST_NAMES);
  const lastName = randomItem(LAST_NAMES);
  const name = `${firstName} ${lastName}`;

  // email format: firstname.lastname[number]@domain
  const emailLocal = `${firstName.toLowerCase().replace(/[^a-z]/g, '')}.${lastName.toLowerCase().replace(/[^a-z]/g, '')}${randomInt(1, 999)}`;
  const email = `${emailLocal}@${randomItem(EMAIL_DOMAINS)}`;

  return { name, email };
}

interface BulkBody {
  broker_uuid: string;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  preview?: boolean; // true = ga insert, return sample doang
}

export async function POST(req: NextRequest) {
  try {
    const adminUser = await requireAdmin();
    const body: BulkBody = await req.json();
    const { broker_uuid, distribution, preview } = body;

    if (!broker_uuid) {
      return NextResponse.json({ error: 'broker_uuid required' }, { status: 400 });
    }

    if (!distribution || typeof distribution !== 'object') {
      return NextResponse.json({ error: 'distribution required' }, { status: 400 });
    }

    const totalReviews =
      (distribution[5] || 0) +
      (distribution[4] || 0) +
      (distribution[3] || 0) +
      (distribution[2] || 0) +
      (distribution[1] || 0);

    if (totalReviews < 1) {
      return NextResponse.json({ error: 'Total must be at least 1' }, { status: 400 });
    }

    if (totalReviews > 10000) {
      return NextResponse.json({ error: 'Max 10,000 reviews per batch' }, { status: 400 });
    }

    // Build review rows
    const batchId = crypto.randomUUID();
    const now = new Date().toISOString();
    const rows: Array<Record<string, unknown>> = [];

    for (const star of [5, 4, 3, 2, 1] as const) {
      const count = distribution[star] || 0;
      for (let i = 0; i < count; i++) {
        const { name, email } = generateGuestData();
        rows.push({
          broker_uuid,
          rating: star,
          review_text: '—', // placeholder kosong, atau lo bisa generate template review nanti
          guest_name: name,
          guest_email: email,
          status: 'approved',
          source: 'admin',
          approved_at: now,
          approved_by: adminUser.user.id,
          batch_id: batchId,
        });
      }
    }

    // Preview mode: return 5 sample tanpa insert
    if (preview) {
      const sample = rows.slice(0, 5).map((r) => ({
        rating: r.rating,
        guest_name: r.guest_name,
        guest_email: r.guest_email,
      }));
      return NextResponse.json({
        preview: true,
        total: totalReviews,
        sample,
      });
    }

    // Real insert — batch per 500
    const supabase = createClient();
    const BATCH_SIZE = 500;
    let inserted = 0;

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const chunk = rows.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from('broker_reviews').insert(chunk);

      if (error) {
        console.error('Bulk insert error:', error.message);
        return NextResponse.json(
          {
            error: `Failed at batch ${i / BATCH_SIZE + 1}. Inserted ${inserted} so far. batch_id: ${batchId}`,
          },
          { status: 500 }
        );
      }
      inserted += chunk.length;
    }

    return NextResponse.json({
      success: true,
      total: inserted,
      batch_id: batchId,
    });
  } catch (error) {
    console.error('Bulk reviews error:', error);
    return NextResponse.json({ error: 'Unauthorized or server error' }, { status: 401 });
  }
}