import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function addProgramOverviews() {
    try {
        console.log('🔄 Adding program overviews to recommendations...\n');

        // Care Management Program (ID 1)
        const careManagementOverview = `This care management program identifies high-risk patients prone to avoidable admissions and provides intensive care coordination. The program includes regular check-ins, medication management, and comprehensive care plan development tailored to each patient's needs.

Through proactive monitoring and intervention, care managers work closely with patients and their families to address health concerns before they escalate to emergency situations. The program has shown significant success in reducing hospital readmissions and improving patient outcomes.

Key components include 24/7 access to care coordinators, regular home visits for high-risk patients, medication reconciliation, and coordination with specialists and community resources. This holistic approach ensures patients receive the right care at the right time in the right setting.`;

        await sql`
      UPDATE recommendations
      SET program_overview = ${careManagementOverview}
      WHERE id = 1
    `;
        console.log('✅ Updated Care Management Program overview');

        // GUIDE Program (ID 2)
        const guideOverview = `The GUIDE (Guiding an Improved Dementia Experience) program is a comprehensive Medicare benefit designed specifically for patients with dementia and their caregivers. This evidence-based program provides coordinated care management and support services to improve quality of life and reduce costly emergency interventions.

GUIDE offers 24/7 access to a dedicated care team, including care coordinators, nurses, and social workers who specialize in dementia care. Caregivers receive education, training, and respite care support to help them manage the challenges of caring for someone with dementia.

The program focuses on preventing crises through proactive care planning, medication management, and coordination with healthcare providers. Studies show that GUIDE participants experience fewer emergency department visits, reduced hospitalizations, and improved caregiver well-being while maintaining patients in their preferred home setting longer.`;

        await sql`
      UPDATE recommendations
      SET program_overview = ${guideOverview}
      WHERE id = 2
    `;
        console.log('✅ Updated GUIDE Program overview');

        // Verify
        console.log('\n📋 Verifying updates...\n');
        const recs = await sql`
      SELECT id, title, 
        CASE 
          WHEN program_overview IS NULL THEN 'NULL'
          ELSE SUBSTRING(program_overview, 1, 100) || '...'
        END as overview_preview
      FROM recommendations
      WHERE id IN (1, 2)
      ORDER BY id
    `;

        recs.forEach(r => {
            console.log(`${r.id}. ${r.title}`);
            console.log(`   Overview: ${r.overview_preview}\n`);
        });

        console.log('✅ All program overviews added successfully!');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addProgramOverviews();
