import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function addAcuteRehabDetails() {
    try {
        console.log('🔄 Adding Acute Rehabilitation detail data...\n');

        // Get the acute-rehab category
        const categories = await sql`SELECT id FROM cost_categories WHERE slug = 'acute-rehab'`;

        if (categories.length === 0) {
            console.error('❌ Acute Rehab category not found!');
            return;
        }

        const categoryId = categories[0].id;
        console.log(`✅ Found Acute Rehab category (ID: ${categoryId})\n`);

        // Clear existing data
        await sql`DELETE FROM cost_category_hospitals WHERE cost_category_id = ${categoryId}`;
        await sql`DELETE FROM cost_category_drgs WHERE cost_category_id = ${categoryId}`;
        await sql`DELETE FROM cost_category_discharging_hospitals WHERE cost_category_id = ${categoryId}`;
        console.log('✅ Cleared existing detail data\n');

        // Add hospital data (top facilities by spend)
        console.log('Adding hospital data...');
        await sql`
      INSERT INTO cost_category_hospitals (
        cost_category_id, hospital_name, discharges, avg_los, spend, readmission_rate, display_order
      ) VALUES
        (${categoryId}, 'Regional Medical Center', 145, 12.3, 2450000, 8.2, 1),
        (${categoryId}, 'University Hospital', 132, 11.8, 2180000, 7.5, 2),
        (${categoryId}, 'Memorial Health System', 118, 13.1, 1920000, 9.1, 3),
        (${categoryId}, 'St. Mary''s Medical Center', 95, 12.7, 1580000, 8.8, 4),
        (${categoryId}, 'Community General Hospital', 87, 11.5, 1420000, 7.9, 5),
        (${categoryId}, 'Mercy Hospital', 76, 12.9, 1240000, 8.5, 6),
        (${categoryId}, 'Providence Medical Center', 68, 11.2, 1090000, 7.2, 7),
        (${categoryId}, 'Sacred Heart Hospital', 54, 13.4, 895000, 9.3, 8)
    `;
        console.log('  ✅ Added 8 hospitals\n');

        // Add DRG data (top diagnosis-related groups)
        console.log('Adding DRG data...');
        await sql`
      INSERT INTO cost_category_drgs (
        cost_category_id, drg_code, drg_description, patient_count, 
        total_spend, avg_spend_per_patient, benchmark_avg, percent_above_benchmark, display_order
      ) VALUES
        (${categoryId}, '945', 'Rehabilitation w CC/MCC', 285, 4850000, 17018, 15200, 12.0, 1),
        (${categoryId}, '946', 'Rehabilitation w/o CC/MCC', 198, 2970000, 15000, 13800, 8.7, 2),
        (${categoryId}, '559', 'Aftercare, Musculoskeletal System & Connective Tissue w MCC', 142, 2485000, 17500, 16100, 8.7, 3),
        (${categoryId}, '560', 'Aftercare, Musculoskeletal System & Connective Tissue w CC', 127, 1905000, 15000, 14200, 5.6, 4),
        (${categoryId}, '056', 'Degenerative Nervous System Disorders w MCC', 89, 1690000, 18989, 17500, 8.5, 5),
        (${categoryId}, '057', 'Degenerative Nervous System Disorders w/o MCC', 76, 1140000, 15000, 14100, 6.4, 6),
        (${categoryId}, '092', 'Other Disorders of Nervous System w MCC', 64, 1152000, 18000, 16800, 7.1, 7),
        (${categoryId}, '093', 'Other Disorders of Nervous System w CC', 52, 780000, 15000, 14300, 4.9, 8)
    `;
        console.log('  ✅ Added 8 DRGs\n');

        // Add discharging hospitals (hospitals that discharge TO acute rehab)
        console.log('Adding discharging hospital data...');
        await sql`
      INSERT INTO cost_category_discharging_hospitals (
        cost_category_id, hospital_name, discharges, 
        percent_discharged_to_irf, percent_discharged_to_irf_benchmark, display_order
      ) VALUES
        (${categoryId}, 'Regional Medical Center', 1245, 18.5, 12.0, 1),
        (${categoryId}, 'University Hospital', 1132, 16.8, 12.0, 2),
        (${categoryId}, 'Memorial Health System', 987, 15.2, 12.0, 3),
        (${categoryId}, 'St. Mary''s Medical Center', 856, 14.9, 12.0, 4),
        (${categoryId}, 'Community General Hospital', 743, 13.8, 12.0, 5),
        (${categoryId}, 'Mercy Hospital', 654, 13.2, 12.0, 6),
        (${categoryId}, 'Providence Medical Center', 589, 12.5, 12.0, 7),
        (${categoryId}, 'Sacred Heart Hospital', 512, 11.8, 12.0, 8)
    `;
        console.log('  ✅ Added 8 discharging hospitals\n');

        // Verify the data
        console.log('📋 Verifying data...\n');

        const hospitals = await sql`
      SELECT hospital_name, discharges, spend 
      FROM cost_category_hospitals 
      WHERE cost_category_id = ${categoryId}
      ORDER BY display_order
      LIMIT 3
    `;
        console.log('Top 3 Hospitals by Spend:');
        hospitals.forEach((h, i) => {
            console.log(`  ${i + 1}. ${h.hospital_name}: ${h.discharges} discharges, $${h.spend.toLocaleString()}`);
        });

        const drgs = await sql`
      SELECT drg_code, drg_description, patient_count, total_spend
      FROM cost_category_drgs 
      WHERE cost_category_id = ${categoryId}
      ORDER BY display_order
      LIMIT 3
    `;
        console.log('\nTop 3 DRGs by Spend:');
        drgs.forEach((d, i) => {
            console.log(`  ${i + 1}. ${d.drg_code} - ${d.drg_description}: ${d.patient_count} patients, $${d.total_spend.toLocaleString()}`);
        });

        const discharging = await sql`
      SELECT hospital_name, discharges, percent_discharged_to_irf
      FROM cost_category_discharging_hospitals 
      WHERE cost_category_id = ${categoryId}
      ORDER BY display_order
      LIMIT 3
    `;
        console.log('\nTop 3 Discharging Hospitals:');
        discharging.forEach((d, i) => {
            console.log(`  ${i + 1}. ${d.hospital_name}: ${d.discharges} total discharges, ${d.percent_discharged_to_irf}% to IRF`);
        });

        console.log('\n\n✅ All Acute Rehabilitation detail data added successfully!');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addAcuteRehabDetails();
