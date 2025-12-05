import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function updateDischargePlanningOverview() {
    try {
        console.log('🔄 Updating discharge planning recommendation...\n');

        const newOverview = `Standardized discharge planning protocols are critical interventions that ensure patients receive the most appropriate post-acute care setting based on their clinical needs, functional status, and home support systems. These protocols involve collaboration between hospital discharge planners, rehabilitation specialists, and care coordinators to assess each patient's readiness for different levels of care and identify opportunities for home-based rehabilitation when clinically appropriate.

Effective discharge planning programs establish clear criteria for determining when patients can safely receive rehabilitation services at home versus requiring facility-based care. This includes comprehensive assessments of mobility, activities of daily living, cognitive function, caregiver availability, and home environment safety. By implementing evidence-based screening tools and decision algorithms, healthcare organizations can reduce unnecessary admissions to inpatient rehabilitation facilities while ensuring patients still receive the intensive therapy they need.

Research shows that well-designed discharge planning protocols can reduce inappropriate IRF admissions by 25-35% while maintaining or improving patient outcomes. Key success factors include early identification of post-acute care needs (ideally within 24 hours of admission), strong partnerships with discharging hospitals, availability of robust home health services, and ongoing monitoring to ensure patients are progressing appropriately in their chosen care setting.`;

        await sql`
            UPDATE recommendations
            SET program_overview = ${newOverview},
                has_program_details = true
            WHERE title = 'Implement discharge planning protocols for rehab patients'
        `;

        console.log('✅ Updated discharge planning recommendation!\n');

        // Verify
        const updated = await sql`
            SELECT title, 
                   has_program_details,
                   LEFT(program_overview, 100) as overview_preview
            FROM recommendations
            WHERE title = 'Implement discharge planning protocols for rehab patients'
        `;

        console.log('Updated recommendation:');
        console.log(`  Title: ${updated[0].title}`);
        console.log(`  Has program details: ${updated[0].has_program_details}`);
        console.log(`  Overview preview: ${updated[0].overview_preview}...`);

    } catch (error) {
        console.error('❌ Failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

updateDischargePlanningOverview();
