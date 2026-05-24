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

// Review text pool per rating level
// Use {broker} as placeholder for broker name
const REVIEW_TEMPLATES = {
  5: [
    'Excellent broker overall. {broker} has been reliable for me.',
    'Very satisfied with {broker}. Fast withdrawals and tight spreads.',
    '{broker} delivers on what they promise. Highly recommended.',
    'Top tier service. Trading on {broker} has been smooth so far.',
    'Best broker I have used. {broker} support is responsive and platform is stable.',
    'Great experience with {broker}. Execution is fast and pricing is fair.',
    'I have been with {broker} for over a year and no issues at all.',
    'Solid choice. {broker} regulation gives me peace of mind.',
    '{broker} stands out for transparency and execution quality.',
    'Five stars. Withdrawals through {broker} are always on time.',
    'Excellent platform. {broker} has everything a serious trader needs.',
    'Reliable broker with strong regulation. {broker} is trustworthy.',
    'Customer service at {broker} is outstanding. Quick and helpful responses.',
    'Spreads on {broker} are competitive, especially on majors.',
    'Trading conditions at {broker} are some of the best in the industry.',
    '{broker} platform is intuitive and rarely has downtime.',
    'My experience with {broker} has been positive from day one.',
    'Highly recommend {broker} to anyone serious about trading.',
    'Great execution speed on {broker}. No issues with slippage.',
    'Funded my account on {broker} easily and started trading right away.',
    'Excellent broker for both beginners and experienced traders.',
    '{broker} keeps improving their service. Very impressed.',
    'No complaints. {broker} does what a broker should do.',
    'Professional service throughout. {broker} is a quality choice.',
    'Been trading with {broker} for years. Never had a major issue.',
    'Fast onboarding and verification at {broker}. Smooth process.',
    'Mobile app for {broker} works perfectly. Easy to trade on the go.',
    'Educational resources at {broker} are actually useful.',
    'Tight spreads, fast execution, regulated. {broker} ticks all boxes.',
    'Very happy with {broker}. Recommended to my trading group.',
  ],
  4: [
    'Good broker overall. {broker} has minor issues but nothing major.',
    'Satisfied with {broker}. A few improvements could be made.',
    '{broker} is solid but spreads could be slightly tighter.',
    'Good experience with {broker}. Support responds within hours not minutes.',
    'Reliable platform. {broker} occasionally lags during news events.',
    'Decent broker. {broker} offers what most traders need.',
    'Happy with {broker} so far. Withdrawals take a day or two.',
    'Trading on {broker} is straightforward. Nothing flashy but it works.',
    'Good regulation and decent pricing at {broker}.',
    '{broker} platform is fine. Could use more chart customization options.',
    'Solid choice for retail traders. {broker} delivers consistent service.',
    'No major complaints about {broker}. Just a few quirks here and there.',
    'Generally happy with {broker}. Mobile app could be better.',
    'Good broker for the price. {broker} suits my trading style.',
    'Decent platform. {broker} support is helpful most of the time.',
    'I like {broker} but their spread on exotics is a bit wide.',
    '{broker} has been reliable. Just wish they had more instruments.',
    'Pretty good overall. {broker} occasional platform updates are nice.',
    'Good broker. {broker} could improve their educational content.',
    'Solid experience with {broker}. No regrets switching to them.',
    'Trading with {broker} is okay. Execution is generally fast.',
    '{broker} works well for swing trading. Less ideal for scalping.',
    'Happy with {broker} regulation status. Trust is important.',
    'Good broker overall. {broker} pricing is competitive for most pairs.',
    'Reasonable broker. {broker} delivers on the basics.',
    'No major issues at {broker}. Some minor delays during volatile markets.',
    'Decent for the cost. {broker} fees are reasonable.',
    'Generally positive experience with {broker}. Would recommend.',
    'Trading at {broker} feels secure. Just minor UI complaints.',
    'Good broker, but {broker} could expand their crypto offering.',
  ],
  3: [
    'Average broker. {broker} has both strengths and weaknesses.',
    'Mixed feelings about {broker}. Some things work, some do not.',
    'Decent but not exceptional. {broker} is just okay.',
    '{broker} is fine for casual trading. Nothing stands out.',
    'Average experience with {broker}. Nothing to complain about, nothing to praise.',
    'Middle of the road broker. {broker} does the job.',
    'Okay platform. {broker} could be better in several areas.',
    'Neutral on {broker}. Works fine but lacks polish.',
    'Average pricing and execution at {broker}. Standard fare.',
    '{broker} is acceptable but I have seen better.',
    'Mediocre experience. {broker} support takes a while to respond.',
    'Just average. {broker} platform feels a bit outdated.',
    '{broker} works but I would not go out of my way to recommend it.',
    'Decent broker but spreads are not the tightest. {broker} is just okay.',
    'Mixed bag with {broker}. Some good features, some annoying ones.',
    'Average broker for retail. {broker} has room to improve.',
    'Nothing special about {broker}. It functions as expected.',
    'Three stars feels right for {broker}. Not bad, not great.',
    'Trading on {broker} is fine but the experience is forgettable.',
    'Okay for now but considering other options. {broker} is just average.',
    'Mediocre. {broker} verification took longer than expected.',
    '{broker} has potential but execution feels inconsistent.',
    'Average across the board. {broker} delivers basic service.',
    'I expected more from {broker}. It is okay but underwhelming.',
    'Functional but not impressive. {broker} needs to step up.',
    'So-so experience with {broker}. Some features feel half-baked.',
    'Neutral review for {broker}. Not great but not terrible either.',
    'Acceptable broker. {broker} pricing is standard.',
    '{broker} works but customer support could be much better.',
    'Mid-tier broker. {broker} is what you would expect at this level.',
  ],
  2: [
    'Disappointed with {broker}. Several issues during my time there.',
    'Below average broker. {broker} has problems with execution.',
    'Not happy with {broker}. Slow withdrawals are a real issue.',
    'Trading at {broker} has been frustrating. Too many platform glitches.',
    'Poor support response from {broker}. Days to get a reply sometimes.',
    'Many issues with {broker}. Spreads widen too much during news.',
    'Would not recommend {broker}. Better options available.',
    'Frustrating experience with {broker}. Verification took weeks.',
    '{broker} has been disappointing. Execution often slips badly.',
    'Below my expectations. {broker} promises more than it delivers.',
    'Poor experience overall. {broker} needs serious improvement.',
    '{broker} platform crashes too often. Lost trades because of it.',
    'Not impressed with {broker}. Hidden fees were a surprise.',
    'Two stars at best. {broker} has too many issues to ignore.',
    'Disappointing. {broker} customer service is hard to reach.',
    'Considering switching from {broker}. Too many problems lately.',
    'Below average pricing and execution at {broker}.',
    'Frustrating to deal with {broker}. Withdrawal delays are common.',
    'Not satisfied with {broker}. Will look for alternatives soon.',
    'Bad experience with {broker} support. Unhelpful and slow.',
    'Many platform issues at {broker}. Charts freeze regularly.',
    '{broker} has gone downhill. Used to be better than this.',
    'Poor execution during volatile markets. {broker} fails when it matters.',
    'Disappointed. {broker} marketing oversells the actual service.',
    'Will not be using {broker} again. Too many headaches.',
    '{broker} has communication issues. Hard to get clear answers.',
    'Below par broker. {broker} needs to fix several issues.',
    'Trading at {broker} feels risky due to platform instability.',
    'Not worth it. {broker} has better competitors out there.',
    'Frustrated with {broker}. Account issues take forever to resolve.',
  ],
  1: [
    'Terrible experience with {broker}. Would not recommend to anyone.',
    'Avoid {broker}. Withdrawal issues and unresponsive support.',
    'Worst broker I have used. {broker} has serious problems.',
    'Stay away from {broker}. Lost money due to platform errors.',
    '{broker} is a nightmare to deal with. Support never replies.',
    'Horrible experience. {broker} should be reported to regulators.',
    'One star is too generous for {broker}. Awful in every way.',
    'Avoid at all costs. {broker} has questionable practices.',
    '{broker} blocked my withdrawal for no clear reason.',
    'Terrible support and execution at {broker}. Total disappointment.',
    'Worst trading experience ever. {broker} failed on every front.',
    'Do not trust {broker}. Many traders have similar complaints.',
    'Absolutely awful. {broker} cost me real money in slippage.',
    '{broker} is unprofessional and unreliable. Steer clear.',
    'Lost trust in {broker} completely. Multiple account issues.',
    'Avoid {broker}. Their fee structure is misleading.',
    'Horrible broker. {broker} platform constantly disconnects.',
    'Will never use {broker} again. Total waste of time.',
    'Scam-like behavior from {broker}. Be careful.',
    '{broker} is the worst broker I have tried. Many problems.',
    'Stay far away from {broker}. Not worth the risk.',
    'Frustrating and dishonest. {broker} hides fees in fine print.',
    '{broker} stole from me with manipulated spreads. Avoid.',
    'Cannot recommend {broker} to anyone. Save your money.',
    'Terrible from start to finish. {broker} fails at basics.',
    'Avoid {broker} like the plague. Many red flags.',
    'Worst customer service ever at {broker}. Just rude.',
    '{broker} cancelled my profitable trades. Suspicious activity.',
    'Lost confidence in {broker}. They do not honor their terms.',
    'Awful. {broker} should not be allowed to operate.',
  ],
};

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

function generateReviewText(rating: 1 | 2 | 3 | 4 | 5, brokerName: string): string {
  const templates = REVIEW_TEMPLATES[rating];
  const template = randomItem(templates);
  return template.replace(/{broker}/g, brokerName);
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

    // Fetch broker name buat inject ke review template
    const supabase = createClient();
    const { data: brokerData, error: brokerErr } = await supabase
    .from('brokers')
    .select('name')
    .eq('uuid', broker_uuid)
    .single();

    if (brokerErr || !brokerData) {
    return NextResponse.json({ error: 'Broker not found' }, { status: 404 });
    }

    const brokerName = brokerData.name;

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
        review_text: generateReviewText(star, brokerName),
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
        review_text: r.review_text,
    }));
    return NextResponse.json({
        preview: true,
        total: totalReviews,
        sample,
    });
    }

    // Real insert — batch per 500
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