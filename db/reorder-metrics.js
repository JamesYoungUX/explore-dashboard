import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function reorderMetrics() {
    try {
        console.log('🔄 Reordering top metrics to correct order...\n');

        // Get all periods
        const periods = await sql`SELECT id, period_key FROM performance_periods ORDER BY period_key`;

        for (const period of periods) {
            console.log(`Updating ${period.period_key}...`);

            // Delete existing metrics for this period
            await sql`DELETE FROM performance_metrics WHERE period_id = ${period.id}`;

            // Re-insert in the correct order
            // Order: Patients, Risk (Quality), PMPM, Total Spend, Cost Savings
            const metrics = {
                ytd: [
                    { type: 'patient_count', current: 1522, previous: 1485, change: 2.5, direction: 'up', benchmark: 1522, above: false, format: 'number' },
                    { type: 'quality_score', current: 87, previous: 84, change: 3.6, direction: 'up', benchmark: 90, above: false, format: 'percent' },
                    { type: 'cost_pmpm', current: 1042, previous: 1073, change: -2.9, direction: 'down', benchmark: 950, above: true, format: 'currency' },
                    { type: 'total_cost', current: 1680000, previous: 1742000, change: -3.6, direction: 'down', benchmark: 1450000, above: true, format: 'currency' },
                    { type: 'cost_savings_opportunity', current: 750000, previous: 765000, change: -2.1, direction: 'down', benchmark: 500000, above: true, format: 'currency' }
                ],
                last_12_months: [
                    { type: 'patient_count', current: 1485, previous: 1450, change: 2.4, direction: 'up', benchmark: 1485, above: false, format: 'number' },
                    { type: 'quality_score', current: 84, previous: 82, change: 2.4, direction: 'up', benchmark: 90, above: false, format: 'percent' },
                    { type: 'cost_pmpm', current: 1073, previous: 1145, change: -6.3, direction: 'down', benchmark: 950, above: true, format: 'currency' },
                    { type: 'total_cost', current: 1742000, previous: 1820000, change: -4.3, direction: 'down', benchmark: 1450000, above: true, format: 'currency' },
                    { type: 'cost_savings_opportunity', current: 765000, previous: 800000, change: -4.4, direction: 'down', benchmark: 500000, above: true, format: 'currency' }
                ],
                last_quarter: [
                    { type: 'patient_count', current: 1480, previous: 1465, change: 1.0, direction: 'up', benchmark: 1480, above: false, format: 'number' },
                    { type: 'quality_score', current: 85, previous: 83, change: 2.4, direction: 'up', benchmark: 90, above: false, format: 'percent' },
                    { type: 'cost_pmpm', current: 1065, previous: 1125, change: -5.3, direction: 'down', benchmark: 950, above: true, format: 'currency' },
                    { type: 'total_cost', current: 425000, previous: 445000, change: -4.5, direction: 'down', benchmark: 362500, above: true, format: 'currency' },
                    { type: 'cost_savings_opportunity', current: 190000, previous: 200000, change: -5.0, direction: 'down', benchmark: 125000, above: true, format: 'currency' }
                ]
            };

            const periodMetrics = metrics[period.period_key];

            for (const metric of periodMetrics) {
                await sql`
          INSERT INTO performance_metrics (
            period_id, metric_type, current_value, previous_value,
            change_percent, change_direction, benchmark_value,
            is_above_benchmark, display_format
          ) VALUES (
            ${period.id}, ${metric.type}, ${metric.current}, ${metric.previous},
            ${metric.change}, ${metric.direction}, ${metric.benchmark},
            ${metric.above}, ${metric.format}
          )
        `;
            }

            console.log(`  ✓ ${period.period_key}: 5 metrics in correct order`);
        }

        console.log('\n✅ Metrics reordered successfully!');
        console.log('\nNew order:');
        console.log('  1. Patients');
        console.log('  2. Risk (Quality Score)');
        console.log('  3. PMPM');
        console.log('  4. Total Spend');
        console.log('  5. Cost Savings Opportunity');

    } catch (error) {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    }
}

reorderMetrics();
