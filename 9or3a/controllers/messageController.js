const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
    try {
        const message = await Message.create({
            group: req.body.group,
            user: req.user._id,
            text: req.body.text,
            audioPath: req.body.audioPath,
        });
        res.json({ message: 'Message envoyé', message });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find({ group: req.params.groupId }).populate('user');
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
