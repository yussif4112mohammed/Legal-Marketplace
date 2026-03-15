const { validationResult } = require('express-validator');
const { error } = require('../utils/response');

/**
 * Runs express-validator checks and returns 422 on failure
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = {};
    errors.array().forEach(e => { details[e.path] = e.msg; });
    return error(res, 'Validation failed', 422, details);
  }
  next();
}

module.exports = { validate };
