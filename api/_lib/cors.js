/**
 * Gets allowed origins based on environment
 * @returns {string[]} Array of allowed origins
 */
function getAllowedOrigins() {
    // In production, use environment variable or default to Vercel domain
    if (process.env.NODE_ENV === 'production') {
        return process.env.ALLOWED_ORIGINS
            ? process.env.ALLOWED_ORIGINS.split(',')
            : ['https://your-domain.vercel.app']; // Update with your actual domain
    }

    // In development, allow localhost
    return ['http://localhost:5173', 'http://localhost:3000'];
}

/**
 * Sets CORS headers on response
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
export function setCorsHeaders(req, res) {
    const allowedOrigins = getAllowedOrigins();
    const origin = req.headers.origin;

    // Check if origin is allowed
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
}

/**
 * Handles OPTIONS preflight requests
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 * @returns {boolean} True if request was OPTIONS and handled
 */
export function handleCors(req, res) {
    setCorsHeaders(req, res);

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return true;
    }

    return false;
}
