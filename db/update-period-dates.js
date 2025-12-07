import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function updatePeriodDates() {
    try {
        const today = new Date();

        // Format date as YYYY-MM-DD in local timezone (not UTC)
        const formatLocalDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        // YTD: Jan 1 of current year to today
        const ytdStart = formatLocalDate(new Date(today.getFullYear(), 0, 1)); // Jan 1
        const ytdEnd = formatLocalDate(today);

        // Last 12 Months: 12 months ago to today
        const last12Start = new Date(today);
        last12Start.setFullYear(today.getFullYear() - 1);
        const last12StartStr = formatLocalDate(last12Start);
        const last12EndStr = formatLocalDate(today);

        // Last Quarter: Previous complete quarter
        const currentMonth = today.getMonth(); // 0-11 (0=Jan, 11=Dec)
        const currentQuarter = Math.floor(currentMonth / 3); // 0=Q1, 1=Q2, 2=Q3, 3=Q4

        // If we're in Q1, last quarter is Q4 of previous year
        // Otherwise, it's the previous quarter of current year
        let lastQuarter, lastQuarterYear;
        if (currentQuarter === 0) {
            lastQuarter = 3; // Q4
            lastQuarterYear = today.getFullYear() - 1;
        } else {
            lastQuarter = currentQuarter - 1;
            lastQuarterYear = today.getFullYear();
        }

        const quarterStart = formatLocalDate(new Date(lastQuarterYear, lastQuarter * 3, 1));
        const quarterEnd = formatLocalDate(new Date(lastQuarterYear, (lastQuarter + 1) * 3, 0));

        console.log('📅 Updating period dates to current values...\n');

        // Update YTD
        await sql`
      UPDATE performance_periods
      SET start_date = ${ytdStart},
          end_date = ${ytdEnd}
      WHERE period_key = 'ytd'
    `;
        console.log(`✅ YTD: ${ytdStart} - ${ytdEnd}`);

        // Update Last 12 Months
        await sql`
      UPDATE performance_periods
      SET start_date = ${last12StartStr},
          end_date = ${last12EndStr}
      WHERE period_key = 'last_12_months'
    `;
        console.log(`✅ Last 12 Months: ${last12StartStr} - ${last12EndStr}`);

        // Update Last Quarter
        await sql`
      UPDATE performance_periods
      SET start_date = ${quarterStart},
          end_date = ${quarterEnd}
      WHERE period_key = 'last_quarter'
    `;
        console.log(`✅ Last Quarter: ${quarterStart} - ${quarterEnd}`);

        console.log('\n✅ All period dates updated successfully!');

    } catch (error) {
        console.error('❌ Error updating period dates:', error);
        throw error;
    }
}

updatePeriodDates();
