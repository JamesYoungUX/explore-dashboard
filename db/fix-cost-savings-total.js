import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function fixCostSavingsTotal() {
    try {
        console.log('🔧 Fixing cost savings total to match $689,650...\n');

        const ytd = await sql`SELECT id FROM performance_periods WHERE period_key = 'ytd'`;
        const ytdId = ytd[0].id;

        // Current total: $641,250
        // Target total: $689,650
        // Difference: $48,400

        // Let's proportionally increase each category to reach the target
        // Current breakdown:
        // Acute Rehabilitation: $229,500 (35.8%)
        // OP Surgical: $236,130 (36.8%)
        // IP Surgical: $175,620 (27.4%)

        // New breakdown (adding $48,400 proportionally):
        const acuteRehab = 229500 + (48400 * 0.358);  // ~$246,827
        const opSurgical = 236130 + (48400 * 0.368);  // ~$253,941
        const ipSurgical = 175620 + (48400 * 0.274);  // ~$188,882

        // Round to nearest dollar
        const newAcuteRehab = Math.round(acuteRehab);
        const newOpSurgical = Math.round(opSurgical);
        const newIpSurgical = Math.round(ipSurgical);

        const newTotal = newAcuteRehab + newOpSurgical + newIpSurgical;

        console.log('📊 New values:');
        console.log(`  Acute Rehabilitation: $${newAcuteRehab.toLocaleString()}`);
        console.log(`  OP Surgical: $${newOpSurgical.toLocaleString()}`);
        console.log(`  IP Surgical: $${newIpSurgical.toLocaleString()}`);
        console.log(`  Total: $${newTotal.toLocaleString()}\n`);

        // Update Acute Rehabilitation
        const acuteRehabCat = await sql`
      SELECT id FROM cost_categories 
      WHERE slug = 'acute-rehab' AND period_id = ${ytdId}
    `;
        await sql`
      UPDATE cost_opportunities
      SET amount_variance = ${newAcuteRehab}
      WHERE cost_category_id = ${acuteRehabCat[0].id}
        AND period_id = ${ytdId}
        AND opportunity_type = 'overspending'
    `;
        console.log('✅ Updated Acute Rehabilitation');

        // Update OP Surgical
        const opSurgicalCat = await sql`
      SELECT id FROM cost_categories 
      WHERE slug = 'op-surgical' AND period_id = ${ytdId}
    `;
        await sql`
      UPDATE cost_opportunities
      SET amount_variance = ${newOpSurgical}
      WHERE cost_category_id = ${opSurgicalCat[0].id}
        AND period_id = ${ytdId}
        AND opportunity_type = 'overspending'
    `;
        console.log('✅ Updated OP Surgical');

        // Update IP Surgical
        const ipSurgicalCat = await sql`
      SELECT id FROM cost_categories 
      WHERE slug = 'ip-surgical' AND period_id = ${ytdId}
    `;
        await sql`
      UPDATE cost_opportunities
      SET amount_variance = ${newIpSurgical}
      WHERE cost_category_id = ${ipSurgicalCat[0].id}
        AND period_id = ${ytdId}
        AND opportunity_type = 'overspending'
    `;
        console.log('✅ Updated IP Surgical');

        console.log(`\n✅ Total cost savings opportunity updated to $${newTotal.toLocaleString()}`);

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

fixCostSavingsTotal();
