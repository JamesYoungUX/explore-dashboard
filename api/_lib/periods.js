/**
 * Calculate dynamic date ranges for performance periods
 * This ensures dates are always current (e.g., YTD always ends on today)
 */

/**
 * Get the actual start and end dates for a given period key
 * @param {string} periodKey - 'ytd', 'last_12_months', or 'last_quarter'
 * @returns {Object} { startDate: string, endDate: string } in YYYY-MM-DD format
 */
export function getActualPeriodDates(periodKey) {
    const today = new Date();
    console.log('[periods.js] Server time:', today.toISOString(), '| Local:', today.toString());
    // Format date as YYYY-MM-DD in UTC to avoid timezone issues
    const formatDate = (date) => {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    switch (periodKey) {
        case 'ytd': {
            // Year to Date: Jan 1 of current year to today
            const startDate = formatDate(new Date(today.getFullYear(), 0, 1));
            const endDate = formatDate(today);
            console.log('[periods.js] YTD calculated:', { startDate, endDate });
            return { startDate, endDate };
        }

        case 'last_12_months': {
            // Last 12 Months: 12 months ago to today
            const start = new Date(today);
            start.setFullYear(today.getFullYear() - 1);
            const startDate = formatDate(start);
            const endDate = formatDate(today);
            return { startDate, endDate };
        }

        case 'last_quarter': {
            // Last Quarter: Previous complete quarter
            const currentMonth = today.getMonth(); // 0-11
            const currentQuarter = Math.floor(currentMonth / 3); // 0=Q1, 1=Q2, 2=Q3, 3=Q4

            let lastQuarter, lastQuarterYear;
            if (currentQuarter === 0) {
                // If we're in Q1, last quarter is Q4 of previous year
                lastQuarter = 3;
                lastQuarterYear = today.getFullYear() - 1;
            } else {
                // Otherwise, it's the previous quarter of current year
                lastQuarter = currentQuarter - 1;
                lastQuarterYear = today.getFullYear();
            }

            const start = new Date(lastQuarterYear, lastQuarter * 3, 1);
            const end = new Date(lastQuarterYear, (lastQuarter + 1) * 3, 0);

            const startDate = formatDate(start);
            const endDate = formatDate(end);
            return { startDate, endDate };
        }

        default:
            // Fallback to today
            const date = formatDate(today);
            return { startDate: date, endDate: date };
    }
}

/**
 * Enhance a period object with actual current dates
 * @param {Object} period - Period object from database
 * @returns {Object} Period object with actual startDate and endDate
 */
export function enhancePeriodWithActualDates(period) {
    const actualDates = getActualPeriodDates(period.period_key);

    return {
        id: period.id,
        periodKey: period.period_key,
        periodLabel: period.period_label,
        startDate: actualDates.startDate,
        endDate: actualDates.endDate,
        isActive: period.is_active
    };
}
