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

// Rejoindre un groupe
async function joinGroup(req, res) {
  try {
    const groupId = req.params.id;
    const userId = req.user.userId;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Groupe introuvable' });
    }

    const isAlreadyMember = group.members.some(member => 
      member.user.toString() === userId
    );

    if (isAlreadyMember) {
      return res.status(400).json({ message: 'Déjà membre' });
    }

    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({ message: 'Groupe plein' });
    }

    group.members.push({ user: userId });
    await group.save();

    return res.json({ success: true, message: 'Ajouté au groupe' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur' });
  }
}

// Quitter un groupe
async function leaveGroup(req, res) {
  try {
    const groupId = req.params.id;
    const userId = req.user.userId;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Groupe introuvable' });
    }

    if (group.creator.toString() === userId) {
      return res.status(400).json({ message: 'Créateur ne peut pas partir' });
    }

    group.members = group.members.filter(member => 
      member.user.toString() !== userId
    );
    await group.save();

    return res.json({ success: true, message: 'Quitté le groupe' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur' });
  }
}

// Lister les membres d'un groupe
async function getGroupMembers(req, res) {
  try {
    const groupId = req.params.id;
    const userId = req.user.userId;

    const group = await Group.findById(groupId)
      .populate('members.user', 'name email');

    if (!group) {
      return res.status(404).json({ message: 'Groupe introuvable' });
    }

    const isMember = group.members.some(member => 
      member.user._id.toString() === userId
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Pas membre' });
    }

    return res.json({ success: true, members: group.members });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur' });
  }
}

// Verser une contribution
async function makeContribution(req, res) {
  try {
    const groupId = req.params.id;
    const userId = req.user.userId;
    const { amount } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Groupe introuvable' });
    }

    group.contributions.push({
      member: userId,
      amount: amount,
      status: 'paid'
    });

    await group.save();

    return res.json({ success: true, message: 'Contribution versée' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur' });
  }
}

// Lister les contributions
async function getContributions(req, res) {
  try {
    const groupId = req.params.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Groupe introuvable' });
    }

    return res.json({ success: true, contributions: group.contributions });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur' });
  }
}

// Valider une contribution
async function validateContribution(req, res) {
  try {
    const groupId = req.params.id;
    const contributionId = req.params.contributionId;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Groupe introuvable' });
    }

    const contribution = group.contributions.id(contributionId);
    if (!contribution) {
      return res.status(404).json({ message: 'Contribution introuvable' });
    }

    contribution.status = 'paid';
    await group.save();

    return res.json({ success: true, message: 'Contribution validée' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur' });
  }
}

module.exports = {
  createGroup,
  getUserGroups,
  getGroupDetails,
  addMessage,
  getGroupMessages,
  joinGroup,
  leaveGroup,
  getGroupMembers,
  makeContribution,
  getContributions,
  validateContribution
};
