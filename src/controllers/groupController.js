const Group = require('../models/Group');
const User = require('../models/User');

// Créer un groupe
async function createGroup(req, res) {
  try {
    const userId = req.user.userId;
    const { name, description, contributionAmount } = req.body;

    const newGroup = await Group.create({
      name,
      description,
      creator: userId,
      contributionAmount,
      members: [{ user: userId }]
    });

    return res.json({
      success: true,
      message: 'Groupe créé',
      group: newGroup
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur' });
  }
}

// Mes groupes
async function getUserGroups(req, res) {
  try {
    const userId = req.user.userId;
    const groups = await Group.find({ 'members.user': userId })
      .populate('creator', 'name')
      .populate('members.user', 'name');
    
    return res.json({ success: true, groups });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur' });
  }
}

// Détails d'un groupe
async function getGroupDetails(req, res) {
  try {
    const groupId = req.params.id;
    const userId = req.user.userId;

    const group = await Group.findById(groupId)
      .populate('creator', 'name')
      .populate('members.user', 'name');

    if (!group) {
      return res.status(404).json({ message: 'Groupe introuvable' });
    }

    const isMember = group.members.some(member => 
      member.user._id.toString() === userId
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    return res.json({ success: true, group });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur' });
  }
}


// Ajouter un message
async function addMessage(req, res) {
  try {
    const groupId = req.params.id;
    const userId = req.user.userId;
    const { content } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Groupe introuvable' });
    }

    const isMember = group.members.some(member => 
      member.user.toString() === userId
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Pas membre' });
    }

    group.messages.push({
      sender: userId,
      content,
      type: 'text'
    });

    await group.save();
    return res.json({ success: true, message: 'Message envoyé' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur' });
  }
}

// Obtenir les messages
async function getGroupMessages(req, res) {
  try {
    const groupId = req.params.id;
    const userId = req.user.userId;

    const group = await Group.findById(groupId)
      .populate('messages.sender', 'name');

    if (!group) {
      return res.status(404).json({ message: 'Groupe introuvable' });
    }

    const isMember = group.members.some(member => 
      member.user.toString() === userId
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Pas membre' });
    }

    return res.json({ success: true, messages: group.messages });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur' });
  }
}

module.exports = {
  createGroup,
  getUserGroups,
  getGroupDetails,
  addMessage,
  getGroupMessages
};
