import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

const additionalContent = `

GUIDE is well positioned to improve health outcomes by encouraging use of community resources, offering caregiver education to improve competence and confidence, and enhancing access to medical and behavioral specialists, along with seamless coordination of healthcare and support services.

GUIDE also has the potential to significantly decrease healthcare costs. Implementation of community care navigation programs has been consistently proven to result in a decrease in healthcare services utilization in the form of fewer hospital readmissions, and a decrease in Emergency Room and physician visits.

Rollout of services

Nearly 400 healthcare providers were approved by CMS to offer GUIDE services to eligible beneficiaries. About 100 providers were considered "existing" programs, meaning their existing infrastructure already incorporated most requirements elements of GUIDE, and were approved to begin offering services in July of 2024. The other 300 providers were given a year to develop internal programming or establish partnerships that would enable them to deliver all required services.

To be eligible to participate in the GUIDE program, patients must participate in traditional Medicare parts A and B rather than Medicare Advantage or PACE. They must also not reside in a nursing home. A clinical diagnosis is required, which can be completed by the health provider upon acceptance into the program.

At-A-Glance – The 9 Requirements of GUIDE Providers

Below is a quick review of the comprehensive clinical, medical and caregiver support services that CMS has developed as the framework for improved dementia care.

Comprehensive Assessment: Can be conducted in person or via telehealth. Will evaluate disease progression, identify the Model tier, assess caregiver capacity for care, behavioral health needs, coordinate with existing care providers, and initiate the Care Plan.

Care Planning: Develop a person-centered care plan, including beneficiary goals, strengths, needs, coordination of services, including respite as applicable, caregiver education and support services

24/7 Access: Provide round-the-clock access to a care team member or helpline. Provider can utilize third party services but must be a live person, not AI. All interactions must be communicated to the interdisciplinary care team

Ongoing Monitoring and Support: GUIDE Model provides guidelines for contact frequency, per Model tier. With caregiver: Low complexity: quarterly; Moderate: at least monthly; High: at least monthly. Without caregiver: Low complexity: at least monthly; Moderate to high: at least twice per month

Care Coordination and Transitional Care Management: Share the care plan with beneficiary's primary care physician and coordinate changes in care. New care providers receive patient history, including medication management.

Referral and Coordination of Support Services: Refer and connect participants to community-based services, such as meals, adult day centers, environmental modifications, etc. Coordinate HCBS through Medicaid, if eligible.

Medication Management and Reconciliation: Clinician with prescribing authority reviews medications at the time of initial comprehensive assessment, recommends changes to medication plan, if applicable, prescribes or de-prescribes medications upon agreement from primary care physician or medical specialist, provides supports for participant to maintain medication schedule.

Caregiver Education and Support: Provide caregivers with training to help the beneficiary remain safely at home. Topics can include including emergency services, help with ADLs, managing behaviors and symptoms, care planning, etc. Provide dementia care educational materials, support group services, and one-on-one support calls.

Respite: Respite services are offered based on beneficiary's qualifying status. The provider must provide in-home services, as well as access to 24-hour facilities, and can be contracted to a third party. Benefits range as high as $2500 annually.

Will GUIDE have an impact?

Caregiver support and care navigation programs have been proven in multiple research studies over the years to improve caregiver confidence, increase utilization of community resources, and decrease relationship strain, depression and anxiety for both the caregiver and the person receiving care.

While the GUIDE Model has been designed by CMS first and foremost to improve dementia care and support family caregivers, the program is also expected to decrease the use of costly healthcare services—leading to reduced per-patient costs in several ways:

Round-the-clock access to medical personnel should serve to reduce emergency room visits.

Increased utilization of community services will enhance beneficiary and caregiver wellness, and education will increase the quality of care.

Readily available screenings and early interventions should facilitate disease management and decrease hospitalizations

Coordinated care will help beneficiaries move through the healthcare system cost effectively.

Multiple studies have reflected the decrease in services utilization realized through implementing care navigation programs; several studies conducted using evidence-based BRI Care Consultation, one of the six comprehensive care programs identified by CMS for potential use as a care navigation tool, showed a decrease in hospitalizations by an average of one per person, a 50% decrease in ER visits, and a 26% reduction in physician office visits.

GUIDE Providers

People with dementia and their family caregivers are welcome to choose any GUIDE provider for services. However, with less than 400 providers spread throughout the country, it's likely that in-person services may not be available for many within a reasonable driving distance.

Several national telehealth providers of dementia care and brain health have become GUIDE providers, which negates geographic considerations. Isaac Health, a specialist in medical and behavioral solutions for treating dementia and other cognitive impairments, has partnered with BRI Care Consultation (delivered under the WeCare…Because You Do brand) to provide specialized clinical dementia care along with trusted care navigation and service coordination.

"The combination of Isaac's expert medical care and the proven benefits of WeCare's caregiver support provides families dealing with dementia everything they need to improve care and increase the effectiveness of caregiving," says Lisa Weitzman, Director of the WeCare Program for Benjamin Rose. "With services delivered by telehealth, telephone and email, program participants get the added convenience of appointments from the comfort of their homes."`;

// Get current content
const current = await sql`SELECT program_overview FROM recommendations WHERE id = 2`;
const newContent = (current[0].program_overview || '') + additionalContent;

// Update with appended content
await sql`UPDATE recommendations SET program_overview = ${newContent} WHERE id = 2`;

console.log('✅ Updated GUIDE program content');
console.log('New length:', newContent.length, 'characters');
