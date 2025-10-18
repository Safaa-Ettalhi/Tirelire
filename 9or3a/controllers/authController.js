const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail } = require('../utils/emailService');

exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email déjà utilisé' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword, role });

        // Envoyer email de bienvenue
        try {
            await sendWelcomeEmail(user);
        } catch (emailError) {
            console.error('Erreur envoi email de bienvenue:', emailError.message);
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ user, token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Mot de passe incorrect' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ user, token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
