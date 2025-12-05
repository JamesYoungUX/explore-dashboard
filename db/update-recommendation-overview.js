import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function updateRecommendationOverview() {
    try {
        console.log('🔄 Updating care management program overview...\n');

        const newOverview = `Care management programs are evidence-based interventions designed to improve health outcomes for high-risk patients while reducing unnecessary healthcare utilization. These programs identify patients with complex medical needs, multiple chronic conditions, or frequent hospital admissions and provide them with dedicated care coordinators who serve as their primary point of contact for healthcare navigation.

The core components of an effective care management program include comprehensive health assessments, personalized care planning, medication reconciliation and management, care coordination across providers, patient education and self-management support, and 24/7 access to clinical support. Care coordinators work closely with patients and their families to address barriers to care, ensure follow-up appointments are scheduled and attended, and facilitate communication between specialists and primary care providers.

Research demonstrates that well-implemented care management programs can reduce hospital readmissions by 20-30%, decrease emergency department visits by 15-25%, and improve patient satisfaction scores while generating significant cost savings. The key to success lies in targeting the right patient population, maintaining appropriate care coordinator-to-patient ratios (typically 1:40-50 for high-risk patients), and ensuring strong integration with the broader care team including physicians, specialists, and community resources.`;

        await sql`
            UPDATE recommendations
            SET program_overview = ${newOverview}
            WHERE title = 'Implement a care management program'
        `;

        console.log('✅ Updated care management program overview!\n');

        // Verify
        const updated = await sql`
            SELECT title, 
                   LEFT(program_overview, 100) as overview_preview
            FROM recommendations
            WHERE title = 'Implement a care management program'
        `;

        console.log('Updated recommendation:');
        console.log(`  Title: ${updated[0].title}`);
        console.log(`  Overview preview: ${updated[0].overview_preview}...`);

    } catch (error) {
        console.error('❌ Failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

updateRecommendationOverview();
