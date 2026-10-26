/**
 * Currency and data formatters for Aurora Hotels & Bookings
 */

export const formatPKR = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rs. 0';
  return `Rs. ${Number(amount).toLocaleString('en-PK')}`;
};

/**
 * Format CNIC to standard format: 12345-1234567-1
 */
export const formatCNIC = (raw) => {
  if (!raw) return '';
  const cleaned = raw.replace(/\D/g, '').slice(0, 13);
  if (cleaned.length <= 5) return cleaned;
  if (cleaned.length <= 12) return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12, 13)}`;
};

/**
 * Mask CNIC for privacy and security: 42101-*******-1
 * Never expose raw CNIC in public views or to AI
 */
export const maskCNIC = (cnic) => {
  if (!cnic) return '•••••-•••••••-•';
  const cleaned = cnic.replace(/\D/g, '');
  if (cleaned.length < 13) return '•••••-•••••••-•';
  const prefix = cleaned.slice(0, 5);
  const suffix = cleaned.slice(12, 13);
  return `${prefix}-*******-${suffix}`;
};

/**
 * Validate Pakistani CNIC (13 digits)
 */
export const isValidCNIC = (cnic) => {
  if (!cnic) return false;
  const cleaned = cnic.replace(/\D/g, '');
  return cleaned.length === 13;
};

/**
 * Validate Phone Number (Pakistani mobile format: 03XX-XXXXXXX or +923XXXXXXXXX)
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-+]/g, '');
  return /^(03\d{9}|923\d{9})$/.test(cleaned);
};
