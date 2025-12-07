import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function addFirstTwoRecommendations() {
    try {
        console.log('🔄 Adding care management and GUIDE recommendations...\n');

        // Delete all and restart
        await sql`TRUNCATE TABLE recommendations RESTART IDENTITY CASCADE`;

        // Add all 6 in correct order
        await sql`
            INSERT INTO recommendations (
                title, description, status, priority,
                estimated_savings, affected_lives, implementation_complexity,
                patient_cohort, cohort_size,
                has_program_details, program_overview, video_url,
                can_convert_to_workflow, workflow_type
            ) VALUES
            ('Implement a care management program',
                'Deploy intensive care management program targeting high-risk patients to reduce avoidable admissions and improve care coordination.',
                'not_started', 'high',
                350000, 39, 'medium',
                'High need patients', 39,
                true,
                'Care management programs are evidence-based interventions designed to improve health outcomes for high-risk patients while reducing unnecessary healthcare utilization. These programs identify patients with complex medical needs, multiple chronic conditions, or frequent hospital admissions and provide them with dedicated care coordinators who serve as their primary point of contact for healthcare navigation.

The core components of an effective care management program include comprehensive health assessments, personalized care planning, medication reconciliation and management, care coordination across providers, patient education and self-management support, and 24/7 access to clinical support. Care coordinators work closely with patients and their families to address barriers to care, ensure follow-up appointments are scheduled and attended, and facilitate communication between specialists and primary care providers.

Research demonstrates that well-implemented care management programs can reduce hospital readmissions by 20-30%, decrease emergency department visits by 15-25%, and improve patient satisfaction scores while generating significant cost savings. The key to success lies in targeting the right patient population, maintaining appropriate care coordinator-to-patient ratios (typically 1:40-50 for high-risk patients), and ensuring strong integration with the broader care team including physicians, specialists, and community resources.',
                null,
                true, 'care_management'),

            ('Refer patients with dementia to GUIDE program',
                'Enroll eligible dementia patients in the GUIDE program for comprehensive care management and caregiver support.',
                'not_started', 'high',
                120000, 87, 'low',
                'Patients with dementia', 87,
                true,
                'The GUIDE program provides comprehensive dementia care management including care coordination, caregiver education and support, and 24/7 access to a care team.',
                null,
                true, 'care_coordination'),

            ('Implement discharge planning protocols for rehab patients',
                'Partner with discharging hospitals to implement standardized discharge planning protocols that reduce unnecessary IRF admissions and promote home-based rehab when appropriate.',
                'not_started', 'high',
                65900, 148, 'medium',
                'Post-acute rehab candidates', 148,
                true,
                'Standardized discharge planning protocols are critical interventions that ensure patients receive the most appropriate post-acute care setting based on their clinical needs, functional status, and home support systems. These protocols involve collaboration between hospital discharge planners, rehabilitation specialists, and care coordinators to assess each patient''s readiness for different levels of care and identify opportunities for home-based rehabilitation when clinically appropriate.

Effective discharge planning programs establish clear criteria for determining when patients can safely receive rehabilitation services at home versus requiring facility-based care. This includes comprehensive assessments of mobility, activities of daily living, cognitive function, caregiver availability, and home environment safety. By implementing evidence-based screening tools and decision algorithms, healthcare organizations can reduce unnecessary admissions to inpatient rehabilitation facilities while ensuring patients still receive the intensive therapy they need.

Research shows that well-designed discharge planning protocols can reduce inappropriate IRF admissions by 25-35% while maintaining or improving patient outcomes. Key success factors include early identification of post-acute care needs (ideally within 24 hours of admission), strong partnerships with discharging hospitals, availability of robust home health services, and ongoing monitoring to ensure patients are progressing appropriately in their chosen care setting.',
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

        console.log('✅ Added all 6 recommendations!\n');

        // Verify
        const all = await sql`SELECT id, title, status FROM recommendations ORDER BY id`;
        console.log(`Total recommendations: ${all.length}`);
        all.forEach(r => console.log(`  ${r.id}. ${r.title} - ${r.status}`));

    } catch (error) {
        console.error('❌ Failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

addFirstTwoRecommendations();
