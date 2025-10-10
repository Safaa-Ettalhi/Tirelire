const Notification = require('../models/Notification');
const Group = require('../models/Group');

// Envoyer une notification
async function sendNotification(req, res) {
  try {
    const { userId, groupId, title, message } = req.body;

    const notification = await Notification.create({
      user: userId,
      group: groupId,
      title,
      message
    });

    return res.json({ success: true, message: 'Notification envoyée' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur' });
  }
}

// Mes notifications
async function getUserNotifications(req, res) {
  try {
    const userId = req.user.userId;
    const notifications = await Notification.find({ user: userId });
    return res.json({ success: true, notifications });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur' });
  }
}

// Marquer comme lue
async function markAsRead(req, res) {
  try {
    const notificationId = req.params.id;
    const notification = await Notification.findById(notificationId);
    notification.isRead = true;
    await notification.save();
    return res.json({ success: true, message: 'Marquée comme lue' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur' });
  }
}

// Envoyer un rappel
async function sendReminder(req, res) {
  try {
    const groupId = req.params.id;
    const group = await Group.findById(groupId);

    for (const member of group.members) {
      await Notification.create({
        user: member.user,
        group: groupId,
        title: 'Rappel de contribution',
        message: 'N\'oubliez pas de verser votre contribution'
      });
    }

    return res.json({ success: true, message: 'Rappels envoyés' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur' });
  }
}

// Distribuer le pot
async function distributePot(req, res) {
  try {
    const groupId = req.params.id;
    const group = await Group.findById(groupId);

    const totalAmount = group.contributions.reduce((sum, contrib) => sum + contrib.amount, 0);
    const beneficiary = group.members[0].user;

    group.distributionRounds.push({
      beneficiary: beneficiary,
      amount: totalAmount,
      date: new Date()
    });

    await group.save();

    return res.json({ success: true, message: 'Pot distribué' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur' });
  }
}

module.exports = {
  sendNotification,
  getUserNotifications,
  markAsRead,
  sendReminder,
  distributePot
};
