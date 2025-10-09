const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function getProfile(req, res) {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }
    const reliabilityScore = calculateReliabilityScore(user);
    
    return res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        kycStatus: user.kycStatus,
        reliabilityScore: reliabilityScore,
        paymentHistory: user.paymentHistory,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user.userId;
    const { name, firstName, lastName, email } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    if (name) user.name = name;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
      user.email = email;
    }
    await user.save();
    
    return res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Changer le mot de passe
async function changePassword(req, res) {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Mot de passe actuel et nouveau mot de passe requis' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }
   
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashedNewPassword;
    await user.save();
    
    return res.json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function getPaymentHistory(req, res) {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }
    
    const totalPayments = user.paymentHistory.length;
    const onTimePayments = user.paymentHistory.filter(payment => payment.onTime).length;
    const latePayments = totalPayments - onTimePayments;
    const punctualityRate = totalPayments > 0 ? (onTimePayments / totalPayments * 100).toFixed(1) : 0;
    
    return res.json({
      success: true,
      paymentHistory: user.paymentHistory,
      statistics: {
        totalPayments,
        onTimePayments,
        latePayments,
        punctualityRate: parseFloat(punctualityRate)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function getReliabilityStats(req, res) {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }
    
    const reliabilityScore = calculateReliabilityScore(user);
    
    return res.json({
      success: true,
      reliabilityScore,
      breakdown: {
        punctuality: calculatePunctualityScore(user),
        participation: calculateParticipationScore(user),
        consistency: calculateConsistencyScore(user)
      }
    });
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}

function calculateReliabilityScore(user) {
  const punctualityScore = calculatePunctualityScore(user);
  const participationScore = calculateParticipationScore(user);
  const consistencyScore = calculateConsistencyScore(user);
  const totalScore = (punctualityScore * 0.4) + (participationScore * 0.3) + (consistencyScore * 0.3);
  return Math.round(totalScore);
}


function calculatePunctualityScore(user) {
  if (user.paymentHistory.length === 0) return 50; 
  
  const onTimePayments = user.paymentHistory.filter(payment => payment.onTime).length;
  const totalPayments = user.paymentHistory.length;
  
  return (onTimePayments / totalPayments) * 100;
}

function calculateParticipationScore(user) {
  const totalPayments = user.paymentHistory.length;
  
  if (totalPayments === 0) return 0;
  if (totalPayments >= 10) return 100;
  if (totalPayments >= 5) return 80;
  if (totalPayments >= 3) return 60;
  return 40;
}

function calculateConsistencyScore(user) {
  if (user.paymentHistory.length < 2) return 50;
  const amounts = user.paymentHistory.map(p => p.amount);
  const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - avgAmount, 2), 0) / amounts.length;
  const consistency = Math.max(0, 100 - (variance / avgAmount * 10));
  return Math.min(100, consistency);
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getPaymentHistory,
  getReliabilityStats
};
