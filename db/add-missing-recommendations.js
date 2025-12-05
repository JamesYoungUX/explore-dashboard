import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function addMissingRecommendations() {
    try {
        console.log('🔄 Adding missing recommendations...\n');

        // Check current count
        const current = await sql`SELECT COUNT(*) as count FROM recommendations`;
        console.log(`Current recommendations: ${current[0].count}`);

        if (current[0].count >= 6) {
            console.log('✅ All recommendations already exist!');
            return;
        }

        // Add the missing 4 recommendations
        await sql`
            INSERT INTO recommendations (
                title, description, status, priority,
                estimated_savings, affected_lives, implementation_complexity,
                patient_cohort, cohort_size,
                has_program_details, program_overview, video_url,
                can_convert_to_workflow, workflow_type
            ) VALUES
            ('Implement discharge planning protocols for rehab patients',
                'Partner with discharging hospitals to implement standardized discharge planning protocols that reduce unnecessary IRF admissions and promote home-based rehab when appropriate.',
                'not_started', 'high',
                65900, 148, 'medium',
                'Post-acute rehab candidates', 148,
                true,
                'This program establishes partnerships with top discharging hospitals to create standardized discharge planning protocols.',
                null,
                true, 'care_coordination'),

            ('Launch extended-hours urgent care program',
                'Establish extended-hours urgent care access (evenings and weekends) to divert non-emergency ED visits to lower-cost settings.',
                'accepted', 'high',
                24000, 780, 'high',
                'High ED utilizers', 285,
                true,
                'Extended-hours urgent care program provides same-day access for urgent but non-emergency conditions.',
                'https://vimeo.com/example123',
                true, 'care_access'),

            ('Implement pre-surgical optimization program',
                'Deploy pre-surgical screening and optimization to reduce complications and improve surgical outcomes, particularly for high-risk patients.',
                'not_started', 'medium',
                33000, 342, 'medium',
                'Surgical candidates with risk factors', 112,
                false, null, null,
                false, null),

            ('Expand generic drug program',
                'Continue expanding generic drug utilization through provider education and formulary optimization.',
                'already_doing', 'low',
                8000, 1522, 'low',
                'All patients', 1522,
                false, null, null,
                false, null)
        `;

        console.log('✅ Added 4 missing recommendations!\n');

        // Verify
        const after = await sql`SELECT id, title, status FROM recommendations ORDER BY id`;
        console.log(`Total recommendations: ${after.length}`);
        after.forEach(r => console.log(`  ${r.id}. ${r.title} - ${r.status}`));

    } catch (error) {
        console.error('❌ Failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

addMissingRecommendations();
