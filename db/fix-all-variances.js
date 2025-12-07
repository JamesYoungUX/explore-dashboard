import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function fixAllVariances() {
    try {
        console.log('Fixing all variance amounts...\n');

        // Using member count of ~5,172 (calculated from Acute Rehab: $150,000 / $29 PMPM)
        const memberMonths = 5172;

        const updates = [
            // Acute Rehab - already correct at $150K, but fix percentage
            { slug: 'acute-rehab', amount: 150000, percent: 170.6 },

            // OP Surgical: $5.90 PMPM variance
            { slug: 'op-surgical', amount: Math.round(5.90 * memberMonths), percent: 3.3 },

            // IP Surgical: $6.00 PMPM variance
            { slug: 'ip-surgical', amount: Math.round(6.00 * memberMonths), percent: 2.8 },

            // ED Visits: $24.00 PMPM variance
            { slug: 'ed-visits', amount: Math.round(24.00 * memberMonths), percent: 20.3 },

            // Avoidable ED: -$5.00 PMPM variance
            { slug: 'avoidable-ed-visits', amount: Math.round(-5.00 * memberMonths), percent: -5.6 },

            // Inpatient Medical: $14.00 PMPM variance
            { slug: 'inpatient-medical', amount: Math.round(14.00 * memberMonths), percent: 6.0 },

            // Skilled Nursing: -$8.50 PMPM variance
            { slug: 'skilled-nursing', amount: Math.round(-8.50 * memberMonths), percent: -6.6 },

            // OP Radiology: -$3.00 PMPM variance
            { slug: 'op-radiology', amount: Math.round(-3.00 * memberMonths), percent: -3.8 },

            // Primary Care: -$30.00 PMPM variance
            { slug: 'primary-care', amount: Math.round(-30.00 * memberMonths), percent: -14.3 },

            // Preventive Care: -$7.00 PMPM variance
            { slug: 'preventive-care', amount: Math.round(-7.00 * memberMonths), percent: -13.5 },

            // Generic Drugs: -$16.00 PMPM variance
            { slug: 'generic-drugs', amount: Math.round(-16.00 * memberMonths), percent: -14.8 },

            // Radiology: -$2.00 PMPM variance
            { slug: 'radiology', amount: Math.round(-2.00 * memberMonths), percent: -2.5 },

            // Lab Services: -$1.00 PMPM variance
            { slug: 'lab-services', amount: Math.round(-1.00 * memberMonths), percent: -2.9 }
        ];

        for (const update of updates) {
            await sql`
                UPDATE cost_categories
                SET 
                    spending_variance_amount = ${update.amount},
                    spending_variance_percent = ${update.percent}
                WHERE slug = ${update.slug}
                    AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')
            `;
            console.log(`✅ ${update.slug}: $${update.amount.toLocaleString()} (${update.percent}%)`);
        }

        console.log('\n✅ All variances updated!\n');

        // Verify top 3
        const top3 = await sql`
            SELECT category_name, spending_variance_amount, spending_variance_percent
            FROM cost_categories
            WHERE period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')
            ORDER BY display_order
            LIMIT 3
        `;

        console.log('Top 3 categories:');
        top3.forEach(cat => {
            console.log(`  ${cat.category_name}: $${cat.spending_variance_amount.toLocaleString()} (${cat.spending_variance_percent}%)`);
        });

    } catch (error) {
        console.error('❌ Failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

fixAllVariances();
