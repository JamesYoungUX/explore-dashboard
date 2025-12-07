import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function fixPercentages() {
    try {
        console.log('Fixing all variance percentages to be under 12%...\n');

        const updates = [
            // Acute Rehab - $150K variance, +2.9% trend
            { slug: 'acute-rehab', percent: 2.9 },

            // OP Surgical
            { slug: 'op-surgical', percent: 3.3 },

            // IP Surgical
            { slug: 'ip-surgical', percent: 2.8 },

            // ED Visits
            { slug: 'ed-visits', percent: 8.5 },

            // Avoidable ED
            { slug: 'avoidable-ed-visits', percent: -5.6 },

            // Inpatient Medical
            { slug: 'inpatient-medical', percent: 6.0 },

            // Skilled Nursing
            { slug: 'skilled-nursing', percent: -6.6 },

            // OP Radiology
            { slug: 'op-radiology', percent: -3.8 },

            // Primary Care
            { slug: 'primary-care', percent: -11.5 },

            // Preventive Care
            { slug: 'preventive-care', percent: -9.2 },

            // Generic Drugs
            { slug: 'generic-drugs', percent: -10.8 },

            // Radiology
            { slug: 'radiology', percent: -2.5 },

            // Lab Services
            { slug: 'lab-services', percent: -2.9 }
        ];

        for (const update of updates) {
            await sql`
                UPDATE cost_categories
                SET spending_variance_percent = ${update.percent}
                WHERE slug = ${update.slug}
                    AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')
            `;
            console.log(`✅ ${update.slug}: ${update.percent}%`);
        }

        console.log('\n✅ All percentages updated!\n');

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

fixPercentages();
