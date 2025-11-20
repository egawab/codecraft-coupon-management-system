/**
 * Firebase Data Validation Middleware
 * 
 * This module provides a final safety layer to ensure no undefined values
 * ever reach Firebase, regardless of the data source or user type.
 */

/**
 * Validates any object before sending to Firebase
 * Throws an error if undefined values are found
 */
export const validateFirebaseData = (data: Record<string, any>, context = 'Unknown'): void => {
    const undefinedFields: string[] = [];
    
    const checkForUndefined = (obj: any, path = ''): void => {
        if (obj === undefined) {
            undefinedFields.push(path || 'root');
            return;
        }
        
        if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
            Object.entries(obj).forEach(([key, value]) => {
                if (value === undefined) {
                    undefinedFields.push(path ? `${path}.${key}` : key);
                } else if (value && typeof value === 'object') {
                    checkForUndefined(value, path ? `${path}.${key}` : key);
                }
            });
        }
    };
    
    checkForUndefined(data);
    
    if (undefinedFields.length > 0) {
        const error = new Error(
            `🚨 CRITICAL: Undefined fields detected before Firebase operation in ${context}!\n` +
            `Fields with undefined values: ${undefinedFields.join(', ')}\n` +
            `This would cause a Firebase error. Data has been blocked.`
        );
        console.error(error.message);
        console.error('Problematic data:', JSON.stringify(data, null, 2));
        throw error;
    }
};

/**
 * Safely prepares data for Firebase by removing undefined values and validating
 */
export const prepareForFirebase = <T extends Record<string, any>>(
    data: T, 
    context = 'Unknown Operation'
): Partial<T> => {
    // First, remove undefined values
    const cleaned = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined && value !== null)
    ) as Partial<T>;
    
    // Then validate the result
    validateFirebaseData(cleaned, context);
    
    return cleaned;
};

/**
 * Specifically for coupon data - adds extra validation
 */
export const prepareCouponForFirebase = (data: any, context = 'Coupon Operation'): any => {
    // First apply general Firebase preparation
    const prepared = prepareForFirebase(data, context);
    
    // Additional coupon-specific validation
    if (prepared.validityType === 'days' && prepared.validityDays === undefined) {
        throw new Error(`🚨 COUPON ERROR: validityType is 'days' but validityDays is missing in ${context}`);
    }
    
    if (prepared.validityType === 'expiryDate' && prepared.expiryDate === undefined) {
        throw new Error(`🚨 COUPON ERROR: validityType is 'expiryDate' but expiryDate is missing in ${context}`);
    }
    
    if (prepared.validityDays !== undefined && prepared.expiryDate !== undefined) {
        console.warn(`⚠️ WARNING: Both validityDays and expiryDate are present in ${context}. This might indicate incomplete sanitization.`);
    }
    
    return prepared;
};