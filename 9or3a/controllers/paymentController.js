const stripe = require('../config/stripe');
const Payment = require('../models/Payment');
const Contribution = require('../models/Contribution');
const User = require('../models/User');
const Group = require('../models/Group');

// Créer un PaymentIntent pour un paiement
exports.createPaymentIntent = async (req, res) => {
    try {
        const { contributionId } = req.body;
        const contribution = await Contribution.findById(contributionId).populate('user');
        
        if (!contribution) {
            return res.status(404).json({ message: 'Contribution introuvable' });
        }

        if (contribution.paid) {
            return res.status(400).json({ message: 'Cette contribution est déjà payée' });
        }

        // Créer le PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: contribution.amount * 100, // Convertir en centimes
            currency: 'xof', // Franc CFA pour l'Afrique de l'Ouest
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never' 
            },
            metadata: {
                contributionId: contributionId.toString(),
                userId: req.user._id.toString(),
                groupId: contribution.group.toString()
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            amount: contribution.amount,
            currency: 'XOF'
        });
    } catch (err) {
        console.error('Erreur création PaymentIntent:', err);
        res.status(500).json({ message: err.message });
    }
};

// Confirmer un paiement
exports.confirmPayment = async (req, res) => {
    try {
      const { paymentIntentId, paymentMethodId } = req.body
  
      if (!paymentIntentId || !paymentMethodId) {
        return res.status(400).json({
          message: "paymentIntentId et paymentMethodId sont requis",
          example: {
            paymentIntentId: "pi_xxxxx",
            paymentMethodId: "pm_card_visa",
          },
        })
      }
  
      // Récupérer le PaymentIntent
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
  
      if (paymentIntent.status === "requires_payment_method") {
        const confirmedIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
          payment_method: paymentMethodId,
        })
  
        if (confirmedIntent.status !== "succeeded") {
          return res.status(400).json({
            message: "Le paiement n'a pas été confirmé",
            status: confirmedIntent.status,
          })
        }
  
        // Mettre à jour contribution et paiement
        const { contributionId, userId } = confirmedIntent.metadata
        const contribution = await Contribution.findById(contributionId)
        if (!contribution) return res.status(404).json({ message: "Contribution introuvable" })
  
        const payment = await Payment.create({
          user: userId,
          contribution: contributionId,
          amount: contribution.amount,
          status: "paid",
          stripePaymentId: confirmedIntent.id,
          stripePaymentIntentId: confirmedIntent.id,
        })
  
        contribution.paid = true
        contribution.paidAt = new Date()
        await contribution.save()
  
        const user = await User.findById(userId)
        if (user) {
          user.score += 10
          await user.save()
        }
  
        await checkAndDistributeFunds(contribution.group)
  
        return res.json({
          message: "Paiement confirmé avec succès",
          payment,
          contribution: {
            id: contribution._id,
            amount: contribution.amount,
            paid: contribution.paid,
          },
        })
      }
  
      res.status(400).json({
        message: "Le PaymentIntent ne nécessite pas de méthode de paiement",
        status: paymentIntent.status,
      })
    } catch (err) {
      console.error("Erreur confirmation paiement:", err)
      res.status(500).json({ message: err.message })
    }
  }


// Récupérer l'historique des paiements d'un utilisateur
exports.getUserPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.user._id })
            .populate('contribution', 'amount dueDate group')
            .populate('contribution.group', 'name')
            .sort({ createdAt: -1 });

        res.json({ payments });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Rembourser un paiement (admin seulement)
exports.refundPayment = async (req, res) => {
    try {
      const { paymentId } = req.params
  
      const payment = await Payment.findById(paymentId)
      if (!payment) {
        return res.status(404).json({ message: "Paiement introuvable" })
      }
  
      console.log("[v0] Payment found:", {
        id: payment._id,
        stripePaymentIntentId: payment.stripePaymentIntentId,
        stripePaymentId: payment.stripePaymentId,
      })
  
      // Use stripePaymentIntentId if available, otherwise fallback to stripePaymentId
      const paymentIntentId = payment.stripePaymentIntentId || payment.stripePaymentId
  
      if (!paymentIntentId) {
        return res.status(400).json({
          message: "Impossible de rembourser: ID de paiement Stripe manquant",
          payment: {
            id: payment._id,
            stripePaymentIntentId: payment.stripePaymentIntentId,
            stripePaymentId: payment.stripePaymentId,
          },
        })
      }
  
      console.log("[v0] Creating refund with paymentIntentId:", paymentIntentId)
  
      // Créer le remboursement via Stripe
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: payment.amount * 100, // Convertir en centimes
        reason: "requested_by_customer",
      })
  
      // Mettre à jour le paiement
      payment.status = "refunded"
      payment.refundId = refund.id
      payment.refundedAt = new Date()
      await payment.save()
  
      // Marquer la contribution comme non payée
      const contribution = await Contribution.findById(payment.contribution)
      if (contribution) {
        contribution.paid = false
        contribution.paidAt = null
        await contribution.save()
      }
  
      res.json({
        message: "Remboursement effectué avec succès",
        refund: {
          id: refund.id,
          amount: refund.amount,
          status: refund.status,
        },
      })
    } catch (err) {
      console.error("Erreur remboursement:", err)
      res.status(500).json({ message: err.message })
    }
  }

// Fonction pour vérifier et distribuer les fonds (réutilisée)
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

        console.log(`Groupe ${group.name}: ${paidContributions}/${totalMembers} contributions payées`);

        // Si tous les membres ont payé, distribuer les fonds
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

        // Calculer le montant total à distribuer
        const totalAmount = group.amount * group.members.length;
        
        console.log(`Distribution de ${totalAmount} FCFA au bénéficiaire du tour ${currentTurn + 1}`);

        // En production, utiliser Stripe Connect pour transférer vers le compte du bénéficiaire
        // Pour l'instant, on simule la distribution
        console.log(`Distribution simulée de ${totalAmount} FCFA au bénéficiaire`);
        
        // Passer au tour suivant
        group.currentTurn = (currentTurn + 1) % group.rotationOrder.length;
        await group.save();

        console.log(`Tour suivant: ${group.currentTurn + 1}`);
        
    } catch (error) {
        console.error(' Erreur lors de la distribution:', error.message);
    }
}
