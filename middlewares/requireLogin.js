module.exports = (req, res, next) => {
  req.user = true;
  if (!req.user) {
    return res.status(401).send({ error: 'You must be logged in!' });
  }

  next();
};
