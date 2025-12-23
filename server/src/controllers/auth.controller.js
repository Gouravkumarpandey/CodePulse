// auth.controller.js
exports.login = async (req, res) => {
  // ...login logic...
  res.json({ token: 'dummy-token' });
};

exports.register = async (req, res) => {
  // ...register logic...
  res.status(201).json({});
};
