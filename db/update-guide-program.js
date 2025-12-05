import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function updateGuideProgram() {
    try {
        console.log('🔄 Updating GUIDE program...\n');

        await sql`
            UPDATE recommendations
            SET 
                estimated_savings = 120000,
                affected_lives = 87,
                cohort_size = 87
            WHERE title = 'Refer patients with dementia to GUIDE program'
        `;

        console.log('✅ Updated to $120,000 and 87 patients\n');

        // Verify
        const updated = await sql`
            SELECT title, estimated_savings, affected_lives, cohort_size
            FROM recommendations
            WHERE title = 'Refer patients with dementia to GUIDE program'
        `;

        console.log('Updated values:');
        console.log(`  Estimated Savings: $${updated[0].estimated_savings}`);
        console.log(`  Affected Lives: ${updated[0].affected_lives}`);
        console.log(`  Cohort Size: ${updated[0].cohort_size}`);

    } catch (error) {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    }
}

updateGuideProgram();
