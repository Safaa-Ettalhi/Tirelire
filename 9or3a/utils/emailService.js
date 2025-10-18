const nodemailer = require('nodemailer');

// Configuration du transporteur email
const createTransporter = () => {
    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Template de base pour les emails
const getEmailTemplate = (type, data) => {
    const templates = {
        welcome: {
            subject: 'Bienvenue sur 9or3a ! 🎉',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2c3e50;">Bienvenue sur 9or3a !</h2>
                    <p>Bonjour ${data.name},</p>
                    <p>Félicitations ! Votre compte a été créé avec succès sur notre plateforme de tontines en ligne.</p>
                    <p>Vous pouvez maintenant :</p>
                    <ul>
                        <li>✅ Créer ou rejoindre des groupes de tontine</li>
                        <li>✅ Effectuer votre vérification KYC</li>
                        <li>✅ Commencer à participer aux tontines</li>
                    </ul>
                    <p>Merci de nous faire confiance !</p>
                    <p>L'équipe 9or3a</p>
                </div>
            `
        },
        kycApproved: {
            subject: 'Votre KYC a été approuvé ! ✅',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #27ae60;">KYC Approuvé !</h2>
                    <p>Bonjour ${data.name},</p>
                    <p>Excellente nouvelle ! Votre vérification d'identité (KYC) a été approuvée.</p>
                    <p>Vous pouvez maintenant participer pleinement aux tontines et bénéficier de tous nos services.</p>
                    <p>Merci pour votre confiance !</p>
                    <p>L'équipe 9or3a</p>
                </div>
            `
        },
        kycRejected: {
            subject: 'KYC rejeté - Action requise ❌',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #e74c3c;">KYC Rejeté</h2>
                    <p>Bonjour ${data.name},</p>
                    <p>Malheureusement, votre vérification d'identité (KYC) n'a pas été approuvée.</p>
                    <p>Raison : ${data.reason || 'Documents non conformes'}</p>
                    <p>Vous pouvez soumettre de nouveaux documents en vous connectant à votre compte.</p>
                    <p>L'équipe 9or3a</p>
                </div>
            `
        },
        contributionReminder: {
            subject: 'Rappel de contribution - Action requise ⏰',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #f39c12;">Rappel de Contribution</h2>
                    <p>Bonjour ${data.name},</p>
                    <p>Ceci est un rappel que vous avez une contribution en attente :</p>
                    <ul>
                        <li><strong>Groupe :</strong> ${data.groupName}</li>
                        <li><strong>Montant :</strong> ${data.amount} FCFA</li>
                        <li><strong>Date limite :</strong> ${new Date(data.dueDate).toLocaleDateString('fr-FR')}</li>
                    </ul>
                    <p>Veuillez effectuer votre paiement avant la date limite pour éviter les pénalités.</p>
                    <p>L'équipe 9or3a</p>
                </div>
            `
        },
        distributionNotification: {
            subject: 'Félicitations ! Vous êtes le bénéficiaire ! 🎉',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #27ae60;">Félicitations !</h2>
                    <p>Bonjour ${data.name},</p>
                    <p>Excellente nouvelle ! Vous êtes le bénéficiaire de cette période de tontine.</p>
                    <ul>
                        <li><strong>Groupe :</strong> ${data.groupName}</li>
                        <li><strong>Montant reçu :</strong> ${data.amount} FCFA</li>
                        <li><strong>Tour :</strong> ${data.turn}</li>
                    </ul>
                    <p>Le virement a été effectué avec succès. Vérifiez votre compte bancaire.</p>
                    <p>Félicitations et merci de votre participation !</p>
                    <p>L'équipe 9or3a</p>
                </div>
            `
        },
        groupInvitation: {
            subject: 'Invitation à rejoindre un groupe de tontine 👥',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #3498db;">Invitation au Groupe</h2>
                    <p>Bonjour ${data.name},</p>
                    <p>Vous avez été invité à rejoindre un groupe de tontine :</p>
                    <ul>
                        <li><strong>Nom du groupe :</strong> ${data.groupName}</li>
                        <li><strong>Montant par contribution :</strong> ${data.amount} FCFA</li>
                        <li><strong>Fréquence :</strong> ${data.frequency}</li>
                    </ul>
                    <p>Connectez-vous à votre compte pour accepter ou refuser cette invitation.</p>
                    <p>L'équipe 9or3a</p>
                </div>
            `
        }
    };

    return templates[type] || {
        subject: 'Notification 9or3a',
        html: '<p>Vous avez reçu une notification de 9or3a.</p>'
    };
};

// Fonction principale d'envoi d'email
const sendEmail = async (to, type, data = {}) => {
    try {
        const transporter = createTransporter();
        const template = getEmailTemplate(type, data);
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: to,
            subject: template.subject,
            html: template.html
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`📧 Email envoyé avec succès à ${to} (${type})`);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error(`❌ Erreur envoi email à ${to}:`, error.message);
        return { success: false, error: error.message };
    }
};

// Fonctions spécifiques pour chaque type de notification
const sendWelcomeEmail = async (user) => {
    return await sendEmail(user.email, 'welcome', { name: user.name });
};

const sendKYCApprovedEmail = async (user) => {
    return await sendEmail(user.email, 'kycApproved', { name: user.name });
};

const sendKYCRejectedEmail = async (user, reason) => {
    return await sendEmail(user.email, 'kycRejected', { name: user.name, reason });
};

const sendContributionReminderEmail = async (user, contribution, group) => {
    return await sendEmail(user.email, 'contributionReminder', {
        name: user.name,
        groupName: group.name,
        amount: contribution.amount,
        dueDate: contribution.dueDate
    });
};

const sendDistributionNotificationEmail = async (user, distribution, group) => {
    return await sendEmail(user.email, 'distributionNotification', {
        name: user.name,
        groupName: group.name,
        amount: distribution.amount,
        turn: distribution.turn
    });
};

const sendGroupInvitationEmail = async (user, group) => {
    return await sendEmail(user.email, 'groupInvitation', {
        name: user.name,
        groupName: group.name,
        amount: group.amount,
        frequency: group.frequency
    });
};

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendKYCApprovedEmail,
    sendKYCRejectedEmail,
    sendContributionReminderEmail,
    sendDistributionNotificationEmail,
    sendGroupInvitationEmail
};
