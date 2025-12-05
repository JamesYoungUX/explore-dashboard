import { handleCors } from './_lib/cors.js';
import { resetToInitialState } from '../db/reset-to-initial-state.js';

export default async function handler(req, res) {
  // Handle CORS
  if (handleCors(req, res)) return;

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    console.log('🔄 API: Starting prototype reset...');

    const result = await resetToInitialState();

    console.log('✅ API: Reset complete', result);

    return res.status(200).json({
      success: true,
      message: 'Prototype reset to initial state',
      data: result
    });

  } catch (error) {
    console.error('❌ API: Reset failed:', error);

    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
}
