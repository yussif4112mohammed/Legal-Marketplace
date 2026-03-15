// Shared validation helpers — works in Node.js and browser

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
}

function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 8;
}

function isValidUSState(code) {
  const VALID = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID',
    'IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT',
    'NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
    'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'];
  return VALID.includes(String(code).toUpperCase());
}

function validateRegisterClient({ firstName, lastName, email, password }) {
  const errors = {};
  if (!firstName || firstName.trim().length < 2) errors.firstName = 'First name must be at least 2 characters';
  if (!lastName  || lastName.trim().length < 2)  errors.lastName  = 'Last name must be at least 2 characters';
  if (!isValidEmail(email))                       errors.email     = 'Valid email is required';
  if (!isValidPassword(password))                 errors.password  = 'Password must be at least 8 characters';
  return { valid: Object.keys(errors).length === 0, errors };
}

function validateRegisterLawyer(data) {
  const base = validateRegisterClient(data);
  const errors = { ...base.errors };
  if (!data.barLicenseNumber || data.barLicenseNumber.trim().length < 3)
    errors.barLicenseNumber = 'Bar license number is required';
  if (!isValidUSState(data.barState))
    errors.barState = 'Valid US state code is required';
  if (!data.specializations || !Array.isArray(data.specializations) || data.specializations.length === 0)
    errors.specializations = 'At least one practice area is required';
  if (data.consultationFee === undefined || isNaN(Number(data.consultationFee)) || Number(data.consultationFee) < 0)
    errors.consultationFee = 'Valid consultation fee is required';
  return { valid: Object.keys(errors).length === 0, errors };
}

function validateLogin({ email, password }) {
  const errors = {};
  if (!isValidEmail(email))       errors.email    = 'Valid email is required';
  if (!password || !password.trim()) errors.password = 'Password is required';
  return { valid: Object.keys(errors).length === 0, errors };
}

function validateBooking({ lawyerId, scheduledAt, durationMinutes }) {
  const errors = {};
  if (!lawyerId || isNaN(Number(lawyerId))) errors.lawyerId = 'Valid lawyer ID is required';
  if (!scheduledAt || isNaN(Date.parse(scheduledAt))) errors.scheduledAt = 'Valid date/time is required';
  if (!durationMinutes || ![30, 60, 90, 120].includes(Number(durationMinutes)))
    errors.durationMinutes = 'Duration must be 30, 60, 90, or 120 minutes';
  return { valid: Object.keys(errors).length === 0, errors };
}

function validateReview({ lawyerId, bookingId, rating, comment }) {
  const errors = {};
  if (!lawyerId)                               errors.lawyerId  = 'Lawyer ID required';
  if (!bookingId)                              errors.bookingId = 'Booking ID required';
  if (!rating || rating < 1 || rating > 5)     errors.rating    = 'Rating must be 1–5';
  if (!comment || comment.trim().length < 10)  errors.comment   = 'Review must be at least 10 characters';
  return { valid: Object.keys(errors).length === 0, errors };
}

module.exports = {
  isValidEmail, isValidPassword, isValidUSState,
  validateRegisterClient, validateRegisterLawyer, validateLogin,
  validateBooking, validateReview,
};
