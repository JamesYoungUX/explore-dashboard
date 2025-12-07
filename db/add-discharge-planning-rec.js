import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL);

async function addDischargePlanningRecommendation() {
    console.log('Adding discharge planning recommendation...\n');

    // First, check if it already exists
    const existing = await sql`
    SELECT id, title FROM recommendations WHERE title LIKE '%discharge planning%'
  `;

    if (existing.length > 0) {
        console.log('Discharge planning recommendation already exists:');
        existing.forEach(rec => console.log(`  [${rec.id}] ${rec.title}`));
        return;
    }

    // Insert the recommendation
    const newRec = await sql`
    INSERT INTO recommendations (
      title, description, status, priority,
      estimated_savings, affected_lives, implementation_complexity,
      patient_cohort, cohort_size,
      has_program_details, program_overview,
      can_convert_to_workflow, workflow_type
    ) VALUES (
      'Implement discharge planning protocols for rehab patients',
      'Partner with discharging hospitals to implement standardized discharge planning protocols that reduce unnecessary IRF admissions and promote home-based rehab when appropriate.',
      'not_started',
      'high',
      65900,
      148,
      'medium',
      'Post-acute rehab candidates',
      148,
      true,
      'Standardized discharge planning protocols are critical interventions that ensure patients receive the most appropriate post-acute care setting based on their clinical needs, functional status, and home support systems. These protocols involve collaboration between hospital discharge planners, rehabilitation specialists, and care coordinators to assess each patient''s readiness for different levels of care and identify opportunities for home-based rehabilitation when clinically appropriate.

Effective discharge planning programs establish clear criteria for determining when patients can safely receive rehabilitation services at home versus requiring facility-based care. This includes comprehensive assessments of mobility, activities of daily living, cognitive function, caregiver availability, and home environment safety. By implementing evidence-based screening tools and decision algorithms, healthcare organizations can reduce unnecessary admissions to inpatient rehabilitation facilities while ensuring patients still receive the intensive therapy they need.

Research shows that well-designed discharge planning protocols can reduce inappropriate IRF admissions by 25-35% while maintaining or improving patient outcomes. Key success factors include early identification of post-acute care needs (ideally within 24 hours of admission), strong partnerships with discharging hospitals, availability of robust home health services, and ongoing monitoring to ensure patients are progressing appropriately in their chosen care setting.',
      true,
      'care_coordination'
    )
    RETURNING id, title
  `;

    console.log(`Created recommendation: [${newRec[0].id}] ${newRec[0].title}\n`);

    // Link it to acute-rehab category (YTD period)
    const acuteRehabCategory = await sql`
    SELECT id, category_name, slug
    FROM cost_categories
    WHERE slug = 'acute-rehab'
      AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')
    LIMIT 1
  `;

    if (acuteRehabCategory.length === 0) {
        console.log('ERROR: Could not find acute-rehab category for YTD period');
        return;
    }

    console.log(`Linking to category: ${acuteRehabCategory[0].category_name} (ID: ${acuteRehabCategory[0].id})\n`);

    // Create the linkage
    await sql`
    INSERT INTO recommendation_cost_categories (recommendation_id, cost_category_id, impact_amount)
    VALUES (${newRec[0].id}, ${acuteRehabCategory[0].id}, 65900)
  `;

    console.log('✅ Successfully linked recommendation to acute-rehab category!');

    // Verify the linkage
    const verification = await sql`
    SELECT 
      r.id,
      r.title,
      r.estimated_savings,
      cc.category_name,
      rcc.impact_amount
    FROM recommendations r
    JOIN recommendation_cost_categories rcc ON r.id = rcc.recommendation_id
    JOIN cost_categories cc ON rcc.cost_category_id = cc.id
    WHERE r.id = ${newRec[0].id}
  `;

    console.log('\nVerification:');
    verification.forEach(v => {
        console.log(`  [${v.id}] ${v.title}`);
        console.log(`    → ${v.category_name}: $${v.impact_amount}`);
        console.log(`    → Total estimated savings: $${v.estimated_savings}`);
    });
}

addDischargePlanningRecommendation().catch(console.error);
