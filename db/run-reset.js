import { resetToInitialState } from './reset-to-initial-state.js';

async function run() {
    try {
        console.log('Starting database reset...\n');
        const result = await resetToInitialState();
        console.log('\n✅ Database restored successfully!');
        console.log('Result:', result);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

run();
