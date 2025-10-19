const GroupAgreement = require('../models/GroupAgreement');
const Group = require('../models/Group');
const User = require('../models/User');

// Proposer un nouvel accord
exports.proposeAgreement = async (req, res) => {
    try {
        const { groupId, type, proposedValue } = req.body;
        const group = await Group.findById(groupId);
        
        if (!group) return res.status(404).json({ message: 'Groupe introuvable' });
        if (!group.members.includes(req.user._id)) {
            return res.status(403).json({ message: 'Vous devez être membre du groupe' });
        }
        const agreement = await GroupAgreement.create({
            group: groupId,
            proposedBy: req.user._id,
            type,
            currentValue: getCurrentValue(group, type),
            proposedValue,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
        });
        agreement.votes.push({
            user: req.user._id,
            approved: true
        });
        await agreement.save();

        res.json({ 
            message: 'Accord proposé avec succès', 
            agreement: await agreement.populate('proposedBy', 'name email')
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Voter sur un accord
exports.voteOnAgreement = async (req, res) => {
    try {
        const { agreementId } = req.params;
        const { approved } = req.body;
        
        const agreement = await GroupAgreement.findById(agreementId).populate('group');
        if (!agreement) return res.status(404).json({ message: 'Accord introuvable' });
        if (!agreement.group.members.includes(req.user._id)) {
            return res.status(403).json({ message: 'Vous devez être membre du groupe' });
        }

        // Vérifier que l'accord n'est pas expiré
        if (agreement.expiresAt < new Date()) {
            agreement.status = 'expired';
            await agreement.save();
            return res.status(400).json({ message: 'Cet accord a expiré' });
        }
        const existingVote = agreement.votes.find(vote => vote.user.toString() === req.user._id.toString());
        if (existingVote) {
            existingVote.approved = approved;
            existingVote.votedAt = new Date();
        } else {
            agreement.votes.push({
                user: req.user._id,
                approved
            });
        }

        await agreement.save();
        await checkAgreementStatus(agreement);

        res.json({ message: 'Vote enregistré', agreement });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getGroupAgreements = async (req, res) => {
    try {
        const agreements = await GroupAgreement.find({ group: req.params.groupId })
            .populate('proposedBy', 'name email')
            .populate('votes.user', 'name email')
            .sort({ createdAt: -1 });
        
        res.json({ agreements });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
async function checkAgreementStatus(agreement) {
    const group = await Group.findById(agreement.group);
    const totalMembers = group.members.length;
    const votes = agreement.votes;
    
    const approvedVotes = votes.filter(vote => vote.approved).length;
    const rejectedVotes = votes.filter(vote => !vote.approved).length;
    
    // Accord approuvé si plus de 50% des membres votent "oui"
    if (approvedVotes > totalMembers / 2) {
        agreement.status = 'approved';
        agreement.approvedAt = new Date();
        await agreement.save();
        
        // Appliquer les changements au groupe
        await applyAgreementChanges(agreement, group);
        
        console.log(`✅ Accord approuvé pour le groupe ${group.name}`);
    } 
    // Accord rejeté si plus de 50% des membres votent "non"
    else if (rejectedVotes > totalMembers / 2) {
        agreement.status = 'rejected';
        agreement.rejectedAt = new Date();
        await agreement.save();
        
        console.log(` Accord rejeté pour le groupe ${group.name}`);
    }
}

// Fonction pour appliquer les changements approuvés
async function applyAgreementChanges(agreement, group) {
    switch (agreement.type) {
        case 'amount':
            group.amount = agreement.proposedValue;
            break;
        case 'frequency':
            group.frequency = agreement.proposedValue;
            break;
        case 'member_addition':
            if (!group.members.includes(agreement.proposedValue)) {
                group.members.push(agreement.proposedValue);
                group.rotationOrder.push(agreement.proposedValue);
            }
            break;
        case 'member_removal':
            group.members = group.members.filter(member => member.toString() !== agreement.proposedValue.toString());
            group.rotationOrder = group.rotationOrder.filter(member => member.toString() !== agreement.proposedValue.toString());
            break;
    }
    
    await group.save();
    console.log(` Changements appliqués au groupe ${group.name}`);
}

// Fonction utilitaire pour obtenir la valeur actuelle
function getCurrentValue(group, type) {
    switch (type) {
        case 'amount':
            return group.amount;
        case 'frequency':
            return group.frequency;
        default:
            return null;
    }
}
