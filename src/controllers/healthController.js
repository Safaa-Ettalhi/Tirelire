function ping(req, res, next) {
  try {
    res.json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
}

module.exports = { ping };


