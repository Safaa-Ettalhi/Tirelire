const User = require('../models/User');

async function getMe(req, res, next) {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ message: 'Non autorisé' });
    const user = await User.findById(userId).select('_id email role name createdAt');
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    return res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe };

