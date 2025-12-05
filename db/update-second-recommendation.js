import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function updateSecondRecommendation() {
    try {
        console.log('🔄 Updating second recommendation...\n');

        // Get current top recommendations
        const current = await sql`
            SELECT id, title, priority, estimated_savings
            FROM recommendations
            WHERE priority = 'high'
            ORDER BY estimated_savings DESC NULLS LAST
            LIMIT 3
        `;

        console.log('Current top 3 recommendations:');
        current.forEach((rec, i) => {
            console.log(`  ${i + 1}. ${rec.title} ($${rec.estimated_savings})`);
        });

        const secondRec = current[1]; // Get the second one
        console.log(`\n📝 Updating: "${secondRec.title}"\n`);

        await sql`
            UPDATE recommendations
            SET 
                title = 'Refer patients with dementia to GUIDE program',
                description = 'Enroll eligible dementia patients in the GUIDE program for comprehensive care management and caregiver support.',
                priority = 'high',
                estimated_savings = 73000,
                affected_lives = 45,
                implementation_complexity = 'low',
                patient_cohort = 'Patients with dementia',
                cohort_size = 45,
                status = 'not_started',
                has_program_details = true,
                program_overview = 'The GUIDE program provides comprehensive dementia care management including care coordination, caregiver education and support, and 24/7 access to a care team.',
                can_convert_to_workflow = true,
                workflow_type = 'care_coordination'
            WHERE id = ${secondRec.id}
        `;

        console.log('✅ Second recommendation updated!\n');

        // Verify
        const updated = await sql`
            SELECT title, priority, estimated_savings, affected_lives, patient_cohort
            FROM recommendations
            WHERE id = ${secondRec.id}
        `;

        console.log('Updated recommendation:');
        console.log(`  Title: ${updated[0].title}`);
        console.log(`  Priority: ${updated[0].priority}`);
        console.log(`  Estimated Savings: $${updated[0].estimated_savings}`);
        console.log(`  Affected Lives: ${updated[0].affected_lives}`);
        console.log(`  Patient Cohort: ${updated[0].patient_cohort}`);

    } catch (error) {
        console.error('❌ Failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

updateSecondRecommendation();
