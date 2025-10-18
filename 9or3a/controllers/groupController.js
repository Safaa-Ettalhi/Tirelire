const Group = require('../models/Group');
const User = require('../models/User');

exports.createGroup = async (req, res) => {
    try {
        const { name, amount, frequency, members } = req.body;
        const group = await Group.create({
            name,
            owner: req.user._id,
            amount,
            frequency,
            members: [...members, req.user._id],
            rotationOrder: [...members, req.user._id],
        });
        res.json({ message: 'Groupe créé', group });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.joinGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Groupe introuvable' });
        if (group.members.includes(req.user._id)) return res.status(400).json({ message: 'Déjà membre' });

        group.members.push(req.user._id);
        group.rotationOrder.push(req.user._id);
        await group.save();

        res.json({ message: 'Rejoint le groupe', group });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getGroups = async (req, res) => {
    try {
        const groups = await Group.find({ members: req.user._id });
        res.json({ groups });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
