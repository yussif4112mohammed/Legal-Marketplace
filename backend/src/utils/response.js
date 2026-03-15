/**
 * Standardized API response helpers
 */

function success(res, data = {}, statusCode = 200) {
  return res.status(statusCode).json({ success: true, ...data });
}

function error(res, message = 'An error occurred', statusCode = 500, details = null) {
  const body = { success: false, error: message };
  if (details) body.details = details;
  return res.status(statusCode).json(body);
}

function paginated(res, data, pagination) {
  return res.status(200).json({ success: true, data, pagination });
}

module.exports = { success, error, paginated };
