import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function checkRecommendationText() {
    try {
        console.log('🔍 Checking recommendation text in database...\n');

        const rec = await sql`
            SELECT 
                id,
                title,
                description,
                program_overview
            FROM recommendations
            WHERE title = 'Implement a care management program'
            LIMIT 1
        `;

        if (rec.length === 0) {
            console.log('❌ Recommendation not found!');
            return;
        }

        console.log('📋 Recommendation Details:\n');
        console.log(`ID: ${rec[0].id}`);
        console.log(`Title: ${rec[0].title}\n`);
        console.log(`Description:\n${rec[0].description}\n`);
        console.log(`Program Overview:\n${rec[0].program_overview}\n`);

        // Check if it has the new text
        if (rec[0].program_overview && rec[0].program_overview.includes('Care management programs are evidence-based')) {
            console.log('✅ Database has the NEW comprehensive text!');
        } else {
            console.log('❌ Database still has the OLD text!');
        }

    } catch (error) {
        console.error('❌ Failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

checkRecommendationText();
