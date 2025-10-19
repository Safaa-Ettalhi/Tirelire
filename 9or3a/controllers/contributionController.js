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

        // Créer le PaymentIntent d'abord
        const paymentIntent = await stripe.paymentIntents.create({
            amount: contribution.amount * 100,
            currency: 'xof', 
            payment_method: paymentMethodId,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never' // Désactiver les redirections
            },
            metadata: {
                contributionId: contributionId.toString(),
                userId: req.user._id.toString(),
                groupId: contribution.group.toString()
            }
        });

        // Confirmer le PaymentIntent
        const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntent.id, {
            payment_method: paymentMethodId
        });

        // Vérifier que le paiement a été confirmé avec succès
        if (confirmedPaymentIntent.status !== 'succeeded') {
            return res.status(400).json({ 
                message: 'Le paiement n\'a pas été confirmé',
                status: confirmedPaymentIntent.status 
            });
        }

        const payment = await Payment.create({
            user: req.user._id,
            contribution: contributionId,
            amount: contribution.amount,
            status: 'paid',
            stripePaymentId: confirmedPaymentIntent.id,
        });

        contribution.paid = true;
        await contribution.save();

        contribution.user.score += 10;
        await contribution.user.save();

        // Vérifier si tous les membres ont payé pour déclencher la distribution
        await checkAndDistributeFunds(contribution.group);

        res.json({ 
            message: 'Paiement effectué avec succès', 
            payment,
            contribution: {
                id: contribution._id,
                amount: contribution.amount,
                paid: contribution.paid
            }
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Fonction pour vérifier et distribuer les fonds
async function checkAndDistributeFunds(groupId) {
    try {
        const group = await Group.findById(groupId);
        if (!group) return;
        const allContributions = await Contribution.find({ 
            group: groupId,
            dueDate: { $lte: new Date() }
        });

        const totalMembers = group.members.length;
        const paidContributions = allContributions.filter(c => c.paid).length;

        console.log(`Groupe ${group.name}: ${paidContributions}/${totalMembers} contributions payées`);
        if (paidContributions === totalMembers) {
            await distributeFundsToBeneficiary(group);
        }
    } catch (error) {
        console.error(' Erreur lors de la vérification des fonds:', error.message);
    }
}

// Fonction pour distribuer les fonds au bénéficiaire
async function distributeFundsToBeneficiary(group) {
    try {
        const currentTurn = group.currentTurn;
        const beneficiary = group.rotationOrder[currentTurn];
        
        if (!beneficiary) {
            console.log('Aucun bénéficiaire trouvé pour ce tour');
            return;
        }
        const totalAmount = group.amount * group.members.length;
        
        console.log(`Distribution de ${totalAmount} FCFA au bénéficiaire du tour ${currentTurn + 1}`);

        const distribution = await Distribution.create({
            group: group._id,
            beneficiary: beneficiary,
            amount: totalAmount,
            turn: currentTurn + 1,
            status: 'processing'
        });
        setTimeout(async () => {
            try {
                // Mettre à jour la distribution
                distribution.status = 'completed';
                distribution.completedAt = new Date();
                distribution.stripeTransferId = `tr_${Date.now()}`;
                await distribution.save();

                group.currentTurn = (currentTurn + 1) % group.rotationOrder.length;
                await group.save();

                console.log(`Distribution terminée ! Tour suivant: ${group.currentTurn + 1}`);
                
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
        }, 2000); 

        console.log(`Distribution en cours pour le tour ${currentTurn + 1}...`);

    } catch (error) {
        console.error('Erreur lors de la distribution:', error.message);
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
