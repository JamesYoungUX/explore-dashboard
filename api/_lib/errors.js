/**
 * Standard error codes for API responses
 */
export const ErrorCodes = {
    DATABASE_ERROR: 'DATABASE_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    MISSING_ENV: 'MISSING_ENV',
};

/**
 * Creates a standardized error response
 * @param {string} code - Error code from ErrorCodes
 * @param {string} message - Human-readable error message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Standardized error response
 */
export function createErrorResponse(code, message, statusCode = 500) {
    return {
        statusCode,
        body: {
            error: {
                code,
                message,
                timestamp: new Date().toISOString(),
            },
        },
    };
}

/**
 * Handles errors in serverless functions
 * @param {Response} res - Response object
 * @param {Error} error - Error object
 * @param {string} context - Context of where error occurred
 */
export function handleError(res, error, context = 'API request') {
    console.error(`Error in ${context}:`, error);

    // Check for specific error types
    if (error.message?.includes('DATABASE_URL')) {
        const response = createErrorResponse(
            ErrorCodes.MISSING_ENV,
            'Database configuration error',
            500
        );
        return res.status(response.statusCode).json(response.body);
    }

    // Default error response
    const response = createErrorResponse(
        ErrorCodes.INTERNAL_ERROR,
        `Failed to ${context}`,
        500
    );
    return res.status(response.statusCode).json(response.body);
}

/**
 * Creates a 404 Not Found response
 * @param {Response} res - Response object
 * @param {string} resource - Resource that was not found
 */
export function notFound(res, resource = 'Resource') {
    const response = createErrorResponse(
        ErrorCodes.NOT_FOUND,
        `${resource} not found`,
        404
    );
    return res.status(response.statusCode).json(response.body);
}
