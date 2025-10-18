const Contribution = require('../models/Contribution');
const User = require('../models/User');
const Group = require('../models/Group');
const { sendContributionReminderEmail } = require('./emailService');

const startCronJobs = () => {
    setInterval(async () => {
        const today = new Date();
        const dues = await Contribution.find({ dueDate: { $lte: today }, paid: false })
            .populate('user')
            .populate('group');
        
        for (const contribution of dues) {
            console.log(`Rappel contribution: ${contribution._id} à payer`);
            
            // Envoyer email de rappel
            try {
                await sendContributionReminderEmail(contribution.user, contribution, contribution.group);
                console.log(`📧 Email de rappel envoyé à ${contribution.user.email}`);
            } catch (emailError) {
                console.error(`Erreur envoi email de rappel à ${contribution.user.email}:`, emailError.message);
            }
        }
    }, 1000 * 60 * 60); // toutes les heures
};

module.exports = { startCronJobs };
