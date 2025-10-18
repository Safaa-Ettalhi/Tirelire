const stripe = require('../config/stripe');
const Contribution = require('../models/Contribution');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Group = require('../models/Group');
const Distribution = require('../models/Distribution');
const { sendDistributionNotificationEmail } = require('../utils/emailService');

exports.createContribution = async (req, res) => {
    try {
        const contribution = await Contribution.create({
            ...req.body,
            user: req.user._id
        });
        res.json({ message: 'Contribution créée', contribution });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.payContribution = async (req, res) => {
    try {
        const { contributionId, paymentMethodId } = req.body;
        const contribution = await Contribution.findById(contributionId).populate('user');
        if (!contribution) return res.status(404).json({ message: 'Contribution introuvable' });

        const paymentIntent = await stripe.paymentIntents.create({
            amount: contribution.amount * 100,
            currency: 'usd',
            payment_method: paymentMethodId,
            confirm: true,
        });

        const payment = await Payment.create({
            user: req.user._id,
            contribution: contributionId,
            amount: contribution.amount,
            status: 'paid',
            stripePaymentId: paymentIntent.id,
        });

        contribution.paid = true;
        await contribution.save();

        contribution.user.score += 10;
        await contribution.user.save();

        // Vérifier si tous les membres ont payé pour déclencher la distribution
        await checkAndDistributeFunds(contribution.group);

        res.json({ message: 'Paiement effectué', payment });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Fonction pour vérifier et distribuer les fonds
async function checkAndDistributeFunds(groupId) {
    try {
        const group = await Group.findById(groupId);
        if (!group) return;

        // Vérifier si tous les membres ont payé leurs contributions du tour actuel
        const allContributions = await Contribution.find({ 
            group: groupId,
            dueDate: { $lte: new Date() }
        });

        const totalMembers = group.members.length;
        const paidContributions = allContributions.filter(c => c.paid).length;

        console.log(`📊 Groupe ${group.name}: ${paidContributions}/${totalMembers} contributions payées`);

        // Si tous les membres ont payé, distribuer les fonds
        if (paidContributions === totalMembers) {
            await distributeFundsToBeneficiary(group);
        }
    } catch (error) {
        console.error('❌ Erreur lors de la vérification des fonds:', error.message);
    }
}

// Fonction pour distribuer les fonds au bénéficiaire
async function distributeFundsToBeneficiary(group) {
    try {
        const currentTurn = group.currentTurn;
        const beneficiary = group.rotationOrder[currentTurn];
        
        if (!beneficiary) {
            console.log('❌ Aucun bénéficiaire trouvé pour ce tour');
            return;
        }

        // Calculer le montant total à distribuer
        const totalAmount = group.amount * group.members.length;
        
        console.log(`💰 Distribution de ${totalAmount} FCFA au bénéficiaire du tour ${currentTurn + 1}`);

        // Créer l'enregistrement de distribution
        const distribution = await Distribution.create({
            group: group._id,
            beneficiary: beneficiary,
            amount: totalAmount,
            turn: currentTurn + 1,
            status: 'processing'
        });

        // Simuler le virement (en production, utiliser Stripe Connect)
        // Pour l'instant, on simule un virement réussi
        setTimeout(async () => {
            try {
                // Mettre à jour la distribution
                distribution.status = 'completed';
                distribution.completedAt = new Date();
                distribution.stripeTransferId = `tr_${Date.now()}`;
                await distribution.save();

                // Passer au tour suivant
                group.currentTurn = (currentTurn + 1) % group.rotationOrder.length;
                await group.save();

                console.log(`✅ Distribution terminée ! Tour suivant: ${group.currentTurn + 1}`);
                
                // Notifier le bénéficiaire par email
                try {
                    const beneficiary = await User.findById(beneficiary);
                    await sendDistributionNotificationEmail(beneficiary, distribution, group);
                    console.log(`📧 Email de notification envoyé au bénéficiaire`);
                } catch (emailError) {
                    console.error('Erreur envoi email de distribution:', emailError.message);
                }
                
            } catch (error) {
                console.error('❌ Erreur lors de la finalisation:', error.message);
                distribution.status = 'failed';
                await distribution.save();
            }
        }, 2000); // Simulation de 2 secondes

        console.log(`🔄 Distribution en cours pour le tour ${currentTurn + 1}...`);

    } catch (error) {
        console.error('❌ Erreur lors de la distribution:', error.message);
    }
}

// Endpoint pour consulter l'historique des distributions d'un groupe
exports.getGroupDistributions = async (req, res) => {
    try {
        const distributions = await Distribution.find({ group: req.params.groupId })
            .populate('beneficiary', 'name email')
            .sort({ createdAt: -1 });
        
        res.json({ distributions });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Endpoint pour consulter l'historique des paiements d'un groupe
exports.getGroupPayments = async (req, res) => {
    try {
        const contributions = await Contribution.find({ group: req.params.groupId })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        
        res.json({ contributions });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getGroupContributions = async (req, res) => {
    try {
        const contributions = await Contribution.find({ group: req.params.groupId })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        
        res.json({ contributions });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
