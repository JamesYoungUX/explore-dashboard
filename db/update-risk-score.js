import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function updateRiskScore() {
    try {
        console.log('🔄 Updating Quality Score to Risk Score...\n');

        // Get all periods
        const periods = await sql`SELECT id, period_key FROM performance_periods ORDER BY period_key`;

        for (const period of periods) {
            // Update the metric type and values
            await sql`
        UPDATE performance_metrics 
        SET 
          metric_type = 'risk_score',
          current_value = 1.08,
          previous_value = 1.085,
          change_percent = -0.5,
          change_direction = 'down',
          benchmark_value = 1.0,
          is_above_benchmark = true,
          display_format = 'number'
        WHERE period_id = ${period.id} 
        AND metric_type = 'quality_score'
      `;

            console.log(`  ✓ Updated ${period.period_key}`);
        }

        console.log('\n✅ Risk Score metric updated successfully!');
        console.log('   Value: 1.08');
        console.log('   Change: -0.5% (down)');

    } catch (error) {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    }
}

updateRiskScore();
