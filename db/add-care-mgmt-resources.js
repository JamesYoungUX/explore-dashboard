import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function addCareMgmtResources() {
    try {
        console.log('🔄 Adding program resources for Care Management Program...\n');

        // First, delete any existing resources for recommendation ID 1
        await sql`DELETE FROM program_resources WHERE recommendation_id = 1`;
        console.log('✅ Cleared existing resources for Care Management Program\n');

        // Add implementation steps
        await sql`
            INSERT INTO program_resources (recommendation_id, resource_type, title, content, display_order) VALUES
            (1, 'implementation_step', 'Step 1: Identify high-risk patients',
             'Analyze claims data to identify patients with multiple chronic conditions, frequent ED visits, or recent hospitalizations. Target the top 5% by cost (typically 75-100 patients).', 1),
            (1, 'implementation_step', 'Step 2: Hire and train care coordinators',
             'Recruit experienced nurses or social workers to serve as care coordinators. Provide training on motivational interviewing, chronic disease management, and care coordination best practices.', 2),
            (1, 'implementation_step', 'Step 3: Conduct comprehensive assessments',
             'Complete detailed health assessments for each enrolled patient, including medical history, medications, social determinants of health, and caregiver support systems.', 3),
            (1, 'implementation_step', 'Step 4: Develop personalized care plans',
             'Create individualized care plans addressing each patient''s specific needs, goals, and barriers to care. Include medication management, appointment coordination, and self-management education.', 4),
            (1, 'implementation_step', 'Step 5: Implement proactive outreach',
             'Establish regular touchpoints with patients (weekly for highest-risk, bi-weekly for others). Monitor for early warning signs and intervene before issues escalate to emergency situations.', 5)
        `;
        console.log('✅ Added implementation steps\n');

        // Add best practices
        await sql`
            INSERT INTO program_resources (recommendation_id, resource_type, title, content, display_order) VALUES
            (1, 'best_practice', 'Focus on top 5% by cost',
             'Start with the highest-cost 5% of patients. These 75-100 patients typically account for 40-50% of total costs and benefit most from intensive management.', 1),
            (1, 'best_practice', 'Assign dedicated coordinators',
             'Each care coordinator should manage 40-50 high-cost patients maximum. Lower ratios enable the intensive, proactive outreach these patients need.', 2),
            (1, 'best_practice', 'Integrate with primary care',
             'Ensure strong communication between care coordinators and primary care providers. Weekly huddles to discuss high-risk patients improve coordination and outcomes.', 3),
            (1, 'best_practice', 'Provide 24/7 access',
             'Offer after-hours nurse line or on-call support. Many preventable ED visits occur evenings and weekends when patients can''t reach their care team.', 4)
        `;
        console.log('✅ Added best practices\n');

        // Add testimonials
        await sql`
            INSERT INTO program_resources (recommendation_id, resource_type, content, author, author_role, display_order) VALUES
            (1, 'testimonial',
             'Our care management program reduced hospital readmissions by 28% in the first year. The key was maintaining low coordinator-to-patient ratios and providing 24/7 access to clinical support.',
             'Dr. Michael Chen', 'Chief Medical Officer, Mountain View ACO', 1),
            (1, 'testimonial',
             'We saw a 22% reduction in ED visits among our highest-risk patients within 6 months. The care coordinators became trusted partners for our patients, helping them navigate the healthcare system.',
             'Lisa Rodriguez', 'VP of Care Management, Coastal Health Network', 2)
        `;
        console.log('✅ Added testimonials\n');

        // Verify
        const resources = await sql`
            SELECT resource_type, title, LEFT(content, 80) as content_preview
            FROM program_resources
            WHERE recommendation_id = 1
            ORDER BY resource_type, display_order
        `;

        console.log('📋 Added resources for Care Management Program:\n');
        resources.forEach(r => {
            console.log(`  ${r.resource_type}: ${r.title || '(testimonial)'}`);
            console.log(`    ${r.content_preview}...\n`);
        });

        console.log('✅ Successfully added all program resources for Care Management Program!');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addCareMgmtResources();
