/**
 * Response Utility
 * Standard API response formatter
 */

const success = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'SUCCESS',
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

const error = (res, message, statusCode = 500, data = null) => {
  return res.status(statusCode).json({
    status: 'ERROR',
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

const paginated = (res, items, pagination, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'SUCCESS',
    message,
    data: items,
    pagination,
    timestamp: new Date().toISOString(),
  });
};

module.exports = { success, error, paginated };
