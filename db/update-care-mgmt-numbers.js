import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function updateCareManagementProgram() {
    try {
        console.log('🔄 Updating care management program recommendation...\n');

        await sql`
            UPDATE recommendations
            SET 
                estimated_savings = 350000,
                affected_lives = 475,
                patient_cohort = 'High need patients',
                cohort_size = 475
            WHERE title = 'Implement a care management program'
        `;

        console.log('✅ Care management program updated!\n');

        // Verify
        const updated = await sql`
            SELECT title, priority, estimated_savings, affected_lives, patient_cohort, cohort_size
            FROM recommendations
            WHERE title = 'Implement a care management program'
        `;

        console.log('Updated recommendation:');
        console.log(`  Title: ${updated[0].title}`);
        console.log(`  Priority: ${updated[0].priority}`);
        console.log(`  Estimated Savings: $${updated[0].estimated_savings.toLocaleString()}`);
        console.log(`  Affected Lives: ${updated[0].affected_lives}`);
        console.log(`  Patient Cohort: ${updated[0].patient_cohort}`);
        console.log(`  Cohort Size: ${updated[0].cohort_size}`);

    } catch (error) {
        console.error('❌ Failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

updateCareManagementProgram();
