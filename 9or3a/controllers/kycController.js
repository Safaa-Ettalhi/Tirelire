const KYC = require('../models/KYC');
const User = require('../models/User');
const { compareFaces } = require('../utils/faceVerify');
const { encryptKYCImages, decryptKYCImagesForVerification, cleanupTempFiles } = require('../utils/encryption');
const { sendKYCApprovedEmail, sendKYCRejectedEmail } = require('../utils/emailService');

exports.uploadKYC = async (req, res) => {
    try {
        const { userId } = req.body;
        const cardImage = req.files.cardImage[0].path;
        const selfieImage = req.files.selfieImage[0].path;

        // Chiffrer les images
        const encryptedImages = encryptKYCImages(cardImage, selfieImage);

        const kyc = await KYC.create({ 
            user: userId, 
            cardImage: encryptedImages.cardImage, 
            selfieImage: encryptedImages.selfieImage 
        });

        res.json({ message: 'KYC uploadé et chiffré avec succès', kyc });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.verifyFace = async (req, res) => {
    try {
        const kyc = await KYC.findById(req.params.id).populate('user');
        if (!kyc) return res.status(404).json({ message: 'KYC non trouvé' });

        // Déchiffrer temporairement les images pour la vérification
        const decryptedImages = decryptKYCImagesForVerification(kyc.cardImage, kyc.selfieImage);

        const isSamePerson = await compareFaces(decryptedImages.cardImage, decryptedImages.selfieImage);

        // Nettoyer les fichiers temporaires
        cleanupTempFiles(decryptedImages.cardImage, decryptedImages.selfieImage);

        kyc.status = isSamePerson ? 'validated' : 'rejected';
        await kyc.save();

        if (isSamePerson) {
            kyc.user.isKYCValidated = true;
            await kyc.user.save();
            
            // Envoyer email d'approbation
            try {
                await sendKYCApprovedEmail(kyc.user);
            } catch (emailError) {
                console.error('Erreur envoi email KYC approuvé:', emailError.message);
            }
        } else {
            // Envoyer email de rejet
            try {
                await sendKYCRejectedEmail(kyc.user, 'La vérification faciale a échoué');
            } catch (emailError) {
                console.error('Erreur envoi email KYC rejeté:', emailError.message);
            }
        }

        res.json({ message: 'Vérification faciale terminée', status: kyc.status });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getKYCStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({ isKYCValidated: user.isKYCValidated });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
