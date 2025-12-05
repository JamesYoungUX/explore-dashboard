import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function updateTopRecommendation() {
    try {
        console.log('🔄 Updating top recommendation...\n');

        // First, let's see current recommendations
        const current = await sql`
            SELECT id, title, priority, estimated_savings
            FROM recommendations
            ORDER BY 
                CASE priority
                    WHEN 'high' THEN 1
                    WHEN 'medium' THEN 2
                    WHEN 'low' THEN 3
                END,
                estimated_savings DESC NULLS LAST
            LIMIT 5
        `;

        console.log('Current top recommendations:');
        current.forEach((rec, i) => {
            console.log(`  ${i + 1}. ${rec.title} (${rec.priority} priority, $${rec.estimated_savings})`);
        });

        // Update the top recommendation
        console.log('\n📝 Updating top recommendation to "Implement a care management program"...\n');

        await sql`
            UPDATE recommendations
            SET 
                title = 'Implement a care management program',
                description = 'Deploy intensive care management program targeting high-risk patients to reduce avoidable admissions and improve care coordination.',
                priority = 'high',
                estimated_savings = 280000,
                affected_lives = 412,
                implementation_complexity = 'medium',
                patient_cohort = 'High-risk patients with avoidable admissions',
                cohort_size = 412,
                status = 'not_started',
                has_program_details = true,
                program_overview = 'This care management program identifies high-risk patients prone to avoidable admissions and provides intensive care coordination, including regular check-ins, medication management, and care plan development.',
                can_convert_to_workflow = true,
                workflow_type = 'care_management'
            WHERE id = (
                SELECT id FROM recommendations
                ORDER BY 
                    CASE priority
                        WHEN 'high' THEN 1
                        WHEN 'medium' THEN 2
                        WHEN 'low' THEN 3
                    END,
                    estimated_savings DESC NULLS LAST
                LIMIT 1
            )
        `;

        console.log('✅ Top recommendation updated!\n');

        // Verify
        const updated = await sql`
            SELECT id, title, priority, estimated_savings, affected_lives, patient_cohort
            FROM recommendations
            ORDER BY 
                CASE priority
                    WHEN 'high' THEN 1
                    WHEN 'medium' THEN 2
                    WHEN 'low' THEN 3
                END,
                estimated_savings DESC NULLS LAST
            LIMIT 1
        `;

        console.log('Updated top recommendation:');
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

updateTopRecommendation();
