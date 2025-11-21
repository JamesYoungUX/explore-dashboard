import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config();

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  try {
    console.log('Creating tables...');

    // Create practice_config table
    await sql`
      CREATE TABLE IF NOT EXISTS practice_config (
        id SERIAL PRIMARY KEY,
        panel_size INTEGER NOT NULL DEFAULT 1522,
        total_quality_bonus DECIMAL(10,2) NOT NULL DEFAULT 350000,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ practice_config table created');

    // Create gap_type_metrics table
    await sql`
      CREATE TABLE IF NOT EXISTS gap_type_metrics (
        id SERIAL PRIMARY KEY,
        gap_type VARCHAR(100) NOT NULL UNIQUE,
        quality_measure VARCHAR(200),
        current_rate DECIMAL(5,2) NOT NULL,
        target_rate DECIMAL(5,2) NOT NULL,
        top_performer_rate DECIMAL(5,2) NOT NULL,
        bonus_weight DECIMAL(5,2) NOT NULL,
        eligible_percent DECIMAL(5,2) NOT NULL,
        revenue_per_closure DECIMAL(10,2),
        expected_roi TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ gap_type_metrics table created');

    // Create gap_interventions table
    await sql`
      CREATE TABLE IF NOT EXISTS gap_interventions (
        id SERIAL PRIMARY KEY,
        gap_type_id INTEGER REFERENCES gap_type_metrics(id) ON DELETE CASCADE,
        intervention_text TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ gap_interventions table created');

    // Create dashboard_suggestions table
    await sql`
      CREATE TABLE IF NOT EXISTS dashboard_suggestions (
        id SERIAL PRIMARY KEY,
        category VARCHAR(50) NOT NULL,
        suggestion_text TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ dashboard_suggestions table created');

    // Insert default practice config
    await sql`
      INSERT INTO practice_config (panel_size, total_quality_bonus)
      VALUES (1522, 350000)
      ON CONFLICT DO NOTHING
    `;
    console.log('✓ Practice config inserted');

    // Insert gap type metrics
    const gapTypes = [
      ['Annual Wellness Visit', 'AWV Completion Rate', 68, 85, 92, 15, 100, 175, 'Closing 17% gap protects $52,500 of quality bonus'],
      ['Diabetic Eye Exam', 'Diabetes Eye Exam Rate', 58, 75, 88, 12, 25, 85, 'Closing 17% gap protects $42,000 of quality bonus'],
      ['HbA1c Test', 'Diabetes HbA1c Control', 72, 85, 91, 12, 25, 45, 'Closing 13% gap protects $42,000 of quality bonus'],
      ['Mammogram', 'Breast Cancer Screening', 64, 80, 87, 10, 35, 125, 'Closing 16% gap protects $35,000 of quality bonus'],
      ['Colonoscopy', 'Colorectal Cancer Screening', 55, 75, 82, 10, 60, 350, 'Closing 20% gap protects $35,000 of quality bonus'],
      ['Bone Density Scan', 'Osteoporosis Screening', 48, 70, 78, 5, 30, 95, 'Closing 22% gap protects $17,500 of quality bonus'],
      ['Flu Vaccination', 'Influenza Immunization', 62, 80, 89, 8, 100, 35, 'Closing 18% gap protects $28,000 of quality bonus'],
      ['Blood Pressure Check', 'Blood Pressure Control', 71, 85, 90, 10, 45, 25, 'Closing 14% gap protects $35,000 of quality bonus'],
      ['Lipid Panel', 'Statin Therapy Adherence', 66, 80, 86, 6, 35, 40, 'Closing 14% gap protects $21,000 of quality bonus'],
      ['Cardiac Stress Test', 'CAD Management', 52, 75, 81, 5, 15, 450, 'Closing 23% gap protects $17,500 of quality bonus'],
      ['Pneumonia Vaccine', 'Pneumococcal Vaccination', 58, 80, 88, 7, 50, 45, 'Closing 22% gap protects $24,500 of quality bonus']
    ];

    for (const gt of gapTypes) {
      await sql`
        INSERT INTO gap_type_metrics (gap_type, quality_measure, current_rate, target_rate, top_performer_rate, bonus_weight, eligible_percent, revenue_per_closure, expected_roi)
        VALUES (${gt[0]}, ${gt[1]}, ${gt[2]}, ${gt[3]}, ${gt[4]}, ${gt[5]}, ${gt[6]}, ${gt[7]}, ${gt[8]})
        ON CONFLICT (gap_type) DO NOTHING
      `;
    }
    console.log('✓ Gap type metrics inserted');

    // Interventions data
    const interventions = {
      'Annual Wellness Visit': [
        'Automated appointment reminders 30/14/7 days before due date',
        'Standing orders for MA to schedule during any visit',
        'Dedicated AWV time slots on provider schedules',
        'Patient portal self-scheduling for AWV'
      ],
      'Diabetic Eye Exam': [
        'Retinal camera in-office (eliminates referral barrier)',
        'Auto-schedule eye exam with diabetic visit',
        'Care coordinator follow-up on referral completion',
        'Partner with mobile retinal screening service'
      ],
      'HbA1c Test': [
        'Point-of-care A1c testing at every diabetic visit',
        'Standing lab orders with patient self-scheduling',
        'Pharmacy-based A1c testing partnership',
        'Text reminders with direct lab scheduling link'
      ],
      'Mammogram': [
        'Mobile mammography unit at practice quarterly',
        'Care coordinator to schedule and confirm',
        'Address transportation barriers (ride service)',
        'Same-day mammogram scheduling at referral'
      ],
      'Colonoscopy': [
        'FIT test alternative for colonoscopy-averse patients',
        'Cologuard home testing option',
        'Nurse navigator for colonoscopy scheduling',
        'Address prep concerns with simplified protocols'
      ],
      'Bone Density Scan': [
        'Auto-referral at age 65 or risk factors',
        'Partner with imaging center for priority scheduling',
        'Bundle with AWV appointment',
        'Care gap alert in EHR for eligible patients'
      ],
      'Flu Vaccination': [
        'Standing orders for MA/RN administration',
        'Walk-in flu shot clinics (no appointment)',
        'Pharmacy partnership for overflow',
        'Text blast campaigns in September-October'
      ],
      'Blood Pressure Check': [
        'Home BP monitoring program with device loan',
        'Nurse visits for BP-only checks',
        'Pharmacy BP kiosk integration',
        'Telehealth BP review appointments'
      ],
      'Lipid Panel': [
        'Standing annual lab orders for chronic patients',
        'Fasting lab early AM availability',
        'Home phlebotomy for mobility-limited patients',
        'Auto-schedule labs 1 month before due'
      ],
      'Cardiac Stress Test': [
        'In-office stress testing capability',
        'Cardiology co-management agreement',
        'Care coordinator for scheduling and prep',
        'Patient education on test importance'
      ],
      'Pneumonia Vaccine': [
        'Standing orders for 65+ patients',
        'Bundle with flu shot visits',
        'EHR alert for eligible patients',
        'Pharmacy administration partnership'
      ]
    };

    for (const [gapType, ints] of Object.entries(interventions)) {
      const [gapTypeRow] = await sql`SELECT id FROM gap_type_metrics WHERE gap_type = ${gapType}`;
      if (gapTypeRow) {
        for (let i = 0; i < ints.length; i++) {
          await sql`
            INSERT INTO gap_interventions (gap_type_id, intervention_text, sort_order)
            VALUES (${gapTypeRow.id}, ${ints[i]}, ${i + 1})
          `;
        }
      }
    }
    console.log('✓ Interventions inserted');

    // Insert dashboard suggestions
    const suggestions = [
      ['quality', 'Launch intensive outreach for 411 patients overdue for colorectal screening', 1],
      ['quality', 'Deploy diabetes care managers to high-risk panel', 2],
      ['quality', 'Implement point-of-care quality measure alerts in EMR', 3]
    ];

    for (const s of suggestions) {
      await sql`
        INSERT INTO dashboard_suggestions (category, suggestion_text, sort_order)
        VALUES (${s[0]}, ${s[1]}, ${s[2]})
      `;
    }
    console.log('✓ Dashboard suggestions inserted');

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
