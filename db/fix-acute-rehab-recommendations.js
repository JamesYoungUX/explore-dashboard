import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL);

async function fixAcuteRehabRecommendations() {
    console.log('Fixing Acute Rehab recommendations to match $229,500 variance...\n');

    // Get acute-rehab category
    const cat = await sql`
    SELECT id, spending_variance_amount 
    FROM cost_categories 
    WHERE slug = 'acute-rehab' 
    AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')
  `;

    const targetVariance = parseFloat(cat[0].spending_variance_amount);
    console.log(`Target variance: $${targetVariance}\n`);

    // First, add the missing "Urgent care" recommendation (#4)
    const urgentCare = await sql`
    SELECT id FROM recommendations WHERE title LIKE '%urgent care%'
  `;

    if (urgentCare.length === 0) {
        console.log('Adding urgent care recommendation...');
        const newRec = await sql`
      INSERT INTO recommendations (
        title, description, status, priority,
        estimated_savings, affected_lives, implementation_complexity,
        patient_cohort, cohort_size,
        has_program_details, program_overview, video_url,
        can_convert_to_workflow, workflow_type
      ) VALUES (
        'Launch extended-hours urgent care program',
        'Establish extended-hours urgent care access (evenings and weekends) to divert non-emergency ED visits to lower-cost settings.',
        'accepted',
        'high',
        24000,
        780,
        'high',
        'High ED utilizers',
        285,
        true,
        'Extended-hours urgent care program provides same-day access for urgent but non-emergency conditions.',
        'https://vimeo.com/example123',
        true,
        'care_access'
      )
      RETURNING id
    `;
        console.log(`Created recommendation #${newRec[0].id}\n`);
    }

    // Now update the impact amounts to total $229,500
    // We'll distribute it proportionally across 3 recommendations:
    // 1. Care management: $80,000 (35%)
    // 2. Discharge planning: $125,500 (55%) - highest impact as it's most relevant
    // 3. Urgent care: $24,000 (10%)

    console.log('Updating impact amounts to total $229,500:\n');

    // Delete existing mappings for acute-rehab
    await sql`
    DELETE FROM recommendation_cost_categories
    WHERE cost_category_id = ${cat[0].id}
  `;

    // Add updated mappings
    await sql`
    INSERT INTO recommendation_cost_categories (recommendation_id, cost_category_id, impact_amount)
    VALUES 
      (1, ${cat[0].id}, 80000),
      (3, ${cat[0].id}, 125500),
      (4, ${cat[0].id}, 24000)
  `;

    console.log('  [1] Care management: $80,000');
    console.log('  [3] Discharge planning: $125,500');
    console.log('  [4] Urgent care: $24,000');
    console.log('  Total: $229,500 ✓\n');

    // Verify
    const verification = await sql`
    SELECT 
      r.id,
      r.title,
      rcc.impact_amount
    FROM recommendations r
    JOIN recommendation_cost_categories rcc ON r.id = rcc.recommendation_id
    WHERE rcc.cost_category_id = ${cat[0].id}
    ORDER BY rcc.impact_amount DESC
  `;

    console.log('Verification:');
    let total = 0;
    verification.forEach(v => {
        const amt = parseFloat(v.impact_amount);
        total += amt;
        console.log(`  [${v.id}] ${v.title}: $${v.impact_amount}`);
    });
    console.log(`\nTotal: $${total}`);
    console.log(`✅ Matches variance: ${total === targetVariance}`);
}

fixAcuteRehabRecommendations().catch(console.error);
