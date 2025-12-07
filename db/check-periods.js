import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

const periods = await sql`SELECT * FROM performance_periods`;
console.log('Performance Periods:');
console.log(JSON.stringify(periods, null, 2));
