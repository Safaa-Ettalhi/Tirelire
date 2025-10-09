const jwt = require('jsonwebtoken');
const User = require('../models/User');
function checkToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;    
    if (!authHeader) {
      return res.status(401).json({ message: 'Token manquant' });
    }
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token manquant' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide' });
  }
}
function checkAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès refusé. Seuls les administrateurs peuvent effectuer cette action.' });
  }
  next();
}

async function checkKYC(req, res, next) {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }
    if (user.role === 'admin') {
      return next();
    }
    if (user.kycStatus !== 'verified') {
      return res.status(403).json({ 
        message: 'Vérification KYC requise pour cette action',
        kycStatus: user.kycStatus 
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}

module.exports = { 
  checkToken, 
  checkAdmin, 
  checkKYC 
};